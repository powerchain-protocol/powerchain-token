use anchor_lang::prelude::*;

declare_id!("7JAV3PsxkHh5oKAFDMKqVpKaV2P2P5Vj3Qv15hH8wPwr");

#[program]
pub mod pwrc_lock {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, governor: Pubkey) -> Result<()> {
        let state = &mut ctx.accounts.state;
        state.governor = governor;
        state.paused = true;
        state.lock_sequence = 0;
        state.release_sequence = 0;
        Ok(())
    }

    pub fn set_paused(ctx: Context<GovernorOnly>, paused: bool) -> Result<()> {
        require_keys_eq!(
            ctx.accounts.authority.key(),
            ctx.accounts.state.governor,
            BridgeError::Unauthorized
        );
        ctx.accounts.state.paused = paused;
        Ok(())
    }
}

#[account]
pub struct BridgeState {
    pub governor: Pubkey,
    pub paused: bool,
    pub lock_sequence: u64,
    pub release_sequence: u64,
}

impl BridgeState {
    pub const SPACE: usize = 8 + 32 + 1 + 8 + 8;
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = payer, space = BridgeState::SPACE)]
    pub state: Account<'info, BridgeState>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct GovernorOnly<'info> {
    #[account(mut)]
    pub state: Account<'info, BridgeState>,
    pub authority: Signer<'info>,
}

#[error_code]
pub enum BridgeError {
    #[msg("Governor authorization required.")]
    Unauthorized,
}
