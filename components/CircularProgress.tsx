import React from "react";

interface CircularProgressProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  score,
  size = 140,
  strokeWidth = 10,
  label,
}) => {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  // Color according to score
  const strokeColor =
    clampedScore >= 75
      ? "#10B981" // emerald-500
      : clampedScore >= 50
      ? "#F59E0B" // amber-500
      : "#F43F5E"; // rose-500

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          className="transform -rotate-90"
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold text-slate-800 tracking-tight">
            {clampedScore}%
          </span>
        </div>
      </div>
      {label && (
        <span className="mt-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {label}
        </span>
      )}
    </div>
  );
};
