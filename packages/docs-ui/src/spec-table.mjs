import {
  escapeHtml,
} from "./escape.mjs";

export function renderSpecTable({
  rows = [],
}) {
  return `
    <div class="spec-table-wrap">
      <table class="spec-table">
        <tbody>
          ${rows
            .map(
              ([label, value]) => `
                <tr>
                  <th>${escapeHtml(label)}</th>
                  <td>${escapeHtml(value)}</td>
                </tr>
              `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}
