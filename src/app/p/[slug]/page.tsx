"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
  submitAllVotes,
  checkIfVoted,
  getPollResultsWithQuestions,
  getPublicPollWithQuestions,
} from "@/lib/actions/votes";
import {
  pageVariants,
  staggerContainer,
  staggerItem,
  barVariants,
  checkmarkVariants,
  logoVariants,
  pulseVariants,
  slideUpFade,
  celebrationVariants,
} from "@/lib/animations";
import { Check, Vote, Sparkles, TrendingUp, Heart, Users } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import type { Poll, PollQuestionWithOptions } from "@/types";

type PollStage = "welcome" | "voting" | "submitting" | "results" | "thankyou";

// Result types
interface QuestionResult {
  id: string;
  question_text: string;
  description: string | null;
  totalVotes: number;
  options: {
    id: string;
    option_text: string;
    vote_count: number;
  }[];
}

interface PollResults {
  totalVotes: number;
  showResults: boolean;
  title: string;
  questions: QuestionResult[];
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate or retrieve session ID
function getSessionId(): string {
  if (typeof window === "undefined") return "";

  let sessionId = localStorage.getItem("poll_session_id");
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("poll_session_id", sessionId);
  }
  return sessionId;
}

export default function PublicPollPage({ params }: PageProps) {
  const [slug, setSlug] = useState<string | null>(null);
  const [poll, setPoll] = useState<(Poll & { questions: PollQuestionWithOptions[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState<PollStage>("welcome");
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<PollResults | null>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const supabase = createClient();

  // Resolve params
  useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  // Fetch poll data
  useEffect(() => {
    if (!slug) return;

    async function fetchPoll() {
      // Use the new function that gets questions
      const pollData = await getPublicPollWithQuestions(slug);

      if (!pollData || !pollData.questions || pollData.questions.length === 0) {
        // Fallback to legacy poll fetch
        const { data: legacyPoll, error: pollError } = await supabase
          .from("polls")
          .select("*")
          .eq("slug", slug)
          .eq("status", "active")
          .single();

        if (pollError || !legacyPoll) {
          setLoading(false);
          return;
        }

        // Fetch legacy options
        const { data: optionsData } = await supabase
          .from("poll_options")
          .select("*")
          .eq("poll_id", legacyPoll.id)
          .order("display_order");

        // Convert to new format with a single question
        const legacyQuestion: PollQuestionWithOptions = {
          id: "legacy",
          poll_id: legacyPoll.id,
          question_text: legacyPoll.question,
          description: legacyPoll.description,
          display_order: 0,
          created_at: legacyPoll.created_at,
          options: optionsData || [],
        };

        setPoll({ ...legacyPoll, questions: [legacyQuestion] });
      } else {
        setPoll(pollData as Poll & { questions: PollQuestionWithOptions[] });
      }

      setLoading(false);

      // Check if already voted
      const sid = getSessionId();
      setSessionId(sid);

      if (pollData) {
        const hasVoted = await checkIfVoted(pollData.id, sid);
        if (hasVoted) {
          const resultsData = await getPollResultsWithQuestions(pollData.id);
          if (resultsData) {
            setResults(resultsData as PollResults);
          }
          setStage("results");
        }
      }
    }

    fetchPoll();
  }, [slug, supabase]);

  // Trigger confetti with brand colors
  const triggerConfetti = useCallback(() => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#FB654D", "#6144DD", "#009966", "#F4A462"],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#FB654D", "#6144DD", "#009966", "#F4A462"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  // Check if all questions are answered
  const allQuestionsAnswered = poll?.questions.every(
    (q) => selectedOptions[q.id]
  );

  // Handle final vote submission
  const handleSubmitVotes = async () => {
    if (!poll || !allQuestionsAnswered) return;

    setStage("submitting");
    setError(null);

    // Build votes array
    const votes = poll.questions.map((q) => ({
      questionId: q.id,
      optionId: selectedOptions[q.id],
    }));

    const result = await submitAllVotes(poll.id, votes, sessionId);

    if (!result.success) {
      if (result.alreadyVoted) {
        toast.info("You have already voted in this poll");
        const resultsData = await getPollResultsWithQuestions(poll.id);
        if (resultsData) {
          setResults(resultsData as PollResults);
        }
        setStage("results");
      } else {
        toast.error(result.error || "Something went wrong");
        setError(result.error || "Something went wrong");
        setStage("voting");
      }
      return;
    }

    // Fetch results after voting
    if (poll.show_results_after_vote) {
      const resultsData = await getPollResultsWithQuestions(poll.id);
      if (resultsData) {
        setResults(resultsData as PollResults);
      }
      setStage("results");

      // Show thank you after viewing results
      setTimeout(() => {
        setStage("thankyou");
        triggerConfetti();
      }, 5000);
    } else {
      setStage("thankyou");
      triggerConfetti();
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-light-orange/60 via-brand-light-mauve/40 to-brand-alabaster flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-brand-light-grey border-t-brand-coral rounded-full"
        />
      </div>
    );
  }

  // Poll not found
  if (!poll) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-light-orange/60 via-brand-light-mauve/40 to-brand-alabaster flex items-center justify-center p-6 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center relative z-10"
        >
          <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Vote className="w-12 h-12 text-brand-mid-grey" />
          </div>
          <h1 className="text-3xl font-bold text-brand-black mb-3">Poll Not Found</h1>
          <p className="text-brand-mid-grey text-lg">This poll may have ended or doesn&apos;t exist.</p>
        </motion.div>
      </div>
    );
  }

  const totalQuestions = poll.questions.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-light-orange/60 via-brand-light-mauve/40 to-brand-alabaster flex items-center justify-center p-6 relative overflow-hidden">

      <AnimatePresence mode="wait">
        {/* Welcome Stage */}
        {stage === "welcome" && (
          <motion.div
            key="welcome"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="max-w-lg w-full text-center relative z-10"
          >
            <motion.div
              variants={logoVariants}
              initial="initial"
              animate="animate"
              className="w-24 h-24 bg-gradient-to-br from-brand-indigo to-brand-coral rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl"
            >
              <Vote className="w-12 h-12 text-white" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md mb-6"
            >
              <Sparkles className="w-4 h-4 text-brand-coral" />
              <span className="text-sm font-medium text-brand-dark-grey">Your opinion matters</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-bold text-brand-black mb-4"
            >
              {poll.title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-brand-mid-grey text-lg mb-6"
            >
              {poll.description || "We value your opinion! Take a moment to share your thoughts."}
            </motion.p>

            {/* Show total votes so far */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-light-mauve rounded-full mb-8"
            >
              <Users className="w-4 h-4 text-brand-mid-grey" />
              <span className="text-sm font-medium text-brand-dark-grey">
                {poll.total_votes} {poll.total_votes === 1 ? "person has" : "people have"} voted
              </span>
            </motion.div>

            {/* Show number of questions */}
            {totalQuestions > 1 && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-sm text-brand-mid-grey mb-6"
              >
                This poll has {totalQuestions} questions
              </motion.p>
            )}

            <motion.button
              variants={pulseVariants}
              initial="initial"
              animate="animate"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setStage("voting")}
              className="px-10 py-4 bg-gradient-to-r from-brand-indigo to-brand-coral text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Start Voting
            </motion.button>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-sm text-brand-mid-grey mt-8"
            >
              Takes less than {totalQuestions > 1 ? `${totalQuestions} minutes` : "30 seconds"}
            </motion.p>
          </motion.div>
        )}

        {/* Voting Stage - All questions on single page */}
        {stage === "voting" && poll && (
          <motion.div
            key="voting"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="max-w-2xl w-full relative z-10 flex flex-col max-h-[90vh]"
          >
            {/* Sticky Progress Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="sticky top-0 z-20 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg mb-6 border border-brand-light-grey/50"
            >
              {/* Header content */}
              <div className="px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-brand-indigo to-brand-coral rounded-xl flex items-center justify-center shadow-sm">
                      <Vote className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-base font-bold text-brand-black line-clamp-1">{poll.title}</h2>
                  </div>

                  {/* Progress badge */}
                  <div className="flex items-center gap-2 bg-brand-alabaster px-3 py-1.5 rounded-full">
                    <span className="text-sm font-semibold text-brand-dark-grey">
                      {Object.keys(selectedOptions).length}/{totalQuestions}
                    </span>
                    <div className="w-px h-4 bg-brand-light-grey" />
                    <span className="text-sm font-bold text-brand-coral">
                      {Math.round((Object.keys(selectedOptions).length / totalQuestions) * 100)}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-brand-light-mauve rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(Object.keys(selectedOptions).length / totalQuestions) * 100}%` }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-brand-indigo to-brand-coral rounded-full"
                  />
                </div>
              </div>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm text-center"
              >
                {error}
              </motion.div>
            )}

            {/* Scrollable Questions Container */}
            <div className="flex-1 overflow-y-auto scrollbar-hide space-y-6 pb-4">
              {poll.questions.map((question, qIndex) => (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: qIndex * 0.1 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md"
                >
                  {/* Question header with "Question X of Y" */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold text-brand-coral bg-brand-light-orange px-3 py-1 rounded-full">
                      Question {qIndex + 1} of {totalQuestions}
                    </span>
                    {selectedOptions[question.id] && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-xs font-semibold text-brand-bright-emerald bg-brand-light-emerald px-3 py-1 rounded-full flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        Answered
                      </motion.span>
                    )}
                  </div>

                  {/* Question text */}
                  <div className="mb-5">
                    <h3 className="text-lg font-semibold text-brand-black">
                      {question.question_text}
                    </h3>
                    {question.description && (
                      <p className="text-sm text-brand-mid-grey mt-1">{question.description}</p>
                    )}
                  </div>

                  {/* Options */}
                  <div className="space-y-3">
                    {question.options.map((option) => (
                      <motion.button
                        key={option.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => {
                          setSelectedOptions((prev) => ({
                            ...prev,
                            [question.id]: option.id,
                          }));
                        }}
                        className={`w-full p-4 rounded-xl text-left border-2 transition-all duration-200 ${
                          selectedOptions[question.id] === option.id
                            ? "border-brand-coral bg-brand-light-orange shadow-md"
                            : "border-brand-light-grey bg-white hover:border-brand-coral/30 hover:bg-brand-light-orange/30"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                              selectedOptions[question.id] === option.id
                                ? "border-brand-coral bg-brand-coral"
                                : "border-brand-light-grey"
                            }`}
                          >
                            {selectedOptions[question.id] === option.id && (
                              <motion.svg
                                viewBox="0 0 24 24"
                                className="w-3 h-3 text-white"
                              >
                                <motion.path
                                  variants={checkmarkVariants}
                                  initial="hidden"
                                  animate="visible"
                                  d="M5 13l4 4L19 7"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </motion.svg>
                            )}
                          </div>
                          <span
                            className={`font-medium transition-colors ${
                              selectedOptions[question.id] === option.id
                                ? "text-brand-coral"
                                : "text-brand-dark-grey"
                            }`}
                          >
                            {option.option_text}
                          </span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ))}

              {/* Submit button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="pt-2 pb-4 text-center"
              >
                <button
                  onClick={handleSubmitVotes}
                  disabled={!allQuestionsAnswered}
                  className={`px-10 py-4 font-semibold rounded-2xl transition-all duration-300 ${
                    allQuestionsAnswered
                      ? "bg-gradient-to-r from-brand-indigo to-brand-coral text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                      : "bg-brand-light-mauve text-brand-mid-grey cursor-not-allowed"
                  }`}
                >
                  {allQuestionsAnswered
                    ? "Submit All Answers"
                    : `Answer ${totalQuestions - Object.keys(selectedOptions).length} more question${totalQuestions - Object.keys(selectedOptions).length !== 1 ? "s" : ""}`
                  }
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Submitting Stage */}
        {stage === "submitting" && (
          <motion.div
            key="submitting"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="text-center relative z-10"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-lg">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-brand-light-grey border-t-brand-coral rounded-full mx-auto mb-6"
              />
              <p className="text-brand-dark-grey font-medium text-lg">Submitting your votes...</p>
            </div>
          </motion.div>
        )}

        {/* Results Stage - Show all questions on one page */}
        {stage === "results" && results && (
          <motion.div
            key="results"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="max-w-2xl w-full relative z-10 max-h-[90vh] overflow-y-auto scrollbar-hide"
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="w-20 h-20 bg-brand-light-emerald rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-md">
                <TrendingUp className="w-10 h-10 text-brand-bright-emerald" />
              </div>
              <h2 className="text-3xl font-bold text-brand-black mb-2">
                Poll Results
              </h2>
              <p className="text-brand-mid-grey text-lg">
                {results.totalVotes} total {results.totalVotes === 1 ? "vote" : "votes"}
              </p>
            </motion.div>

            {/* All questions results */}
            <div className="space-y-8">
              {results.questions.map((question, qIndex) => (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: qIndex * 0.1 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md"
                >
                  {/* Question header with number */}
                  <div className="flex items-start gap-3 mb-4">
                    <span className="w-8 h-8 flex items-center justify-center bg-brand-light-orange text-brand-coral rounded-lg text-sm font-bold flex-shrink-0">
                      {qIndex + 1}
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold text-brand-black">
                        {question.question_text}
                      </h3>
                      <p className="text-sm text-brand-mid-grey mt-1">
                        {question.totalVotes} {question.totalVotes === 1 ? "response" : "responses"}
                      </p>
                    </div>
                  </div>

                  {/* Options with results */}
                  <div className="space-y-3">
                    {question.options
                      .sort((a, b) => b.vote_count - a.vote_count)
                      .map((option, optIndex) => {
                        const percentage =
                          question.totalVotes > 0
                            ? Math.round((option.vote_count / question.totalVotes) * 100)
                            : 0;

                        return (
                          <div key={option.id} className="space-y-2">
                            <span className="font-medium text-brand-dark-grey">
                              {option.option_text}
                            </span>
                            <div className="h-2 bg-brand-light-mauve rounded-full overflow-hidden">
                              <motion.div
                                custom={percentage}
                                variants={barVariants}
                                initial="initial"
                                animate="animate"
                                className={`h-full rounded-full ${
                                  optIndex === 0
                                    ? "bg-gradient-to-r from-brand-indigo to-brand-coral"
                                    : "bg-brand-light-grey"
                                }`}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Thank You Stage */}
        {stage === "thankyou" && (
          <motion.div
            key="thankyou"
            variants={slideUpFade}
            initial="initial"
            animate="animate"
            exit="exit"
            className="text-center max-w-lg relative z-10"
          >
            <motion.div
              variants={celebrationVariants}
              initial="initial"
              animate="animate"
              className="w-28 h-28 bg-gradient-to-br from-brand-bright-emerald to-brand-indigo rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl"
            >
              <Sparkles className="w-14 h-14 text-white" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-bold text-brand-black mb-4"
            >
              Thank You!
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-brand-mid-grey text-xl mb-10"
            >
              Your votes have been recorded. We appreciate you taking the time to share your opinions!
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-light-emerald text-brand-bright-emerald rounded-full font-medium shadow-md mb-8"
            >
              <Check className="w-5 h-5" />
              All answers submitted successfully
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <a
                href="https://justmovein.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 bg-gradient-to-r from-brand-indigo to-brand-coral text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              >
                Visit JustMoveIn
              </a>
              <a
                href="/"
                className="px-8 py-3 bg-white text-brand-dark-grey font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 border border-brand-light-grey"
              >
                Back to Home
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
