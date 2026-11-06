import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { AnalysisResult } from "@/lib/types";
import { SkillBadge } from "./SkillBadge";

interface ScoreBreakdownViewProps {
  result: AnalysisResult;
}

export const ScoreBreakdownView: React.FC<ScoreBreakdownViewProps> = ({ result }) => {
  const { t } = useLanguage();
  const { breakdown } = result;

  return (
    <div className="space-y-6">
      {/* 3 Component Progress Bars */}
      <div>
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
          {t.breakdownTitle}
        </h4>
        <div className="space-y-3">
          {/* Skills */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-700">{t.skillsWeight}</span>
              <span className="text-indigo-600 font-bold">{breakdown.skillsScore}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${breakdown.skillsScore}%` }}
              />
            </div>
          </div>

          {/* Experience */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-700">{t.experienceWeight}</span>
              <span className="text-indigo-600 font-bold">{breakdown.experienceScore}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${breakdown.experienceScore}%` }}
              />
            </div>
          </div>

          {/* Education */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-700">{t.educationWeight}</span>
              <span className="text-indigo-600 font-bold">{breakdown.educationScore}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${breakdown.educationScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Extracted candidate specs */}
      <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
        <div>
          <span className="text-slate-500 block">{t.expYearsFound}:</span>
          <span className="font-semibold text-slate-800">
            {result.estimatedYearsExperience > 0
              ? `${result.estimatedYearsExperience} il / years`
              : "0 il / years"}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block">{t.eduLevelFound}:</span>
          <span className="font-semibold text-slate-800">
            {result.educationLevel}
            {result.educationMatches ? (
              <span className="ml-1 text-emerald-600 font-normal">({t.eduMatchesYes})</span>
            ) : (
              <span className="ml-1 text-amber-600 font-normal">({t.eduMatchesNo})</span>
            )}
          </span>
        </div>
      </div>

      {/* Matched & Missing Skills */}
      <div className="space-y-4">
        <div>
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
            {t.matchedSkillsTitle} ({result.matchedSkills.length})
          </span>
          {result.matchedSkills.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {result.matchedSkills.map((skill, idx) => (
                <SkillBadge key={idx} skill={skill} type="matched" />
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
              {result.missingSkills.map((skill, idx) => (
                <SkillBadge key={idx} skill={skill} type="missing" />
              ))}
            </div>
          ) : (
            <p className="text-xs text-emerald-600 font-medium">{t.noMissingSkills}</p>
          )}
        </div>
      </div>

      {/* Explanation */}
      {result.explanation && (
        <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-lg">
          <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider block mb-1">
            {t.aiExplanationTitle}
          </span>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            {result.explanation}
          </p>
        </div>
      )}
    </div>
  );
};
