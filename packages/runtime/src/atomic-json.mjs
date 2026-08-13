import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

function fsyncDirectoryBestEffort(
  directory,
) {
  let fd;

  try {
    fd =
      fs.openSync(
        directory,
        "r",
      );
    fs.fsyncSync(fd);
  } catch {
    // Directory fsync is unsupported on some platforms/filesystems.
  } finally {
    if (fd !== undefined) {
      try {
        fs.closeSync(fd);
      } catch {}
    }
  }
}

export function atomicWriteFileSync(
  file,
  content,
  options = {},
) {
  if (
    typeof file !== "string" ||
    !file ||
    file.includes("\0")
  ) {
    throw new Error(
      "POWERCHAIN_ATOMIC_FILE_PATH_INVALID",
    );
  }

  const directory =
    path.dirname(file);

  fs.mkdirSync(
    directory,
    {
      recursive: true,
    },
  );

  const mode =
    options.mode ??
    0o600;

  if (
    !Number.isInteger(mode) ||
    mode < 0 ||
    mode > 0o777
  ) {
    throw new Error(
      "POWERCHAIN_ATOMIC_FILE_MODE_INVALID",
    );
  }

  if (
    fs.existsSync(file) &&
    fs.lstatSync(file)
      .isDirectory()
  ) {
    throw new Error(
      "POWERCHAIN_ATOMIC_FILE_DESTINATION_IS_DIRECTORY",
    );
  }

  const temporary =
    path.join(
      directory,
      `.${path.basename(file)}.${process.pid}.${crypto
        .randomBytes(12)
        .toString("hex")}.tmp`,
    );

  let fd;

  try {
    fd =
      fs.openSync(
        temporary,
        "wx",
        mode,
      );

    fs.writeFileSync(
      fd,
      content,
    );
    fs.fsyncSync(fd);
    fs.closeSync(fd);
    fd = undefined;

    fs.renameSync(
      temporary,
      file,
    );

    fsyncDirectoryBestEffort(
      directory,
    );
  } catch (error) {
    if (fd !== undefined) {
      try {
        fs.closeSync(fd);
      } catch {}
    }

    try {
      fs.unlinkSync(
        temporary,
      );
    } catch {}

    throw error;
  }
}

export function atomicWriteJsonSync(
  file,
  value,
  options = {},
) {
  atomicWriteFileSync(
    file,
    `${JSON.stringify(
      value,
      null,
      2,
    )}\n`,
    options,
  );
}
