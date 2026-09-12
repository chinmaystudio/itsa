import React, { useState } from 'react';
import ThemeToggle from './ThemeToggle';

export default function Navbar({ currentRoute = '/newsletter', onNavigate }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { num: '01', label: 'Home', route: '/' },
    { num: '02', label: 'Events', route: '/events' },
    { num: '03', label: 'Newsletter', route: '/newsletter' },
    { num: '04', label: 'Admin', route: '/admin/newsletter' },
  ];

  const handleNav = (route, e) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(route);
    } else {
      window.history.pushState({}, '', route);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="border-b transition-all duration-300 border-border/50 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-5 py-3 sm:px-8">
          {/* Brand Logo */}
          <a
            href="/"
            onClick={(e) => handleNav('/', e)}
            className="group flex items-center gap-3"
          >
            <img
              src="/itsa-logo-transparent.png"
              alt="ITSA Logo"
              className="h-8 w-auto max-w-[100px] object-contain transition-transform duration-300 group-hover:scale-105 dark:invert"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <span className="leading-none">
              <span className="block font-display text-base font-extrabold tracking-tight">ITSA</span>
              <span className="label-mono block text-[8px] tracking-[0.2em]">PCCoE · Pune</span>
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden items-center lg:flex space-x-1">
            {navItems.map((item) => {
              const isActive = currentRoute === item.route;
              return (
                <a
                  key={item.route}
                  href={item.route}
                  onClick={(e) => handleNav(item.route, e)}
                  className={`group relative block overflow-hidden px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors ${
                    isActive ? 'text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span className="pointer-events-none absolute inset-x-3 bottom-1 h-px origin-right scale-x-0 bg-foreground transition-transform duration-300 group-hover:origin-left group-hover:scale-x-100"></span>
                  {isActive && (
                    <span className="absolute inset-x-3 bottom-1 h-[3px] bg-primary"></span>
                  )}
                  <span>
                    <span className="mr-1 text-[9px] opacity-50">{item.num}</span>
                    {item.label}
                  </span>
                </a>
              );
            })}
          </nav>

          {/* Controls: Theme Switcher & Mobile Menu Button */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              className="flex size-9 flex-col items-center justify-center gap-1.5 border border-foreground/25 bg-surface lg:hidden cursor-pointer hover:border-foreground/60 transition-colors"
            >
              <span
                className={`h-px w-4 bg-foreground transition-transform duration-300 ${
                  mobileMenuOpen ? 'translate-y-[3.5px] rotate-45' : ''
                }`}
              ></span>
              <span
                className={`h-px w-4 bg-foreground transition-transform duration-300 ${
                  mobileMenuOpen ? '-translate-y-[3.5px] -rotate-45' : ''
                }`}
              ></span>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-border bg-background px-5 py-6 sm:px-8 lg:hidden animate-in fade-in-0 duration-200">
            <nav className="flex flex-col space-y-3">
              {navItems.map((item) => {
                const isActive = currentRoute === item.route;
                return (
                  <a
                    key={item.route}
                    href={item.route}
                    onClick={(e) => handleNav(item.route, e)}
                    className={`flex items-center justify-between py-2 font-mono text-xs uppercase tracking-[0.18em] ${
                      isActive ? 'text-primary font-bold border-l-2 border-primary pl-3' : 'text-muted-foreground hover:text-foreground pl-1'
                    }`}
                  >
                    <span>
                      <span className="mr-2 text-[10px] opacity-50">{item.num}</span>
                      {item.label}
                    </span>
                    <span>→</span>
                  </a>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
