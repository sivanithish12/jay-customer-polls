-- JAY Customer Polls - Fix Vote Count to Count Users, Not Responses
-- This migration fixes the total_votes to count unique voters (sessions) instead of individual responses
-- A poll with 2 questions should count as 1 vote per user, not 2 votes

-- =============================================
-- 1. UPDATE THE INCREMENT VOTE COUNTS FUNCTION
-- =============================================
-- The new logic:
-- - Always increment poll_options.vote_count (each option gets counted)
-- - Only increment polls.total_votes if this is the FIRST response from this session
-- - Use question_id to determine first vote (lowest display_order question)

CREATE OR REPLACE FUNCTION increment_vote_counts()
RETURNS TRIGGER AS $$
DECLARE
    first_question_id UUID;
BEGIN
    -- Increment option vote count (always, for each option selected)
    UPDATE poll_options
    SET vote_count = vote_count + 1
    WHERE id = NEW.option_id;

    -- Get the first question ID for this poll (lowest display_order)
    SELECT id INTO first_question_id
    FROM poll_questions
    WHERE poll_id = NEW.poll_id
    ORDER BY display_order ASC
    LIMIT 1;

    -- Only increment total poll votes if this is the first question being answered
    -- This ensures only 1 increment per user submission regardless of batch insert order
    IF NEW.question_id = first_question_id OR first_question_id IS NULL THEN
        UPDATE polls
        SET total_votes = total_votes + 1
        WHERE id = NEW.poll_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 2. FIX EXISTING DATA
-- =============================================
-- Recalculate total_votes for all polls based on unique sessions

UPDATE polls p
SET total_votes = (
    SELECT COUNT(DISTINCT session_id)
    FROM poll_responses pr
    WHERE pr.poll_id = p.id
);

-- =============================================
-- 3. OPTIONAL: ADD A HELPER FUNCTION TO GET UNIQUE VOTER COUNT
-- =============================================
-- This function can be used to verify the count

CREATE OR REPLACE FUNCTION get_unique_voter_count(poll_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(DISTINCT session_id)
        FROM poll_responses
        WHERE poll_id = poll_uuid
    );
END;
$$ LANGUAGE plpgsql;
