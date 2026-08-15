const SCALE = 1_000_000_000n;
const MAX_SUPPLY_BASE_UNITS = 18_446_000_000_000_000_000n;
const REQUEST_TIMEOUT_MS = 8_000;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const amount = $("#amount");
const operation = $("#operation");
const result = $("#result");
const quoteButton = $("#quote-button");
const refreshButton = $("#refresh-overview");

function groupIntegerString(value) {
  const sign = value.startsWith("-") ? "-" : "";
  const digits = sign ? value.slice(1) : value;
  return sign + digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function baseUnits(value) {
  const trimmed = value.trim();
  if (!/^(0|[1-9]\d*)(?:\.\d{0,9})?$/.test(trimmed)) {
    throw new Error("Enter a valid PWRC amount with up to 9 decimals.");
  }

  const [whole, fraction = ""] = trimmed.split(".");
  const units =
    BigInt(whole) * SCALE +
    BigInt(fraction.padEnd(9, "0") || "0");

  if (units <= 0n) {
    throw new Error("Amount must be greater than zero.");
  }

  if (units > MAX_SUPPLY_BASE_UNITS) {
    throw new Error("Amount exceeds the fixed PWRC supply.");
  }

  return units;
}

function formatUnits(value, maximumFractionDigits = 6) {
  const units = BigInt(value);
  const whole = units / SCALE;
  const remainder = (units % SCALE).toString().padStart(9, "0");
  const fraction = remainder
    .slice(0, maximumFractionDigits)
    .replace(/0+$/, "");

  return `${groupIntegerString(whole.toString())}${fraction ? "." + fraction : ""} PWRC`;
}

function compactIntegerString(value) {
  const units = BigInt(String(value));
  const thresholds = [
    [1_000_000_000n, "B"],
    [1_000_000n, "M"],
    [1_000n, "K"],
  ];

  for (const [threshold, suffix] of thresholds) {
    if (units >= threshold) {
      const scaled = (units * 1000n) / threshold;
      const whole = scaled / 1000n;
      const fraction = (scaled % 1000n)
        .toString()
        .padStart(3, "0")
        .replace(/0+$/, "");
      return `${whole}${fraction ? "." + fraction : ""}${suffix}`;
    }
  }

  return groupIntegerString(units.toString());
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[character]));
}

function formatRefreshTime(value = new Date()) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(value);
}

function shortHash(value, size = 8) {
  if (!value) return "—";
  return value.length > size * 2 + 1
    ? `${value.slice(0, size)}…${value.slice(-size)}`
    : value;
}

function showToast(message, tone = "success") {
  const region = $("#toast-region");
  const toast = document.createElement("div");
  toast.className = `toast ${tone}`;
  toast.textContent = message;
  region.appendChild(toast);
  window.setTimeout(() => toast.remove(), 2200);
}

async function getJson(url, { timeoutMs = REQUEST_TIMEOUT_MS } = {}) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      headers: { accept: "application/json" },
      signal: controller.signal,
      cache: "no-store",
    });

    let body;
    try {
      body = await response.json();
    } catch {
      throw new Error("The API returned an invalid response.");
    }

    if (!response.ok) {
      throw new Error(
        body.errorCode ??
        body.error ??
        `Request failed (${response.status})`,
      );
    }

    return body;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("The API request timed out. Try again.");
    }
    throw error;
  } finally {
    window.clearTimeout(timer);
  }
}

function setTheme(theme, { persist = true } = {}) {
  document.documentElement.dataset.theme = theme;

  if (persist) {
    try {
      localStorage.setItem("powerchain.theme", theme);
    } catch {}
  }

  const button = $("#theme");
  const icon = button?.querySelector(".theme-icon");
  const nextTheme = theme === "dark" ? "light" : "dark";

  if (button) {
    button.setAttribute(
      "aria-label",
      `Switch to ${nextTheme} theme`,
    );
    button.title = `Switch to ${nextTheme} theme`;
  }

  if (icon) {
    icon.textContent = theme === "dark" ? "☀" : "☾";
  }

  const meta = document.querySelector('meta[name="theme-color"]');
  meta?.setAttribute(
    "content",
    theme === "dark" ? "#070a10" : "#07142d",
  );
}

