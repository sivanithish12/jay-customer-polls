-- Fix: Allow authenticated users to also vote on polls
-- The original policy only allowed 'anon' users, but authenticated users should also be able to vote

-- Add policy for authenticated users to vote
DROP POLICY IF EXISTS "Authenticated users can vote" ON poll_responses;
CREATE POLICY "Authenticated users can vote" ON poll_responses
    FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM polls WHERE polls.id = poll_responses.poll_id AND polls.status = 'active'));

-- Also allow authenticated users to check if they've voted (for duplicate prevention)
DROP POLICY IF EXISTS "Users can check their own votes" ON poll_responses;
CREATE POLICY "Users can check their own votes" ON poll_responses
    FOR SELECT TO anon, authenticated
    USING (true);

-- Note: Run this migration in your Supabase SQL Editor
-- Or apply via: supabase db push
