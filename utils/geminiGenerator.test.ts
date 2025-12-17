import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateResearchPaper } from './geminiGenerator';

// Mock the Google Generative AI module
vi.mock('@google/generative-ai', () => {
    return {
        GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
            getGenerativeModel: vi.fn().mockReturnValue({
                generateContent: vi.fn().mockResolvedValue({
                    response: {
                        text: () => JSON.stringify({
                            title: "Test Research Paper",
                            abstract: "This is a test abstract",
                            sections: [
                                { heading: "Introduction", content: "Test introduction content" },
                                { heading: "Methodology", content: "Test methodology content" }
                            ],
                            conclusion: "Test conclusion",
                            developmentIdeas: ["Idea 1", "Idea 2", "Idea 3"],
                            thumbnailPrompt: "A test image description"
                        })
                    }
                })
            })
        }))
    };
});

describe('geminiGenerator', () => {
    it('should generate a research paper with correct structure', async () => {
        const result = await generateResearchPaper('Quantum Computing');

        expect(result).toHaveProperty('title');
        expect(result).toHaveProperty('abstract');
        expect(result).toHaveProperty('sections');
        expect(result).toHaveProperty('conclusion');
        expect(result).toHaveProperty('developmentIdeas');
        expect(result).toHaveProperty('thumbnailPrompt');

        expect(result.title).toBe('Test Research Paper');
        expect(result.sections).toHaveLength(2);
        expect(result.developmentIdeas).toHaveLength(3);
    });
});
