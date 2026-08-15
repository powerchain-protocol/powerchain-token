# Security Boundaries

- Canonical token policy is checked for drift across JSON configuration,
  protocol constants and program source.
- Solana deployment IDs cannot be System, Token, Token-2022, Associated Token
  or Metaplex metadata program IDs.
- Mainnet program IDs are explicit; the Localnet bridge-lock ID never falls
  through to Mainnet.
- Mainnet primary and secondary RPCs must differ.
- Sui aliases are not deployment evidence.
- wPWRC starts at zero supply and is minted only through bridge-controller
  authority with replay-protected source messages.
- Monetary writes are single-attempt and reconciled after ambiguity.
- Service fees remain separate from bridge principal/backing.
- Private program/deployer keypairs and API secrets are excluded by `.gitignore`.
- Release evidence and authorization are separate gates.


## Release authorization consumption

Authorization and consumption are separate security events. A valid
authorization cannot be reused implicitly: the release workflow produces a
one-time receipt using create-exclusive file semantics and binds it to the exact
authorization, evidence and build manifest.

This makes the final release state explicit and auditable instead of treating
the mere presence of an authorization JSON file as sufficient.

## Coinbase CDP SQL trust boundary

Coinbase CDP SQL API is treated as a read-only analytics/indexing dependency.
Its server-side Bearer credential is never referenced by browser source, and
clients cannot submit arbitrary SQL.

CDP indexed results may support history, analytics and discovery, but they
cannot independently authorize wPWRC minting, canonical PWRC release, program
deployment, mint-authority claims, supply claims, or Mainnet release state.
Those decisions continue to use finalized chain/RPC evidence and PowerChain's
release verification gates.

The CDP endpoint is pinned to `api.cdp.coinbase.com` over HTTPS to prevent a
configuration error from forwarding the Bearer credential to an arbitrary
host.


## Utility and compute abuse controls

PWRC utility authorization is deterministic and bounded by:

- request and idempotency identifiers,
- wallet identity,
- workload class,
- exact units and unit price,
- maximum user spend,
- issuance and expiry timestamps,
- SHA-256 commitment.

The compute-admission layer supports rate, concurrency, payload-size,
work-budget and duplicate-request controls. Production thresholds are
deployment configuration rather than hard-coded economic policy.

Expensive provider-backed API routes have a separate tighter rate limiter.
Native attestation also coalesces concurrent identical work in-process and uses
a short bounded cache to reduce provider amplification.


## Exact token profile and bridge state consistency

Canonical native PWRC verification rejects unknown or duplicate Token-2022 mint
extensions. This prevents an otherwise-valid mint from silently acquiring an
unreviewed extension while still passing policy verification.

Bridge safety reasons are phase-aware. A newly created intent is not considered
faulty merely because source finality has not occurred. In contrast, impossible
combinations such as destination finality without source finality are marked as
inconsistent and require operator attention.

Bridge intent creation also enforces the canonical PWRC supply ceiling and the
expected chain family for each direction.


## Bridge policy configuration parity

The bridge API configuration surface mirrors the protocol validation and
canonical SHA-256 commitment algorithm while remaining standalone-executable.
A shared golden parity fixture is checked by both protocol/API regression tests,
so the API cannot silently drift while source-only checks still work before
workspace installation.

Pending bridge exposure is bounded by the canonical PWRC supply, network names
are allowlisted, and cross-field invariants reject contradictory evidence-age,
proposal-TTL and governance-threshold settings.


## Consensus defense in depth

Multi-RPC agreement is not sufficient when every provider agrees on an invalid
state. Native PWRC consensus therefore re-runs the canonical mint-profile
verifier for every snapshot before accepting consensus.

The public native-token policy is also committed with a deterministic SHA-256
hash under `POWERCHAIN_NATIVE_PWRC_POLICY_V1`. Protocol and API implementations
are protected by a golden parity fixture and release-manifest bindings.


## Attestation epoch and evaluation-time integrity

Expected and observed Solana genesis hashes must decode from Base58 to exactly
32 bytes. This rejects malformed network identities that previously matched
only a character-level regular expression.

Attestation epoch spread is bounded by `PWRC_NATIVE_VERIFY_MAX_EPOCH_SKEW`
(default `1`) so only the same or adjacent epoch boundary is accepted by
default.

The SDK uses one canonical evaluation timestamp for both attestation evaluation
and assertion. That timestamp is committed into the attestation hash.


## Token-2022 transfer-fee authority policy

Transfer-fee configuration authority and withheld-fee withdrawal authority are
part of the native token trust boundary. Live observation records both values,
and production verification compares them against explicit deployment policy.

PowerChain intentionally does not hard-code an unknown Mainnet authority into
source. Mainnet readiness remains fail-closed until the operator supplies the
reviewed expected authority state.

Transaction planning also applies shared compute-unit and priority-fee ceilings
so application code cannot silently bypass the reviewed limits by constructing
an intent through a different SDK path.


## Mainnet native-token evidence binding

Source readiness does not prove the deployed native token matches policy.
PowerChain therefore requires a live multi-provider native-token attestation
before Mainnet release readiness can advance.

The evidence verifier binds:

