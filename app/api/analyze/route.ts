import { NextRequest, NextResponse } from "next/server";
import { parseCVFile } from "@/lib/fileParser";
import { analyzeCVWithGroq, checkGroqApiKey } from "@/lib/analyzer";
import { Language, VacancyInput } from "@/lib/types";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    // 1. Check API Key configuration first
    const keyCheck = checkGroqApiKey();
    if (!keyCheck.valid) {
      return NextResponse.json(
        {
          error: "CONFIG_ERROR_MISSING_KEY",
          message:
            "GROQ_API_KEY is missing or still a placeholder. Please set your GROQ_API_KEY in .env.local and restart the server.",
        },
        { status: 503 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("cv") as File | null;
    const vacancyRaw = formData.get("vacancy") as string | null;
    const mode = (formData.get("mode") as "hr" | "candidate") || "hr";
    const language = (formData.get("language") as Language) || "az";

    if (!file) {
      return NextResponse.json({ error: "NO_FILE_PROVIDED" }, { status: 400 });
    }

    if (!vacancyRaw) {
      return NextResponse.json({ error: "EMPTY_VACANCY" }, { status: 400 });
    }

    let vacancy: VacancyInput;
    try {
      vacancy = JSON.parse(vacancyRaw);
    } catch {
      return NextResponse.json({ error: "INVALID_VACANCY_JSON" }, { status: 400 });
    }

    // Vacancy must have at least requiredSkills or description
    const hasSkills = vacancy.requiredSkills && vacancy.requiredSkills.length > 0;
    const hasDesc = vacancy.description && vacancy.description.trim().length > 0;
    if (!hasSkills && !hasDesc) {
      return NextResponse.json({ error: "EMPTY_VACANCY" }, { status: 400 });
    }

    // 2. Extract CV text
    const parseResult = await parseCVFile(file, file.name);

    if (parseResult.error) {
      if (parseResult.error === "FILE_TOO_LARGE") {
        return NextResponse.json({ error: "FILE_TOO_LARGE" }, { status: 413 });
      }
      if (parseResult.error === "UNSUPPORTED_TYPE") {
        return NextResponse.json({ error: "UNSUPPORTED_TYPE" }, { status: 415 });
      }
      return NextResponse.json({ error: "UNREADABLE_FILE" }, { status: 422 });
    }

    // 3. Call Groq ONCE and score
    const analysisResult = await analyzeCVWithGroq(
      parseResult.text,
      file.name,
      vacancy,
      mode,
      language
    );

    return NextResponse.json(analysisResult);
  } catch (error: any) {
    console.error("Analysis API error:", error);

    if (error?.message === "GROQ_API_KEY_CONFIG_ERROR") {
      return NextResponse.json(
        { error: "CONFIG_ERROR_MISSING_KEY" },
        { status: 503 }
      );
    }
    if (error?.message === "GROQ_401_INVALID_KEY") {
      return NextResponse.json(
        { error: "GROQ_401_INVALID_KEY" },
        { status: 401 }
      );
    }
    if (error?.message === "GROQ_429_RATE_LIMIT") {
      return NextResponse.json(
        { error: "GROQ_429_RATE_LIMIT" },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "ANALYSIS_FAILED", details: error?.message || "Internal error" },
      { status: 500 }
    );
  }
}
