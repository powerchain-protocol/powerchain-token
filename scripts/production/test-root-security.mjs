import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  canonicalJsonStringify,
} from "../../packages/runtime/src/canonical-json.mjs";
import {
  redactText,
  redactValue,
} from "../../packages/runtime/src/redact.mjs";
import {
  runCommandSync,
} from "../../packages/runtime/src/process.mjs";
import {
  readJsonFileSync,
} from "../../packages/runtime/src/config.mjs";

const failures = [];

if (
  canonicalJsonStringify({
    b: 2,
    a: 1,
  }) !==
  '{"a":1,"b":2}'
) {
  failures.push(
    "canonical-json-order",
  );
}

for (const value of [
  NaN,
  Infinity,
  undefined,
  1n,
]) {
  let rejected = false;

  try {
    canonicalJsonStringify(
      value,
    );
  } catch {
    rejected = true;
  }

  if (!rejected) {
    failures.push(
      `canonical-json-reject:${typeof value}`,
    );
  }
}

const circular = {};
circular.self = circular;

let circularRejected = false;

try {
  canonicalJsonStringify(
    circular,
  );
} catch {
  circularRejected = true;
}

if (!circularRejected) {
  failures.push(
    "canonical-json-cycle",
  );
}

const redacted =
  redactText(
    "Authorization: Bearer abcdefghijklmnopqrstuvwxyz api_key=supersecret",
  );

if (
  redacted.includes(
    "abcdefghijklmnopqrstuvwxyz",
  ) ||
  redacted.includes(
    "supersecret",
  )
) {
  failures.push(
    "text-redaction",
  );
}

const circularRedaction = {
  safe: "yes",
};
circularRedaction.self =
  circularRedaction;

if (
  redactValue(
    circularRedaction,
  ).self !==
  "[CIRCULAR]"
) {
  failures.push(
    "redaction-cycle",
  );
}

const command =
  runCommandSync({
    command:
      process.execPath,
    args: [
      "-e",
      "process.stdout.write('ok')",
    ],
    timeoutMs:
      5_000,
  });

if (
  !command.ok ||
  command.stdout !==
    "ok"
) {
  failures.push(
    "process-runner",
  );
}

let invalidOutputLimitRejected =
  false;

try {
  runCommandSync({
    command:
      process.execPath,
    maxOutputBytes:
      100_000_000,
  });
} catch {
  invalidOutputLimitRejected =
    true;
}

if (!invalidOutputLimitRejected) {
  failures.push(
    "process-output-bound",
  );
}

const temp =
  fs.mkdtempSync(
    path.join(
      os.tmpdir(),
      "pwrc-security-",
    ),
  );

try {
  const outside =
    path.join(
      temp,
      "..",
      `pwrc-outside-${process.pid}.json`,
    );

  fs.writeFileSync(
    outside,
    '{"ok":true}\n',
  );

  let pathEscapeRejected =
    false;

  try {
    readJsonFileSync(
      `../${path.basename(
        outside,
      )}`,
      {
        root: temp,
      },
    );
  } catch {
    pathEscapeRejected =
      true;
  }

  if (!pathEscapeRejected) {
    failures.push(
      "config-path-escape",
    );
  }

  fs.unlinkSync(
    outside,
  );
} finally {
  fs.rmSync(
    temp,
    {
      recursive: true,
      force: true,
    },
  );
}

console.log(
  JSON.stringify({
    ok:
      failures.length === 0,
    version: "1.0.0",
    tests: {
      strictCanonicalJson:
        true,
      embeddedSecretRedaction:
        true,
      circularRedaction:
        true,
      boundedProcessExecution:
        true,
      configPathContainment:
        true,
    },
    failures,
  }, null, 2),
);

if (failures.length) {
  process.exit(1);
}