- canonical PWRC mint and deterministic native-policy SHA-256,
- exact 32-byte trusted Solana genesis identity,
- at least two distinct RPC provider families,
- configured Token-2022 transfer-fee authority expectations,
- consensus and attestation commitments,
- finalized slot and epoch consistency,
- observation windows,
- source-tree SHA-256,
- evaluation freshness.

Real attestation evidence is generated during release operations and is not
shipped as a default source artifact.


## Helius credential and rate-limit containment

Helius credentials are never part of the serializable SDK client surface.
Credential-bearing RPC/API/WebSocket URLs are retained only in the private
closure used for requests.

Rate-limit protection uses a shared per-network cooldown so a burst of
concurrent callers cannot each independently continue requesting after one
caller receives `429`. Retry behavior remains restricted to read-only Helius
methods; no transaction submission or monetary write retry surface is enabled.

Health traffic is single-flight and short-lived cached to reduce provider
amplification.


## Program control-plane hardening

Solana bridge administration uses one PDA state account rather than arbitrary
state accounts. Governor/operator roles are separated, governor transfer is
two-step, administrative changes are sequenced, and governor acceptance forces
the bridge back to paused.

The Sui wrapped controller mirrors the two-step governor model and rejects zero
bridge evidence/recipients. Sequence increments and the wrapped-supply ceiling
are explicitly guarded against arithmetic overflow.

The canonical program capability policy is committed under
`POWERCHAIN_PROGRAM_POLICY_V1`. Release-manifest generation and verification
both bind the program sources and this policy.


## canonicalization and runtime boundaries

Security commitments must not permit distinct unsafe JavaScript values to
collapse to the same serialized representation. Canonical JSON therefore
rejects non-finite numbers, cycles, unsupported types and non-plain objects.

Solana public keys and blockhashes use one exact Base58-to-32-byte validator.
Fee accounting is supply-bounded, service-fee recipients are validated against
their source chain, utility authorizations are time-bounded, and replay-registry
clock inputs are validated before mutation.

The Sui controller starts without an operator and cannot unpause until a
distinct operator is configured, preserving governor/operator role separation
from genesis onward.


## Canonical 1.0.0 transfer-fee epoch TOCTOU protection

A Token-2022 fee observation can become stale at an epoch boundary. The canonical release binds
the active transfer-fee configuration to epoch, finalized slot and timestamp,
then requires fresh evidence in the production unsigned-transaction builder.

This prevents constructing a `TransferCheckedWithFee` instruction from a stale
fee assumption after the live mint has moved to a different active fee epoch.
The evidence also binds the observed fee authorities and carries a deterministic
SHA-256 commitment.


## Native transfer intent trust boundary

A caller-provided native transfer intent is not trusted merely because it has
the expected TypeScript shape. The canonical verifier rebuilds it from its
primitive fields, recomputes the native Token-2022 fee and net amount, enforces
canonical integer/time/address encodings, and recomputes the deterministic
intent commitment.

Unsigned transaction review performs this verification before rebuilding the
expected Solana message. Invalid intents return a failed review instead of
being used as a trusted transaction specification.

## Native attestation cache isolation

Native-PWRC attestation cache entries and in-flight work are isolated by a
deterministic hash of the verification configuration. Changing cluster, RPC
endpoint, genesis identity, freshness/slot policy, fee-authority expectation or
Helius credential cannot reuse an entry created under the previous
configuration.

The effective cache TTL never exceeds `PWRC_NATIVE_VERIFY_MAX_AGE_MS`, and
`evaluationAt` is checked again before serving a cached result.


## Reviewed Token-2022 authority evidence

Mainnet transfer-fee authority expectations are release evidence, not merely
runtime environment configuration. `config/mainnet/token-fee-authorities.json`
is verified under
`POWERCHAIN_MAINNET_TRANSFER_FEE_AUTHORITY_POLICY_V1` and is required by the
Mainnet release-state gate.

The safe example is deliberately `configured: false`, so checking out the
source tree can never create a false positive for authority readiness. Native
token attestation capture records the reviewed policy SHA-256 and verification
requires an exact commitment match.


## API traffic-control trust boundary

The public API uses a bounded **process-local token bucket** instead of a
fixed-window limiter. This smooths boundary bursts and returns refill-derived
`Retry-After` values.

Client identity is fail-closed by default: rate limiting uses the direct socket
peer and ignores `X-Forwarded-For`. A reverse proxy may be trusted only by
listing its exact IP address in:

```text
PWRC_TRUSTED_PROXY_ADDRESSES=
PWRC_TRUSTED_PROXY_HOPS=1
```

Forwarded chains are syntax checked and bounded. An invalid chain falls back to
the trusted socket peer rather than accepting an arbitrary forwarded value.

Rate settings:

```text
PWRC_API_RATE_LIMIT=120
PWRC_API_RATE_LIMIT_BURST=120
PWRC_EXPENSIVE_API_RATE_LIMIT=20
PWRC_EXPENSIVE_API_RATE_LIMIT_BURST=20
```

The limiter remains **per process**. Multiple API replicas do not share state;
a distributed gateway/backend is still required when a deployment needs a
global cross-instance quota.
