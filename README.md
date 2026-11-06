# HireForge

> **Tagline:** Forge the perfect match between talent and opportunity.  
> **Hackathon Theme:** AI-powered HR automation  
> **Track:** AI-Powered CV Screening

HireForge is an AI-powered, bilingual (Azerbaijani & English) CV screening and ranking platform built with Next.js (App Router), Tailwind CSS, and Groq LLM (`llama-3.3-70b-versatile`).

---

## ⚡ Quick Start

### 1. Clone & Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Or edit `.env.local` directly:
```env
GROQ_API_KEY=your_groq_api_key_here
AUTH_SECRET=change_me_to_a_long_random_string
```

#### How to get a Groq API Key:
1. Visit [console.groq.com](https://console.groq.com/) and create a free account.
2. Navigate to **API Keys** in the dashboard.
3. Click **Create API Key**, copy the key (starts with `gsk_...`), and paste it as `GROQ_API_KEY` in `.env.local`.

#### `AUTH_SECRET`:
Set a random string for JWT session token signing (e.g. `openssl rand -base64 32`).

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👥 Demo Accounts
On first launch, HireForge automatically seeds two demo accounts:

| Role | Email | Password |
|---|---|---|
| **HR Specialist** | `hr@demo.com` | `Demo1234` |
| **Candidate** | `candidate@demo.com` | `Demo1234` |

*Tip: You can also register a new account on the `/register` page at any time.*

---

## 🌟 Key Features

### 🏢 HR Flow (`/hr`)
- **Single CV Analysis**:
  - Upload a CV (`.pdf` or `.docx`, up to 5 MB).
  - Define vacancy requirements (skills, minimum experience, education requirement).
  - Circular match progress with breakdown: **Skills (60%)**, **Experience (25%)**, **Education (15%)**.
  - Visual badges for matched (green) and missing (red) skills.
  - Concise 2-3 sentence AI explanation.
- **Multiple CV Ranking**:
  - Upload up to 15 CVs simultaneously.
  - Concurrency processing with automatic retry on Groq 429 rate limits.
  - Sorted ranking table by match percentage.
  - **Shortlist recommendation**: Top candidates ($\max(5, N)$) highlighted as *Recommended*.
  - **For HR Review**: Remaining candidates presented for human recruitment decisions (the AI never automatically rejects any candidate).
  - **Export CSV**: One-click download of ranked candidate data.

### 👤 Candidate Flow (`/candidate`)
- Upload your CV and benchmark it against any target job opening.
- Paste a job description or enter required skills.
- Receive:
  - Match percentage and skill gap breakdown.
  - **What to fix in your CV**: Concrete, actionable points.
  - **Skills to learn**: Prioritized roadmap (High / Medium / Low) with short learning tips.
  - **Improved CV Professional Summary**: Tailored 3-4 sentence summary with a 1-click **Copy** button.

### 🛡️ Fairness & Security
- **Anti-bias rule**: The AI strictly ignores name, age, gender, photo, ethnicity, religion, or marital status.
- **Prompt injection protection**: CV text is treated as untrusted data; embedded instructions are ignored.
- **Deterministic scoring**: All scores are computed in TypeScript code, never hallucinated by the model.

---

## 📁 Sample CVs
5 fictional sample CVs covering different skill levels and backgrounds are provided in the `/samples` folder:
1. `Candidate_1_Strong_Match.docx` (Strong match for Data Analyst)
2. `Candidate_2_Medium_Match.docx` (Medium match)
3. `Candidate_3_Entry_Level.docx` (Recent graduate / intern)
4. `Candidate_4_Senior_Overqualified.docx` (Senior lead)
5. `Candidate_5_Weak_Unrelated.docx` (Unrelated profile)

Use the **"Load demo data"** button in either dashboard to instantly populate the matching Junior Data Analyst vacancy!