function initializeTheme() {
  let stored = null;
  try {
    stored = localStorage.getItem("powerchain.theme");
  } catch {}

  const preferredDark =
    window.matchMedia?.("(prefers-color-scheme: dark)").matches;

  setTheme(
    stored === "dark" || (!stored && preferredDark) ? "dark" : "light",
    { persist: false },
  );
}

function setTokenLoading(loading) {
  const status = $("#token-status");
  if (loading) {
    status.className = "status-pill status-loading";
    status.innerHTML = '<span class="status-dot" aria-hidden="true"></span> Loading';
  }
}

async function loadToken() {
  setTokenLoading(true);

  try {
    const token = await getJson("/api/v1/token");

    $("#mint").textContent = token.mint;
    $("#policy-sha").textContent = shortHash(
      token.tokenPolicySha256 ?? token.policySha256,
      10,
    );
    $("#policy-sha").title =
      token.tokenPolicySha256 ?? token.policySha256 ?? "";

    $("#supply").textContent =
      compactIntegerString(token.genesisSupplyTokens);
    $("#decimals").textContent = String(token.decimals);
    $("#native-fee").textContent =
      `${token.nativeTransferFeeBps / 100}%`;
    $("#fee-cap").textContent =
      compactIntegerString(token.nativeTransferFeeCapTokens);

    for (const id of ["supply", "decimals", "native-fee", "fee-cap"]) {
      $(`#${id}`).classList.remove("skeleton");
    }

    const status = $("#token-status");
    status.className = "status-pill ready";
    status.innerHTML =
      '<span class="status-dot" aria-hidden="true"></span> Canonical';

    $("#api-status").innerHTML =
      '<span class="mini-dot success"></span> Available';
    return true;
  } catch (error) {
    const status = $("#token-status");
    status.className = "status-pill error";
    status.innerHTML =
      '<span class="status-dot" aria-hidden="true"></span> Unavailable';

    $("#api-status").innerHTML =
      '<span class="mini-dot danger"></span> Unavailable';

    for (const id of ["supply", "decimals", "native-fee", "fee-cap"]) {
      $(`#${id}`).classList.remove("skeleton");
      $(`#${id}`).textContent = "—";
    }

    showToast(error.message, "error");
    return false;
  }
}

function assetCard(asset) {
  const role = asset.canonical ? "Canonical" : "Wrapped";
  const supply = asset.canonical
    ? asset.supplyBaseUnits
      ? formatUnits(asset.supplyBaseUnits, 0)
      : "Fixed"
    : asset.genesisSupplyBaseUnits === "0"
      ? "0 at genesis"
      : "Wrapped";

  const symbolMark = asset.symbol === "wPWRC" ? "wP" : "PW";
  const chainLabel =
    asset.chain === "solana" ? "Solana" :
    asset.chain === "sui" ? "Sui" :
    asset.chain;

  return `
    <article class="card asset">
      <div class="asset-header">
        <div class="asset-title-row">
          <div class="asset-symbol-mark" aria-hidden="true">${escapeHtml(symbolMark)}</div>
          <div>
            <div class="asset-name">${escapeHtml(asset.name)}</div>
            <div class="asset-meta">${escapeHtml(chainLabel)} · ${escapeHtml(asset.network)} · ${escapeHtml(asset.standard)}</div>
          </div>
        </div>
        <span class="pill">${escapeHtml(role)}</span>
      </div>

      <div class="asset-detail">
        <div class="kv">
          <div class="label">Symbol</div>
          <div class="value">${escapeHtml(asset.symbol)}</div>
        </div>
        <div class="kv">
          <div class="label">Decimals</div>
          <div class="value">${escapeHtml(asset.decimals)}</div>
        </div>
        <div class="kv">
          <div class="label">${asset.canonical ? "Supply" : "Genesis supply"}</div>
          <div class="value">${escapeHtml(supply)}</div>
        </div>
        <div class="kv">
          <div class="label">Policy-bound</div>
          <div class="value">Yes</div>
        </div>
      </div>

      <div class="asset-footer">
        <span class="pill">${asset.publicWrites === false ? "Read-only" : "Runtime"}</span>
        <a class="text-link asset-link" href="/api/v1/assets/${encodeURIComponent(asset.symbol)}">View JSON →</a>
      </div>
    </article>`;
}

