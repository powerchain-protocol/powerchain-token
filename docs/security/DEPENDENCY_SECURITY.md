# Dependency Security

**Version:** `1.0.0`

PowerChain treats vulnerable transitive dependencies as release blockers even
when the vulnerable package is not imported directly by application code.

## bigint-buffer — CVE-2025-3194

The public `bigint-buffer` package has no patched upstream npm release. The
affected `toBigIntLE()` native path can cause a process crash when hostile input
reaches the vulnerable conversion.

PowerChain does not approve the upstream `bigint-buffer@1.1.5` install script.
Instead, pnpm redirects every `bigint-buffer` dependency to:

```text
packages/bigint-buffer-safe
```

The compatibility package:

- is pure JavaScript
- does not load a native `.node` addon
- has no install lifecycle scripts
- validates `Buffer`/`Uint8Array` input
- rejects input/output widths above 1 MiB
- exports `toBigIntBE`, `toBigIntLE`, `toBufferBE`, and `toBufferLE`

The override is defined at the workspace root:

```yaml
overrides:
  "bigint-buffer": "link:packages/bigint-buffer-safe"
```

## uuid — CVE-2026-41907

Affected `uuid` versions did not consistently bounds-check caller-provided
buffers in the v3/v5/v6 paths.

Rather than patching generated `node_modules` files, PowerChain resolves affected
lines to the official patched releases:

```yaml
overrides:
  "uuid@<11.1.1": "11.1.1"
  "uuid@12.0.0": "12.0.1"
  "uuid@13.0.0": "13.0.1"
```

Those releases contain the upstream bounds check equivalent to:

```ts
if (offset < 0 || offset + 16 > buf.length) {
  throw new RangeError(
    `UUID byte range ${offset}:${offset + 15} is out of buffer bounds`,
  );
}
```

This avoids maintaining a private fork of `uuid`.

## Verification

Static repository policy:

```bash
pnpm security:dependencies
pnpm production:check
```

After installing dependencies:

```bash
pnpm install
pnpm security:dependencies:installed
```

The installed-tree verifier fails if it discovers an affected `uuid` version or
an upstream `bigint-buffer` package instead of the PowerChain compatibility
package.
