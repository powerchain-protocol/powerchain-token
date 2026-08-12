import fs from "node:fs";

function exists(file) {
  return fs.existsSync(file);
}

function reportOk(file) {
  if (!exists(file)) return false;
  try {
    return JSON.parse(
      fs.readFileSync(file, "utf8"),
    ).ok === true;
  } catch {
    return false;
  }
}

const staticReady =
  reportOk("reports/idl-source-drift.json") &&
  reportOk("reports/idl-compatibility.json") &&
  exists("idl/abi.fingerprint.json") &&
  exists("idl/bindings/manifest.json");

const buildArtifacts = {
  anchorGeneratedIdl:
    exists("idl/generated/pwrc_lock.json"),
  suiNormalizedModules:
    exists("idl/generated/wpwrc.modules.json"),
};

const buildReady =
  buildArtifacts.anchorGeneratedIdl &&
  buildArtifacts.suiNormalizedModules &&
  reportOk(
    "reports/idl-generated-verification.json",
  );

const releaseManifestReady =
  exists("idl/release/1.0.0.json") &&
  (() => {
    try {
      return JSON.parse(
        fs.readFileSync(
          "idl/release/1.0.0.json",
          "utf8",
        ),
      ).status === "release-idl-ready";
    } catch {
      return false;
    }
  })();

const result = {
  version: "1.0.0",
  staticReady,
  buildReady,
  releaseReady:
    staticReady &&
    buildReady &&
    releaseManifestReady,
  buildArtifacts,
  mainnetDeploymentReady: false,
};

fs.mkdirSync("reports", {
  recursive: true,
});
fs.writeFileSync(
  "reports/idl-readiness.json",
  `${JSON.stringify(result, null, 2)}\n`,
);

console.log(
  JSON.stringify(result, null, 2),
);
