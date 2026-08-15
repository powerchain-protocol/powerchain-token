use anchor_lang::prelude::*;

declare_id!("7JAV3PsxkHh5oKAFDMKqVpKaV2P2P5Vj3Qv15hH8wPwr");

const BRIDGE_STATE_SEED: &[u8] = b"bridge-state";

#[program]
pub mod pwrc_lock {
    use super::*;

    /// Initializes the singleton bridge administration state in a paused state.
    ///
    /// This program intentionally exposes no PWRC custody, mint, release, or
    /// transfer instruction. Monetary bridge execution remains external and
    /// deployment-evidence gated.
    pub fn initialize(
        ctx: Context<Initialize>,
        governor: Pubkey,
        operator: Pubkey,
    ) -> Result<()> {
        require!(
            governor != Pubkey::default(),
            BridgeError::InvalidGovernor
        );
        require!(
            operator != Pubkey::default(),
            BridgeError::InvalidOperator
        );
        require_keys_neq!(
            governor,
            operator,
            BridgeError::RoleSeparationRequired
        );

        let state =
            &mut ctx.accounts.state;

        state.governor =
            governor;
        state.pending_governor =
            Pubkey::default();
        state.operator =
            operator;
        state.paused =
            true;
        state.bump =
            ctx.bumps.state;
        state.admin_sequence =
            1;
        state.lock_sequence =
            0;
        state.release_sequence =
            0;

        emit!(BridgeInitialized {
            state:
                state.key(),
            governor,
            operator,
            admin_sequence:
                state.admin_sequence,
        });

        Ok(())
    }

    pub fn set_paused(
        ctx: Context<GovernorOnly>,
        paused: bool,
    ) -> Result<()> {
        let state =
            &mut ctx.accounts.state;

        require_keys_eq!(
            ctx.accounts.authority.key(),
            state.governor,
            BridgeError::Unauthorized
        );
        require!(
            state.paused !=
                paused,
            BridgeError::NoStateChange
        );

        if !paused {
            require_keys_neq!(
                state.governor,
                state.operator,
                BridgeError::RoleSeparationRequired
            );
            require!(
                state.pending_governor ==
                    Pubkey::default(),
                BridgeError::GovernorTransferPending
            );
        }

        state.paused =
            paused;
        state.admin_sequence =
            state
                .admin_sequence
                .checked_add(1)
                .ok_or(
                    BridgeError::SequenceOverflow
                )?;

        emit!(PauseChanged {
            state:
                state.key(),
            paused,
            admin_sequence:
                state.admin_sequence,
        });

        Ok(())
    }

    pub fn set_operator(
        ctx: Context<GovernorOnly>,
        operator: Pubkey,
    ) -> Result<()> {
        let state =
            &mut ctx.accounts.state;

        require_keys_eq!(
            ctx.accounts.authority.key(),
            state.governor,
            BridgeError::Unauthorized
        );
        require!(
            operator != Pubkey::default(),
            BridgeError::InvalidOperator
        );
        require_keys_neq!(
            operator,
            state.governor,
            BridgeError::RoleSeparationRequired
        );
        if (
            state.pending_governor !=
                Pubkey::default()
        ) {
            require_keys_neq!(
                operator,
                state.pending_governor,
                BridgeError::RoleSeparationRequired
            );
        }
        require_keys_neq!(
            operator,
            state.operator,
            BridgeError::NoStateChange
        );

        let previous_operator =
            state.operator;

        state.operator =
            operator;
        state.admin_sequence =
            state
                .admin_sequence
                .checked_add(1)
                .ok_or(
                    BridgeError::SequenceOverflow
                )?;

        emit!(OperatorChanged {
            state:
                state.key(),
            previous_operator,
            operator,
            admin_sequence:
                state.admin_sequence,
        });

        Ok(())
    }

