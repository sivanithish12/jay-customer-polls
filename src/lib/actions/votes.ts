"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { createHash } from "crypto";
import type { PollQuestionWithOptions } from "@/types";

interface VoteResult {
  success: boolean;
  error?: string;
  alreadyVoted?: boolean;
}

// Submit vote for a specific question
export async function submitVote(
  pollId: string,
  optionId: string,
  sessionId: string,
  questionId?: string
): Promise<VoteResult> {
  const supabase = await createClient();
  const headersList = await headers();

  // Hash IP for privacy
  const ip = headersList.get("x-forwarded-for") || "unknown";
  const ipHash = createHash("sha256").update(ip).digest("hex");

  // Detect device type from user agent
  const ua = headersList.get("user-agent") || "";
  const deviceType = /mobile/i.test(ua)
    ? "mobile"
    : /tablet/i.test(ua)
    ? "tablet"
    : "desktop";

  // Check if poll is active
  const { data: poll, error: pollError } = await supabase
    .from("polls")
    .select("status")
    .eq("id", pollId)
    .single();

  if (pollError || !poll) {
    return { success: false, error: "Poll not found" };
  }

  if (poll.status !== "active") {
    return { success: false, error: "This poll is no longer active" };
  }

  // Check if this IP has already voted on this poll
  const { data: existingIpVote } = await supabase
    .from("poll_responses")
    .select("id")
    .eq("poll_id", pollId)
    .eq("ip_hash", ipHash)
    .limit(1)
    .maybeSingle();

  if (existingIpVote) {
    return { success: false, error: "You have already voted in this poll", alreadyVoted: true };
  }

  // Check if already voted for this question
  let existingVoteQuery = supabase
    .from("poll_responses")
    .select("id")
    .eq("poll_id", pollId)
    .eq("session_id", sessionId);

  if (questionId) {
    existingVoteQuery = existingVoteQuery.eq("question_id", questionId);
  }

  const { data: existingVote } = await existingVoteQuery.single();

  if (existingVote) {
    return { success: false, error: "You have already voted on this question", alreadyVoted: true };
  }

  // Submit vote
  const { error } = await supabase.from("poll_responses").insert({
    poll_id: pollId,
    question_id: questionId || null,
    option_id: optionId,
    session_id: sessionId,
    ip_hash: ipHash,
    device_type: deviceType,
  });

  if (error) {
    // Handle unique constraint violation (duplicate vote)
    if (error.code === "23505") {
      return { success: false, error: "You have already voted on this question", alreadyVoted: true };
    }
    console.error("Vote submission error:", error);
    return { success: false, error: "Failed to submit vote" };
  }

  return { success: true };
}

// Submit votes for all questions at once (for multi-question polls)
export async function submitAllVotes(
  pollId: string,
  votes: { questionId: string; optionId: string }[],
  sessionId: string
): Promise<VoteResult> {
  const supabase = await createClient();
  const headersList = await headers();

  // Hash IP for privacy
  const ip = headersList.get("x-forwarded-for") || "unknown";
  const ipHash = createHash("sha256").update(ip).digest("hex");

  // Detect device type from user agent
  const ua = headersList.get("user-agent") || "";
  const deviceType = /mobile/i.test(ua)
    ? "mobile"
    : /tablet/i.test(ua)
    ? "tablet"
    : "desktop";

  // Check if poll is active
  const { data: poll, error: pollError } = await supabase
    .from("polls")
    .select("status")
    .eq("id", pollId)
    .single();

  if (pollError || !poll) {
    return { success: false, error: "Poll not found" };
  }

  if (poll.status !== "active") {
    return { success: false, error: "This poll is no longer active" };
  }

  // Check if this IP has already voted on this poll
  const { data: existingIpVote } = await supabase
    .from("poll_responses")
    .select("id")
    .eq("poll_id", pollId)
    .eq("ip_hash", ipHash)
    .limit(1)
    .maybeSingle();

  if (existingIpVote) {
    return { success: false, error: "You have already voted in this poll", alreadyVoted: true };
  }

  // Check if already voted on any question
  const { data: existingVotes } = await supabase
    .from("poll_responses")
    .select("question_id")
    .eq("poll_id", pollId)
    .eq("session_id", sessionId);

  if (existingVotes && existingVotes.length > 0) {
    return { success: false, error: "You have already voted in this poll", alreadyVoted: true };
  }

  // Insert all votes
  const voteRecords = votes.map((vote) => ({
    poll_id: pollId,
    question_id: vote.questionId,
    option_id: vote.optionId,
    session_id: sessionId,
    ip_hash: ipHash,
    device_type: deviceType,
  }));

  const { error } = await supabase.from("poll_responses").insert(voteRecords);

  if (error) {
    // Handle unique constraint violation (duplicate vote)
    if (error.code === "23505") {
      return { success: false, error: "You have already voted in this poll", alreadyVoted: true };
    }
    console.error("Vote submission error:", error);
    return { success: false, error: "Failed to submit votes" };
  }

  return { success: true };
}

