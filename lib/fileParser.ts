import mammoth from "mammoth";
import { extractText } from "unpdf";
import { MAX_CV_TEXT_LENGTH, MAX_FILE_SIZE_BYTES } from "./constants";

export interface ParseResult {
  text: string;
  error?: "FILE_TOO_LARGE" | "UNSUPPORTED_TYPE" | "UNREADABLE_FILE";
}

export async function parseCVFile(
  file: File | Blob,
  fileName: string
): Promise<ParseResult> {
  const size = file.size;
  if (size > MAX_FILE_SIZE_BYTES) {
    return { text: "", error: "FILE_TOO_LARGE" };
  }

  const lowerName = fileName.toLowerCase();
  const isPDF = lowerName.endsWith(".pdf") || file.type === "application/pdf";
  const isDOCX =
    lowerName.endsWith(".docx") ||
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  if (!isPDF && !isDOCX) {
    return { text: "", error: "UNSUPPORTED_TYPE" };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    let extractedText = "";

    if (isPDF) {
      const res = await extractText(new Uint8Array(buffer), { mergePages: true });
      if (typeof res.text === "string") {
        extractedText = res.text;
      } else if (Array.isArray(res.text)) {
        extractedText = (res.text as string[]).join("\n");
      }
    } else if (isDOCX) {
      const mammothResult = await mammoth.extractRawText({ buffer });
      extractedText = mammothResult.value;
    }

    // Clean whitespace
    const cleanText = extractedText.replace(/\r\n/g, "\n").trim();

    if (!cleanText || cleanText.length < 15) {
      // Empty or scanned PDF with image only
      return { text: "", error: "UNREADABLE_FILE" };
    }

    // Truncate to MAX_CV_TEXT_LENGTH (12000) characters
    const truncated = cleanText.length > MAX_CV_TEXT_LENGTH
      ? cleanText.substring(0, MAX_CV_TEXT_LENGTH)
      : cleanText;

    return { text: truncated };
  } catch (err) {
    console.error("File parsing error for", fileName, err);
    return { text: "", error: "UNREADABLE_FILE" };
  }
}
