const root =
  document.documentElement;

const themeToggle =
  document.querySelector(
    "#theme-toggle",
  );

const mobileToggle =
  document.querySelector(
    "#mobile-nav-toggle",
  );

const sidebar =
  document.querySelector(
    "#docs-sidebar",
  );

const search =
  document.querySelector(
    "#docs-search",
  );

function currentTheme() {
  return root.dataset.theme ??
    localStorage.getItem(
      "pwrc.docs.theme",
    ) ??
    (
      matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches
        ? "dark"
        : "light"
    );
}

function applyTheme(
  theme,
) {
  root.dataset.theme =
    theme;

  localStorage.setItem(
    "pwrc.docs.theme",
    theme,
  );

  if (themeToggle) {
    themeToggle.textContent =
      theme === "dark"
        ? "☀"
        : "◐";
  }
}

applyTheme(
  currentTheme(),
);

themeToggle?.addEventListener(
  "click",
  () => {
    applyTheme(
      currentTheme() ===
        "dark"
        ? "light"
        : "dark",
    );
  },
);

mobileToggle?.addEventListener(
  "click",
  () => {
    sidebar?.classList.toggle(
      "is-open",
    );
  },
);

search?.addEventListener(
  "input",
  () => {
    const query =
      search.value
        .trim()
        .toLowerCase();

    for (
      const link of
      document.querySelectorAll(
        ".sidebar-link",
      )
    ) {
      const title =
        link.dataset
          .docTitle ??
        "";

      link.hidden =
        Boolean(query) &&
        !title.includes(
          query,
        );
    }
  },
);

window.addEventListener(
  "keydown",
  (event) => {
    if (
      event.key === "/" &&
      document.activeElement !==
        search
    ) {
      event.preventDefault();
      search?.focus();
    }

    if (
      event.key ===
        "Escape"
    ) {
      sidebar?.classList.remove(
        "is-open",
      );
      search?.blur();
    }
  },
);

for (
  const anchor of
  document.querySelectorAll(
    ".docs-toc a",
  )
) {
  anchor.addEventListener(
    "click",
    () => {
      for (
        const item of
        document.querySelectorAll(
          ".docs-toc a",
        )
      ) {
        item.classList.remove(
          "is-active",
        );
      }

      anchor.classList.add(
        "is-active",
      );
    },
  );
}