async function loadAssets() {
  const grid = $("#assets-grid");
  grid.setAttribute("aria-busy", "true");

  try {
    const registry = await getJson("/api/v1/assets");
    $("#asset-count").textContent = `${registry.count} assets`;
    grid.innerHTML = registry.assets.map(assetCard).join("");
  } catch (error) {
    $("#asset-count").textContent = "Unavailable";
    grid.innerHTML = `
      <div class="card message error">
        <strong>Asset registry unavailable.</strong><br>
        ${escapeHtml(error.message)}
        <div class="message-actions">
          <button class="retry-link" type="button" data-retry-assets>Try again</button>
        </div>
      </div>`;
  } finally {
    grid.setAttribute("aria-busy", "false");
  }
}

async function loadReleaseStatus() {
  try {
    const release = await getJson("/api/v1/release/status", { timeoutMs: 6_000 });
    const state =
      release.releaseState ??
      release.state ??
      release.mainnet?.releaseState ??
      "SOURCE_READY";
    $("#release-state").textContent = state;
  } catch {
    $("#release-state").textContent = "Unknown";
  }
}


async function loadSafetyPolicy() {
  const grid = $("#safety-grid");
  const status = $("#safety-status");

  grid?.setAttribute(
    "aria-busy",
    "true",
  );

  try {
    const policy = await getJson(
      "/api/v1/token/transfer-policy",
      {
        timeoutMs:
          6_000,
      },
    );

    const preflightReady =
      policy.preflight?.sourceAtaValidation ===
        true &&
      policy.preflight?.destinationAtaValidation ===
        true &&
      policy.preflight?.tokenBalanceValidation ===
        true;
    const simulationReady =
      policy.preflight?.simulationSupported ===
        true;
    const reportReady =
      policy.preflight?.reportCommitmentSha256 ===
        true &&
      policy.preflight?.observedSlotBound ===
        true &&
      policy.preflight?.observedAtBound ===
        true;
    const walletOwned =
      policy.signing?.walletOwned ===
        true &&
      policy.signing?.serverPrivateKeys ===
        false &&
      policy.transactionSubmission?.sdkIncluded ===
        false &&
      policy.publicWrites ===
        false;

    const values = [
      [
        "#safety-preflight",
        preflightReady,
        "Policy enabled",
      ],
      [
        "#safety-simulation",
        simulationReady,
        "Read-only supported",
      ],
      [
        "#safety-report",
        reportReady,
        policy.preflight?.maxReportAgeSeconds
          ? `${policy.preflight.maxReportAgeSeconds}s freshness`
          : "SHA-256 bound",
      ],
      [
        "#safety-wallet",
        walletOwned,
        "Wallet / app owned",
      ],
    ];

    for (
      const [
        selector,
        ready,
        label,
      ] of values
    ) {
      const element =
        $(selector);
      if (!element) continue;

      element.textContent =
        ready
          ? label
          : "Unavailable";
      element.className =
        `safety-value ${ready ? "ready" : "warn"}`;
    }

    if (status) {
      status.className =
        "pill status-pill ready";
      status.innerHTML =
        '<span class="mini-dot success" aria-hidden="true"></span> Policy active';
    }

    return true;
  } catch {
    for (
      const selector of [
        "#safety-preflight",
        "#safety-simulation",
        "#safety-report",
        "#safety-wallet",
      ]
    ) {
      const element =
        $(selector);
      if (!element) continue;

      element.textContent =
        "Unavailable";
      element.className =
        "safety-value warn";
    }

    if (status) {
      status.className =
        "pill status-pill error";
      status.innerHTML =
        '<span class="mini-dot danger" aria-hidden="true"></span> Unavailable';
    }

    return false;
  } finally {
    grid?.setAttribute(
      "aria-busy",
      "false",
    );
  }
}

