-- ==============================================================================
-- ITSA Web & Newsletter System - Database Schema
-- Information Technology Students' Association (ITSA), PCCoE Pune
-- Database Engine: PostgreSQL / Supabase
-- ==============================================================================

-- Enable UUID extension if required
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. TABLE: events
-- Stores department and club events, symposiums, hackathons, and seminars.
-- ==============================================================================
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

-- ==============================================================================
-- 2. TABLE: event_interests
-- Tracks individual user hype/interest registrations per event.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.event_interests (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_identifier TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_event_user UNIQUE (event_id, user_identifier)
);

-- ==============================================================================
-- 3. TABLE: subscribers
-- Manages newsletter subscribers, double opt-in verification, and unsubscribe states.
-- ==============================================================================
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

-- ==============================================================================
-- 4. TABLE: newsletters
-- Stores composed dispatches, drafts, scheduled broadcasts, and sent bulletins.
-- ==============================================================================
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

-- ==============================================================================
-- 5. TABLE: newsletter_events
-- Junction table linking events to featured sections inside newsletters.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.newsletter_events (
    id TEXT PRIMARY KEY,
    newsletter_id TEXT NOT NULL REFERENCES public.newsletters(id) ON DELETE CASCADE,
    event_id TEXT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 6. TABLE: newsletter_recipients
-- Granular delivery tracking, email open pixel logs, and link click telemetry.
-- ==============================================================================
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

-- ==============================================================================
-- 7. TABLE: outbox_emails
-- Persistent audit outbox recording all outgoing verification and dispatch emails.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.outbox_emails (
    id TEXT PRIMARY KEY DEFAULT ('em-' || replace(uuid_generate_v4()::text, '-', '')),
    to_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    html TEXT NOT NULL,
    from_email TEXT,
    status TEXT NOT NULL DEFAULT 'sent',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- INDEXES FOR HIGH-THROUGHPUT QUERY OPTIMIZATION
-- ==============================================================================
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

-- ==============================================================================
-- AUTOMATIC updated_at TRIGGER FUNCTION
-- ==============================================================================
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

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outbox_emails ENABLE ROW LEVEL SECURITY;

-- 1. Events: Public read access
CREATE POLICY "Public can view events" 
    ON public.events FOR SELECT 
    USING (true);

-- 2. Event Interests: Anonymous users can view and register interest
CREATE POLICY "Public can view interests" 
    ON public.event_interests FOR SELECT 
    USING (true);

CREATE POLICY "Public can add interests" 
    ON public.event_interests FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Public can remove their interests" 
    ON public.event_interests FOR DELETE 
    USING (true);

-- 3. Subscribers: Public can insert new subscriptions; updates via verification token
CREATE POLICY "Public can insert subscriptions" 
    ON public.subscribers FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Public can read own subscription status" 
    ON public.subscribers FOR SELECT 
    USING (true);

CREATE POLICY "Public can update own subscription" 
    ON public.subscribers FOR UPDATE 
    USING (true);

-- 4. Newsletters & Admin: Full access for service_role
CREATE POLICY "Service role full access on events" 
    ON public.events FOR ALL 
    TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on subscribers" 
    ON public.subscribers FOR ALL 
    TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on newsletters" 
    ON public.newsletters FOR ALL 
    TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on newsletter_events" 
    ON public.newsletter_events FOR ALL 
    TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on newsletter_recipients" 
    ON public.newsletter_recipients FOR ALL 
    TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on outbox_emails" 
    ON public.outbox_emails FOR ALL 
    TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on event_interests" 
    ON public.event_interests FOR ALL 
    TO service_role USING (true) WITH CHECK (true);

-- ==============================================================================
-- INITIAL SEED DATA (Events & Sample Dispatches)
-- ==============================================================================
INSERT INTO public.events (
    id, slug, title, category, event_date, formatted_date, location, organizer, is_featured, interest_count, description, full_description, poster_image_url, gallery_images
) VALUES
(
    'event-praxis-2026',
    'praxis-2026',
    'Praxis 2026 — National Technical Symposium',
    'competitions',
    '2026-10-15T09:00:00Z',
    'October 2026',
    'PCCoE Campus, Pune',
    'ITSA Core & Department of IT',
    TRUE,
    242,
    'The flagship annual national symposium bringing multi-track hackathons, algorithmic coding, web3 design sprints, and tech summits.',
    'Praxis 2026 is PCCoE IT Department’s premier national engineering symposium. Over 2,000 delegates from engineering institutions across India gather for 48 hours of intense hacking, algorithmic challenges, product design showcases, and robotics face-offs. Keynote speakers include industry pioneers from Google, NVIDIA, and top tech startups.',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
    '["https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80"]'::jsonb
),
(
    'event-induction-2026',
    'induction-2026',
    'SY, ITSA, IEEE and MLSC Induction 2026',
    'career',
    '2026-08-05T10:00:00Z',
    '5th August, 2026',
    'Mechanical Seminar Hall, PCCoE Pune',
    'ITSA Executive Council',
    FALSE,
    168,
    'Welcoming 150 students and faculty to usher in the new leadership of ITSA, IEEE Student Branch, and MLSC chapters.',
    'The Induction Ceremony 2026 for the Department of Information Technology was held on 5th August 2026 at the Mechanical Seminar Hall, PCCoE, Pune. The event brought together 150 students and faculty to welcome new members of SY, ITSA, IEEE and MLSC, while honoring outgoing leaders and celebrating the department’s shining stars.',
    'https://res.cloudinary.com/devyriv6o/image/upload/v1760284684/bruteforge3_d9zmfj.jpg',
    '["https://res.cloudinary.com/devyriv6o/image/upload/v1760284684/bruteforge3_d9zmfj.jpg", "https://res.cloudinary.com/devyriv6o/image/upload/v1760284684/bruteforge4_imqjiy.jpg"]'::jsonb
),
(
    'event-bruteforge-coderush',
    'bruteforge-coderush',
    'BRUTEFORGE - Code Rush',
    'competitions',
    '2025-09-17T11:00:00Z',
    '17th September, 2025',
    'IT Computer Labs 1 & 2',
    'ITSA Coding Club',
    FALSE,
    195,
    'A rapid-fire competitive programming sprint and binary puzzle contest pushing speed, algorithmic precision, and problem-solving prowess.',
    'The first round was a quiz-based challenge featuring binary puzzles, logical reasoning questions, and applied AI problems. Around sixteen teams participated, and their performance was judged on accuracy and completion time. After an intense one-hour session, only seven to eight teams qualified for the next round.',
    'https://res.cloudinary.com/devyriv6o/image/upload/v1760284684/bruteforge3_d9zmfj.jpg',
    '["https://res.cloudinary.com/devyriv6o/image/upload/v1760284684/bruteforge3_d9zmfj.jpg", "https://res.cloudinary.com/devyriv6o/image/upload/v1760284685/bruteforge1_n1bij2.jpg", "https://res.cloudinary.com/devyriv6o/image/upload/v1760284685/bruteforge2_fx1arg.jpg"]'::jsonb
),
(
    'event-bruteforge-ai',
    'bruteforge-ai',
    'BRUTEFORGE - AI Innovation Forge',
    'competitions',
    '2025-09-17T14:00:00Z',
    '17th September, 2025',
    'LRDC Seminar Hall, PCCoE',
    'ITSA & MLSC Chapter',
    FALSE,
    210,
    'Applied machine learning sprint testing data modeling, neural network fine-tuning, and production AI workflow implementation.',
    'The second round was a problem-solving challenge that tested participants’ creativity and technical skills. Teams were given a set of problems related to AI, machine learning, and data science, and they had to come up with innovative solutions judged on originality and execution.',
    'https://res.cloudinary.com/devyriv6o/image/upload/v1760285089/IMG_20250917_123800_eslxqc.jpg',
    '["https://res.cloudinary.com/devyriv6o/image/upload/v1760285089/IMG_20250917_123800_eslxqc.jpg", "https://res.cloudinary.com/devyriv6o/image/upload/v1760285089/IMG_20250917_122542_lnkhut.jpg"]'::jsonb
),
(
    'event-ai-workshop',
    'ai-workshop',
    'AI in Day-to-Day Life — Expert Masterclass',
    'workshops',
    '2025-07-21T10:00:00Z',
    '21st July, 2025',
    'Seminar Hall 401, IT Dept',
    'ITSA & IEEE Student Branch',
    FALSE,
    147,
    'Distinguished expert session delivered by Mr. Ajay Deshpande (ACM Eminent Speaker) covering practical AI tooling and ethical usage.',
    'The Department of IT, PCCoE, along with IEEE Student Branch and ITSA, organized an expert session on “Using AI in Day-to-Day Life”, delivered by Mr. Ajay Deshpande, an ACM Eminent Speaker with 25+ years of industry experience. He highlighted how AI impacts healthcare, education, transport, and productivity.',
    'https://res.cloudinary.com/devyriv6o/image/upload/v1760285805/IMG-20250721-WA0037_xdw02t.jpg',
    '["https://res.cloudinary.com/devyriv6o/image/upload/v1760285805/IMG-20250721-WA0037_xdw02t.jpg", "https://res.cloudinary.com/devyriv6o/image/upload/v1760285804/IMG-20250721-WA0013_jrh0dn.jpg"]'::jsonb
),
(
    'event-gre-gate',
    'gre-gate-mock',
    'Higher Studies Strategy & National GATE Mock',
    'career',
    '2025-09-05T13:30:00Z',
    '5th September, 2025',
    'Auditorium, PCCoE Pune',
    'ITSA Academic Wing',
    FALSE,
    112,
    'Comprehensive roadmap for international master’s admissions, GRE/TOEFL preparation, and simulated GATE entrance examination.',
    'The main objective was to guide students who are interested in pursuing higher education abroad, especially in the United States and Germany, with detailed information on GRE structure, SOP writing, and live GATE mock evaluations.',
    'https://res.cloudinary.com/devyriv6o/image/upload/v1760286535/Gre_session_-1_vdcjte.jpg',
    '["https://res.cloudinary.com/devyriv6o/image/upload/v1760286535/Gre_session_-1_vdcjte.jpg", "https://res.cloudinary.com/devyriv6o/image/upload/v1760286535/Gate_exam_jz4kpg.jpg"]'::jsonb
),
(
    'event-ieee-drive',
    'ieee-drive',
    'IEEE Awareness & Global Membership Drive',
    'community',
    '2025-09-24T15:00:00Z',
    '24th September, 2025',
    'LRDC Hall, PCCoE Pune',
    'ITSA & IEEE PCCoE',
    FALSE,
    134,
    'Introducing students to IEEE research conferences, global tech networks, and student grant funding ($5000 IEEE grant).',
    'Held at LRDC Hall, PCCoE, speakers Mr. Rakshit Jain and Mr. Mandar Khurjekar highlighted how IEEE supports technical growth, global paper publications, research mentorship, and professional networking.',
    'https://res.cloudinary.com/devyriv6o/image/upload/v1760286668/20250924_35139PMByGPSMapCamera_tsrwqi.jpg',
    '["https://res.cloudinary.com/devyriv6o/image/upload/v1760286668/20250924_35139PMByGPSMapCamera_tsrwqi.jpg", "https://res.cloudinary.com/devyriv6o/image/upload/v1760286666/IMG_20250924_164541_obldfo.jpg"]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    category = EXCLUDED.category,
    event_date = EXCLUDED.event_date,
    formatted_date = EXCLUDED.formatted_date,
    location = EXCLUDED.location,
    organizer = EXCLUDED.organizer,
    is_featured = EXCLUDED.is_featured,
    description = EXCLUDED.description,
    full_description = EXCLUDED.full_description,
    poster_image_url = EXCLUDED.poster_image_url,
    gallery_images = EXCLUDED.gallery_images,
    updated_at = timezone('utc'::text, now());
