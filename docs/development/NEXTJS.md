# Next.js Integration

The repository is a token/bridge SDK rather than a Next.js application, but `next.config.mjs` is included as a safe production baseline for a consuming Next.js host.

It enables React strict mode, compression, disables the powered-by header and browser production source maps, and adds conservative security headers. It intentionally does not embed RPC secrets, private keys, or Mainnet deployment IDs.

```bash
pnpm pwrc:next:check
```

A consuming application should keep privileged RPC/provider credentials server-only and route sensitive write preparation through server handlers.
