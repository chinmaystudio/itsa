import { useEffect, useState } from 'react';
import { ArrowLeft, CalendarDays, Code2, Lightbulb, Trophy, X } from 'lucide-react';
import { PRAXIS_EVENTS } from '@/data/praxis';

const browserImage = (image: string) => image.replace(
  '/image/upload/',
  '/image/upload/f_auto,q_auto,w_900,c_limit/',
);

const ACHIEVEMENTS = PRAXIS_EVENTS
  .slice()
  .sort((firstEvent, secondEvent) => {
    const parseDate = (date: string) => new Date(date.replace(/(\d+)(st|nd|rd|th)/, '$1')).getTime();
    return parseDate(secondEvent.date) - parseDate(firstEvent.date);
  })
  .map((event, index) => ({
    id: event.id,
    year: event.date.slice(-4),
    title: event.name,
    description: event.overview || 'An ITSA initiative created for practical learning, collaboration, and student growth.',
    icon: event.name.toLowerCase().includes('competition') || event.name.toLowerCase().includes('bruteforge') || event.name.toLowerCase().includes('webcrafter') ? 'Trophy' : index % 3 === 0 ? 'Code2' : 'Lightbulb',
    category: event.name.toLowerCase().includes('competition') || event.name.toLowerCase().includes('bruteforge') || event.name.toLowerCase().includes('webcrafter') || event.name.toLowerCase().includes('school activity') ? 'Competition' : 'Student Initiative',
    date: event.date,
    venue: event.venue,
    participants: event.participants,
    highlights: event.highlights || [],
    outcome: event.outcome,
    coverImage: browserImage(event.coverImage || event.images[0]),
    imageCaptions: event.imageCaptions,
    images: event.images.map(browserImage),
  }));

