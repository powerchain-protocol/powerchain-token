module wpwrc::wpwrc;

use std::option;
use sui::coin::{Self, Coin, TreasuryCap};
use sui::event;
use sui::object::{Self, UID};
use sui::table::{Self, Table};
use sui::transfer;
use sui::tx_context::{Self, TxContext};

const E_UNAUTHORIZED: u64 = 1;
const E_PAUSED: u64 = 2;
const E_ZERO_AMOUNT: u64 = 3;
const E_MESSAGE_DIGEST_LENGTH: u64 = 4;
const E_MESSAGE_ALREADY_CONSUMED: u64 = 5;
const E_SOLANA_RECIPIENT_LENGTH: u64 = 6;
const E_SUPPLY_LIMIT: u64 = 7;
const E_INSUFFICIENT_WRAPPED_SUPPLY: u64 = 8;
const E_ZERO_ADDRESS: u64 = 9;
const E_ZERO_MESSAGE_DIGEST: u64 = 10;
const E_ZERO_SOLANA_RECIPIENT: u64 = 11;
const E_SEQUENCE_OVERFLOW: u64 = 12;
const E_ROLE_SEPARATION: u64 = 13;
const E_GOVERNOR_TRANSFER_PENDING: u64 = 14;
const E_OPERATOR_UNINITIALIZED: u64 = 15;
const E_NO_STATE_CHANGE: u64 = 16;

const MESSAGE_DIGEST_BYTES: u64 = 32;
const SOLANA_ADDRESS_BYTES: u64 = 32;
const WPWRC_MAX_BASE_UNITS: u64 = 18_446_000_000_000_000_000;

public struct WPWRC has drop {}

public struct MessageKey has copy, drop, store {
    a: u64,
    b: u64,
    c: u64,
    d: u64,
}

public struct BridgeController has key {
    id: UID,
    treasury: TreasuryCap<WPWRC>,
    governor: address,
    pending_governor: address,
    operator: address,
    paused: bool,
    admin_sequence: u64,
    wrapped_supply_base_units: u64,
    mint_sequence: u64,
    burn_sequence: u64,
    consumed_messages: Table<MessageKey, bool>,
}

public struct BridgeMinted has copy, drop {
    sequence: u64,
    source_message: vector<u8>,
    recipient: address,
    amount_base_units: u64,
}

public struct BridgeBurned has copy, drop {
    sequence: u64,
    sender: address,
    solana_recipient: vector<u8>,
    amount_base_units: u64,
}

public struct OperatorChanged has copy, drop {
    previous_operator: address,
    new_operator: address,
}

public struct GovernorChanged has copy, drop {
    previous_governor: address,
    new_governor: address,
}

public struct GovernorTransferProposed has copy, drop {
    governor: address,
    pending_governor: address,
    admin_sequence: u64,
}

public struct GovernorTransferCancelled has copy, drop {
    cancelled_governor: address,
    admin_sequence: u64,
}

public struct PauseChanged has copy, drop {
    paused: bool,
}

fun init(witness: WPWRC, ctx: &mut TxContext) {
    let (treasury, metadata) = coin::create_currency(
        witness,
        9,
        b"wPWRC",
        b"Wrapped PowerChain",
        b"PowerChain wrapped bridge representation of canonical Solana PWRC",
        option::none(),
        ctx
    );

    let sender = tx_context::sender(ctx);

    let controller = BridgeController {
        id: object::new(ctx),
        treasury,
        governor: sender,
        pending_governor: @0x0,
        operator: @0x0,
        paused: true,
        admin_sequence: 1,
        wrapped_supply_base_units: 0,
        mint_sequence: 0,
        burn_sequence: 0,
        consumed_messages: table::new(ctx),
    };

    // Metadata capability custody is separate from TreasuryCap custody and must
    // be recorded in deployment evidence before Mainnet authorization.
    transfer::public_transfer(metadata, sender);
    transfer::share_object(controller);
}

public fun set_operator(
    controller: &mut BridgeController,
    new_operator: address,
    ctx: &TxContext,
) {
    assert_governor(controller, ctx);

    assert!(new_operator != @0x0, E_ZERO_ADDRESS);
    assert!(new_operator != controller.governor, E_ROLE_SEPARATION);
    if (controller.pending_governor != @0x0) {
        assert!(new_operator != controller.pending_governor, E_ROLE_SEPARATION);
    };

    let previous_operator = controller.operator;
    assert!(new_operator != previous_operator, E_NO_STATE_CHANGE);

    controller.operator = new_operator;
    controller.admin_sequence =
        checked_next_sequence(controller.admin_sequence);

    event::emit(OperatorChanged {
        previous_operator,
        new_operator,
    });
}



