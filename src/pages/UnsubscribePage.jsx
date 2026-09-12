import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

export default function UnsubscribePage({ onNavigate }) {
  const [status, setStatus] = useState('processing');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Unsubscribe link is missing a valid token.');
      return;
    }

    fetch(`/api/unsubscribe?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus('success');
          setEmail(data.email);
          setMessage(data.message || 'You have been unsubscribed.');
        } else {
          setStatus('error');
          setMessage(data.error || 'Failed to unsubscribe.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Network error. Please try again.');
      });
  }, []);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-5 py-24 sm:px-8">
      <div className="relative w-full max-w-lg border border-border bg-card p-8 sm:p-10 shadow-lg">
        <p className="label-mono mb-2">SYSTEM DISPATCH · PREFERENCES</p>

        {status === 'processing' && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
            <h2 className="mt-4 font-display text-2xl font-bold text-foreground">
              Processing Unsubscribe...
            </h2>
            <p className="mt-2 font-mono text-xs text-muted-foreground">
              Updating your dispatch distribution settings
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="animate-in fade-in-0 duration-300">
            <div className="flex items-center gap-3 text-muted-foreground mb-3">
              <CheckCircle2 className="size-6 text-foreground" />
              <span className="font-mono text-xs uppercase tracking-[0.2em]">
                Status: Unsubscribed
              </span>
            </div>

            <h2 className="font-display text-3xl font-extrabold tracking-tight text-foreground">
              You've been removed from the list.
            </h2>

            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground">{email}</strong> will no longer receive periodic email dispatches from ITSA PCCoE.
            </p>

            <div className="mt-8 border-t border-border pt-6 flex flex-wrap items-center justify-between gap-4">
              <span className="font-mono text-xs text-muted-foreground">
                Changed your mind?
              </span>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('/newsletter')}
                className="group inline-flex items-center gap-2 bg-foreground px-5 py-2.5 font-mono text-xs uppercase tracking-[0.2em] text-background hover:bg-foreground/90 transition-colors cursor-pointer"
              >
                <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
                <span>Resubscribe Anytime</span>
              </button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="animate-in fade-in-0 duration-300">
            <div className="flex items-center gap-3 text-destructive mb-3">
              <AlertCircle className="size-6" />
              <span className="font-mono text-xs uppercase tracking-[0.2em]">
                Error
              </span>
            </div>

            <h2 className="font-display text-2xl font-bold text-foreground">
              Could not complete request.
            </h2>

            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              {message}
            </p>

            <div className="mt-6 border-t border-border pt-6">
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('/newsletter')}
                className="inline-flex items-center gap-2 bg-foreground px-5 py-2.5 font-mono text-xs uppercase tracking-[0.2em] text-background hover:bg-foreground/90 transition-colors cursor-pointer"
              >
                ← Return to Newsletter
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
