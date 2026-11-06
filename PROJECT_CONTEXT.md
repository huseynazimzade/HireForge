# PROJECT_CONTEXT.md — HireForge

## 1. Project Purpose
**HireForge** is an AI-powered HR automation and CV screening web application built for a hackathon under the track **AI-Powered CV Screening**.
- **Tagline**: *"Forge the perfect match between talent and opportunity."*
- **Primary Goal**: Deliver fast, objective, bias-free CV screening and candidate ranking for recruiters and HR specialists, alongside personalized, actionable improvement roadmaps for candidates.

---

## 2. Tech Stack
- **Framework**: Next.js 15 (App Router, React 19, TypeScript)
- **Styling**: Tailwind CSS (Minimalist, Inter font, Indigo primary `#4F46E5`, Orange accent `#F97316`)
- **Validation**: Zod (all schemas strictly typed and runtime validated)
- **AI Provider**: Groq SDK (`groq-sdk`)
  - **Model**: `llama-3.3-70b-versatile` (defined in `lib/constants.ts`)
  - **Mode**: JSON mode (`response_format: { type: "json_object" }`)
  - **Temperature**: `0.2` (deterministic extraction)
- **Authentication**: `bcryptjs` for password hashing, `jose` for signed JWT cookies (`hf_session`, valid 7 days)
- **Storage**: Local file `data/users.json` (auto-seeded with demo accounts)
- **File Parsing**: `unpdf` for PDF extraction, `mammoth` for DOCX extraction (server-side, max 5 MB)

---

## 3. Architecture & File Structure
```
HireForge/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts
│   │   │   ├── me/route.ts
│   │   │   └── register/route.ts
│   │   └── analyze/route.ts        # Multipart form: CV file + vacancy JSON + mode + language
│   ├── candidate/page.tsx          # Candidate flow: CV benchmark, gap analysis & tips
│   ├── hr/page.tsx                 # HR flow: Single CV & Multi CV ranking + CSV export
│   ├── login/page.tsx              # Auth login with demo accounts hint
│   ├── register/page.tsx           # Auth registration with role selection
│   ├── globals.css                 # Inter font & light gray styling
│   ├── layout.tsx                  # Root layout with Language & Auth Providers
│   └── page.tsx                    # Landing page with fairness guarantee
├── components/
│   ├── ApiKeyAlert.tsx             # Friendly configuration & error banner
│   ├── CircularProgress.tsx        # SVG Circular progress with color transitions
│   ├── FileDropzone.tsx            # Drag & drop upload for PDF & DOCX (up to 15 files)
│   ├── Logo.tsx                    # HireForge logo with fallback
│   ├── Navbar.tsx                  # Bilingual navbar with auth controls
│   ├── ScoreBreakdownView.tsx      # Skills / Experience / Education score breakdown
│   ├── SkillBadge.tsx              # Green matched & rose missing skill badges
│   ├── TagInput.tsx                # Skill tag input (Enter/comma)
│   └── VerdictBadge.tsx            # Strong / Medium / Weak status badge
├── context/
│   ├── AuthContext.tsx             # Session state & auto-fetch
│   └── LanguageContext.tsx         # Azerbaijani (default) & English toggle
├── data/
│   └── users.json                  # Local user store (git-ignored)
├── lib/
│   ├── analyzer.ts                 # Groq prompt, extraction & code-based scoring
│   ├── auth.ts                     # JWT sign/verify via jose
│   ├── constants.ts                # Model name, limits, demo vacancy
│   ├── dictionary.ts               # Bilingual dictionary (az & en)
│   ├── fileParser.ts               # unpdf & mammoth extractors
│   ├── types.ts                    # TypeScript interfaces
│   └── users.ts                    # User storage & seeding logic
├── middleware.ts                   # Route guards & role-based redirects
├── samples/                        # 5 generated fake CVs (.docx)
├── scripts/
│   └── generate-samples.mjs        # Script to create sample CVs
├── .env.example
├── .env.local
└── README.md
```

---

## 4. AI Logic & Code-Based Scoring

### Groq Single-Call Paradigm
Every analysis executes **exactly one structured call** to Groq with strict JSON output schema. The LLM extracts:
- `cvSkills[]`: Explicit technical & domain skills found in the text.
- `matchedSkills[]`: Skills from the vacancy that the candidate matches (normalized semantically).
- `missingSkills[]`: Required skills from the vacancy that the candidate lacks.
- `estimatedYearsExperience`: Calculated total professional experience in years.
- `educationLevel`: Identified educational degree (`None`, `Bachelor`, `Master`, `PhD`).
- `educationMatches`: Boolean indicating if education satisfies the vacancy requirement.
- `explanation`: 2-3 objective sentences explaining the evaluation.
- *Candidate mode extras*: `fixSuggestions[]`, `skillsToLearn[{skill, priority, tip}]`, `improvedSummary`.

### Mathematical Scoring (Not blind LLM output)
Scoring is calculated strictly in deterministic code in `lib/analyzer.ts`:
1. **Skills Score (60%)**:
   $$\text{skillsScore} = \min\left(100, \text{round}\left(\frac{\text{matchedSkills.length}}{\text{requiredSkills.length}} \times 100\right)\right)$$
   *(Defaults to 100% if no specific skills are required)*
2. **Experience Score (25%)**:
   $$\text{experienceScore} = \min\left(100, \text{round}\left(\frac{\text{estimatedYearsExperience}}{\text{requiredYears}} \times 100\right)\right)$$
   *(Defaults to 100% if no minimum years are required)*
3. **Education Score (15%)**:
   $$100\% \text{ if matches or 'Any'}, 50\% \text{ otherwise}$$
4. **Final Weighted Score**:
   $$\text{finalScore} = \text{round}(0.60 \times \text{skillsScore} + 0.25 \times \text{experienceScore} + 0.15 \times \text{educationScore})$$

### Verdicts:
- **Strong Match**: Final Score $\ge 75\%$
- **Medium Match**: Final Score $50\% - 74\%$
- **Weak Match**: Final Score $< 50\%$

---

## 5. Security & Safety Rules
1. **Prompt Injection Protection**:
   The prompt explicitly declares all CV content as untrusted raw data. Any prompt override commands embedded in the CV are ignored.
2. **Fairness & Anti-Bias Rule**:
   The LLM is strictly prohibited from considering candidate name, age, gender, photo, ethnicity, religion, or marital status. Only skills, experience, and education are evaluated.
3. **Human Decision Priority**:
   The AI never automatically rejects any candidate. The top shortlist ($N = \max(5, \text{open positions})$) is marked as "Recommended", while all remaining candidates are categorized under "For HR Review" for manual human review.

---

## 6. Developer & Collaboration Guidelines
For any future AI or human developer working on this codebase:
- **Keep changes small and focused**: Do not introduce broad refactors without explicit instruction.
- **Never hardcode or commit secrets**: All keys belong in `.env.local` and must remain git-ignored.
- **Do not alter scoring weights or fairness rules** unless explicitly requested by the user.
- **Keep UI minimalist and bilingual**: Every user-facing string must be retrieved from `lib/dictionary.ts` in both Azerbaijani (`az`) and English (`en`).
- **Always verify builds**: Run `npm run build` to ensure type safety and route integrity before completing tasks.
