export const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

// Fallback models if primary model is unavailable / deprecated on user's Groq tier
export const GROQ_FALLBACK_MODELS = [
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "qwen/qwen3.8-27b",
];

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_CV_TEXT_LENGTH = 12000; // Truncate CV text before LLM

export const DEMO_VACANCY = {
  jobTitle: "Junior Data Analyst",
  requiredSkills: ["Python", "SQL", "Power BI", "Pandas", "Statistics"],
  minExperienceYears: 1,
  educationRequirement: "Bachelor",
  description:
    "We are looking for a motivated Junior Data Analyst to collect, process, and perform statistical analysis on large datasets using Python, SQL, and Power BI.",
};
