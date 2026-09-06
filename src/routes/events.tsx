import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";

import { Reveal, SplitWords } from "@/components/fx/motion-primitives";
import eventsData from "@/data/events.json";

type EventItem = {
  id: number;
  year?: string;
  name: string;
  overview: string;
  date: string;
  images?: string[];
  captions?: string[] | undefined;
  details?: {
    eventName: string;
    date: string;
    venue: string;
    participants: string;
  };
  highlights?: string[];
  outcome?: string;
};

const allEvents = eventsData as unknown as EventItem[];

const CATEGORIES = [
  { id: "all", label: "All Events" },
  { id: "competitions", label: "Competitions & Hackathons" },
  { id: "workshops", label: "Workshops & Tech" },
  { id: "community", label: "Social & Community" },
  { id: "career", label: "Career & Academic" },
] as const;

function getEventCategory(name: string, overview: string): string {
  const text = `${name} ${overview}`.toLowerCase();
  if (text.includes("bruteforge") || text.includes("competition") || text.includes("forge")) {
    return "competitions";
  }
  if (text.includes("workshop") || text.includes("ai") || text.includes("techroom") || text.includes("training")) {
    return "workshops";
  }
  if (text.includes("nss") || text.includes("plantation") || text.includes("cleanliness") || text.includes("school") || text.includes("teacher")) {
    return "community";
  }
  return "career";
}

const title = "Events & Initiatives — ITSA PCCoE Pune";
const description =
  "Every ITSA event at PCCoE Pune: BRUTEFORGE, AI expert sessions, higher-studies guidance, NSS drives and more.";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
    links: [
      { rel: "preconnect", href: "https://res.cloudinary.com" },
      { rel: "dns-prefetch", href: "https://res.cloudinary.com" },
    ],
  }),
  component: Events,
});

type ActiveLightbox = {
  eventName: string;
  images: string[];
  captions?: string[] | undefined;
  currentIndex: number;
};

