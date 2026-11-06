import React from "react";

interface SkillBadgeProps {
  skill: string;
  type: "matched" | "missing" | "neutral";
  onRemove?: () => void;
}

export const SkillBadge: React.FC<SkillBadgeProps> = ({
  skill,
  type,
  onRemove,
}) => {
  const styles = {
    matched: "bg-emerald-50 text-emerald-800 border-emerald-200",
    missing: "bg-rose-50 text-rose-700 border-rose-200",
    neutral: "bg-indigo-50 text-indigo-700 border-indigo-200",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${styles[type]} shadow-2xs`}
    >
      {type === "matched" && (
        <svg
          className="w-3.5 h-3.5 mr-1 text-emerald-600 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
      {type === "missing" && (
        <svg
          className="w-3.5 h-3.5 mr-1 text-rose-500 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      <span className="truncate max-w-[200px]">{skill}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1.5 text-slate-400 hover:text-slate-600 focus:outline-none"
        >
          &times;
        </button>
      )}
    </span>
  );
};
