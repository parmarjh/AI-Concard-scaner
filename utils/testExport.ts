import { exportAsPDF, exportAsDOCX, exportAsMarkdown } from './exportResearch';
import { ResearchPaper } from './geminiGenerator';

// Test the export functions
const testPaper: ResearchPaper = {
    title: "Test Research Paper",
    abstract: "This is a test abstract for validating export functionality.",
    sections: [
        {
            heading: "Introduction",
            content: "This is the introduction section with some test content."
        },
        {
            heading: "Methodology",
            content: "This section describes the methodology used in the research."
        }
    ],
    conclusion: "This is the conclusion of the test research paper.",
    developmentIdeas: [
        "First development idea",
        "Second development idea",
        "Third development idea"
    ],
    thumbnailPrompt: "A professional research laboratory with modern equipment"
};

// Export test function
export async function testExport() {
    console.log('Testing PDF export...');
    await exportAsPDF(testPaper);
    console.log('PDF export completed!');

    console.log('Testing DOCX export...');
    await exportAsDOCX(testPaper);
    console.log('DOCX export completed!');

    console.log('Testing Markdown export...');
    exportAsMarkdown(testPaper);
    console.log('Markdown export completed!');
}

// Log for debugging
console.log('Export test utilities loaded. Call testExport() to test downloads.');
