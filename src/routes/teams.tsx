import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Suspense, lazy, useCallback, useEffect, useState } from "react";

import { MemberProfileDialog } from "@/components/team/member-profile-dialog";
import { HierarchyChart } from "@/components/team/hierarchy-chart";
import { MemberSearch } from "@/components/team/member-search";
import { preloadHierarchy3D, scheduleHierarchy3DPreload } from "@/components/team/preload";
import { Reveal, SplitWords } from "@/components/fx/motion-primitives";
import { computeTeamStats } from "@/lib/team";
import { getTeamData } from "@/api/team";

import type { Member } from "@/server/team/types";

const Hierarchy3D = lazy(() => import("@/components/team/hierarchy-3d"));

const MODES = ["3d", "chart", "search"] as const;
type TeamMode = (typeof MODES)[number];

function isTeamMode(value: string): value is TeamMode {
  return (MODES as readonly string[]).includes(value);
}

const title = "The Team | ITSA PCCoE Pune";
const description =
  "Explore the ITSA 2025â€“26 team: an interactive 3D hierarchy, a full organisational flowchart of faculty, core and all 13 communities, and a member search. Meet the leads and executives behind ITSA at PCCoE Pune.";
const siteUrl = "https://itsa-wheat.vercel.app/teams";
const ogImage = "https://itsa-wheat.vercel.app/itsa-og-image.png";

export const Route = createFileRoute("/teams")({
  validateSearch: (search: Record<string, unknown>): { mode?: TeamMode } => {
    const mode = search["mode"];
    if (typeof mode === "string" && isTeamMode(mode)) return { mode };
    return {};
  },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:site_name", content: "ITSA PCCoE" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: siteUrl },
      { property: "og:image", content: ogImage },
      { property: "og:image:secure_url", content: ogImage },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      {
        property: "og:image:alt",
        content: "ITSA â€” Information Technology Students' Association",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: ogImage },
      {
        name: "twitter:image:alt",
        content: "ITSA â€” Information Technology Students' Association",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://res.cloudinary.com" },
      { rel: "dns-prefetch", href: "https://res.cloudinary.com" },
    ],
  }),
  component: TeamsPage,
  loader: () => getTeamData(),
});

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Landing choices â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

const CHOICES = [
  {
    mode: "3d" as const,
    index: "01",
    title: "3D Hierarchy",
    blurb:
      "Orbit a living org-chart in three dimensions. Expand ITSA TEAM into Faculty, Core and Communities, then drill into any unit.",
    meta: "Drag Â· zoom Â· tap to expand",
  },
  {
    mode: "chart" as const,
    index: "02",
    title: "Hierarchical View",
    blurb:
      "The full organisational flowchart. Expand the root into its branches and open any community to see its lead and executives.",
    meta: "Progressive tree Â· accessible",
  },
  {
    mode: "search" as const,
    index: "03",
    title: "Know a Member",
    blurb:
      "Ask for any member by first name, last name or full name and get their position, unit, year and links straight from the roster.",
    meta: "Instant Â· no AI needed",
  },
] as const;

