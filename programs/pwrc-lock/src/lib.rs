use anchor_lang::prelude::*;
use anchor_spl::{
    token_2022,
    token_2022::spl_token_2022::{
        extension::{
            transfer_fee::TransferFeeConfig,
            BaseStateWithExtensions,
            StateWithExtensions,
        },
        state::Mint as SplToken2022Mint,
    },
    token_interface::{
        transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked,
    },
};

declare_id!("7JAV3PsxkHh5oKAFDMKqVpKaV2P2P5Vj3Qv15hH8wPwr");

pub const BRIDGE_CONFIG_VERSION: u8 = 1;
pub const PWRC_DECIMALS: u8 = 9;
pub const WPWRC_DECIMALS: u8 = 9;
pub const PWRC_BASE_UNITS_PER_WPWRC_BASE_UNIT: u64 = 1;
pub const PWRC_MAX_BASE_UNITS: u64 = 18_446_000_000_000_000_000;
pub const SUI_CHAIN_ID: u16 = 21;

#[program]
pub mod pwrc_lock {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        operator: Pubkey,
        governor: Pubkey,
    ) -> Result<()> {
        validate_token2022_program(&ctx.accounts.token_program)?;

        validate_no_transfer_fee_config(
            &ctx.accounts.mint.to_account_info(),
        )?;

        require_eq!(
            ctx.accounts.mint.decimals,
            PWRC_DECIMALS,
            BridgeError::InvalidDecimals
        );
        require_eq!(
            ctx.accounts.mint.supply,
            PWRC_MAX_BASE_UNITS,
            BridgeError::InvalidGenesisSupply
        );
        require!(
            ctx.accounts.mint.mint_authority.is_none(),
            BridgeError::MintAuthorityMustBeRevoked
        );
        require!(
            ctx.accounts.mint.freeze_authority.is_none(),
            BridgeError::FreezeAuthorityMustBeNull
        );
        require_keys_neq!(operator, Pubkey::default(), BridgeError::InvalidAuthority);
        require_keys_neq!(governor, Pubkey::default(), BridgeError::InvalidAuthority);
        require_keys_neq!(operator, governor, BridgeError::AuthoritiesMustDiffer);
        require_keys_eq!(
            ctx.accounts.vault.mint,
            ctx.accounts.mint.key(),
            BridgeError::InvalidVaultMint
        );
        require_keys_eq!(
            ctx.accounts.vault.owner,
            ctx.accounts.vault_authority.key(),
            BridgeError::InvalidVaultAuthority
        );
        require_eq!(ctx.accounts.vault.amount, 0, BridgeError::VaultMustStartEmpty);

        let config = &mut ctx.accounts.config;
        config.version = BRIDGE_CONFIG_VERSION;
        config.sui_chain_id = SUI_CHAIN_ID;
        config.mint = ctx.accounts.mint.key();
        config.vault = ctx.accounts.vault.key();
        config.vault_authority = ctx.accounts.vault_authority.key();
        config.operator = operator;
        config.governor = governor;
        config.pending_operator = None;
        config.pending_governor = None;
        config.paused = true;
        config.lock_sequence = 0;
        config.release_sequence = 0;
        config.total_locked_base_units = 0;
        config.total_released_base_units = 0;
        config.current_locked_base_units = 0;
        config.bump = ctx.bumps.config;
        config.vault_authority_bump = ctx.bumps.vault_authority;

        emit!(BridgeInitialized {
            config: config.key(),
            mint: config.mint,
            vault: config.vault,
            operator,
            governor,
            sui_chain_id: SUI_CHAIN_ID,
            version: config.version,
        });
        Ok(())
    }

    pub fn lock_to_sui(
        ctx: Context<LockToSui>,
        amount_base_units: u64,
        transfer_id: [u8; 32],
        sui_recipient: [u8; 32],
    ) -> Result<()> {
        validate_token2022_program(&ctx.accounts.token_program)?;
        validate_config(&ctx.accounts.config)?;
        require!(!ctx.accounts.config.paused, BridgeError::BridgePaused);
        require!(amount_base_units > 0, BridgeError::ZeroAmount);
        require!(amount_base_units <= PWRC_MAX_BASE_UNITS, BridgeError::AmountExceedsMaximum);
        require_keys_neq!(ctx.accounts.source.key(), ctx.accounts.vault.key(), BridgeError::SourceCannotBeVault);
        require!(ctx.accounts.source.amount >= amount_base_units, BridgeError::InsufficientSourceBalance);
        require_keys_eq!(ctx.accounts.source.owner, ctx.accounts.owner.key(), BridgeError::InvalidSourceOwner);
        require_keys_eq!(ctx.accounts.source.mint, ctx.accounts.mint.key(), BridgeError::InvalidMint);
        require_keys_eq!(ctx.accounts.vault.key(), ctx.accounts.config.vault, BridgeError::InvalidVault);

        transfer_tokens(
            &ctx.accounts.token_program,
            &ctx.accounts.source,
            &ctx.accounts.mint,
            &ctx.accounts.vault,
            &ctx.accounts.owner,
            amount_base_units,
        )?;

        let config = &mut ctx.accounts.config;
        config.lock_sequence = config.lock_sequence.checked_add(1).ok_or(BridgeError::MathOverflow)?;
        config.total_locked_base_units = config.total_locked_base_units.checked_add(amount_base_units as u128).ok_or(BridgeError::MathOverflow)?;
        config.current_locked_base_units = config.current_locked_base_units.checked_add(amount_base_units).ok_or(BridgeError::MathOverflow)?;

        let clock = Clock::get()?;
        let receipt = &mut ctx.accounts.receipt;
        receipt.version = BRIDGE_CONFIG_VERSION;
        receipt.config = config.key();
        receipt.owner = ctx.accounts.owner.key();
        receipt.source = ctx.accounts.source.key();
        receipt.vault = ctx.accounts.vault.key();
        receipt.amount_base_units = amount_base_units;
        receipt.wrapped_amount_base_units = amount_base_units;
        receipt.transfer_id = transfer_id;
        receipt.sui_recipient = sui_recipient;
        receipt.sequence = config.lock_sequence;
        receipt.slot = clock.slot;
        receipt.unix_timestamp = clock.unix_timestamp;
        receipt.bump = ctx.bumps.receipt;

        emit!(PwrcLockedForSui {
            config: config.key(),
            receipt: receipt.key(),
            owner: receipt.owner,
            source: receipt.source,
            vault: receipt.vault,
            amount_base_units,
            wrapped_amount_base_units: amount_base_units,
            transfer_id,
            sui_recipient,
            sequence: receipt.sequence,
            slot: receipt.slot,
            sui_chain_id: SUI_CHAIN_ID,
        });
        Ok(())
    }

    pub fn release_from_sui(
        ctx: Context<ReleaseFromSui>,
        amount_base_units: u64,
        sui_burn_reference: [u8; 32],
        sui_tx_digest: [u8; 32],
        sui_checkpoint: u64,
        expected_recipient_owner: Pubkey,
    ) -> Result<()> {
        validate_token2022_program(&ctx.accounts.token_program)?;
        validate_config(&ctx.accounts.config)?;
        require!(!ctx.accounts.config.paused, BridgeError::BridgePaused);
        require!(amount_base_units > 0, BridgeError::ZeroAmount);
        require!(sui_checkpoint > 0, BridgeError::InvalidSuiCheckpoint);
        require!(ctx.accounts.config.current_locked_base_units >= amount_base_units, BridgeError::InsufficientLockedBacking);
        require_keys_eq!(ctx.accounts.operator.key(), ctx.accounts.config.operator, BridgeError::UnauthorizedOperator);
        require_keys_eq!(ctx.accounts.vault.key(), ctx.accounts.config.vault, BridgeError::InvalidVault);
        require_keys_neq!(ctx.accounts.destination.key(), ctx.accounts.vault.key(), BridgeError::DestinationCannotBeVault);
        require_keys_eq!(ctx.accounts.destination.mint, ctx.accounts.mint.key(), BridgeError::InvalidMint);
        require_keys_eq!(ctx.accounts.destination.owner, expected_recipient_owner, BridgeError::RecipientOwnerMismatch);

        let mint_key = ctx.accounts.mint.key();
        let signer_seeds: &[&[u8]] = &[
            b"vault-authority",
            mint_key.as_ref(),
            &[ctx.accounts.config.vault_authority_bump],
        ];

        transfer_from_vault(
            &ctx.accounts.token_program,
            &ctx.accounts.vault,
            &ctx.accounts.mint,
            &ctx.accounts.destination,
            &ctx.accounts.vault_authority,
            amount_base_units,
            signer_seeds,
        )?;

        let config = &mut ctx.accounts.config;
        config.release_sequence = config.release_sequence.checked_add(1).ok_or(BridgeError::MathOverflow)?;
        config.total_released_base_units = config.total_released_base_units.checked_add(amount_base_units as u128).ok_or(BridgeError::MathOverflow)?;
        config.current_locked_base_units = config.current_locked_base_units.checked_sub(amount_base_units).ok_or(BridgeError::MathOverflow)?;

        let clock = Clock::get()?;
        let receipt = &mut ctx.accounts.receipt;
        receipt.version = BRIDGE_CONFIG_VERSION;
        receipt.config = config.key();
        receipt.destination = ctx.accounts.destination.key();
        receipt.recipient_owner = expected_recipient_owner;
        receipt.amount_base_units = amount_base_units;
        receipt.wrapped_amount_base_units = amount_base_units;
        receipt.sui_burn_reference = sui_burn_reference;
        receipt.sui_tx_digest = sui_tx_digest;
        receipt.sui_checkpoint = sui_checkpoint;
        receipt.sequence = config.release_sequence;
        receipt.slot = clock.slot;
        receipt.unix_timestamp = clock.unix_timestamp;
        receipt.bump = ctx.bumps.receipt;

        emit!(PwrcReleasedFromSui {
            config: config.key(),
            receipt: receipt.key(),
            destination: receipt.destination,
            recipient_owner: receipt.recipient_owner,
            amount_base_units,
            wrapped_amount_base_units: amount_base_units,
            sui_burn_reference,
            sui_tx_digest,
            sui_checkpoint,
            sequence: receipt.sequence,
            slot: receipt.slot,
            sui_chain_id: SUI_CHAIN_ID,
        });
        Ok(())
    }

    pub fn set_paused(ctx: Context<Governor>, paused: bool) -> Result<()> {
        validate_config(&ctx.accounts.config)?;
        if !paused {
            require!(
                ctx.accounts.config.pending_operator.is_none()
                    && ctx.accounts.config.pending_governor.is_none(),
                BridgeError::PendingGovernanceChange
            );
        }
        ctx.accounts.config.paused = paused;
        emit!(BridgePauseChanged {
            config: ctx.accounts.config.key(),
            governor: ctx.accounts.governor.key(),
            paused,
        });
        Ok(())
    }

    pub fn propose_operator(ctx: Context<Governor>, new_operator: Pubkey) -> Result<()> {
        validate_config(&ctx.accounts.config)?;
        require!(ctx.accounts.config.paused, BridgeError::GovernanceRequiresPause);
        require_keys_neq!(new_operator, Pubkey::default(), BridgeError::InvalidAuthority);
        require_keys_neq!(new_operator, ctx.accounts.config.governor, BridgeError::AuthoritiesMustDiffer);
        require_keys_neq!(new_operator, ctx.accounts.config.operator, BridgeError::AuthorityUnchanged);
        ctx.accounts.config.pending_operator = Some(new_operator);
        Ok(())
    }

    pub fn cancel_operator_rotation(ctx: Context<Governor>) -> Result<()> {
        validate_config(&ctx.accounts.config)?;
        require!(ctx.accounts.config.paused, BridgeError::GovernanceRequiresPause);
        ctx.accounts.config.pending_operator = None;
        Ok(())
    }

    pub fn accept_operator(ctx: Context<AcceptOperator>) -> Result<()> {
        validate_config(&ctx.accounts.config)?;
        require!(ctx.accounts.config.paused, BridgeError::GovernanceRequiresPause);
        let expected = ctx.accounts.config.pending_operator.ok_or(BridgeError::NoPendingAuthority)?;
        require_keys_eq!(expected, ctx.accounts.new_operator.key(), BridgeError::UnauthorizedOperator);
        require_keys_neq!(expected, ctx.accounts.config.governor, BridgeError::AuthoritiesMustDiffer);
        ctx.accounts.config.operator = expected;
        ctx.accounts.config.pending_operator = None;
        Ok(())
    }

    pub fn propose_governor(ctx: Context<Governor>, new_governor: Pubkey) -> Result<()> {
        validate_config(&ctx.accounts.config)?;
        require!(ctx.accounts.config.paused, BridgeError::GovernanceRequiresPause);
        require_keys_neq!(new_governor, Pubkey::default(), BridgeError::InvalidAuthority);
        require_keys_neq!(new_governor, ctx.accounts.config.operator, BridgeError::AuthoritiesMustDiffer);
        require_keys_neq!(new_governor, ctx.accounts.config.governor, BridgeError::AuthorityUnchanged);
        ctx.accounts.config.pending_governor = Some(new_governor);
        Ok(())
    }

    pub fn cancel_governor_rotation(ctx: Context<Governor>) -> Result<()> {
        validate_config(&ctx.accounts.config)?;
        require!(ctx.accounts.config.paused, BridgeError::GovernanceRequiresPause);
        ctx.accounts.config.pending_governor = None;
        Ok(())
    }

    pub fn accept_governor(ctx: Context<AcceptGovernor>) -> Result<()> {
        validate_config(&ctx.accounts.config)?;
        require!(ctx.accounts.config.paused, BridgeError::GovernanceRequiresPause);
        let expected = ctx.accounts.config.pending_governor.ok_or(BridgeError::NoPendingAuthority)?;
        require_keys_eq!(expected, ctx.accounts.new_governor.key(), BridgeError::UnauthorizedGovernor);
        require_keys_neq!(expected, ctx.accounts.config.operator, BridgeError::AuthoritiesMustDiffer);
        ctx.accounts.config.governor = expected;
        ctx.accounts.config.pending_governor = None;
        Ok(())
    }
}

