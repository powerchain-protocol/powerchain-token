use anchor_lang::prelude::*;
use anchor_spl::{
    token_2022,
    token_interface::{
        transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked,
    },
};

declare_id!("9Ty7dY7pLmMAdH9nJHD4FSZxkRCAGbce12fs7AJV4pW7");

pub const PWRC_CONFIG_VERSION: u8 = 1;
pub const PWRC_DECIMALS: u8 = 9;
pub const PWRC_PROTOCOL_FEE_BPS: u16 = 250;
pub const BPS_DENOMINATOR: u128 = 10_000;
// With floor division, 40 base units is the smallest amount that yields a
// non-zero 250 bps fee. At 9 decimals this is 0.000000040 PWRC.
pub const MIN_GROSS_AMOUNT_BASE_UNITS: u64 = 40;
pub const PWRC_MAX_BASE_UNITS: u64 = 18_446_000_000_000_000_000;
pub const PWRC_FEE_COLLECTOR: Pubkey = Pubkey::new_from_array([217, 168, 239, 228, 89, 76, 144, 127, 62, 33, 103, 214, 141, 153, 134, 128, 58, 62, 241, 168, 39, 199, 6, 13, 85, 12, 16, 45, 184, 88, 13, 128]);

#[program]
pub mod pwrc_fees {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        validate_token2022_program(&ctx.accounts.token_program)?;
        require_eq!(
            ctx.accounts.mint.decimals,
            PWRC_DECIMALS,
            PwrcFeeError::InvalidDecimals
        );
        require_keys_eq!(
            ctx.accounts.fee_vault.mint,
            ctx.accounts.mint.key(),
            PwrcFeeError::InvalidFeeVaultMint
        );
        require_keys_eq!(
            ctx.accounts.fee_vault.owner,
            PWRC_FEE_COLLECTOR,
            PwrcFeeError::InvalidFeeCollector
        );

        let config = &mut ctx.accounts.config;
        config.version = PWRC_CONFIG_VERSION;
        config.authority = ctx.accounts.authority.key();
        config.pending_authority = None;
        config.mint = ctx.accounts.mint.key();
        config.fee_vault = ctx.accounts.fee_vault.key();
        config.fee_vault_authority = ctx.accounts.fee_vault.owner;
        config.fee_bps = PWRC_PROTOCOL_FEE_BPS;
        config.paused = false;
        config.transfer_count = 0;
        config.total_gross_base_units = 0;
        config.total_fee_base_units = 0;
        config.bump = ctx.bumps.config;

