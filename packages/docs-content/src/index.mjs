import technology from "./technology.mjs";
import architecture from "./architecture.mjs";
import token from "./token.mjs";
import bridge from "./bridge.mjs";
import api from "./api.mjs";
import security from "./security.mjs";
import development from "./development.mjs";

export const docsSessions = [
  technology,
  architecture,
  token,
  bridge,
  api,
  security,
  development,
];

export const docsSessionsBySlug =
  new Map(
    docsSessions.map(
      (session) => [
        session.slug,
        session,
      ],
    ),
  );

export function getDocsSession(
  slug,
) {
  return docsSessionsBySlug.get(
    slug,
  );
}
