import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { X, ArrowLeft, CalendarDays, Trophy, Code2, Lightbulb } from "lucide-react";

import { Reveal, SplitWords } from "@/components/effects/motion-primitives";
import { PRAXIS_EVENTS } from "@/data/praxis";

// ─── helpers ────────────────────────────────────────────────────────────────

function optimiseImage(url: string) {
  return url.replace(
    "/image/upload/",
    "/image/upload/f_auto,q_auto,w_900,c_limit/",
  );
}

function parseEventDate(date: string) {
  return new Date(date.replace(/(\d+)(st|nd|rd|th)/, "$1")).getTime();
}

type IconKey = "Trophy" | "Code2" | "Lightbulb";

function resolveIcon(name: string, index: number): IconKey {
  const n = name.toLowerCase();
  if (
    n.includes("competition") ||
    n.includes("bruteforge") ||
    n.includes("webcrafter")
  )
    return "Trophy";
  return index % 3 === 0 ? "Code2" : "Lightbulb";
}

function resolveCategory(name: string): string {
  const n = name.toLowerCase();
  if (
    n.includes("competition") ||
    n.includes("bruteforge") ||
    n.includes("webcrafter") ||
    n.includes("school activity")
  )
    return "Competition";
  return "Initiative";
}

const ACHIEVEMENTS = PRAXIS_EVENTS.slice()
  .sort((a, b) => parseEventDate(b.date) - parseEventDate(a.date))
  .map((ev, i) => ({
    id: ev.id,
    year: ev.date.slice(-4),
    title: ev.name,
    description:
      ev.overview ||
      "An ITSA initiative created for practical learning, collaboration, and student growth.",
    iconKey: resolveIcon(ev.name, i) as IconKey,
    category: resolveCategory(ev.name),
    date: ev.date,
    venue: ev.venue,
    participants: ev.participants,
    highlights: ev.highlights ?? [],
    outcome: ev.outcome,
    coverImage: ev.coverImage ?? ev.images[0] ? optimiseImage(ev.coverImage ?? ev.images[0]!) : undefined,
    images: ev.images.map(optimiseImage),
    imageCaptions: ev.imageCaptions,
  }));

// ─── meta ────────────────────────────────────────────────────────────────────

const title = "Achievements | ITSA PCCoE Pune";
const description =
  "A documented record of ITSA's competitions and student initiatives — from BRUTEFORGE to Induction ceremonies.";
const siteUrl = "https://itsa-wheat.vercel.app/achievements";
const ogImage = "https://itsa-wheat.vercel.app/itsa-og-image.png";

export const Route = createFileRoute("/achievements")({
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
        content: "ITSA — Information Technology Students' Association",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: ogImage },
    ],
  }),
  component: AchievementsPage,
});

// ─── icon map ────────────────────────────────────────────────────────────────

const ICON_MAP = { Trophy, Code2, Lightbulb } as const;

// ─── types ───────────────────────────────────────────────────────────────────

type Achievement = (typeof ACHIEVEMENTS)[number];
type LightboxState = { src: string; caption?: string; title: string } | null;

// ─── detail dialog ───────────────────────────────────────────────────────────