        emit!(FeeConfigInitialized {
            config: config.key(),
            authority: config.authority,
            mint: config.mint,
            fee_vault: config.fee_vault,
            fee_vault_authority: config.fee_vault_authority,
            fee_bps: config.fee_bps,
            version: config.version,
        });
        Ok(())
    }

    pub fn set_paused(ctx: Context<Admin>, paused: bool) -> Result<()> {
        validate_config_version(&ctx.accounts.config)?;
        ctx.accounts.config.paused = paused;
        emit!(FeePauseChanged {
            config: ctx.accounts.config.key(),
            authority: ctx.accounts.authority.key(),
            paused,
        });
        Ok(())
    }

    /// Starts a two-step authority rotation. The proposed authority must later
    /// call `accept_authority`; this prevents accidental one-step ownership loss.
    pub fn propose_authority(ctx: Context<Admin>, new_authority: Pubkey) -> Result<()> {
        validate_config_version(&ctx.accounts.config)?;
        require!(
            new_authority != Pubkey::default(),
            PwrcFeeError::InvalidAuthority
        );
        require_keys_neq!(
            new_authority,
            ctx.accounts.authority.key(),
            PwrcFeeError::AuthorityUnchanged
        );

        ctx.accounts.config.pending_authority = Some(new_authority);
        emit!(FeeAuthorityProposed {
            config: ctx.accounts.config.key(),
            current_authority: ctx.accounts.authority.key(),
            pending_authority: new_authority,
        });
        Ok(())
    }

    pub fn accept_authority(ctx: Context<AcceptAuthority>) -> Result<()> {
        validate_config_version(&ctx.accounts.config)?;
        let expected = ctx
            .accounts
            .config
            .pending_authority
            .ok_or(PwrcFeeError::NoPendingAuthority)?;
        require_keys_eq!(
            expected,
            ctx.accounts.new_authority.key(),
            PwrcFeeError::Unauthorized
        );

        let previous = ctx.accounts.config.authority;
        ctx.accounts.config.authority = expected;
        ctx.accounts.config.pending_authority = None;
        emit!(FeeAuthorityAccepted {
            config: ctx.accounts.config.key(),
            previous_authority: previous,
            new_authority: expected,
        });
        Ok(())
    }


    /// Idempotent protocol-routed PWRC transfer. `transfer_id` is a caller
    /// supplied 32-byte business-operation identifier. Its receipt PDA can only
    /// be initialized once, so a retried logical payment cannot be charged twice.
    pub fn transfer_with_fee(
        ctx: Context<TransferWithFee>,
        gross_amount: u64,
        transfer_id: [u8; 32],
    ) -> Result<()> {
        validate_token2022_program(&ctx.accounts.token_program)?;
        validate_config_version(&ctx.accounts.config)?;
        require!(!ctx.accounts.config.paused, PwrcFeeError::ProgramPaused);
        require!(
            gross_amount >= MIN_GROSS_AMOUNT_BASE_UNITS,
            PwrcFeeError::AmountBelowMinimum
        );
        require!(
            gross_amount <= PWRC_MAX_BASE_UNITS,
            PwrcFeeError::AmountExceedsPwrcMax
        );
        require_eq!(
            ctx.accounts.config.fee_bps,
            PWRC_PROTOCOL_FEE_BPS,
            PwrcFeeError::FeePolicyMismatch
        );
        require_eq!(
            ctx.accounts.mint.decimals,
            PWRC_DECIMALS,
            PwrcFeeError::InvalidDecimals
        );
        require_keys_eq!(
            ctx.accounts.config.mint,
            ctx.accounts.mint.key(),
            PwrcFeeError::InvalidMint
        );
        require_keys_eq!(
            ctx.accounts.config.fee_vault,
            ctx.accounts.fee_vault.key(),
            PwrcFeeError::InvalidFeeVault
        );
        require_keys_eq!(
            ctx.accounts.source.mint,
            ctx.accounts.mint.key(),
            PwrcFeeError::InvalidMint
        );
        require_keys_eq!(
            ctx.accounts.destination.mint,
            ctx.accounts.mint.key(),
            PwrcFeeError::InvalidMint
        );
        require_keys_eq!(
            ctx.accounts.fee_vault.mint,
            ctx.accounts.mint.key(),
            PwrcFeeError::InvalidMint
        );
        require_keys_eq!(
            ctx.accounts.fee_vault.owner,
            PWRC_FEE_COLLECTOR,
            PwrcFeeError::InvalidFeeCollector
        );
        require_keys_eq!(
            ctx.accounts.config.fee_vault_authority,
            PWRC_FEE_COLLECTOR,
            PwrcFeeError::InvalidFeeCollector
        );
        require_keys_eq!(
            ctx.accounts.source.owner,
            ctx.accounts.owner.key(),
            PwrcFeeError::InvalidSourceOwner
        );
        require_keys_neq!(
            ctx.accounts.source.key(),
            ctx.accounts.fee_vault.key(),
            PwrcFeeError::FeeVaultCannotBeSource
        );
        require_keys_neq!(
            ctx.accounts.destination.key(),
            ctx.accounts.fee_vault.key(),
            PwrcFeeError::FeeVaultCannotBeDestination
        );
        require_keys_neq!(
            ctx.accounts.source.key(),
            ctx.accounts.destination.key(),
            PwrcFeeError::SourceDestinationMustDiffer
        );
        require!(
            ctx.accounts.source.amount >= gross_amount,
            PwrcFeeError::InsufficientSourceBalance
        );

        let fee_amount = calculate_fee(gross_amount, ctx.accounts.config.fee_bps)?;
        require!(fee_amount > 0, PwrcFeeError::ZeroFee);
        let net_amount = gross_amount
            .checked_sub(fee_amount)
            .ok_or(PwrcFeeError::MathOverflow)?;
        require!(net_amount > 0, PwrcFeeError::NetAmountZero);

        transfer_tokens(
            &ctx.accounts.token_program,
            &ctx.accounts.source,
            &ctx.accounts.mint,
            &ctx.accounts.destination,
            &ctx.accounts.owner,
            net_amount,
        )?;

        transfer_tokens(
            &ctx.accounts.token_program,
            &ctx.accounts.source,
            &ctx.accounts.mint,
            &ctx.accounts.fee_vault,
            &ctx.accounts.owner,
            fee_amount,
        )?;

        let config = &mut ctx.accounts.config;
        config.transfer_count = config
            .transfer_count
            .checked_add(1)
            .ok_or(PwrcFeeError::MathOverflow)?;
        config.total_gross_base_units = config
            .total_gross_base_units
            .checked_add(gross_amount as u128)
            .ok_or(PwrcFeeError::MathOverflow)?;
        config.total_fee_base_units = config
            .total_fee_base_units
            .checked_add(fee_amount as u128)
            .ok_or(PwrcFeeError::MathOverflow)?;

        let clock = Clock::get()?;
        let receipt = &mut ctx.accounts.receipt;
        receipt.version = PWRC_CONFIG_VERSION;
        receipt.config = config.key();
        receipt.owner = ctx.accounts.owner.key();
        receipt.source = ctx.accounts.source.key();
        receipt.destination = ctx.accounts.destination.key();
        receipt.fee_vault = ctx.accounts.fee_vault.key();
        receipt.gross_amount = gross_amount;
        receipt.net_amount = net_amount;
        receipt.fee_amount = fee_amount;
        receipt.transfer_id = transfer_id;
        receipt.slot = clock.slot;
        receipt.unix_timestamp = clock.unix_timestamp;
        receipt.bump = ctx.bumps.receipt;

        emit!(ProtocolFeeCollected {
            config: config.key(),
            receipt: receipt.key(),
            payer: ctx.accounts.owner.key(),
            source: ctx.accounts.source.key(),
            destination: ctx.accounts.destination.key(),
            fee_vault: ctx.accounts.fee_vault.key(),
            transfer_id,
            gross_amount,
            net_amount,
            fee_amount,
            fee_bps: config.fee_bps,
            transfer_count: config.transfer_count,
        });

        Ok(())
    }
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

