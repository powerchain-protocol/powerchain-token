use anchor_lang::prelude::*;
use anchor_lang::solana_program::{
    program_option::COption,
    pubkey,
};
use anchor_spl::token_interface::{
    Mint,
    TokenInterface,
};

declare_id!("PWRCpWCpQ8BRn3pzMnvaTzMK9Q2GsxuLx7QgJgduLSu");

const PWRC_CANONICAL_MINT: Pubkey =
    pubkey!("PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc");
const PWRC_DECIMALS: u8 = 9;
const PWRC_GENESIS_BASE_UNITS: u64 =
    18_446_000_000_000_000_000;

#[program]
pub mod pwrc_token {
    use super::*;

    /// Verification-only canonical PWRC profile check.
    ///
    /// This program exposes no mint instruction and does not own the PWRC mint.
    /// Token-2022 extension verification is additionally performed by the
    /// release/client verification layer because the base InterfaceAccount
    /// represents the common Mint header.
    pub fn verify_profile(
        ctx: Context<VerifyProfile>,
    ) -> Result<()> {
        let mint =
            &ctx.accounts.mint;

        require!(
            mint.decimals ==
                PWRC_DECIMALS,
            PwrcError::WrongDecimals
        );

        require!(
            mint.supply ==
                PWRC_GENESIS_BASE_UNITS,
            PwrcError::WrongSupply
        );

        require!(
            matches!(
                mint.mint_authority,
                COption::None
            ),
            PwrcError::MintAuthorityPresent
        );

        require!(
            matches!(
                mint.freeze_authority,
                COption::None
            ),
            PwrcError::FreezeAuthorityPresent
        );

        Ok(())
    }
}

#[derive(Accounts)]
pub struct VerifyProfile<'info> {
    #[account(
        address =
            PWRC_CANONICAL_MINT
            @ PwrcError::WrongMint
    )]
    pub mint:
        InterfaceAccount<
            'info,
            Mint
        >,

    #[account(
        address =
            anchor_spl::token_2022::ID
            @ PwrcError::WrongTokenProgram
    )]
    pub token_program:
        Interface<
            'info,
            TokenInterface
        >,
}

#[error_code]
pub enum PwrcError {
    #[msg("Wrong canonical PWRC mint.")]
    WrongMint,
    #[msg("PWRC mint must use Token-2022.")]
    WrongTokenProgram,
    #[msg("PWRC decimals must be exactly 9.")]
    WrongDecimals,
    #[msg("PWRC supply does not match the fixed 1.0.0 supply.")]
    WrongSupply,
    #[msg("PWRC mint authority must be revoked.")]
    MintAuthorityPresent,
    #[msg("PWRC freeze authority must be disabled.")]
    FreezeAuthorityPresent,
}
