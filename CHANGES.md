# What changed

## 1. Cursor bug fixed
`CustomCursor.tsx` set `style={{ opacity: 0 }}` on the cursor orb/ring and never
cleared it — the custom cursor was permanently invisible everywhere. It now
reveals itself the instant it gets a real mouse position.

## 2. New color theme — "Aurora"
Replaced the black/cyan theme with a deep violet background and a
violet → fuchsia → amber gradient (see `--color-*` variables at the top of
`src/index.css`). This touched every page and component — all old cyan/green
hex codes and Tailwind color classes were remapped consistently. The page
background is now a layered radial gradient instead of flat black.

## 3. Full-screen 3D intro (`src/components/IntroSplash.tsx`)
On first load of the homepage, particles assemble into a rotating wireframe
core while the "ITSA" wordmark and tagline fade in, then everything explodes
outward and fades to reveal the real site. Includes a "Skip Intro" button.
It plays once per page load (not on every in-app navigation back to `/`) —
see `src/lib/introState.ts`.

## 4. New 3D background everywhere (`src/components/ParticleNetwork.tsx`)
Completely rewritten: instead of flat glowing dots, it's now a field of
low-poly wireframe crystals with soft glow sprites, linked by aurora-colored
energy lines, in front of a subtle starfield. Mouse-interactive. Same
component name/props as before, so it automatically applies to every page
that already used it (Home, About, Team, Events, Achievements, Gallery,
Contact).

## 5. More 3D interactivity
- Team page: Head of Department and Faculty cards now use `TiltCard` (3D
  hover tilt), matching the Events page.
- Achievements timeline cards also wrapped in `TiltCard`.
- Fixed `.tilt-card` in `index.css` (missing `position: relative`, which
  meant the hover glare on tilt cards wasn't actually visible before).
- Fixed a pre-existing bug in `Events.tsx` where a stray space inside a
  Tailwind arbitrary-value class (`shadow-[0_0_16px_rgba(...)]`) silently
  broke that utility.

## Running it
```
npm install
npm run dev       # local dev server
npm run build     # production build
```

I wasn't able to run `npm install` or a build in this sandbox (no network
access), so please run a quick `npm run dev` and `npm run build` yourself
before deploying — everything was written and reviewed carefully by hand,
but I couldn't execute a compiler to catch typos automatically. If
`npm run build` throws anything, paste me the error and I'll fix it
immediately.
