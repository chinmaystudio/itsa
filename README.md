# ITSA Newsletter Feature (Single Page) with Strict Theme Lock

Official Newsletter and Dispatch System for the **Information Technology Students' Association (ITSA)**, PCCoE Pune.

Built with **strict theme locking** against the reference site [itsaweb-seven.vercel.app](https://itsaweb-seven.vercel.app).

---

## ⚡ Quick Start

### 1. Start Fullstack Servers (Backend + Frontend)
```bash
npm run dev
```
- **Frontend App:** [http://localhost:5174/newsletter](http://localhost:5174/newsletter)
- **Backend API:** [http://localhost:3001/api/events](http://localhost:3001/api/events)
- **Admin Management Portal:** [http://localhost:5174/admin/newsletter](http://localhost:5174/admin/newsletter) (Passcode: `itsa2026`)

### 2. Build for Production
```bash
npm run build
```

---

## 🎨 Design Tokens (Faithfully Replicated from Reference Site)

- **Typography**:
  - Headings / Display: `Bricolage Grotesque` (800, 700, 400)
  - Labels / Navigation: `IBM Plex Mono` (`.label-mono`, uppercase tracking `0.22em`)
  - Body Text: `Manrope`
- **Color Tokens**:
  - Light mode: `--background: oklch(95.8% 0.008 95)`, `--foreground: oklch(18% 0.012 80)`, `--primary: oklch(47% 0.243 268)`, `--acid: oklch(88% 0.21 122)`
  - Dark mode: `--background: oklch(15.5% 0.009 275)`, `--foreground: oklch(94.5% 0.008 95)`, `--primary: oklch(70% 0.19 268)`
- **Corners & Shadows**:
  - Sharp `0px` radius (`--radius: 0rem`) matching ITSA's technical aesthetic.
  - Hover shadow: `8px 8px 0 0 var(--primary)` (`.hover:offset-shadow-primary`).
- **Signature Elements**:
  - Infinite Marquee with diamond `◆` separators.
  - Numbered sections (`01 — Who we are`, `02 — The ecosystem`, `03 — NEWSLETTER`).
  - `LOG 0X` event cards with category tags (`career`, `workshops`, `competitions`, `community`).

---

## 🚀 Key Features

1. **Single `/newsletter` Page**:
   - Section header with big display typography and animated ticker.
   - Inline email subscribe form with RFC 5322 validation, duplicate prevention, and inline confirmation state.
   - Upcoming Events poster showcase with live `🔥 Interested (count)` hype counter.
   - Session-based **HypePopup modal** spotlighting Praxis 2026 after 2.5s delay.
2. **Minimal Landing States**:
   - `/newsletter/verify?token=...` (double opt-in email verification with countdown redirect).
   - `/newsletter/unsubscribe?token=...` (one-click unsubscribe with instant resubscribe option).
3. **Protected Admin Management (`/admin/newsletter`)**:
   - Passcode protection (`itsa2026`).
   - Compose dispatch with rich body, embedded upcoming event cards, and live HTML email preview.
   - Dispatch now or schedule for later (future timestamp validation).
   - Scheduled dispatches queue and history.
   - Searchable, filterable subscriber list + **CSV export** button.
   - Minimalist analytics dashboard (subscribers, verification rate, open rate, click rate).
   - In-app **Outbox Inspector** for testing dispatched emails and tokens.
