import { createFileRoute } from "@tanstack/react-router";

import { HeroSequence } from "@/components/fx/hero-sequence";
import { Reveal, SplitWords } from "@/components/fx/motion-primitives";
import { clubs } from "@/data/clubs";
import { itsa } from "@/data/itsa";

const title = "ITSA — Information Technology Students' Association, PCCoE Pune";
const description =
  "The digital headquarters of ITSA, PCCoE Pune: events, clubs, teams and achievements of the Information Technology Students' Association.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      {/* HERO — sequential animation timeline */}
      <HeroSequence />

      {/* MANIFESTO */}
      <section className="mx-auto max-w-[1600px] px-5 py-24 sm:px-8 sm:py-32">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.4fr]">
          <div>
            <p className="label-mono">01 — Who we are</p>
            <p className="mt-5 font-mono text-xs text-muted-foreground">
              Student-run · Faculty-guided
            </p>
          </div>
          <div>
            <SplitWords
              text="A student-run engine for technology, research and responsibility."
              className="display-md"
            />
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              {itsa.intro}
            </p>
            <ul className="mt-10 divide-y divide-border border-y border-border">
              {itsa.mission.slice(0, 3).map((m, i) => (
                <Reveal key={m} delay={i * 0.06}>
                  <li className="flex items-baseline gap-5 py-4">
                    <span className="font-mono text-[10px] text-primary">M{i + 1}</span>
                    <span className="text-sm text-muted-foreground">{m}</span>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* VISION SLAB — moved above the Ecosystem section */}
      <section className="border-y border-foreground/20 bg-foreground px-5 py-24 text-background sm:px-8">
        <div className="mx-auto max-w-[1600px]">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] opacity-70">Vision</p>
          <SplitWords text={itsa.vision} className="mt-6 max-w-[24ch] display-md" />
        </div>
      </section>

      {/* CLUB BENTO (Ecosystem) */}
      <section className="border-t border-foreground/20 bg-surface px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-[1600px]">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="label-mono">02 — The ecosystem</p>
              <h2 className="mt-4 display-md">Six wings, one association.</h2>
            </div>
          </div>

          <div className="mt-12 grid auto-rows-[minmax(180px,auto)] gap-4 md:grid-cols-3">
            {clubs.map((c, i) => (
              <Reveal
                key={c.id}
                delay={i * 0.05}
                className={i === 0 ? "md:col-span-2 md:row-span-2" : ""}
              >
                <article className="ink-card group flex h-full flex-col justify-between p-7 hover:-translate-y-1 hover:offset-shadow-primary">
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.2em] text-primary">{c.code}</p>
                    <p
                      className={`mt-4 font-display font-extrabold tracking-tight ${i === 0 ? "text-5xl sm:text-7xl" : "text-3xl"}`}
                    >
                      {c.short}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">{c.domain}</p>
                  </div>
                  <p
                    className={`mt-6 text-sm text-muted-foreground ${i === 0 ? "" : "line-clamp-3"}`}
                  >
                    {c.description}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
