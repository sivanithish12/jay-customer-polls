"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { LoadingLink } from "@/components/ui/loading-link";
import {
  Search,
  ExternalLink,
  Eye,
  SlidersHorizontal,
  ChevronDown,
  LayoutList,
  LayoutGrid,
  ClipboardList,
  Plus,
  TrendingUp,
} from "lucide-react";
import type { Poll } from "@/types";

type SortField = "created_at" | "total_votes" | "title";
type SortDir = "asc" | "desc";
type ViewMode = "list" | "grid";

export function PollsListClient({ polls }: { polls: Poll[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "draft" | "closed"
  >("all");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [viewMode, setViewMode] = useState<ViewMode>("list");

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

  const maxVotes = Math.max(...polls.map((p) => p.total_votes || 0), 1);

  return (
    <div className="space-y-4">
      {/* ── Toolbar ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        {/* Left: Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-mid-grey" />
          <input
            type="text"
            placeholder="Search by question..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-brand-light-grey rounded-xl text-sm text-brand-black placeholder:text-brand-mid-grey focus:outline-none focus:ring-2 focus:ring-brand-coral/30 focus:border-brand-coral transition-all"
          />
        </div>

        {/* Right: Filter + Status + View */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filter button */}
          <button
            type="button"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white border border-brand-light-grey rounded-xl text-sm text-brand-dark-grey hover:border-brand-indigo/50 hover:text-brand-indigo transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filter
          </button>

          {/* Status dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as "all" | "active" | "draft" | "closed"
                )
              }
              className="appearance-none pl-3.5 pr-8 py-2.5 bg-white border border-brand-light-grey rounded-xl text-sm text-brand-dark-grey focus:outline-none focus:ring-2 focus:ring-brand-coral/30 focus:border-brand-coral transition-all cursor-pointer font-medium"
            >
              <option value="all">Status: All ({statusCounts.all})</option>
              <option value="active">Active ({statusCounts.active})</option>
              <option value="draft">Draft ({statusCounts.draft})</option>
              <option value="closed">Closed ({statusCounts.closed})</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-mid-grey pointer-events-none" />
          </div>

          {/* View toggle */}
          <div className="flex items-center bg-white border border-brand-light-grey rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`p-2.5 transition-colors ${
                viewMode === "list"
                  ? "bg-brand-light-mauve text-brand-indigo"
                  : "text-brand-mid-grey hover:text-brand-dark-grey"
              }`}
              aria-label="List view"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-2.5 transition-colors ${
                viewMode === "grid"
                  ? "bg-brand-light-mauve text-brand-indigo"
                  : "text-brand-mid-grey hover:text-brand-dark-grey"
              }`}
              aria-label="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Results count */}
      {(search || statusFilter !== "all") && (
        <p className="text-sm text-brand-mid-grey">
          {filtered.length} poll{filtered.length !== 1 ? "s" : ""} found
          {(search || statusFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
              }}
              className="ml-2 text-brand-coral hover:underline"
            >
              Clear filters
            </button>
          )}
        </p>
      )}

      {/* ── Empty state ─────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-md">
          <div className="w-14 h-14 bg-brand-light-mauve rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-7 h-7 text-brand-indigo" />
          </div>
          <p className="font-semibold text-brand-black mb-1">No polls match your filters</p>
          <p className="text-sm text-brand-mid-grey mb-5">
            Try adjusting your search or status filter.
          </p>
          <button
            type="button"
            onClick={() => { setSearch(""); setStatusFilter("all"); }}
            className="text-sm text-brand-coral font-medium hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : viewMode === "grid" ? (
        /* ── Grid View ───────────────────────────────────────── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((poll) => (
            <div
              key={poll.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all overflow-hidden group"
            >
              {/* Card top accent */}
              <div
                className={`h-1 ${
                  poll.status === "active"
                    ? "bg-gradient-to-r from-brand-indigo to-brand-coral"
                    : poll.status === "draft"
                    ? "bg-brand-light-yellow"
                    : "bg-brand-light-grey"
                }`}
              />
              <div className="p-5">
                {/* Status + votes */}
                <div className="flex items-center justify-between mb-3">
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
                      className={`w-1.5 h-1.5 rounded-full ${
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
                  <span className="text-xs text-brand-mid-grey font-medium">
                    {poll.total_votes || 0} votes
                  </span>
                </div>

                {/* Title */}
                <LoadingLink
                  href={`/polls/${poll.id}`}
                  className="block text-left"
                >
                  <h3 className="font-semibold text-brand-black text-sm line-clamp-2 hover:text-brand-coral transition-colors leading-snug mb-2 group-hover:text-brand-coral">
                    {poll.title}
                  </h3>
                </LoadingLink>

                {/* Vote bar */}
                <div className="h-1 bg-brand-light-mauve rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full ${
                      poll.status === "active"
                        ? "bg-gradient-to-r from-brand-indigo to-brand-coral"
                        : "bg-brand-mid-grey/40"
                    }`}
                    style={{
                      width: `${Math.round(((poll.total_votes || 0) / maxVotes) * 100)}%`,
                    }}
                  />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-brand-mid-grey">
                    {new Date(poll.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <div className="flex items-center gap-1">
                    {poll.status === "active" && (
                      <a
                        href={`/p/${poll.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="View public poll"
                        className="p-1.5 text-brand-mid-grey hover:text-brand-coral hover:bg-brand-light-orange rounded-lg transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <LoadingLink
                      href={`/polls/${poll.id}/results`}
                      aria-label="View results"
                      className="p-1.5 text-brand-mid-grey hover:text-brand-indigo hover:bg-brand-light-mauve rounded-lg transition-colors"
                      loaderClassName="w-3.5 h-3.5 text-brand-indigo"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </LoadingLink>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ── List / Table View ───────────────────────────────── */
        <div className="bg-white rounded-2xl overflow-hidden shadow-md">
          <table className="w-full">
            <thead className="bg-brand-alabaster">
              <tr>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-brand-mid-grey uppercase tracking-wider">
                  <button
                    type="button"
                    onClick={() => toggleSort("title")}
                    className="flex items-center gap-1 hover:text-brand-dark-grey transition-colors"
                  >
                    Poll Question
                    {sortField === "title" && (
                      <span className="text-brand-coral">
                        {sortDir === "asc" ? " ↑" : " ↓"}
                      </span>
                    )}
                  </button>
                </th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-brand-mid-grey uppercase tracking-wider hidden lg:table-cell">
                  <button
                    type="button"
                    onClick={() => toggleSort("total_votes")}
                    className="flex items-center gap-1 hover:text-brand-dark-grey transition-colors"
                  >
                    Votes
                    {sortField === "total_votes" && (
                      <span className="text-brand-coral">
                        {sortDir === "asc" ? " ↑" : " ↓"}
                      </span>
                    )}
                  </button>
                </th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-brand-mid-grey uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-brand-mid-grey uppercase tracking-wider hidden md:table-cell">
                  <button
                    type="button"
                    onClick={() => toggleSort("created_at")}
                    className="flex items-center gap-1 hover:text-brand-dark-grey transition-colors"
                  >
                    Created
                    {sortField === "created_at" && (
                      <span className="text-brand-coral">
                        {sortDir === "asc" ? " ↑" : " ↓"}
                      </span>
                    )}
                  </button>
                </th>
                <th className="text-right px-6 py-3.5 text-xs font-semibold text-brand-mid-grey uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((poll) => {
                const votes = poll.total_votes || 0;
                const pct = Math.round((votes / maxVotes) * 100);

                return (
                  <tr
                    key={poll.id}
                    className="hover:bg-brand-alabaster/50 transition-colors group"
                  >
                    {/* Poll Question */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {/* Status icon */}
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            poll.status === "active"
                              ? "bg-brand-light-emerald"
                              : poll.status === "draft"
                              ? "bg-brand-light-yellow"
                              : "bg-brand-light-grey"
                          }`}
                        >
                          {poll.status === "active" ? (
                            <TrendingUp className="w-4 h-4 text-brand-bright-emerald" />
                          ) : poll.status === "draft" ? (
                            <ClipboardList className="w-4 h-4 text-brand-brown" />
                          ) : (
                            <ClipboardList className="w-4 h-4 text-brand-mid-grey" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <LoadingLink
                            href={`/polls/${poll.id}`}
                            className="font-semibold text-brand-black hover:text-brand-coral transition-colors text-sm line-clamp-1 group-hover:text-brand-coral text-left"
                            loaderClassName="w-4 h-4 text-brand-coral"
                          >
                            {poll.title}
                          </LoadingLink>
                          <p className="text-xs text-brand-mid-grey mt-0.5 line-clamp-1">
                            Created{" "}
                            {new Date(poll.created_at).toLocaleDateString(
                              "en-GB",
                              { day: "numeric", month: "short", year: "numeric" }
                            )}{" "}
                            ·{" "}
                            {poll.question
                              ? poll.question.slice(0, 40) +
                                (poll.question.length > 40 ? "…" : "")
                              : "No description"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Votes + mini bar */}
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <div className="space-y-1.5">
                        <span className="text-sm font-semibold text-brand-black">
                          {votes.toLocaleString()}
                        </span>
                        <div className="w-20 h-1 bg-brand-light-mauve rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              poll.status === "active"
                                ? "bg-gradient-to-r from-brand-indigo to-brand-coral"
                                : "bg-brand-mid-grey/50"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
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
                    </td>

                    {/* Created */}
                    <td className="px-4 py-4 text-sm text-brand-mid-grey hidden md:table-cell">
                      {new Date(poll.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1.5">
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
                        <LoadingLink
                          href={`/polls/${poll.id}/results`}
                          aria-label="View results"
                          className="p-2 text-brand-mid-grey hover:text-brand-indigo hover:bg-brand-light-mauve rounded-lg transition-colors"
                          loaderClassName="w-4 h-4 text-brand-indigo"
                        >
                          <Eye className="w-4 h-4" />
                        </LoadingLink>
                        <LoadingLink
                          href={`/polls/${poll.id}`}
                          aria-label="Manage poll"
                          className="p-2 text-brand-mid-grey hover:text-brand-coral hover:bg-brand-light-orange rounded-lg transition-colors"
                          loaderClassName="w-4 h-4 text-brand-coral"
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
                        </LoadingLink>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Bottom footer */}
          {filtered.length > 0 && (
            <div className="py-4 px-6 flex items-center justify-between">
              <p className="text-xs text-brand-mid-grey">
                Showing {filtered.length} of {polls.length} poll
                {polls.length !== 1 ? "s" : ""}
              </p>
              {filtered.length < polls.length && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                  }}
                  className="text-xs text-brand-coral hover:underline font-medium"
                >
                  Show all
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
