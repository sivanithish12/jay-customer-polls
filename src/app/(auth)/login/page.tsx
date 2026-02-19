"use client";

import { useState } from "react";
import { login } from "@/lib/actions/auth";
import { Loader2, Lock, Vote } from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);

    const result = await login(formData);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md p-6">
      {/* Glass Card */}
      <div className="glass rounded-3xl shadow-xl p-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-coral rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <Vote className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-secondary-800">JAY Polls</h1>
            <p className="text-secondary-500 mt-1">Internal Poll Management</p>
          </div>
        </div>

        {/* Internal Access Notice */}
        <div className="flex items-center gap-3 px-4 py-3 bg-secondary-50 rounded-xl border border-secondary-100">
          <Lock className="w-5 h-5 text-secondary-400 flex-shrink-0" />
          <p className="text-sm text-secondary-600">
            Authorized personnel only. Contact IT for access.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form action={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-secondary-700"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full px-4 py-3.5 bg-white border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-secondary-800 placeholder:text-secondary-400"
              placeholder="you@justmovein.com"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-secondary-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full px-4 py-3.5 bg-white border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-secondary-800 placeholder:text-secondary-400"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 px-4 bg-gradient-coral text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-secondary-400">
          JustMoveIn Internal Tool
        </p>
      </div>
    </div>
  );
}
