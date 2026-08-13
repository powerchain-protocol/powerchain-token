import path from "node:path";

export function normalizeRepositoryPath(
  value,
) {
  return value
    .replaceAll(
      path.sep,
      "/",
    )
    .replace(
      /^\.\//,
      "",
    );
}

export function assertRepositoryRelativePath(
  value,
) {
  if (
    typeof value !== "string" ||
    !value ||
    path.isAbsolute(value) ||
    value.includes("\0")
  ) {
    throw new Error(
      "POWERCHAIN_REPOSITORY_PATH_INVALID",
    );
  }

  const normalized =
    path.normalize(value);

  if (
    normalized === ".." ||
    normalized.startsWith(
      `..${path.sep}`,
    )
  ) {
    throw new Error(
      "POWERCHAIN_REPOSITORY_PATH_ESCAPE",
    );
  }

  return normalized;
}
