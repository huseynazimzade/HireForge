import React from "react";
import { useLanguage } from "@/context/LanguageContext";

interface VerdictBadgeProps {
  verdict: "Strong" | "Medium" | "Weak";
  size?: "sm" | "md" | "lg";
}

export const VerdictBadge: React.FC<VerdictBadgeProps> = ({
  verdict,
  size = "md",
}) => {
  const { t } = useLanguage();

  const labels: Record<string, string> = {
    Strong: t.verdictStrong,
    Medium: t.verdictMedium,
    Weak: t.verdictWeak,
  };

  const styleClasses = {
    Strong: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Medium: "bg-amber-50 text-amber-700 border-amber-200",
    Weak: "bg-rose-50 text-rose-700 border-rose-200",
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm font-semibold",
    lg: "px-4 py-1.5 text-base font-bold",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${styleClasses[verdict]} ${sizeClasses[size]}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          verdict === "Strong"
            ? "bg-emerald-500"
            : verdict === "Medium"
            ? "bg-amber-500"
            : "bg-rose-500"
        }`}
      />
      {labels[verdict]}
    </span>
  );
};
