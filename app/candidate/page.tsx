"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { TagInput } from "@/components/TagInput";
import { FileDropzone } from "@/components/FileDropzone";
import { CircularProgress } from "@/components/CircularProgress";
import { VerdictBadge } from "@/components/VerdictBadge";
import { SkillBadge } from "@/components/SkillBadge";
import { ApiKeyAlert } from "@/components/ApiKeyAlert";
import { DEMO_VACANCY } from "@/lib/constants";
import { AnalysisResult, VacancyInput } from "@/lib/types";

export default function CandidatePage() {
  const { t, language } = useLanguage();

  // Inputs
  const [files, setFiles] = useState<File[]>([]);
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [vacancyDescription, setVacancyDescription] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [minExpYears, setMinExpYears] = useState<number>(0);
  const [educationReq, setEducationReq] = useState<"Any" | "Bachelor" | "Master" | "PhD">("Any");

  // State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Load demo data
  const handleLoadDemo = () => {
    setJobTitle(DEMO_VACANCY.jobTitle);
    setRequiredSkills([...DEMO_VACANCY.requiredSkills]);
    setMinExpYears(DEMO_VACANCY.minExperienceYears);
    setEducationReq(DEMO_VACANCY.educationRequirement as any);
    setVacancyDescription(DEMO_VACANCY.description);
    setError(null);
  };

  // Submit analysis
  const handleAnalyze = async () => {
    if (files.length === 0) return;

    const hasSkills = requiredSkills.length > 0;
    const hasDesc = vacancyDescription.trim().length > 0;
    if (!hasSkills && !hasDesc) {
      setError("EMPTY_VACANCY");
      return;
    }

    setError(null);
    setIsAnalyzing(true);
    setResult(null);

    const vacancyPayload: VacancyInput = {
      jobTitle: jobTitle || undefined,
      requiredSkills,
      minExperienceYears: minExpYears,
      educationRequirement: educationReq,
      description: vacancyDescription,
    };

    try {
      const formData = new FormData();
      formData.append("cv", files[0]);
      formData.append("vacancy", JSON.stringify(vacancyPayload));
      formData.append("mode", "candidate");
      formData.append("language", language);

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "ANALYSIS_FAILED");
      }

      setResult(data);
    } catch (err: any) {
      setError(err?.message || "ANALYSIS_FAILED");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyImprovedSummary = () => {
    if (!result?.improvedSummary) return;
    navigator.clipboard.writeText(result.improvedSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t.candidateTitle}
          </h1>
          <p className="mt-1 text-sm text-slate-600">{t.candidateSubtitle}</p>
        </div>

        {/* Load Demo Data Button */}
        <button
          type="button"
          onClick={handleLoadDemo}
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: CV Upload & Target Vacancy */}
        <div className="lg:col-span-5 space-y-6">
          {/* CV Upload */}
          <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              1. {t.uploadCVTitle}
            </h2>
            <FileDropzone
              files={files}
              onFilesChange={setFiles}
              multiple={false}
              disabled={isAnalyzing}
            />
          </div>

          {/* Vacancy Info */}
          <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              2. {t.candidateVacancyHint}
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                {t.jobTitleLabel} ({t.jobDescLabel})
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="məs., Junior Data Analyst"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                {t.candidateVacancyPaste}
              </label>
              <textarea
                rows={4}
                value={vacancyDescription}
                onChange={(e) => setVacancyDescription(e.target.value)}
                placeholder={t.candidateVacancyPastePlaceholder}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              />
            </div>

            <div className="pt-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                {t.requiredSkillsLabel}
              </label>
              <TagInput
                tags={requiredSkills}
                onChange={setRequiredSkills}
                placeholder={t.requiredSkillsPlaceholder}
              />
            </div>

            {error && (
              <ApiKeyAlert errorType={error} onDismiss={() => setError(null)} />
            )}

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={
                files.length === 0 ||
                (!vacancyDescription.trim() && requiredSkills.length === 0) ||
                isAnalyzing
              }
              className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-[#4F46E5] hover:bg-indigo-700 transition shadow-xs disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isAnalyzing ? (
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
        </div>

        {/* Right Column: AI Analysis & Actionable Candidate Feedback */}
        <div className="lg:col-span-7">
          {result ? (
            <div className="space-y-6">
              {/* Match Header */}
              <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-xs">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-100">
                  <CircularProgress score={result.finalScore} label={t.overallMatch} />
                  <div className="flex flex-col items-center sm:items-end space-y-2">
                    <VerdictBadge verdict={result.verdict} size="lg" />
                    <span className="text-xs text-slate-500 font-medium">
                      {result.fileName}
                    </span>
                  </div>
                </div>

                <div className="pt-6">
                  {/* Matched & Missing Skills */}
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                        {t.matchedSkillsTitle} ({result.matchedSkills.length})
                      </span>
                      {result.matchedSkills.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {result.matchedSkills.map((s, idx) => (
                            <SkillBadge key={idx} skill={s} type="matched" />
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">{t.noMatchedSkills}</p>
                      )}
                    </div>

                    <div>
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                        {t.missingSkillsTitle} ({result.missingSkills.length})
                      </span>
                      {result.missingSkills.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {result.missingSkills.map((s, idx) => (
                            <SkillBadge key={idx} skill={s} type="missing" />
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-emerald-600 font-medium">{t.noMissingSkills}</p>
                      )}
                    </div>
                  </div>

                  {/* Explanation */}
                  {result.explanation && (
                    <div className="mt-5 p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-lg">
                      <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider block mb-1">
                        {t.aiExplanationTitle}
                      </span>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        {result.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action 1: What to fix in your CV */}
              {result.fixSuggestions && result.fixSuggestions.length > 0 && (
                <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-xs space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">
                      !
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      {t.candidateFixTitle}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500">{t.candidateFixDesc}</p>

                  <ul className="space-y-2.5 mt-3">
                    {result.fixSuggestions.map((fix, idx) => (
                      <li
                        key={idx}
                        className="flex items-start space-x-2.5 text-xs sm:text-sm text-slate-700 p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                      >
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{fix}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action 2: Skills to learn */}
              {result.skillsToLearn && result.skillsToLearn.length > 0 && (
                <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-xs space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                      ↑
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      {t.candidateLearnTitle}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500">{t.candidateLearnDesc}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    {result.skillsToLearn.map((item, idx) => {
                      const priorityColor =
                        item.priority === "High"
                          ? "bg-rose-100 text-rose-800 border-rose-200"
                          : item.priority === "Medium"
                          ? "bg-amber-100 text-amber-800 border-amber-200"
                          : "bg-slate-100 text-slate-800 border-slate-200";

                      const priorityText =
                        item.priority === "High"
                          ? t.priorityHigh
                          : item.priority === "Medium"
                          ? t.priorityMedium
                          : t.priorityLow;

                      return (
                        <div
                          key={idx}
                          className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-slate-900">
                              {item.skill}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded border ${priorityColor}`}
                            >
                              {priorityText}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 leading-normal">
                            {item.tip}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action 3: Improved CV Summary */}
              {result.improvedSummary && (
                <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {t.improvedSummaryTitle}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {t.improvedSummaryDesc}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={copyImprovedSummary}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition shadow-2xs"
                    >
                      {copied ? (
                        <>
                          <svg
                            className="w-4 h-4 mr-1 text-emerald-600"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span className="text-emerald-700 font-bold">{t.copied}</span>
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-4 h-4 mr-1 text-indigo-600"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                          <span>{t.copy}</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 leading-relaxed font-sans">
                    {result.improvedSummary}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white p-12 border border-slate-200 rounded-xl shadow-xs text-center flex flex-col items-center justify-center min-h-[350px]">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">
                {t.emptyRanking}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm">
                {t.candidateSubtitle}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
