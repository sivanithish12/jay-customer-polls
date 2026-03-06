"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Loader2, Radio, AlertTriangle } from "lucide-react";
import { publishPoll, closePoll } from "@/lib/actions/polls";

export function PublishPollButton({ pollId }: { pollId: string }) {
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    await publishPoll(pollId);
    setLoading(false);
  }

  if (confirming) {
    return (
      <div className="rounded-xl bg-brand-light-emerald p-4 space-y-3">
        <div className="flex items-start gap-2">
          <Radio className="w-4 h-4 text-brand-bright-emerald mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-brand-black">Go live with this poll?</p>
            <p className="text-xs text-brand-dark-grey mt-0.5">
              This will make the poll publicly accessible.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2 bg-brand-bright-emerald text-white rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-opacity"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Publishing…
              </>
            ) : (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                Yes, Publish
              </>
            )}
          </button>
          <button
            onClick={() => setConfirming(false)}
            disabled={loading}
            className="px-3 py-2 text-sm text-brand-mid-grey hover:text-brand-dark-grey transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-bright-emerald text-white rounded-xl font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-md"
    >
      <CheckCircle className="w-4 h-4" />
      Publish Poll
    </button>
  );
}

export function ClosePollButton({ pollId }: { pollId: string }) {
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    await closePoll(pollId);
    setLoading(false);
  }

  if (confirming) {
    return (
      <div className="rounded-xl bg-amber-50 p-4 space-y-3">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-brand-black">Stop accepting votes?</p>
            <p className="text-xs text-brand-dark-grey mt-0.5">
              Responses will be locked — you can view results anytime.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2 bg-amber-500 text-white rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-opacity"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Closing…
              </>
            ) : (
              <>
                <XCircle className="w-3.5 h-3.5" />
                Yes, Close Poll
              </>
            )}
          </button>
          <button
            onClick={() => setConfirming(false)}
            disabled={loading}
            className="px-3 py-2 text-sm text-brand-mid-grey hover:text-brand-dark-grey transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-100 text-amber-700 rounded-xl font-semibold text-sm hover:bg-amber-200 active:scale-[0.98] transition-all"
    >
      <XCircle className="w-4 h-4" />
      Close Poll
    </button>
  );
}
