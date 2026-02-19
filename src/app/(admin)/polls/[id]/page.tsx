import { getPollWithQuestions, publishPoll, closePoll, deletePoll } from "@/lib/actions/polls";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Play,
  Pause,
  Trash2,
  Eye,
  Users,
  Clock,
  HelpCircle,
} from "lucide-react";
import { CopyButton } from "@/components/ui/copy-button";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PollDetailPage({ params }: PageProps) {
  const { id } = await params;
  const poll = await getPollWithQuestions(id);

  if (!poll) {
    notFound();
  }

  // Use relative URL for the link (works regardless of domain/port)
  const pollPath = `/p/${poll.slug}`;
  // For copying, we need full URL - construct from window.location on client or use env var
  const pollUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}${pollPath}`;

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

          <div className="flex items-center gap-2">
            {poll.status === "draft" && (
              <form action={async () => { "use server"; await publishPoll(id); }}>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl transition-colors"
                >
                  <Play className="w-4 h-4" />
                  Publish
                </button>
              </form>
            )}
            {poll.status === "active" && (
              <form action={async () => { "use server"; await closePoll(id); }}>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-colors"
                >
                  <Pause className="w-4 h-4" />
                  Close
                </button>
              </form>
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
          {/* Poll Link - Show for all statuses */}
          <div className="bg-white rounded-2xl shadow-sm border border-brand-light-grey/50 p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-brand-black">
                {poll.status === "active" ? "Share Poll" : "Poll Link"}
              </h3>
              {poll.status !== "active" && (
                <span className="text-xs px-2 py-1 bg-brand-light-yellow text-brand-brown rounded-full font-medium">
                  {poll.status === "draft" ? "Publish to enable voting" : "Poll is closed"}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={pollUrl}
                readOnly
                className="flex-1 px-4 py-2.5 bg-brand-alabaster border border-brand-light-grey rounded-xl text-sm text-brand-dark-grey"
              />
              <CopyButton text={pollUrl} />
              <a
                href={pollPath}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-brand-light-orange hover:bg-brand-light-orange/80 rounded-xl transition-colors"
                title={poll.status === "active" ? "Open poll" : "Preview poll (voting disabled)"}
              >
                <ExternalLink className="w-5 h-5 text-brand-coral" />
              </a>
            </div>
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

          {/* Danger Zone */}
          <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6">
            <h3 className="font-semibold text-red-600 mb-4">Danger Zone</h3>
            <form action={async () => { "use server"; await deletePoll(id); }}>
              <button
                type="submit"
                className="flex items-center gap-2 w-full px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-xl transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete Poll
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
