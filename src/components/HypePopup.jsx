import React, { useState, useEffect } from 'react';
import { X, Flame, Sparkles, ArrowRight } from 'lucide-react';

export default function HypePopup({ featuredEvent, onSelectEvent, onToggleInterest, isInterested }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show only once per browser session
    const hasSeen = sessionStorage.getItem('itsa-hype-popup-dismissed');
    if (hasSeen || !featuredEvent) return;

    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, [featuredEvent]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleDismiss = () => {
    setIsOpen(false);
    sessionStorage.setItem('itsa-hype-popup-dismissed', 'true');
  };

  const handleViewDetails = () => {
    handleDismiss();
    if (onSelectEvent) {
      onSelectEvent(featuredEvent);
    }
  };

  if (!isOpen || !featuredEvent) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in-0 duration-300"
      onClick={handleDismiss}
    >
      <div
        className="relative w-full max-w-lg border-2 border-foreground bg-card text-card-foreground shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss announcement"
          className="absolute right-4 top-4 grid size-8 place-items-center border border-border bg-surface text-muted-foreground hover:border-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <X className="size-4" />
        </button>

        {/* Badge Strip */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 bg-acid px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.2em] font-extrabold text-black">
            <Sparkles className="size-3" />
            HYPE ALERT · NEXT UP
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
            TENURE 2026–27
          </span>
        </div>

        {/* Title */}
        <h3 className="mt-4 font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          {featuredEvent.title}
        </h3>

        {/* Date & Location */}
        <p className="mt-1 font-mono text-xs text-primary font-medium">
          {featuredEvent.formatted_date || featuredEvent.event_date} &nbsp;·&nbsp; {featuredEvent.location}
        </p>

        {/* Poster Image */}
        <div className="relative mt-4 overflow-hidden border border-border bg-surface-2">
          <img
            src={featuredEvent.poster_image_url}
            alt={featuredEvent.title}
            className="aspect-[16/9] w-full object-cover"
          />
          <div className="absolute top-2 left-2 bg-black/85 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-white backdrop-blur-xs">
            {featuredEvent.category}
          </div>
        </div>

        {/* Hook */}
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {featuredEvent.description}
        </p>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap items-center gap-3 pt-4 border-t border-border">
          <button
            type="button"
            onClick={handleViewDetails}
            className="group flex-1 inline-flex items-center justify-center gap-2 bg-foreground px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-background hover:bg-foreground/90 transition-colors cursor-pointer"
          >
            <span>View Details</span>
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
          </button>

          <button
            type="button"
            onClick={() => onToggleInterest(featuredEvent.id)}
            className={`inline-flex items-center gap-2 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em] border transition-colors cursor-pointer ${
              isInterested
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border bg-surface text-foreground hover:border-primary hover:bg-primary/10'
            }`}
          >
            <Flame className={`size-3.5 ${isInterested ? 'fill-current text-acid' : 'text-primary'}`} />
            <span>{isInterested ? 'Hyped!' : 'Interested'}</span>
            <span className="opacity-75">({featuredEvent.interest_count || 0})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