fn validate_no_transfer_fee_config(
    mint_info: &AccountInfo,
) -> Result<()> {
    let data = mint_info.try_borrow_data()?;
    let mint =
        StateWithExtensions::<SplToken2022Mint>::unpack(
            &data,
        )
        .map_err(|_| {
            error!(BridgeError::InvalidToken2022MintState)
        })?;

    require!(
        mint.get_extension::<TransferFeeConfig>().is_err(),
        BridgeError::TransferFeeConfigForbidden
    );

    Ok(())
}

fn validate_config(config: &Account<BridgeConfig>) -> Result<()> {
    require_eq!(config.version, BRIDGE_CONFIG_VERSION, BridgeError::UnsupportedVersion);
    require_eq!(config.sui_chain_id, SUI_CHAIN_ID, BridgeError::InvalidSuiChain);
    require_keys_neq!(config.operator, config.governor, BridgeError::AuthoritiesMustDiffer);
    Ok(())
}

fn validate_token2022_program(token_program: &Interface<TokenInterface>) -> Result<()> {
    require_keys_eq!(token_program.key(), token_2022::ID, BridgeError::Token2022Required);
    Ok(())
}

fn transfer_tokens<'info>(
    token_program: &Interface<'info, TokenInterface>,
    source: &InterfaceAccount<'info, TokenAccount>,
    mint: &InterfaceAccount<'info, Mint>,
    destination: &InterfaceAccount<'info, TokenAccount>,
    owner: &Signer<'info>,
    amount: u64,
) -> Result<()> {
    let cpi_accounts = TransferChecked {
        from: source.to_account_info(),
        mint: mint.to_account_info(),
        to: destination.to_account_info(),
        authority: owner.to_account_info(),
    };
    transfer_checked(
        CpiContext::new(token_program.to_account_info(), cpi_accounts),
        amount,
        PWRC_DECIMALS,
    )
}

