import {
  escapeHtml,
} from "./escape.mjs";

export function renderDocsSidebar({
  sessions,
  activeSlug,
}) {
  return `
    <aside class="docs-sidebar" id="docs-sidebar">
      <div class="sidebar-inner">
        <div class="sidebar-search">
          <label class="sr-only" for="docs-search">Search documentation</label>
          <input id="docs-search" type="search" placeholder="Search docs…" autocomplete="off">
          <span class="search-key">/</span>
        </div>

        <nav class="sidebar-nav" aria-label="Documentation">
          <p class="sidebar-label">Documentation</p>
          ${sessions
            .map(
              (session) => `
                <a
                  href="/${escapeHtml(session.slug)}"
                  class="sidebar-link${session.slug === activeSlug ? " is-active" : ""}"
                  data-doc-title="${escapeHtml(session.title.toLowerCase())}"
                >
                  <span class="sidebar-icon" aria-hidden="true">${escapeHtml(session.icon ?? "•")}</span>
                  <span>
                    <strong>${escapeHtml(session.title)}</strong>
                    <small>${escapeHtml(session.description)}</small>
                  </span>
                </a>
              `,
            )
            .join("")}
        </nav>

        <div class="sidebar-meta">
          <span>PowerChain 1.0.0</span>
          <span>Technical Docs</span>
        </div>
      </div>
    </aside>
  `;
}
