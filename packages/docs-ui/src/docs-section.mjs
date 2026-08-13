import {
  escapeHtml,
  slugify,
} from "./escape.mjs";
import {
  renderCodeBlock,
} from "./code-block.mjs";
import {
  renderCallout,
} from "./callout.mjs";
import {
  renderSpecTable,
} from "./spec-table.mjs";

function renderParagraphs(
  paragraphs = [],
) {
  return paragraphs
    .map(
      (paragraph) =>
        `<p>${escapeHtml(paragraph)}</p>`,
    )
    .join("");
}

function renderList(
  items = [],
) {
  if (!items.length) {
    return "";
  }

  return `
    <ul class="docs-list">
      ${items
        .map(
          (item) =>
            `<li>${escapeHtml(item)}</li>`,
        )
        .join("")}
    </ul>
  `;
}

export function renderDocsSection(
  section,
) {
  const id =
    section.id ??
    slugify(
      section.title,
    );

  return `
    <section class="docs-section" id="${escapeHtml(id)}">
      <div class="section-anchor-row">
        <h2>${escapeHtml(section.title)}</h2>
        <a class="section-anchor" href="#${escapeHtml(id)}" aria-label="Link to ${escapeHtml(section.title)}">#</a>
      </div>
      ${section.lead
        ? `<p class="section-lead">${escapeHtml(section.lead)}</p>`
        : ""}
      ${renderParagraphs(section.paragraphs)}
      ${renderList(section.items)}
      ${section.specs
        ? renderSpecTable({
            rows:
              section.specs,
          })
        : ""}
      ${section.code
        ? renderCodeBlock(
            section.code,
          )
        : ""}
      ${section.callout
        ? renderCallout(
            section.callout,
          )
        : ""}
    </section>
  `;
}
