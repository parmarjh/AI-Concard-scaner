

import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.API_KEY || process.env.GEMINI_API_KEY || '';

const genAI = new GoogleGenerativeAI(API_KEY);

export interface ResearchPaper {
    title: string;
    abstract: string;
    sections: { heading: string; content: string }[];
    conclusion: string;
    developmentIdeas: string[];
    thumbnailPrompt: string;
}

export async function generateResearchPaper(topic: string): Promise<ResearchPaper> {
    const prompt = `
    You are an expert academic researcher.
    Create a comprehensive research paper outline and content on the topic: "${topic}".
    
    The output must be strictly valid JSON with the following structure:
    {
      "title": "Paper Title",
      "abstract": "Short abstract...",
      "sections": [
        { "heading": "Introduction", "content": "Detailed introduction..." },
        { "heading": "Main Methodology", "content": "Technical details..." },
        { "heading": "Results/Discussion", "content": "Analysis..." }
      ],
      "conclusion": "Summary...",
      "developmentIdeas": ["Idea 1", "Idea 2", "Idea 3"],
      "thumbnailPrompt": "A highly detailed, cinematic description of an image representing this topic."
    }
    
    Ensure the content is professional, insightful, and formatted.
    For "developmentIdeas", suggest 3 innovative future development directions.
  `;

    try {
        // Get the generative model instance
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
            generationConfig: {
                responseMimeType: "application/json"
            }
        });

        // Generate content
        const result = await model.generateContent(prompt);
        const response = await result.response;

        // Handle response
        let jsonStr = response.text().trim();

        // Clean code fences if any (though responseMimeType usually avoids this, sometimes model adds it)
        if (jsonStr.startsWith('```')) {
            jsonStr = jsonStr.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
        }

        if (!jsonStr) throw new Error("Empty response from AI");

        return JSON.parse(jsonStr) as ResearchPaper;

    } catch (error: any) {
        console.error("Gemini Generation Error:", error);
        throw new Error(`Failed to generate paper: ${error.message || JSON.stringify(error)}`);
    }
}
