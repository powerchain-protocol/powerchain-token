# Contributing

## Before changing code

Read:

- `ARCHITECTURE.md`
- `CONFIGURATION.md`
- `SECURITY.md`
- `DEVELOPMENT.md`

## Pull-request expectations

Changes should:

1. preserve version `1.0.0` unless a release/version change is explicitly
   authorized;
2. preserve canonical PWRC mint/economics unless the task explicitly changes
   them;
3. avoid duplicating root utility logic;
4. add tests for monetary, security or state-machine behavior;
5. update OpenAPI/docs for API changes;
6. update config/docs for policy changes;
7. leave Mainnet fail-closed when evidence is unavailable.

## Required checks

At minimum:

```bash
pnpm production:check
pnpm fullstack:check
pnpm fullstack:runtime-test
```

With dependencies:

```bash
pnpm typecheck
pnpm test
```

For chain changes, run the relevant real chain build/tests.

## Security-sensitive changes

Changes to any of these require extra review:

```text
fees
supply
authorities
bridge lock/release
idempotency
replay protection
address validation
signature verification
release authorization
Mainnet readiness
executor behavior
```

## Documentation

Documentation must distinguish actual verified deployment facts from template
or planned values.