function validateAmount({ announce = false } = {}) {
  const status = $("#amount-validity");

  try {
    baseUnits(amount.value);
    amount.classList.remove("invalid");
    amount.setAttribute("aria-invalid", "false");
    status.textContent = announce ? "Valid amount" : "";
    status.className = "field-status valid";
    quoteButton.disabled = false;
    return true;
  } catch (error) {
    amount.classList.add("invalid");
    amount.setAttribute("aria-invalid", "true");
    status.textContent = error.message;
    status.className = "field-status invalid";
    quoteButton.disabled = true;
    return false;
  }
}

function setQuoteState(state, summary) {
  const badge = $("#quote-state");
  badge.className = `quote-state ${state}`;
  badge.textContent =
    state === "loading" ? "Calculating" :
    state === "success" ? "Ready" :
    state === "error" ? "Error" :
    "Ready";

  $("#quote-summary").textContent = summary;
}

async function quote() {
  if (!validateAmount({ announce: true })) return;

  quoteButton.disabled = true;
  quoteButton.innerHTML =
    '<span class="button-spinner" aria-hidden="true">↻</span> Calculating…';
  setQuoteState("loading", "Calculating exact fees…");
  result.innerHTML =
    '<div class="message">Calculating a canonical, policy-bound quote…</div>';

  try {
    const units = baseUnits(amount.value);
    const q = await getJson(
      `/api/v1/fees/quote?amountBaseUnits=${units}&operation=${encodeURIComponent(operation.value)}`,
    );

    const rows = [
      ["Principal", formatUnits(q.principalGrossBaseUnits)],
      ["Native Token-2022 fee", formatUnits(q.nativeTransferFeeBaseUnits)],
      ["Principal net", formatUnits(q.principalNetBaseUnits)],
      ["PowerChain service fee", formatUnits(q.serviceFeeNetBaseUnits)],
      ["Native fee on service transfer", formatUnits(q.serviceFeeTransferNativeFeeBaseUnits)],
    ];

    result.innerHTML =
      rows
        .map(([label, value]) =>
          `<div class="fee"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`,
        )
        .join("") +
      `<div class="fee total"><span>Total PWRC debit</span><strong>${escapeHtml(formatUnits(q.totalWalletPwrcDebitBaseUnits))}</strong></div>` +
      `<div class="quote-meta">
        <div class="quote-meta-row"><span>Policy</span><code title="${escapeHtml(q.tokenPolicySha256 ?? "")}">${escapeHtml(shortHash(q.tokenPolicySha256 ?? q.policySha256 ?? "", 7))}</code></div>
        <div class="quote-meta-row"><span>Fingerprint</span><code title="${escapeHtml(q.quoteFingerprint ?? "")}">${escapeHtml(shortHash(q.quoteFingerprint ?? "", 7))}</code></div>
      </div>`;

    setQuoteState("success", `${amount.value} PWRC · exact quote`);
  } catch (error) {
    result.innerHTML =
      `<div class="message error">
        <strong>Unable to calculate quote.</strong><br>
        ${escapeHtml(error.message)}
        <div class="message-actions">
          <button class="retry-link" type="button" data-retry-quote>Try again</button>
        </div>
      </div>`;
    setQuoteState("error", "Quote unavailable");
  } finally {
    quoteButton.disabled = !validateAmount();
    quoteButton.innerHTML =
      'Calculate fees <span aria-hidden="true">→</span>';
  }
}