fn transfer_from_vault<'info>(
    token_program: &Interface<'info, TokenInterface>,
    source: &InterfaceAccount<'info, TokenAccount>,
    mint: &InterfaceAccount<'info, Mint>,
    destination: &InterfaceAccount<'info, TokenAccount>,
    vault_authority: &UncheckedAccount<'info>,
    amount: u64,
    signer_seeds: &[&[u8]],
) -> Result<()> {
    let cpi_accounts = TransferChecked {
        from: source.to_account_info(),
        mint: mint.to_account_info(),
        to: destination.to_account_info(),
        authority: vault_authority.to_account_info(),
    };
    transfer_checked(
        CpiContext::new_with_signer(
            token_program.to_account_info(),
            cpi_accounts,
            &[signer_seeds],
        ),
        amount,
        PWRC_DECIMALS,
    )
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    pub mint: InterfaceAccount<'info, Mint>,
    #[account(seeds = [b"vault-authority", mint.key().as_ref()], bump)]
    /// CHECK: PDA authority validated by seeds.
    pub vault_authority: UncheckedAccount<'info>,
    #[account(
        constraint = vault.mint == mint.key() @ BridgeError::InvalidVaultMint,
        constraint = vault.owner == vault_authority.key() @ BridgeError::InvalidVaultAuthority
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,
    #[account(
        init,
        payer = payer,
        space = 8 + BridgeConfig::INIT_SPACE,
        seeds = [b"bridge-config", mint.key().as_ref()],
        bump
    )]
    pub config: Account<'info, BridgeConfig>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(amount_base_units: u64, transfer_id: [u8; 32], sui_recipient: [u8; 32])]
