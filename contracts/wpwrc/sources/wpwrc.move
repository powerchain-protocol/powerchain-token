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
    operator: address,
    paused: bool,
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
        operator: sender,
        paused: true,
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

    let previous_operator = controller.operator;
    controller.operator = new_operator;

    event::emit(OperatorChanged {
        previous_operator,
        new_operator,
    });
}

public fun set_paused(
    controller: &mut BridgeController,
    paused: bool,
    ctx: &TxContext,
) {
    assert_governor(controller, ctx);
    controller.paused = paused;

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
    assert!(
        vector::length(&source_message) == MESSAGE_DIGEST_BYTES,
        E_MESSAGE_DIGEST_LENGTH
    );
    let key = message_key(&source_message);

    assert!(
        !table::contains(&controller.consumed_messages, key),
        E_MESSAGE_ALREADY_CONSUMED
    );

    let next_supply =
        controller.wrapped_supply_base_units + amount_base_units;

    assert!(
        next_supply <= WPWRC_MAX_BASE_UNITS,
        E_SUPPLY_LIMIT
    );

    table::add(
        &mut controller.consumed_messages,
        key,
        true
    );

    controller.wrapped_supply_base_units = next_supply;
    controller.mint_sequence = controller.mint_sequence + 1;

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
        controller.burn_sequence + 1;

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

public fun paused(
    controller: &BridgeController,
): bool {
    controller.paused
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
        tx_context::sender(ctx) == controller.operator,
        E_UNAUTHORIZED
    );
}
