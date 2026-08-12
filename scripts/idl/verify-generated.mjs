import fs from "node:fs";
import crypto from "node:crypto";

const failures = [];
const results = [];

function sorted(values) {
  return [...values].sort();
}

function sameSet(a, b) {
  return JSON.stringify(
    sorted(a),
  ) === JSON.stringify(
    sorted(b),
  );
}

for (const program of [
  {
    name: "pwrc_lock",
    expected:
      "idl/anchor/pwrc_lock.expected.json",
  },
  {
    name: "pwrc_token",
    expected:
      "idl/anchor/pwrc_token.expected.json",
  },
]) {
  const generated =
    `idl/generated/${program.name}.json`;

  if (!fs.existsSync(generated)) {
    failures.push(
      `${program.name}:generated-idl-missing`,
    );
    continue;
  }

  const expected = JSON.parse(
    fs.readFileSync(
      program.expected,
      "utf8",
    ),
  );

  const idl = JSON.parse(
    fs.readFileSync(
      generated,
      "utf8",
    ),
  );

  const localFailures = [];

  if (
    idl.metadata?.name !==
    program.name
  ) {
    localFailures.push(
      "metadata:name",
    );
  }

  if (
    idl.metadata?.version !==
    "1.0.0"
  ) {
    localFailures.push(
      "metadata:version",
    );
  }

  const generatedInstructions =
    (idl.instructions ?? []).map(
      (item) => item.name,
    );

  const expectedInstructions =
    expected.instructions.map(
      (item) => item.name,
    );

  if (
    !sameSet(
      generatedInstructions,
      expectedInstructions,
    )
  ) {
    localFailures.push(
      "instructions",
    );
  }

  const byName = new Map(
    (idl.instructions ?? []).map(
      (item) => [
        item.name,
        item,
      ],
    ),
  );

  for (
    const exp of
    expected.instructions
  ) {
    const got =
      byName.get(exp.name);

    if (!got) {
      continue;
    }

    const gotArgs =
      (got.args ?? []).map(
        (arg) => arg.name,
      );

    const expectedArgs =
      exp.args.map(
        (arg) => arg.name,
      );

    if (
      JSON.stringify(
        gotArgs,
      ) !==
      JSON.stringify(
        expectedArgs,
      )
    ) {
      localFailures.push(
        `args:${exp.name}`,
      );
    }

    const gotAccounts =
      (got.accounts ?? []).map(
        (account) =>
          account.name,
      );

    if (
      JSON.stringify(
        gotAccounts,
      ) !==
      JSON.stringify(
        exp.accounts ?? [],
      )
    ) {
      localFailures.push(
        `accounts:${exp.name}`,
      );
    }
  }

  const gotEvents =
    (idl.events ?? []).map(
      (event) => event.name,
    );

  if (
    !sameSet(
      gotEvents,
      expected.events,
    )
  ) {
    localFailures.push(
      "events",
    );
  }

  const sha256 = crypto
    .createHash("sha256")
    .update(
      fs.readFileSync(
        generated,
      ),
    )
    .digest("hex");

  results.push({
    program: program.name,
    generated,
    sha256,
    failures:
      localFailures,
  });

  for (
    const failure of
    localFailures
  ) {
    failures.push(
      `${program.name}:${failure}`,
    );
  }
}

const result = {
  ok: failures.length === 0,
  version: "1.0.0",
  programs: results,
  failures,
};

fs.mkdirSync(
  "reports",
  {
    recursive: true,
  },
);

fs.writeFileSync(
  "reports/idl-generated-verification.json",
  `${JSON.stringify(
    result,
    null,
    2,
  )}\n`,
);

console.log(
  JSON.stringify(
    result,
    null,
    2,
  ),
);

if (failures.length) {
  process.exit(2);
}
