export type Language = "az" | "en";

export type UserRole = "HR" | "Candidate";

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  passwordHash: string;
  createdAt: string;
}

export type EducationLevel = "None" | "High School" | "Associate" | "Bachelor" | "Master" | "PhD";

export interface VacancyInput {
  jobTitle?: string;
  requiredSkills: string[];
  minExperienceYears: number;
  educationRequirement: "Any" | "Bachelor" | "Master" | "PhD";
  description?: string;
}

export interface ScoreBreakdown {
  finalScore: number;
  skillsScore: number;
  experienceScore: number;
  educationScore: number;
}

export interface SkillToLearn {
  skill: string;
  priority: "High" | "Medium" | "Low";
  tip: string;
}

export interface AnalysisResult {
  fileName: string;
  finalScore: number;
  verdict: "Strong" | "Medium" | "Weak";
  breakdown: ScoreBreakdown;
  cvSkills: string[];
  matchedSkills: string[];
  missingSkills: string[];
  estimatedYearsExperience: number;
  educationLevel: string;
  educationMatches: boolean;
  explanation: string;
  // Candidate mode extras
  fixSuggestions?: string[];
  skillsToLearn?: SkillToLearn[];
  improvedSummary?: string;
  error?: string;
}
