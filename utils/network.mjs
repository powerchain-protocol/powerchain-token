export function assertHttpsUrl(
  value,
  label = "url",
) {
  let url;

  try {
    url =
      new URL(value);
  } catch {
    throw new Error(
      `${label}:invalid-url`,
    );
  }

  if (
    url.protocol !== "https:" ||
    !url.hostname ||
    url.username ||
    url.password ||
    url.hash ||
    /[\u0000-\u001f\u007f]/.test(
      value,
    )
  ) {
    throw new Error(
      `${label}:https-url-required`,
    );
  }

  return url
    .toString()
    .replace(
      /\/$/,
      "",
    );
}

export function assertIndependentRpcUrls(
  primary,
  secondary,
  label = "rpc",
) {
  const first =
    new URL(
      assertHttpsUrl(
        primary,
        `${label}.primary`,
      ),
    );

  const second =
    new URL(
      assertHttpsUrl(
        secondary,
        `${label}.secondary`,
      ),
    );

  if (
    first.hostname
      .toLowerCase() ===
    second.hostname
      .toLowerCase()
  ) {
    throw new Error(
      `${label}:independent-hosts-required`,
    );
  }

  return {
    primary:
      first.toString()
        .replace(/\/$/, ""),
    secondary:
      second.toString()
        .replace(/\/$/, ""),
  };
}
