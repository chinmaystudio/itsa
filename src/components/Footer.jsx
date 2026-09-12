import React from 'react';

export default function Footer({ onNavigate }) {
  const handleNav = (route, e) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(route);
    } else {
      window.history.pushState({}, '', route);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <footer className="mt-28 border-t border-foreground/20 bg-surface">
      {/* Marquee Banner with diamond separators */}
      <div className="relative overflow-hidden border-b border-foreground/20 py-3 font-display text-2xl font-extrabold uppercase tracking-tight sm:text-3xl text-foreground">
        <div className="marquee-track" style={{ animationDuration: '30s' }}>
          <span className="flex shrink-0 items-center gap-8 pr-8">
            Information Technology Students' Association
            <span aria-hidden="true" className="text-[0.6em] opacity-60">◆</span>
          </span>
          <span className="flex shrink-0 items-center gap-8 pr-8">
            PCCoE Pune
            <span aria-hidden="true" className="text-[0.6em] opacity-60">◆</span>
          </span>
          <span className="flex shrink-0 items-center gap-8 pr-8">
            Build · Compete · Serve
            <span aria-hidden="true" className="text-[0.6em] opacity-60">◆</span>
          </span>
          <span className="flex shrink-0 items-center gap-8 pr-8">
            Official Dispatches
            <span aria-hidden="true" className="text-[0.6em] opacity-60">◆</span>
          </span>
          <span className="flex shrink-0 items-center gap-8 pr-8">
            Information Technology Students' Association
            <span aria-hidden="true" className="text-[0.6em] opacity-60">◆</span>
          </span>
          <span className="flex shrink-0 items-center gap-8 pr-8">
            PCCoE Pune
            <span aria-hidden="true" className="text-[0.6em] opacity-60">◆</span>
          </span>
          <span className="flex shrink-0 items-center gap-8 pr-8">
            Build · Compete · Serve
            <span aria-hidden="true" className="text-[0.6em] opacity-60">◆</span>
          </span>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="mx-auto grid max-w-[1600px] gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <img
              src="/itsa-logo-transparent.png"
              alt="ITSA Logo"
              className="h-9 w-auto max-w-[120px] object-contain dark:invert"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <p className="display-md">ITSA</p>
          </div>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground leading-relaxed">
            A student-run engine for technology, research and responsibility at the Department of Information Technology, PCCoE Pune.
          </p>
          <div className="mt-6 space-y-1.5 font-mono text-xs text-muted-foreground">
            <p className="hover:text-foreground transition-colors">
              <a href="mailto:nirjar.patil25@pccoepune.org">nirjar.patil25@pccoepune.org</a>
            </p>
            <p>+91 9730726966</p>
            <p>Information Technology Department, PCCoE, Pune - 411044</p>
          </div>
        </div>

        <div>
          <p className="label-mono">Pages</p>
          <ul className="mt-5 space-y-2.5">
            {[
              { label: 'Home', route: '/' },
              { label: 'Events', route: '/events' },
              { label: 'Newsletter', route: '/newsletter' },
              { label: 'Admin Portal', route: '/admin/newsletter' },
            ].map((link) => (
              <li key={link.route}>
                <a
                  href={link.route}
                  onClick={(e) => handleNav(link.route, e)}
                  className="group inline-flex items-center gap-2 font-display text-xl font-bold tracking-tight text-foreground hover:text-primary transition-colors"
                >
                  <span className="inline-block h-px w-0 bg-foreground transition-all duration-300 group-hover:w-6 group-hover:bg-primary"></span>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-5 py-5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:px-8">
          <span>© 2026 ITSA · IT Department, PCCoE</span>
          <span>Student-run · Pune, India</span>
        </div>
      </div>
    </footer>
  );
}
