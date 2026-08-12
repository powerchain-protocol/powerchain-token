module wpwrc::state;

use std::vector;
use wpwrc::errors;

public const STATE_VERSION: u8 = 1;
public const BRIDGE_DIGEST_BYTES: u64 = 32;
public const SOLANA_ADDRESS_BYTES: u64 = 32;

public(package) fun assert_digest32(digest: &vector<u8>) {
    assert!(
        vector::length(digest) == BRIDGE_DIGEST_BYTES,
        errors::E_INVALID_MESSAGE_HASH,
    );
}

public(package) fun assert_solana_destination(destination: &vector<u8>) {
    assert!(
        vector::length(destination) == SOLANA_ADDRESS_BYTES,
        errors::E_INVALID_DESTINATION,
    );
}