    /// Starts a two-step governor transfer. The pending governor must accept.
    pub fn transfer_governor(
        ctx: Context<GovernorOnly>,
        governor: Pubkey,
    ) -> Result<()> {
        let state =
            &mut ctx.accounts.state;

        require_keys_eq!(
            ctx.accounts.authority.key(),
            state.governor,
            BridgeError::Unauthorized
        );
        require!(
            governor != Pubkey::default(),
            BridgeError::InvalidGovernor
        );
        require_keys_neq!(
            governor,
            state.governor,
            BridgeError::NoStateChange
        );
        require_keys_neq!(
            governor,
            state.operator,
            BridgeError::RoleSeparationRequired
        );
        require!(
            state.pending_governor ==
                Pubkey::default(),
            BridgeError::GovernorTransferPending
        );

        state.pending_governor =
            governor;
        state.admin_sequence =
            state
                .admin_sequence
                .checked_add(1)
                .ok_or(
                    BridgeError::SequenceOverflow
                )?;

        emit!(GovernorTransferProposed {
            state:
                state.key(),
            governor:
                state.governor,
            pending_governor:
                governor,
            admin_sequence:
                state.admin_sequence,
        });

        Ok(())
    }

    /// Completes the two-step governor transfer.
    pub fn accept_governor(
        ctx: Context<PendingGovernorOnly>,
    ) -> Result<()> {
        let state =
            &mut ctx.accounts.state;
        let pending =
            state.pending_governor;

        require!(
            pending !=
                Pubkey::default(),
            BridgeError::NoGovernorTransferPending
        );
        require_keys_eq!(
            ctx.accounts.authority.key(),
            pending,
            BridgeError::Unauthorized
        );
        require_keys_neq!(
            pending,
            state.operator,
            BridgeError::RoleSeparationRequired
        );

        let previous_governor =
            state.governor;

        state.governor =
            pending;
        state.pending_governor =
            Pubkey::default();
        state.paused =
            true;
        state.admin_sequence =
            state
                .admin_sequence
                .checked_add(1)
                .ok_or(
                    BridgeError::SequenceOverflow
                )?;

        emit!(GovernorChanged {
            state:
                state.key(),
            previous_governor,
            governor:
                pending,
            paused:
                true,
            admin_sequence:
                state.admin_sequence,
        });

        Ok(())
    }

    pub fn cancel_governor_transfer(
        ctx: Context<GovernorOnly>,
    ) -> Result<()> {
        let state =
            &mut ctx.accounts.state;

        require_keys_eq!(
            ctx.accounts.authority.key(),
            state.governor,
            BridgeError::Unauthorized
        );
        require!(
            state.pending_governor !=
                Pubkey::default(),
            BridgeError::NoGovernorTransferPending
        );

        let cancelled_governor =
            state.pending_governor;

        state.pending_governor =
            Pubkey::default();
        state.admin_sequence =
            state
                .admin_sequence
                .checked_add(1)
                .ok_or(
                    BridgeError::SequenceOverflow
                )?;

        emit!(GovernorTransferCancelled {
            state:
                state.key(),
            cancelled_governor,
            admin_sequence:
                state.admin_sequence,
        });

        Ok(())
    }

    /// Verifies the stored administrative invariants without mutation.
    pub fn verify_state(
        ctx: Context<VerifyState>,
    ) -> Result<()> {
        let state =
            &ctx.accounts.state;

        require!(
            state.governor !=
                Pubkey::default(),
            BridgeError::InvalidGovernor
        );
        require!(
            state.operator !=
                Pubkey::default(),
            BridgeError::InvalidOperator
        );
        require_keys_neq!(
            state.governor,
            state.operator,
            BridgeError::RoleSeparationRequired
        );
        require!(
            state.admin_sequence >
                0,
            BridgeError::InvalidAdminSequence
        );

        if (
            state.pending_governor !=
                Pubkey::default()
        ) {
            require_keys_neq!(
                state.pending_governor,
                state.governor,
                BridgeError::InvalidPendingGovernor
            );
            require_keys_neq!(
                state.pending_governor,
                state.operator,
                BridgeError::RoleSeparationRequired
            );
        }

        Ok(())
    }
}

