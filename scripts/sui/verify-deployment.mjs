import fs from "node:fs";

const network =
  process.argv[2];

if (
  network !== "devnet" &&
  network !== "mainnet"
) {
  throw new Error(
    "PWRC_SUI_VERIFY_NETWORK_REQUIRED",
  );
}

const evidenceFile =
  `deployments/${network}/sui/evidence.json`;

if (
  !fs.existsSync(
    evidenceFile,
  )
) {
  throw new Error(
    `PWRC_SUI_EVIDENCE_MISSING:${evidenceFile}`,
  );
}

const evidence =
  JSON.parse(
    fs.readFileSync(
      evidenceFile,
      "utf8",
    ),
  );

const primary =
  network === "mainnet"
    ? process.env[
        "SUI_MAINNET_RPC_URL"
      ]
    : process.env[
        "SUI_RPC_URL"
      ] ??
      "https://fullnode.devnet.sui.io:443";

const secondary =
  process.env[
    "SUI_RPC_URL_SECONDARY"
  ];

if (!primary) {
  throw new Error(
    "PWRC_SUI_PRIMARY_RPC_REQUIRED",
  );
}

if (
  network === "mainnet" &&
  !secondary
) {
  throw new Error(
    "PWRC_SUI_SECONDARY_RPC_REQUIRED",
  );
}

if (
  secondary &&
  secondary === primary
) {
  throw new Error(
    "PWRC_SUI_SECONDARY_RPC_MUST_DIFFER",
  );
}

async function rpc(
  url,
  method,
  params,
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
            10_000,
          ),
      },
    );

  const payload =
    await response.json();

  if (
    !response.ok ||
    payload.error
  ) {
    throw new Error(
      `PWRC_SUI_RPC_FAILED:${method}:${payload.error?.message ?? response.status}`,
    );
  }

  return payload.result;
}

async function getObject(
  url,
  objectId,
) {
  return await rpc(
    url,
    "sui_getObject",
    [
      objectId,
      {
        showType:
          true,
        showOwner:
          true,
        showContent:
          true,
      },
    ],
  );
}

function objectType(
  response,
) {
  return (
    response?.data?.type ??
    response?.data?.content?.type ??
    null
  );
}

function objectDigest(
  response,
) {
  return (
    response?.data?.digest ??
    null
  );
}

const packageId =
  evidence.packageId;
const controllerId =
  evidence.bridgeControllerId;

if (
  !packageId ||
  !controllerId
) {
  throw new Error(
    "PWRC_SUI_PACKAGE_AND_CONTROLLER_REQUIRED",
  );
}

const primaryPackage =
  await getObject(
    primary,
    packageId,
  );
const primaryController =
  await getObject(
    primary,
    controllerId,
  );

const expectedControllerType =
  `${packageId}::wpwrc::BridgeController`;

const primaryControllerType =
  objectType(
    primaryController,
  );

if (
  primaryControllerType !==
    expectedControllerType
) {
  throw new Error(
    `PWRC_SUI_CONTROLLER_TYPE_MISMATCH:${primaryControllerType ?? "missing"}`,
  );
}

let secondaryPackage =
  null;
let secondaryController =
  null;

if (secondary) {
  secondaryPackage =
    await getObject(
      secondary,
      packageId,
    );
  secondaryController =
    await getObject(
      secondary,
      controllerId,
    );

  if (
    objectType(
      secondaryController,
    ) !==
      expectedControllerType
  ) {
    throw new Error(
      "PWRC_SUI_SECONDARY_CONTROLLER_TYPE_MISMATCH",
    );
  }

  const primaryPackageDigest =
    objectDigest(
      primaryPackage,
    );
  const secondaryPackageDigest =
    objectDigest(
      secondaryPackage,
    );
  const primaryControllerDigest =
    objectDigest(
      primaryController,
    );
  const secondaryControllerDigest =
    objectDigest(
      secondaryController,
    );

  if (
    primaryPackageDigest &&
    secondaryPackageDigest &&
    primaryPackageDigest !==
      secondaryPackageDigest
  ) {
    throw new Error(
      "PWRC_SUI_PACKAGE_RPC_MISMATCH",
    );
  }

  if (
    primaryControllerDigest &&
    secondaryControllerDigest &&
    primaryControllerDigest !==
      secondaryControllerDigest
  ) {
    throw new Error(
      "PWRC_SUI_CONTROLLER_RPC_MISMATCH",
    );
  }
}

const result = {
  ok:
    true,
  version:
    "1.0.0",
  network,
  packageId,
  bridgeControllerId:
    controllerId,
  controllerType:
    expectedControllerType,
  independentRpc:
    Boolean(secondary),
  primary: {
    packageDigest:
      objectDigest(
        primaryPackage,
      ),
    controllerDigest:
      objectDigest(
        primaryController,
      ),
  },
  secondary:
    secondary
      ? {
          packageDigest:
            objectDigest(
              secondaryPackage,
            ),
          controllerDigest:
            objectDigest(
              secondaryController,
            ),
        }
      : null,
};

const output =
  `deployments/${network}/sui/verification.json`;

fs.writeFileSync(
  output,
  `${JSON.stringify(result, null, 2)}\n`,
);

console.log(
  JSON.stringify(
    result,
    null,
    2,
  ),
);
