# Optional Coinbase CDP User Wallet

**PowerChain version:** `1.0.0`

PowerChain includes an optional React integration in:

```text
packages/cdp-user-wallet/
```

It is disabled by default and does not replace external Solana wallets.

## Configuration

```env
POWERCHAIN_CDP_USER_WALLET_ENABLED=false
POWERCHAIN_CDP_PROJECT_ID=
POWERCHAIN_CDP_APP_NAME=PowerChain
```

The CDP project ID is browser-visible project configuration, not a server API
secret. Never reuse `CDP_SQL_API_BEARER_TOKEN`, CDP API key secrets, wallet
secrets, or bridge executor credentials in this browser integration.

## Provider

PowerChain uses the hooks-first CDP provider:

```tsx
import {
  PowerChainCdpUserWalletProvider,
} from "@powerchain/cdp-user-wallet/react";
```

Internally this uses `CDPHooksProvider` from `@coinbase/cdp-hooks`, with
`solana.createOnLogin: true`. This avoids relying on the `CDPReactProvider`
declaration surface while preserving authentication and Solana wallet hooks.

For authentication UI, build a PowerChain-styled flow with:

```tsx
const {
  isSignedIn,
  signInWithEmail,
  verifyEmailOTP,
} = usePowerChainCdpEmailAuthentication();
```

This is intentionally hooks-first instead of importing the prebuilt
`AuthButton` component.

## CDP Portal domain allowlist

Add your actual application origin to the CDP Portal project. For local
development this can be `http://localhost:3000`. A production CDP project should
allowlist only the real production origin; do not add localhost to a production
project.

## TypeScript

The repository uses:

```json
{
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "jsx": "react-jsx"
  }
}
```

This satisfies the CDP SDK Node16/NodeNext module-resolution requirement.

## Authentication

`PowerChainCdpAuthButton` wraps the CDP `AuthButton`. The
`usePowerChainCdpSolanaWallet` hook exposes signed-in state and the CDP Solana
address.

CDP User Wallet remains an optional wallet choice. Canonical PWRC transaction
construction, fee review, network checks, and bridge safety rules remain owned
by PowerChain.

## Package-local TypeScript boundary

The CDP User Wallet package is a browser package. It does not load Node ambient
types and does not rely on pnpm hoisting for `@types/node`.

Its own `tsconfig.json` enables only React ambient types plus ES2022/DOM libs.
The repository root typecheck excludes the package and invokes its package-local
typecheck separately.

This prevents browser package compilation from failing with:

```text
Cannot find type definition file for 'node'
```

while preserving Node types for server tools, tests, scripts, and protocol
runtime code.
