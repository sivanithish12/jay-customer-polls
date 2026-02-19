import { getPolls } from "@/lib/actions/polls";
import Link from "next/link";
import {
  ClipboardList,
  Plus,
  ExternalLink,
  Eye,
  Pencil,
} from "lucide-react";

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

      {/* Polls Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-brand-light-grey/50 overflow-hidden">
        {polls.length === 0 ? (
          <div className="p-12 text-center">
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
          <table className="w-full">
            <thead className="bg-brand-alabaster border-b border-brand-light-grey/50">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-brand-mid-grey">
                  Poll
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-brand-mid-grey">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-brand-mid-grey">
                  Votes
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-brand-mid-grey">
                  Created
                </th>
                <th className="text-right px-6 py-4 text-sm font-medium text-brand-mid-grey">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-light-grey/50">
              {polls.map((poll) => (
                <tr key={poll.id} className="hover:bg-brand-alabaster transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <Link
                        href={`/polls/${poll.id}`}
                        className="font-medium text-brand-black hover:text-brand-coral transition-colors"
                      >
                        {poll.title}
                      </Link>
                      <p className="text-sm text-brand-mid-grey truncate max-w-xs">
                        {poll.question}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
                        poll.status === "active"
                          ? "bg-brand-light-emerald text-brand-bright-emerald"
                          : poll.status === "draft"
                          ? "bg-brand-light-mauve text-brand-dark-grey"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {poll.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-brand-black">
                      {poll.total_votes}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-brand-mid-grey">
                    {new Date(poll.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {poll.status === "active" && (
                        <a
                          href={`/p/${poll.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-brand-mid-grey hover:text-brand-coral hover:bg-brand-light-orange rounded-lg transition-colors"
                          title="View public poll"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <Link
                        href={`/polls/${poll.id}/results`}
                        className="p-2 text-brand-mid-grey hover:text-brand-coral hover:bg-brand-light-orange rounded-lg transition-colors"
                        title="View results"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/polls/${poll.id}`}
                        className="p-2 text-brand-mid-grey hover:text-brand-coral hover:bg-brand-light-orange rounded-lg transition-colors"
                        title="Edit poll"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
