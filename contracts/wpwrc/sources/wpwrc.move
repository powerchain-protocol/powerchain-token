module wpwrc::wpwrc;

use std::vector;
use sui::coin::{Self, Coin, TreasuryCap};
use sui::coin_registry;
use sui::object::{Self, UID};
use sui::table::{Self, Table};
use sui::transfer;
use sui::tx_context::{Self, TxContext};
use wpwrc::errors;
use wpwrc::state;

public const DECIMALS: u8 = 9;
public const MAX_SUPPLY_BASE_UNITS: u64 =
    18_446_000_000_000_000_000;
public const BURN_POLICY_START_QUARTER_ID: u64 = 20271;
public const U64_MAX: u64 = 18_446_744_073_709_551_615;

public struct WPWRC has drop {}

public struct BridgeController has key {
    id: UID,
    version: u8,
    configured: bool,
    paused: bool,
    bridge_authority: address,
    governor: address,
    pending_bridge_authority: address,
    has_pending_bridge_authority: bool,
    pending_governor: address,
    has_pending_governor: bool,
    treasury_cap: TreasuryCap<WPWRC>,
    consumed_mint_messages: Table<vector<u8>, bool>,
    consumed_burn_references: Table<vector<u8>, bool>,
    processed_canonical_burns: Table<vector<u8>, bool>,
    canonical_supply_ceiling: u64,
    last_canonical_burn_quarter_id: u64,
    pending_burn_quarter_id: u64,
    pending_burn_expected_ceiling: u64,
    pending_burn_plan_hash: vector<u8>,
    mint_sequence: u64,
    burn_sequence: u64,
    total_minted: u64,
    total_burned: u64,
}

fun init(
    witness: WPWRC,
    ctx: &mut TxContext,
) {
    let (currency, treasury_cap) =
        coin_registry::new_currency_with_otw(
            witness,
            DECIMALS,
            b"wPWRC".to_string(),
            b"PowerChain".to_string(),
            b"1:1 Sui bridge representation of canonical Solana PWRC".to_string(),
            b"https://token.powerchain.energy/assets/tokens/wpwrc-logo.png".to_string(),
            ctx,
        );

    // Current Sui coin-registry flow returns a metadata capability when the
    // currency builder is finalized. Metadata custody is intentionally separate
    // from the TreasuryCap; the TreasuryCap remains encapsulated below.
    let metadata_cap = currency.finalize(ctx);

    let sender = tx_context::sender(ctx);
    transfer::public_transfer(metadata_cap, sender);

    // Zero genesis supply. TreasuryCap is wrapped in the shared controller,
    // so the publisher receives no unrestricted address-owned mint capability.
    transfer::share_object(BridgeController {
        id: object::new(ctx),
        version: state::STATE_VERSION,
        configured: false,
        paused: true,
        bridge_authority: sender,
        governor: sender,
        pending_bridge_authority: @0x0,
        has_pending_bridge_authority: false,
        pending_governor: @0x0,
        has_pending_governor: false,
        treasury_cap,
        consumed_mint_messages: table::new(ctx),
        consumed_burn_references: table::new(ctx),
        processed_canonical_burns: table::new(ctx),
        canonical_supply_ceiling: MAX_SUPPLY_BASE_UNITS,
        last_canonical_burn_quarter_id: 0,
        pending_burn_quarter_id: 0,
        pending_burn_expected_ceiling: 0,
        pending_burn_plan_hash: vector[],
        mint_sequence: 0,
        burn_sequence: 0,
        total_minted: 0,
        total_burned: 0,
    });
}

public fun decimals(): u8 {
    DECIMALS
}

public fun configured(
    controller: &BridgeController,
): bool {
    controller.configured
}

public fun paused(
    controller: &BridgeController,
): bool {
    controller.paused
}

public fun bridge_authority(
    controller: &BridgeController,
): address {
    controller.bridge_authority
}

public fun governor(
    controller: &BridgeController,
): address {
    controller.governor
}

public fun current_supply_base_units(
    controller: &BridgeController,
): u64 {
    coin::total_supply(&controller.treasury_cap)
}

public fun canonical_supply_ceiling(
    controller: &BridgeController,
): u64 {
    controller.canonical_supply_ceiling
}

