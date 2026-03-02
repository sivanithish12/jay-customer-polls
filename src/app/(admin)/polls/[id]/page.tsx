import { getPollWithQuestions } from "@/lib/actions/polls";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Eye,
  Users,
  Clock,
} from "lucide-react";
import { CopyButton } from "@/components/ui/copy-button";
import { DeletePollDialog } from "@/components/admin/delete-poll-dialog";
import { PublishPollButton, ClosePollButton } from "@/components/admin/poll-status-buttons";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PollDetailPage({ params }: PageProps) {
  const { id } = await params;
  const poll = await getPollWithQuestions(id);

  if (!poll) {
    notFound();
  }

  // ISSUE C4 FIX: Don't fall back to localhost — an empty base is safer in production.
  // Admins must set NEXT_PUBLIC_APP_URL in their Vercel environment variables.
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  if (!appUrl && process.env.NODE_ENV === "production") {
    console.warn(
      "⚠️  NEXT_PUBLIC_APP_URL is not set — poll share links will be broken. Add it to your Vercel environment variables."
    );
  }
  const pollUrl = `${appUrl}/p/${poll.slug}`;

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/polls"
          className="inline-flex items-center gap-2 text-brand-mid-grey hover:text-brand-dark-grey mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to polls
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-brand-black">{poll.title}</h1>
              <span
                className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                  poll.status === "active"
                    ? "bg-brand-light-emerald text-brand-bright-emerald"
                    : poll.status === "draft"
                    ? "bg-brand-light-mauve text-brand-dark-grey"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {poll.status}
              </span>
            </div>
            <p className="text-brand-dark-grey mt-1">{poll.question}</p>
          </div>

          {/* ISSUE H9 FIX: Publish/Close buttons now use client components with confirmation */}
          <div className="flex items-center gap-2">
            {poll.status === "draft" && (
              <PublishPollButton pollId={poll.id} />
            )}
            {poll.status === "active" && (
              <ClosePollButton pollId={poll.id} />
            )}
            <Link
              href={`/polls/${id}/results`}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-indigo to-brand-coral hover:shadow-md text-white font-medium rounded-xl transition-all"
            >
              <Eye className="w-4 h-4" />
              Results
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Poll Link — ISSUE M3 FIX: only show copyable URL for active polls */}
          <div className="bg-white rounded-2xl shadow-sm border border-brand-light-grey/50 p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-brand-black">
                {poll.status === "active" ? "Share Poll" : "Poll Link"}
              </h3>
              {poll.status !== "active" && (
                <span className="text-xs px-2 py-1 bg-brand-light-mauve text-brand-indigo rounded-full font-medium">
                  {poll.status === "draft" ? "Publish to enable voting" : "Poll is closed"}
                </span>
              )}
            </div>

            {poll.status !== "active" ? (
              // ISSUE M3 FIX: For non-active polls, hide the copyable URL to avoid sharing broken links
              <div className="p-4 bg-brand-light-mauve rounded-xl border border-brand-light-grey text-sm text-brand-dark-grey">
                <span className="font-medium">Poll not yet public.</span>{" "}
                {poll.status === "draft"
                  ? "Publish this poll to generate a shareable link for customers."
                  : "This poll is closed and no longer accepting votes. The link is disabled."}
              </div>
            ) : (
              // Only show the full copy UI when the poll is active
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={pollUrl}
                  readOnly
                  className="flex-1 px-4 py-2.5 bg-brand-alabaster border border-brand-light-grey rounded-xl text-sm text-brand-dark-grey"
                />
                <CopyButton text={pollUrl} />
                <a
                  href={`/p/${poll.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-brand-light-orange hover:bg-brand-light-orange/80 rounded-xl transition-colors"
                  title="Open poll"
                >
                  <ExternalLink className="w-5 h-5 text-brand-coral" />
                </a>
              </div>
            )}
          </div>

          {/* Questions & Options */}
          <div className="bg-white rounded-2xl shadow-sm border border-brand-light-grey/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-brand-black">Questions & Options</h3>
              <span className="text-sm text-brand-mid-grey">
                {poll.questions.length} question{poll.questions.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="space-y-6">
              {poll.questions.map((question, qIndex) => (
                <div key={question.id} className="space-y-3">
                  {/* Question Header */}
                  <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-brand-light-orange to-brand-light-mauve rounded-xl border border-brand-light-grey/50">
                    <div className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-brand-indigo to-brand-coral rounded-lg text-sm font-bold text-white flex-shrink-0">
                      Q{qIndex + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-brand-black">{question.question_text}</p>
                      {question.description && (
                        <p className="text-sm text-brand-mid-grey mt-1">{question.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Options for this question */}
                  <div className="ml-4 space-y-2">
                    {question.options.map((option, oIndex) => (
                      <div
                        key={option.id}
                        className="flex items-center gap-3 p-3 bg-brand-alabaster rounded-xl"
                      >
                        <span className="w-7 h-7 flex items-center justify-center bg-white border border-brand-light-grey rounded-lg text-sm font-medium text-brand-mid-grey">
                          {oIndex + 1}
                        </span>
                        <span className="flex-1 text-brand-dark-grey">{option.option_text}</span>
                        <span className="text-sm font-medium text-brand-mid-grey">
                          {option.vote_count} votes
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="bg-white rounded-2xl shadow-sm border border-brand-light-grey/50 p-6">
            <h3 className="font-semibold text-brand-black mb-4">Statistics</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-light-orange rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-brand-coral" />
                </div>
                <div>
                  <p className="text-sm text-brand-mid-grey">Total Votes</p>
                  <p className="text-xl font-bold text-brand-black">
                    {poll.total_votes}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-light-emerald rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-brand-bright-emerald" />
                </div>
                <div>
                  <p className="text-sm text-brand-mid-grey">Created</p>
                  <p className="font-medium text-brand-black">
                    {new Date(poll.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white rounded-2xl shadow-sm border border-brand-light-grey/50 p-6">
            <h3 className="font-semibold text-brand-black mb-4">Settings</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-brand-mid-grey">Questions</span>
                <span className="font-medium text-brand-black">
                  {poll.questions.length} question{poll.questions.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-brand-mid-grey">Poll Type</span>
                <span className="font-medium text-brand-black capitalize">
                  {poll.poll_type.replace("_", " ")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-brand-mid-grey">Show Results</span>
                <span className="font-medium text-brand-black">
                  {poll.show_results_after_vote ? "After voting" : "Hidden"}
                </span>
              </div>
            </div>
          </div>

          {/* Danger Zone — ISSUE C3 FIX: Delete now uses confirmation dialog */}
          <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6">
            <h3 className="font-semibold text-red-600 mb-4">Danger Zone</h3>
            <DeletePollDialog pollId={poll.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
