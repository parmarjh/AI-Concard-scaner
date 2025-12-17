import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import { ResearchPaper } from './geminiGenerator';

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
    const fileName = `${paper.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
    doc.save(fileName);
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
    const fileName = `${paper.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.docx`;
    saveAs(blob, fileName);
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
    const fileName = `${paper.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    saveAs(blob, fileName);
}
