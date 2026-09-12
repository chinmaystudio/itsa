# ITSA — Information Technology Students' Association, PCCoE Pune

Official website of ITSA (IT Department, PCCoE, Pune), built with TanStack Start.

## Stack

- **Framework**: TanStack Start (React 19, SSR via Nitro)
- **Routing**: TanStack Router (file-based, `src/routes/`)
- **Styling**: Tailwind CSS v4 (`src/styles.css`), "Kinetic Editorial" design system
- **Animation**: `motion`
- **3D**: `three`, `@react-three/fiber`, `@react-three/drei` (Team hierarchy)
- **Server functions**: `@tanstack/react-start` (backend logic in `src/server/`)

## Commands

| Command             | Purpose                                        |
| ------------------- | ---------------------------------------------- |
| `npm run dev`       | Start dev server (http://localhost:8080)       |
| `npm run build`     | Production build (Nitro server output)         |
| `npm run preview`   | Preview the production build                   |
| `npm run lint`      | ESLint over the repo                           |
| `npm run typecheck` | TypeScript project check (`tsc --noEmit`)      |
| `npm run build:static` | Static prerender of routes (GitHub Pages)   |

## Project layout

```
src/
├── components/       UI components (effects/motion, layout chrome, ui primitives)
├── data/             Static datasets (teams.json, events, clubs, itsa facts)
├── hooks/            Shared React hooks
├── lib/              Client utilities
├── routes/           File-based routes (pages)
├── server/           Backend: team data service + server functions (API layer),
│                     SSR error-page helpers (error-page.ts, error-capture.ts)
├── router.tsx        Router factory
├── server.ts         Nitro SSR entry (error wrapper)
├── start.ts          Request middleware (CSRF + SSR error page)
└── styles.css        Tailwind theme tokens & utilities
```

## Backend layer

Team/member data is served through TanStack Start **server functions** defined in
`src/server/` (`src/server/team/`). They validate input with `zod` and return the
centralized team model from `src/server/team/model.ts`, which all Team views
(3D hierarchy, flowchart, member search, profiles) consume. Swap the underlying
dataset for a database later without touching the UI.

## Routes

| Route              | Description                                    |
| ------------------ | ---------------------------------------------- |
| `/`                | Home                                           |
| `/teams`           | Team experience (3D hierarchy / flowchart / member search) |
| `/events`          | Events archive                                 |

## Notes

- Team data lives in `src/data/teams.json` (Tenure 2025–26). Missing entries
  render an explicit "To be announced" state — do not invent members.
- `routeTree.gen.ts` is auto-generated; never edit it by hand.
