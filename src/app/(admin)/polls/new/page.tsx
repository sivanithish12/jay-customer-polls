"use client";

import { useState } from "react";
import { createPoll } from "@/lib/actions/polls";
import { ArrowLeft, Plus, X, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import type { QuestionInput } from "@/types";

interface QuestionForm {
  question_text: string;
  description: string;
  options: string[];
  isExpanded: boolean;
}

export default function NewPollPage() {
  const [questions, setQuestions] = useState<QuestionForm[]>([
    { question_text: "", description: "", options: ["", ""], isExpanded: true },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add a new question
  const addQuestion = () => {
    setQuestions([
      ...questions.map((q) => ({ ...q, isExpanded: false })),
      { question_text: "", description: "", options: ["", ""], isExpanded: true },
    ]);
  };

  // Remove a question
  const removeQuestion = (qIndex: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== qIndex));
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
  };

  // Update question description
  const updateQuestionDescription = (qIndex: number, value: string) => {
    setQuestions(
      questions.map((q, i) =>
        i === qIndex ? { ...q, description: value } : q
      )
    );
  };

  // Add option to a question
  const addOption = (qIndex: number) => {
    if (questions[qIndex].options.length < 10) {
      setQuestions(
        questions.map((q, i) =>
          i === qIndex ? { ...q, options: [...q.options, ""] } : q
        )
      );
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
                oi === oIndex ? value : opt
              ),
            }
          : q
      )
    );
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
      options: q.options.filter((opt) => opt.trim() !== ""),
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
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/polls"
          className="inline-flex items-center gap-2 text-brand-mid-grey hover:text-brand-dark-grey mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to polls
        </Link>
        <h1 className="text-3xl font-bold text-brand-black">Create New Poll</h1>
        <p className="text-brand-mid-grey mt-1">
          Set up your poll with one or more questions
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Form */}
      <form action={handleSubmit} className="space-y-6">
        {/* Poll Title */}
        <div className="bg-white rounded-2xl shadow-sm border border-brand-light-grey/50 p-6">
          <div className="space-y-2">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-brand-dark-grey"
            >
              Poll Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              className="w-full px-4 py-3 border border-brand-light-grey rounded-xl focus:ring-2 focus:ring-brand-coral focus:border-brand-coral transition-colors"
              placeholder="e.g., Customer Satisfaction Survey"
            />
            <p className="text-sm text-brand-mid-grey">
              This will be shown to voters as the poll name
            </p>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-brand-black">
              Questions ({questions.length})
            </h2>
            <button
              type="button"
              onClick={addQuestion}
              className="flex items-center gap-2 text-brand-coral hover:text-brand-indigo font-medium text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Question
            </button>
          </div>

          {questions.map((question, qIndex) => (
            <div
              key={qIndex}
              className="bg-white rounded-2xl shadow-sm border border-brand-light-grey/50 overflow-hidden"
            >
              {/* Question Header */}
              <div
                className="flex items-center justify-between p-4 bg-brand-alabaster cursor-pointer"
                onClick={() => toggleQuestion(qIndex)}
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 flex items-center justify-center bg-brand-light-orange text-brand-coral rounded-lg text-sm font-bold">
                    {qIndex + 1}
                  </span>
                  <span className="font-medium text-brand-dark-grey">
                    {question.question_text || `Question ${qIndex + 1}`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
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
                  {question.isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-brand-mid-grey" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-brand-mid-grey" />
                  )}
                </div>
              </div>

              {/* Question Content */}
              {question.isExpanded && (
                <div className="p-6 space-y-4">
                  {/* Question Text */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-brand-dark-grey">
                      Question Text
                    </label>
                    <textarea
                      value={question.question_text}
                      onChange={(e) =>
                        updateQuestionText(qIndex, e.target.value)
                      }
                      rows={2}
                      className="w-full px-4 py-3 border border-brand-light-grey rounded-xl focus:ring-2 focus:ring-brand-coral focus:border-brand-coral transition-colors resize-none"
                      placeholder="e.g., How satisfied are you with our service?"
                    />
                  </div>

                  {/* Question Description */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-brand-dark-grey">
                      Description (optional)
                    </label>
                    <textarea
                      value={question.description}
                      onChange={(e) =>
                        updateQuestionDescription(qIndex, e.target.value)
                      }
                      rows={2}
                      className="w-full px-4 py-3 border border-brand-light-grey rounded-xl focus:ring-2 focus:ring-brand-coral focus:border-brand-coral transition-colors resize-none"
                      placeholder="Add more context for this question..."
                    />
                  </div>

                  {/* Options */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-brand-dark-grey">
                      Answer Options
                    </label>
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-2">
                        <span className="w-8 h-8 flex items-center justify-center bg-brand-light-mauve rounded-lg text-sm font-medium text-brand-mid-grey">
                          {oIndex + 1}
                        </span>
                        <input
                          type="text"
                          value={option}
                          onChange={(e) =>
                            updateOption(qIndex, oIndex, e.target.value)
                          }
                          className="flex-1 px-4 py-2.5 border border-brand-light-grey rounded-xl focus:ring-2 focus:ring-brand-coral focus:border-brand-coral transition-colors"
                          placeholder={`Option ${oIndex + 1}`}
                        />
                        {question.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(qIndex, oIndex)}
                            className="p-2 text-brand-mid-grey hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    {question.options.length < 10 && (
                      <button
                        type="button"
                        onClick={() => addOption(qIndex)}
                        className="flex items-center gap-2 text-brand-coral hover:text-brand-indigo font-medium text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Add option
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-brand-light-grey/50 p-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="showResults"
              defaultChecked
              className="w-5 h-5 rounded border-brand-light-grey text-brand-coral focus:ring-brand-coral"
            />
            <div>
              <p className="font-medium text-brand-black">
                Show results after voting
              </p>
              <p className="text-sm text-brand-mid-grey">
                Voters will see results for all questions after they complete
                the poll
              </p>
            </div>
          </label>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4">
          <Link
            href="/polls"
            className="px-4 py-2.5 text-brand-dark-grey font-medium hover:bg-brand-light-mauve rounded-xl transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 bg-gradient-to-r from-brand-indigo to-brand-coral hover:shadow-md text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating...
              </>
            ) : (
              `Create Poll with ${questions.length} Question${questions.length > 1 ? "s" : ""}`
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
