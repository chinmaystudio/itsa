# ITSA Backend

This directory contains backend infrastructure files that are **not** part of the frontend bundle.

## Structure

```
backend/
├── api/
│   └── auto-reply.ts        — Nitro/h3 API handler for Brevo email auto-reply
└── database/
    ├── scheme.sql            — Full Supabase/PostgreSQL schema (authoritative)
    └── migrations/
        └── 001_initial_schema.sql  — Initial migration
```

## Notes

- **`src/server/`** — TanStack Start server functions (loaders, actions). These live inside `src/` because TanStack Start requires them there.
- **`backend/api/`** — Standalone Nitro event handlers (e.g. `/api/auto-reply`). These are deployed as edge functions or serverless routes alongside the frontend.
- **`backend/database/`** — SQL schema files for Supabase. Apply with the Supabase CLI or run directly in the Supabase SQL editor.

## Applying the schema

```bash
# Using Supabase CLI
supabase db push

# Or run scheme.sql directly in the Supabase SQL editor
```

## Environment variables required

| Variable | Purpose |
|---|---|
| `BREVO_API_KEY` | Brevo (Sendinblue) API key for email |
| `BREVO_SMTP_LOGIN` | Brevo SMTP login (if using SMTP relay) |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key |
