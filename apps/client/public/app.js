const API = "";

async function api(
  path,
  options,
) {
  const response =
    await fetch(
      `${API}${path}`,
      {
        ...options,
        headers: {
          "Content-Type":
            "application/json",
          ...(options?.headers ??
            {}),
        },
      },
    );

  const body =
    await response.json();

  if (!response.ok) {
    throw new Error(
      body?.error?.code ??
      `HTTP_${response.status}`,
    );
  }

  return body;
}

function renderDl(
  element,
  entries,
) {
  element.replaceChildren();

  for (
    const [key, value]
    of entries
  ) {
    const dt =
      document.createElement(
        "dt",
      );
    const dd =
      document.createElement(
        "dd",
      );
    dt.textContent = key;
    dd.textContent =
      String(value);
    element.append(
      dt,
      dd,
    );
  }
}

async function load() {
  const [
    health,
    token,
    ready,
    capabilities,
  ] =
    await Promise.all([
      api(
        "/api/v1/health",
      ),
      api(
        "/api/v1/token",
      ),
      api(
        "/api/v1/ready",
      ),
      api(
        "/api/v1/bridge/capabilities",
      ),
    ]);

  document
    .querySelector(
      "#health",
    )
    .textContent =
      health.status;

  renderDl(
    document.querySelector(
      "#token",
    ),
    [
      [
        "Mint",
        token.token.mint,
      ],
      [
        "Decimals",
        token.token.decimals,
      ],
      [
        "Supply",
        token.token.genesisSupplyTokens,
      ],
      [
        "Transfer fee",
        `${token.token.transferFee.basisPoints} bps`,
      ],
      [
        "Fee cap",
        token.token.transferFee.maximumFeeTokens,
      ],
    ],
  );

  renderDl(
    document.querySelector(
      "#readiness",
    ),
    [
      [
        "Code",
        ready.codeReady,
      ],
      [
        "Build",
        ready.buildReady,
      ],
      [
        "Evidence",
        ready.deploymentEvidenceReady,
      ],
      [
        "Authorized",
        ready.releaseAuthorized,
      ],
      [
        "State",
        ready.releaseState,
      ],
      [
        "Mainnet",
        ready.readyForMainnet,
      ],
    ],
  );

  document
    .querySelector(
      "#capability",
    )
    .textContent =
      capabilities.execute
        ? "Bridge execution is enabled and Mainnet gates are satisfied."
        : "Quote-only mode. Execution remains fail-closed until Mainnet and executor gates are satisfied.";
}

document
  .querySelector(
    "#quote-form",
  )
  .addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();

      const output =
        document.querySelector(
          "#quote",
        );

      try {
        const result =
          await api(
            "/api/v1/bridge/quote",
            {
              method:
                "POST",
              body:
                JSON.stringify({
                  direction:
                    document
                      .querySelector(
                        "#direction",
                      )
                      .value,
                  amountBaseUnits:
                    document
                      .querySelector(
                        "#amount",
                      )
                      .value,
                }),
            },
          );

        output.textContent =
          JSON.stringify(
            result.quote,
            null,
            2,
          );
      } catch (error) {
        output.textContent =
          error instanceof Error
            ? error.message
            : "Quote failed";
      }
    },
  );

load().catch(
  (error) => {
    document
      .querySelector(
        "#health",
      )
      .textContent =
        "offline";

    document
      .querySelector(
        "#capability",
      )
      .textContent =
        error instanceof Error
          ? error.message
          : "API unavailable";
  },
);
