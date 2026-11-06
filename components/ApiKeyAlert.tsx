import React from "react";
import { useLanguage } from "@/context/LanguageContext";

interface ApiKeyAlertProps {
  errorType?: string;
  errorMessage?: string;
  onDismiss?: () => void;
}

export const ApiKeyAlert: React.FC<ApiKeyAlertProps> = ({
  errorType,
  errorMessage,
  onDismiss,
}) => {
  const { t } = useLanguage();

  let message: string = errorMessage || t.errorGeneric;
  let isKeyIssue = false;

  if (errorType === "CONFIG_ERROR_MISSING_KEY") {
    message = t.errorMissingKey;
    isKeyIssue = true;
  } else if (errorType === "GROQ_401_INVALID_KEY") {
    message = t.errorInvalidKey;
    isKeyIssue = true;
  } else if (errorType === "GROQ_429_RATE_LIMIT") {
    message = t.errorRateLimit;
  } else if (errorType === "UNREADABLE_FILE") {
    message = t.errorUnreadableFile;
  } else if (errorType === "UNSUPPORTED_TYPE") {
    message = t.errorUnsupportedType;
  } else if (errorType === "FILE_TOO_LARGE") {
    message = t.errorFileTooLarge;
  } else if (errorType === "EMPTY_VACANCY") {
    message = t.errorEmptyVacancy;
  } else if (errorMessage) {
    message = errorMessage;
  } else if (errorType && !errorType.startsWith("ANALYSIS_FAILED")) {
    message = `${t.errorGeneric} (${errorType})`;
  }

  return (
    <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm shadow-xs flex items-start gap-3">
      <div className="text-rose-500 mt-0.5 flex-shrink-0">
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <div className="flex-1">
        <p className="font-semibold text-rose-900 mb-0.5">{t.error}</p>
        <p className="text-xs text-rose-700 leading-relaxed">{message}</p>
        {isKeyIssue && (
          <div className="mt-2.5 p-2 bg-white/80 border border-rose-200 rounded text-[11px] font-mono text-slate-700">
            .env.local: GROQ_API_KEY=gsk_...
          </div>
        )}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-rose-400 hover:text-rose-600 transition"
        >
          &times;
        </button>
      )}
    </div>
  );
};
