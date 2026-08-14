const [
  kind,
  url,
] = process.argv.slice(2);

if (
  !kind ||
  !url ||
  ![
    "solana",
    "sui",
  ].includes(kind)
) {
  console.error(
    "usage: node scripts/network/check-rpc.mjs <solana|sui> <url>",
  );
  process.exit(2);
}

async function rpc(
  method,
  params = [],
) {
  const response =
    await fetch(
      url,
      {
        method:
          "POST",
        headers: {
          "content-type":
            "application/json",
        },
        body:
          JSON.stringify({
            jsonrpc:
              "2.0",
            id:
              1,
            method,
            params,
          }),
        signal:
          AbortSignal.timeout(
            8_000,
          ),
      },
    );

  if (!response.ok) {
    throw new Error(
      `HTTP_${response.status}`,
    );
  }

  const payload =
    await response.json();

  if (payload.error) {
    throw new Error(
      `RPC_${payload.error.code}:${payload.error.message}`,
    );
  }

  return payload.result;
}

let result;

if (kind === "solana") {
  result = {
    health:
      await rpc(
        "getHealth",
      ),
    version:
      await rpc(
        "getVersion",
      ),
  };
} else {
  result = {
    chainIdentifier:
      await rpc(
        "sui_getChainIdentifier",
      ),
  };
}

console.log(
  JSON.stringify(
    {
      ok: true,
      kind,
      url,
      result,
    },
    null,
    2,
  ),
);