public fun last_canonical_burn_quarter_id(
    controller: &BridgeController,
): u64 {
    controller.last_canonical_burn_quarter_id
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

fun assert_version(
    controller: &BridgeController,
) {
    assert!(
        controller.version == state::STATE_VERSION,
        errors::E_VERSION_UNSUPPORTED,
    );
}

public(package) fun configure_authorities(
    controller: &mut BridgeController,
    bridge_authority: address,
    governor: address,
    ctx: &TxContext,
) {
    assert_version(controller);
    assert!(
        !controller.configured,
        errors::E_ALREADY_CONFIGURED,
    );
    assert!(
        tx_context::sender(ctx) == controller.governor,
        errors::E_NOT_GOVERNOR,
    );
    assert!(
        bridge_authority != @0x0 && governor != @0x0,
        errors::E_INVALID_AUTHORITY,
    );
    assert!(
        bridge_authority != governor,
        errors::E_AUTHORITY_MUST_DIFFER,
    );

    controller.bridge_authority = bridge_authority;
    controller.governor = governor;
    controller.configured = true;
    controller.paused = true;
}

public(package) fun set_paused(
    controller: &mut BridgeController,
    paused: bool,
    ctx: &TxContext,
) {
    assert_version(controller);
    assert!(
        controller.configured,
        errors::E_NOT_CONFIGURED,
    );
    assert!(
        tx_context::sender(ctx) == controller.governor,
        errors::E_NOT_GOVERNOR,
    );

    if (!paused) {
        assert!(
            !controller.has_pending_bridge_authority &&
                !controller.has_pending_governor,
            errors::E_PENDING_GOVERNANCE_CHANGE,
        );
    };

    controller.paused = paused;
}

public(package) fun mint_from_verified_message(
    controller: &mut BridgeController,
    amount: u64,
    source_message_hash: vector<u8>,
    ctx: &mut TxContext,
): Coin<WPWRC> {
    assert_version(controller);
    assert!(
        controller.configured,
        errors::E_NOT_CONFIGURED,
    );
    assert!(!controller.paused, errors::E_PAUSED);
    assert!(
        tx_context::sender(ctx) ==
            controller.bridge_authority,
        errors::E_NOT_BRIDGE_AUTHORITY,
    );
    assert!(amount > 0, errors::E_ZERO_AMOUNT);
    state::assert_digest32(&source_message_hash);
    assert!(
        !table::contains(
            &controller.consumed_mint_messages,
            copy source_message_hash,
        ),
        errors::E_MESSAGE_REPLAY,
    );

    let current_supply =
        coin::total_supply(&controller.treasury_cap);
    assert!(
        current_supply <= MAX_SUPPLY_BASE_UNITS,
        errors::E_SUPPLY_EXCEEDS_MAX,
    );
    assert!(
        amount <=
            MAX_SUPPLY_BASE_UNITS - current_supply,
        errors::E_SUPPLY_EXCEEDS_MAX,
    );
    assert!(
        current_supply + amount <=
            controller.canonical_supply_ceiling,
        errors::E_CANONICAL_CEILING_BELOW_WRAPPED,
    );

    table::add(
        &mut controller.consumed_mint_messages,
        source_message_hash,
        true,
    );
    assert!(
        controller.mint_sequence < U64_MAX,
        errors::E_ARITHMETIC_OVERFLOW,
    );
    assert!(
        amount <= U64_MAX - controller.total_minted,
        errors::E_ARITHMETIC_OVERFLOW,
    );
    controller.mint_sequence =
        controller.mint_sequence + 1;
    controller.total_minted =
        controller.total_minted + amount;

    coin::mint(
        &mut controller.treasury_cap,
        amount,
        ctx,
    )
}

public(package) fun burn_for_verified_reference(
    controller: &mut BridgeController,
    coin_to_burn: Coin<WPWRC>,
    burn_reference: vector<u8>,
): u64 {
    assert_version(controller);
    assert!(
        controller.configured,
        errors::E_NOT_CONFIGURED,
    );
    assert!(!controller.paused, errors::E_PAUSED);
    state::assert_digest32(&burn_reference);
    assert!(
        !table::contains(
            &controller.consumed_burn_references,
            copy burn_reference,
        ),
        errors::E_BURN_REFERENCE_REPLAY,
    );

    let amount = coin::value(&coin_to_burn);
    assert!(amount > 0, errors::E_ZERO_AMOUNT);

    table::add(
        &mut controller.consumed_burn_references,
        burn_reference,
        true,
    );

    let burned = coin::burn(
        &mut controller.treasury_cap,
        coin_to_burn,
    );

    assert!(
        controller.burn_sequence < U64_MAX,
        errors::E_ARITHMETIC_OVERFLOW,
    );
    assert!(
        burned <= U64_MAX - controller.total_burned,
        errors::E_ARITHMETIC_OVERFLOW,
    );
    controller.burn_sequence =
        controller.burn_sequence + 1;
    controller.total_burned =
        controller.total_burned + burned;

    burned
}

fun next_quarter_id(
    quarter_id: u64,
): u64 {
    let quarter = quarter_id % 10;
    assert!(
        quarter >= 1 && quarter <= 4,
        errors::E_QUARTER_ID_INVALID,
    );

    if (quarter < 4) {
        quarter_id + 1
    } else {
        ((quarter_id / 10) + 1) * 10 + 1
    }
}

public(package) fun stage_canonical_burn_intent(
    controller: &mut BridgeController,
    quarter_id: u64,
    expected_post_burn_ceiling: u64,
    plan_hash: vector<u8>,
    ctx: &TxContext,
) {
    assert_version(controller);
    assert!(controller.configured, errors::E_NOT_CONFIGURED);
    assert!(controller.paused, errors::E_PAUSED);
    assert!(
        tx_context::sender(ctx) == controller.governor,
        errors::E_NOT_GOVERNOR,
    );
    assert!(
        controller.pending_burn_quarter_id == 0,
        errors::E_BURN_INTENT_ALREADY_PENDING,
    );
    assert!(
        quarter_id >= BURN_POLICY_START_QUARTER_ID,
        errors::E_BURN_BEFORE_POLICY_START,
    );
    state::assert_digest32(&plan_hash);
    assert!(
        expected_post_burn_ceiling <=
            controller.canonical_supply_ceiling,
        errors::E_CANONICAL_CEILING_INCREASE,
    );
    assert!(
        expected_post_burn_ceiling >=
            coin::total_supply(&controller.treasury_cap),
        errors::E_CANONICAL_CEILING_BELOW_WRAPPED,
    );

    if (controller.last_canonical_burn_quarter_id == 0) {
        assert!(
            quarter_id == BURN_POLICY_START_QUARTER_ID,
            errors::E_QUARTER_ID_NOT_CONTIGUOUS,
        );
    } else {
        assert!(
            quarter_id == next_quarter_id(
                controller.last_canonical_burn_quarter_id,
            ),
            errors::E_QUARTER_ID_NOT_CONTIGUOUS,
        );
    };

    controller.pending_burn_quarter_id = quarter_id;
    controller.pending_burn_expected_ceiling =
        expected_post_burn_ceiling;
    controller.pending_burn_plan_hash = plan_hash;
}

public(package) fun cancel_canonical_burn_intent(
    controller: &mut BridgeController,
    ctx: &TxContext,
) {
    assert_version(controller);
    assert!(controller.paused, errors::E_PAUSED);
    assert!(
        tx_context::sender(ctx) == controller.governor,
        errors::E_NOT_GOVERNOR,
    );
    assert!(
        controller.pending_burn_quarter_id != 0,
        errors::E_BURN_INTENT_MISSING,
    );

    controller.pending_burn_quarter_id = 0;
    controller.pending_burn_expected_ceiling = 0;
    controller.pending_burn_plan_hash = vector[];
}

public(package) fun lower_canonical_supply_ceiling(
    controller: &mut BridgeController,
    quarter_id: u64,
    new_ceiling: u64,
    canonical_burn_evidence_hash: vector<u8>,
    ctx: &TxContext,
) {
    assert_version(controller);
    assert!(controller.paused, errors::E_PAUSED);
    assert!(
        tx_context::sender(ctx) == controller.governor,
        errors::E_NOT_GOVERNOR,
    );
    assert!(
        controller.pending_burn_quarter_id != 0,
        errors::E_BURN_INTENT_MISSING,
    );
    assert!(
        quarter_id == controller.pending_burn_quarter_id,
        errors::E_BURN_INTENT_QUARTER_MISMATCH,
    );
    assert!(
        new_ceiling ==
            controller.pending_burn_expected_ceiling,
        errors::E_BURN_INTENT_CEILING_MISMATCH,
    );
    state::assert_digest32(&canonical_burn_evidence_hash);
    assert!(
        !table::contains(
            &controller.processed_canonical_burns,
            copy canonical_burn_evidence_hash,
        ),
        errors::E_BURN_EVIDENCE_REPLAY,
    );
    assert!(
        new_ceiling < controller.canonical_supply_ceiling,
        errors::E_CANONICAL_CEILING_NOT_LOWER,
    );
    assert!(
        new_ceiling >=
            coin::total_supply(&controller.treasury_cap),
        errors::E_CANONICAL_CEILING_BELOW_WRAPPED,
    );

    table::add(
        &mut controller.processed_canonical_burns,
        canonical_burn_evidence_hash,
        true,
    );
    controller.canonical_supply_ceiling = new_ceiling;
    controller.last_canonical_burn_quarter_id = quarter_id;
    controller.pending_burn_quarter_id = 0;
    controller.pending_burn_expected_ceiling = 0;
    controller.pending_burn_plan_hash = vector[];
}

public(package) fun propose_bridge_authority(
    controller: &mut BridgeController,
    new_authority: address,
    ctx: &TxContext,
) {
    assert_version(controller);
    assert!(
        controller.configured,
        errors::E_NOT_CONFIGURED,
    );
    assert!(controller.paused, errors::E_PAUSED);
    assert!(
        tx_context::sender(ctx) == controller.governor,
        errors::E_NOT_GOVERNOR,
    );
    assert!(
        new_authority != @0x0 &&
            new_authority != controller.governor,
        errors::E_INVALID_AUTHORITY,
    );
    assert!(
        new_authority != controller.bridge_authority,
        errors::E_AUTHORITY_UNCHANGED,
    );

    controller.pending_bridge_authority =
        new_authority;
    controller.has_pending_bridge_authority = true;
}

public(package) fun cancel_bridge_authority(
    controller: &mut BridgeController,
    ctx: &TxContext,
) {
    assert_version(controller);
    assert!(controller.paused, errors::E_PAUSED);
    assert!(
        tx_context::sender(ctx) == controller.governor,
        errors::E_NOT_GOVERNOR,
    );
    assert!(
        controller.has_pending_bridge_authority,
        errors::E_NO_PENDING_CHANGE,
    );

    controller.pending_bridge_authority = @0x0;
    controller.has_pending_bridge_authority = false;
}

public(package) fun accept_bridge_authority(
    controller: &mut BridgeController,
    ctx: &TxContext,
) {
    assert_version(controller);
    assert!(controller.paused, errors::E_PAUSED);
    assert!(
        controller.has_pending_bridge_authority,
        errors::E_NO_PENDING_AUTHORITY,
    );

    let expected = controller.pending_bridge_authority;
    assert!(
        tx_context::sender(ctx) == expected,
        errors::E_PENDING_AUTHORITY_MISMATCH,
    );

    controller.pending_bridge_authority = @0x0;
    controller.has_pending_bridge_authority = false;
    controller.bridge_authority = expected;
}

public(package) fun propose_governor(
    controller: &mut BridgeController,
    new_governor: address,
    ctx: &TxContext,
) {
    assert_version(controller);
    assert!(
        controller.configured,
        errors::E_NOT_CONFIGURED,
    );
    assert!(controller.paused, errors::E_PAUSED);
    assert!(
        tx_context::sender(ctx) == controller.governor,
        errors::E_NOT_GOVERNOR,
    );
    assert!(
        new_governor != @0x0 &&
            new_governor != controller.bridge_authority,
        errors::E_INVALID_AUTHORITY,
    );
    assert!(
        new_governor != controller.governor,
        errors::E_AUTHORITY_UNCHANGED,
    );

    controller.pending_governor = new_governor;
    controller.has_pending_governor = true;
}

public(package) fun cancel_governor(
    controller: &mut BridgeController,
    ctx: &TxContext,
) {
    assert_version(controller);
    assert!(controller.paused, errors::E_PAUSED);
    assert!(
        tx_context::sender(ctx) == controller.governor,
        errors::E_NOT_GOVERNOR,
    );
    assert!(
        controller.has_pending_governor,
        errors::E_NO_PENDING_CHANGE,
    );

    controller.pending_governor = @0x0;
    controller.has_pending_governor = false;
}

public(package) fun accept_governor(
    controller: &mut BridgeController,
    ctx: &TxContext,
) {
    assert_version(controller);
    assert!(controller.paused, errors::E_PAUSED);
    assert!(
        controller.has_pending_governor,
        errors::E_NO_PENDING_AUTHORITY,
    );

    let expected = controller.pending_governor;
    assert!(
        tx_context::sender(ctx) == expected,
        errors::E_PENDING_AUTHORITY_MISMATCH,
    );

    controller.pending_governor = @0x0;
    controller.has_pending_governor = false;
    controller.governor = expected;
}
