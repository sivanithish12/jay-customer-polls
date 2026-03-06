import { getPolls } from "@/lib/actions/polls";
import Link from "next/link";
import { ClipboardList, Plus } from "lucide-react";
import { PollsListClient } from "@/components/admin/polls-list-client";

export default async function PollsPage() {
  const polls = await getPolls();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-black">All Polls</h1>
          <p className="text-brand-dark-grey mt-1">
            Manage and monitor all your polls
          </p>
        </div>
        <Link
          href="/polls/new"
          className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-brand-indigo to-brand-coral text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          Create Poll
        </Link>
      </div>

      {/* Polls List — ISSUE H2 FIX: replaced static table with searchable/filterable/sortable client component */}
      {polls.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-12 text-center">
          <ClipboardList className="w-16 h-16 mx-auto mb-4 text-brand-mid-grey" />
          <h3 className="text-lg font-medium text-brand-black mb-2">
            No polls yet
          </h3>
          <p className="text-brand-dark-grey mb-6">
            Create your first poll to start collecting feedback
          </p>
          <Link
            href="/polls/new"
            className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-brand-indigo to-brand-coral text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            Create Poll
          </Link>
        </div>
      ) : (
        <PollsListClient polls={polls} />
      )}
    </div>
  );
}
