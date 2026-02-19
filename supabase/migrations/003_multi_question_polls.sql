-- JAY Customer Polls - Multi-Question Polls Migration
-- This migration adds support for multiple questions per poll

-- =============================================
-- 1. CREATE POLL_QUESTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS poll_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2. UPDATE POLL_OPTIONS TO REFERENCE QUESTIONS
-- =============================================
-- Add question_id column to poll_options (nullable for backward compatibility)
ALTER TABLE poll_options
ADD COLUMN IF NOT EXISTS question_id UUID REFERENCES poll_questions(id) ON DELETE CASCADE;

-- =============================================
-- 3. UPDATE POLL_RESPONSES TO REFERENCE QUESTIONS
-- =============================================
-- Add question_id column to poll_responses
ALTER TABLE poll_responses
ADD COLUMN IF NOT EXISTS question_id UUID REFERENCES poll_questions(id) ON DELETE CASCADE;

-- Update unique constraint to allow one vote per question per session
ALTER TABLE poll_responses DROP CONSTRAINT IF EXISTS poll_responses_poll_id_session_id_key;
ALTER TABLE poll_responses ADD CONSTRAINT poll_responses_poll_question_session_unique
    UNIQUE(poll_id, question_id, session_id);

-- =============================================
-- 4. INDEXES FOR NEW TABLE
-- =============================================
CREATE INDEX IF NOT EXISTS idx_poll_questions_poll_id ON poll_questions(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_questions_order ON poll_questions(poll_id, display_order);
CREATE INDEX IF NOT EXISTS idx_poll_options_question_id ON poll_options(question_id);
CREATE INDEX IF NOT EXISTS idx_poll_responses_question_id ON poll_responses(question_id);

-- =============================================
-- 5. ROW LEVEL SECURITY FOR POLL_QUESTIONS
-- =============================================
ALTER TABLE poll_questions ENABLE ROW LEVEL SECURITY;

-- Admins can manage questions for their polls
DROP POLICY IF EXISTS "Admins manage questions" ON poll_questions;
CREATE POLICY "Admins manage questions" ON poll_questions
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM polls WHERE polls.id = poll_questions.poll_id AND polls.created_by = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM polls WHERE polls.id = poll_questions.poll_id AND polls.created_by = auth.uid()));

-- Public can view questions for active polls
DROP POLICY IF EXISTS "Public view questions" ON poll_questions;
CREATE POLICY "Public view questions" ON poll_questions
    FOR SELECT TO anon
    USING (EXISTS (SELECT 1 FROM polls WHERE polls.id = poll_questions.poll_id AND polls.status = 'active'));

-- =============================================
-- 6. MIGRATION HELPER: MOVE EXISTING POLL QUESTIONS
-- =============================================
-- For existing polls, create a question from the poll's question field
-- and link existing options to it
DO $$
DECLARE
    poll_record RECORD;
    new_question_id UUID;
BEGIN
    -- Loop through all polls that have options but no questions yet
    FOR poll_record IN
        SELECT p.id, p.question, p.description
        FROM polls p
        WHERE EXISTS (SELECT 1 FROM poll_options po WHERE po.poll_id = p.id AND po.question_id IS NULL)
        AND NOT EXISTS (SELECT 1 FROM poll_questions pq WHERE pq.poll_id = p.id)
    LOOP
        -- Create a question for this poll
        INSERT INTO poll_questions (poll_id, question_text, description, display_order)
        VALUES (poll_record.id, poll_record.question, poll_record.description, 0)
        RETURNING id INTO new_question_id;

        -- Update all options for this poll to reference the new question
        UPDATE poll_options
        SET question_id = new_question_id
        WHERE poll_id = poll_record.id AND question_id IS NULL;

        -- Update all responses for this poll to reference the new question
        UPDATE poll_responses
        SET question_id = new_question_id
        WHERE poll_id = poll_record.id AND question_id IS NULL;
    END LOOP;
END $$;
