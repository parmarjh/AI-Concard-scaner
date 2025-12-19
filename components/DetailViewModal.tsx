
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Contact } from '../types';
import { CloseIcon, UserIcon, MapPinIcon, GlobeIcon, DocumentIcon, StarIcon } from './icons';

interface DetailViewModalProps {
    contact: Contact | null;
    isOpen: boolean;
    onClose: () => void;
}

const DetailViewModal: React.FC<DetailViewModalProps> = ({ contact, isOpen, onClose }) => {
    const { t } = useTranslation();

    if (!isOpen || !contact) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[110] animate-fadeIn">
            <div className="glass-dark border border-white/10 rounded-[40px] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-zoomIn">
                <header className="flex items-center justify-between p-8 border-b border-white/5">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 shadow-lg">
                            {contact.cardImageUrl ? (
                                <img src={contact.cardImageUrl} alt={contact.name} className="w-full h-full object-cover rounded-2xl" />
                            ) : (
                                <UserIcon className="w-8 h-8 text-indigo-400" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white tracking-tight">{contact.name}</h2>
                            <p className="text-indigo-300/60 text-sm font-bold uppercase tracking-widest mt-1">
                                {contact.title} {contact.company ? `@ ${contact.company}` : ''}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-2xl transition-all"
                    >
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </header>

                <main className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Contact Info Group */}
                        <div className="space-y-6">
                            <SectionLabel label="Contact Channels" />
                            <InfoRow icon="✉️" label="Email" value={contact.email?.join(', ')} />
                            <InfoRow icon="📞" label="Phone" value={contact.phone?.join(', ')} />
                            <InfoRow icon={<GlobeIcon className="w-5 h-5 text-indigo-400" />} label="Website" value={contact.website} isLink />
                        </div>

                        {/* Logistics Group */}
                        <div className="space-y-6">
                            <SectionLabel label="Logistics" />
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center shrink-0 border border-white/5">
                                    <MapPinIcon className="w-5 h-5 text-indigo-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Address</p>
                                    <p className="text-white font-medium leading-relaxed">{contact.address || 'No address provided'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Full Notes Section */}
                        <div className="col-span-full space-y-4">
                            <SectionLabel label="Professional Notes" />
                            <div className="p-6 bg-white/5 border border-white/5 rounded-3xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <DocumentIcon className="w-20 h-20 text-white" />
                                </div>
                                <p className="text-slate-300 font-medium whitespace-pre-wrap leading-relaxed relative z-10">
                                    {contact.notes || 'No notes added for this contact.'}
                                </p>
                            </div>
                        </div>

                        {/* Metadata */}
                        <div className="col-span-full pt-4 flex items-center justify-between text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                            <div className="flex items-center gap-2">
                                <span>Created: {new Date(contact.createdAt).toLocaleDateString()}</span>
                                <span>•</span>
                                <span>Modified: {new Date(contact.updatedAt).toLocaleDateString()}</span>
                            </div>
                            {contact.isFavorite && (
                                <div className="flex items-center gap-1 text-amber-400">
                                    <StarIcon className="w-3 h-3" filled />
                                    <span>Favorite</span>
                                </div>
                            )}
                        </div>
                    </div>
                </main>

                <footer className="p-8 bg-white/5 border-t border-white/5 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-lg transition-all transform hover:-translate-y-1 active:scale-95"
                    >
                        DONE
                    </button>
                </footer>
            </div>
        </div>
    );
};

const SectionLabel = ({ label }: { label: string }) => (
    <h3 className="text-slate-400 text-xs font-black uppercase tracking-[3px] border-l-2 border-indigo-500 pl-3 py-1">
        {label}
    </h3>
);

const InfoRow = ({ icon, label, value, isLink }: { icon: any, label: string, value?: string, isLink?: boolean }) => {
    if (!value) return null;
    return (
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center shrink-0 border border-white/5 text-lg">
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-0.5">{label}</p>
                {isLink ? (
                    <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noopener noreferrer" className="text-indigo-400 font-bold truncate block hover:underline">
                        {value}
                    </a>
                ) : (
                    <p className="text-white font-bold truncate">{value}</p>
                )}
            </div>
        </div>
    );
};

export default DetailViewModal;
