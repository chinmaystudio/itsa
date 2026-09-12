import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function HomePage({ onNavigate }) {
  const handleNav = (route, e) => {
    e.preventDefault();
    if (onNavigate) onNavigate(route);
  };

  return (
    <div className="relative min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[92vh] flex flex-col justify-between pt-24 overflow-hidden border-b border-foreground/20">
        <div aria-hidden="true" className="grid-paper pointer-events-none absolute inset-0 opacity-40"></div>

        <div className="mx-auto w-full max-w-[1600px] px-5 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-foreground/20 pb-3">
            <p className="label-mono">EST. DEPARTMENT OF INFORMATION TECHNOLOGY</p>
            <p className="label-mono">PCCOE · PUNE · INDIA</p>
          </div>

          <div className="grid gap-8 pt-8 lg:grid-cols-[1.6fr_1fr]">
            <div>
              <h1 className="display-xl">
                <span className="block">Information</span>
                <span className="block">Technology</span>
              </h1>
              <div className="relative">
                <h1 className="display-xl text-outline">
                  <span className="block">Students'</span>
                  <span className="block">Association</span>
                </h1>
              </div>
              <div className="mt-6 h-[6px] w-full bg-acid"></div>
            </div>

            <div className="flex flex-col justify-end">
              <p className="text-base sm:text-lg leading-relaxed text-muted-foreground">
                A student-run engine for technology, research and responsibility at PCCoE, Pune.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="/events"
                  onClick={(e) => handleNav('/events', e)}
                  className="group inline-flex items-center gap-3 bg-foreground px-6 py-4 font-mono text-[11px] uppercase tracking-[0.2em] text-background hover:bg-foreground/90 transition-colors"
                >
                  <span>Explore events</span>
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </a>

                <a
                  href="/newsletter"
                  onClick={(e) => handleNav('/newsletter', e)}
                  className="group inline-flex items-center gap-3 border border-border bg-surface px-6 py-4 font-mono text-[11px] uppercase tracking-[0.2em] text-foreground hover:border-foreground/50 transition-colors"
                >
                  <span>03 Newsletter</span>
                  <span className="text-primary font-bold">★</span>
                </a>
              </div>

              {/* Next Up Box */}
              <div className="mt-10 border-l-[6px] border-primary pl-4">
                <p className="label-mono">Next up</p>
                <p className="mt-2 font-display text-3xl font-extrabold tracking-tight">Praxis 2026</p>
                <p className="mt-1 font-mono text-xs text-primary">October 2026</p>
                <p className="mt-2 text-sm text-muted-foreground">National Technical Symposium · Coming Soon</p>
              </div>
            </div>
          </div>
        </div>

        {/* Marquee Ticker */}
        <div className="relative overflow-hidden mt-14 border-y border-foreground/20 bg-foreground py-3 font-mono text-[11px] uppercase tracking-[0.3em] text-background">
          <div className="marquee-track" style={{ animationDuration: '34s' }}>
            <span className="flex shrink-0 items-center gap-8 pr-8">
              18+ events
              <span aria-hidden="true" className="text-[0.6em] opacity-60">◆</span>
            </span>
            <span className="flex shrink-0 items-center gap-8 pr-8">
              66 active members
              <span aria-hidden="true" className="text-[0.6em] opacity-60">◆</span>
            </span>
            <span className="flex shrink-0 items-center gap-8 pr-8">
              14 specialised teams
              <span aria-hidden="true" className="text-[0.6em] opacity-60">◆</span>
            </span>
            <span className="flex shrink-0 items-center gap-8 pr-8">
              IEEE · MLSC · GDGC · NSS
              <span aria-hidden="true" className="text-[0.6em] opacity-60">◆</span>
            </span>
            <span className="flex shrink-0 items-center gap-8 pr-8">
              $5000 IEEE grant
              <span aria-hidden="true" className="text-[0.6em] opacity-60">◆</span>
            </span>
            <span className="flex shrink-0 items-center gap-8 pr-8">
              18+ events
              <span aria-hidden="true" className="text-[0.6em] opacity-60">◆</span>
            </span>
            <span className="flex shrink-0 items-center gap-8 pr-8">
              66 active members
              <span aria-hidden="true" className="text-[0.6em] opacity-60">◆</span>
            </span>
            <span className="flex shrink-0 items-center gap-8 pr-8">
              14 specialised teams
              <span aria-hidden="true" className="text-[0.6em] opacity-60">◆</span>
            </span>
          </div>
        </div>
      </section>

      {/* 01 — Who we are */}
      <section className="mx-auto max-w-[1600px] px-5 py-24 sm:px-8 sm:py-32">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.4fr]">
          <div>
            <p className="label-mono">01 — Who we are</p>
            <p className="mt-5 font-mono text-xs text-muted-foreground">Student-run · Faculty-guided</p>
          </div>
          <div>
            <h2 className="display-md">
              A student-run engine for technology, research and responsibility.
            </h2>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              ITSA is the Information Technology Students' Association of the IT Department at PCCoE, Pune. It runs the department's technical, academic, cultural and social-responsibility activities together with the IEEE Student Branch, MLSC and GDGC chapters.
            </p>

            <ul className="mt-10 divide-y divide-border border-y border-border">
              <li className="flex items-baseline gap-5 py-4">
                <span className="font-mono text-[10px] text-primary">M1</span>
                <span className="text-sm text-muted-foreground">
                  Strengthen industry–academia interaction through professional chapters
                </span>
              </li>
              <li className="flex items-baseline gap-5 py-4">
                <span className="font-mono text-[10px] text-primary">M2</span>
                <span className="text-sm text-muted-foreground">
                  Support higher studies, research, and lifelong learning
                </span>
              </li>
              <li className="flex items-baseline gap-5 py-4">
                <span className="font-mono text-[10px] text-primary">M3</span>
                <span className="text-sm text-muted-foreground">
                  Encourage social responsibility through ISR and NSS activities
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 02 — The ecosystem */}
      <section className="border-t border-foreground/20 bg-surface px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-[1600px]">
          <div>
            <p className="label-mono">02 — The ecosystem</p>
            <h2 className="mt-4 display-md">Six wings, one association.</h2>
          </div>

          <div className="mt-12 grid auto-rows-[minmax(180px,auto)] gap-4 md:grid-cols-3">
            <div className="md:col-span-2 md:row-span-2">
              <article className="ink-card group flex h-full flex-col justify-between p-7 hover:-translate-y-1 hover:offset-shadow-primary">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.2em] text-primary">ITSA//CORE</p>
                  <p className="mt-4 font-display font-extrabold tracking-tight text-5xl sm:text-7xl">ITSA</p>
                  <p className="mt-2 text-sm text-muted-foreground">Department-wide student body</p>
                </div>
                <p className="mt-6 text-sm text-muted-foreground">
                  The parent association coordinating all technical, academic, cultural and social activities of the IT Department through 14 specialised teams.
                </p>
              </article>
            </div>

            <div>
              <article className="ink-card group flex h-full flex-col justify-between p-7 hover:-translate-y-1 hover:offset-shadow-primary">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.2em] text-primary">ITSA//IEEE</p>
                  <p className="mt-4 font-display font-extrabold tracking-tight text-3xl">IEEE</p>
                  <p className="mt-2 text-sm text-muted-foreground">Professional chapter · research & industry</p>
                </div>
                <p className="mt-6 text-sm text-muted-foreground line-clamp-3">
                  The IEEE Student Branch connects students to global technical communities, research exposure and industry networks.
                </p>
              </article>
            </div>

            <div>
              <article className="ink-card group flex h-full flex-col justify-between p-7 hover:-translate-y-1 hover:offset-shadow-primary">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.2em] text-primary">ITSA//MLSC</p>
                  <p className="mt-4 font-display font-extrabold tracking-tight text-3xl">MLSC</p>
                  <p className="mt-2 text-sm text-muted-foreground">Cloud, developer tooling & training</p>
                </div>
                <p className="mt-6 text-sm text-muted-foreground line-clamp-3">
                  MLSC partners with ITSA on hands-on technical training, developer toolchains, and student hackathons.
                </p>
              </article>
            </div>

            <div>
              <article className="ink-card group flex h-full flex-col justify-between p-7 hover:-translate-y-1 hover:offset-shadow-primary">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.2em] text-primary">ITSA//GDGC</p>
                  <p className="mt-4 font-display font-extrabold tracking-tight text-3xl">GDGC</p>
                  <p className="mt-2 text-sm text-muted-foreground">Developer community</p>
                </div>
                <p className="mt-6 text-sm text-muted-foreground line-clamp-3">
                  GDGC collaborates with ITSA to strengthen technical workshops, web frameworks, and cloud certifications.
                </p>
              </article>
            </div>

            <div>
              <article className="ink-card group flex h-full flex-col justify-between p-7 hover:-translate-y-1 hover:offset-shadow-primary">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.2em] text-primary">ITSA//NSS</p>
                  <p className="mt-4 font-display font-extrabold tracking-tight text-3xl">NSS</p>
                  <p className="mt-2 text-sm text-muted-foreground">Social responsibility</p>
                </div>
                <p className="mt-6 text-sm text-muted-foreground line-clamp-3">
                  The ISR & NSS wing runs the department's community initiatives: cleanliness drives, school awareness and environmental programs.
                </p>
              </article>
            </div>

            <div>
              <article className="ink-card group flex h-full flex-col justify-between p-7 hover:-translate-y-1 hover:offset-shadow-primary">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.2em] text-primary">ITSA//ART</p>
                  <p className="mt-4 font-display font-extrabold tracking-tight text-3xl">ART</p>
                  <p className="mt-2 text-sm text-muted-foreground">Creative & cultural</p>
                </div>
                <p className="mt-6 text-sm text-muted-foreground line-clamp-3">
                  The creative wing of ITSA behind cultural celebrations, stage events, and creative workshops.
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