fn validate_token2022_program(token_program: &Interface<TokenInterface>) -> Result<()> {
    require_keys_eq!(
        token_program.key(),
        token_2022::ID,
        PwrcFeeError::Token2022Required
    );
    Ok(())
}

fn validate_config_version(config: &Account<FeeConfig>) -> Result<()> {
    require_eq!(
        config.version,
        PWRC_CONFIG_VERSION,
        PwrcFeeError::UnsupportedConfigVersion
    );
    Ok(())
}

pub fn calculate_fee(amount: u64, fee_bps: u16) -> Result<u64> {
    require!(fee_bps <= 10_000, PwrcFeeError::InvalidFeeBps);
    let numerator = (amount as u128)
        .checked_mul(fee_bps as u128)
        .ok_or(PwrcFeeError::MathOverflow)?;
    let fee = numerator
        .checked_div(BPS_DENOMINATOR)
        .ok_or(PwrcFeeError::MathOverflow)?;
    u64::try_from(fee).map_err(|_| error!(PwrcFeeError::MathOverflow))
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    pub mint: InterfaceAccount<'info, Mint>,
    #[account(
        constraint = fee_vault.mint == mint.key() @ PwrcFeeError::InvalidFeeVaultMint
    )]
    pub fee_vault: InterfaceAccount<'info, TokenAccount>,
    #[account(
        init,
        payer = authority,
        space = 8 + FeeConfig::INIT_SPACE,
        seeds = [b"fee-config", mint.key().as_ref()],
        bump
    )]
    pub config: Account<'info, FeeConfig>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Admin<'info> {
    pub authority: Signer<'info>,
    #[account(
        mut,
        has_one = authority @ PwrcFeeError::Unauthorized
    )]
    pub config: Account<'info, FeeConfig>,
}

#[derive(Accounts)]
pub struct AcceptAuthority<'info> {
    pub new_authority: Signer<'info>,
    #[account(mut)]
    pub config: Account<'info, FeeConfig>,
}


#[derive(Accounts)]
#[instruction(gross_amount: u64, transfer_id: [u8; 32])]
pub struct TransferWithFee<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(mut)]
    pub source: InterfaceAccount<'info, TokenAccount>,
    #[account(mut)]
    pub destination: InterfaceAccount<'info, TokenAccount>,
    #[account(mut)]
    pub fee_vault: InterfaceAccount<'info, TokenAccount>,
    pub mint: InterfaceAccount<'info, Mint>,
    #[account(
        mut,
        seeds = [b"fee-config", mint.key().as_ref()],
        bump = config.bump
    )]
    pub config: Account<'info, FeeConfig>,
    #[account(
        init,
        payer = owner,
        space = 8 + TransferReceipt::INIT_SPACE,
        seeds = [
            b"fee-receipt",
            config.key().as_ref(),
            owner.key().as_ref(),
            transfer_id.as_ref()
        ],
        bump
    )]
    pub receipt: Account<'info, TransferReceipt>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct FeeConfig {
    pub version: u8,
    pub authority: Pubkey,
    pub pending_authority: Option<Pubkey>,
    pub mint: Pubkey,
    pub fee_vault: Pubkey,
    pub fee_vault_authority: Pubkey,
    pub fee_bps: u16,
    pub paused: bool,
    pub transfer_count: u64,
    pub total_gross_base_units: u128,
    pub total_fee_base_units: u128,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct TransferReceipt {
    pub version: u8,
    pub config: Pubkey,
    pub owner: Pubkey,
    pub source: Pubkey,
    pub destination: Pubkey,
    pub fee_vault: Pubkey,
    pub gross_amount: u64,
    pub net_amount: u64,
    pub fee_amount: u64,
    pub transfer_id: [u8; 32],
    pub slot: u64,
    pub unix_timestamp: i64,
    pub bump: u8,
}

