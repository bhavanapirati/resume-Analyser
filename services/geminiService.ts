

import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult } from '../types';
import { Verdict } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    relevanceScore: {
      type: Type.NUMBER,
      description: 'A score from 0 to 100 indicating the resume\'s relevance to the job description.',
    },
    verdict: {
      type: Type.STRING,
      enum: [Verdict.HIGH, Verdict.MEDIUM, Verdict.LOW],
      description: 'The final suitability verdict for the candidate.',
    },
    mustHaveSkillsMet: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'A list of must-have skills that were found in the resume.'
    },
    mustHaveSkillsMissing: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'A list of must-have skills that were NOT found in the resume.'
    },
    goodToHaveSkillsMet: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'A list of good-to-have skills that were found in the resume.'
    },
    goodToHaveSkillsMissing: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'A list of good-to-have skills that were NOT found in the resume.'
    },
    otherMatchingSkills: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'A list of other relevant skills found in the resume that match the job description but were not in the provided lists.',
    },
    feedback: {
      type: Type.STRING,
      description: 'Personalized, constructive feedback for the student on how to improve their resume for this role.',
    },
  },
  required: ['relevanceScore', 'verdict', 'mustHaveSkillsMet', 'mustHaveSkillsMissing', 'goodToHaveSkillsMet', 'goodToHaveSkillsMissing', 'otherMatchingSkills', 'feedback'],
};

export const analyzeResume = async (
    jobDescription: string, 
    resumeText: string, 
    mustHaveSkills: string,
    goodToHaveSkills: string,
    temperature: number
): Promise<AnalysisResult> => {
  const prompt = `
    As an expert technical recruiter and career coach, your task is to perform a hybrid analysis of the provided resume against the job description. First, perform a strict "Hard Match" for specific skills, then a "Soft Match" for overall semantic relevance.
    
    Job Description:
    ---
    ${jobDescription}
    ---
    
    Resume Text:
    ---
    ${resumeText}
    ---

    **Hard Match Analysis:**
    The user has provided the following lists of skills. Scrutinize the resume to determine if they are present. Be strict but fair; look for direct mentions or very close equivalents (e.g., 'React.js' matches 'React').
    
    - Must-Have Skills List: ${mustHaveSkills || 'Not provided'}
    - Good-to-Have Skills List: ${goodToHaveSkills || 'Not provided'}
    
    **Soft Match Analysis & Final Output:**
    After the hard match, perform a holistic, semantic analysis of the entire resume against the job description. Then, structure your entire response in JSON format according to the provided schema.

    1.  **Skill Analysis (Hard Match):**
        - Populate 'mustHaveSkillsMet' with skills from the "Must-Have" list found in the resume.
        - Populate 'mustHaveSkillsMissing' with skills from the "Must-Have" list NOT found.
        - Populate 'goodToHaveSkillsMet' with skills from the "Good-to-Have" list found in the resume.
        - Populate 'goodToHaveSkillsMissing' with skills from the "Good-to-Have" list NOT found.
        - Populate 'otherMatchingSkills' with any other important skills you identify that align with the JD but were not in the provided lists.
    2.  **Relevance Score (Soft Match):** Calculate a score from 0-100. Heavily penalize for missing "Must-Have" skills. The score should reflect the overall semantic fit beyond just keywords.
    3.  **Verdict:** Based on the score and qualitative analysis (especially the "Must-Have" check), provide a "High", "Medium", or "Low" suitability verdict. A candidate missing any "Must-Have" skill cannot be "High".
    4.  **Personalized Feedback:** Write actionable, encouraging feedback. If must-have skills are missing, emphasize their importance and suggest how the candidate could gain that experience.
    `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: temperature,
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);

    // Basic validation to ensure the parsed object has the expected structure.
    if (
      typeof result.relevanceScore !== 'number' ||
      !Object.values(Verdict).includes(result.verdict) ||
      !Array.isArray(result.mustHaveSkillsMet) ||
      !Array.isArray(result.mustHaveSkillsMissing) ||
      !Array.isArray(result.goodToHaveSkillsMet) ||
      !Array.isArray(result.goodToHaveSkillsMissing) ||
      !Array.isArray(result.otherMatchingSkills) ||
      typeof result.feedback !== 'string'
    ) {
      throw new Error('Received malformed data from API.');
    }
    
    return result as AnalysisResult;
    
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get analysis from the AI model. The model might be overloaded or the input is invalid.");
  }
};
