import fs from "node:fs";

const failures = [];

const root =
  JSON.parse(
    fs.readFileSync(
      "package.json",
      "utf8",
    ),
  );
const cdp =
  JSON.parse(
    fs.readFileSync(
      "packages/cdp-user-wallet/package.json",
      "utf8",
    ),
  );
const metaplex =
  JSON.parse(
    fs.readFileSync(
      "packages/metaplex/package.json",
      "utf8",
    ),
  );
const api =
  JSON.parse(
    fs.readFileSync(
      "apps/api/package.json",
      "utf8",
    ),
  );

const expectedRootDependencies = {
  "@coral-xyz/anchor":
    "0.32.1",
  "@solana/spl-token":
    "0.4.15",
  "@solana/web3.js":
    "1.98.4",
  axios:
    "1.19.0",
  bs58:
    "6.0.0",
  dotenv:
    "17.4.2",
  ws:
    "8.21.1",
  zod:
    "4.4.3",
};

const expectedRootDevDependencies = {
  "@types/node":
    "26.1.2",
  "@types/react":
    "19.2.18",
  "@types/ws":
    "8.18.1",
  tsx:
    "4.23.1",
  typescript:
    "7.0.2",
};

const expectedCdpDependencies = {
  "@coinbase/cdp-core":
    "0.0.120",
  "@coinbase/cdp-hooks":
    "0.0.120",
  react:
    "19.2.8",
};

const expectedMetaplexDependencies = {
  "@metaplex-foundation/mpl-token-metadata":
    "3.4.0",
  "@metaplex-foundation/mpl-toolbox":
    "0.11.4",
  "@metaplex-foundation/umi":
    "1.5.1",
  "@metaplex-foundation/umi-bundle-defaults":
    "1.5.1",
};

function check(
  actual,
  expected,
  scope,
) {
  for (
    const [
      dependency,
      version,
    ] of
      Object.entries(
        expected,
      )
  ) {
    if (
      actual?.[
        dependency
      ] !== version
    ) {
      failures.push(
        `package-version:${scope}:${dependency}:expected=${version}:actual=${String(actual?.[dependency])}`,
      );
    }
  }
}

if (
  root.pnpm?.overrides?.esbuild !==
    "0.28.1"
) {
  failures.push(
    "package-version:esbuild-override",
  );
}

check(
  root.dependencies,
  expectedRootDependencies,
  "root-dependency",
);
check(
  root.devDependencies,
  expectedRootDevDependencies,
  "root-dev-dependency",
);
check(
  cdp.dependencies,
  expectedCdpDependencies,
  "cdp-dependency",
);
check(
  cdp.devDependencies,
  {
    "@types/react":
      "19.2.18",
    typescript:
      "7.0.2",
  },
  "cdp-dev-dependency",
);
check(
  metaplex.dependencies,
  expectedMetaplexDependencies,
  "metaplex-dependency",
);
check(
  api.dependencies,
  {
    axios:
      "1.19.0",
  },
  "api-dependency",
);

console.log(JSON.stringify({
  ok:
    failures.length ===
    0,
  version:
    "1.0.0",
  packageManager:
    root.packageManager,
  latestVerifiedPackagePins:
    true,
  solanaWeb3Strategy:
    "maintained-1.x",
  solanaKitMigration:
    false,
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}
