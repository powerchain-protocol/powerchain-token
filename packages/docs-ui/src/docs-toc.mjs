import {
  escapeHtml,
  slugify,
} from "./escape.mjs";

export function renderDocsToc({
  sections,
}) {
  return `
    <aside class="docs-toc" aria-label="On this page">
      <div class="toc-inner">
        <p class="toc-label">On this page</p>
        ${sections
          .map(
            (section) => {
              const id =
                section.id ??
                slugify(
                  section.title,
                );

              return `<a href="#${escapeHtml(id)}">${escapeHtml(section.title)}</a>`;
            },
          )
          .join("")}
      </div>
    </aside>
  `;
}
