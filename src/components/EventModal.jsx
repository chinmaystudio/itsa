import React, { useEffect } from 'react';
import { X, Calendar, MapPin, Users, Flame } from 'lucide-react';

export default function EventModal({ event, logIndex, onClose, onToggleInterest, isInterested, isInterestLoading }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  if (!event) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in-0 duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-border bg-card text-card-foreground shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute right-4 top-4 grid size-8 place-items-center border border-border bg-surface text-muted-foreground hover:border-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <X className="size-4" />
        </button>

        {/* Header Metadata */}
        <div className="flex flex-wrap items-center gap-3 pr-8">
          <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">
            LOG {logIndex ? `0${logIndex}` : '01'}
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] px-2.5 py-0.5 bg-primary/10 text-primary border border-primary/20">
            {event.category}
          </span>
          {event.is_featured === 1 && (
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] px-2 py-0.5 bg-acid text-black font-bold">
              ★ FEATURED FLAGSHIP
            </span>
          )}
        </div>

        {/* Title */}
        <h2 className="mt-3 display-md text-foreground">
          {event.title}
        </h2>

        {/* Poster Image */}
        <div className="relative mt-5 overflow-hidden border border-border bg-surface-2">
          <img
            src={event.poster_image_url}
            alt={event.title}
            className="aspect-[16/10] w-full object-cover"
          />
          <div className="absolute bottom-0 left-0 bg-primary px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-primary-foreground">
            {event.formatted_date || event.event_date}
          </div>
        </div>

        {/* Info Grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 border border-border bg-surface/50 p-4">
          <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
            <Calendar className="size-3.5 text-primary shrink-0" />
            <span>{event.formatted_date || event.event_date}</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
            <MapPin className="size-3.5 text-primary shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
            <Users className="size-3.5 text-primary shrink-0" />
            <span className="truncate">{event.organizer || 'ITSA PCCoE'}</span>
          </div>
        </div>

        {/* Full Description */}
        <div className="mt-6">
          <h4 className="label-mono mb-2">Detailed Log & Agenda</h4>
          <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
            {event.full_description || event.description}
          </p>
        </div>

        {/* Photo Gallery if available */}
        {event.gallery_images && event.gallery_images.length > 0 && (
          <div className="mt-6">
            <p className="label-mono mb-3">Event Photo Archives ({event.gallery_images.length} photos)</p>
            <div className="flex gap-2.5 overflow-x-auto pb-2">
              {event.gallery_images.map((imgUrl, i) => (
                <div
                  key={i}
                  className="size-20 shrink-0 overflow-hidden border border-border bg-surface-2"
                >
                  <img src={imgUrl} alt={`Gallery ${i}`} className="size-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions Bar with Interested Button */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
          <div className="font-mono text-xs text-muted-foreground">
            <span className="font-bold text-foreground">{event.interest_count || 0}</span> students marked interested
          </div>

          <button
            type="button"
            onClick={() => onToggleInterest(event.id)}
            disabled={isInterestLoading}
            className={`group inline-flex items-center gap-2 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.18em] transition-all cursor-pointer border ${
              isInterested
                ? 'bg-primary text-primary-foreground border-primary shadow-offset-primary'
                : 'bg-surface border-border text-foreground hover:border-primary hover:bg-primary/10'
            }`}
          >
            <Flame className={`size-4 transition-transform group-hover:scale-125 ${isInterested ? 'fill-current text-acid' : 'text-primary'}`} />
            <span>{isInterested ? 'Interested ★' : 'Interested?'}</span>
            <span className="ml-1 opacity-75">({event.interest_count || 0})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