async function refreshOverview() {
  refreshButton.classList.add("loading");
  refreshButton.disabled = true;

  for (const id of ["supply", "decimals", "native-fee", "fee-cap"]) {
    $(`#${id}`).classList.add("skeleton");
  }

  try {
    await Promise.allSettled([
      loadToken(),
      loadAssets(),
      loadReleaseStatus(),
      loadSafetyPolicy(),
    ]);

    const refreshed =
      $("#last-refresh");
    if (refreshed) {
      refreshed.textContent =
        formatRefreshTime();
    }
  } finally {
    refreshButton.classList.remove("loading");
    refreshButton.disabled = false;
  }
}

document.addEventListener("click", async (event) => {
  const copy = event.target.closest("[data-copy]");
  if (copy) {
    const target = $(copy.dataset.copy);
    try {
      await navigator.clipboard.writeText(target.textContent.trim());
      showToast("Copied to clipboard");
      const original = copy.textContent;
      copy.textContent = "Copied";
      window.setTimeout(() => { copy.textContent = original; }, 1200);
    } catch {
      showToast("Clipboard access unavailable", "error");
    }
    return;
  }

  const quickAmount = event.target.closest("[data-amount]");
  if (quickAmount) {
    amount.value = quickAmount.dataset.amount;
    validateAmount();
    amount.focus();
    return;
  }

  if (event.target.closest("[data-retry-assets]")) {
    await loadAssets();
    return;
  }

  if (event.target.closest("[data-retry-quote]")) {
    await quote();
  }
});

$("#theme").addEventListener("click", () => {
  setTheme(
    document.documentElement.dataset.theme === "dark" ? "light" : "dark",
  );
});

quoteButton.addEventListener("click", quote);
refreshButton.addEventListener("click", refreshOverview);

amount.addEventListener("input", () => validateAmount());
amount.addEventListener("blur", () => validateAmount({ announce: true }));
amount.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !quoteButton.disabled) {
    quote();
  }
});

operation.addEventListener("change", () => {
  if ($("#quote-state").classList.contains("success")) {
    setQuoteState("neutral", "Operation changed · recalculate");
  }
});

const navObserver = "IntersectionObserver" in window
  ? new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;

        $$("[data-nav]").forEach((link) => {
          link.classList.toggle(
            "active",
            link.dataset.nav === visible.target.id,
          );
        });

        $$(".mobile-actions a").forEach((link) => {
          link.classList.toggle(
            "active",
            link.getAttribute("href") ===
              `#${visible.target.id}`,
          );
        });
      },
      { rootMargin: "-25% 0px -60% 0px", threshold: [0, .2, .5] },
    )
  : null;

for (const id of ["overview", "assets", "safety", "quote"]) {
  const section = document.getElementById(id);
  if (section && navObserver) navObserver.observe(section);
}

const systemTheme =
  window.matchMedia?.(
    "(prefers-color-scheme: dark)",
  );

systemTheme?.addEventListener?.(
  "change",
  (event) => {
    let stored = null;
    try {
      stored =
        localStorage.getItem(
          "powerchain.theme",
        );
    } catch {}

    if (!stored) {
      setTheme(
        event.matches
          ? "dark"
          : "light",
        {
          persist:
            false,
        },
      );
    }
  },
);

window.addEventListener(
  "offline",
  () => {
    const status =
      $("#api-status");
    if (status) {
      status.innerHTML =
        '<span class="mini-dot danger"></span> Offline';
    }
    showToast(
      "Network connection unavailable",
      "error",
    );
  },
);

window.addEventListener(
  "online",
  () => {
    refreshOverview();
  },
);

initializeTheme();
validateAmount();

Promise.allSettled([
  loadToken(),
  loadAssets(),
  loadReleaseStatus(),
  loadSafetyPolicy(),
]).finally(() => {
  const refreshed =
    $("#last-refresh");
  if (refreshed) {
    refreshed.textContent =
      formatRefreshTime();
  }
});
