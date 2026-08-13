# Full-stack ports and startup

PowerChain `1.0.0` starts the API before the web application.

Default endpoints:

```text
API  http://127.0.0.1:8787
Web  http://127.0.0.1:3000
```

## Normal start

```bash
pnpm fullstack:start
```

The supervisor checks both ports **before spawning either application**. If a
port is already occupied it fails with an actionable message instead of
starting only half of the stack.

On macOS/Linux, when `lsof` is available, the listening process is printed.

## Automatically choose free ports

For local development:

```bash
pnpm fullstack:start:auto
```

or:

```bash
PWRC_FULLSTACK_AUTO_PORTS=true pnpm fullstack:start
```

When a requested port is occupied, the supervisor allocates a free loopback
port and wires the web application's API proxy to the actual API port.

The selected URLs are printed after both applications pass startup health
checks.

## Explicit ports

```bash
PWRC_API_PORT=8788 \
PWRC_WEB_PORT=3001 \
pnpm fullstack:start
```

The web proxy target is derived from the API host/port by the supervisor.

## Find an existing process on macOS

```bash
lsof -nP -iTCP:8787 -sTCP:LISTEN
```

Stop a process only after verifying that it belongs to the intended local
PowerChain development instance.

## Shutdown

`Ctrl+C` sends `SIGTERM` to both children. The supervisor waits for clean exit
and escalates only after the shutdown timeout.

If API startup fails, the web process is never started. If web startup fails,
the API process is shut down.
