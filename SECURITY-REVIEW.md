# Security review — 4 October 2026

Scope: repository code, dependency audit, locally built application, and a
read-only check of public website headers. No intrusive production testing,
email delivery, or database writes were performed.

## Fixed

- Removed the publicly callable `/api/auto-reply` route. Confirmation emails
  are now only sent after a validated contact submission is saved.
- Replaced wildcard contact CORS with the request origin, the production
  Cloudflare Pages origin, and explicit `CONTACT_ALLOWED_ORIGINS` entries.
  This environment variable is a comma-separated list of complete origins.
- Shared strict type, email and length validation between client and server.
  The server enforces a 32 KiB request limit even without Content-Length.
- Invalid JSON and unsupported methods/content types receive appropriate 4xx
  responses. Provider diagnostics are not returned to visitors, and contact
  responses are not cached.
- Added provider timeouts; SMTP uses structured recipient addresses and
  requires TLS. Existing HTML escaping is retained and regression tested.
- Added nosniff, anti-framing, referrer, permissions and a limited CSP to SSR
  responses and the Pages static `_headers` file. This CSP does not restrict
  script sources; it is not a complete XSS policy.
- Removed unrestricted Vite development hosts.
- Updated vulnerable transitive brace-expansion versions in the lockfile.
  `npm audit` reports zero known vulnerabilities after the changes.
- Declared the previously missing Nitro build dependency, pinned its version,
  and changed CI to reproducible installs on Node 22.

## Verified

- Production build and TypeScript check pass.
- Six contact regression tests pass, including invalid payloads, byte limits,
  origins, provider failures, HTML escaping and private error handling.
- No server secret environment-variable names or Brevo key prefixes were found
  in built browser JavaScript. This is a targeted scan, not a history-wide audit.
- Browser checks cover desktop, 390 px and 320 px layouts, focus trapping and
  restoration, Escape/backdrop/button dismissal, once-per-session behavior,
  blocked session storage, reduced motion, and event expiry.
- Automated axe checks report no violations in the popup on desktop or mobile.

## Remaining deployment checks

1. **Spam prevention:** `/api/contact` is intentionally public and can still be
   abused by non-browser clients. CORS does not authenticate callers. Configure
   durable rate limiting and/or server-verified Turnstile at the actual backend
   before treating the contact form as hardened against automated spam. No
   account access or challenge keys were available to configure this here.
2. **Live database:** the checked-in migration enables RLS without public
   policies; the server uses a service-role key. Verify live RLS, table grants,
   other policies and key handling in Supabase. Repository inspection does not
   prove that the live database matches the migration. No schema was changed.
3. **Hosting:** the current public site did not return the added security
   headers during the initial read-only check. Verify them again after deploying.
   Cloudflare `_headers` affects static responses; SSR/Workers must use the
   application headers. If the contact backend is separately deployed, deploy
   its changes too and allow any required preview origins explicitly.
4. **Existing performance:** the build still warns about the existing large
   3D team-view chunk. The flyer adds no runtime package and its poster is loaded
   only when the dialog is rendered (about 376 KiB).

References: [Cloudflare Pages headers](https://developers.cloudflare.com/pages/configuration/headers/),
[Supabase API security](https://supabase.com/docs/guides/api/securing-your-api).
