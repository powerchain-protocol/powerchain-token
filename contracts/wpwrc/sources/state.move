module wpwrc::state;

use std::vector;
use wpwrc::errors;

public const STATE_VERSION: u8 = 1;
public const BRIDGE_DIGEST_BYTES: u64 = 32;
public const SOLANA_ADDRESS_BYTES: u64 = 32;

fun assert_nonzero_bytes32(
    value: &vector<u8>,
    error_code: u64,
) {
    assert!(
        vector::length(value) == 32,
        error_code,
    );

    let index = 0;
    let nonzero = false;
    while (index < 32) {
        if (*vector::borrow(value, index) != 0) {
            nonzero = true;
        };
        index = index + 1;
    };

    assert!(nonzero, error_code);
}

public(package) fun assert_digest32(
    digest: &vector<u8>,
) {
    assert_nonzero_bytes32(
        digest,
        errors::E_INVALID_MESSAGE_HASH,
    );
}

public(package) fun assert_solana_destination(
    destination: &vector<u8>,
) {
    assert_nonzero_bytes32(
        destination,
        errors::E_INVALID_DESTINATION,
    );
}