function ChoiceCard({
  choice,
  active,
  onSelect,
  onIntent,
  index,
  reduced,
}: {
  choice: (typeof CHOICES)[number];
  active: boolean;
  onSelect: () => void;
  onIntent: () => void;
  index: number;
  reduced: boolean;
}) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      onPointerEnter={onIntent}
      onTouchStart={onIntent}
      onFocus={onIntent}
      aria-pressed={active}
      initial={reduced ? false : { opacity: 0, y: 26 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 + index * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileHover={reduced ? {} : { y: -6 }}
      className={`ink-card group relative flex h-full flex-col justify-between p-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-7 ${
        active ? "offset-shadow-primary" : "hover:offset-shadow-primary"
      }`}
    >
      <div>
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-display text-3xl font-extrabold text-primary">{choice.index}</span>
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
            {choice.meta}
          </span>
        </div>
        <h3 className="mt-5 font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          {choice.title}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{choice.blurb}</p>
      </div>
      <span className="mt-6 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground">
        {active ? "Currently open" : "Enter"}
        <span
          aria-hidden
          className="inline-block transition-transform duration-300 group-hover:translate-x-1"
        >
          â†’
        </span>
      </span>
      {active ? (
        <motion.span
          layoutId="team-choice-active"
          className="absolute inset-x-0 top-0 h-[3px] bg-primary"
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
        />
      ) : null}
    </motion.button>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

function ModeSwitcher({
  active,
  onSelect,
}: {
  active: TeamMode;
  onSelect: (mode: TeamMode) => void;
}) {
  const labels: Record<TeamMode, string> = {
    "3d": "3D Hierarchy",
    chart: "Hierarchical View",
    search: "Know a Member",
  };
  return (
    <div
      role="tablist"
      aria-label="Team experience modes"
      className="flex flex-wrap items-center gap-2"
    >
      {MODES.map((mode, i) => {
        const isActive = mode === active;
        return (
          <button
            key={mode}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(mode)}
            onPointerEnter={mode === "3d" ? preloadHierarchy3D : undefined}
            onTouchStart={mode === "3d" ? preloadHierarchy3D : undefined}
            onFocus={mode === "3d" ? preloadHierarchy3D : undefined}
            className={`inline-flex items-center gap-2 px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              isActive
                ? "bg-foreground text-background"
                : "border border-border bg-surface text-muted-foreground hover:border-foreground/40 hover:text-foreground"
            }`}
          >
            <span className={isActive ? "text-background/70" : "text-primary"}>0{i + 1}</span>
            {labels[mode]}
          </button>
        );
      })}
    </div>
  );
}

function Hierarchy3DFallback() {
  return (
    <div className="mx-auto max-w-[1600px] px-3 pb-24 pt-6 sm:px-8">
      <div className="grid h-[68vh] min-h-[440px] place-items-center border border-border bg-surface">
        <div className="text-center">
          <div className="mx-auto grid size-12 animate-pulse place-items-center border border-primary/40 bg-primary/10 font-mono text-base text-primary">
            ⟳
          </div>
          <p className="mt-4 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Warming up the 3D scene…
          </p>
        </div>
      </div>
    </div>
  );
}

function TeamsPage() {
  const navigate = useNavigate({ from: Route.fullPath });
  const reduced = Boolean(useReducedMotion());
  const modeParam = Route.useSearch({ select: (s) => s.mode });
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const tree = Route.useLoaderData();
  const stats = computeTeamStats(tree);
  const mode: TeamMode = modeParam ?? "chart";
  const isLanding = modeParam === undefined;

  const selectMode = useCallback(
    (next: TeamMode) => {
      void navigate({ search: (prev) => ({ ...prev, mode: next }) });
    },
    [navigate],
  );

  const backToLanding = useCallback(() => {
    void navigate({ search: () => ({}) });
  }, [navigate]);

  // Warm the 3D engine chunk while the browser is idle so entering the
  // 3D view never waits on the network.
  useEffect(() => {
    scheduleHierarchy3DPreload();
  }, []);

  return (
    <>
      {/* MASTHEAD */}
      <header className="relative overflow-hidden border-b border-foreground/20 px-5 pb-10 pt-28 sm:px-8 sm:pb-14 sm:pt-36">
        <div aria-hidden className="grid-paper pointer-events-none absolute inset-0 opacity-70" />
        <div className="relative mx-auto max-w-[1600px]">
          <div className="flex items-baseline gap-4">
            <span className="font-display text-[clamp(2.5rem,8vw,7rem)] font-extrabold leading-none text-primary">
              03
            </span>
            <span className="label-mono">The people behind the association</span>
          </div>

          <SplitWords as="h1" text="ITSA TEAM." className="mt-6 display-lg" />

          <motion.p
            initial={reduced ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="mt-6 max-w-2xl text-lg text-muted-foreground"
          >
            One association, {stats.communities} communities. Choose how you want to meet the
            faculty advisors, the core committee and every lead and executive â€” in 3D, as a
            flowchart, or by asking for a name.
          </motion.p>

          <dl className="mt-10 grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-4">
            <div className="bg-background px-4 py-4">
              <dt className="label-mono text-[9px]">Communities</dt>
              <dd className="mt-2 font-display text-xl font-bold">{stats.communities}</dd>
            </div>
            <div className="bg-background px-4 py-4">
              <dt className="label-mono text-[9px]">People</dt>
              <dd className="mt-2 font-display text-xl font-bold">{stats.totalMembers}</dd>
            </div>
            <div className="bg-background px-4 py-4">
              <dt className="label-mono text-[9px]">Leads</dt>
              <dd className="mt-2 font-display text-xl font-bold">{stats.leads}</dd>
            </div>
            <div className="bg-background px-4 py-4">
              <dt className="label-mono text-[9px]">Executives</dt>
              <dd className="mt-2 font-display text-xl font-bold">{stats.executives}</dd>
            </div>
          </dl>
        </div>
      </header>

      {/* LANDING â€” three choices */}
      <AnimatePresence mode="wait" initial={false}>
        {isLanding ? (
          <motion.section
            key="landing"
            initial={reduced ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? {} : { opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto max-w-[1600px] px-5 py-16 sm:px-8 sm:py-24"
          >
            <div className="grid gap-4 md:grid-cols-3">
              {CHOICES.map((choice, i) => (
                <ChoiceCard
                  key={choice.mode}
                  choice={choice}
                  index={i}
                  active={false}
                  reduced={reduced}
                  onSelect={() => selectMode(choice.mode)}
                  onIntent={() => {
                    if (choice.mode === "3d") preloadHierarchy3D();
                  }}
                />
              ))}
            </div>

            <Reveal delay={0.2} className="mt-12">
              <div className="border border-border bg-surface p-6 sm:p-8">
                <p className="label-mono">Tenure 2025â€“26 Â· source of record</p>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                  Every name, position and link across all three experiences comes from the official
                  ITSA roster. Units whose rosters are still being collected display an explicit
                  â€œTo be announcedâ€ state â€” nothing here is invented.
                </p>
              </div>
            </Reveal>
          </motion.section>
        ) : (
          <motion.section
            key={mode}
            initial={reduced ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? {} : { opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Sticky mode bar */}
            <div className="sticky top-[57px] z-30 border-b border-border bg-background/90 backdrop-blur-lg">
              <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-8">
                <ModeSwitcher active={mode} onSelect={selectMode} />
                <button
                  type="button"
                  onClick={backToLanding}
                  className="inline-flex items-center gap-2 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  â† All three ways
                </button>
              </div>
            </div>

            {mode === "3d" ? (
              <Suspense fallback={<Hierarchy3DFallback />}>
                <Hierarchy3D tree={tree} onSelectMember={setSelectedMember} />
              </Suspense>
            ) : null}

            {mode === "chart" ? (
              <HierarchyChart tree={tree} onSelectMember={setSelectedMember} />
            ) : null}

            {mode === "search" ? <MemberSearch onSelectMember={setSelectedMember} /> : null}
          </motion.section>
        )}
      </AnimatePresence>

      {/* Shared profile dialog for all entry points */}
      <MemberProfileDialog member={selectedMember} onClose={() => setSelectedMember(null)} />

      {/* Cross-link to events */}
      <section className="border-t border-foreground/20 bg-surface px-5 py-16 sm:px-8">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-6">
          <div>
            <p className="label-mono">See them in action</p>
            <h2 className="mt-3 max-w-[20ch] font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              The roster is only half the story.
            </h2>
          </div>
          <Link
            to="/events"
            className="inline-flex items-center gap-3 bg-foreground px-6 py-4 font-mono text-[11px] uppercase tracking-[0.2em] text-background transition-colors hover:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Explore events
            <span aria-hidden>â†’</span>
          </Link>
        </div>
      </section>
    </>
  );
}
