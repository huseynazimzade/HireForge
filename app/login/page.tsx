"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";

function LoginForm() {
  const { t } = useLanguage();
  const { refreshUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "INVALID_CREDENTIALS") {
          setError(t.invalidCredentials);
        } else {
          setError(data.error || t.errorGeneric);
        }
        setIsSubmitting(false);
        return;
      }

      await refreshUser();

      const from = searchParams.get("from");
      if (from) {
        router.push(from);
      } else if (data.user?.role === "HR") {
        router.push("/hr");
      } else {
        router.push("/candidate");
      }
    } catch {
      setError(t.errorGeneric);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="lg" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            {t.loginTitle}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {t.loginSubtitle}
          </p>
        </div>

        <div className="bg-white py-8 px-6 sm:px-10 border border-slate-200 rounded-xl shadow-xs">
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                {t.emailLabel}
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                {t.passwordLabel}
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-[#4F46E5] hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                  </svg>
                  <span>{t.loading}</span>
                </div>
              ) : (
                t.loginButton
              )}
            </button>
          </form>

          {/* Demo Accounts Hint */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-xs font-medium text-slate-500 mb-2">
              {t.demoAccountsHint}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillDemo("hr@demo.com", "Demo1234")}
                className="p-2 text-left bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 border border-slate-200 rounded-lg transition"
              >
                <div className="font-semibold text-slate-700">{t.roleHR}</div>
                <div className="text-slate-500 text-[11px] truncate">hr@demo.com</div>
              </button>
              <button
                type="button"
                onClick={() => fillDemo("candidate@demo.com", "Demo1234")}
                className="p-2 text-left bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 border border-slate-200 rounded-lg transition"
              >
                <div className="font-semibold text-slate-700">{t.roleCandidate}</div>
                <div className="text-slate-500 text-[11px] truncate">candidate@demo.com</div>
              </button>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-sm text-slate-600">
          {t.noAccount}{" "}
          <Link
            href="/register"
            className="font-semibold text-indigo-600 hover:text-indigo-500 transition"
          >
            {t.registerButton}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
