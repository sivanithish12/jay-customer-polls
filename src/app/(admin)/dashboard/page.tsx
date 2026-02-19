import { createClient } from "@/lib/supabase/server";
import { ClipboardList, Users, TrendingUp, Clock, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";

async function getStats() {
  const supabase = await createClient();

  // Get poll counts
  const { data: polls } = await supabase
    .from("polls")
    .select("id, status, total_votes");

  const totalPolls = polls?.length || 0;
  const activePolls = polls?.filter((p) => p.status === "active").length || 0;
  const totalVotes = polls?.reduce((sum, p) => sum + (p.total_votes || 0), 0) || 0;

  return { totalPolls, activePolls, totalVotes };
}

async function getRecentPolls() {
  const supabase = await createClient();

  const { data: polls } = await supabase
    .from("polls")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  return polls || [];
}

export default async function DashboardPage() {
  const stats = await getStats();
  const recentPolls = await getRecentPolls();

  const statCards = [
    {
      label: "Total Polls",
      value: stats.totalPolls,
      icon: ClipboardList,
      bgColor: "bg-brand-light-blue",
      iconColor: "text-brand-bright-blue",
    },
    {
      label: "Active Polls",
      value: stats.activePolls,
      icon: TrendingUp,
      bgColor: "bg-brand-light-emerald",
      iconColor: "text-brand-bright-emerald",
    },
    {
      label: "Total Votes",
      value: stats.totalVotes,
      icon: Users,
      bgColor: "bg-brand-light-orange",
      iconColor: "text-brand-coral",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-black">Dashboard</h1>
          <p className="text-brand-dark-grey mt-1">Welcome back! Here&apos;s an overview of your polls.</p>
        </div>
        <Link
          href="/polls/new"
          className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-brand-indigo to-brand-coral text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          Create Poll
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl p-6 shadow-sm border border-brand-light-grey/50 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 ${stat.bgColor} rounded-xl flex items-center justify-center`}
              >
                <stat.icon className={`w-7 h-7 ${stat.iconColor}`} />
              </div>
              <div>
                <p className="text-sm text-brand-mid-grey font-medium">{stat.label}</p>
                <p className="text-3xl font-bold text-brand-black">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Polls */}
      <div className="bg-white rounded-2xl shadow-sm border border-brand-light-grey/50 overflow-hidden">
        <div className="p-6 border-b border-brand-light-grey/50 flex items-center justify-between">
          <h2 className="text-xl font-bold text-brand-black">Recent Polls</h2>
          <Link
            href="/polls"
            className="text-sm font-medium text-brand-coral hover:text-brand-indigo transition-colors inline-flex items-center gap-1"
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="divide-y divide-brand-light-grey/50">
          {recentPolls.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-brand-light-mauve rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ClipboardList className="w-8 h-8 text-brand-mid-grey" />
              </div>
              <h3 className="text-lg font-semibold text-brand-black mb-2">No polls yet</h3>
              <p className="text-brand-dark-grey mb-6">Create your first poll to start collecting feedback.</p>
              <Link
                href="/polls/new"
                className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-brand-indigo to-brand-coral text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                <Plus className="w-5 h-5" />
                Create Poll
              </Link>
            </div>
          ) : (
            recentPolls.map((poll) => (
              <Link
                key={poll.id}
                href={`/polls/${poll.id}`}
                className="flex items-center justify-between p-5 hover:bg-brand-alabaster transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-light-blue rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                    <ClipboardList className="w-6 h-6 text-brand-bright-blue" />
                  </div>
                  <div>
                    <p className="font-semibold text-brand-black group-hover:text-brand-coral transition-colors">
                      {poll.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span
                        className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                          poll.status === "active"
                            ? "bg-brand-light-emerald text-brand-bright-emerald"
                            : poll.status === "draft"
                            ? "bg-brand-light-mauve text-brand-dark-grey"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {poll.status}
                      </span>
                      <span className="text-sm text-brand-mid-grey flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {poll.total_votes} votes
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-brand-mid-grey">
                  <Clock className="w-4 h-4" />
                  {new Date(poll.created_at).toLocaleDateString()}
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-brand-coral" />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
