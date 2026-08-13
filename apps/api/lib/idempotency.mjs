import fs from "node:fs";
import path from "node:path";
import {
  sha256Text,
} from "../../../packages/runtime/src/crypto.mjs";
import {
  atomicWriteJsonSync,
} from "../../../packages/runtime/src/atomic-json.mjs";

const TERMINAL =
  new Set([
    "succeeded",
    "failed",
  ]);

function assertKey(
  key,
) {
  if (
    typeof key !==
      "string" ||
    !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(
      key,
    )
  ) {
    throw new Error(
      "PWRC_IDEMPOTENCY_KEY_INVALID",
    );
  }

  return key;
}

export class FileExecutionIdempotencyStore {
  constructor({
    directory =
      "runtime/api-idempotency",
  } = {}) {
    this.directory =
      directory;

    fs.mkdirSync(
      this.directory,
      {
        recursive: true,
      },
    );
  }

  fileFor(
    key,
  ) {
    assertKey(key);

    return path.join(
      this.directory,
      `${sha256Text(
        key,
      )}.json`,
    );
  }

  reserve({
    key,
    requestHash,
  }) {
    assertKey(key);

    if (
      typeof requestHash !==
        "string" ||
      !/^[a-f0-9]{64}$/i.test(
        requestHash,
      )
    ) {
      throw new Error(
        "PWRC_IDEMPOTENCY_REQUEST_HASH_INVALID",
      );
    }

    const file =
      this.fileFor(key);

    const record = {
      version:
        "1.0.0",
      keyHash:
        sha256Text(key),
      requestHash:
        requestHash.toLowerCase(),
      state:
        "reserved",
      createdAt:
        new Date()
          .toISOString(),
      updatedAt:
        new Date()
          .toISOString(),
    };

    let fd;

    try {
      fd =
        fs.openSync(
          file,
          "wx",
          0o600,
        );
      fs.writeFileSync(
        fd,
        `${JSON.stringify(
          record,
          null,
          2,
        )}\n`,
      );
      fs.fsyncSync(fd);
      fs.closeSync(fd);
      fd = undefined;

      return {
        created: true,
        record,
      };
    } catch (error) {
      if (
        fd !== undefined
      ) {
        try {
          fs.closeSync(fd);
        } catch {}
      }

      if (
        error?.code ===
          "EEXIST"
      ) {
        const existing =
          this.read(key);

        return {
          created: false,
          record:
            existing,
        };
      }

      throw error;
    }
  }

  read(
    key,
  ) {
    const file =
      this.fileFor(key);

    if (!fs.existsSync(file)) {
      return null;
    }

    return JSON.parse(
      fs.readFileSync(
        file,
        "utf8",
      ),
    );
  }

  update(
    key,
    patch,
  ) {
    const existing =
      this.read(key);

    if (!existing) {
      throw new Error(
        "PWRC_IDEMPOTENCY_RECORD_MISSING",
      );
    }

    const next = {
      ...existing,
      ...patch,
      updatedAt:
        new Date()
          .toISOString(),
    };

    atomicWriteJsonSync(
      this.fileFor(key),
      next,
      {
        mode:
          0o600,
      },
    );

    return next;
  }

  classifyReplay({
    key,
    requestHash,
  }) {
    const existing =
      this.read(key);

    if (!existing) {
      return {
        kind:
          "missing",
        record:
          null,
      };
    }

    if (
      existing.requestHash !==
      requestHash
    ) {
      return {
        kind:
          "conflict",
        record:
          existing,
      };
    }

    if (
      TERMINAL.has(
        existing.state,
      )
    ) {
      return {
        kind:
          "terminal",
        record:
          existing,
      };
    }

    return {
      kind:
        "in-progress",
      record:
        existing,
    };
  }
}
