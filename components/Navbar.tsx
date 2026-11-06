"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";

export const Navbar: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Logo size="md" />
          {user && (
            <nav className="hidden md:flex items-center space-x-1">
              <Link
                href={user.role === "HR" ? "/hr" : "/candidate"}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === "/hr" || pathname === "/candidate"
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {user.role === "HR" ? t.navHR : t.navCandidate}
              </Link>
            </nav>
          )}
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Language Switcher */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setLanguage("az")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                language === "az"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Azərbaycan dili"
            >
              AZE
            </button>
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                language === "en"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="English"
            >
              ENG
            </button>
          </div>

          {/* User state / Auth buttons */}
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="hidden sm:flex flex-col text-right">
                    <span className="text-sm font-semibold text-slate-800 leading-tight">
                      {user.fullName}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {user.role === "HR" ? t.roleHR : t.roleCandidate}
                    </span>
                  </div>
                  <button
                    onClick={() => logout()}
                    className="inline-flex items-center justify-center px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-xs"
                  >
                    {t.navLogout}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  >
                    {t.navLogin}
                  </Link>
                  <Link
                    href="/register"
                    className="px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg text-white bg-[#4F46E5] hover:bg-indigo-700 transition-colors shadow-xs"
                  >
                    {t.navRegister}
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};
