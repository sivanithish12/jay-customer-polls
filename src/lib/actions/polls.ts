"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { CreatePollInput, UpdatePollInput, PollWithOptions, PollWithQuestions, Poll, QuestionInput } from "@/types";

export async function createPoll(input: CreatePollInput) {
  const supabase = await createClient();

  console.log("[createPoll] Starting poll creation...");

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  console.log("[createPoll] Auth check:", { user: user?.email, authError: authError?.message });

  if (!user) {
    console.log("[createPoll] Not authenticated - returning error");
    return { error: "Not authenticated" };
  }

  // Build questions array - combine first question with additional questions
  const allQuestions: QuestionInput[] = [];

  // First question (backward compatible)
  if (input.question && input.options && input.options.length > 0) {
    allQuestions.push({
      question_text: input.question,
      description: input.description,
      options: input.options,
    });
  }

  // Additional questions
  if (input.questions && input.questions.length > 0) {
    allQuestions.push(...input.questions);
  }

  // Validate we have at least one question
  if (allQuestions.length === 0) {
    return { error: "At least one question is required" };
  }

  // Validate each question has at least 2 options
  for (let i = 0; i < allQuestions.length; i++) {
    const validOptions = allQuestions[i].options.filter((opt) => opt.trim() !== "");
    if (validOptions.length < 2) {
      return { error: `Question ${i + 1} must have at least 2 options` };
    }
  }

  // Create poll
  console.log("[createPoll] Inserting poll with data:", {
    title: input.title,
    question: allQuestions[0].question_text,
    created_by: user.id,
  });

  const { data: poll, error: pollError } = await supabase
    .from("polls")
    .insert({
      title: input.title,
      question: allQuestions[0].question_text, // Store first question for backward compatibility
      description: input.description || null,
      poll_type: input.poll_type || "single_choice",
      show_results_after_vote: input.show_results_after_vote ?? true,
      created_by: user.id,
    })
    .select()
    .single();

  console.log("[createPoll] Poll insert result:", { poll: poll?.id, pollError: pollError?.message });

  if (pollError) {
    console.error("[createPoll] Poll creation error:", pollError);
    return { error: pollError.message };
  }

  // Create questions and their options
  for (let qIndex = 0; qIndex < allQuestions.length; qIndex++) {
    const questionInput = allQuestions[qIndex];

    // Create question
    const { data: question, error: questionError } = await supabase
      .from("poll_questions")
      .insert({
        poll_id: poll.id,
        question_text: questionInput.question_text,
        description: questionInput.description || null,
        display_order: qIndex,
      })
      .select()
      .single();

    if (questionError) {
      console.error("[createPoll] Question creation error:", questionError);
      await supabase.from("polls").delete().eq("id", poll.id);
      return { error: questionError.message };
    }

    // Create options for this question
    const options = questionInput.options
      .filter((text) => text.trim() !== "")
      .map((text, index) => ({
        poll_id: poll.id,
        question_id: question.id,
        option_text: text.trim(),
        display_order: index,
      }));

    const { error: optionsError } = await supabase
      .from("poll_options")
      .insert(options);

    if (optionsError) {
      console.error("[createPoll] Options error, rolling back:", optionsError);
      await supabase.from("polls").delete().eq("id", poll.id);
      return { error: optionsError.message };
    }
  }

  console.log("[createPoll] Success! Redirecting to /polls/" + poll.id);
  revalidatePath("/polls");
  revalidatePath("/dashboard");
  redirect(`/polls/${poll.id}`);
}

export async function updatePoll(pollId: string, input: UpdatePollInput) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("polls")
    .update({
      title: input.title,
      question: input.question,
      description: input.description,
      status: input.status,
      show_results_after_vote: input.show_results_after_vote,
      expires_at: input.expires_at,
      ...(input.status === "active" && { published_at: new Date().toISOString() }),
    })
    .eq("id", pollId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/polls/${pollId}`);
  revalidatePath("/polls");
  revalidatePath("/dashboard");

  return { success: true };
}

export async function publishPoll(pollId: string) {
  return updatePoll(pollId, { status: "active" });
}

export async function closePoll(pollId: string) {
  return updatePoll(pollId, { status: "closed" });
}

export async function deletePoll(pollId: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("polls").delete().eq("id", pollId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/polls");
  revalidatePath("/dashboard");
  redirect("/polls");
}

export async function getPoll(pollId: string): Promise<PollWithOptions | null> {
  const supabase = await createClient();

  const { data: poll, error } = await supabase
    .from("polls")
    .select("*")
    .eq("id", pollId)
    .single();

  if (error || !poll) {
    return null;
  }

  const { data: options } = await supabase
    .from("poll_options")
    .select("*")
    .eq("poll_id", pollId)
    .order("display_order");

  return { ...poll, options: options || [] } as PollWithOptions;
}

export async function getPollWithQuestions(pollId: string): Promise<PollWithQuestions | null> {
  const supabase = await createClient();

  const { data: poll, error } = await supabase
    .from("polls")
    .select("*")
    .eq("id", pollId)
    .single();

  if (error || !poll) {
    return null;
  }

  // Fetch questions with their options
  const { data: questions } = await supabase
    .from("poll_questions")
    .select("*")
    .eq("poll_id", pollId)
    .order("display_order");

  const questionsWithOptions = await Promise.all(
    (questions || []).map(async (question) => {
      const { data: options } = await supabase
        .from("poll_options")
        .select("*")
        .eq("question_id", question.id)
        .order("display_order");

      return { ...question, options: options || [] };
    })
  );

  return { ...poll, questions: questionsWithOptions } as PollWithQuestions;
}

export async function getPolls(): Promise<Poll[]> {
  const supabase = await createClient();

  const { data: polls } = await supabase
    .from("polls")
    .select("*")
    .order("created_at", { ascending: false });

  return (polls || []) as Poll[];
}
