"use client";

import React, { useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { MAX_FILE_SIZE_BYTES } from "@/lib/constants";

interface FileDropzoneProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  disabled?: boolean;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  files,
  onFilesChange,
  multiple = false,
  maxFiles = 15,
  disabled = false,
}) => {
  const { t } = useLanguage();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndAddFiles = (newFiles: FileList | File[]) => {
    setError(null);
    const validFiles: File[] = [];

    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      const lower = file.name.toLowerCase();
      const isPdfOrDocx = lower.endsWith(".pdf") || lower.endsWith(".docx");

      if (!isPdfOrDocx) {
        setError(t.errorUnsupportedType);
        continue;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        setError(t.errorFileTooLarge);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    if (!multiple) {
      onFilesChange([validFiles[0]]);
    } else {
      const combined = [...files, ...validFiles];
      const deduplicated = Array.from(
        new Map(combined.map((f) => [f.name + f.size, f])).values()
      ).slice(0, maxFiles);
      onFilesChange(deduplicated);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full space-y-3">
      <div
        onClick={() => !disabled && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          isDragging
            ? "border-indigo-500 bg-indigo-50/50"
            : "border-slate-300 hover:border-indigo-400 bg-slate-50/50"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          multiple={multiple}
          disabled={disabled}
          onChange={(e) => {
            if (e.target.files) validateAndAddFiles(e.target.files);
          }}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
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
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-800">
            {multiple ? t.uploadMultipleCVTitle : t.uploadCVTitle}
          </p>
          <p className="text-xs text-slate-500">{t.dragDropText}</p>
          <p className="text-[11px] font-medium text-slate-400">
            {t.supportedFormats}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
          {error}
        </div>
      )}

      {/* Selected files list */}
      {files.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-xs font-semibold text-slate-600 px-1">
            {multiple ? `${t.filesSelected} (${files.length}/${maxFiles})` : t.fileSelected}:
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {files.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg text-xs"
              >
                <div className="flex items-center space-x-2 truncate pr-2">
                  <span className="font-bold text-indigo-600 uppercase text-[10px] px-1.5 py-0.5 bg-indigo-50 rounded">
                    {file.name.split(".").pop()}
                  </span>
                  <span className="text-slate-800 font-medium truncate">
                    {file.name}
                  </span>
                  <span className="text-slate-400 text-[11px] flex-shrink-0">
                    ({(file.size / 1024).toFixed(0)} KB)
                  </span>
                </div>
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(idx);
                    }}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded transition"
                    title={t.removeFile}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
