use anchor_lang::prelude::*;

#[error_code]
pub enum TokenError {
    #[msg("PWRC mint must use Token-2022")]
    Token2022Required,

    #[msg("Mint account owner mismatch")]
    MintOwnerInvalid,

    #[msg("Mint address does not match canonical PWRC")]
    CanonicalMintAddressMismatch,

    #[msg("PWRC mint must use exactly 9 decimals")]
    InvalidDecimals,

    #[msg("PWRC fixed supply mismatch")]
    InvalidSupply,

    #[msg("PWRC mint authority must be revoked")]
    MintAuthorityNotRevoked,

    #[msg("PWRC freeze authority must be null")]
    FreezeAuthorityNotNull,

    #[msg("TransferFeeConfig is required on canonical PWRC")]
    TransferFeeConfigRequired,

    #[msg("Transfer fee basis points do not match canonical PWRC")]
    TransferFeeBasisPointsMismatch,

    #[msg("Maximum transfer fee does not match canonical PWRC")]
    MaximumTransferFeeMismatch,

    #[msg("MetadataPointer is required on canonical PWRC")]
    MetadataPointerRequired,

    #[msg("TokenMetadata is required on canonical PWRC")]
    TokenMetadataRequired,

    #[msg("Unexpected Token-2022 extension on canonical PWRC")]
    UnexpectedExtension,
}
