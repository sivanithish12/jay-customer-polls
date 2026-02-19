-- JAY Customer Polls - Initial Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. POLLS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS polls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(10) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    question TEXT NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed')),

    -- Settings
    poll_type VARCHAR(20) DEFAULT 'single_choice' CHECK (poll_type IN ('single_choice', 'multiple_choice')),
    show_results_after_vote BOOLEAN DEFAULT TRUE,
    allow_multiple_selections BOOLEAN DEFAULT FALSE,

    -- Stats (denormalized for performance)
    total_votes INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,

    -- Owner
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- =============================================
-- 2. POLL OPTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS poll_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    option_text VARCHAR(500) NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    vote_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 3. POLL RESPONSES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS poll_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    option_id UUID NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,

    -- Duplicate prevention
    session_id VARCHAR(255) NOT NULL,
    ip_hash VARCHAR(64),

    -- Metadata
    device_type VARCHAR(20),
    voted_at TIMESTAMPTZ DEFAULT NOW(),

    -- Prevent duplicate votes per session
    UNIQUE(poll_id, session_id)
);

-- =============================================
-- 4. FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to generate random slug
CREATE OR REPLACE FUNCTION generate_slug(length INTEGER DEFAULT 6)
RETURNS VARCHAR AS $$
DECLARE
    chars VARCHAR := 'abcdefghijklmnopqrstuvwxyz0123456789';
    result VARCHAR := '';
    i INTEGER;
BEGIN
    FOR i IN 1..length LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate slug if not provided
CREATE OR REPLACE FUNCTION set_poll_slug()
RETURNS TRIGGER AS $$
DECLARE
    new_slug VARCHAR;
    slug_exists BOOLEAN;
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        LOOP
            new_slug := generate_slug(6);
            SELECT EXISTS(SELECT 1 FROM polls WHERE slug = new_slug) INTO slug_exists;
            EXIT WHEN NOT slug_exists;
        END LOOP;
        NEW.slug := new_slug;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_poll_slug ON polls;
CREATE TRIGGER trigger_set_poll_slug
    BEFORE INSERT ON polls
    FOR EACH ROW
    EXECUTE FUNCTION set_poll_slug();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_polls_updated_at ON polls;
CREATE TRIGGER trigger_polls_updated_at
    BEFORE UPDATE ON polls
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Function to increment vote counts atomically
CREATE OR REPLACE FUNCTION increment_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
    -- Increment option vote count
    UPDATE poll_options
    SET vote_count = vote_count + 1
    WHERE id = NEW.option_id;

    -- Increment total poll votes
    UPDATE polls
    SET total_votes = total_votes + 1
    WHERE id = NEW.poll_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_increment_vote_counts ON poll_responses;
CREATE TRIGGER trigger_increment_vote_counts
    AFTER INSERT ON poll_responses
    FOR EACH ROW
    EXECUTE FUNCTION increment_vote_counts();

-- =============================================
-- 5. INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_polls_status ON polls(status);
CREATE INDEX IF NOT EXISTS idx_polls_slug ON polls(slug);
CREATE INDEX IF NOT EXISTS idx_polls_created_by ON polls(created_by);
CREATE INDEX IF NOT EXISTS idx_polls_created_at ON polls(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_poll_options_poll_id ON poll_options(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_options_poll_order ON poll_options(poll_id, display_order);

CREATE INDEX IF NOT EXISTS idx_responses_poll_id ON poll_responses(poll_id);
CREATE INDEX IF NOT EXISTS idx_responses_option_id ON poll_responses(option_id);
CREATE INDEX IF NOT EXISTS idx_responses_session ON poll_responses(poll_id, session_id);

-- =============================================
-- 6. ROW LEVEL SECURITY
-- =============================================

-- Enable RLS
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_responses ENABLE ROW LEVEL SECURITY;

-- Polls policies
DROP POLICY IF EXISTS "Admins manage polls" ON polls;
CREATE POLICY "Admins manage polls" ON polls
    FOR ALL TO authenticated
    USING (created_by = auth.uid())
    WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Public view active polls" ON polls;
CREATE POLICY "Public view active polls" ON polls
    FOR SELECT TO anon
    USING (status = 'active');

-- Poll options policies
DROP POLICY IF EXISTS "Admins manage options" ON poll_options;
CREATE POLICY "Admins manage options" ON poll_options
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM polls WHERE polls.id = poll_options.poll_id AND polls.created_by = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM polls WHERE polls.id = poll_options.poll_id AND polls.created_by = auth.uid()));

DROP POLICY IF EXISTS "Public view options" ON poll_options;
CREATE POLICY "Public view options" ON poll_options
    FOR SELECT TO anon
    USING (EXISTS (SELECT 1 FROM polls WHERE polls.id = poll_options.poll_id AND polls.status = 'active'));

-- Poll responses policies
DROP POLICY IF EXISTS "Admins view responses" ON poll_responses;
CREATE POLICY "Admins view responses" ON poll_responses
    FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM polls WHERE polls.id = poll_responses.poll_id AND polls.created_by = auth.uid()));

DROP POLICY IF EXISTS "Public can vote" ON poll_responses;
CREATE POLICY "Public can vote" ON poll_responses
    FOR INSERT TO anon
    WITH CHECK (EXISTS (SELECT 1 FROM polls WHERE polls.id = poll_responses.poll_id AND polls.status = 'active'));

-- =============================================
-- 7. ENABLE REALTIME
-- =============================================
-- Run these commands to enable realtime on the tables
-- ALTER PUBLICATION supabase_realtime ADD TABLE poll_options;
-- ALTER PUBLICATION supabase_realtime ADD TABLE polls;
