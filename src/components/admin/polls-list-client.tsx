"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ExternalLink, Eye, Filter } from "lucide-react";
import type { Poll } from "@/types";

type SortField = "created_at" | "total_votes" | "title";
type SortDir = "asc" | "desc";

export function PollsListClient({ polls }: { polls: Poll[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "draft" | "closed"
  >("all");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const filtered = useMemo(() => {
    return polls
      .filter((p) => {
        const matchesSearch =
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.question?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus =
          statusFilter === "all" || p.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        let aVal: string | number = a[sortField] ?? "";
        let bVal: string | number = b[sortField] ?? "";
        if (sortField === "total_votes") {
          aVal = Number(aVal);
          bVal = Number(bVal);
        }
        if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
  }, [polls, search, statusFilter, sortField, sortDir]);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  }

  const statusCounts = {
    all: polls.length,
    active: polls.filter((p) => p.status === "active").length,
    draft: polls.filter((p) => p.status === "draft").length,
    closed: polls.filter((p) => p.status === "closed").length,
  };

  return (
    <div className="space-y-4">
      {/* Search + Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-mid-grey" />
          <input
            type="text"
            placeholder="Search polls..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-brand-light-grey rounded-xl text-sm text-brand-black placeholder:text-brand-mid-grey focus:outline-none focus:ring-2 focus:ring-brand-coral/30 focus:border-brand-coral transition-all"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-brand-mid-grey flex-shrink-0" />
          {(["all", "active", "draft", "closed"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                statusFilter === s
                  ? "bg-brand-light-orange text-brand-coral border border-brand-coral/20"
                  : "bg-white border border-brand-light-grey text-brand-dark-grey hover:border-brand-coral/30"
              }`}
            >
              {s} ({statusCounts[s]})
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {(search || statusFilter !== "all") && (
        <p className="text-sm text-brand-mid-grey">
          {filtered.length} poll{filtered.length !== 1 ? "s" : ""} found
        </p>
      )}

      {/* Empty filtered state */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-brand-light-grey">
          <p className="text-brand-mid-grey text-lg font-medium">
            No polls match your search
          </p>
          <button
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
            }}
            className="mt-3 text-brand-coral text-sm hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-brand-light-grey/50 overflow-hidden">
          <table className="w-full">
            <thead className="bg-brand-alabaster border-b border-brand-light-grey/50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-brand-mid-grey uppercase tracking-wider">
                  <button
                    onClick={() => toggleSort("title")}
                    className="flex items-center gap-1 hover:text-brand-dark-grey transition-colors"
                  >
                    Title{" "}
                    {sortField === "title"
                      ? sortDir === "asc"
                        ? "↑"
                        : "↓"
                      : ""}
                  </button>
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-brand-mid-grey uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-brand-mid-grey uppercase tracking-wider">
                  <button
                    onClick={() => toggleSort("total_votes")}
                    className="flex items-center gap-1 hover:text-brand-dark-grey transition-colors"
                  >
                    Votes{" "}
                    {sortField === "total_votes"
                      ? sortDir === "asc"
                        ? "↑"
                        : "↓"
                      : ""}
                  </button>
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-brand-mid-grey uppercase tracking-wider">
                  <button
                    onClick={() => toggleSort("created_at")}
                    className="flex items-center gap-1 hover:text-brand-dark-grey transition-colors"
                  >
                    Created{" "}
                    {sortField === "created_at"
                      ? sortDir === "asc"
                        ? "↑"
                        : "↓"
                      : ""}
                  </button>
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-brand-mid-grey uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-light-grey/50">
              {filtered.map((poll) => (
                <tr
                  key={poll.id}
                  className="hover:bg-brand-alabaster/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/polls/${poll.id}`}
                      className="font-medium text-brand-black hover:text-brand-coral transition-colors line-clamp-1"
                    >
                      {poll.title}
                    </Link>
                    <p className="text-xs text-brand-mid-grey mt-0.5 line-clamp-1">
                      {poll.question}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        poll.status === "active"
                          ? "bg-brand-light-emerald text-brand-bright-emerald"
                          : poll.status === "draft"
                          ? "bg-brand-light-mauve text-brand-indigo"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {poll.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-brand-dark-grey font-medium">
                    {poll.total_votes ?? 0}
                  </td>
                  <td className="px-4 py-4 text-sm text-brand-mid-grey">
                    {new Date(poll.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {poll.status === "active" && (
                        <a
                          href={`/p/${poll.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="View public poll"
                          className="p-2 text-brand-mid-grey hover:text-brand-coral hover:bg-brand-light-orange rounded-lg transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <Link
                        href={`/polls/${poll.id}/results`}
                        aria-label="View results"
                        className="p-2 text-brand-mid-grey hover:text-brand-indigo hover:bg-brand-light-mauve rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/polls/${poll.id}`}
                        aria-label="Manage poll"
                        className="p-2 text-brand-mid-grey hover:text-brand-coral hover:bg-brand-light-orange rounded-lg transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                          <path d="m15 5 4 4" />
                        </svg>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
