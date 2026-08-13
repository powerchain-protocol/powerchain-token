import {
  escapeHtml,
} from "./escape.mjs";

export function renderCodeBlock({
  code,
  language = "text",
  label,
}) {
  const caption =
    label
      ? `<div class="code-label">${escapeHtml(label)}</div>`
      : "";

  return `
    <div class="code-shell">
      ${caption}
      <pre class="code-block" data-language="${escapeHtml(language)}"><code>${escapeHtml(code)}</code></pre>
    </div>
  `;
}
