import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle2, AlertCircle, Flame, ExternalLink, Loader2 } from 'lucide-react';
import EventModal from '../components/EventModal';
import HypePopup from '../components/HypePopup';

export default function NewsletterPage({ onNavigate }) {
  // Subscribe state
  const [email, setEmail] = useState('');
  const [subStatus, setSubStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [subMessage, setSubMessage] = useState('');
  const [devToken, setDevToken] = useState(null);

  // Events & Interest state
  const [events, setEvents] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [userInterests, setUserInterests] = useState({});
  const [interestLoading, setInterestLoading] = useState({});

  // Unique visitor identifier
  const [userIdentifier, setUserIdentifier] = useState('');

  useEffect(() => {
    let uid = localStorage.getItem('itsa-user-uid');
    if (!uid) {
      uid = 'usr-' + Math.random().toString(36).substring(2, 11);
      localStorage.setItem('itsa-user-uid', uid);
    }
    setUserIdentifier(uid);

    // Fetch events
    fetchEvents(uid);
  }, []);

  const fetchEvents = async (uid) => {
    try {
      const res = await fetch(`/api/events?userIdentifier=${uid}`);
      const data = await res.json();
      if (data.events) {
        setEvents(data.events);
        const map = {};
        data.events.forEach((ev) => {
          if (ev.userInterested) map[ev.id] = true;
        });
        setUserInterests(map);
      }
    } catch (err) {
      console.error('Failed to load events:', err);
    }
  };

  // Handle subscription submit
  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setSubStatus('error');
      setSubMessage('Please enter a valid academic or personal email address.');
      return;
    }

    setSubStatus('loading');
    setSubMessage('');
    setDevToken(null);

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setSubStatus('error');
        setSubMessage(data.error || 'Failed to submit subscription request.');
      } else {
        setSubStatus('success');
        setSubMessage(data.message || 'Verification link dispatched. Check your inbox to confirm.');
        if (data.token) {
          setDevToken(data.token);
        }
      }
    } catch (err) {
      setSubStatus('error');
      setSubMessage('Network connection error. Please try again.');
    }
  };

  // Toggle event interest
  const handleToggleInterest = async (eventId) => {
    if (interestLoading[eventId]) return;
    setInterestLoading((prev) => ({ ...prev, [eventId]: true }));

    try {
      const res = await fetch(`/api/events/${eventId}/interest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIdentifier }),
      });
      const data = await res.json();

      if (data.success) {
        setUserInterests((prev) => ({
          ...prev,
          [eventId]: data.interested,
        }));

        setEvents((prev) =>
          prev.map((ev) => (ev.id === eventId ? { ...ev, interest_count: data.interest_count } : ev))
        );

        if (expandedEvent && expandedEvent.id === eventId) {
          setExpandedEvent((prev) => ({ ...prev, interest_count: data.interest_count }));
        }
      }
    } catch (err) {
      console.error('Failed to toggle interest:', err);
    } finally {
      setInterestLoading((prev) => ({ ...prev, [eventId]: false }));
    }
  };

  // Find flagship / featured upcoming event for the popup
  const featuredEvent = events.find((e) => e.is_featured === 1) || events[0];

  // Filter events
  const filteredEvents = events.filter((ev) => {
    if (selectedCategory === 'all') return true;
    return ev.category === selectedCategory;
  });

  const categories = [
    { id: 'all', label: 'All Dispatches' },
    { id: 'competitions', label: 'Competitions & Hackathons' },
    { id: 'workshops', label: 'Workshops & Tech' },
    { id: 'career', label: 'Career & Higher Studies' },
    { id: 'community', label: 'Community & Chapters' },
  ];

  return (
    <div className="relative min-h-screen">
      {/* 1. HERO & HEADER BLOCK */}
      <section className="relative overflow-hidden border-b border-foreground/20 px-5 pb-14 pt-28 sm:px-8 sm:pb-20 sm:pt-36">
        <div aria-hidden="true" className="grid-paper pointer-events-none absolute inset-0 opacity-40"></div>

        <div className="relative mx-auto max-w-[1600px]">
          {/* Top metadata tags */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-foreground/20 pb-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                <span className="size-1.5 rounded-full bg-primary animate-pulse"></span>
                03 — NEWSLETTER
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                OFFICIAL DISPATCHES
              </span>
            </div>
            <p className="label-mono">DEPARTMENT OF INFORMATION TECHNOLOGY · PCCOE PUNE</p>
          </div>

          {/* Big Typography Header */}
          <div className="grid gap-8 pt-10 lg:grid-cols-[1.6fr_1fr]">
            <div>
              <h1 className="display-xl">
                <span className="block">Stay in the loop.</span>
              </h1>
              <div className="relative mt-1">
                <h1 className="display-xl text-outline">
                  <span className="block">Every event, before it happens.</span>
                </h1>
              </div>
              <div className="mt-6 h-[6px] w-full bg-acid"></div>
            </div>

            <div className="flex flex-col justify-end">
              <p className="text-base sm:text-lg leading-relaxed text-muted-foreground">
                Direct dispatches from the student-run engine: hackathon announcements, national symposiums, AI workshops, higher education guidance, and department accolades delivered directly to your inbox.
              </p>

              {/* Stat Strip */}
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-px border border-border bg-border">
                <div className="bg-background px-4 py-3">
                  <p className="label-mono text-[9px]">Verified Reach</p>
                  <p className="mt-1 font-display text-2xl font-extrabold text-foreground">500+</p>
                  <p className="font-mono text-[9px] text-muted-foreground">Subscribed students</p>
                </div>
                <div className="bg-background px-4 py-3">
                  <p className="label-mono text-[9px]">Annual Events</p>
                  <p className="mt-1 font-display text-2xl font-extrabold text-foreground">18+</p>
                  <p className="font-mono text-[9px] text-muted-foreground">Technical initiatives</p>
                </div>
                <div className="col-span-2 sm:col-span-1 bg-background px-4 py-3">
                  <p className="label-mono text-[9px]">Frequency</p>
                  <p className="mt-1 font-display text-2xl font-extrabold text-primary">Bi-Weekly</p>
                  <p className="font-mono text-[9px] text-muted-foreground">Zero spam guarantee</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scrolling Marquee Ticker */}
        <div className="relative overflow-hidden mt-16 -mx-5 sm:-mx-8 border-y border-foreground/20 bg-foreground py-3.5 font-mono text-[11px] uppercase tracking-[0.3em] text-background">
          <div className="marquee-track" style={{ animationDuration: '32s' }}>
            <span className="flex shrink-0 items-center gap-8 pr-8">
              NEVER MISS AN EVENT
              <span aria-hidden="true" className="text-[0.6em] opacity-60">◆</span>
            </span>
            <span className="flex shrink-0 items-center gap-8 pr-8">
              GET NOTIFIED FIRST
              <span aria-hidden="true" className="text-[0.6em] opacity-60">◆</span>
            </span>
            <span className="flex shrink-0 items-center gap-8 pr-8">
              PRAXIS 2026 COMING SOON
              <span aria-hidden="true" className="text-[0.6em] opacity-60">◆</span>
            </span>
            <span className="flex shrink-0 items-center gap-8 pr-8">
              BRUTEFORGE HACKATHONS
              <span aria-hidden="true" className="text-[0.6em] opacity-60">◆</span>
            </span>
            <span className="flex shrink-0 items-center gap-8 pr-8">
              AI EXPERT MASTERCLASSES
              <span aria-hidden="true" className="text-[0.6em] opacity-60">◆</span>
            </span>
            <span className="flex shrink-0 items-center gap-8 pr-8">
              $5,000 IEEE STUDENT GRANT
              <span aria-hidden="true" className="text-[0.6em] opacity-60">◆</span>
            </span>
            <span className="flex shrink-0 items-center gap-8 pr-8">
              NEVER MISS AN EVENT
              <span aria-hidden="true" className="text-[0.6em] opacity-60">◆</span>
            </span>
            <span className="flex shrink-0 items-center gap-8 pr-8">
              GET NOTIFIED FIRST
              <span aria-hidden="true" className="text-[0.6em] opacity-60">◆</span>
            </span>
            <span className="flex shrink-0 items-center gap-8 pr-8">
              PRAXIS 2026 COMING SOON
              <span aria-hidden="true" className="text-[0.6em] opacity-60">◆</span>
            </span>
          </div>
        </div>
      </section>

      {/* 2. SUBSCRIBE BLOCK — EXACT REFERENCE UI */}
      <section className="border-b border-foreground/20 bg-surface px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-[720px] text-left">
          {/* Display Heading */}
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground uppercase">
            SIGN UP
          </h2>

          {/* Tracked Subline */}
          <p className="mt-2.5 font-mono text-[11px] sm:text-xs uppercase tracking-[0.25em] text-muted-foreground">
            FOR SPECIAL PROMOTIONS &amp; UPDATES
          </p>

          {/* Underlined Single-Line Input + Submit Row */}
          <form onSubmit={handleSubscribe} className="mt-10">
            <div className="flex items-end justify-between border-b border-foreground/30 focus-within:border-foreground transition-colors pb-1.5">
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (subStatus !== 'idle') setSubStatus('idle');
                }}
                placeholder="Email address..."
                disabled={subStatus === 'loading'}
                className="w-full bg-transparent border-0 outline-none font-mono text-sm sm:text-base text-foreground placeholder:text-muted-foreground/60 py-1.5 focus:ring-0"
              />
              <button
                type="submit"
                disabled={subStatus === 'loading'}
                className="ml-4 font-mono text-sm sm:text-base font-semibold text-foreground hover:text-primary transition-colors whitespace-nowrap py-1.5 pr-1 cursor-pointer disabled:opacity-50"
              >
                {subStatus === 'loading' ? 'Signing up...' : 'Sign up'}
              </button>
            </div>

            {/* Minimal Inline Feedback */}
            {subStatus === 'success' && (
              <div className="mt-4 font-mono text-xs text-primary animate-in fade-in-0 duration-200">
                <span>{subMessage || 'Verification link dispatched. Check your inbox to confirm.'}</span>
                {devToken && (
                  <span className="block mt-2 text-[11px] text-muted-foreground">
                    [Dev simulation:{' '}
                    <a
                      href={`/newsletter/verify?token=${devToken}`}
                      onClick={(e) => {
                        e.preventDefault();
                        if (onNavigate) onNavigate(`/newsletter/verify?token=${devToken}`);
                      }}
                      className="underline text-primary hover:text-foreground font-semibold"
                    >
                      Click here to simulate verifying now →
                    </a>
                    ]
                  </span>
                )}
              </div>
            )}

            {subStatus === 'error' && (
              <div className="mt-4 font-mono text-xs text-destructive animate-in fade-in-0 duration-200">
                {subMessage || 'Please enter a valid email address.'}
              </div>
            )}
          </form>
        </div>
      </section>

      {/* 3. UPCOMING EVENTS BLOCK (POSTER SHOWCASE) */}
      <section id="upcoming-events" className="mx-auto max-w-[1600px] px-5 py-20 sm:px-8 sm:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-foreground/20 pb-8">
          <div>
            <p className="label-mono">03.1 — POSTER SHOWCASE & HYPE BOARD</p>
            <h2 className="mt-3 display-md text-foreground">Upcoming & Documented Events</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Click any poster card to inspect detailed logs, photo galleries, or express live hype interest.
            </p>
          </div>

          {/* Category Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-all cursor-pointer ${
                    active
                      ? 'bg-foreground text-background font-semibold shadow-sm'
                      : 'border border-border bg-surface text-muted-foreground hover:border-foreground/40 hover:text-foreground'
                  }`}
                >
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Events Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredEvents.map((ev, index) => {
            const isInterested = !!userInterests[ev.id];
            const isLoading = !!interestLoading[ev.id];

            return (
              <article
                key={ev.id}
                id={ev.slug || ev.id}
                className="ink-card group flex flex-col justify-between border border-border bg-card p-6 sm:p-7 hover:-translate-y-1 hover:offset-shadow-primary transition-all duration-300"
              >
                <div>
                  {/* Poster Clickable Thumbnail */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setExpandedEvent(ev)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') setExpandedEvent(ev);
                    }}
                    className="relative overflow-hidden border border-border bg-surface-2 cursor-pointer aspect-[16/10]"
                  >
                    <img
                      src={ev.poster_image_url}
                      alt={ev.title}
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Date Tag */}
                    <div className="absolute bottom-0 left-0 bg-primary px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-primary-foreground z-10">
                      {ev.formatted_date || ev.event_date}
                    </div>

                    {/* "Click to expand" overlay affordance */}
                    <div className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/75 px-3 py-1.5 text-[10px] font-mono text-white opacity-0 transition-opacity backdrop-blur-sm group-hover:opacity-100 z-10 pointer-events-none">
                      <ExternalLink className="size-3" />
                      <span>Click to expand</span>
                    </div>

                    {ev.is_featured === 1 && (
                      <div className="absolute top-3 left-3 bg-acid px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] font-extrabold text-black z-10">
                        FLAGSHIP
                      </div>
                    )}
                  </div>

                  {/* Metadata Header */}
                  <div className="mt-5 flex items-center gap-3">
                    <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">
                      LOG 0{index + 1}
                    </p>
                    <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-primary font-semibold">
                      {ev.category}
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    onClick={() => setExpandedEvent(ev)}
                    className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground hover:text-primary transition-colors cursor-pointer"
                  >
                    {ev.title}
                  </h3>

                  {/* Teaser */}
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {ev.description}
                  </p>
                </div>

                {/* Footer of card: Expand Link & Interested Button */}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                  <button
                    type="button"
                    onClick={() => setExpandedEvent(ev)}
                    className="font-mono text-[11px] uppercase tracking-[0.16em] text-foreground hover:text-primary transition-colors cursor-pointer"
                  >
                    Details & Gallery →
                  </button>

                  {/* Live Hype Counter Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleInterest(ev.id)}
                    disabled={isLoading}
                    title="Click to express hype/interest"
                    className={`group/btn inline-flex items-center gap-2 px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.16em] transition-all border cursor-pointer ${
                      isInterested
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border bg-surface text-foreground hover:border-primary hover:bg-primary/10'
                    }`}
                  >
                    <Flame
                      className={`size-3.5 transition-transform duration-200 group-hover/btn:scale-125 ${
                        isInterested ? 'fill-current text-acid' : 'text-primary'
                      }`}
                    />
                    <span>{isInterested ? 'Hyped' : 'Interested'}</span>
                    <span className="font-bold opacity-80">({ev.interest_count || 0})</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 4. EVENT POPUP (SESSION-BASED HYPE MODAL) */}
      <HypePopup
        featuredEvent={featuredEvent}
        onSelectEvent={(ev) => {
          setExpandedEvent(ev);
          const el = document.getElementById(ev.slug || ev.id);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onToggleInterest={handleToggleInterest}
        isInterested={featuredEvent ? !!userInterests[featuredEvent.id] : false}
      />

      {/* 5. IN-PLACE / EXPANDED EVENT MODAL */}
      {expandedEvent && (
        <EventModal
          event={expandedEvent}
          logIndex={events.findIndex((e) => e.id === expandedEvent.id) + 1}
          onClose={() => setExpandedEvent(null)}
          onToggleInterest={handleToggleInterest}
          isInterested={!!userInterests[expandedEvent.id]}
          isInterestLoading={!!interestLoading[expandedEvent.id]}
        />
      )}
    </div>
  );
}