#[account]
pub struct BridgeState {
    pub governor: Pubkey,
    pub pending_governor: Pubkey,
    pub operator: Pubkey,
    pub paused: bool,
    pub bump: u8,
    pub admin_sequence: u64,
    pub lock_sequence: u64,
    pub release_sequence: u64,
}

impl BridgeState {
    pub const SPACE: usize =
        8 + // discriminator
        32 + // governor
        32 + // pending_governor
        32 + // operator
        1 +  // paused
        1 +  // bump
        8 +  // admin_sequence
        8 +  // lock_sequence
        8;   // release_sequence
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = payer,
        space = BridgeState::SPACE,
        seeds = [
            BRIDGE_STATE_SEED
        ],
        bump
    )]
    pub state:
        Account<'info, BridgeState>,

    #[account(mut)]
    pub payer:
        Signer<'info>,

    pub system_program:
        Program<'info, System>,
}

#[derive(Accounts)]
pub struct GovernorOnly<'info> {
    #[account(
        mut,
        seeds = [
            BRIDGE_STATE_SEED
        ],
        bump =
            state.bump
    )]
    pub state:
        Account<'info, BridgeState>,

    pub authority:
        Signer<'info>,
}

#[derive(Accounts)]
pub struct PendingGovernorOnly<'info> {
    #[account(
        mut,
        seeds = [
            BRIDGE_STATE_SEED
        ],
        bump =
            state.bump
    )]
    pub state:
        Account<'info, BridgeState>,

    pub authority:
        Signer<'info>,
}

#[derive(Accounts)]
pub struct VerifyState<'info> {
    #[account(
        seeds = [
            BRIDGE_STATE_SEED
        ],
        bump =
            state.bump
    )]
    pub state:
        Account<'info, BridgeState>,
}

#[event]
pub struct BridgeInitialized {
    pub state: Pubkey,
    pub governor: Pubkey,
    pub operator: Pubkey,
    pub admin_sequence: u64,
}

#[event]
pub struct PauseChanged {
    pub state: Pubkey,
    pub paused: bool,
    pub admin_sequence: u64,
}

#[event]
pub struct OperatorChanged {
    pub state: Pubkey,
    pub previous_operator: Pubkey,
    pub operator: Pubkey,
    pub admin_sequence: u64,
}

#[event]
pub struct GovernorTransferProposed {
    pub state: Pubkey,
    pub governor: Pubkey,
    pub pending_governor: Pubkey,
    pub admin_sequence: u64,
}

#[event]
pub struct GovernorChanged {
    pub state: Pubkey,
    pub previous_governor: Pubkey,
    pub governor: Pubkey,
    pub paused: bool,
    pub admin_sequence: u64,
}

#[event]
pub struct GovernorTransferCancelled {
    pub state: Pubkey,
    pub cancelled_governor: Pubkey,
    pub admin_sequence: u64,
}

#[error_code]
pub enum BridgeError {
    #[msg("Governor authorization required.")]
    Unauthorized,

    #[msg("Governor cannot be the default public key.")]
    InvalidGovernor,

    #[msg("Operator cannot be the default public key.")]
    InvalidOperator,

    #[msg("Governor and operator must use distinct public keys.")]
    RoleSeparationRequired,

    #[msg("Requested value is already active.")]
    NoStateChange,

    #[msg("A governor transfer is pending.")]
    GovernorTransferPending,

    #[msg("No governor transfer is pending.")]
    NoGovernorTransferPending,

    #[msg("Pending governor is invalid.")]
    InvalidPendingGovernor,

    #[msg("Administrative sequence must be initialized.")]
    InvalidAdminSequence,

    #[msg("Administrative sequence overflow.")]
    SequenceOverflow,
}
