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
  Share2,
  ChevronRight,
} from "lucide-react";
import { CopyButton } from "@/components/ui/copy-button";
import { LoadingLink } from "@/components/ui/loading-link";
import { DeletePollDialog } from "@/components/admin/delete-poll-dialog";
import {
  PublishPollButton,
  ClosePollButton,
} from "@/components/admin/poll-status-buttons";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PollDetailPage({ params }: PageProps) {
  const { id } = await params;
  const poll = await getPollWithQuestions(id);

  if (!poll) {
    notFound();
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  if (!appUrl && process.env.NODE_ENV === "production") {
    console.warn(
      "⚠️  NEXT_PUBLIC_APP_URL is not set — poll share links will be broken."
    );
  }
  const pollUrl = `${appUrl}/p/${poll.slug}`;

  // Calculate totals for vote bars
  const totalVotesPerQuestion = poll.questions.map((q) =>
    q.options.reduce((sum, opt) => sum + opt.vote_count, 0)
  );

  return (
    <div>
      {/* ── Breadcrumb ───────────────────────────────────────── */}
      <nav className="flex items-center gap-1.5 text-sm text-brand-mid-grey mb-5">
        <Link href="/polls" className="hover:text-brand-dark-grey transition-colors">
          All Polls
        </Link>
        <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="text-brand-dark-grey font-medium truncate max-w-[200px]">
          {poll.title}
        </span>
      </nav>

      {/* ── Hero Header ──────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap mb-1">
            <h1 className="text-2xl font-bold text-brand-black leading-tight">
              {poll.title}
            </h1>
            {poll.status === "active" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-light-emerald text-brand-bright-emerald text-xs font-bold rounded-full tracking-wide">
                <span className="w-1.5 h-1.5 bg-brand-bright-emerald rounded-full animate-pulse" />
                LIVE NOW
              </span>
            )}
            {poll.status === "draft" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-light-yellow text-brand-brown text-xs font-bold rounded-full tracking-wide">
                <span className="w-1.5 h-1.5 bg-brand-brown rounded-full" />
                DRAFT
              </span>
            )}
            {poll.status === "closed" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-light-grey text-brand-mid-grey text-xs font-bold rounded-full tracking-wide">
                <span className="w-1.5 h-1.5 bg-brand-mid-grey rounded-full" />
                CLOSED
              </span>
            )}
          </div>
          {poll.question && (
            <p className="text-brand-dark-grey text-sm mt-1">{poll.question}</p>
          )}
        </div>

        {/* Top-right actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {poll.status === "active" && (
            <a
              href={`/p/${poll.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-brand-light-grey text-brand-dark-grey font-semibold rounded-xl text-sm hover:border-brand-indigo hover:text-brand-indigo transition-all"
            >
              <Share2 className="w-4 h-4" />
              Share
            </a>
          )}
          <LoadingLink
            href={`/polls/${id}/results`}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-indigo to-brand-coral text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all text-sm"
            loaderClassName="text-white"
          >
            <Eye className="w-4 h-4" />
            View Results
          </LoadingLink>
        </div>
      </div>

      {/* ── Main Layout ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left Column (vote bars + share) ──────────────── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Questions + Vote Bars */}
          {poll.questions.map((question, qIndex) => {
            const questionTotal = totalVotesPerQuestion[qIndex];
            const sortedOptions = [...question.options].sort(
              (a, b) => b.vote_count - a.vote_count
            );
            const leadingId = sortedOptions[0]?.id;

            return (
              <div
                key={question.id}
                className="bg-white rounded-2xl shadow-md p-6"
              >
                {/* Question header */}
                <div className="flex items-start gap-3 mb-5">
                  <div className="w-8 h-8 bg-gradient-to-br from-brand-indigo to-brand-coral rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                    {qIndex + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-brand-black text-base leading-snug">
                      {question.question_text}
                    </h3>
                    {question.description && (
                      <p className="text-xs text-brand-mid-grey mt-0.5">
                        {question.description}
                      </p>
                    )}
                    <p className="text-xs text-brand-mid-grey mt-1">
                      {questionTotal} response{questionTotal !== 1 ? "s" : ""} ·{" "}
                      {question.options.length} options
                    </p>
                  </div>
                </div>

                {/* Option Vote Bars */}
                <div className="space-y-3">
                  {sortedOptions.map((option) => {
                    const percentage =
                      questionTotal > 0
                        ? Math.round((option.vote_count / questionTotal) * 100)
                        : 0;
                    const isLeading = option.id === leadingId && option.vote_count > 0;

                    return (
                      <div key={option.id}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="text-sm font-medium text-brand-dark-grey truncate">
                              {option.option_text}
                            </span>
                            {isLeading && (
                              <span className="inline-flex items-center px-1.5 py-0.5 bg-brand-light-orange text-brand-coral text-xs font-semibold rounded-full flex-shrink-0">
                                ●
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                            <span className="text-xs text-brand-mid-grey font-medium">
                              {option.vote_count} votes
                            </span>
                            <span className="text-sm font-bold text-brand-black w-10 text-right">
                              {percentage}%
                            </span>
                          </div>
                        </div>
                        {/* Progress bar */}
                        <div className="h-2 bg-brand-light-grey/25 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isLeading
                                ? "bg-gradient-to-r from-brand-indigo to-brand-coral"
                                : "bg-brand-mid-grey/50"
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Share Link */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
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

            {poll.status !== "active" ? (
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
        </div>

        {/* ── Right Sidebar ─────────────────────────────────── */}
        <div className="space-y-4">
          {/* Engagement Card */}
          <div className="bg-white rounded-2xl shadow-md p-5">
            <p className="text-xs font-semibold text-brand-mid-grey uppercase tracking-wider mb-4">
              Engagement
            </p>
            <div className="space-y-4">
              {/* Total Voters */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-light-orange rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-brand-coral" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-brand-black leading-none">
                    {poll.total_votes}
                  </p>
                  <p className="text-xs text-brand-mid-grey font-medium mt-0.5">
                    Total Voters
                  </p>
                </div>
              </div>

              {/* Questions */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-light-mauve rounded-xl flex items-center justify-center flex-shrink-0">
                  <ClipboardList className="w-5 h-5 text-brand-indigo" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-brand-black leading-none">
                    {poll.questions.length}
                  </p>
                  <p className="text-xs text-brand-mid-grey font-medium mt-0.5">
                    Question{poll.questions.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {/* Created */}
              <div className="pt-3">
                <p className="text-xs text-brand-mid-grey mb-1">Created</p>
                <p className="text-sm font-semibold text-brand-black">
                  {new Date(poll.created_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Actions Card */}
          <div className="bg-white rounded-2xl shadow-md p-5">
            <p className="text-xs font-semibold text-brand-mid-grey uppercase tracking-wider mb-4">
              Actions
            </p>
            <div className="space-y-2">
              <LoadingLink
                href={`/polls/${id}/results`}
                className="flex items-center gap-3 w-full px-4 py-2.5 bg-brand-light-mauve hover:bg-brand-indigo/10 text-brand-indigo font-semibold rounded-xl text-sm transition-colors"
                loaderClassName="text-brand-indigo mx-auto"
              >
                <Eye className="w-4 h-4 flex-shrink-0" />
                View Full Analytics
              </LoadingLink>

              {poll.status === "draft" && (
                <div className="w-full">
                  <PublishPollButton pollId={poll.id} />
                </div>
              )}
              {poll.status === "active" && (
                <div className="w-full">
                  <ClosePollButton pollId={poll.id} />
                </div>
              )}
            </div>
          </div>

          {/* Settings Card */}
          <div className="bg-white rounded-2xl shadow-md p-5">
            <p className="text-xs font-semibold text-brand-mid-grey uppercase tracking-wider mb-4">
              Settings
            </p>
            <div className="space-y-0">
              <div className="flex items-center justify-between py-2.5">
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

          {/* Danger Zone */}
          <div className="bg-white rounded-2xl shadow-md p-5">
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
