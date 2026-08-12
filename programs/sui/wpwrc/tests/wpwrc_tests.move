#[test_only]
module wpwrc::wpwrc_tests;

use wpwrc::wpwrc;

#[test]
fun constants_are_canonical() {
    assert!(wpwrc::decimals() == 9, 0);
    assert!(
        wpwrc::max_supply_base_units() == 18_446_000_000_000_000_000,
        1,
    );
}
