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
const PWRC_TRANSFER_FEE_BPS: u16 = 250;
const PWRC_MAX_TRANSFER_FEE_BASE_UNITS: u64 =
    1_000_000_000_000_000;

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

        // The base Anchor interface validates the canonical mint header and
        // Token-2022 ownership here. Full extension decoding (TransferFeeConfig,
        // MetadataPointer and TokenMetadata) remains release/client-side so the
        // verifier never gains token mutation authority.
        let _native_fee_profile = (
            PWRC_TRANSFER_FEE_BPS,
            PWRC_MAX_TRANSFER_FEE_BASE_UNITS,
        );

        emit!(ProfileVerified {
            mint:
                ctx.accounts.mint.key(),
            token_program:
                ctx.accounts.token_program.key(),
            decimals:
                mint.decimals,
            supply_base_units:
                mint.supply,
            transfer_fee_basis_points:
                PWRC_TRANSFER_FEE_BPS,
            maximum_transfer_fee_base_units:
                PWRC_MAX_TRANSFER_FEE_BASE_UNITS,
            mint_authority_revoked:
                true,
            freeze_authority_revoked:
                true,
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct VerifyProfile<'info> {
    #[account(
        address =
            PWRC_CANONICAL_MINT
            @ PwrcError::WrongMint,
        owner =
            anchor_spl::token_2022::ID
            @ PwrcError::WrongTokenProgram
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


#[event]
pub struct ProfileVerified {
    pub mint: Pubkey,
    pub token_program: Pubkey,
    pub decimals: u8,
    pub supply_base_units: u64,
    pub transfer_fee_basis_points: u16,
    pub maximum_transfer_fee_base_units: u64,
    pub mint_authority_revoked: bool,
    pub freeze_authority_revoked: bool,
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
