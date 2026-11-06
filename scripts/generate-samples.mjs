import fs from "fs";
import path from "path";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";

const samplesDir = path.join(process.cwd(), "samples");
if (!fs.existsSync(samplesDir)) {
  fs.mkdirSync(samplesDir, { recursive: true });
}

const sampleCVs = [
  {
    fileName: "Candidate_1_Strong_Match.docx",
    name: "Alex Morgan",
    title: "Junior Data Analyst",
    summary:
      "Results-oriented Junior Data Analyst with 2 years of experience performing statistical data analysis, building Power BI dashboards, and querying relational databases using SQL and Python.",
    skills: ["Python", "SQL", "Power BI", "Pandas", "Statistics", "Git", "Excel"],
    experience: [
      {
        role: "Junior Data Analyst",
        company: "Apex Analytics Corp",
        period: "2023 - 2025 (2 years)",
        points: [
          "Developed automated data pipelines in Python and Pandas, reducing report turnaround time by 30%.",
          "Engineered complex SQL queries across PostgreSQL databases to extract business KPIs.",
          "Constructed interactive executive dashboards in Power BI and conducted exploratory statistical modeling.",
        ],
      },
    ],
    education: "Bachelor of Science in Computer Science, Baku State University (2019 - 2023)",
  },
  {
    fileName: "Candidate_2_Medium_Match.docx",
    name: "Jordan Lee",
    title: "Data Operations Associate",
    summary:
      "Enthusiastic analyst with 1.5 years of experience in data cleansing, reporting, and SQL database management. Proficient in Python scripting and advanced Excel modeling.",
    skills: ["Python", "SQL", "Excel", "Data Cleansing", "Tableau", "Git"],
    experience: [
      {
        role: "Data Operations Assistant",
        company: "Baku Logistics Ltd",
        period: "2024 - Present (1.5 years)",
        points: [
          "Wrote SQL scripts to validate inventory datasets and detect transaction anomalies.",
          "Utilized Python scripts for basic web scraping and data munging.",
          "Generated weekly financial reports using Microsoft Excel macros.",
        ],
      },
    ],
    education: "Bachelor of Arts in Economics, Azerbaijan State Economic University (2020 - 2024)",
  },
  {
    fileName: "Candidate_3_Entry_Level.docx",
    name: "Taylor Vance",
    title: "Recent Graduate & Data Intern",
    summary:
      "Motivated recent mathematics graduate with foundational hands-on internship experience in Python, Pandas, and applied statistics.",
    skills: ["Python", "Pandas", "Statistics", "NumPy", "Matplotlib", "Jupyter Notebook"],
    experience: [
      {
        role: "Data Science Intern",
        company: "InnoTech Labs",
        period: "Summer 2025 (6 months)",
        points: [
          "Assisted data scientists in statistical hypothesis testing and data distribution analysis.",
          "Wrote exploratory data analysis notebooks using Pandas and Matplotlib.",
        ],
      },
    ],
    education: "Bachelor of Science in Applied Mathematics, ADA University (2021 - 2025)",
  },
  {
    fileName: "Candidate_4_Senior_Overqualified.docx",
    name: "Samira Rzayeva",
    title: "Senior Data Scientist & Analytics Lead",
    summary:
      "Accomplished Senior Data Professional with over 7 years of progressive experience delivering enterprise machine learning solutions, Big Data analytics, SQL architectures, and Power BI reporting ecosystems.",
    skills: [
      "Python",
      "SQL",
      "Power BI",
      "Pandas",
      "Statistics",
      "Machine Learning",
      "PyTorch",
      "AWS",
      "Docker",
    ],
    experience: [
      {
        role: "Lead Analytics Architect",
        company: "Global FinTech Solutions",
        period: "2021 - Present (4 years)",
        points: [
          "Architected centralized SQL data warehouses and automated Power BI intelligence suites.",
          "Supervised end-to-end Python / Pandas data pipelines processing billions of monthly transactions.",
          "Mentored junior data analysts and established organizational statistical modeling standards.",
        ],
      },
      {
        role: "Data Analyst / ML Engineer",
        company: "Caspian Tech",
        period: "2018 - 2021 (3 years)",
        points: [
          "Authored high-performance SQL analytical queries and designed reporting schemas.",
          "Conducted statistical analyses and feature engineering for predictive pricing models.",
        ],
      },
    ],
    education: "Master of Science in Data Science & Artificial Intelligence, Khazar University (2016 - 2018)",
  },
  {
    fileName: "Candidate_5_Weak_Unrelated.docx",
    name: "Murad Guliyev",
    title: "Creative Graphic Designer & Brand Specialist",
    summary:
      "Creative visual designer with 3 years of agency experience specializing in branding, Adobe Creative Suite, UI design, and digital marketing illustrations.",
    skills: ["Figma", "Adobe Photoshop", "Adobe Illustrator", "HTML/CSS", "UI/UX Design", "Typography"],
    experience: [
      {
        role: "Graphic & UI Designer",
        company: "Creative Vision Studio",
        period: "2023 - Present (3 years)",
        points: [
          "Designed vector assets and typography systems for international branding campaigns.",
          "Created modern UI prototypes in Figma for web and mobile applications.",
        ],
      },
    ],
    education: "Bachelor of Fine Arts in Graphic Design, Azerbaijan State Academy of Fine Arts (2019 - 2023)",
  },
];

async function generateAll() {
  for (const cv of sampleCVs) {
    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              text: cv.name,
              heading: HeadingLevel.TITLE,
              spacing: { after: 120 },
            }),
            new Paragraph({
              text: cv.title,
              heading: HeadingLevel.HEADING_2,
              spacing: { after: 200 },
            }),
            new Paragraph({
              text: "PROFESSIONAL SUMMARY",
              heading: HeadingLevel.HEADING_3,
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [new TextRun(cv.summary)],
              spacing: { after: 240 },
            }),
            new Paragraph({
              text: "TECHNICAL & PROFESSIONAL SKILLS",
              heading: HeadingLevel.HEADING_3,
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [new TextRun(cv.skills.join(" • "))],
              spacing: { after: 240 },
            }),
            new Paragraph({
              text: "WORK EXPERIENCE",
              heading: HeadingLevel.HEADING_3,
              spacing: { after: 100 },
            }),
            ...cv.experience.flatMap((exp) => [
              new Paragraph({
                children: [
                  new TextRun({ text: `${exp.role} - ${exp.company}`, bold: true }),
                  new TextRun({ text: ` | ${exp.period}`, italics: true }),
                ],
                spacing: { after: 80 },
              }),
              ...exp.points.map(
                (pt) =>
                  new Paragraph({
                    text: `• ${pt}`,
                    spacing: { after: 60 },
                  })
              ),
            ]),
            new Paragraph({
              text: "EDUCATION",
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 180, after: 100 },
            }),
            new Paragraph({
              children: [new TextRun(cv.education)],
              spacing: { after: 200 },
            }),
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    const filePath = path.join(samplesDir, cv.fileName);
    fs.writeFileSync(filePath, buffer);
    console.log(`Generated: ${cv.fileName}`);
  }
}

generateAll().catch(console.error);