public fun transfer_governor(
    controller: &mut BridgeController,
    new_governor: address,
    ctx: &TxContext,
) {
    assert_governor(controller, ctx);
    assert!(new_governor != @0x0, E_ZERO_ADDRESS);
    assert!(new_governor != controller.governor, E_ROLE_SEPARATION);
    assert!(new_governor != controller.operator, E_ROLE_SEPARATION);
    assert!(
        controller.pending_governor == @0x0,
        E_GOVERNOR_TRANSFER_PENDING
    );

    controller.pending_governor = new_governor;
    controller.admin_sequence =
        checked_next_sequence(controller.admin_sequence);

    event::emit(GovernorTransferProposed {
        governor: controller.governor,
        pending_governor: new_governor,
        admin_sequence: controller.admin_sequence,
    });
}

public fun accept_governor(
    controller: &mut BridgeController,
    ctx: &TxContext,
) {
    let sender = tx_context::sender(ctx);

    assert!(controller.pending_governor != @0x0, E_ZERO_ADDRESS);
    assert!(sender == controller.pending_governor, E_UNAUTHORIZED);
    assert!(sender != controller.operator, E_ROLE_SEPARATION);

    let previous_governor = controller.governor;
    controller.governor = sender;
    controller.pending_governor = @0x0;
    controller.paused = true;
    controller.admin_sequence =
        checked_next_sequence(controller.admin_sequence);

    event::emit(GovernorChanged {
        previous_governor,
        new_governor: sender,
    });

    event::emit(PauseChanged {
        paused: true,
    });
}

public fun cancel_governor_transfer(
    controller: &mut BridgeController,
    ctx: &TxContext,
) {
    assert_governor(controller, ctx);
    assert!(controller.pending_governor != @0x0, E_ZERO_ADDRESS);

    let cancelled_governor = controller.pending_governor;
    controller.pending_governor = @0x0;
    controller.admin_sequence =
        checked_next_sequence(controller.admin_sequence);

    event::emit(GovernorTransferCancelled {
        cancelled_governor,
        admin_sequence: controller.admin_sequence,
    });
}

public fun set_paused(
    controller: &mut BridgeController,
    paused: bool,
    ctx: &TxContext,
) {
    assert_governor(controller, ctx);
    assert!(controller.paused != paused, E_NO_STATE_CHANGE);

    if (!paused) {
        assert!(
            controller.operator != @0x0,
            E_OPERATOR_UNINITIALIZED
        );
        assert!(
            controller.operator != controller.governor,
            E_ROLE_SEPARATION
        );
        assert!(
            controller.pending_governor == @0x0,
            E_GOVERNOR_TRANSFER_PENDING
        );
    };

    controller.paused = paused;
    controller.admin_sequence =
        checked_next_sequence(controller.admin_sequence);

    event::emit(PauseChanged {
        paused,
    });
}

/// Bridge-authorized mint from a verified Solana PWRC lock message.
///
/// `source_message` must be the unique 32-byte bridge message/claim digest.
/// Replay protection is stored on-chain in `consumed_messages`.
public fun mint_from_solana(
    controller: &mut BridgeController,
    source_message: vector<u8>,
    recipient: address,
    amount_base_units: u64,
    ctx: &mut TxContext,
) {
    assert_operator(controller, ctx);
    assert!(!controller.paused, E_PAUSED);
    assert!(amount_base_units > 0, E_ZERO_AMOUNT);
    assert!(recipient != @0x0, E_ZERO_ADDRESS);
    assert!(
        vector::length(&source_message) == MESSAGE_DIGEST_BYTES,
        E_MESSAGE_DIGEST_LENGTH
    );
    assert_nonzero_bytes(
        &source_message,
        E_ZERO_MESSAGE_DIGEST
    );
    let key = message_key(&source_message);

    assert!(
        !table::contains(&controller.consumed_messages, key),
        E_MESSAGE_ALREADY_CONSUMED
    );

    assert!(
        controller.wrapped_supply_base_units <= WPWRC_MAX_BASE_UNITS,
        E_SUPPLY_LIMIT
    );
    assert!(
        amount_base_units <=
            WPWRC_MAX_BASE_UNITS - controller.wrapped_supply_base_units,
        E_SUPPLY_LIMIT
    );

    let next_supply =
        controller.wrapped_supply_base_units + amount_base_units;

    table::add(
        &mut controller.consumed_messages,
        key,
        true
    );

    controller.wrapped_supply_base_units = next_supply;
    controller.mint_sequence =
        checked_next_sequence(controller.mint_sequence);

    let minted = coin::mint(
        &mut controller.treasury,
        amount_base_units,
        ctx
    );

    transfer::public_transfer(minted, recipient);

    event::emit(BridgeMinted {
        sequence: controller.mint_sequence,
        source_message,
        recipient,
        amount_base_units,
    });
}

