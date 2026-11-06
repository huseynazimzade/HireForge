import fs from "fs";

const BASE = "http://127.0.0.1:3000";

async function testLiveAnalyze() {
  console.log("=== TESTING LIVE /api/analyze END-TO-END ===");

  // 1. Login as HR to get session cookie
  const loginRes = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "hr@demo.com", password: "Demo1234" }),
  });
  const cookie = (loginRes.headers.get("set-cookie") || "").split(";")[0];
  console.log("Logged in demo HR successfully!");

  // 2. Read sample CV file
  const filePath = "samples/Candidate_1_Strong_Match.docx";
  const fileBuffer = fs.readFileSync(filePath);
  const fileBlob = new Blob([fileBuffer], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });

  const formData = new FormData();
  formData.append("cv", fileBlob, "Candidate_1_Strong_Match.docx");
  formData.append(
    "vacancy",
    JSON.stringify({
      jobTitle: "Junior Data Analyst",
      requiredSkills: ["Python", "SQL", "Power BI", "Pandas", "Statistics"],
      minExperienceYears: 1,
      educationRequirement: "Bachelor",
      description: "Data Analyst opening",
    })
  );
  formData.append("mode", "hr");
  formData.append("language", "az");

  console.log("Sending POST /api/analyze with real CV file and Groq key...");
  const analyzeRes = await fetch(`${BASE}/api/analyze`, {
    method: "POST",
    headers: {
      Cookie: cookie,
    },
    body: formData,
  });

  const status = analyzeRes.status;
  const data = await analyzeRes.json();
  console.log(`Response Status: ${status}`);

  if (status === 200) {
    console.log("ANALYSIS SUCCESSFUL! Result:");
    console.log({
      finalScore: data.finalScore,
      verdict: data.verdict,
      matchedSkills: data.matchedSkills,
      missingSkills: data.missingSkills,
      estimatedYearsExperience: data.estimatedYearsExperience,
      educationLevel: data.educationLevel,
      explanation: data.explanation,
    });
  } else {
    console.error("ANALYSIS FAILED:", data);
    process.exit(1);
  }
}

testLiveAnalyze().catch(console.error);
