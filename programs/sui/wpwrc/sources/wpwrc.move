module wpwrc::wpwrc;

use std::option::{Self, Option};
use std::string;
use sui::coin::{Self, Coin, TreasuryCap};
use sui::coin_registry;
use sui::event;
use sui::object::{Self, UID};
use sui::table::{Self, Table};
use sui::transfer;
use sui::tx_context::{Self, TxContext};

const E_NOT_AUTHORITY: u64 = 1;
const E_PAUSED: u64 = 2;
const E_ZERO_AMOUNT: u64 = 3;
const E_SUPPLY_LIMIT: u64 = 4;
const E_MESSAGE_HASH_LENGTH: u64 = 5;
const E_MESSAGE_REPLAY: u64 = 6;
const E_DESTINATION_INVALID: u64 = 7;
const E_BURN_REFERENCE_LENGTH: u64 = 8;
const E_BURN_REFERENCE_REPLAY: u64 = 9;
const E_PENDING_AUTHORITY_MISSING: u64 = 10;
const E_PENDING_AUTHORITY_MISMATCH: u64 = 11;
const E_SAME_AUTHORITY: u64 = 12;
const E_GOVERNANCE_REQUIRES_PAUSE: u64 = 13;

const DECIMALS: u8 = 9;
const MAX_SUPPLY_BASE_UNITS: u64 = 18_446_000_000_000_000_000;
const HASH_LENGTH: u64 = 32;
const MAX_DESTINATION_BYTES: u64 = 128;

/// One-time witness for Wrapped PowerChain.
public struct WPWRC has drop {}

/// Shared bridge controller. The TreasuryCap is encapsulated and never exposed.
/// Normal Coin<WPWRC> transfers do not need this controller.
public struct BridgeController has key {
    id: UID,
    treasury_cap: TreasuryCap<WPWRC>,
    authority: address,
    pending_authority: Option<address>,
    paused: bool,
    processed_mints: Table<vector<u8>, bool>,
    processed_burns: Table<vector<u8>, bool>,
    lifetime_minted: u64,
    lifetime_burned: u64,
}

public struct BridgeMinted has copy, drop {
    source_message_hash: vector<u8>,
    amount: u64,
    recipient: address,
    supply_after: u64,
}

public struct BridgeBurned has copy, drop {
    burn_reference: vector<u8>,
    amount: u64,
    sender: address,
    destination_chain: u16,
    destination: vector<u8>,
    supply_after: u64,
}

public struct BridgePauseChanged has copy, drop {
    paused: bool,
}

public struct BridgeAuthorityProposed has copy, drop {
    current_authority: address,
    pending_authority: address,
}

public struct BridgeAuthorityAccepted has copy, drop {
    previous_authority: address,
    new_authority: address,
}

fun init(witness: WPWRC, ctx: &mut TxContext) {
    let (currency, treasury_cap) = coin_registry::new_currency_with_otw(
        witness,
        DECIMALS,
        string::utf8(b"wPWRC"),
        string::utf8(b"Wrapped PowerChain"),
        string::utf8(
            b"Wrapped PowerChain (wPWRC), the Sui representation of canonical Solana PWRC."
        ),
        string::utf8(b"https://token.powerchain.energy/assets/tokens/wpwrc-logo.png"),
        ctx,
    );

    // Branding is immutable from genesis. Supply remains flexible because the
    // bridge must mint on verified lock and burn on return.
    coin_registry::finalize_and_delete_metadata_cap(currency, ctx);

    let controller = BridgeController {
        id: object::new(ctx),
        treasury_cap,
        authority: tx_context::sender(ctx),
        pending_authority: option::none(),
        paused: false,
        processed_mints: table::new(ctx),
        processed_burns: table::new(ctx),
        lifetime_minted: 0,
        lifetime_burned: 0,
    };

    // Shared wrapper is intentional: users must be able to burn for the return
    // path, while minting remains gated by the private authority field.
    transfer::share_object(controller);
}

public fun decimals(): u8 { DECIMALS }
public fun max_supply_base_units(): u64 { MAX_SUPPLY_BASE_UNITS }
public fun authority(controller: &BridgeController): address { controller.authority }
public fun is_paused(controller: &BridgeController): bool { controller.paused }
public fun current_supply(controller: &BridgeController): u64 {
    controller.treasury_cap.total_supply()
}
public fun lifetime_minted(controller: &BridgeController): u64 { controller.lifetime_minted }
public fun lifetime_burned(controller: &BridgeController): u64 { controller.lifetime_burned }
public fun mint_processed(controller: &BridgeController, hash: &vector<u8>): bool {
    controller.processed_mints.contains(*hash)
}
public fun burn_processed(controller: &BridgeController, reference: &vector<u8>): bool {
    controller.processed_burns.contains(*reference)
}

