import fs from "node:fs";

const failures = [];

const bindingFile =
  "packages/protocol/src/idl/bindings.ts";
const interfaceFile =
  "idl/bindings/interface.ts";

for (const file of [
  bindingFile,
  interfaceFile,
]) {
  if (!fs.existsSync(file)) {
    failures.push(
      `idl-binding:missing:${file}`,
    );
  }
}

if (fs.existsSync(bindingFile)) {
  const binding =
    fs.readFileSync(
      bindingFile,
      "utf8",
    );

  if (
    !binding.includes(
      '../../../../idl/bindings/interface.js',
    )
  ) {
    failures.push(
      "idl-binding:wrong-relative-path",
    );
  }

  if (
    /from\s+["']\.\.\/\.\.\/idl\/bindings\/interface\.js["']/.test(
      binding,
    )
  ) {
    failures.push(
      "idl-binding:stale-relative-path",
    );
  }
}

if (fs.existsSync(interfaceFile)) {
  const source =
    fs.readFileSync(
      interfaceFile,
      "utf8",
    );

  if (
    !source.includes(
      "POWERCHAIN_IDL_GENERATED_ARTIFACT_VERIFIED = false",
    )
  ) {
    failures.push(
      "idl-binding:must-not-claim-generated-verification",
    );
  }
}

console.log(
  JSON.stringify(
    {
      ok:
        failures.length === 0,
      version:
        "1.0.0",
      failures,
    },
    null,
    2,
  ),
);

if (failures.length) {
  process.exit(1);
}
