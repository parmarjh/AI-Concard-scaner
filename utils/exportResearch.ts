import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import { ResearchPaper } from './geminiGenerator';

/**
 * Sanitize filename to be safe for all operating systems
 */
function sanitizeFilename(title: string): string {
    if (!title || title.trim() === '') {
        return 'research_paper';
    }

    // Remove or replace problematic characters
    return title
        .trim()
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, '') // Remove invalid chars
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .replace(/[^\w\-]/g, '') // Keep only alphanumeric, underscore, and hyphen
        .toLowerCase()
        .substring(0, 50) // Limit length
        || 'research_paper'; // Fallback if everything is removed
}

/**
 * Helper to download a Blob with a filename using manual anchor tag
 * This avoids issues with file-saver in some environments/browsers
 */
function downloadBlob(blob: Blob, filename: string) {
    // Create object URL
    const url = URL.createObjectURL(blob);

    // Create temporary anchor
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;

    // Append to body (required for Firefox)
    document.body.appendChild(link);

    // Trigger download
    link.click();

    // Cleanup
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Export research paper as PDF
 */
export async function exportAsPDF(paper: ResearchPaper): Promise<void> {
    const doc = new jsPDF();
    let yPosition = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;

    // Helper to add text with automatic page breaks
    const addText = (text: string, fontSize: number, isBold: boolean = false, indent: number = 0) => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');

        const lines = doc.splitTextToSize(text, maxWidth - indent);

        for (const line of lines) {
            if (yPosition > pageHeight - margin) {
                doc.addPage();
                yPosition = margin;
            }
            doc.text(line, margin + indent, yPosition);
            yPosition += fontSize * 0.5;
        }
        yPosition += 5; // Add spacing after paragraph
    };

    // Title
    addText(paper.title, 20, true);
    yPosition += 5;

    // Abstract
    addText('Abstract', 14, true);
    addText(paper.abstract, 11);
    yPosition += 5;

    // Sections
    for (const section of paper.sections) {
        addText(section.heading, 14, true);
        addText(section.content, 11);
        yPosition += 5;
    }

    // Conclusion
    addText('Conclusion', 14, true);
    addText(paper.conclusion, 11);
    yPosition += 5;

    // Development Ideas
    addText('Future Development Ideas', 14, true);
    paper.developmentIdeas.forEach((idea, index) => {
        addText(`${index + 1}. ${idea}`, 11, false, 5);
    });

    // Save PDF
    const fileName = `${sanitizeFilename(paper.title)}.pdf`;
    console.log('Exporting PDF with title:', paper.title, 'fileName:', fileName);

    // Use manual download helper to ensure filename is respected
    const blob = doc.output('blob');
    downloadBlob(blob, fileName);
}

/**
 * Export research paper as DOCX
 */
export async function exportAsDOCX(paper: ResearchPaper): Promise<void> {
    const children: Paragraph[] = [];

    // Title
    children.push(
        new Paragraph({
            text: paper.title,
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 200 }
        })
    );

    // Abstract
    children.push(
        new Paragraph({
            text: 'Abstract',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
        })
    );
    children.push(
        new Paragraph({
            text: paper.abstract,
            spacing: { after: 200 }
        })
    );

    // Sections
    for (const section of paper.sections) {
        children.push(
            new Paragraph({
                text: section.heading,
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 100 }
            })
        );

        // Split content into paragraphs
        const paragraphs = section.content.split('\n').filter(p => p.trim());
        paragraphs.forEach(para => {
            children.push(
                new Paragraph({
                    text: para.trim(),
                    spacing: { after: 100 }
                })
            );
        });
    }

    // Conclusion
    children.push(
        new Paragraph({
            text: 'Conclusion',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
        })
    );
    children.push(
        new Paragraph({
            text: paper.conclusion,
            spacing: { after: 200 }
        })
    );

    // Development Ideas
    children.push(
        new Paragraph({
            text: 'Future Development Ideas',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
        })
    );

    paper.developmentIdeas.forEach((idea, index) => {
        children.push(
            new Paragraph({
                text: `${index + 1}. ${idea}`,
                spacing: { after: 100 },
                indent: { left: 720 } // indent bullet points
            })
        );
    });

    // Create document
    const doc = new Document({
        sections: [{
            properties: {},
            children: children
        }]
    });

    // Generate and save
    const blob = await Packer.toBlob(doc);
    const fileName = `${sanitizeFilename(paper.title)}.docx`;
    downloadBlob(blob, fileName);
}

/**
 * Export research paper as Markdown (README)
 */
export function exportAsMarkdown(paper: ResearchPaper): void {
    let markdown = '';

    // Title
    markdown += `# ${paper.title}\n\n`;

    // Abstract
    markdown += `## Abstract\n\n${paper.abstract}\n\n`;

    // Sections
    for (const section of paper.sections) {
        markdown += `## ${section.heading}\n\n${section.content}\n\n`;
    }

    // Conclusion
    markdown += `## Conclusion\n\n${paper.conclusion}\n\n`;

    // Development Ideas
    markdown += `## Future Development Ideas\n\n`;
    paper.developmentIdeas.forEach((idea, index) => {
        markdown += `${index + 1}. ${idea}\n`;
    });
    markdown += '\n';

    // Image prompt as comment
    markdown += `---\n\n*AI Image Generator Prompt: ${paper.thumbnailPrompt}*\n`;

    // Save as file
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const fileName = `${sanitizeFilename(paper.title)}.md`;
    downloadBlob(blob, fileName);
}