public entry fun mint_from_bridge(
    controller: &mut BridgeController,
    source_message_hash: vector<u8>,
    amount: u64,
    recipient: address,
    ctx: &mut TxContext,
) {
    assert!(tx_context::sender(ctx) == controller.authority, E_NOT_AUTHORITY);
    assert!(!controller.paused, E_PAUSED);
    assert!(amount > 0, E_ZERO_AMOUNT);
    assert!(source_message_hash.length() == HASH_LENGTH, E_MESSAGE_HASH_LENGTH);
    assert!(!controller.processed_mints.contains(source_message_hash), E_MESSAGE_REPLAY);

    let supply = controller.treasury_cap.total_supply();
    assert!(amount <= MAX_SUPPLY_BASE_UNITS - supply, E_SUPPLY_LIMIT);

    controller.processed_mints.add(source_message_hash, true);
    let bridged = coin::mint(&mut controller.treasury_cap, amount, ctx);
    controller.lifetime_minted = controller.lifetime_minted + amount;

    let supply_after = controller.treasury_cap.total_supply();
    event::emit(BridgeMinted {
        source_message_hash,
        amount,
        recipient,
        supply_after,
    });
    transfer::public_transfer(bridged, recipient);
}

public entry fun burn_for_bridge(
    controller: &mut BridgeController,
    coin: Coin<WPWRC>,
    destination_chain: u16,
    destination: vector<u8>,
    burn_reference: vector<u8>,
    ctx: &mut TxContext,
) {
    assert!(!controller.paused, E_PAUSED);
    let amount = coin.value();
    assert!(amount > 0, E_ZERO_AMOUNT);
    assert!(destination.length() > 0 && destination.length() <= MAX_DESTINATION_BYTES, E_DESTINATION_INVALID);
    assert!(burn_reference.length() == HASH_LENGTH, E_BURN_REFERENCE_LENGTH);
    assert!(!controller.processed_burns.contains(burn_reference), E_BURN_REFERENCE_REPLAY);

    controller.processed_burns.add(burn_reference, true);
    coin::burn(&mut controller.treasury_cap, coin);
    controller.lifetime_burned = controller.lifetime_burned + amount;

    let supply_after = controller.treasury_cap.total_supply();
    event::emit(BridgeBurned {
        burn_reference,
        amount,
        sender: tx_context::sender(ctx),
        destination_chain,
        destination,
        supply_after,
    });
}

public entry fun set_paused(
    controller: &mut BridgeController,
    paused: bool,
    ctx: &TxContext,
) {
    assert!(tx_context::sender(ctx) == controller.authority, E_NOT_AUTHORITY);
    controller.paused = paused;
    event::emit(BridgePauseChanged { paused });
}

public entry fun propose_authority(
    controller: &mut BridgeController,
    new_authority: address,
    ctx: &TxContext,
) {
    assert!(tx_context::sender(ctx) == controller.authority, E_NOT_AUTHORITY);
    assert!(controller.paused, E_GOVERNANCE_REQUIRES_PAUSE);
    assert!(new_authority != controller.authority, E_SAME_AUTHORITY);
    controller.pending_authority = option::some(new_authority);
    event::emit(BridgeAuthorityProposed {
        current_authority: controller.authority,
        pending_authority: new_authority,
    });
}

public entry fun accept_authority(
    controller: &mut BridgeController,
    ctx: &TxContext,
) {
    assert!(controller.paused, E_GOVERNANCE_REQUIRES_PAUSE);
    assert!(controller.pending_authority.is_some(), E_PENDING_AUTHORITY_MISSING);
    let new_authority = *controller.pending_authority.borrow();
    assert!(tx_context::sender(ctx) == new_authority, E_PENDING_AUTHORITY_MISMATCH);

    let previous = controller.authority;
    controller.authority = new_authority;
    controller.pending_authority = option::none();

    event::emit(BridgeAuthorityAccepted {
        previous_authority: previous,
        new_authority,
    });
}


public entry fun cancel_authority_rotation(
    controller: &mut BridgeController,
    ctx: &TxContext,
) {
    assert!(tx_context::sender(ctx) == controller.authority, E_NOT_AUTHORITY);
    assert!(controller.paused, E_GOVERNANCE_REQUIRES_PAUSE);
    controller.pending_authority = option::none();
}