pub struct LockToSui<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(mut)]
    pub source: InterfaceAccount<'info, TokenAccount>,
    #[account(mut)]
    pub vault: InterfaceAccount<'info, TokenAccount>,
    pub mint: InterfaceAccount<'info, Mint>,
    #[account(
        mut,
        seeds = [b"bridge-config", mint.key().as_ref()],
        bump = config.bump,
        has_one = mint @ BridgeError::InvalidMint,
        has_one = vault @ BridgeError::InvalidVault
    )]
    pub config: Account<'info, BridgeConfig>,
    #[account(
        init,
        payer = owner,
        space = 8 + LockReceipt::INIT_SPACE,
        seeds = [b"lock-receipt", config.key().as_ref(), transfer_id.as_ref()],
        bump
    )]
    pub receipt: Account<'info, LockReceipt>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(
    amount_base_units: u64,
    sui_burn_reference: [u8; 32],
    sui_tx_digest: [u8; 32],
    sui_checkpoint: u64,
    expected_recipient_owner: Pubkey
)]
pub struct ReleaseFromSui<'info> {
    #[account(mut)]
    pub operator: Signer<'info>,
    #[account(mut)]
    pub vault: InterfaceAccount<'info, TokenAccount>,
    #[account(mut)]
    pub destination: InterfaceAccount<'info, TokenAccount>,
    pub mint: InterfaceAccount<'info, Mint>,
    #[account(
        seeds = [b"vault-authority", mint.key().as_ref()],
        bump = config.vault_authority_bump
    )]
    /// CHECK: PDA authority validated by seeds.
    pub vault_authority: UncheckedAccount<'info>,
    #[account(
        mut,
        seeds = [b"bridge-config", mint.key().as_ref()],
        bump = config.bump,
        has_one = mint @ BridgeError::InvalidMint,
        has_one = vault @ BridgeError::InvalidVault,
        has_one = operator @ BridgeError::UnauthorizedOperator
    )]
    pub config: Account<'info, BridgeConfig>,
    #[account(
        init,
        payer = operator,
        space = 8 + ReleaseReceipt::INIT_SPACE,
        seeds = [b"release-receipt", config.key().as_ref(), sui_burn_reference.as_ref()],
        bump
    )]
    pub receipt: Account<'info, ReleaseReceipt>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Governor<'info> {
    pub governor: Signer<'info>,
    #[account(mut, has_one = governor @ BridgeError::UnauthorizedGovernor)]
    pub config: Account<'info, BridgeConfig>,
}

