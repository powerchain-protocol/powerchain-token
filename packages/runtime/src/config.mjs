import fs from "node:fs";
import path from "node:path";
import {
  assertRepositoryRelativePath,
} from "./paths.mjs";

export function resolveRepositoryFile(
  file,
  {
    root =
      process.cwd(),
    rejectSymlink =
      true,
  } = {},
) {
  const relative =
    assertRepositoryRelativePath(
      file,
    );

  const absoluteRoot =
    path.resolve(root);

  const absolute =
    path.resolve(
      absoluteRoot,
      relative,
    );

  if (
    absolute !==
      absoluteRoot &&
    !absolute.startsWith(
      `${absoluteRoot}${path.sep}`,
    )
  ) {
    throw new Error(
      "POWERCHAIN_CONFIG_PATH_ESCAPE",
    );
  }

  if (
    rejectSymlink &&
    fs.existsSync(absolute) &&
    fs.lstatSync(
      absolute,
    ).isSymbolicLink()
  ) {
    throw new Error(
      `POWERCHAIN_CONFIG_SYMLINK_FORBIDDEN:${file}`,
    );
  }

  return absolute;
}

export function readJsonFileSync(
  file,
  {
    required = true,
    root =
      process.cwd(),
    rejectSymlink =
      true,
  } = {},
) {
  const absolute =
    resolveRepositoryFile(
      file,
      {
        root,
        rejectSymlink,
      },
    );

  if (!fs.existsSync(absolute)) {
    if (!required) {
      return undefined;
    }

    throw new Error(
      `POWERCHAIN_CONFIG_MISSING:${file}`,
    );
  }

  let value;

  try {
    value =
      JSON.parse(
        fs.readFileSync(
          absolute,
          "utf8",
        ),
      );
  } catch (error) {
    throw new Error(
      `POWERCHAIN_CONFIG_JSON_INVALID:${file}`,
      {
        cause: error,
      },
    );
  }

  return value;
}

export function assertPlainObject(
  value,
  label = "config",
) {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    throw new Error(
      `POWERCHAIN_CONFIG_OBJECT_REQUIRED:${label}`,
    );
  }

  return value;
}

export function requireKeys(
  value,
  keys,
  label = "config",
) {
  assertPlainObject(
    value,
    label,
  );

  for (const key of keys) {
    if (
      !Object.prototype
        .hasOwnProperty
        .call(
          value,
          key,
        )
    ) {
      throw new Error(
        `POWERCHAIN_CONFIG_KEY_REQUIRED:${label}.${key}`,
      );
    }
  }

  return value;
}

export function assertExactVersion(
  value,
  label = "config",
) {
  if (
    value?.version !==
      "1.0.0"
  ) {
    throw new Error(
      `POWERCHAIN_CONFIG_VERSION_INVALID:${label}`,
    );
  }

  return value;
}
