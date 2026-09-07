# AGENTS.md — working notes for code agents on this repo

## Rules

- Do not rewrite git history (no force pushes, no rebasing/amending pushed commits).
- `src/routes/` uses TanStack Router file-based routing; `routeTree.gen.ts` is generated.
- Backend logic goes in `src/server/` as TanStack Start server functions; client
  code must not import from `src/server/team/*` model internals directly — use the
  server functions or the shared types in `src/server/team/types.ts`.
- Preserve the "Kinetic Editorial" design language defined in `src/styles.css`
  (bone/ink palette, cobalt primary, acid highlight, IBM Plex Mono labels,
  Bricolage Grotesque display type, sharp 0-radius corners, offset shadows).
- Team member data must come from `src/data/teams.json` via `src/server/team/`.
  Never fabricate member names, bios, or links; use "To be announced" placeholders.
