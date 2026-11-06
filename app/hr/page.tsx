"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { TagInput } from "@/components/TagInput";
import { FileDropzone } from "@/components/FileDropzone";
import { CircularProgress } from "@/components/CircularProgress";
import { VerdictBadge } from "@/components/VerdictBadge";
import { ScoreBreakdownView } from "@/components/ScoreBreakdownView";
import { SkillBadge } from "@/components/SkillBadge";
import { ApiKeyAlert } from "@/components/ApiKeyAlert";
import { DEMO_VACANCY } from "@/lib/constants";
import { AnalysisResult, VacancyInput } from "@/lib/types";

export default function HRPage() {
  const { t, language } = useLanguage();

  // Tab State: "single" | "multi"
  const [activeTab, setActiveTab] = useState<"single" | "multi">("single");

  // Vacancy Form State
  const [jobTitle, setJobTitle] = useState("");
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [minExpYears, setMinExpYears] = useState<number>(0);
  const [educationReq, setEducationReq] = useState<"Any" | "Bachelor" | "Master" | "PhD">("Any");
  const [description, setDescription] = useState("");
  const [openPositions, setOpenPositions] = useState<number>(1);

  // Single CV State
  const [singleFiles, setSingleFiles] = useState<File[]>([]);
  const [singleResult, setSingleResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzingSingle, setIsAnalyzingSingle] = useState(false);
  const [singleError, setSingleError] = useState<string | null>(null);

  // Multi CV State
  const [multiFiles, setMultiFiles] = useState<File[]>([]);
  const [multiResults, setMultiResults] = useState<AnalysisResult[]>([]);
  const [isAnalyzingMulti, setIsAnalyzingMulti] = useState(false);
  const [multiProgress, setMultiProgress] = useState<{ current: number; total: number } | null>(null);
  const [multiError, setMultiError] = useState<string | null>(null);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  // Load Demo Data
  const loadDemo = () => {
    setJobTitle(DEMO_VACANCY.jobTitle);
    setRequiredSkills([...DEMO_VACANCY.requiredSkills]);
    setMinExpYears(DEMO_VACANCY.minExperienceYears);
    setEducationReq(DEMO_VACANCY.educationRequirement as any);
    setDescription(DEMO_VACANCY.description);
    setSingleError(null);
    setMultiError(null);
  };

  const getVacancyPayload = (): VacancyInput => ({
    jobTitle,
    requiredSkills,
    minExperienceYears: minExpYears,
    educationRequirement: educationReq,
    description,
  });

  // Call API for single file with automatic retry on 429
  const analyzeFileWithRetry = async (file: File): Promise<AnalysisResult> => {
    const vacancyPayload = getVacancyPayload();
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      attempts++;
      try {
        const formData = new FormData();
        formData.append("cv", file);
        formData.append("vacancy", JSON.stringify(vacancyPayload));
        formData.append("mode", "hr");
        formData.append("language", language);

        const res = await fetch("/api/analyze", {
          method: "POST",
          body: formData,
        });

        if (res.status === 429) {
          if (attempts < maxAttempts) {
            await new Promise((r) => setTimeout(r, 2000 * attempts));
            continue;
          }
          throw new Error("GROQ_429_RATE_LIMIT");
        }

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || data.error || "ANALYSIS_FAILED");
        }

        return data;
      } catch (err: any) {
        if (attempts >= maxAttempts || err?.message !== "GROQ_429_RATE_LIMIT") {
          return {
            fileName: file.name,
            finalScore: 0,
            verdict: "Weak",
            breakdown: {
              finalScore: 0,
              skillsScore: 0,
              experienceScore: 0,
              educationScore: 0,
            },
            cvSkills: [],
            matchedSkills: [],
            missingSkills: requiredSkills,
            estimatedYearsExperience: 0,
            educationLevel: "None",
            educationMatches: false,
            explanation: "",
            error: err?.message || "ANALYSIS_FAILED",
          };
        }
      }
    }

    throw new Error("Failed after retries");
  };

  // Submit Single CV Analysis
  const handleAnalyzeSingle = async () => {
    if (singleFiles.length === 0) return;
    if (requiredSkills.length === 0 && !description.trim()) {
      setSingleError("EMPTY_VACANCY");
      return;
    }

    setSingleError(null);
    setIsAnalyzingSingle(true);
    setSingleResult(null);

    try {
      const result = await analyzeFileWithRetry(singleFiles[0]);
      if (result.error) {
        setSingleError(result.error);
      } else {
        setSingleResult(result);
      }
    } catch (err: any) {
      setSingleError(err?.message || "ANALYSIS_FAILED");
    } finally {
      setIsAnalyzingSingle(false);
    }
  };

  // Submit Multi CV Analysis with limited concurrency (2-3)
  const handleAnalyzeMulti = async () => {
    if (multiFiles.length === 0) return;
    if (requiredSkills.length === 0 && !description.trim()) {
      setMultiError("EMPTY_VACANCY");
      return;
    }

    setMultiError(null);
    setIsAnalyzingMulti(true);
    setMultiResults([]);
    setExpandedRow(null);

    const total = multiFiles.length;
    setMultiProgress({ current: 0, total });

    const results: AnalysisResult[] = [];
    const concurrency = 2; // Process 2 at a time for stable rate limit handling
    let completed = 0;
    let nextIndex = 0;

    const worker = async () => {
      while (nextIndex < multiFiles.length) {
        const fileIndex = nextIndex++;
        const file = multiFiles[fileIndex];
        const res = await analyzeFileWithRetry(file);
        results.push(res);
        completed++;
        setMultiProgress({ current: completed, total });
      }
    };

    const workers = Array.from(
      { length: Math.min(concurrency, multiFiles.length) },
      () => worker()
    );

    await Promise.all(workers);

    // Sort by match % descending
    results.sort((a, b) => b.finalScore - a.finalScore);
    setMultiResults(results);
    setIsAnalyzingMulti(false);
    setMultiProgress(null);
  };

  // Export CSV
  const exportToCSV = () => {
    if (multiResults.length === 0) return;

    const headers = [
      "Rank",
      "File Name",
      "Match %",
      "Skills Score %",
      "Experience Score %",
      "Education Score %",
      "Matched Skills",
      "Missing Skills",
      "Reason",
      "Status",
    ];

    const rows = multiResults.map((r, idx) => {
      const rank = idx + 1;
      const fileName = `"${r.fileName.replace(/"/g, '""')}"`;
      const match = r.finalScore;
      const skills = r.breakdown.skillsScore;
      const exp = r.breakdown.experienceScore;
      const edu = r.breakdown.educationScore;
      const matched = `"${r.matchedSkills.join(", ").replace(/"/g, '""')}"`;
      const missing = `"${r.missingSkills.join(", ").replace(/"/g, '""')}"`;
      const reason = `"${(r.explanation || "").replace(/"/g, '""')}"`;
      const status = r.error ? `Error: ${r.error}` : "Success";

      return [rank, fileName, match, skills, exp, edu, matched, missing, reason, status].join(
        ","
      );
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `HireForge_Ranking_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shortlistCount = Math.max(5, openPositions);
  const recommendedCandidates = multiResults.slice(0, shortlistCount);
  const reviewCandidates = multiResults.slice(shortlistCount);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t.hrTitle}
          </h1>
          <p className="mt-1 text-sm text-slate-600">{t.hrSubtitle}</p>
        </div>

        {/* Demo Data Button */}
        <button
          type="button"
          onClick={loadDemo}
          className="inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition shadow-2xs"
        >
          <svg
            className="w-4 h-4 mr-1.5 text-indigo-600"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          {t.loadDemoData}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("single")}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition ${
            activeTab === "single"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          {t.tabSingle}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("multi")}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition ${
            activeTab === "multi"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          {t.tabMulti}
        </button>
      </div>

      {/* Vacancy Form & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Vacancy Requirements */}
        <div className="lg:col-span-5 bg-white p-6 border border-slate-200 rounded-xl shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            {t.vacancyFormTitle}
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              {t.jobTitleLabel}
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder={t.jobTitlePlaceholder}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              {t.requiredSkillsLabel}
            </label>
            <TagInput
              tags={requiredSkills}
              onChange={setRequiredSkills}
              placeholder={t.requiredSkillsPlaceholder}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                {t.minExpLabel}
              </label>
              <input
                type="number"
                min={0}
                max={40}
                value={minExpYears}
                onChange={(e) => setMinExpYears(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                {t.educationLabel}
              </label>
              <select
                value={educationReq}
                onChange={(e) => setEducationReq(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              >
                <option value="Any">{t.eduAny}</option>
                <option value="Bachelor">{t.eduBachelor}</option>
                <option value="Master">{t.eduMaster}</option>
                <option value="PhD">{t.eduPhD}</option>
              </select>
            </div>
          </div>

          {activeTab === "multi" && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                {t.openPositionsLabel}
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={openPositions}
                onChange={(e) => setOpenPositions(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              {t.jobDescLabel}
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.jobDescPlaceholder}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            />
          </div>
        </div>

        {/* Right Column: Upload & Results */}
        <div className="lg:col-span-7 space-y-6">
          {activeTab === "single" ? (
            /* TAB 1: SINGLE CV */
            <div className="space-y-6">
              <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-xs space-y-4">
                <FileDropzone
                  files={singleFiles}
                  onFilesChange={setSingleFiles}
                  multiple={false}
                  disabled={isAnalyzingSingle}
                />

                {singleError && (
                  <ApiKeyAlert
                    errorType={singleError}
                    onDismiss={() => setSingleError(null)}
                  />
                )}

                <button
                  type="button"
                  onClick={handleAnalyzeSingle}
                  disabled={singleFiles.length === 0 || isAnalyzingSingle}
                  className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-[#4F46E5] hover:bg-indigo-700 transition shadow-xs disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isAnalyzingSingle ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
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
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        />
                      </svg>
                      <span>{t.analyzing}</span>
                    </>
                  ) : (
                    <span>{t.analyzeButton}</span>
                  )}
                </button>
              </div>

              {/* Single Result Display */}
              {singleResult && (
                <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-xs space-y-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-100">
                    <CircularProgress score={singleResult.finalScore} label={t.overallMatch} />
                    <div className="flex flex-col items-center sm:items-end space-y-2">
                      <VerdictBadge verdict={singleResult.verdict} size="lg" />
                      <span className="text-xs text-slate-500 font-medium">
                        {singleResult.fileName}
                      </span>
                    </div>
                  </div>

                  <ScoreBreakdownView result={singleResult} />
                </div>
              )}
            </div>
          ) : (
            /* TAB 2: MULTI CV RANKING */
            <div className="space-y-6">
              <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-xs space-y-4">
                <FileDropzone
                  files={multiFiles}
                  onFilesChange={setMultiFiles}
                  multiple={true}
                  maxFiles={15}
                  disabled={isAnalyzingMulti}
                />

                {multiError && (
                  <ApiKeyAlert
                    errorType={multiError}
                    onDismiss={() => setMultiError(null)}
                  />
                )}

                <button
                  type="button"
                  onClick={handleAnalyzeMulti}
                  disabled={multiFiles.length === 0 || isAnalyzingMulti}
                  className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-[#4F46E5] hover:bg-indigo-700 transition shadow-xs disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isAnalyzingMulti ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
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
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        />
                      </svg>
                      <span>
                        {multiProgress
                          ? t.analyzingProgress
                              .replace("{current}", String(multiProgress.current))
                              .replace("{total}", String(multiProgress.total))
                          : t.analyzing}
                      </span>
                    </>
                  ) : (
                    <span>{t.analyzeMultipleButton} ({multiFiles.length})</span>
                  )}
                </button>
              </div>

              {/* Multi Results Display */}
              {multiResults.length > 0 && (
                <div className="space-y-6">
                  {/* Export Header */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900">
                      {t.rankingTitle} ({multiResults.length})
                    </h3>
                    <button
                      type="button"
                      onClick={exportToCSV}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition shadow-2xs"
                    >
                      <svg
                        className="w-4 h-4 mr-1 text-slate-600"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      {t.exportCSV}
                    </button>
                  </div>

                  {/* Section 1: Recommended Candidates (Shortlist size = max(5, N)) */}
                  <div className="bg-white border border-emerald-200 rounded-xl overflow-hidden shadow-xs">
                    <div className="bg-emerald-50/70 px-4 py-3 border-b border-emerald-100 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-600 text-white">
                          {t.recommendedBadge}
                        </span>
                        <h4 className="text-sm font-bold text-emerald-950">
                          {t.recommendedSection} (Top {shortlistCount})
                        </h4>
                      </div>
                      <span className="text-xs text-emerald-800 font-medium">
                        {recommendedCandidates.length} namizəd
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {recommendedCandidates.map((res, idx) => (
                        <div key={idx} className="p-4 transition hover:bg-slate-50/50">
                          <div
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => setExpandedRow(expandedRow === idx ? null : idx)}
                          >
                            <div className="flex items-center space-x-3 min-w-0 pr-3">
                              <span className="w-6 text-center text-xs font-bold text-slate-500">
                                #{idx + 1}
                              </span>
                              <div className="truncate">
                                <p className="text-sm font-semibold text-slate-900 truncate">
                                  {res.fileName}
                                </p>
                                <p className="text-xs text-slate-500 truncate mt-0.5">
                                  {res.error ? (
                                    <span className="text-rose-600">Xəta: {res.error}</span>
                                  ) : (
                                    res.explanation || "Analiz tamamlandı"
                                  )}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3 flex-shrink-0">
                              <div className="text-right">
                                <span className="text-base font-extrabold text-slate-800">
                                  {res.finalScore}%
                                </span>
                              </div>
                              <VerdictBadge verdict={res.verdict} size="sm" />
                              <button
                                type="button"
                                className="text-slate-400 hover:text-slate-600 p-1"
                              >
                                <svg
                                  className={`w-4 h-4 transform transition-transform ${
                                    expandedRow === idx ? "rotate-180" : ""
                                  }`}
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>

                          {/* Expanded Details */}
                          {expandedRow === idx && (
                            <div className="mt-4 pt-4 border-t border-slate-100">
                              <ScoreBreakdownView result={res} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section 2: For HR Review (Remaining Candidates) */}
                  {reviewCandidates.length > 0 && (
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                        <h4 className="text-sm font-bold text-slate-800">
                          {t.reviewSection} ({reviewCandidates.length})
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {t.reviewNotice}
                        </p>
                      </div>

                      <div className="divide-y divide-slate-100">
                        {reviewCandidates.map((res, i) => {
                          const idx = shortlistCount + i;
                          return (
                            <div key={idx} className="p-4 transition hover:bg-slate-50/50">
                              <div
                                className="flex items-center justify-between cursor-pointer"
                                onClick={() => setExpandedRow(expandedRow === idx ? null : idx)}
                              >
                                <div className="flex items-center space-x-3 min-w-0 pr-3">
                                  <span className="w-6 text-center text-xs font-bold text-slate-400">
                                    #{idx + 1}
                                  </span>
                                  <div className="truncate">
                                    <p className="text-sm font-semibold text-slate-900 truncate">
                                      {res.fileName}
                                    </p>
                                    <p className="text-xs text-slate-500 truncate mt-0.5">
                                      {res.error ? (
                                        <span className="text-rose-600">Xəta: {res.error}</span>
                                      ) : (
                                        res.explanation || "Analiz tamamlandı"
                                      )}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-3 flex-shrink-0">
                                  <div className="text-right">
                                    <span className="text-base font-extrabold text-slate-800">
                                      {res.finalScore}%
                                    </span>
                                  </div>
                                  <VerdictBadge verdict={res.verdict} size="sm" />
                                  <button
                                    type="button"
                                    className="text-slate-400 hover:text-slate-600 p-1"
                                  >
                                    <svg
                                      className={`w-4 h-4 transform transition-transform ${
                                        expandedRow === idx ? "rotate-180" : ""
                                      }`}
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M19 9l-7 7-7-7"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              </div>

                              {/* Expanded Details */}
                              {expandedRow === idx && (
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                  <ScoreBreakdownView result={res} />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