function DetailDialog({
  item,
  onClose,
}: {
  item: Achievement;
  onClose: () => void;
}) {
  const [lightbox, setLightbox] = useState<LightboxState>(null);

  // lock body scroll; Escape key support
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (lightbox) setLightbox(null);
        else onClose();
      }
    };
    window.addEventListener("keydown", handle);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", handle);
    };
  }, [lightbox, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-foreground/60 backdrop-blur-sm"
        aria-hidden
        onMouseDown={onClose}
      />

      {/* Dialog */}
      <article
        role="dialog"
        aria-modal="true"
        aria-labelledby="ach-dialog-title"
        className="fixed inset-x-4 top-[5vh] z-50 mx-auto flex max-h-[90vh] max-w-3xl flex-col overflow-y-auto border border-border bg-background shadow-[12px_12px_0_0_var(--foreground)] sm:inset-x-8"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Sticky header */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-background px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Back to achievements"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All achievements
          </button>
          <button
            type="button"
            onClick={onClose}
            className="size-8 border border-border bg-surface transition-colors hover:bg-foreground hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring flex items-center justify-center"
            aria-label="Close"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="px-6 pb-12 pt-8">
          {/* Cover image */}
          {item.coverImage && (
            <div className="mb-8 h-48 overflow-hidden border border-border sm:h-64">
              <img
                src={item.coverImage}
                alt={item.title}
                className="h-full w-full object-cover"
                loading="eager"
                decoding="async"
              />
            </div>
          )}

          {/* Category + date */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="label-mono border border-border bg-surface px-2.5 py-1 text-[9px]">
              {item.category}
            </span>
            <span className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
              <CalendarDays className="h-3 w-3" />
              {item.date}
            </span>
          </div>

          <h2
            id="ach-dialog-title"
            className="mt-5 font-display text-2xl font-extrabold tracking-tight sm:text-3xl"
          >
            {item.title}
          </h2>

          {/* Meta grid */}
          {(item.venue || item.participants) && (
            <dl className="mt-6 grid gap-px border border-border bg-border sm:grid-cols-2">
              {item.venue && (
                <div className="bg-background px-4 py-3">
                  <dt className="label-mono text-[9px]">Venue</dt>
                  <dd className="mt-1.5 text-sm text-muted-foreground">{item.venue}</dd>
                </div>
              )}
              {item.participants && (
                <div className="bg-background px-4 py-3">
                  <dt className="label-mono text-[9px]">Participants</dt>
                  <dd className="mt-1.5 text-sm text-muted-foreground">{item.participants}</dd>
                </div>
              )}
            </dl>
          )}

          {/* Overview */}
          <section className="mt-8">
            <p className="label-mono border-b border-border pb-2">Overview</p>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">{item.description}</p>
          </section>

          {/* Highlights */}
          {item.highlights.length > 0 && (
            <section className="mt-8">
              <p className="label-mono border-b border-border pb-2">Highlights</p>
              <ul className="mt-4 space-y-2">
                {item.highlights.map((h) => (
                  <li
                    key={h}
                    className="flex items-baseline gap-3 border-l-2 border-primary pl-3 text-sm text-muted-foreground"
                  >
                    <span className="font-mono text-[9px] text-primary">—</span>
                    {h}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Outcome */}
          {item.outcome && (
            <section className="mt-8">
              <p className="label-mono border-b border-border pb-2">Outcome</p>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">{item.outcome}</p>
            </section>
          )}

          {/* Photo gallery */}
          {item.images.length > 0 && (
            <section className="mt-8">
              <div className="mb-4 flex items-center justify-between">
                <p className="label-mono">Photo record</p>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {item.images.length} {item.images.length === 1 ? "photo" : "photos"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {item.images.map((src, idx) => {
                  const caption = item.imageCaptions?.[idx];
                  const isLogo = caption?.toLowerCase().includes("logo");
                  return (
                    <figure key={src} className="group">
                      <button
                        type="button"
                        className="block w-full cursor-zoom-in"
                        onClick={() =>
                          setLightbox(caption !== undefined ? { src, caption, title: item.title } : { src, title: item.title })
                        }
                        aria-label={`Enlarge photo ${idx + 1}`}
                      >
                        <img
                          src={src}
                          alt={`${item.title}, photo ${idx + 1}`}
                          className={`aspect-square w-full border border-border object-cover transition-all duration-300 group-hover:offset-shadow-primary ${isLogo ? "bg-white object-contain p-3" : ""}`}
                          loading="lazy"
                          decoding="async"
                        />
                      </button>
                      {caption && (
                        <figcaption className="mt-1.5 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                          {caption}
                        </figcaption>
                      )}
                    </figure>
                  );
                })}
              </div>
            </section>
          )}

          <p className="mt-10 font-mono text-[9px] uppercase tracking-widest text-border">
            PCCoE ITSA — event archive
          </p>
        </div>
      </article>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/90 p-4 backdrop-blur-sm"
          onMouseDown={() => setLightbox(null)}
        >
          <div
            className="relative flex max-h-full max-w-5xl flex-col items-center"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightbox(null)}
              className="absolute right-2 top-2 z-10 size-8 border border-border bg-background/80 text-foreground transition-colors hover:bg-background flex items-center justify-center"
              aria-label="Close photo"
            >
              <X className="h-4 w-4" />
            </button>
            <img
              src={lightbox.src}
              alt={lightbox.title}
              className="max-h-[calc(100vh-6rem)] max-w-full object-contain"
            />
            {lightbox.caption && (
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-background/70">
                {lightbox.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ─── card ────────────────────────────────────────────────────────────────────

function AchievementCard({
  item,
  index,
  onOpen,
}: {
  item: Achievement;
  index: number;
  onOpen: () => void;
}) {
  const Icon = ICON_MAP[item.iconKey];

  return (
    <Reveal delay={index * 0.04}>
      <button
        type="button"
        onClick={onOpen}
        className="ink-card group relative flex w-full flex-col gap-4 p-6 text-left transition-all hover:-translate-y-1 hover:offset-shadow-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex-row sm:items-start sm:gap-6"
        aria-label={`Open details for ${item.title}`}
      >
        {/* Icon badge */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-border bg-surface text-primary transition-colors group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
          <Icon className="h-4.5 w-4.5" />
        </div>

        <div className="flex-1 min-w-0">
          {/* Year + category */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display text-xl font-extrabold text-primary leading-none">
              {item.year}
            </span>
            <span className="label-mono border border-border bg-surface px-2 py-0.5 text-[8px]">
              {item.category}
            </span>
          </div>

          {/* Cover image */}
          {item.coverImage && (
            <div className="mt-4 h-36 overflow-hidden border border-border sm:h-28">
              <img
                src={item.coverImage}
                alt={item.title}
                className="h-full w-full object-cover opacity-80 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
                loading="lazy"
                decoding="async"
                sizes="(max-width: 640px) 100vw, 560px"
              />
            </div>
          )}

          <h3 className="mt-4 font-display text-lg font-extrabold tracking-tight leading-snug">
            {item.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground leading-relaxed">
            {item.description}
          </p>

          <span className="mt-4 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground transition-colors group-hover:text-primary">
            View record
            <span
              aria-hidden
              className="inline-block transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </span>
        </div>
      </button>
    </Reveal>
  );
}

// ─── page ────────────────────────────────────────────────────────────────────

function AchievementsPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = ACHIEVEMENTS.find((a) => a.id === selectedId) ?? null;

  // Set route colour token
  useEffect(() => {
    document.documentElement.setAttribute("data-route", "achievements");
    return () => {
      document.documentElement.removeAttribute("data-route");
    };
  }, []);

  return (
    <>
      {/* MASTHEAD */}
      <header className="relative overflow-hidden border-b border-foreground/20 px-5 pb-10 pt-28 sm:px-8 sm:pb-14 sm:pt-36">
        <div aria-hidden className="grid-paper pointer-events-none absolute inset-0 opacity-70" />
        <div className="relative mx-auto max-w-[1600px]">
          <div className="flex items-baseline gap-4">
            <span className="font-display text-[clamp(2.5rem,8vw,7rem)] font-extrabold leading-none text-primary">
              04
            </span>
            <span className="label-mono">ITSA milestones &amp; event archive</span>
          </div>

          <SplitWords as="h1" text="Achievements." className="mt-6 display-lg" />

          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Competitions, workshops, inductions, and initiatives — a complete record of ITSA at
            PCCoE. Chronological, source-of-record.
          </p>

          <dl className="mt-10 grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-4">
            <div className="bg-background px-4 py-4">
              <dt className="label-mono text-[9px]">Events</dt>
              <dd className="mt-2 font-display text-xl font-bold">{ACHIEVEMENTS.length}</dd>
            </div>
            <div className="bg-background px-4 py-4">
              <dt className="label-mono text-[9px]">Competitions</dt>
              <dd className="mt-2 font-display text-xl font-bold">
                {ACHIEVEMENTS.filter((a) => a.category === "Competition").length}
              </dd>
            </div>
            <div className="bg-background px-4 py-4">
              <dt className="label-mono text-[9px]">Initiatives</dt>
              <dd className="mt-2 font-display text-xl font-bold">
                {ACHIEVEMENTS.filter((a) => a.category === "Initiative").length}
              </dd>
            </div>
            <div className="bg-background px-4 py-4">
              <dt className="label-mono text-[9px]">Since</dt>
              <dd className="mt-2 font-display text-xl font-bold">
                {Math.min(...ACHIEVEMENTS.map((a) => Number(a.year)))}
              </dd>
            </div>
          </dl>
        </div>
      </header>

      {/* GRID */}
      <section className="mx-auto max-w-[1600px] px-5 py-20 sm:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="label-mono">Full archive · {ACHIEVEMENTS.length} entries</p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">Most recent first</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {ACHIEVEMENTS.map((item, index) => (
            <AchievementCard
              key={item.id}
              item={item}
              index={index}
              onOpen={() => setSelectedId(item.id)}
            />
          ))}
        </div>
      </section>

      {/* Detail dialog (portal) */}
      {selected && (
        <DetailDialog item={selected} onClose={() => setSelectedId(null)} />
      )}
    </>
  );
}
