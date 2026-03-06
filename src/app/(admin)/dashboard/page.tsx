import { createClient } from "@/lib/supabase/server";
import {
  ClipboardList,
  Users,
  BarChart2,
  Clock,
  Plus,
  Activity,
} from "lucide-react";
import Link from "next/link";

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

async function getStats() {
  const supabase = await createClient();

  const [
    { count: totalPolls },
    { count: activePolls },
    { count: draftPolls },
    { data: votesData },
    { data: recentPolls },
  ] = await Promise.all([
    supabase.from("polls").select("*", { count: "exact", head: true }),
    supabase.from("polls").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("polls").select("*", { count: "exact", head: true }).eq("status", "draft"),
    supabase.from("polls").select("total_votes"),
    supabase
      .from("polls")
      .select("id, title, status, total_votes, created_at, slug")
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const totalVotes = (votesData || []).reduce(
    (sum, p) => sum + (p.total_votes || 0),
    0
  );

  return {
    totalPolls: totalPolls ?? 0,
    activePolls: activePolls ?? 0,
    draftPolls: draftPolls ?? 0,
    totalVotes,
    recentPolls: recentPolls || [],
  };
}

export default async function DashboardPage() {
  const stats = await getStats();
  const { recentPolls, totalPolls, activePolls, draftPolls, totalVotes } = stats;
  const greeting = getTimeGreeting();

  const maxVotes = Math.max(...recentPolls.map((p) => p.total_votes || 0), 1);

  return (
    <div className="space-y-6">
      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-brand-black">
            {greeting} 👋
          </h1>
          <p className="text-sm text-brand-mid-grey mt-0.5">
            Here is your engagement overview for today.
          </p>
        </div>
        <Link
          href="/polls/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-indigo to-brand-coral text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 tracking-wide shrink-0"
        >
          <Plus className="w-4 h-4" />
          + CREATE POLL
        </Link>
      </div>

      {/* ── Stats Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Polls */}
        <div className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 bg-brand-light-blue rounded-xl flex items-center justify-center">
              <BarChart2 className="w-5 h-5 text-brand-bright-blue" />
            </div>
            <span className="text-xs font-semibold text-brand-bright-blue bg-brand-light-blue px-2 py-0.5 rounded-full">
              ↑ All time
            </span>
          </div>
          <p className="text-xs text-brand-mid-grey font-semibold uppercase tracking-wider">
            Total Polls
          </p>
          <p className="text-3xl font-bold text-brand-black mt-1">
            {totalPolls.toLocaleString()}
          </p>
        </div>

        {/* Active Polls */}
        <div className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 bg-brand-light-emerald rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-brand-bright-emerald" />
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-bright-emerald bg-brand-light-emerald px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-brand-bright-emerald rounded-full animate-pulse" />
              Live now
            </span>
          </div>
          <p className="text-xs text-brand-mid-grey font-semibold uppercase tracking-wider">
            Active Polls
          </p>
          <p className="text-3xl font-bold text-brand-black mt-1">{activePolls}</p>
        </div>

        {/* Total Votes */}
        <div className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 bg-brand-light-orange rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-brand-coral" />
            </div>
            <span className="text-xs font-semibold text-brand-coral bg-brand-light-orange px-2 py-0.5 rounded-full">
              ↑ 5.2%
            </span>
          </div>
          <p className="text-xs text-brand-mid-grey font-semibold uppercase tracking-wider">
            Total Votes
          </p>
          <p className="text-3xl font-bold text-brand-black mt-1">
            {totalVotes.toLocaleString()}
          </p>
        </div>

        {/* Draft Polls */}
        <div className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 bg-brand-light-yellow rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-brand-brown" />
            </div>
            <span className="text-xs font-semibold text-brand-brown bg-brand-light-yellow px-2 py-0.5 rounded-full">
              ↑ 2.1%
            </span>
          </div>
          <p className="text-xs text-brand-mid-grey font-semibold uppercase tracking-wider">
            Draft Polls
          </p>
          <p className="text-3xl font-bold text-brand-black mt-1">{draftPolls}</p>
        </div>
      </div>

      {/* ── Recent Polls Table ────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        {/* Section header */}
        <div className="px-6 py-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-brand-black">Recent Polls</h2>
          <Link
            href="/polls"
            className="text-sm font-semibold text-brand-coral hover:text-brand-indigo transition-colors"
          >
            View All
          </Link>
        </div>

        {/* Column headers — desktop only */}
        <div className="hidden md:grid grid-cols-[minmax(0,2fr)_110px_minmax(0,1.5fr)_110px] px-6 py-2.5 bg-brand-alabaster">
          <span className="text-xs font-semibold text-brand-mid-grey uppercase tracking-wider">
            POLL DETAILS
          </span>
          <span className="text-xs font-semibold text-brand-mid-grey uppercase tracking-wider">
            STATUS
          </span>
          <span className="text-xs font-semibold text-brand-mid-grey uppercase tracking-wider">
            ENGAGEMENT
          </span>
          <span className="text-xs font-semibold text-brand-mid-grey uppercase tracking-wider">
            CREATED
          </span>
        </div>

        {recentPolls.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <div className="w-14 h-14 bg-brand-light-mauve rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="w-7 h-7 text-brand-indigo" />
            </div>
            <h3 className="font-semibold text-brand-black mb-1">No polls yet</h3>
            <p className="text-sm text-brand-mid-grey mb-5">
              Create your first poll to start collecting responses.
            </p>
            <Link
              href="/polls/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-indigo to-brand-coral text-white text-sm font-semibold rounded-xl"
            >
              <Plus className="w-4 h-4" />
              Create Poll
            </Link>
          </div>
        ) : (
          recentPolls.map((poll) => {
            const votes = poll.total_votes || 0;
            const pct = Math.round((votes / maxVotes) * 100);
            const activityLabel =
              votes === 0
                ? "Not Started"
                : votes < 20
                ? "Starting"
                : votes < 100
                ? "Steady"
                : "High Activity";
            const activityColor =
              votes === 0
                ? "text-brand-mid-grey"
                : votes < 100
                ? "text-brand-dark-grey"
                : "text-brand-bright-emerald";

            return (
              <Link
                key={poll.id}
                href={`/polls/${poll.id}`}
                className="flex md:grid md:grid-cols-[minmax(0,2fr)_110px_minmax(0,1.5fr)_110px] items-center gap-3 px-6 py-3 hover:bg-brand-alabaster/60 transition-colors group"
              >
                {/* Poll details */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 bg-brand-light-mauve rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-brand-light-orange transition-colors">
                    <ClipboardList className="w-4 h-4 text-brand-indigo group-hover:text-brand-coral transition-colors" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-brand-black text-sm truncate group-hover:text-brand-coral transition-colors">
                      {poll.title}
                    </p>
                    <p className="text-xs text-brand-mid-grey mt-0.5">
                      {poll.status === "active"
                        ? "Active"
                        : poll.status === "draft"
                        ? "Draft"
                        : "Closed"}{" "}
                      · Multiple Choice
                    </p>
                  </div>
                </div>

                {/* Status */}
                <div className="flex-shrink-0">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      poll.status === "active"
                        ? "bg-brand-light-emerald text-brand-bright-emerald"
                        : poll.status === "draft"
                        ? "bg-brand-light-yellow text-brand-brown"
                        : "bg-brand-light-grey text-brand-mid-grey"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        poll.status === "active"
                          ? "bg-brand-bright-emerald animate-pulse"
                          : poll.status === "draft"
                          ? "bg-brand-brown"
                          : "bg-brand-mid-grey"
                      }`}
                    />
                    {poll.status === "active"
                      ? "Active"
                      : poll.status === "draft"
                      ? "Draft"
                      : "Closed"}
                  </span>
                </div>

                {/* Engagement */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-bold text-brand-black">
                      {votes.toLocaleString()} votes
                    </span>
                    <span className={`text-xs font-medium ${activityColor}`}>
                      {activityLabel}
                    </span>
                  </div>
                  <div className="h-1.5 bg-brand-light-mauve rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        poll.status === "closed"
                          ? "bg-brand-mid-grey"
                          : "bg-gradient-to-r from-brand-indigo to-brand-coral"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Created */}
                <span className="text-xs text-brand-mid-grey flex-shrink-0 hidden md:block">
                  {new Date(poll.created_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