export default function Achievements() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<{ image: string; caption?: string; title: string } | null>(null);
  const selectedAchievement = ACHIEVEMENTS.find((achievement) => achievement.id === selectedId);

  useEffect(() => {
    document.body.style.overflow = selectedAchievement || selectedImage ? 'hidden' : '';
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (selectedImage) setSelectedImage(null);
        else setSelectedId(null);
      }
    };
    if (selectedAchievement || selectedImage) window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [selectedAchievement, selectedImage]);

  return (
    <main className="relative min-h-screen overflow-hidden px-5 py-12 md:px-10 md:py-16">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.22),transparent_42%),linear-gradient(180deg,#0b0620,#150c34_55%,#180a2e)]" />
      <header className="relative z-10 mx-auto max-w-5xl text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.3em] text-amber-400">PCCOE ITSA</p>
        <h1 className="font-display text-4xl font-black gradient-text neon-text md:text-6xl">Achievements</h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-400">
          Competitions and student initiatives documented by the Information Technology Student Association.
        </p>
      </header>

      <section className="relative z-10 mx-auto max-w-4xl px-0 py-16">
        <div className="relative">
          <div className="absolute bottom-0 left-6 top-0 w-1 rounded-full timeline-line md:left-1/2 md:-translate-x-1/2" />
          {ACHIEVEMENTS.map((achievement, index) => {
            const Icon = achievement.icon === 'Code2' ? Code2 : achievement.icon === 'Lightbulb' ? Lightbulb : Trophy;
            const isLeft = index % 2 === 0;
            return (
              <button
                key={achievement.id}
                type="button"
                onClick={() => setSelectedId(achievement.id)}
                className={`group relative mb-12 flex w-full items-start !text-left first:pt-8 ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                aria-label={`Open details for ${achievement.title}`}
              >
                <span className="absolute left-6 top-0 z-10 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-xl glass-strong text-amber-400 shadow-[0_0_25px_rgba(251,146,60,0.3)] transition duration-300 group-hover:scale-110 md:left-1/2 md:h-14 md:w-14">
                  <Icon className="h-7 w-7" />
                </span>
                <span className="ml-20 block w-full rounded-2xl glass-card p-6 !text-left transition duration-300 group-hover:-translate-y-1 group-hover:border-amber-400/60 group-hover:shadow-[0_18px_45px_rgba(168,85,247,0.2)] md:ml-0 md:w-[calc(50%-3rem)]">
                  <span className="relative mb-5 block h-28 overflow-hidden rounded-lg border border-amber-400/20">
                    <img src={achievement.coverImage} alt={achievement.title} className="h-full w-full object-cover opacity-70 transition duration-500 group-hover:scale-105 group-hover:opacity-100" loading="lazy" decoding="async" sizes="(max-width: 768px) calc(100vw - 100px), 360px" />
                    <span className="absolute bottom-2 left-3 text-[10px] uppercase tracking-[0.2em] text-amber-200/80">ITSA Milestone</span>
                  </span>
                  <span className="mb-2 flex items-center justify-start gap-2">
                    <span className="font-display text-2xl font-black gradient-text">{achievement.year}</span>
                    <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-amber-300">{achievement.category}</span>
                  </span>
                  <span className="mt-2 block font-display text-lg font-bold text-violet-100">{achievement.title}</span>
                  <span className="mt-2 line-clamp-3 block text-sm leading-relaxed text-slate-400">{achievement.description}</span>
                  <span className="mt-4 block text-xs font-semibold uppercase tracking-widest text-amber-300">Open achievement</span>
                </span>
              </button>
            );
          })}
          <div className="absolute bottom-0 left-6 -translate-x-1/2 md:left-1/2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full glass-strong text-fuchsia-400 pulse-glow">
              <Trophy className="h-6 w-6" />
            </div>
          </div>
        </div>
      </section>

      {selectedAchievement && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#070313]/85 p-4 backdrop-blur-md md:p-8" onMouseDown={() => setSelectedId(null)}>
          <article
            role="dialog"
            aria-modal="true"
            aria-labelledby="achievement-title"
            className="relative my-0 flex max-h-[calc(100vh-2rem)] w-full max-w-3xl flex-col overflow-y-auto rounded-2xl glass-card p-5 shadow-[0_25px_100px_rgba(0,0,0,0.65)] md:max-h-[calc(100vh-4rem)] md:p-8"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 z-20 -mx-2 mb-6 flex items-center justify-between gap-3 bg-[#180d33]/95 px-2 pb-4 pt-1 backdrop-blur-md">
              <button type="button" onClick={() => setSelectedId(null)} className="inline-flex items-center gap-2 rounded-lg border border-violet-400/30 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-violet-200 transition hover:border-amber-400/60 hover:text-amber-300" aria-label="Back to achievements">
                <ArrowLeft className="h-4 w-4" />
                Back to achievements
              </button>
              <button type="button" onClick={() => setSelectedId(null)} className="rounded-full glass p-2 text-slate-300 transition hover:text-white" aria-label="Close achievement details">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-6 border-b border-violet-400/20 pb-6">
              <div className="mb-3 flex flex-wrap items-center gap-3 text-sm text-amber-300">
                <CalendarDays className="h-5 w-5 text-amber-400" />
                <span>{selectedAchievement.date}</span>
                <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-amber-300">
                  {selectedAchievement.category}
                </span>
              </div>
              <h2 id="achievement-title" className="font-display text-2xl font-black text-violet-100 md:text-3xl">{selectedAchievement.title}</h2>
            </div>

            {(selectedAchievement.venue || selectedAchievement.participants) && (
              <section className="mt-8" aria-labelledby="event-details-title">
                <h3 id="event-details-title" className="font-display text-sm font-bold uppercase tracking-[0.2em] text-amber-300">Event details</h3>
                <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                  {selectedAchievement.venue && <div className="glass rounded-lg p-3"><dt className="text-xs uppercase tracking-wider text-slate-500">Venue</dt><dd className="mt-1 text-slate-300">{selectedAchievement.venue}</dd></div>}
                  {selectedAchievement.participants && <div className="glass rounded-lg p-3"><dt className="text-xs uppercase tracking-wider text-slate-500">Participants</dt><dd className="mt-1 text-slate-300">{selectedAchievement.participants}</dd></div>}
                </dl>
              </section>
            )}

            <section className="mt-8" aria-labelledby="event-overview-title">
              <h3 id="event-overview-title" className="font-display text-sm font-bold uppercase tracking-[0.2em] text-amber-300">Event overview</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{selectedAchievement.description}</p>
            </section>

            {selectedAchievement.highlights.length > 0 && (
              <section className="mt-8" aria-labelledby="event-highlights-title">
                <h3 id="event-highlights-title" className="font-display text-sm font-bold uppercase tracking-[0.2em] text-amber-300">Highlights</h3>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
                  {selectedAchievement.highlights.map((highlight) => <li key={highlight} className="border-l-2 border-amber-400/50 pl-3">{highlight}</li>)}
                </ul>
              </section>
            )}

            {selectedAchievement.outcome && (
              <section className="mt-8" aria-labelledby="event-outcome-title">
                <h3 id="event-outcome-title" className="font-display text-sm font-bold uppercase tracking-[0.2em] text-amber-300">Outcome</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{selectedAchievement.outcome}</p>
              </section>
            )}

            <section className="mt-8" aria-labelledby="event-gallery-title">
              <div className="mb-4 flex items-center justify-between gap-4">
                <h3 id="event-gallery-title" className="font-display text-sm font-bold uppercase tracking-[0.2em] text-amber-300">Photo record</h3>
                <span className="text-xs text-slate-500">{selectedAchievement.images.length} {selectedAchievement.images.length === 1 ? 'photo' : 'photos'}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {selectedAchievement.images.map((image, index) => {
                  const caption = selectedAchievement.imageCaptions?.[index];
                  const isLogo = caption?.toLowerCase().includes('logo');
                  return (
                    <figure key={image} className="group">
                      <button type="button" className="block w-full cursor-zoom-in text-left" onClick={() => setSelectedImage({ image, caption: selectedAchievement.imageCaptions?.[index], title: selectedAchievement.title })} aria-label={`Enlarge ${selectedAchievement.title} photo ${index + 1}`}>
                        <img src={image} alt={`${selectedAchievement.title}, photo ${index + 1}`} className={`aspect-square w-full rounded-lg border border-violet-400/20 ${isLogo ? 'bg-white object-contain p-3' : 'object-cover'} transition duration-300 group-hover:border-amber-400/50`} loading="lazy" decoding="async" sizes="(max-width: 768px) 45vw, 280px" />
                      </button>
                      {caption && <figcaption className="mt-2 text-[10px] uppercase tracking-widest text-slate-500">{caption}</figcaption>}
                    </figure>
                  );
                })}
              </div>
            </section>

            <div className="mt-8 border-t border-violet-400/20 pt-4 text-xs uppercase tracking-widest text-slate-500">
              PCCOE ITSA event archive
            </div>
          </article>
        </div>
      )}

      {selectedImage && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm" onMouseDown={() => setSelectedImage(null)}>
          <div className="relative flex max-h-full max-w-6xl flex-col items-center" onMouseDown={(event) => event.stopPropagation()}>
            <button type="button" onClick={() => setSelectedImage(null)} className="absolute right-2 top-2 z-10 rounded-full bg-black/70 p-2 text-white transition hover:bg-black hover:text-amber-300" aria-label="Close enlarged photo">
              <X className="h-6 w-6" />
            </button>
            <img src={selectedImage.image} alt={selectedImage.title} className="max-h-[calc(100vh-7rem)] max-w-full rounded-lg object-contain shadow-2xl" />
            {selectedImage.caption && <p className="mt-3 text-center text-xs uppercase tracking-[0.2em] text-slate-300">{selectedImage.caption}</p>}
          </div>
        </div>
      )}
    </main>
  );
}
