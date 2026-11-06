"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";

export default function HomePage() {
  const { t } = useLanguage();
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === "HR") {
        router.replace("/hr");
      } else {
        router.replace("/candidate");
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center space-x-3 text-slate-500">
          <svg
            className="animate-spin h-5 w-5 text-indigo-600"
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
          <span className="text-sm font-medium">{t.loading}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-between">
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 text-center flex-1 flex flex-col items-center justify-center">
        <div className="mb-6 flex justify-center">
          <Logo size="lg" linkHome={false} />
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight max-w-3xl leading-tight">
          {t.tagline}
        </h1>

        <p className="mt-5 text-lg sm:text-xl text-slate-600 max-w-2xl font-normal leading-relaxed">
          {t.subTagline}
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-white text-slate-800 font-semibold text-base border border-slate-300 hover:bg-slate-50 transition-colors shadow-sm text-center"
          >
            {t.navLogin}
          </Link>
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#4F46E5] text-white font-semibold text-base hover:bg-indigo-700 transition-colors shadow-sm text-center"
          >
            {t.navRegister}
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16 max-w-4xl text-left">
          {/* HR Card */}
          <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs transition-shadow hover:shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm mb-4">
              HR
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {t.landingHRCardTitle}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t.landingHRCardDesc}
            </p>
          </div>

          {/* Candidate Card */}
          <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs transition-shadow hover:shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm mb-4">
              AI
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {t.landingCandidateCardTitle}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t.landingCandidateCardDesc}
            </p>
          </div>
        </div>

        {/* Fairness Banner */}
        <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-xl max-w-3xl text-left">
          <div className="flex items-start gap-3">
            <span className="inline-block mt-0.5 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded">
              {t.landingFairnessBadge}
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t.landingFairnessText}
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 bg-white text-center">
        <p className="text-xs text-slate-500 font-medium">
          {t.footerNote}
        </p>
      </footer>
    </div>
  );
}
