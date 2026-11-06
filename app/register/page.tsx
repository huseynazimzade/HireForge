"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/lib/types";
import { Logo } from "@/components/Logo";

export default function RegisterPage() {
  const { t } = useLanguage();
  const { refreshUser } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("HR");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError(t.weakPassword);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "EMAIL_ALREADY_USED") {
          setError(t.emailAlreadyUsed);
        } else {
          setError(data.error || t.errorGeneric);
        }
        setIsSubmitting(false);
        return;
      }

      await refreshUser();

      if (role === "HR") {
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
            {t.registerTitle}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {t.registerSubtitle}
          </p>
        </div>

        <div className="bg-white py-8 px-6 sm:px-10 border border-slate-200 rounded-xl shadow-xs">
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="fullName"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                {t.fullNameLabel}
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Elmir Əliyev"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              />
            </div>

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
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••••• (min 8 simvol)"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                {t.roleLabel}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("HR")}
                  className={`py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg border text-center transition ${
                    role === "HR"
                      ? "border-indigo-600 bg-indigo-50/70 text-indigo-700"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {t.roleHR}
                </button>
                <button
                  type="button"
                  onClick={() => setRole("Candidate")}
                  className={`py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg border text-center transition ${
                    role === "Candidate"
                      ? "border-indigo-600 bg-indigo-50/70 text-indigo-700"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {t.roleCandidate}
                </button>
              </div>
            </div>

            <div className="pt-2">
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
                  t.registerButton
                )}
              </button>
            </div>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-slate-600">
          {t.hasAccount}{" "}
          <Link
            href="/login"
            className="font-semibold text-indigo-600 hover:text-indigo-500 transition"
          >
            {t.loginButton}
          </Link>
        </p>
      </div>
    </div>
  );
}
