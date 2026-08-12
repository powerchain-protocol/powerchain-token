use anchor_lang::prelude::Pubkey;
use anchor_spl::token_2022::spl_token_2022;

pub const PWRC_NAME: &str = "PowerChain";
pub const PWRC_SYMBOL: &str = "PWRC";
pub const PWRC_DECIMALS: u8 = 9;

pub const PWRC_FIXED_SUPPLY_BASE_UNITS: u64 =
    18_446_000_000_000_000_000;

pub const PWRC_TRANSFER_FEE_BASIS_POINTS: u16 =
    250;

pub const PWRC_MAXIMUM_TRANSFER_FEE_TOKENS: u64 =
    1_000_000;

pub const PWRC_MAXIMUM_TRANSFER_FEE_BASE_UNITS: u64 =
    1000000000000000;

pub const PWRC_METADATA_URI: &str =
    "https://powerchain.energy/metadata/metaplex.json";

pub const PWRC_CANONICAL_MINT_BYTES: [u8; 32] = [
    5, 196, 10, 56, 66, 242, 145, 5,
    163, 209, 153, 87, 151, 100, 241, 208,
    128, 177, 226, 211, 227, 120, 29, 32,
    32, 18, 231, 184, 3, 202, 239, 91,
];

pub const TOKEN_2022_PROGRAM_ID: Pubkey =
    spl_token_2022::ID;

pub const METADATA_POINTER_REQUIRED: bool = true;
pub const TOKEN_METADATA_REQUIRED: bool = true;
pub const TRANSFER_FEE_REQUIRED: bool = true;

pub const PERMANENT_DELEGATE_ALLOWED: bool = false;
pub const MINT_CLOSE_AUTHORITY_ALLOWED: bool = false;
pub const DEFAULT_FROZEN_ALLOWED: bool = false;
pub const INTEREST_BEARING_ALLOWED: bool = false;
pub const SCALED_UI_AMOUNT_ALLOWED: bool = false;
pub const PAUSABLE_ALLOWED: bool = false;
pub const NON_TRANSFERABLE_ALLOWED: bool = false;
