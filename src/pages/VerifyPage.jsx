import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

export default function VerifyPage({ onNavigate }) {
  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Missing verification token.');
      return;
    }

    // Call API
    fetch(`/api/verify?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus('success');
          setEmail(data.email);
          setMessage(data.message || 'Subscription successfully verified!');
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification failed.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Network error while processing verification.');
      });
  }, []);

  // Countdown auto-redirect to /newsletter
  useEffect(() => {
    if (status !== 'success') return;
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          if (onNavigate) onNavigate('/newsletter');
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [status, onNavigate]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-5 py-24 sm:px-8">
      <div className="relative w-full max-w-lg border border-border bg-card p-8 sm:p-10 shadow-lg">
        <p className="label-mono mb-2">SYSTEM DISPATCH · VERIFICATION</p>

        {status === 'verifying' && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Loader2 className="size-8 animate-spin text-primary" />
            <h2 className="mt-4 font-display text-2xl font-bold text-foreground">
              Verifying Subscription...
            </h2>
            <p className="mt-2 font-mono text-xs text-muted-foreground">
              Validating signature token against departmental directory
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="animate-in fade-in-0 duration-300">
            <div className="flex items-center gap-3 text-primary mb-3">
              <CheckCircle2 className="size-7" />
              <span className="font-mono text-xs uppercase tracking-[0.2em] font-semibold">
                Status: Active Subscriber
              </span>
            </div>

            <h2 className="font-display text-3xl font-extrabold tracking-tight text-foreground">
              You're officially plugged in.
            </h2>

            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground">{email}</strong> will now receive official ITSA dispatches, technical hackathons, AI workshops, and upcoming department notices.
            </p>

            <div className="mt-6 border-t border-border pt-6 flex flex-wrap items-center justify-between gap-4">
              <span className="font-mono text-xs text-muted-foreground">
                Redirecting in {countdown}s...
              </span>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('/newsletter')}
                className="group inline-flex items-center gap-2 bg-foreground px-5 py-2.5 font-mono text-xs uppercase tracking-[0.2em] text-background hover:bg-foreground/90 transition-colors cursor-pointer"
              >
                <span>Return to Newsletter</span>
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="animate-in fade-in-0 duration-300">
            <div className="flex items-center gap-3 text-destructive mb-3">
              <AlertCircle className="size-7" />
              <span className="font-mono text-xs uppercase tracking-[0.2em] font-semibold">
                Verification Issue
              </span>
            </div>

            <h2 className="font-display text-2xl font-bold text-foreground">
              Unable to verify email.
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
                ← Back to Subscribe Page
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
