use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod invariants;

use invariants::assert_pwrc_mint_account;

// Local/dev identity only. Mainnet deployment must be separately verified.
declare_id!("HRrDxwZzuFreRmkCLY9oFXNGAy2gjd3diHyyTadxd8s6");

#[program]
pub mod pwrc_token {
    use super::*;

    pub fn verify_canonical_mint(
        ctx: Context<VerifyCanonicalMint>,
    ) -> Result<()> {
        assert_pwrc_mint_account(
            &ctx.accounts.mint.to_account_info(),
        )?;

        emit!(CanonicalMintVerified {
            mint: ctx.accounts.mint.key(),
            verifier:
                ctx.accounts.verifier.key(),
            decimals:
                constants::PWRC_DECIMALS,
            supply_base_units:
                constants::PWRC_FIXED_SUPPLY_BASE_UNITS,
            transfer_fee_basis_points:
                constants::PWRC_TRANSFER_FEE_BASIS_POINTS,
            maximum_transfer_fee_base_units:
                constants::PWRC_MAXIMUM_TRANSFER_FEE_BASE_UNITS,
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct VerifyCanonicalMint<'info> {
    /// CHECK:
    /// The account is parsed manually as a Token-2022 mint so extension
    /// invariants can be checked directly.
    pub mint: UncheckedAccount<'info>,
    pub verifier: Signer<'info>,
}

#[event]
pub struct CanonicalMintVerified {
    pub mint: Pubkey,
    pub verifier: Pubkey,
    pub decimals: u8,
    pub supply_base_units: u64,
    pub transfer_fee_basis_points: u16,
    pub maximum_transfer_fee_base_units: u64,
}
