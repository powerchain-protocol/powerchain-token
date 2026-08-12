use anchor_lang::prelude::*;
use anchor_spl::{
    token_2022::spl_token_2022::{
        extension::{
            transfer_fee::TransferFeeConfig,
            BaseStateWithExtensions,
            ExtensionType,
            StateWithExtensions,
        },
        state::Mint,
    },
};

use crate::{
    constants::{
        PWRC_CANONICAL_MINT_BYTES,
        PWRC_DECIMALS,
        PWRC_FIXED_SUPPLY_BASE_UNITS,
        PWRC_MAXIMUM_TRANSFER_FEE_BASE_UNITS,
        PWRC_TRANSFER_FEE_BASIS_POINTS,
        TOKEN_2022_PROGRAM_ID,
    },
    errors::TokenError,
};

fn assert_transfer_fee_schedule(
    basis_points: u16,
    maximum_fee: u64,
) -> Result<()> {
    require_eq!(
        basis_points,
        PWRC_TRANSFER_FEE_BASIS_POINTS,
        TokenError::TransferFeeBasisPointsMismatch
    );

    require_eq!(
        maximum_fee,
        PWRC_MAXIMUM_TRANSFER_FEE_BASE_UNITS,
        TokenError::MaximumTransferFeeMismatch
    );

    Ok(())
}

pub fn assert_pwrc_mint_account(
    mint_info: &AccountInfo,
) -> Result<()> {
    require_keys_eq!(
        *mint_info.owner,
        TOKEN_2022_PROGRAM_ID,
        TokenError::MintOwnerInvalid
    );

    require_keys_eq!(
        *mint_info.key,
        Pubkey::new_from_array(
            PWRC_CANONICAL_MINT_BYTES,
        ),
        TokenError::CanonicalMintAddressMismatch
    );

    let data = mint_info.try_borrow_data()?;

    let mint =
        StateWithExtensions::<Mint>::unpack(
            &data,
        )?;

    require_eq!(
        mint.base.decimals,
        PWRC_DECIMALS,
        TokenError::InvalidDecimals
    );

    require_eq!(
        mint.base.supply,
        PWRC_FIXED_SUPPLY_BASE_UNITS,
        TokenError::InvalidSupply
    );

    require!(
        mint.base.mint_authority.is_none(),
        TokenError::MintAuthorityNotRevoked
    );

    require!(
        mint.base.freeze_authority.is_none(),
        TokenError::FreezeAuthorityNotNull
    );

    let extension_types =
        mint.get_extension_types()?;

    require!(
        extension_types.contains(
            &ExtensionType::TransferFeeConfig,
        ),
        TokenError::TransferFeeConfigRequired
    );

    require!(
        extension_types.contains(
            &ExtensionType::MetadataPointer,
        ),
        TokenError::MetadataPointerRequired
    );

    require!(
        extension_types.contains(
            &ExtensionType::TokenMetadata,
        ),
        TokenError::TokenMetadataRequired
    );

    for extension in extension_types {
        require!(
            matches!(
                extension,
                ExtensionType::TransferFeeConfig
                    | ExtensionType::MetadataPointer
                    | ExtensionType::TokenMetadata
            ),
            TokenError::UnexpectedExtension
        );
    }

    let transfer_fee =
        mint.get_extension::<TransferFeeConfig>()
            .map_err(|_| {
                error!(
                    TokenError::TransferFeeConfigRequired
                )
            })?;

    assert_transfer_fee_schedule(
        u16::from(
            transfer_fee
                .older_transfer_fee
                .transfer_fee_basis_points,
        ),
        u64::from(
            transfer_fee
                .older_transfer_fee
                .maximum_fee,
        ),
    )?;

    assert_transfer_fee_schedule(
        u16::from(
            transfer_fee
                .newer_transfer_fee
                .transfer_fee_basis_points,
        ),
        u64::from(
            transfer_fee
                .newer_transfer_fee
                .maximum_fee,
        ),
    )?;

    Ok(())
}
