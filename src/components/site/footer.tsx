import { Link } from "@tanstack/react-router";

import { Marquee } from "@/components/fx/marquee";
import { itsa } from "@/data/itsa";

const columns = [
  {
    title: "Pages",
    links: [
      { to: "/", label: "Home" },
      { to: "/events", label: "Events" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-foreground/20 bg-surface">
      <Marquee
        className="border-b border-foreground/20 py-3 font-display text-2xl font-extrabold uppercase tracking-tight sm:text-3xl"
        speed={30}
        items={[
          "Information Technology Students' Association",
          "PCCoE Pune",
          "Build · Compete · Serve",
        ]}
      />

      <div className="mx-auto grid max-w-[1600px] gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <img
              src="/itsa-logo-transparent.png"
              alt="ITSA Logo"
              className="h-9 w-auto max-w-[120px] object-contain dark:invert"
            />
            <p className="display-md">ITSA</p>
          </div>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">{itsa.tagline}</p>
          <div className="mt-6 space-y-1 font-mono text-xs text-muted-foreground">
            <p>{itsa.contact.email}</p>
            <p>{itsa.contact.phone}</p>
            <p>{itsa.contact.address}</p>
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <p className="label-mono">{col.title}</p>
            <ul className="mt-5 space-y-2">
              {col.links.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="group inline-flex items-center gap-2 font-display text-xl font-bold tracking-tight"
                  >
                    <span className="inline-block h-px w-0 bg-foreground transition-all duration-300 group-hover:w-6" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-5 py-5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:px-8">
          <span>© {new Date().getFullYear()} ITSA · IT Department, PCCoE</span>
          <span>Student-run · Pune, India</span>
        </div>
      </div>
    </footer>
  );
}
