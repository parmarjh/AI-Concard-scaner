

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
    const [debugRaw, setDebugRaw] = useState<string | null>(null); // Debug state

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic.trim()) return;

        setIsGenerating(true);
        setError(null);
        setPaper(null);
        setDebugRaw(null);

        try {
            const result = await generateResearchPaper(topic);
            setPaper(result);
        } catch (err: any) {
            console.error(err);
            setError(err.message);
            // Attempt to capture raw response if possible (requires modifying generator to return it on error, simplified here)
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="animate-fadeIn max-w-5xl mx-auto pb-20">
            <header className="mb-12 text-center">
                <div className="inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-indigo-100 shadow-sm">
                    <FileTextIcon className="w-4 h-4 mr-2" />
                    AI Research Engine
                </div>
                <h1 className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tighter mb-4">
                    Advanced Research Assistant
                </h1>
                <p className="text-slate-500 text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                    Unlock profound insights. Generate comprehensive research papers and development roadmaps instantly.
                </p>
            </header>

            <div className="glass border border-white/40 p-8 rounded-[40px] shadow-2xl mb-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <form onSubmit={handleGenerate} className="flex flex-col md:flex-row gap-4">
                    <div className="flex-grow relative group">
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="Enter a research topic (e.g., 'Future of Mars Colonization')"
                            className="w-full pl-14 pr-6 py-5 bg-white/50 border border-slate-200 rounded-3xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-lg font-medium placeholder:text-slate-400 group-hover:border-indigo-300 shadow-inner"
                            disabled={isGenerating}
                        />
                        <SearchIcon className="absolute left-5 top-5.5 w-7 h-7 text-indigo-400 opacity-60 group-focus-within:opacity-100 transition-opacity" />
                    </div>
                    <button
                        type="submit"
                        disabled={isGenerating || !topic.trim()}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 px-10 rounded-3xl shadow-[0_10px_30px_rgba(79,70,229,0.3)] hover:shadow-[0_15px_35px_rgba(79,70,229,0.4)] transition-all disabled:opacity-70 flex items-center justify-center transform hover:-translate-y-1 active:scale-95"
                    >
                        {isGenerating ? (
                            <>
                                <SpinnerIcon className="w-6 h-6 mr-3 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                Generate Insight
                            </>
                        )}
                    </button>
                </form>
                {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-medium flex items-center">
                        <span className="mr-2">⚠️</span> {error}
                    </div>
                )}

                {!paper && !isGenerating && (
                    <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {['Quantum Computing', 'Sustainble Energy', 'Neural Interfaces'].map((t) => (
                            <button
                                key={t}
                                onClick={() => setTopic(t)}
                                className="px-4 py-3 bg-indigo-50/50 hover:bg-indigo-100/50 text-indigo-600 rounded-2xl text-sm font-bold transition-all border border-indigo-100/50 text-center"
                            >
                                Try "{t}"
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {paper && (
                <div className="glass border border-white/40 rounded-[40px] shadow-2xl overflow-hidden animate-slideUp">
                    <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-12 md:p-16 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] -mr-48 -mt-48"></div>
                        <div className="relative z-10">
                            <span className="bg-indigo-500 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em] mb-6 inline-block shadow-lg">Professional Manuscript</span>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-8 leading-tight tracking-tight">{paper.title}</h1>
                            <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/10">
                                <p className="text-indigo-100 italic text-xl leading-relaxed font-serif opacity-90">{paper.abstract}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 md:p-16 space-y-16">
                        {paper.sections.map((section, idx) => (
                            <section key={idx} className="relative group">
                                <div className="absolute -left-8 top-0 bottom-0 w-1 bg-indigo-100 rounded-full group-hover:bg-indigo-500 transition-colors"></div>
                                <h2 className="text-3xl font-black text-slate-800 mb-6 flex items-center">
                                    <span className="text-indigo-200 mr-4 font-serif text-5xl opacity-50">0{idx + 1}</span>
                                    {section.heading}
                                </h2>
                                <div className="prose prose-indigo max-w-none text-slate-600 text-lg leading-loose whitespace-pre-line font-medium">
                                    {section.content}
                                </div>
                            </section>
                        ))}

                        <section className="bg-indigo-50/50 p-10 rounded-[32px] border border-indigo-100 shadow-inner">
                            <h2 className="text-2xl font-black text-slate-800 mb-4 flex items-center">
                                <span className="mr-3 text-indigo-500">◈</span> Conclusion
                            </h2>
                            <p className="text-slate-700 text-lg font-medium leading-relaxed italic">{paper.conclusion}</p>
                        </section>

                        <section>
                            <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-8 flex items-center">
                                <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center mr-4 shadow-inner">
                                    <span className="text-2xl">🚀</span>
                                </div>
                                Future Development Roadmap
                            </h2>
                            <div className="grid md:grid-cols-3 gap-6">
                                {paper.developmentIdeas.map((idea, i) => (
                                    <div key={i} className="glass p-8 rounded-[32px] border border-white/60 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 relative group overflow-hidden">
                                        <div className="absolute -right-4 -bottom-4 text-8xl font-black text-indigo-500/5 group-hover:text-indigo-500/10 transition-colors">{i + 1}</div>
                                        <p className="text-slate-700 font-bold text-lg relative z-10 leading-snug">{idea}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="pt-12 border-t border-slate-100">
                            <h2 className="text-2xl font-black text-slate-800 mb-8 flex items-center">
                                <DownloadIcon className="w-8 h-8 mr-3 text-indigo-500" />
                                Export Options
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <button
                                    onClick={() => exportAsPDF(paper)}
                                    className="flex items-center justify-center gap-3 px-8 py-5 bg-white hover:bg-red-50 text-red-600 font-black rounded-3xl shadow-lg border border-red-50 transition-all hover:scale-105 active:scale-95 group"
                                >
                                    <DownloadIcon className="w-6 h-6 group-hover:translate-y-0.5 transition-transform" />
                                    PDF
                                </button>
                                <button
                                    onClick={() => exportAsDOCX(paper)}
                                    className="flex items-center justify-center gap-3 px-8 py-5 bg-white hover:bg-blue-50 text-blue-600 font-black rounded-3xl shadow-lg border border-blue-50 transition-all hover:scale-105 active:scale-95 group"
                                >
                                    <DownloadIcon className="w-6 h-6 group-hover:translate-y-0.5 transition-transform" />
                                    Word
                                </button>
                                <button
                                    onClick={() => exportAsMarkdown(paper)}
                                    className="flex items-center justify-center gap-3 px-8 py-5 bg-white hover:bg-slate-50 text-slate-600 font-black rounded-3xl shadow-lg border border-slate-50 transition-all hover:scale-105 active:scale-95 group"
                                >
                                    <FileTextIcon className="w-6 h-6 group-hover:translate-y-0.5 transition-transform" />
                                    Markdown
                                </button>
                            </div>
                        </section>

                        <div className="p-8 bg-slate-50 rounded-3xl text-xs text-slate-400 font-medium">
                            <strong className="block uppercase tracking-widest text-slate-500 mb-2 font-black">Visual Synthesis Core:</strong>
                            {paper.thumbnailPrompt}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResearchPage;
