"use client";

import { useState } from "react";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { deletePoll } from "@/lib/actions/polls";

export function DeletePollDialog({ pollId }: { pollId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    await deletePoll(pollId);
    // deletePoll redirects on success via server action redirect()
    // If we reach here, something went wrong — reset state
    setLoading(false);
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 w-full px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-xl transition-colors"
      >
        <Trash2 className="w-4 h-4" />
        Delete Poll
      </button>
    );
  }

  return (
    <div className="p-5 bg-red-50 border border-red-200 rounded-xl space-y-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-semibold text-red-700 text-sm">
            Delete this poll permanently?
          </p>
          <p className="text-red-600 text-xs mt-1">
            This will delete the poll and all votes. This action cannot be
            undone.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setOpen(false)}
          className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-60 transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Deleting…
            </>
          ) : (
            "Yes, Delete Permanently"
          )}
        </button>
      </div>
    </div>
  );
}
