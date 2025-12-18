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
        <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 border border-neutral-200">
            {/* Search Section */}
            <div className="relative w-full md:w-1/3 order-2 md:order-1">
                <input
                    type="text"
                    placeholder={t('dashboard.searchPlaceholder') || "Find contacts..."}
                    className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition-shadow bg-neutral-light/30"
                    value={searchTerm}
                    onChange={(e) => onSearch(e.target.value)}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral">
                    <SearchIcon className="w-5 h-5" />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 order-1 md:order-2">
                <Link
                    to="/dashboard"
                    className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-neutral-light min-w-[60px] transition-colors group"
                    title="Home"
                >
                    <div className="bg-indigo-100 p-2 rounded-full mb-1 group-hover:bg-indigo-200 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-primary">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                        </svg>
                    </div>
                    <span className="text-xs font-medium text-neutral-dark">Home</span>
                </Link>

                <Link
                    to="/research"
                    className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-neutral-light min-w-[60px] transition-colors group"
                    title="Gemini AI"
                >
                    <div className="bg-purple-100 p-2 rounded-full mb-1 group-hover:bg-purple-200 transition-colors">
                        <StarIcon className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="text-xs font-medium text-neutral-dark">Gemini</span>
                </Link>

                {/* Since Settings is usually Admin or Profile, linking to Admin for now as per Navbar logic */}
                <Link
                    to="/admin"
                    className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-neutral-light min-w-[60px] transition-colors group"
                    title="Settings"
                >
                    <div className="bg-gray-100 p-2 rounded-full mb-1 group-hover:bg-gray-200 transition-colors">
                        <SettingsIcon className="w-5 h-5 text-gray-600" />
                    </div>
                    <span className="text-xs font-medium text-neutral-dark">Setting</span>
                </Link>

                <button
                    onClick={onExport}
                    className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-neutral-light min-w-[60px] transition-colors group focus:outline-none"
                    title="Save List"
                >
                    <div className="bg-emerald-100 p-2 rounded-full mb-1 group-hover:bg-emerald-200 transition-colors">
                        <DownloadIcon className="w-5 h-5 text-emerald-600" />
                    </div>
                    <span className="text-xs font-medium text-neutral-dark">Save</span>
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
                    className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-neutral-light min-w-[60px] transition-colors group focus:outline-none"
                    title="Share App"
                >
                    <div className="bg-blue-100 p-2 rounded-full mb-1 group-hover:bg-blue-200 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-blue-600">
                            <path fillRule="evenodd" d="M15.75 4.5a3 3 0 1 1 .825 2.066l-8.421 4.679a3.002 3.002 0 0 1 0 1.51l8.421 4.679a3 3 0 1 1-.729 1.31l-8.421-4.678a3 3 0 1 1 0-4.132l8.421-4.679a3 3 0 0 1-.096-.755Z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <span className="text-xs font-medium text-neutral-dark">Share</span>
                </button>

            </div>
        </div>
    );
};

export default ActionToolbar;
