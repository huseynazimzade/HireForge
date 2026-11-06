"use client";

import React, { useState, KeyboardEvent } from "react";
import { SkillBadge } from "./SkillBadge";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const TagInput: React.FC<TagInputProps> = ({
  tags,
  onChange,
  placeholder,
  disabled = false,
}) => {
  const [input, setInput] = useState("");

  const addTag = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (!tags.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      onChange([...tags, trimmed]);
    }
    setInput("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && !input && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50 border border-slate-300 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-600 transition min-h-[44px]">
        {tags.map((tag, idx) => (
          <SkillBadge
            key={idx}
            skill={tag}
            type="neutral"
            onRemove={disabled ? undefined : () => removeTag(idx)}
          />
        ))}
        {!disabled && (
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => addTag(input)}
            placeholder={tags.length === 0 ? placeholder : ""}
            className="flex-1 bg-transparent border-0 outline-none text-sm text-slate-800 placeholder-slate-400 min-w-[140px] px-1 py-0.5"
          />
        )}
      </div>
    </div>
  );
};