/// Burn wPWRC before releasing canonical PWRC on Solana.
///
/// The 32-byte recipient is emitted for the Solana release verifier. The burn
/// itself cannot release Solana funds; the Solana bridge must verify finalized
/// Sui evidence independently.
public fun burn_for_solana(
    controller: &mut BridgeController,
    wrapped: Coin<WPWRC>,
    solana_recipient: vector<u8>,
    ctx: &TxContext,
) {
    assert!(!controller.paused, E_PAUSED);
    assert!(
        vector::length(&solana_recipient) == SOLANA_ADDRESS_BYTES,
        E_SOLANA_RECIPIENT_LENGTH
    );
    assert_nonzero_bytes(
        &solana_recipient,
        E_ZERO_SOLANA_RECIPIENT
    );

    let amount_base_units =
        coin::value(&wrapped);

    assert!(amount_base_units > 0, E_ZERO_AMOUNT);
    assert!(
        amount_base_units <= controller.wrapped_supply_base_units,
        E_INSUFFICIENT_WRAPPED_SUPPLY
    );

    let sender = tx_context::sender(ctx);

    coin::burn(
        &mut controller.treasury,
        wrapped
    );

    controller.wrapped_supply_base_units =
        controller.wrapped_supply_base_units - amount_base_units;
    controller.burn_sequence =
        checked_next_sequence(controller.burn_sequence);

    event::emit(BridgeBurned {
        sequence: controller.burn_sequence,
        sender,
        solana_recipient,
        amount_base_units,
    });
}

public fun wrapped_supply_base_units(
    controller: &BridgeController,
): u64 {
    controller.wrapped_supply_base_units
}

public fun governor(
    controller: &BridgeController,
): address {
    controller.governor
}

public fun operator(
    controller: &BridgeController,
): address {
    controller.operator
}

public fun pending_governor(
    controller: &BridgeController,
): address {
    controller.pending_governor
}

public fun admin_sequence(
    controller: &BridgeController,
): u64 {
    controller.admin_sequence
}

public fun paused(
    controller: &BridgeController,
): bool {
    controller.paused
}


public fun mint_sequence(
    controller: &BridgeController,
): u64 {
    controller.mint_sequence
}

public fun burn_sequence(
    controller: &BridgeController,
): u64 {
    controller.burn_sequence
}

public fun message_consumed(
    controller: &BridgeController,
    source_message: &vector<u8>,
): bool {
    let key = message_key(source_message);
    table::contains(
        &controller.consumed_messages,
        key
    )
}



fun checked_next_sequence(
    sequence: u64,
): u64 {
    assert!(sequence < 0xffffffffffffffff, E_SEQUENCE_OVERFLOW);
    sequence + 1
}

fun assert_nonzero_bytes(
    bytes: &vector<u8>,
    error_code: u64,
) {
    let mut index = 0;
    let mut has_nonzero = false;

    while (index < vector::length(bytes)) {
        if (*vector::borrow(bytes, index) != 0) {
            has_nonzero = true;
        };
        index = index + 1;
    };

    assert!(has_nonzero, error_code);
}

fun message_key(
    bytes: &vector<u8>,
): MessageKey {
    assert!(
        vector::length(bytes) == MESSAGE_DIGEST_BYTES,
        E_MESSAGE_DIGEST_LENGTH
    );

    MessageKey {
        a: read_u64_be(bytes, 0),
        b: read_u64_be(bytes, 8),
        c: read_u64_be(bytes, 16),
        d: read_u64_be(bytes, 24),
    }
}

fun read_u64_be(
    bytes: &vector<u8>,
    offset: u64,
): u64 {
    let mut value = 0;
    let mut i = 0;

    while (i < 8) {
        value =
            value * 256 +
            (*vector::borrow(bytes, offset + i) as u64);
        i = i + 1;
    };

    value
}

fun assert_governor(
    controller: &BridgeController,
    ctx: &TxContext,
) {
    assert!(
        tx_context::sender(ctx) == controller.governor,
        E_UNAUTHORIZED
    );
}

fun assert_operator(
    controller: &BridgeController,
    ctx: &TxContext,
) {
    assert!(
        controller.operator != @0x0,
        E_OPERATOR_UNINITIALIZED
    );
    assert!(
        tx_context::sender(ctx) == controller.operator,
        E_UNAUTHORIZED
    );
}
