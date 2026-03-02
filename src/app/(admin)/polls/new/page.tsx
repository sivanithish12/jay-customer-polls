"use client";

import { useState, useEffect } from "react";
import { createPoll } from "@/lib/actions/polls";
import { ArrowLeft, Plus, X, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import type { QuestionInput } from "@/types";

interface OptionForm {
  id: string;
  text: string;
}

interface QuestionForm {
  id: string;
  question_text: string;
  description: string;
  options: OptionForm[];
  isExpanded: boolean;
}

export default function NewPollPage() {
  const [questions, setQuestions] = useState<QuestionForm[]>([
    {
      id: crypto.randomUUID(),
      question_text: "",
      description: "",
      options: [
        { id: crypto.randomUUID(), text: "" },
        { id: crypto.randomUUID(), text: "" },
      ],
      isExpanded: true,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Warn user before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        return "You have unsaved changes. Are you sure you want to leave?";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Add a new question
  const addQuestion = () => {
    setQuestions([
      ...questions.map((q) => ({ ...q, isExpanded: false })),
      {
        id: crypto.randomUUID(),
        question_text: "",
        description: "",
        options: [
          { id: crypto.randomUUID(), text: "" },
          { id: crypto.randomUUID(), text: "" },
        ],
        isExpanded: true,
      },
    ]);
    setIsDirty(true);
  };

  // Remove a question
  const removeQuestion = (qIndex: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== qIndex));
      setIsDirty(true);
    }
  };

  // Toggle question expansion
  const toggleQuestion = (qIndex: number) => {
    setQuestions(
      questions.map((q, i) =>
        i === qIndex ? { ...q, isExpanded: !q.isExpanded } : q
      )
    );
  };

  // Update question text
  const updateQuestionText = (qIndex: number, value: string) => {
    setQuestions(
      questions.map((q, i) =>
        i === qIndex ? { ...q, question_text: value } : q
      )
    );
    setIsDirty(true);
  };

  // Update question description
  const updateQuestionDescription = (qIndex: number, value: string) => {
    setQuestions(
      questions.map((q, i) =>
        i === qIndex ? { ...q, description: value } : q
      )
    );
    setIsDirty(true);
  };

  // Add option to a question
  const addOption = (qIndex: number) => {
    if (questions[qIndex].options.length < 10) {
      setQuestions(
        questions.map((q, i) =>
          i === qIndex
            ? { ...q, options: [...q.options, { id: crypto.randomUUID(), text: "" }] }
            : q
        )
      );
      setIsDirty(true);
    }
  };

  // Remove option from a question
  const removeOption = (qIndex: number, oIndex: number) => {
    if (questions[qIndex].options.length > 2) {
      setQuestions(
        questions.map((q, i) =>
          i === qIndex
            ? { ...q, options: q.options.filter((_, oi) => oi !== oIndex) }
            : q
        )
      );
      setIsDirty(true);
    }
  };

  // Update option text
  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    setQuestions(
      questions.map((q, i) =>
        i === qIndex
          ? {
              ...q,
              options: q.options.map((opt, oi) =>
                oi === oIndex ? { ...opt, text: value } : opt
              ),
            }
          : q
      )
    );
    setIsDirty(true);
  };

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);

    const title = formData.get("title") as string;
    const showResults = formData.get("showResults") === "on";

    // Build questions array for the API
    const questionInputs: QuestionInput[] = questions.map((q) => ({
      question_text: q.question_text,
      description: q.description || undefined,
      options: q.options.map((opt) => opt.text).filter((text) => text.trim() !== ""),
    }));

    // Validate
    if (!title.trim()) {
      setError("Poll title is required");
      setIsLoading(false);
      return;
    }

    for (let i = 0; i < questionInputs.length; i++) {
      if (!questionInputs[i].question_text.trim()) {
        setError(`Question ${i + 1} text is required`);
        setIsLoading(false);
        return;
      }
      if (questionInputs[i].options.length < 2) {
        setError(`Question ${i + 1} must have at least 2 options`);
        setIsLoading(false);
        return;
      }
    }

    // Clear dirty flag before submitting so beforeunload doesn't fire on redirect
    setIsDirty(false);

    // Use the first question for backward compatibility
    const result = await createPoll({
      title,
      question: questionInputs[0].question_text,
      description: questionInputs[0].description,
      show_results_after_vote: showResults,
      options: questionInputs[0].options,
      questions: questionInputs.length > 1 ? questionInputs.slice(1) : undefined,
    });

    if (result?.error) {
      setError(result.error);
      setIsDirty(true);
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link
            href="/polls"
            className="inline-flex items-center gap-1.5 text-brand-mid-grey hover:text-brand-dark-grey text-sm mb-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to polls
          </Link>
          <h1 className="text-2xl font-bold text-brand-black">Create New Poll</h1>
          <p className="text-brand-mid-grey text-sm mt-1">
            Build your poll, add questions, and share with customers
          </p>
        </div>
        {/* Question count indicator */}
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-brand-light-mauve rounded-xl">
          <span className="text-sm font-medium text-brand-indigo">
            {questions.length} question{questions.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Form */}
      <form action={handleSubmit} className="space-y-5">
        {/* Poll Details Card */}
        <div className="bg-white rounded-2xl border border-brand-light-grey/50 shadow-sm p-6">
          <p className="text-xs font-semibold text-brand-mid-grey uppercase tracking-wider mb-4">
            Poll Details
          </p>
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-semibold text-brand-dark-grey mb-1.5"
            >
              Poll Title <span className="text-brand-coral">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              onChange={() => setIsDirty(true)}
              className="w-full px-4 py-3 bg-brand-alabaster border border-brand-light-grey rounded-xl text-brand-black placeholder:text-brand-mid-grey focus:outline-none focus:ring-2 focus:ring-brand-coral/30 focus:border-brand-coral transition-all text-sm"
              placeholder="e.g., Customer Satisfaction Q4 2025"
            />
            <p className="text-xs text-brand-mid-grey mt-1.5">
              This is the title customers see before they vote.
            </p>
          </div>
        </div>

        {/* Questions Section */}
        <div className="space-y-3">
          {/* Section header row */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-brand-black">Questions</h2>
              <p className="text-xs text-brand-mid-grey mt-0.5">
                {questions.length} of 10 questions added
              </p>
            </div>
            <button
              type="button"
              onClick={addQuestion}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-light-mauve text-brand-indigo rounded-xl text-sm font-semibold hover:bg-brand-indigo hover:text-white transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              Add Question
            </button>
          </div>

          {/* Question cards */}
          {questions.map((question, qIndex) => (
            <div
              key={question.id}
              className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
                question.isExpanded
                  ? "border-brand-coral/30 shadow-md"
                  : "border-brand-light-grey/50"
              }`}
            >
              {/* Question card header */}
              <div
                onClick={() => toggleQuestion(qIndex)}
                className="flex items-center gap-3 p-4 cursor-pointer hover:bg-brand-alabaster transition-colors"
              >
                {/* Number badge */}
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-indigo to-brand-coral flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {qIndex + 1}
                </div>
                {/* Title */}
                <span className="flex-1 text-sm font-medium text-brand-dark-grey truncate">
                  {question.question_text || `Question ${qIndex + 1} — click to expand`}
                </span>
                {/* Option count */}
                <span className="text-xs text-brand-mid-grey mr-2">
                  {question.options.length} options
                </span>
                {/* Remove button */}
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeQuestion(qIndex);
                    }}
                    className="p-1.5 text-brand-mid-grey hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                {/* Expand icon */}
                {question.isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-brand-mid-grey" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-brand-mid-grey" />
                )}
              </div>

              {/* Expanded question body */}
              {question.isExpanded && (
                <div className="p-5 pt-0 space-y-5 border-t border-brand-light-grey/50">
                  {/* Question text */}
                  <div className="pt-5">
                    <label className="block text-xs font-semibold text-brand-mid-grey uppercase tracking-wide mb-1.5">
                      Question
                    </label>
                    <textarea
                      value={question.question_text}
                      onChange={(e) => updateQuestionText(qIndex, e.target.value)}
                      rows={2}
                      className="w-full px-4 py-3 bg-brand-alabaster border border-brand-light-grey rounded-xl text-brand-black placeholder:text-brand-mid-grey focus:outline-none focus:ring-2 focus:ring-brand-coral/30 focus:border-brand-coral transition-all text-sm resize-none"
                      placeholder="e.g., How would you rate your overall experience?"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-semibold text-brand-mid-grey uppercase tracking-wide mb-1.5">
                      Description{" "}
                      <span className="font-normal text-brand-mid-grey normal-case">
                        (optional)
                      </span>
                    </label>
                    <textarea
                      value={question.description}
                      onChange={(e) =>
                        updateQuestionDescription(qIndex, e.target.value)
                      }
                      rows={2}
                      className="w-full px-4 py-3 bg-brand-alabaster border border-brand-light-grey rounded-xl text-brand-black placeholder:text-brand-mid-grey focus:outline-none focus:ring-2 focus:ring-brand-coral/30 focus:border-brand-coral transition-all text-sm resize-none"
                      placeholder="Add more context for this question..."
                    />
                  </div>

                  {/* Options */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-brand-mid-grey uppercase tracking-wide">
                        Answer Options
                      </label>
                      <span className="text-xs text-brand-mid-grey">
                        {question.options.length}/10
                      </span>
                    </div>
                    <div className="space-y-2">
                      {question.options.map((option, oIndex) => (
                        <div key={option.id} className="flex items-center gap-2">
                          {/* Letter badge A, B, C… */}
                          <span className="w-8 h-8 flex items-center justify-center bg-brand-light-mauve text-brand-indigo rounded-lg text-sm font-bold flex-shrink-0">
                            {String.fromCharCode(65 + oIndex)}
                          </span>
                          <input
                            type="text"
                            value={option.text}
                            onChange={(e) =>
                              updateOption(qIndex, oIndex, e.target.value)
                            }
                            className="flex-1 px-3.5 py-2.5 bg-brand-alabaster border border-brand-light-grey rounded-xl text-sm text-brand-black placeholder:text-brand-mid-grey focus:outline-none focus:ring-2 focus:ring-brand-coral/30 focus:border-brand-coral transition-all"
                            placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                          />
                          {question.options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeOption(qIndex, oIndex)}
                              className="p-2 text-brand-mid-grey hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    {question.options.length < 10 && (
                      <button
                        type="button"
                        onClick={() => addOption(qIndex)}
                        className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-brand-coral hover:text-brand-indigo transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add option
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Settings Card */}
        <div className="bg-white rounded-2xl border border-brand-light-grey/50 shadow-sm p-6">
          <p className="text-xs font-semibold text-brand-mid-grey uppercase tracking-wider mb-4">
            Poll Settings
          </p>
          <label className="flex items-start gap-4 cursor-pointer group">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                name="showResults"
                defaultChecked
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-brand-light-grey rounded-full peer-checked:bg-brand-coral transition-colors peer-focus:ring-2 peer-focus:ring-brand-coral/30"></div>
              <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-5"></div>
            </div>
            <div>
              <p className="text-sm font-semibold text-brand-black">
                Show results after voting
              </p>
              <p className="text-xs text-brand-mid-grey mt-0.5">
                Voters will see live results for all questions immediately after
                they submit
              </p>
            </div>
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <X className="w-3 h-3 text-red-500" />
            </div>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Submit Row */}
        <div className="flex items-center justify-between pt-2">
          <Link
            href="/polls"
            className="px-5 py-2.5 text-brand-dark-grey font-medium hover:text-brand-black hover:bg-brand-light-mauve rounded-xl transition-all text-sm"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-brand-indigo to-brand-coral text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating poll...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Create Poll
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
