import React, { useState, useEffect } from 'react';
import { ExternalLink, Search, Flame } from 'lucide-react';
import EventModal from '../components/EventModal';

export default function EventsPage({ onNavigate }) {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [expandedEvent, setExpandedEvent] = useState(null);

  useEffect(() => {
    fetch('/api/events')
      .then((res) => res.json())
      .then((data) => {
        if (data.events) setEvents(data.events);
      })
      .catch(console.error);
  }, []);

  const filtered = events.filter((ev) => {
    const matchesCategory = categoryFilter === 'all' || ev.category === categoryFilter;
    const matchesSearch =
      !searchTerm ||
      ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="relative min-h-screen">
      {/* Header */}
      <header className="relative overflow-hidden border-b border-foreground/20 px-5 pb-12 pt-28 sm:px-8 sm:pb-16 sm:pt-36">
        <div aria-hidden="true" className="grid-paper pointer-events-none absolute inset-0 opacity-40"></div>

        <div className="relative mx-auto max-w-[1600px]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
              <span className="size-1.5 rounded-full bg-primary animate-pulse"></span>
              ITSA Activity Log
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Tenure Archives
            </span>
          </div>

          <h1 className="mt-6 max-w-[16ch] display-lg text-foreground">
            Where Code Meets Community.
          </h1>

          <p className="mt-5 max-w-2xl text-base sm:text-lg leading-relaxed text-muted-foreground">
            A comprehensive record of technical hackathons, AI workshops, career guidance, and community initiatives driven by the Information Technology Students' Association.
          </p>

          {/* Quick Newsletter Dispatch Banner */}
          <div className="mt-8 border border-primary/40 bg-primary/10 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary font-bold">
                ★ NEW: OFFICIAL NEWSLETTER
              </p>
              <p className="text-sm font-display font-bold text-foreground">
                Get new event invitations and hackathon registrations delivered first.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('/newsletter')}
              className="bg-foreground text-background px-5 py-2.5 font-mono text-xs uppercase tracking-[0.16em] hover:bg-foreground/90 transition-colors cursor-pointer"
            >
              Go to Newsletter →
            </button>
          </div>

          {/* Stats strip */}
          <div className="mt-8 grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-4">
            <div className="bg-background px-5 py-4">
              <p className="label-mono text-[10px]">Documented Events</p>
              <p className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-foreground">11+</p>
              <p className="mt-1 font-mono text-[10px] text-muted-foreground">Competitions & drives</p>
            </div>
            <div className="bg-background px-5 py-4">
              <p className="label-mono text-[10px]">Active Wings</p>
              <p className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-foreground">06</p>
              <p className="mt-1 font-mono text-[10px] text-muted-foreground">IEEE · MLSC · GDGC · NSS</p>
            </div>
            <div className="bg-background px-5 py-4">
              <p className="label-mono text-[10px]">Student Reach</p>
              <p className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-primary">500+</p>
              <p className="mt-1 font-mono text-[10px] text-muted-foreground">Participants engaged</p>
            </div>
            <div className="bg-background px-5 py-4">
              <p className="label-mono text-[10px]">Department</p>
              <p className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-foreground">IT · PCCoE</p>
              <p className="mt-1 font-mono text-[10px] text-muted-foreground">Pune, Maharashtra</p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="mt-10 space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'all', label: 'All Events' },
                  { id: 'competitions', label: 'Competitions & Hackathons' },
                  { id: 'workshops', label: 'Workshops & Tech' },
                  { id: 'career', label: 'Career & Academic' },
                  { id: 'community', label: 'Social & Community' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryFilter(cat.id)}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-all cursor-pointer ${
                      categoryFilter === cat.id
                        ? 'bg-foreground text-background shadow-sm'
                        : 'border border-border bg-surface text-muted-foreground hover:border-foreground/40 hover:text-foreground'
                    }`}
                  >
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>

              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border border-border bg-surface pl-9 pr-3.5 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-3 font-mono text-[11px] text-muted-foreground">
              <p>
                Showing <span className="font-bold text-foreground">{filtered.length}</span> of{' '}
                <span className="font-bold text-foreground">{events.length}</span> events
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Events Grid */}
      <section className="mx-auto max-w-[1600px] px-5 py-12 sm:px-8">
        <div className="space-y-12">
          {filtered.map((ev, idx) => (
            <article
              key={ev.id}
              className={`grid items-center gap-8 border-t border-foreground/20 pt-8 lg:grid-cols-2 ${
                idx % 2 === 1 ? 'lg:[&>figure]:order-2' : ''
              }`}
            >
              <figure
                role="button"
                tabIndex={0}
                onClick={() => setExpandedEvent(ev)}
                className="group relative overflow-hidden rounded-none bg-surface-2 cursor-pointer border border-border min-h-[220px] transition-all hover:border-primary/50"
              >
                <img
                  src={ev.poster_image_url}
                  alt={ev.title}
                  className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <figcaption className="absolute bottom-0 left-0 bg-primary px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-primary-foreground z-10">
                  {ev.formatted_date || ev.event_date}
                </figcaption>
                <div className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/75 px-3 py-1.5 text-[11px] font-mono text-white opacity-0 transition-opacity backdrop-blur-sm group-hover:opacity-100 z-10 shadow-lg pointer-events-none">
                  <ExternalLink className="size-3.5" />
                  <span>Click to expand</span>
                </div>
              </figure>

              <div className={idx % 2 === 1 ? 'lg:pr-8' : 'lg:pl-8'}>
                <div className="flex items-center gap-3">
                  <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">
                    LOG 0{idx + 1}
                  </p>
                  <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-primary">
                    {ev.category}
                  </span>
                </div>

                <h2
                  onClick={() => setExpandedEvent(ev)}
                  className="mt-3 display-md hover:text-primary transition-colors cursor-pointer"
                >
                  {ev.title}
                </h2>

                <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">
                  {ev.description}
                </p>

                <div className="mt-6 flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setExpandedEvent(ev)}
                    className="inline-flex items-center gap-2 border border-primary/50 bg-primary/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] text-primary transition-all hover:bg-primary hover:text-primary-foreground cursor-pointer"
                  >
                    <span>Show More</span>
                    <span>↓</span>
                  </button>
                  <span className="font-mono text-xs text-muted-foreground">
                    🔥 {ev.interest_count || 0} interested
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {expandedEvent && (
        <EventModal
          event={expandedEvent}
          logIndex={events.findIndex((e) => e.id === expandedEvent.id) + 1}
          onClose={() => setExpandedEvent(null)}
          onToggleInterest={() => {}}
          isInterested={false}
          isInterestLoading={false}
        />
      )}
    </div>
  );
}
