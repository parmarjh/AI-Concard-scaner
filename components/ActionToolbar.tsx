import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SearchIcon, StarIcon, SettingsIcon, UserIcon, FileTextIcon, DownloadIcon } from './icons';

interface ActionToolbarProps {
    onSearch: (term: string) => void;
    searchTerm: string;
    onExport: () => void;
}

const ActionToolbar: React.FC<ActionToolbarProps> = ({ onSearch, searchTerm, onExport }) => {
    const { t } = useTranslation();

    return (
        <div className="glass border border-white/40 p-5 mb-10 flex flex-col md:flex-row items-center justify-between gap-6 rounded-[32px] shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-24 h-24 bg-indigo-500/5 rounded-full -ml-12 -mt-12 blur-2xl"></div>

            {/* Search Section */}
            <div className="relative w-full md:w-1/3 order-2 md:order-1 group">
                <input
                    type="text"
                    placeholder={t('dashboard.searchPlaceholder') || "Find contacts..."}
                    className="w-full pl-14 pr-6 py-4 bg-white/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-slate-700 font-medium placeholder:text-slate-400 group-hover:border-indigo-300 shadow-inner"
                    value={searchTerm}
                    onChange={(e) => onSearch(e.target.value)}
                />
                <div className="absolute left-5 top-1/2 transform -translate-y-1/2 text-indigo-400 opacity-60 group-focus-within:opacity-100 transition-opacity">
                    <SearchIcon className="w-6 h-6" />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 md:gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 order-1 md:order-2 hide-scrollbar">
                <Link
                    to="/dashboard"
                    className="flex flex-col items-center justify-center p-3 rounded-2xl hover:bg-white hover:shadow-lg transition-all min-w-[70px] group transform hover:-translate-y-1"
                    title="Home"
                >
                    <div className="bg-indigo-50 p-2.5 rounded-xl mb-1.5 group-hover:bg-indigo-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-indigo-600 group-hover:text-white transition-colors">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                        </svg>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-indigo-600 transition-colors">Home</span>
                </Link>

                <Link
                    to="/research"
                    className="flex flex-col items-center justify-center p-3 rounded-2xl hover:bg-white hover:shadow-lg transition-all min-w-[70px] group transform hover:-translate-y-1"
                    title="Gemini AI"
                >
                    <div className="bg-purple-50 p-2.5 rounded-xl mb-1.5 group-hover:bg-purple-600 transition-colors">
                        <StarIcon className="w-5 h-5 text-purple-600 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-purple-600 transition-colors">Gemini</span>
                </Link>

                <Link
                    to="/admin"
                    className="flex flex-col items-center justify-center p-3 rounded-2xl hover:bg-white hover:shadow-lg transition-all min-w-[70px] group transform hover:-translate-y-1"
                    title="Settings"
                >
                    <div className="bg-slate-50 p-2.5 rounded-xl mb-1.5 group-hover:bg-slate-600 transition-colors">
                        <SettingsIcon className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-600 transition-colors">Admin</span>
                </Link>

                <button
                    onClick={onExport}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl hover:bg-white hover:shadow-lg transition-all min-w-[70px] group transform hover:-translate-y-1"
                    title="Save List"
                >
                    <div className="bg-emerald-50 p-2.5 rounded-xl mb-1.5 group-hover:bg-emerald-600 transition-colors">
                        <DownloadIcon className="w-5 h-5 text-emerald-600 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-emerald-600 transition-colors">Export</span>
                </button>

                <button
                    onClick={() => {
                        if (navigator.share) {
                            navigator.share({
                                title: 'AI Concard Scanner',
                                text: 'Check out my contacts!',
                                url: window.location.href,
                            }).catch(console.error);
                        } else {
                            alert("Share feature is not supported on this browser context.");
                        }
                    }}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl hover:bg-white hover:shadow-lg transition-all min-w-[70px] group transform hover:-translate-y-1"
                    title="Share App"
                >
                    <div className="bg-blue-50 p-2.5 rounded-xl mb-1.5 group-hover:bg-blue-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors">
                            <path fillRule="evenodd" d="M15.75 4.5a3 3 0 1 1 .825 2.066l-8.421 4.679a3.002 3.002 0 0 1 0 1.51l8.421 4.679a3 3 0 1 1-.729 1.31l-8.421-4.678a3 3 0 1 1 0-4.132l8.421-4.679a3 3 0 0 1-.096-.755Z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-blue-600 transition-colors">Share</span>
                </button>
            </div>
        </div>
    );
};

export default ActionToolbar;
