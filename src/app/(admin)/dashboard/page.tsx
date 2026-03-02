import { createClient } from "@/lib/supabase/server";
import { ClipboardList, Users, TrendingUp, Clock, Plus, ArrowRight, ChevronRight } from "lucide-react";
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
      .limit(5),
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
  const recentPolls = stats.recentPolls;
  const greeting = getTimeGreeting();

  const statCards = [
    {
      label: "Total Polls",
      value: stats.totalPolls,
      icon: ClipboardList,
      iconBg: "bg-brand-light-blue",
      iconColor: "text-brand-bright-blue",
      accentBar: "bg-brand-bright-blue",
    },
    {
      label: "Active Polls",
      value: stats.activePolls,
      icon: TrendingUp,
      iconBg: "bg-brand-light-emerald",
      iconColor: "text-brand-bright-emerald",
      accentBar: "bg-brand-bright-emerald",
    },
    {
      label: "Draft Polls",
      value: stats.draftPolls,
      icon: Clock,
      iconBg: "bg-brand-light-yellow",
      iconColor: "text-brand-brown",
      accentBar: "bg-brand-brown",
    },
    {
      label: "Total Votes",
      value: stats.totalVotes,
      icon: Users,
      iconBg: "bg-brand-light-orange",
      iconColor: "text-brand-coral",
      accentBar: "bg-brand-coral",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-brand-black">
            {greeting}, Jay 👋
          </h1>
          <p className="text-brand-mid-grey mt-1 text-sm">
            Here&apos;s what&apos;s happening with your polls today.
          </p>
        </div>
        <Link
          href="/polls/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-indigo to-brand-coral text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create Poll
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl p-6 border border-brand-light-grey/50 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              <div
                className={`w-12 h-12 ${stat.iconBg} rounded-xl flex items-center justify-center shrink-0`}
              >
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              <span className="text-4xl font-bold text-brand-black leading-none">
                {stat.value}
              </span>
            </div>
            <p className="text-sm text-brand-mid-grey font-medium mt-1">
              {stat.label}
            </p>
            <div className={`h-1 rounded-full mt-4 ${stat.accentBar}`} />
          </div>
        ))}
      </div>

      {/* Quick Actions Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link
          href="/polls/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-indigo to-brand-coral text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-sm"
        >
          <Plus className="w-4 h-4" />
          Create Poll
        </Link>
        <Link
          href="/polls"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-brand-light-grey text-brand-dark-grey hover:border-brand-indigo hover:text-brand-indigo rounded-xl transition-all duration-200 text-sm font-medium"
        >
          View All Polls
        </Link>
      </div>

      {/* Recent Polls Section */}
      <div className="bg-white rounded-2xl border border-brand-light-grey/50 shadow-sm overflow-hidden">
        {/* Section Header */}
        <div className="px-6 py-4 border-b border-brand-light-grey/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-brand-black">Recent Polls</h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-light-mauve text-brand-indigo">
              {recentPolls.length}
            </span>
          </div>
          <Link
            href="/polls"
            className="text-sm font-medium text-brand-coral hover:text-brand-indigo transition-colors"
          >
            View all →
          </Link>
        </div>

        {/* Poll Rows */}
        {recentPolls.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-brand-light-mauve rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="w-8 h-8 text-brand-indigo" />
            </div>
            <h3 className="text-lg font-semibold text-brand-black mb-2">No polls yet</h3>
            <p className="text-brand-mid-grey text-sm mb-6">
              Create your first poll to start collecting feedback.
            </p>
            <Link
              href="/polls/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-indigo to-brand-coral text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all text-sm"
            >
              <Plus className="w-4 h-4" />
              Create your first poll
            </Link>
          </div>
        ) : (
          <div>
            {recentPolls.map((poll) => (
              <Link
                key={poll.id}
                href={`/polls/${poll.id}`}
                className="flex items-center gap-4 p-4 hover:bg-brand-alabaster transition-colors group border-b border-brand-light-grey/30 last:border-b-0"
              >
                {/* Status Dot */}
                <div
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    poll.status === "active"
                      ? "bg-brand-bright-emerald"
                      : poll.status === "draft"
                      ? "bg-brand-brown"
                      : "bg-brand-mid-grey"
                  }`}
                />

                {/* Poll Icon */}
                <div className="w-10 h-10 bg-brand-light-mauve rounded-xl flex items-center justify-center group-hover:bg-brand-light-orange transition-colors shrink-0">
                  <ClipboardList className="w-5 h-5 text-brand-indigo group-hover:text-brand-coral transition-colors" />
                </div>

                {/* Poll Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-brand-black group-hover:text-brand-coral transition-colors text-sm truncate">
                    {poll.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {/* Status Badge */}
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        poll.status === "active"
                          ? "bg-brand-light-emerald text-brand-bright-emerald"
                          : poll.status === "draft"
                          ? "bg-brand-light-yellow text-brand-brown"
                          : "bg-brand-light-grey text-brand-mid-grey"
                      }`}
                    >
                      {poll.status}
                    </span>
                    {/* Votes */}
                    <span className="text-xs text-brand-mid-grey flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {poll.total_votes} votes
                    </span>
                  </div>
                </div>

                {/* Right: Date + Chevron */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-brand-mid-grey">
                    {new Date(poll.created_at).toLocaleDateString()}
                  </span>
                  <ChevronRight className="w-4 h-4 text-brand-mid-grey opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