function Events() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Year dropdown states: both open by default
  const [open2026_27, setOpen2026_27] = useState(true);
  const [open2025_26, setOpen2025_26] = useState(true);

  // Show More / Show Less state for 2026-27 Tenure event box
  const [is2026Expanded, setIs2026Expanded] = useState(false);

  // Client mount check for SSR-safe portal rendering
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Lightbox modal state for expandable images
  const [activeLightbox, setActiveLightbox] = useState<ActiveLightbox | null>(null);

  // Keyboard navigation and body scroll-locking for Lightbox
  useEffect(() => {
    if (!activeLightbox) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveLightbox(null);
      } else if (e.key === "ArrowLeft") {
        setActiveLightbox((prev) =>
          prev
            ? {
                ...prev,
                currentIndex:
                  (prev.currentIndex - 1 + prev.images.length) % prev.images.length,
              }
            : null
        );
      } else if (e.key === "ArrowRight") {
        setActiveLightbox((prev) =>
          prev
            ? {
                ...prev,
                currentIndex: (prev.currentIndex + 1) % prev.images.length,
              }
            : null
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [activeLightbox]);

  const filteredEvents = useMemo(() => {
    return allEvents.filter((e) => {
      const cat = getEventCategory(e.name, e.overview);
      const matchesCat = selectedCategory === "all" || cat === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        e.name.toLowerCase().includes(query) ||
        e.overview.toLowerCase().includes(query) ||
        e.date.toLowerCase().includes(query);
      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const events2026_27 = useMemo(() => {
    return filteredEvents.filter((e) => e.year === "2026-27");
  }, [filteredEvents]);

  const events2025_26 = useMemo(() => {
    return filteredEvents.filter((e) => !e.year || e.year === "2025-26");
  }, [filteredEvents]);

  return (
    <>
      {/* ════════════════════════════════════════════════════════════
          PAGE HEADER
          ════════════════════════════════════════════════════════════ */}
      <header className="relative overflow-hidden border-b border-foreground/20 px-5 pb-12 pt-28 sm:px-8 sm:pb-16 sm:pt-36">
        <div aria-hidden className="grid-paper pointer-events-none absolute inset-0 opacity-40" />

        <div className="relative mx-auto max-w-[1600px]">
          {/* Live Badge & Category Tag */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              ITSA Activity Log
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Tenure Archives
            </span>
          </div>

          {/* Impactful Masthead Title */}
          <SplitWords
            as="h1"
            text="Where Code Meets Community."
            className="mt-6 max-w-[16ch] display-lg"
          />

          {/* Meaningful Description */}
          <p className="mt-5 max-w-2xl text-base sm:text-lg leading-relaxed text-muted-foreground">
            A comprehensive record of technical hackathons, AI workshops, career guidance, and community initiatives driven by the Information Technology Students&apos; Association.
          </p>

          {/* Real-World Metrics Grid */}
          <div className="mt-10 grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-4">
            <div className="bg-background px-5 py-4">
              <p className="label-mono text-[10px]">Documented Events</p>
              <p className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-foreground">
                {allEvents.length}+
              </p>
              <p className="mt-1 font-mono text-[10px] text-muted-foreground">Competitions & drives</p>
            </div>
            <div className="bg-background px-5 py-4">
              <p className="label-mono text-[10px]">Active Wings</p>
              <p className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-foreground">
                06
              </p>
              <p className="mt-1 font-mono text-[10px] text-muted-foreground">IEEE · MLSC · GDGC · NSS</p>
            </div>
            <div className="bg-background px-5 py-4">
              <p className="label-mono text-[10px]">Student Reach</p>
              <p className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-primary">
                500+
              </p>
              <p className="mt-1 font-mono text-[10px] text-muted-foreground">Participants engaged</p>
            </div>
            <div className="bg-background px-5 py-4">
              <p className="label-mono text-[10px]">Department</p>
              <p className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-foreground">
                IT · PCCoE
              </p>
              <p className="mt-1 font-mono text-[10px] text-muted-foreground">Pune, Maharashtra</p>
            </div>
          </div>

          {/* Interactive Search & Filter Controls */}
          <div className="mt-10 space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  const count =
                    cat.id === "all"
                      ? allEvents.length
                      : allEvents.filter((e) => getEventCategory(e.name, e.overview) === cat.id).length;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-all ${
                        isActive
                          ? "bg-foreground text-background shadow-sm"
                          : "border border-border bg-surface text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                      }`}
                    >
                      <span>{cat.label}</span>
                      <span
                        className={`rounded-full px-1.5 py-0.2 text-[9px] ${
                          isActive
                            ? "bg-background/20 text-background"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Real-time Search Input */}
              <div className="relative w-full md:w-72">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search events..."
                  className="w-full border border-border bg-surface px-3.5 py-2 pr-8 font-mono text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 font-mono text-xs text-muted-foreground hover:text-foreground"
                  >
                    ×
                  </button>
                ) : null}
              </div>
            </div>

            {/* Results count banner */}
            <div className="flex items-center justify-between border-t border-border pt-3 font-mono text-[11px] text-muted-foreground">
              <p>
                Showing <span className="font-bold text-foreground">{filteredEvents.length}</span> of{" "}
                <span className="font-bold text-foreground">{allEvents.length}</span> events
              </p>
              {(selectedCategory !== "all" || searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("all");
                    setSearchQuery("");
                  }}
                  className="text-primary hover:underline"
                >
                  Reset filters
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════════
          TENURE SECTIONS ACCORDION (2026–27 above 2025–26)
          ════════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-[1600px] px-5 py-12 sm:px-8">
        <div className="space-y-12">
          {/* ──────────────────────────────────────────────────────────
              DROPDOWN SECTION: TENURE 2026–27 (Placed Above)
              ────────────────────────────────────────────────────────── */}
          <div className="border border-border bg-surface overflow-hidden">
            <button
              type="button"
              onClick={() => setOpen2026_27((v) => !v)}
              className="flex w-full items-center justify-between p-6 sm:p-8 text-left transition-colors hover:bg-surface-2"
            >
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
                    Academic Year
                  </span>
                  <span className="rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 font-mono text-[10px] text-primary font-bold">
                    {events2026_27.length > 0 ? `${events2026_27.length} Events` : "Upcoming Tenure"}
                  </span>
                </div>
                <h2 className="mt-2 font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                  Tenure 2026–2027
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Upcoming events, national hackathons, Praxis 2026 and new technical initiatives.
                </p>
              </div>
              <span
                className={`grid size-10 place-items-center border border-border bg-background font-mono text-lg transition-transform duration-300 ${
                  open2026_27 ? "rotate-180" : ""
                }`}
              >
                ↓
              </span>
            </button>

            <AnimatePresence initial={false}>
              {open2026_27 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="overflow-hidden border-t border-border bg-background p-6 sm:p-10"
                >
                  {events2026_27.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded border border-dashed border-border py-16 px-6 text-center">
                      <div className="size-12 rounded-full border border-primary/30 bg-primary/10 grid place-items-center font-mono text-primary text-base font-bold">
                        ✦
                      </div>
                      <h3 className="mt-4 font-display text-2xl font-bold text-foreground">
                        Tenure 2026–2027 In Preparation
                      </h3>
                      <p className="mt-2 max-w-md text-sm text-muted-foreground leading-relaxed">
                        Upcoming event logs, photographs, and overviews for the 2026–27 academic year will be documented here as they are conducted.
                      </p>
                      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                        <span className="rounded bg-surface px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-foreground border border-border">
                          Praxis 2026
                        </span>
                        <span className="rounded bg-surface px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-foreground border border-border">
                          BruteForge 2.0
                        </span>
                        <span className="rounded bg-surface px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-foreground border border-border">
                          Techroom 3.0
                        </span>
                        <span className="rounded bg-surface px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-foreground border border-border">
                          IEEE DevCon
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-20">
                      {events2026_27.map((e, i) => {
                        const flip = i % 2 === 1;
                        return (
                          <Reveal key={e.id}>
                            <article
                              className={`grid items-start gap-8 border-t border-foreground/20 pt-8 lg:grid-cols-2 ${
                                flip ? "lg:[&>figure]:order-2" : ""
                              }`}
                            >
                              <figure
                                role="button"
                                tabIndex={0}
                                onKeyDown={(ev) => {
                                  if ((ev.key === "Enter" || ev.key === " ") && e.images && e.images.length > 0) {
                                    setActiveLightbox({
                                      eventName: e.name,
                                      images: e.images,
                                      captions: e.captions,
                                      currentIndex: 0,
                                    });
                                  }
                                }}
                                onClick={() => {
                                  if (e.images && e.images.length > 0) {
                                    setActiveLightbox({
                                      eventName: e.name,
                                      images: e.images,
                                      captions: e.captions,
                                      currentIndex: 0,
                                    });
                                  }
                                }}
                                className="group relative overflow-hidden rounded bg-surface-2 cursor-pointer border border-border min-h-[220px] transition-all hover:border-primary/50"
                              >
                                {e.images?.[0] ? (
                                  <img
                                    src={e.images[0]}
                                    alt={e.captions?.[0] || e.name}
                                    loading={i < 2 ? "eager" : "lazy"}
                                    className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
                                  />
                                ) : (
                                  <div className="grid aspect-[16/10] w-full place-items-center font-display text-5xl font-extrabold text-outline">
                                    ITSA
                                  </div>
                                )}
                                <figcaption className="absolute bottom-0 left-0 bg-primary px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-primary-foreground z-10">
                                  {e.date}
                                </figcaption>
                                {e.images && e.images.length > 0 && (
                                  <div className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/75 px-3 py-1.5 text-[11px] font-mono text-white opacity-0 transition-opacity backdrop-blur-sm group-hover:opacity-100 z-10 shadow-lg pointer-events-none">
                                    <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                                    </svg>
                                    <span>Click to expand</span>
                                  </div>
                                )}
                              </figure>

                              <div className={flip ? "lg:pr-8" : "lg:pl-8"}>
                                <div className="flex items-center gap-3">
                                  <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">
                                    LOG {String(i + 1).padStart(2, "0")}
                                  </p>
                                  <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-primary">
                                    {getEventCategory(e.name, e.overview)}
                                  </span>
                                </div>
                                <SplitWords text={e.name} className="mt-3 display-md" />
                                <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">
                                  {e.overview}
                                </p>

                                {e.images && e.images.length > 1 ? (
                                  <div className="mt-6">
                                    <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                                      Gallery ({e.images.length} photos) — Click to expand
                                    </p>
                                    <div className="flex gap-2.5 overflow-x-auto pb-2">
                                      {e.images.map((src, si) => (
                                        <button
                                          key={`${e.id}-${si}`}
                                          type="button"
                                          title={e.captions?.[si] || `Photo ${si + 1}`}
                                          onClick={() => {
                                            setActiveLightbox({
                                              eventName: e.name,
                                              images: e.images!,
                                              captions: e.captions,
                                              currentIndex: si,
                                            });
                                          }}
                                          className="group relative size-20 shrink-0 overflow-hidden rounded border border-border cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-primary bg-surface-2"
                                        >
                                          <img
                                            src={src}
                                            alt={e.captions?.[si] || ""}
                                            loading="lazy"
                                            className="size-full object-cover transition-transform duration-300 group-hover:scale-110"
                                          />
                                          <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/25 flex items-center justify-center">
                                            <span className="text-white text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                                              +{si + 1}
                                            </span>
                                          </div>
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                ) : null}

                                {/* Show More / Show Less inside the same Tenure 2026-27 event box */}
                                {e.details ? (
                                  <div className="mt-6">
                                    <button
                                      type="button"
                                      onClick={() => setIs2026Expanded((prev) => !prev)}
                                      aria-expanded={is2026Expanded}
                                      className="inline-flex items-center gap-2 rounded border border-primary/50 bg-primary/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] text-primary transition-all duration-200 hover:bg-primary hover:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer shadow-xs"
                                    >
                                      <span>{is2026Expanded ? "Show Less" : "Show More"}</span>
                                      <span
                                        aria-hidden
                                        className={`inline-block font-mono text-xs transition-transform duration-200 ${
                                          is2026Expanded ? "rotate-180" : ""
                                        }`}
                                      >
                                        ↓
                                      </span>
                                    </button>

                                    <AnimatePresence initial={false}>
                                      {is2026Expanded && (
                                        <motion.div
                                          initial={{ opacity: 0, height: 0 }}
                                          animate={{ opacity: 1, height: "auto" }}
                                          exit={{ opacity: 0, height: 0 }}
                                          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                                          className="overflow-hidden"
                                        >
                                          <div className="mt-6 space-y-6 rounded-lg border border-border/80 bg-surface/50 p-5 sm:p-6 backdrop-blur-xs">
                                            {/* 1. Event Details */}
                                            <div className="space-y-3">
                                              <div className="flex items-center gap-2 border-b border-border/80 pb-2">
                                                <span className="size-1.5 rounded-full bg-primary" />
                                                <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-primary font-bold">
                                                  Event Details
                                                </h4>
                                              </div>
                                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                                <div className="rounded border border-border/70 bg-background/60 p-3.5">
                                                  <span className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                                                    Name of the Event:
                                                  </span>
                                                  <span className="mt-1 block font-medium text-foreground text-xs sm:text-sm">
                                                    {e.details.eventName}
                                                  </span>
                                                </div>
                                                <div className="rounded border border-border/70 bg-background/60 p-3.5">
                                                  <span className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                                                    Date:
                                                  </span>
                                                  <span className="mt-1 block font-medium text-foreground text-xs sm:text-sm">
                                                    {e.details.date}
                                                  </span>
                                                </div>
                                                <div className="rounded border border-border/70 bg-background/60 p-3.5">
                                                  <span className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                                                    Venue:
                                                  </span>
                                                  <span className="mt-1 block font-medium text-foreground text-xs sm:text-sm">
                                                    {e.details.venue}
                                                  </span>
                                                </div>
                                                <div className="rounded border border-border/70 bg-background/60 p-3.5">
                                                  <span className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                                                    Participant:
                                                  </span>
                                                  <span className="mt-1 block font-medium text-foreground text-xs sm:text-sm">
                                                    {e.details.participants}
                                                  </span>
                                                </div>
                                              </div>
                                            </div>

                                            {/* 2. Overview */}
                                            <div className="space-y-2">
                                              <div className="flex items-center gap-2 border-b border-border/80 pb-2">
                                                <span className="size-1.5 rounded-full bg-primary" />
                                                <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-primary font-bold">
                                                  Overview
                                                </h4>
                                              </div>
                                              <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                                                {e.overview}
                                              </p>
                                            </div>

                                            {/* 3. Highlights */}
                                            {e.highlights && e.highlights.length > 0 && (
                                              <div className="space-y-2.5">
                                                <div className="flex items-center gap-2 border-b border-border/80 pb-2">
                                                  <span className="size-1.5 rounded-full bg-primary" />
                                                  <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-primary font-bold">
                                                    Highlights
                                                  </h4>
                                                </div>
                                                <ul className="space-y-2.5 text-xs sm:text-sm text-muted-foreground">
                                                  {e.highlights.map((highlight, hIdx) => (
                                                    <li key={hIdx} className="flex items-start gap-3">
                                                      <span className="mt-1 size-1.5 rounded-full bg-primary shrink-0" />
                                                      <span className="leading-relaxed">{highlight}</span>
                                                    </li>
                                                  ))}
                                                </ul>
                                              </div>
                                            )}

                                            {/* 4. Outcome */}
                                            {e.outcome && (
                                              <div className="space-y-2">
                                                <div className="flex items-center gap-2 border-b border-border/80 pb-2">
                                                  <span className="size-1.5 rounded-full bg-primary" />
                                                  <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-primary font-bold">
                                                    Outcome
                                                  </h4>
                                                </div>
                                                <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                                                  {e.outcome}
                                                </p>
                                              </div>
                                            )}
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                ) : null}
                              </div>
                            </article>
                          </Reveal>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ──────────────────────────────────────────────────────────
              DROPDOWN SECTION: TENURE 2025–26 (Placed Below)
              ────────────────────────────────────────────────────────── */}
          <div className="border border-border bg-surface overflow-hidden">
            <button
              type="button"
              onClick={() => setOpen2025_26((v) => !v)}
              className="flex w-full items-center justify-between p-6 sm:p-8 text-left transition-colors hover:bg-surface-2"
            >
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
                    Academic Year
                  </span>
                  <span className="rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 font-mono text-[10px] text-primary font-bold">
                    {events2025_26.length} Events
                  </span>
                </div>
                <h2 className="mt-2 font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                  Tenure 2025–2026
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Competitions, expert workshops, NSS social drives and technical training.
                </p>
              </div>
              <span
                className={`grid size-10 place-items-center border border-border bg-background font-mono text-lg transition-transform duration-300 ${
                  open2025_26 ? "rotate-180" : ""
                }`}
              >
                ↓
              </span>
            </button>

            <AnimatePresence initial={false}>
              {open2025_26 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="overflow-hidden border-t border-border bg-background p-6 sm:p-10"
                >
                  {events2025_26.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground font-mono text-xs">
                      No events in 2025–26 match your search criteria.
                    </div>
                  ) : (
                    <div className="space-y-20">
                      {events2025_26.map((e, i) => {
                        const flip = i % 2 === 1;
                        return (
                          <Reveal key={e.id}>
                            <article
                              className={`grid items-center gap-8 border-t border-foreground/20 pt-8 lg:grid-cols-2 ${
                                flip ? "lg:[&>figure]:order-2" : ""
                              }`}
                            >
                              <figure
                                role="button"
                                tabIndex={0}
                                onKeyDown={(ev) => {
                                  if ((ev.key === "Enter" || ev.key === " ") && e.images && e.images.length > 0) {
                                    setActiveLightbox({
                                      eventName: e.name,
                                      images: e.images,
                                      currentIndex: 0,
                                    });
                                  }
                                }}
                                onClick={() => {
                                  if (e.images && e.images.length > 0) {
                                    setActiveLightbox({
                                      eventName: e.name,
                                      images: e.images,
                                      currentIndex: 0,
                                    });
                                  }
                                }}
                                className="group relative overflow-hidden rounded bg-surface-2 cursor-pointer border border-border min-h-[220px] transition-all hover:border-primary/50"
                              >
                                {e.images?.[0] ? (
                                  <img
                                    src={e.images[0]}
                                    alt={e.name}
                                    loading={i < 2 ? "eager" : "lazy"}
                                    className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
                                  />
                                ) : (
                                  <div className="grid aspect-[16/10] w-full place-items-center font-display text-5xl font-extrabold text-outline">
                                    ITSA
                                  </div>
                                )}
                                <figcaption className="absolute bottom-0 left-0 bg-primary px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-primary-foreground z-10">
                                  {e.date}
                                </figcaption>
                                {e.images && e.images.length > 0 && (
                                  <div className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/75 px-3 py-1.5 text-[11px] font-mono text-white opacity-0 transition-opacity backdrop-blur-sm group-hover:opacity-100 z-10 shadow-lg pointer-events-none">
                                    <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                                    </svg>
                                    <span>Click to expand</span>
                                  </div>
                                )}
                              </figure>

                              <div className={flip ? "lg:pr-8" : "lg:pl-8"}>
                                <div className="flex items-center gap-3">
                                  <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">
                                    LOG {String(i + 1).padStart(2, "0")}
                                  </p>
                                  <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-primary">
                                    {getEventCategory(e.name, e.overview)}
                                  </span>
                                </div>
                                <SplitWords text={e.name} className="mt-3 display-md" />
                                <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">
                                  {e.overview}
                                </p>

                                {e.images && e.images.length > 1 ? (
                                  <div className="mt-6">
                                    <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                                      Gallery ({e.images.length} photos) — Click to expand
                                    </p>
                                    <div className="flex gap-2.5 overflow-x-auto pb-2">
                                      {e.images.map((src, si) => (
                                        <button
                                          key={`${e.id}-${si}`}
                                          type="button"
                                          onClick={() => {
                                            setActiveLightbox({
                                              eventName: e.name,
                                              images: e.images!,
                                              currentIndex: si,
                                            });
                                          }}
                                          className="group relative size-20 shrink-0 overflow-hidden rounded border border-border cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary bg-surface-2 transition-transform hover:scale-105"
                                        >
                                          <img
                                            src={src}
                                            alt=""
                                            loading="lazy"
                                            className="size-full object-cover transition-transform duration-300 group-hover:scale-110"
                                          />
                                          <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/25 flex items-center justify-center">
                                            <span className="text-white text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                                              +{si + 1}
                                            </span>
                                          </div>
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                ) : null}
                              </div>
                            </article>
                          </Reveal>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          LIGHTBOX / FULLSCREEN IMAGE MODAL (Portaled to document.body)
          ════════════════════════════════════════════════════════════ */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {activeLightbox && (
              <div
                role="dialog"
                aria-modal="true"
                aria-label={`${activeLightbox.eventName} image preview`}
                className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-6 md:p-8 select-none"
              >
                {/* 1. Dedicated Backdrop Overlay (Fade animation) */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  onClick={() => setActiveLightbox(null)}
                  className="absolute inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
                  aria-label="Close modal background"
                />

                {/* 2. Content Wrapper Containing Expanded Image (Fade + Scale animation) */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative z-10 flex flex-col items-center justify-between w-full max-w-5xl max-h-[94vh] pointer-events-auto"
                >
                  {/* Top Toolbar */}
                  <div className="w-full flex items-center justify-between z-10 mb-3 px-1 gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 rounded-full bg-neutral-900/95 px-3.5 py-1.5 sm:px-4 sm:py-2 border border-white/20 shadow-2xl backdrop-blur-sm max-w-[80%]">
                      <span className="size-2 rounded-full bg-primary shrink-0 animate-pulse" />
                      <span className="font-mono text-xs font-bold text-white tracking-wide truncate">
                        {activeLightbox.eventName}
                      </span>
                      <span className="text-white/40 hidden sm:inline">|</span>
                      <span className="font-mono text-[11px] sm:text-xs text-white/80 shrink-0">
                        Photo {activeLightbox.currentIndex + 1} of {activeLightbox.images.length}
                      </span>
                    </div>

                    {/* Prominent 'X' Close Button */}
                    <button
                      type="button"
                      onClick={() => setActiveLightbox(null)}
                      className="flex size-10 sm:size-11 items-center justify-center rounded-full bg-neutral-900/95 border border-white/25 text-white transition-all hover:bg-neutral-800 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary shadow-2xl cursor-pointer"
                      aria-label="Close image preview"
                    >
                      <span className="font-mono text-2xl font-light leading-none">×</span>
                    </button>
                  </div>

                  {/* Centered Expanded Image - Preserves aspect ratio, fits viewport */}
                  <div className="relative flex flex-col items-center justify-center max-h-[72vh] sm:max-h-[78vh] w-full my-auto">
                    <img
                      key={activeLightbox.images[activeLightbox.currentIndex]}
                      src={activeLightbox.images[activeLightbox.currentIndex]}
                      alt={activeLightbox.captions?.[activeLightbox.currentIndex] || `${activeLightbox.eventName} photo ${activeLightbox.currentIndex + 1}`}
                      className="max-h-[66vh] sm:max-h-[72vh] max-w-full w-auto h-auto object-contain rounded-xl shadow-2xl block select-none"
                    />

                    {/* Photo Caption */}
                    {activeLightbox.captions?.[activeLightbox.currentIndex] && (
                      <div className="z-10 mt-2.5 px-4 py-1 rounded-full bg-neutral-900/90 border border-white/15 backdrop-blur-sm shadow-md text-center max-w-lg">
                        <span className="font-mono text-xs text-white/90 font-medium">
                          {activeLightbox.captions[activeLightbox.currentIndex]}
                        </span>
                      </div>
                    )}

                    {/* Left / Right Navigation Arrows */}
                    {activeLightbox.images.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveLightbox((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    currentIndex:
                                      (prev.currentIndex - 1 + prev.images.length) %
                                      prev.images.length,
                                  }
                                : null
                            );
                          }}
                          className="absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 z-20 flex size-10 sm:size-12 items-center justify-center rounded-full bg-neutral-900/90 border border-white/25 text-white text-2xl sm:text-3xl font-light transition-all hover:bg-black hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary shadow-2xl cursor-pointer"
                          aria-label="Previous photo"
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveLightbox((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    currentIndex:
                                      (prev.currentIndex + 1) % prev.images.length,
                                  }
                                : null
                            );
                          }}
                          className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 z-20 flex size-10 sm:size-12 items-center justify-center rounded-full bg-neutral-900/90 border border-white/25 text-white text-2xl sm:text-3xl font-light transition-all hover:bg-black hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary shadow-2xl cursor-pointer"
                          aria-label="Next photo"
                        >
                          ›
                        </button>
                      </>
                    )}
                  </div>

                  {/* Bottom Thumbnail Dock */}
                  {activeLightbox.images.length > 1 && (
                    <div className="mt-3 z-10 flex gap-2 overflow-x-auto max-w-full sm:max-w-4xl rounded-xl bg-neutral-900/95 p-2 border border-white/20 shadow-2xl">
                      {activeLightbox.images.map((imgUrl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (idx !== activeLightbox.currentIndex) {
                              setActiveLightbox((prev) =>
                                prev ? { ...prev, currentIndex: idx } : null
                              );
                            }
                          }}
                          className={`size-12 sm:size-14 shrink-0 overflow-hidden rounded-lg transition-all border cursor-pointer ${
                            idx === activeLightbox.currentIndex
                              ? "border-primary ring-2 ring-primary/60 scale-105 opacity-100"
                              : "border-white/10 opacity-50 hover:opacity-90"
                          }`}
                          aria-label={`Switch to photo ${idx + 1}`}
                        >
                          <img
                            src={imgUrl}
                            alt=""
                            className="size-full object-cover pointer-events-none"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}




