import {
  escapeHtml,
} from "./escape.mjs";

export function renderCallout({
  title,
  body,
  tone = "info",
}) {
  return `
    <aside class="callout callout-${escapeHtml(tone)}">
      <div class="callout-mark" aria-hidden="true"></div>
      <div>
        <strong>${escapeHtml(title)}</strong>
        <p>${escapeHtml(body)}</p>
      </div>
    </aside>
  `;
}
