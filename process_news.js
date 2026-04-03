import { GoogleGenAI } from "@google/genai";
import fs from 'fs';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function processNews() {
  try {
    const url = 'https://gnews.io/api/v4/search?q="artificial+intelligence"+OR+"machine+learning"+OR+"internship"+OR+"fresher"+OR+"hiring"&lang=en&apikey=ebcc84b6d91abd52a5ba32c34b492e82&max=10';
    const res = await fetch(url);
    const data = await res.json();
    
    const prompt = `
You are an intelligent filtering and classification engine for a student platform.
Your job is to process raw news data from an API (like GNews) and return ONLY highly relevant content.

STRICT FILTER RULES:
Include ONLY news related to:
- Artificial Intelligence (AI tools, generative AI, AI updates)
- BTech jobs
- Internships
- Fresher hiring
- Campus placements
- Tech careers

Exclude completely:
- Politics
- Entertainment
- Sports
- Crime
- General unrelated news

INPUT FORMAT:
You will receive a JSON array of articles.

TASK:
1. FILTER: Remove all irrelevant articles.
2. CLASSIFY each remaining article into ONE category: "AI", "Jobs", "Internship", "Hiring"
3. CLEAN CONTENT: Simplify title if too long. Rewrite description in 1–2 simple lines.
4. GENERATE: For each article output:
- hook: short engaging line (max 8 words)
- title: clean title
- summary: 1–2 line simple explanation
- category: one of (AI, Jobs, Internship, Hiring)
- url: original link

KEYWORD LOGIC (VERY IMPORTANT):
Use keyword detection:
AI keywords: "ai", "artificial intelligence", "machine learning", "generative ai"
Jobs keywords: "job", "hiring", "recruitment", "fresher", "placement"
Internship keywords: "internship", "intern"

If article does not match ANY category -> IGNORE it completely.

OUTPUT FORMAT:
Return ONLY a JSON array like:
[
{
"hook": "...",
"title": "...",
"summary": "...",
"category": "AI",
"url": "..."
}
]

STYLE:
- Simple English
- Short
- Student-friendly
- No extra explanation outside JSON

DATA TO PROCESS:
${JSON.stringify(data.articles)}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
    });
    
    console.log(response.text);
    fs.writeFileSync('output.json', response.text);
  } catch (err) {
    console.error(err);
  }
}
processNews();
