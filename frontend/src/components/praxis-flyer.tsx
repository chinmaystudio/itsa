import * as Dialog from "@radix-ui/react-dialog";
import { ArrowUpRight, CalendarDays, MapPin, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const POSTER = "/posters/praxis-2026.jpeg";
const SESSION_KEY = "itsa-praxis-2026-seen";
// Stop advertising once the event has ended in India.
const EXPIRES_AT = Date.parse("2026-10-11T00:00:00+05:30");

export function PraxisFlyer({ ready, autoOpen }: { ready: boolean; autoOpen: boolean }) {
  const [active, setActive] = useState(false);
  const [open, setOpen] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const shown = useRef(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const remaining = EXPIRES_AT - Date.now();
    if (remaining <= 0) return;
    setActive(true);
    // Cap long timers to avoid the browser's 32-bit timeout overflow.
    const timer = window.setTimeout(
      () => {
        setActive(false);
        setOpen(false);
      },
      Math.min(remaining, 2_147_483_647),
    );
    return () => window.clearTimeout(timer);
  }, []);

  function changeOpen(next: boolean) {
    if (next) {
      previousFocus.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      shown.current = true;
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* Storage is optional. */
      }
    }
    setOpen(next);
  }

  useEffect(() => {
    if (!active || !ready || !autoOpen || shown.current) return;
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
    } catch {
      /* Still usable in private mode. */
    }
    const timer = window.setTimeout(() => {
      // Avoid interrupting typing, another dialog, or a background tab.
      if (
        document.hidden ||
        document.querySelector('[role="dialog"], [role="alertdialog"]') ||
        document.activeElement?.matches("input, textarea, select, [contenteditable=true]")
      )
        return;
      changeOpen(true);
    }, 900);
    return () => window.clearTimeout(timer);
  }, [active, ready, autoOpen]);

  if (!active || !ready) return null;

  return (
    <Dialog.Root open={open} onOpenChange={changeOpen}>
      <Dialog.Trigger ref={trigger} className="praxis-launcher">
        <span className="praxis-launcher-dot" aria-hidden="true" />
        PRAXIS ’26 <span className="praxis-launcher-label"> / View flyer</span>
        <ArrowUpRight size={16} aria-hidden="true" />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="praxis-overlay" />
        <Dialog.Content
          className="praxis-dialog"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            close.current?.focus();
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            const previous = previousFocus.current;
            (previous?.isConnected && previous !== document.body
              ? previous
              : trigger.current
            )?.focus({ preventScroll: true });
          }}
        >
          <header className="praxis-header">
            <span className="label-mono">ITSA × PCCoE / Featured event</span>
            <Dialog.Close ref={close} className="praxis-close" aria-label="Close PRAXIS flyer">
              <X size={22} aria-hidden="true" />
            </Dialog.Close>
          </header>
          <div className="praxis-scroll">
            <div className="praxis-poster">
              {imageFailed ? (
                <p>Poster unavailable. Event details are below.</p>
              ) : (
                <img
                  src={POSTER}
                  width={1024}
                  height={1536}
                  decoding="async"
                  alt="PRAXIS 2026 event poster with an illuminated gauntlet and five event emblems."
                  onError={() => setImageFailed(true)}
                />
              )}
            </div>
            <div className="praxis-details">
              <p className="label-mono">Ideas. Build. Beyond.</p>
              <Dialog.Title className="praxis-title">
                PRAXIS<span>’26</span>
              </Dialog.Title>
              <Dialog.Description className="praxis-description">
                Two days of ideas, research and impact. Assemble with the IT community at PCCoE.
              </Dialog.Description>
              <div className="praxis-facts">
                <div>
                  <CalendarDays size={20} aria-hidden="true" />
                  <dl>
                    <dt>Save the dates</dt>
                    <dd>9–10 October 2026</dd>
                  </dl>
                </div>
                <div>
                  <MapPin size={20} aria-hidden="true" />
                  <dl>
                    <dt>Meet us at</dt>
                    <dd>
                      IT Department, 5th Building
                      <br />
                      PCCoE, Nigdi
                    </dd>
                  </dl>
                </div>
              </div>
              <p className="label-mono">Five ways to take part</p>
              <ul className="praxis-events">
                <li>The Infinity Trials</li>
                <li>ResearchX</li>
                <li>BGMI — Elite Showdown</li>
                <li>Storyverse</li>
                <li>Tech Roulette</li>
              </ul>
              <a
                className="praxis-register"
                href="https://praxis26.in"
                target="_blank"
                rel="noopener noreferrer"
              >
                Explore & register <ArrowUpRight size={20} aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
              <div className="praxis-secondary">
                <a href={POSTER} target="_blank" rel="noopener noreferrer">
                  View full poster<span className="sr-only"> (opens in a new tab)</span>
                </a>
                <Dialog.Close>Maybe later</Dialog.Close>
              </div>
              <p className="praxis-signoff">Assemble. Celebrate. Conquer.</p>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