#[event]
pub struct FeeConfigInitialized {
    pub config: Pubkey,
    pub authority: Pubkey,
    pub mint: Pubkey,
    pub fee_vault: Pubkey,
    pub fee_vault_authority: Pubkey,
    pub fee_bps: u16,
    pub version: u8,
}

#[event]
pub struct ProtocolFeeCollected {
    pub config: Pubkey,
    pub receipt: Pubkey,
    pub payer: Pubkey,
    pub source: Pubkey,
    pub destination: Pubkey,
    pub fee_vault: Pubkey,
    pub transfer_id: [u8; 32],
    pub gross_amount: u64,
    pub net_amount: u64,
    pub fee_amount: u64,
    pub fee_bps: u16,
    pub transfer_count: u64,
}

#[event]
pub struct FeePauseChanged {
    pub config: Pubkey,
    pub authority: Pubkey,
    pub paused: bool,
}

#[event]
pub struct FeeAuthorityProposed {
    pub config: Pubkey,
    pub current_authority: Pubkey,
    pub pending_authority: Pubkey,
}

#[event]
pub struct FeeAuthorityAccepted {
    pub config: Pubkey,
    pub previous_authority: Pubkey,
    pub new_authority: Pubkey,
}


#[error_code]
pub enum PwrcFeeError {
    #[msg("Fee basis points must be between 0 and 10,000")]
    InvalidFeeBps,
    #[msg("PWRC fee policy must remain exactly 250 basis points")]
    FeePolicyMismatch,
    #[msg("PWRC mint must use exactly 9 decimals")]
    InvalidDecimals,
    #[msg("Invalid PWRC mint")]
    InvalidMint,
    #[msg("Fee vault does not match the configured vault")]
    InvalidFeeVault,
    #[msg("Fee vault must hold the PWRC mint")]
    InvalidFeeVaultMint,
    #[msg("Fee vault cannot be used as transfer source")]
    FeeVaultCannotBeSource,
    #[msg("Fee vault cannot be used as transfer destination")]
    FeeVaultCannotBeDestination,
    #[msg("Protocol fee program is paused")]
    ProgramPaused,
    #[msg("Gross amount is below the minimum fee-bearing amount")]
    AmountBelowMinimum,
    #[msg("Gross amount exceeds the canonical PWRC maximum")]
    AmountExceedsPwrcMax,
    #[msg("Source and destination token accounts must differ")]
    SourceDestinationMustDiffer,
    #[msg("Source token account balance is below the requested gross amount")]
    InsufficientSourceBalance,
    #[msg("Calculated protocol fee is zero")]
    ZeroFee,
    #[msg("Net transfer amount must be greater than zero")]
    NetAmountZero,
    #[msg("Arithmetic overflow")]
    MathOverflow,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Source token account is not owned by the transaction signer")]
    InvalidSourceOwner,
    #[msg("PWRC protocol transfers require the Token-2022 program")]
    Token2022Required,
    #[msg("Fee config version is unsupported")]
    UnsupportedConfigVersion,
    #[msg("New authority is invalid")]
    InvalidAuthority,
    #[msg("New authority must differ from current authority")]
    AuthorityUnchanged,
    #[msg("No pending authority has been proposed")]
    NoPendingAuthority,
    #[msg("PWRC fee vault must be owned by the canonical fee collector")]
    InvalidFeeCollector,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn calculates_250_bps_exactly() {
        assert_eq!(calculate_fee(1_000_000_000, 250).unwrap(), 25_000_000);
    }

    #[test]
    fn minimum_amount_produces_one_base_unit_fee() {
        assert_eq!(calculate_fee(MIN_GROSS_AMOUNT_BASE_UNITS, 250).unwrap(), 1);
    }

    #[test]
    fn handles_max_u64_without_overflow() {
        let fee = calculate_fee(u64::MAX, 250).unwrap();
        assert_eq!(fee, 461_168_601_842_738_790);
    }


    #[test]
    fn canonical_max_supply_fee_is_safe() {
        let fee = calculate_fee(PWRC_MAX_BASE_UNITS, 250).unwrap();
        assert_eq!(fee, 461_150_000_000_000_000);
    }

    #[test]
    fn rejects_bps_over_100_percent() {
        assert!(calculate_fee(1_000_000, 10_001).is_err());
    }
}
