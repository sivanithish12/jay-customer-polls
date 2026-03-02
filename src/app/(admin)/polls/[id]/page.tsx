import { getPollWithQuestions } from "@/lib/actions/polls";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Eye,
  Users,
  Clock,
  ClipboardList,
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
    <div className="max-w-5xl">

      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="mb-8">
        <Link
          href="/polls"
          className="inline-flex items-center gap-1.5 text-brand-mid-grey hover:text-brand-dark-grey text-sm mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to polls
        </Link>

        <div className="flex items-start justify-between gap-4">
          {/* Title + status */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h1 className="text-2xl font-bold text-brand-black truncate">
                {poll.title}
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                  poll.status === "active"
                    ? "bg-brand-light-emerald text-brand-bright-emerald"
                    : poll.status === "draft"
                    ? "bg-brand-light-yellow text-brand-brown"
                    : "bg-brand-light-grey text-brand-dark-grey"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    poll.status === "active"
                      ? "bg-brand-bright-emerald"
                      : poll.status === "draft"
                      ? "bg-brand-brown"
                      : "bg-brand-dark-grey"
                  }`}
                />
                {poll.status.charAt(0).toUpperCase() + poll.status.slice(1)}
              </span>
            </div>
            {poll.question && (
              <p className="text-brand-dark-grey text-sm">{poll.question}</p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {poll.status === "draft" && <PublishPollButton pollId={poll.id} />}
            {poll.status === "active" && <ClosePollButton pollId={poll.id} />}
            <Link
              href={`/polls/${id}/results`}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-indigo to-brand-coral text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all text-sm"
            >
              <Eye className="w-4 h-4" />
              View Results
            </Link>
          </div>
        </div>
      </div>

      {/* ── Stats Strip ─────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Total Votes */}
        <div className="bg-white rounded-xl border border-brand-light-grey/50 p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-light-orange rounded-xl flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 text-brand-coral" />
          </div>
          <div>
            <p className="text-2xl font-bold text-brand-black">{poll.total_votes}</p>
            <p className="text-xs text-brand-mid-grey font-medium">Total Votes</p>
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white rounded-xl border border-brand-light-grey/50 p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-light-mauve rounded-xl flex items-center justify-center flex-shrink-0">
            <ClipboardList className="w-5 h-5 text-brand-indigo" />
          </div>
          <div>
            <p className="text-2xl font-bold text-brand-black">{poll.questions.length}</p>
            <p className="text-xs text-brand-mid-grey font-medium">Questions</p>
          </div>
        </div>

        {/* Created */}
        <div className="bg-white rounded-xl border border-brand-light-grey/50 p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-light-blue rounded-xl flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-brand-bright-blue" />
          </div>
          <div>
            <p className="text-sm font-bold text-brand-black">
              {new Date(poll.created_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
            <p className="text-xs text-brand-mid-grey font-medium">Created</p>
          </div>
        </div>
      </div>

      {/* ── Main Grid ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left column (2/3) ─────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Share Poll card */}
          <div className="bg-white rounded-2xl border border-brand-light-grey/50 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    poll.status === "active"
                      ? "bg-brand-bright-emerald animate-pulse"
                      : "bg-brand-light-grey"
                  }`}
                />
                <h3 className="font-semibold text-brand-black text-sm">
                  Share Link
                </h3>
              </div>
            </div>

            {poll.status !== "active" ? (
              /* Non-active: informational message */
              <div className="flex items-center gap-3 p-4 bg-brand-light-mauve rounded-xl">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-brand-indigo" />
                </div>
                <p className="text-sm text-brand-dark-grey">
                  <span className="font-semibold">Poll not yet public.</span>{" "}
                  {poll.status === "draft"
                    ? "Publish this poll to generate a shareable link."
                    : "This poll is closed and no longer accepting votes."}
                </p>
              </div>
            ) : (
              /* Active: copyable URL row */
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-brand-alabaster border border-brand-light-grey rounded-xl">
                  <ExternalLink className="w-4 h-4 text-brand-mid-grey flex-shrink-0" />
                  <span className="text-sm text-brand-dark-grey truncate flex-1">
                    {pollUrl}
                  </span>
                </div>
                <CopyButton text={pollUrl} />
                <a
                  href={`/p/${poll.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-brand-light-orange hover:bg-brand-coral hover:text-white rounded-xl transition-colors group"
                  title="Open poll"
                >
                  <ExternalLink className="w-5 h-5 text-brand-coral group-hover:text-white" />
                </a>
              </div>
            )}
          </div>

          {/* Questions & Options card */}
          <div className="bg-white rounded-2xl border border-brand-light-grey/50 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-brand-black">Questions</h3>
              <span className="text-xs font-semibold text-brand-indigo bg-brand-light-mauve px-2.5 py-1 rounded-full">
                {poll.questions.length} question{poll.questions.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="space-y-5">
              {poll.questions.map((question, qIndex) => (
                <div key={question.id} className="space-y-3">
                  {/* Question header */}
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 bg-gradient-to-br from-brand-indigo to-brand-coral rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                      {qIndex + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-brand-black text-sm">
                        {question.question_text}
                      </p>
                      {question.description && (
                        <p className="text-xs text-brand-mid-grey mt-0.5">
                          {question.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Options */}
                  <div className="ml-10 space-y-2">
                    {question.options.map((option, oIndex) => (
                      <div
                        key={option.id}
                        className="flex items-center gap-3 p-3 bg-brand-alabaster rounded-xl hover:bg-brand-light-mauve transition-colors group"
                      >
                        {/* Letter badge */}
                        <span className="w-6 h-6 flex items-center justify-center bg-white border border-brand-light-grey rounded-md text-xs font-bold text-brand-mid-grey flex-shrink-0 group-hover:border-brand-indigo group-hover:text-brand-indigo transition-colors">
                          {String.fromCharCode(65 + oIndex)}
                        </span>
                        <span className="flex-1 text-sm text-brand-dark-grey">
                          {option.option_text}
                        </span>
                        <span className="text-xs font-semibold text-brand-mid-grey bg-white px-2 py-0.5 rounded-full border border-brand-light-grey">
                          {option.vote_count} votes
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Divider between questions */}
                  {qIndex < poll.questions.length - 1 && (
                    <div className="border-t border-brand-light-grey/50 mt-4" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right column (1/3) ────────────────────────────────── */}
        <div className="space-y-5">

          {/* Settings card */}
          <div className="bg-white rounded-2xl border border-brand-light-grey/50 shadow-sm p-5">
            <p className="text-xs font-semibold text-brand-mid-grey uppercase tracking-wider mb-4">
              Settings
            </p>
            <div>
              <div className="flex items-center justify-between py-2.5 border-b border-brand-light-grey/40">
                <span className="text-sm text-brand-mid-grey">Questions</span>
                <span className="text-sm font-semibold text-brand-black">
                  {poll.questions.length} question{poll.questions.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5 border-b border-brand-light-grey/40">
                <span className="text-sm text-brand-mid-grey">Poll Type</span>
                <span className="text-sm font-semibold text-brand-black capitalize">
                  {poll.poll_type.replace("_", " ")}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-sm text-brand-mid-grey">Show Results</span>
                <span className="text-sm font-semibold text-brand-black">
                  {poll.show_results_after_vote ? "After voting" : "Hidden"}
                </span>
              </div>
            </div>
          </div>

          {/* Danger Zone card */}
          <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-5">
            <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-1">
              Danger Zone
            </p>
            <p className="text-xs text-brand-mid-grey mb-4">
              This action cannot be undone.
            </p>
            <DeletePollDialog pollId={poll.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
