
import { GoogleGenAI, Type } from "@google/genai";
import type { CourseInput, CoursePlan, CourseSection } from "../types";

// IMPORTANT: This check is for a development environment.
// In a real application, the API key should be securely managed.
if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

export const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const coursePlanSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Detailed and engaging title for the course." },
    audience: { type: Type.STRING, description: "A more detailed description of the target audience." },
    duration: { type: Type.STRING, description: "Estimated total duration to complete the course (e.g., '6 hours')." },
    sections: {
      type: Type.ARRAY,
      description: "An array of course sections.",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "A unique identifier for the section, e.g., 'section_1'." },
          title: { type: Type.STRING, description: "The title of this course section." },
          description: { type: Type.STRING, description: "A brief one-sentence summary of what this section covers." },
          objectives: {
            type: Type.ARRAY,
            description: "A list of specific learning objectives for this section.",
            items: { type: Type.STRING },
          },
          subsections: {
            type: Type.ARRAY,
            description: "An array of subsections within this section.",
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
              },
              required: ["title", "description"],
            },
          },
        },
        required: ["id", "title", "description", "objectives", "subsections"],
      },
    },
  },
  required: ["title", "audience", "duration", "sections"],
};

export const generateCoursePlan = async (input: CourseInput): Promise<CoursePlan> => {
  const prompt = `
    You are an expert instructional designer tasked with creating a comprehensive course outline.
    Based on the following user requirements, generate a structured course plan.

    Requirements:
    - Topic: ${input.topic}
    - Learning Objective: ${input.objective}
    - Target Audience: ${input.audience}
    - Restrictions/Details: ${input.restrictions || 'None'}

    The course plan should be divided into logical sections. Each section must have:
    - A unique 'id' (e.g., "section_1").
    - A clear 'title'.
    - A 'description' briefly explaining what the section covers.
    - A list of specific 'objectives' for that section.
    - An array of 'subsections', each with a 'title' and a brief 'description'.

    Your entire output MUST be a valid JSON object matching the provided schema. Do not include any explanatory text, markdown formatting, or code fences.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: coursePlanSchema,
      temperature: 0.7,
    },
  });
  
  const jsonText = response.text.trim();
  return JSON.parse(jsonText) as CoursePlan;
};

export const regenerateCoursePlan = async (input: CourseInput, oldPlan: CoursePlan, feedback: string): Promise<CoursePlan> => {
  const prompt = `
    You are an expert instructional designer tasked with revising a course outline based on user feedback.
    
    Original Requirements:
    - Topic: ${input.topic}
    - Learning Objective: ${input.objective}
    - Target Audience: ${input.audience}
    - Restrictions/Details: ${input.restrictions || 'None'}

    Previous Course Plan (JSON):
    ${JSON.stringify(oldPlan, null, 2)}

    User Feedback for Revision:
    "${feedback}"

    Instructions:
    - Analyze the feedback and regenerate the entire course plan to incorporate the user's suggestions.
    - Maintain the same overall structure and goals unless the feedback directs otherwise.
    - For example, if the user asks for a new practical section, add one and adjust the other sections if necessary.
    - Ensure all section IDs are unique and sequential (e.g., 'section_1', 'section_2', etc.).

    Your entire output MUST be a valid JSON object matching the provided schema. Do not include any explanatory text, markdown formatting, or code fences.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: coursePlanSchema,
      temperature: 0.8,
    },
  });

  const jsonText = response.text.trim();
  return JSON.parse(jsonText) as CoursePlan;
}

export const generateContentForSection = async (
  courseInput: CourseInput, 
  fullPlan: CoursePlan, 
  sectionId: string
): Promise<string> => {
  const section = fullPlan.sections.find(s => s.id === sectionId);
  if (!section) {
    throw new Error(`Section with ID ${sectionId} not found in the course plan.`);
  }

  const prompt = `
    You are an expert content writer and subject matter expert, creating educational material.
    Your task is to write the detailed content for a specific section of a larger course.

    COURSE CONTEXT:
    - Course Topic: ${courseInput.topic}
    - Target Audience: ${courseInput.audience}
    - Overall Tone/Restrictions: ${courseInput.restrictions || 'Professional and encouraging'}

    SECTION TO WRITE:
    - Section Title: "${section.title}"
    - Section Objectives: ${section.objectives.join(', ')}
    - Subsections to cover: ${section.subsections.map(sub => sub.title).join(', ')}

    INSTRUCTIONS:
    - Write detailed, engaging, and practical content for this section in Spanish.
    - Use Markdown for formatting (e.g., # for H1, ## for H2, lists, bold, italics, and \`\`\` for code blocks).
    - If the topic involves code (like Python, JavaScript, etc.), provide clear, well-commented code examples.
    - Structure the content logically, using the subsections as a guide for H2 or H3 headings.
    - Ensure the content directly addresses the specified learning objectives.
    - Do NOT repeat the main section title as an H1 heading. Start the content directly, perhaps with a brief introduction.
    - Your output should be ONLY the markdown content for this single section.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      temperature: 0.6,
    }
  });
  
  return response.text;
};
