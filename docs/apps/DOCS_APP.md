# PowerChain Docs Application

PowerChain `1.0.0` includes a standalone technical documentation application.

## Structure

```text
apps/docs/
├── package.json
├── server.mjs
└── public/
    ├── docs.css
    └── docs.js

components/docs/
├── index.mjs
├── escape.mjs
├── docs-shell.mjs
├── docs-sidebar.mjs
├── docs-section.mjs
├── docs-toc.mjs
├── code-block.mjs
├── callout.mjs
└── spec-table.mjs

sessions/
├── index.mjs
├── technology.mjs
├── architecture.mjs
├── token.mjs
├── bridge.mjs
├── api.mjs
├── security.mjs
└── development.mjs
```

## Start

```bash
pnpm start:docs
```

Default local URL:

```text
http://127.0.0.1:3002
```

## Routes

```text
/technology
/architecture
/token
/bridge
/api
/security
/development
```

Session metadata is also available from:

```text
GET /api/docs/sessions
```

The application uses reusable server-rendered documentation components. Content
is stored separately in `packages/docs-content/src/` so documentation structure and presentation
remain independently maintainable.

The interface is light-first, supports a dark theme, responsive sidebar
navigation, mobile navigation, keyboard search focus (`/`), reduced-motion
preferences, code blocks, specification tables, callouts and per-page tables of
contents.
