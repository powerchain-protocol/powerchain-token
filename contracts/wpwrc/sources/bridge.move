module wpwrc::bridge;

use std::vector;
use sui::coin::Coin;
use sui::event;
use sui::transfer;
use sui::tx_context::{Self, TxContext};
use wpwrc::state;
use wpwrc::wpwrc::{Self, BridgeController, WPWRC};

public struct MintedFromSolana has copy, drop {
    amount_base_units: u64,
    recipient: address,
    source_message_hash: vector<u8>,
}

public struct BurnedForSolana has copy, drop {
    amount_base_units: u64,
    sender: address,
    solana_destination: vector<u8>,
    burn_reference: vector<u8>,
}

public struct BridgePauseChanged has copy, drop {
    paused: bool,
    governor: address,
}

public struct BridgeAuthoritiesConfigured has copy, drop {
    bridge_authority: address,
    governor: address,
}

public struct CanonicalBurnIntentStaged has copy, drop {
    quarter_id: u64,
    expected_post_burn_ceiling: u64,
    plan_hash: vector<u8>,
}

public struct CanonicalSupplyCeilingLowered has copy, drop {
    quarter_id: u64,
    new_ceiling: u64,
    canonical_burn_evidence_hash: vector<u8>,
}

public entry fun configure_authorities(
    controller: &mut BridgeController,
    bridge_authority: address,
    governor: address,
    ctx: &mut TxContext,
) {
    wpwrc::configure_authorities(controller, bridge_authority, governor, ctx);
    event::emit(BridgeAuthoritiesConfigured { bridge_authority, governor });
}

public entry fun mint_from_bridge(
    controller: &mut BridgeController,
    amount: u64,
    recipient: address,
    source_message_hash: vector<u8>,
    ctx: &mut TxContext,
) {
    let event_hash = copy source_message_hash;
    let minted = wpwrc::mint_from_verified_message(
        controller, amount, source_message_hash, ctx,
    );
    transfer::public_transfer(minted, recipient);
    event::emit(MintedFromSolana {
        amount_base_units: amount,
        recipient,
        source_message_hash: event_hash,
    });
}

public entry fun burn_for_solana(
    controller: &mut BridgeController,
    coin_to_burn: Coin<WPWRC>,
    solana_destination: vector<u8>,
    burn_reference: vector<u8>,
    ctx: &mut TxContext,
) {
    state::assert_solana_destination(&solana_destination);
    let event_reference = copy burn_reference;
    let amount = wpwrc::burn_for_verified_reference(
        controller, coin_to_burn, burn_reference,
    );
    event::emit(BurnedForSolana {
        amount_base_units: amount,
        sender: tx_context::sender(ctx),
        solana_destination,
        burn_reference: event_reference,
    });
}

public entry fun set_paused(
    controller: &mut BridgeController,
    paused: bool,
    ctx: &mut TxContext,
) {
    wpwrc::set_paused(controller, paused, ctx);
    event::emit(BridgePauseChanged {
        paused,
        governor: tx_context::sender(ctx),
    });
}

public entry fun stage_canonical_burn_intent(
    controller: &mut BridgeController,
    quarter_id: u64,
    expected_post_burn_ceiling: u64,
    plan_hash: vector<u8>,
    ctx: &mut TxContext,
) {
    let event_hash = copy plan_hash;
    wpwrc::stage_canonical_burn_intent(
        controller,
        quarter_id,
        expected_post_burn_ceiling,
        plan_hash,
        ctx,
    );
    event::emit(CanonicalBurnIntentStaged {
        quarter_id,
        expected_post_burn_ceiling,
        plan_hash: event_hash,
    });
}

public entry fun cancel_canonical_burn_intent(
    controller: &mut BridgeController,
    ctx: &mut TxContext,
) {
    wpwrc::cancel_canonical_burn_intent(
        controller,
        ctx,
    );
}

public entry fun lower_canonical_supply_ceiling(
    controller: &mut BridgeController,
    quarter_id: u64,
    new_ceiling: u64,
    canonical_burn_evidence_hash: vector<u8>,
    ctx: &mut TxContext,
) {
    let event_hash = copy canonical_burn_evidence_hash;
    wpwrc::lower_canonical_supply_ceiling(
        controller,
        quarter_id,
        new_ceiling,
        canonical_burn_evidence_hash,
        ctx,
    );
    event::emit(CanonicalSupplyCeilingLowered {
        quarter_id,
        new_ceiling,
        canonical_burn_evidence_hash: event_hash,
    });
}

public entry fun propose_bridge_authority(
    controller: &mut BridgeController,
    new_authority: address,
    ctx: &mut TxContext,
) {
    wpwrc::propose_bridge_authority(controller, new_authority, ctx);
}

public entry fun cancel_bridge_authority(
    controller: &mut BridgeController,
    ctx: &mut TxContext,
) {
    wpwrc::cancel_bridge_authority(
        controller,
        ctx,
    );
}

public entry fun accept_bridge_authority(
    controller: &mut BridgeController,
    ctx: &mut TxContext,
) {
    wpwrc::accept_bridge_authority(controller, ctx);
}

public entry fun propose_governor(
    controller: &mut BridgeController,
    new_governor: address,
    ctx: &mut TxContext,
) {
    wpwrc::propose_governor(controller, new_governor, ctx);
}

public entry fun cancel_governor(
    controller: &mut BridgeController,
    ctx: &mut TxContext,
) {
    wpwrc::cancel_governor(
        controller,
        ctx,
    );
}

public entry fun accept_governor(
    controller: &mut BridgeController,
    ctx: &mut TxContext,
) {
    wpwrc::accept_governor(controller, ctx);
}
