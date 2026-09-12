-- ==============================================================================
-- Migration: 001_initial_schema.sql
-- Description: Create initial tables, constraints, indexes, triggers, and RLS for ITSA
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Events Table
CREATE TABLE IF NOT EXISTS public.events (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('competitions', 'workshops', 'career', 'community', 'general')),
    event_date TIMESTAMPTZ NOT NULL,
    formatted_date TEXT,
    location TEXT NOT NULL,
    organizer TEXT NOT NULL,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    interest_count INTEGER NOT NULL DEFAULT 0 CHECK (interest_count >= 0),
    description TEXT NOT NULL,
    full_description TEXT,
    poster_image_url TEXT,
    gallery_images JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Event Interests Table
CREATE TABLE IF NOT EXISTS public.event_interests (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_identifier TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_event_user UNIQUE (event_id, user_identifier)
);

-- Subscribers Table
CREATE TABLE IF NOT EXISTS public.subscribers (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'unsubscribed')),
    verification_token TEXT,
    verification_expires_at TIMESTAMPTZ,
    subscribed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    unsubscribed_at TIMESTAMPTZ,
    source TEXT NOT NULL DEFAULT 'newsletter_page'
);

-- Newsletters Table
CREATE TABLE IF NOT EXISTS public.newsletters (
    id TEXT PRIMARY KEY,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sent')),
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    created_by TEXT NOT NULL DEFAULT 'admin',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Newsletter Events Junction
CREATE TABLE IF NOT EXISTS public.newsletter_events (
    id TEXT PRIMARY KEY,
    newsletter_id TEXT NOT NULL REFERENCES public.newsletters(id) ON DELETE CASCADE,
    event_id TEXT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Newsletter Recipients Table
CREATE TABLE IF NOT EXISTS public.newsletter_recipients (
    id TEXT PRIMARY KEY,
    newsletter_id TEXT NOT NULL REFERENCES public.newsletters(id) ON DELETE CASCADE,
    subscriber_id TEXT NOT NULL REFERENCES public.subscribers(id) ON DELETE CASCADE,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    bounced BOOLEAN NOT NULL DEFAULT FALSE,
    unsubscribed_after BOOLEAN NOT NULL DEFAULT FALSE
);

-- Outbox Emails Table
CREATE TABLE IF NOT EXISTS public.outbox_emails (
    id TEXT PRIMARY KEY DEFAULT ('em-' || replace(uuid_generate_v4()::text, '-', '')),
    to_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    html TEXT NOT NULL,
    from_email TEXT,
    status TEXT NOT NULL DEFAULT 'sent',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_events_category ON public.events(category);
CREATE INDEX IF NOT EXISTS idx_events_is_featured ON public.events(is_featured);

CREATE INDEX IF NOT EXISTS idx_event_interests_user ON public.event_interests(user_identifier);
CREATE INDEX IF NOT EXISTS idx_event_interests_event ON public.event_interests(event_id);

CREATE INDEX IF NOT EXISTS idx_subscribers_email ON public.subscribers(lower(email));
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON public.subscribers(status);
CREATE INDEX IF NOT EXISTS idx_subscribers_token ON public.subscribers(verification_token);
CREATE INDEX IF NOT EXISTS idx_subscribers_subscribed_at ON public.subscribers(subscribed_at DESC);

CREATE INDEX IF NOT EXISTS idx_newsletters_status ON public.newsletters(status);
CREATE INDEX IF NOT EXISTS idx_newsletters_scheduled ON public.newsletters(scheduled_at) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_newsletters_created_at ON public.newsletters(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_nl_recipients_nl ON public.newsletter_recipients(newsletter_id);
CREATE INDEX IF NOT EXISTS idx_nl_recipients_sub ON public.newsletter_recipients(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_nl_recipients_opened ON public.newsletter_recipients(opened_at);
CREATE INDEX IF NOT EXISTS idx_nl_recipients_clicked ON public.newsletter_recipients(clicked_at);

CREATE INDEX IF NOT EXISTS idx_outbox_created_at ON public.outbox_emails(created_at DESC);

-- Trigger Function for Updated At
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_events_updated_at ON public.events;
CREATE TRIGGER tr_events_updated_at
    BEFORE UPDATE ON public.events
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_newsletters_updated_at ON public.newsletters;
CREATE TRIGGER tr_newsletters_updated_at
    BEFORE UPDATE ON public.newsletters
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outbox_emails ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public can view events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Public can view interests" ON public.event_interests FOR SELECT USING (true);
CREATE POLICY "Public can add interests" ON public.event_interests FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can remove their interests" ON public.event_interests FOR DELETE USING (true);
CREATE POLICY "Public can insert subscriptions" ON public.subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can read own subscription status" ON public.subscribers FOR SELECT USING (true);
CREATE POLICY "Public can update own subscription" ON public.subscribers FOR UPDATE USING (true);

CREATE POLICY "Service role full access on events" ON public.events FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on subscribers" ON public.subscribers FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on newsletters" ON public.newsletters FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on newsletter_events" ON public.newsletter_events FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on newsletter_recipients" ON public.newsletter_recipients FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on outbox_emails" ON public.outbox_emails FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on event_interests" ON public.event_interests FOR ALL TO service_role USING (true) WITH CHECK (true);
