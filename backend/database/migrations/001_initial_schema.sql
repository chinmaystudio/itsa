-- Migration: 001_initial_schema.sql
-- Description: Sets up initial tables for contact submissions, communities, members, events, achievements, and clubs

BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Contact submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'received',
    ip_address VARCHAR(45),
    user_agent TEXT,
    auto_reply_sent BOOLEAN DEFAULT FALSE,
    auto_reply_id VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);

-- 2. Communities table
CREATE TABLE IF NOT EXISTS communities (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL DEFAULT 'technical',
    description TEXT,
    icon VARCHAR(64),
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Members table
CREATE TABLE IF NOT EXISTS members (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    community_id VARCHAR(64) REFERENCES communities(id) ON DELETE SET NULL,
    tier VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    linkedin_url TEXT,
    github_url TEXT,
    avatar_url TEXT,
    bio TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_members_community_id ON members(community_id);
CREATE INDEX IF NOT EXISTS idx_members_tier ON members(tier);

-- 4. Events table
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    academic_year VARCHAR(20) NOT NULL DEFAULT '2025-26',
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    overview TEXT NOT NULL,
    event_date VARCHAR(100) NOT NULL,
    start_date DATE,
    venue VARCHAR(255) DEFAULT 'PCCoE Campus, Pune',
    images TEXT[] DEFAULT '{}',
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Achievements table
CREATE TABLE IF NOT EXISTS achievements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    emoji VARCHAR(32) DEFAULT '🏆',
    subtitle VARCHAR(255),
    description TEXT NOT NULL,
    highlights TEXT[] DEFAULT '{}',
    image_url TEXT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Clubs table
CREATE TABLE IF NOT EXISTS clubs (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    tagline VARCHAR(255),
    description TEXT,
    icon VARCHAR(64),
    category VARCHAR(64) DEFAULT 'technical',
    lead_name VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anonymous submission" ON contact_submissions;
CREATE POLICY "Allow anonymous submission"
    ON contact_submissions
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated read" ON contact_submissions;
CREATE POLICY "Allow authenticated read"
    ON contact_submissions
    FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Public read communities" ON communities;
CREATE POLICY "Public read communities" ON communities FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public read members" ON members;
CREATE POLICY "Public read members" ON members FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public read events" ON events;
CREATE POLICY "Public read events" ON events FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public read achievements" ON achievements;
CREATE POLICY "Public read achievements" ON achievements FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public read clubs" ON clubs;
CREATE POLICY "Public read clubs" ON clubs FOR SELECT TO anon, authenticated USING (true);

COMMIT;