export async function checkIfVoted(
  pollId: string,
  sessionId: string
): Promise<boolean> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("poll_responses")
    .select("id")
    .eq("poll_id", pollId)
    .eq("session_id", sessionId)
    .limit(1);

  return !!data && data.length > 0;
}

// Check which questions have been answered
export async function getAnsweredQuestions(
  pollId: string,
  sessionId: string
): Promise<string[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("poll_responses")
    .select("question_id")
    .eq("poll_id", pollId)
    .eq("session_id", sessionId);

  return (data || []).map((r) => r.question_id).filter(Boolean) as string[];
}

export async function getPublicPoll(slug: string) {
  const supabase = await createClient();

  const { data: poll, error } = await supabase
    .from("polls")
    .select("*")
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (error || !poll) {
    return null;
  }

  const { data: options } = await supabase
    .from("poll_options")
    .select("*")
    .eq("poll_id", poll.id)
    .order("display_order");

  return { ...poll, options: options || [] };
}

// Get poll with all questions for public voting
export async function getPublicPollWithQuestions(slug: string) {
  const supabase = await createClient();

  const { data: poll, error } = await supabase
    .from("polls")
    .select("*")
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (error || !poll) {
    return null;
  }

  // Fetch questions
  const { data: questions } = await supabase
    .from("poll_questions")
    .select("*")
    .eq("poll_id", poll.id)
    .order("display_order");

  // Fetch ALL options for ALL questions in ONE query
  const questionIds = (questions || []).map(q => q.id);
  const { data: allOptions } = await supabase
    .from("poll_options")
    .select("*")
    .in("question_id", questionIds)
    .order("display_order");

  // Group options by question_id in JS
  const allOptionsArr = allOptions ?? [];
  const optionsByQuestion = allOptionsArr.reduce((acc, opt) => {
    if (!acc[opt.question_id]) acc[opt.question_id] = [];
    acc[opt.question_id].push(opt);
    return acc;
  }, {} as Record<string, typeof allOptionsArr[number][]>);

  const questionsWithOptions: PollQuestionWithOptions[] = (questions || []).map(q => ({
    ...q,
    options: optionsByQuestion[q.id] || [],
  }));

  return { ...poll, questions: questionsWithOptions };
}

export async function getPollResults(pollId: string) {
  const supabase = await createClient();

  const { data: poll } = await supabase
    .from("polls")
    .select("total_votes, show_results_after_vote")
    .eq("id", pollId)
    .single();

  if (!poll) {
    return null;
  }

  const { data: options } = await supabase
    .from("poll_options")
    .select("id, option_text, vote_count")
    .eq("poll_id", pollId)
    .order("display_order");

  return {
    totalVotes: poll.total_votes,
    showResults: poll.show_results_after_vote,
    options: options || [],
  };
}

// Get results for all questions in a poll
export async function getPollResultsWithQuestions(pollId: string) {
  const supabase = await createClient();

  const { data: poll } = await supabase
    .from("polls")
    .select("total_votes, show_results_after_vote, title")
    .eq("id", pollId)
    .single();

  if (!poll) {
    return null;
  }

  // Fetch questions
  const { data: questions } = await supabase
    .from("poll_questions")
    .select("*")
    .eq("poll_id", pollId)
    .order("display_order");

  // Fetch ALL options for ALL questions in ONE query
  const questionIds = (questions || []).map(q => q.id);
  const { data: allOptions } = await supabase
    .from("poll_options")
    .select("id, option_text, vote_count, question_id")
    .in("question_id", questionIds)
    .order("display_order");

  // Group options by question_id in JS
  const allOptionsArr2 = allOptions ?? [];
  const optionsByQuestion = allOptionsArr2.reduce((acc, opt) => {
    if (!acc[opt.question_id]) acc[opt.question_id] = [];
    acc[opt.question_id].push(opt);
    return acc;
  }, {} as Record<string, typeof allOptionsArr2[number][]>);

  const questionsWithResults = (questions || []).map(q => {
    const options = optionsByQuestion[q.id] || [];
    const questionVotes = options.reduce((sum, opt) => sum + opt.vote_count, 0);
    return {
      ...q,
      options,
      totalVotes: questionVotes,
    };
  });

  return {
    totalVotes: poll.total_votes,
    showResults: poll.show_results_after_vote,
    title: poll.title,
    questions: questionsWithResults,
  };
}
