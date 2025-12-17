

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SpinnerIcon, FileTextIcon, SearchIcon, DownloadIcon } from '../components/icons';
import { generateResearchPaper, ResearchPaper } from '../utils/geminiGenerator';
import { exportAsPDF, exportAsDOCX, exportAsMarkdown } from '../utils/exportResearch';

const ResearchPage: React.FC = () => {
    const { t } = useTranslation();
    const [topic, setTopic] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [paper, setPaper] = useState<ResearchPaper | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic.trim()) return;

        setIsGenerating(true);
        setError(null);
        setPaper(null);

        try {
            const result = await generateResearchPaper(topic);
            setPaper(result);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="animate-fadeIn max-w-4xl mx-auto pb-12">
            <header className="mb-8 text-center">
                <h1 className="text-4xl font-bold text-primary mb-2">AI Research Assistant</h1>
                <p className="text-neutral-dark">Generate comprehensive research papers, outlines, and development ideas instantly.</p>
            </header>

            <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
                <form onSubmit={handleGenerate} className="flex gap-4">
                    <div className="flex-grow relative">
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="Enter a research topic (e.g., 'Quantum Computing in Healthcare')"
                            className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                            disabled={isGenerating}
                        />
                        <SearchIcon className="absolute left-3 top-3.5 w-5 h-5 text-neutral" />
                    </div>
                    <button
                        type="submit"
                        disabled={isGenerating || !topic.trim()}
                        className="bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-8 rounded-lg shadow transition-colors disabled:opacity-70 flex items-center"
                    >
                        {isGenerating ? (
                            <>
                                <SpinnerIcon className="w-5 h-5 mr-2" />
                                Researching...
                            </>
                        ) : (
                            <>
                                Generate Paper
                            </>
                        )}
                    </button>
                </form>
                {error && <p className="text-red-500 mt-3 text-sm">{error}</p>}
            </div>

            {paper && (
                <div className="bg-white rounded-xl shadow-xl overflow-hidden animate-slideUp">

                    {/* Header / Thumbnail Section */}
                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-8 relative overflow-hidden">
                        <div className="relative z-10">
                            <span className="bg-blue-500 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide mb-2 inline-block">Research Paper</span>
                            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4">{paper.title}</h1>
                            <p className="text-gray-300 italic text-lg opacity-90 border-l-4 border-blue-500 pl-4">{paper.abstract}</p>
                        </div>
                        {/* Decorative background circle */}
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500 rounded-full opacity-10 blur-3xl"></div>
                    </div>

                    <div className="p-8 md:p-12 space-y-8">

                        {/* Sections */}
                        {paper.sections.map((section, idx) => (
                            <section key={idx}>
                                <h2 className="text-2xl font-bold text-gray-800 mb-3 border-b pb-2">{section.heading}</h2>
                                <div className="prose text-gray-600 leading-relaxed whitespace-pre-line">
                                    {section.content}
                                </div>
                            </section>
                        ))}

                        {/* Conclusion */}
                        <section className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800 mb-2">Conclusion</h2>
                            <p className="text-gray-700">{paper.conclusion}</p>
                        </section>

                        {/* Development Ideas */}
                        <section>
                            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-4 flex items-center">
                                <span className="mr-2">🚀</span> Future Development Ideas
                            </h2>
                            <div className="grid md:grid-cols-3 gap-4">
                                {paper.developmentIdeas.map((idea, i) => (
                                    <div key={i} className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                        <span className="text-4xl text-gray-200 font-bold absolute -mt-2 -ml-2 -z-10">{i + 1}</span>
                                        <p className="text-gray-700 font-medium relative">{idea}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Download Options */}
                        <section className="mt-8">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                <DownloadIcon className="w-6 h-6 mr-2 text-primary" />
                                Download Research Paper
                            </h2>
                            <div className="grid md:grid-cols-3 gap-4">
                                <button
                                    onClick={() => exportAsPDF(paper)}
                                    className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition-all hover:shadow-lg"
                                >
                                    <DownloadIcon className="w-5 h-5" />
                                    Download PDF
                                </button>
                                <button
                                    onClick={() => exportAsDOCX(paper)}
                                    className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all hover:shadow-lg"
                                >
                                    <DownloadIcon className="w-5 h-5" />
                                    Download DOCX
                                </button>
                                <button
                                    onClick={() => exportAsMarkdown(paper)}
                                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-800 text-white font-semibold rounded-lg shadow-md transition-all hover:shadow-lg"
                                >
                                    <FileTextIcon className="w-5 h-5" />
                                    Download Markdown
                                </button>
                            </div>
                        </section>

                        {/* Thumbnail Prompt Info */}
                        <div className="mt-8 pt-6 border-t border-gray-100 text-xs text-gray-400">
                            <strong className="block uppercase tracking-wider mb-1">AI Image Generator Prompt:</strong>
                            {paper.thumbnailPrompt}
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default ResearchPage;
