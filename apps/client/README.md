# @powerchain/client

PowerChain `1.0.0` status and bridge-quote frontend.

```bash
pnpm app:web
```

Default:

```text
http://127.0.0.1:3000
```

The web server proxies `/api/*` to `PWRC_WEB_API_URL` and the browser only uses
same-origin requests. Server-only executor credentials are never sent to the
browser.

The current UI intentionally exposes status and quoting only. Monetary bridge
execution remains server-to-server.


Run both workspace applications with:

```bash
pnpm fullstack:start
```

The browser remains quote/status only. Authenticated execution and reconciliation
routes are server-to-server capabilities and their authorization headers are not
forwarded by the web proxy.
