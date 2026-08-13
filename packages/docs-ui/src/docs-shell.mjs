import {
  escapeHtml,
} from "./escape.mjs";
import {
  renderDocsSidebar,
} from "./docs-sidebar.mjs";
import {
  renderDocsToc,
} from "./docs-toc.mjs";
import {
  renderDocsSection,
} from "./docs-section.mjs";

export function renderDocsShell({
  session,
  sessions,
}) {
  const sections =
    session.sections ?? [];

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <meta name="description" content="${escapeHtml(session.description)}">
  <title>${escapeHtml(session.title)} · PowerChain Docs</title>
  <link rel="stylesheet" href="/assets/docs.css">
</head>
<body>
  <div class="docs-app">
    <header class="docs-header">
      <div class="header-brand">
        <a href="/technology" class="brand-mark" aria-label="PowerChain documentation home">P</a>
        <div>
          <a href="/technology" class="brand-name">PowerChain</a>
          <span class="brand-subtitle">Docs</span>
        </div>
      </div>

      <div class="header-actions">
        <a class="header-link" href="https://powerchain.energy">Website</a>
        <a class="header-link" href="https://bridge.powerchain.energy">Bridge</a>
        <button class="theme-toggle" id="theme-toggle" type="button" aria-label="Toggle theme">◐</button>
        <button class="mobile-nav-toggle" id="mobile-nav-toggle" type="button" aria-label="Open documentation navigation">☰</button>
      </div>
    </header>

    <div class="docs-layout">
      ${renderDocsSidebar({
        sessions,
        activeSlug:
          session.slug,
      })}

      <main class="docs-content">
        <div class="docs-breadcrumbs">
          <a href="/technology">Docs</a>
          <span>/</span>
          <span>${escapeHtml(session.title)}</span>
        </div>

        <article>
          <header class="page-header">
            <div class="page-kicker">${escapeHtml(session.category ?? "PowerChain Technology")}</div>
            <h1>${escapeHtml(session.title)}</h1>
            <p>${escapeHtml(session.description)}</p>
            <div class="page-meta">
              <span>Version 1.0.0</span>
              <span>${sections.length} sections</span>
              <span>Production-oriented</span>
            </div>
          </header>

          ${sections
            .map(
              renderDocsSection,
            )
            .join("")}
        </article>

        <footer class="docs-footer">
          <div>
            <strong>PowerChain Documentation</strong>
            <p>Technical architecture, protocol policy and implementation guidance.</p>
          </div>
          <div class="footer-links">
            <a href="https://docs.powerchain.energy">Documentation</a>
            <a href="https://whitepaper.powerchain.energy">Whitepaper</a>
          </div>
        </footer>
      </main>

      ${renderDocsToc({
        sections,
      })}
    </div>
  </div>

  <script type="module" src="/assets/docs.js"></script>
</body>
</html>`;
}