#[derive(Accounts)]
pub struct AcceptOperator<'info> {
    pub new_operator: Signer<'info>,
    #[account(mut)]
    pub config: Account<'info, BridgeConfig>,
}

#[derive(Accounts)]
pub struct AcceptGovernor<'info> {
    pub new_governor: Signer<'info>,
    #[account(mut)]
    pub config: Account<'info, BridgeConfig>,
}

#[account]
#[derive(InitSpace)]
pub struct BridgeConfig {
    pub version: u8,
    pub sui_chain_id: u16,
    pub mint: Pubkey,
    pub vault: Pubkey,
    pub vault_authority: Pubkey,
    pub operator: Pubkey,
    pub governor: Pubkey,
    pub pending_operator: Option<Pubkey>,
    pub pending_governor: Option<Pubkey>,
    pub paused: bool,
    pub lock_sequence: u64,
    pub release_sequence: u64,
    pub total_locked_base_units: u128,
    pub total_released_base_units: u128,
    pub current_locked_base_units: u64,
    pub bump: u8,
    pub vault_authority_bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct LockReceipt {
    pub version: u8,
    pub config: Pubkey,
    pub owner: Pubkey,
    pub source: Pubkey,
    pub vault: Pubkey,
    pub amount_base_units: u64,
    pub wrapped_amount_base_units: u64,
    pub transfer_id: [u8; 32],
    pub sui_recipient: [u8; 32],
    pub sequence: u64,
    pub slot: u64,
    pub unix_timestamp: i64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct ReleaseReceipt {
    pub version: u8,
    pub config: Pubkey,
    pub destination: Pubkey,
    pub recipient_owner: Pubkey,
    pub amount_base_units: u64,
    pub wrapped_amount_base_units: u64,
    pub sui_burn_reference: [u8; 32],
    pub sui_tx_digest: [u8; 32],
    pub sui_checkpoint: u64,
    pub sequence: u64,
    pub slot: u64,
    pub unix_timestamp: i64,
    pub bump: u8,
}

#[event]
pub struct BridgeInitialized {
    pub config: Pubkey,
    pub mint: Pubkey,
    pub vault: Pubkey,
    pub operator: Pubkey,
    pub governor: Pubkey,
    pub sui_chain_id: u16,
    pub version: u8,
}

#[event]
pub struct PwrcLockedForSui {
    pub config: Pubkey,
    pub receipt: Pubkey,
    pub owner: Pubkey,
    pub source: Pubkey,
    pub vault: Pubkey,
    pub amount_base_units: u64,
    pub wrapped_amount_base_units: u64,
    pub transfer_id: [u8; 32],
    pub sui_recipient: [u8; 32],
    pub sequence: u64,
    pub slot: u64,
    pub sui_chain_id: u16,
}

#[event]
pub struct PwrcReleasedFromSui {
    pub config: Pubkey,
    pub receipt: Pubkey,
    pub destination: Pubkey,
    pub recipient_owner: Pubkey,
    pub amount_base_units: u64,
    pub wrapped_amount_base_units: u64,
    pub sui_burn_reference: [u8; 32],
    pub sui_tx_digest: [u8; 32],
    pub sui_checkpoint: u64,
    pub sequence: u64,
    pub slot: u64,
    pub sui_chain_id: u16,
}

#[event]
pub struct BridgePauseChanged {
    pub config: Pubkey,
    pub governor: Pubkey,
    pub paused: bool,
}

#[error_code]
pub enum BridgeError {
    #[msg("Unsupported bridge state version")]
    UnsupportedVersion,
    #[msg("Bridge requires Token-2022")]
    Token2022Required,
    #[msg("PWRC mint must use exactly 9 decimals")]
    InvalidDecimals,
    #[msg("Canonical PWRC genesis supply mismatch")]
    InvalidGenesisSupply,
    #[msg("Canonical PWRC mint authority must be revoked")]
    MintAuthorityMustBeRevoked,
    #[msg("Canonical PWRC freeze authority must be null")]
    FreezeAuthorityMustBeNull,
    #[msg("Invalid mint")]
    InvalidMint,
    #[msg("Invalid bridge vault")]
    InvalidVault,
    #[msg("Bridge vault must hold canonical PWRC")]
    InvalidVaultMint,
    #[msg("Invalid bridge vault authority")]
    InvalidVaultAuthority,
    #[msg("Bridge vault must start empty")]
    VaultMustStartEmpty,
    #[msg("Bridge is paused")]
    BridgePaused,
    #[msg("Amount must be greater than zero")]
    ZeroAmount,
    #[msg("Amount exceeds canonical PWRC maximum")]
    AmountExceedsMaximum,
    #[msg("Insufficient source balance")]
    InsufficientSourceBalance,
    #[msg("Source token account is not owned by signer")]
    InvalidSourceOwner,
    #[msg("Source account cannot be bridge vault")]
    SourceCannotBeVault,
    #[msg("Destination account cannot be bridge vault")]
    DestinationCannotBeVault,
    #[msg("Destination owner does not match authenticated burn recipient")]
    RecipientOwnerMismatch,
    #[msg("Insufficient canonical locked backing")]
    InsufficientLockedBacking,
    #[msg("Unauthorized bridge operator")]
    UnauthorizedOperator,
    #[msg("Unauthorized bridge governor")]
    UnauthorizedGovernor,
    #[msg("Invalid authority")]
    InvalidAuthority,
    #[msg("Bridge operator and governor must differ")]
    AuthoritiesMustDiffer,
    #[msg("Authority is unchanged")]
    AuthorityUnchanged,
    #[msg("No pending authority")]
    NoPendingAuthority,
    #[msg("Governance changes require bridge pause")]
    GovernanceRequiresPause,
    #[msg("Cannot unpause with a pending governance change")]
    PendingGovernanceChange,
    #[msg("Invalid Sui chain ID")]
    InvalidSuiChain,
    #[msg("Sui checkpoint must be positive")]
    InvalidSuiCheckpoint,
    #[msg("Invalid Token-2022 mint state")]
    InvalidToken2022MintState,
    #[msg("Canonical PWRC must not enable TransferFeeConfig")]
    TransferFeeConfigForbidden,
    #[msg("Arithmetic overflow or underflow")]
    MathOverflow,
}
