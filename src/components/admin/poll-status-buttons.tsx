"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { publishPoll, closePoll } from "@/lib/actions/polls";

export function PublishPollButton({ pollId }: { pollId: string }) {
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-brand-dark-grey">
          Publish and make live?
        </span>
        <button
          onClick={async () => {
            setLoading(true);
            await publishPoll(pollId);
            setLoading(false);
          }}
          disabled={loading}
          className="px-4 py-2 bg-brand-bright-emerald text-white rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4" />
          )}
          {loading ? "Publishing..." : "Yes, Publish"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-3 py-2 text-sm text-brand-mid-grey hover:text-brand-dark-grey transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex items-center gap-2 px-5 py-2.5 bg-brand-bright-emerald text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity shadow-md"
    >
      <CheckCircle className="w-4 h-4" />
      Publish Poll
    </button>
  );
}

export function ClosePollButton({ pollId }: { pollId: string }) {
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-brand-dark-grey">
          Stop accepting votes?
        </span>
        <button
          onClick={async () => {
            setLoading(true);
            await closePoll(pollId);
            setLoading(false);
          }}
          disabled={loading}
          className="px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          {loading ? "Closing..." : "Yes, Close Poll"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-3 py-2 text-sm text-brand-mid-grey hover:text-brand-dark-grey transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex items-center gap-2 px-5 py-2.5 bg-amber-100 text-amber-700 border border-amber-200 rounded-xl font-semibold text-sm hover:bg-amber-200 transition-colors"
    >
      <XCircle className="w-4 h-4" />
      Close Poll
    </button>
  );
}
