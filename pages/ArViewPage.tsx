import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArIcon, InfoIcon, SpinnerIcon } from '../components/icons';
import { Contact } from '../types';

const ArViewPage: React.FC = () => {
  const { t } = useTranslation();
  const { contactId } = useParams<{ contactId: string }>();
  const [contact, setContact] = useState<Contact | null | undefined>(undefined);

  useEffect(() => {
    try {
      const savedContacts = localStorage.getItem('contacts');
      if (savedContacts) {
        const contacts: Contact[] = JSON.parse(savedContacts);
        const foundContact = contacts.find(c => c.id === contactId);
        setContact(foundContact || null);
      } else {
        setContact(null); // No contacts saved at all
      }
    } catch (error) {
      console.error("Error loading contact from localStorage", error);
      setContact(null);
    }
  }, [contactId]);

  if (contact === undefined) {
    return (
      <div className="text-center py-10 flex flex-col items-center">
        <SpinnerIcon className="w-12 h-12 text-primary animate-spin-slow mb-4" />
        <h2 className="text-2xl font-semibold text-neutral-dark">{t('arView.loading')}</h2>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold text-red-600">{t('arView.notFound')}</h2>
        <p className="text-neutral-dark">{t('arView.notFoundMessage')}</p>
        <Link to="/dashboard" className="mt-4 inline-block bg-primary text-white px-4 py-2 rounded hover:bg-indigo-700">
          {t('arView.backToDashboard')}
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn max-w-6xl mx-auto px-4 pb-12">
      <header className="mb-12">
        <div className="inline-flex items-center px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-emerald-100 shadow-sm">
          <ArIcon className="w-4 h-4 mr-2" />
          AR Vision Active
        </div>
        <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-indigo-600 tracking-tight">
          {t('arView.title', { name: contact.name })}
        </h1>
        <p className="text-slate-500 font-medium text-lg mt-2">{t('arView.subtitle')}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Holographic Display Card */}
        <div className="relative group bg-slate-900 aspect-[1.586] rounded-[40px] shadow-2xl overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 mix-blend-overlay"></div>

          {contact.cardImageUrl ? (
            <img
              src={contact.cardImageUrl}
              alt={`${contact.name}'s business card`}
              className="absolute inset-0 w-full h-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-indigo-950 to-slate-900 flex items-center justify-center">
              <ArIcon className="w-32 h-32 text-indigo-500 opacity-20 animate-pulse" />
            </div>
          )}

          {/* Scanning Animation */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_rgba(34,211,238,0.8)] animate-scan z-20"></div>

          {/* Simulated AR Holographic Overlays */}
          <div className="absolute top-8 left-8 p-6 glass-dark rounded-3xl border border-white/10 shadow-2xl animate-slideRight">
            <h3 className="text-2xl font-black text-white leading-tight">{contact.name}</h3>
            <p className="text-indigo-300 font-bold uppercase tracking-widest text-xs mt-1">{contact.title}</p>
            <div className="h-px w-8 bg-indigo-500 mt-4 mb-2"></div>
            <p className="text-white/80 text-sm font-medium">{contact.company}</p>
          </div>

          <div className="absolute bottom-8 right-8 p-6 glass-dark rounded-3xl border border-white/10 shadow-2xl animate-slideLeft">
            <div className="space-y-2 text-xs font-bold text-white/90">
              {contact.email?.[0] && <div className="flex items-center"><span className="text-indigo-400 mr-2">@</span> {contact.email[0]}</div>}
              {contact.phone?.[0] && <div className="flex items-center"><span className="text-indigo-400 mr-2">☏</span> {contact.phone[0]}</div>}
              {contact.website && (
                <div className="flex items-center">
                  <span className="text-indigo-400 mr-2">🌐</span>
                  <span className="text-cyan-300 truncate">{contact.website.replace(/^https?:\/\//, '')}</span>
                </div>
              )}
            </div>
          </div>

          <div className="absolute inset-0 border-[10px] border-white/5 rounded-[40px] pointer-events-none"></div>
        </div>

        {/* Detailed Info Section */}
        <div className="glass border border-white/40 p-10 rounded-[40px] shadow-2xl space-y-8 animate-slideUp">
          <header className="flex items-center justify-between">
            <h2 className="text-3xl font-black text-slate-800 flex items-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center mr-4 shadow-inner">
                <InfoIcon className="w-6 h-6 text-indigo-600" />
              </div>
              Metadata Info
            </h2>
          </header>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/40 p-4 rounded-2xl border border-white/20">
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Name</span>
                <p className="text-slate-800 font-bold">{contact.name}</p>
              </div>
              <div className="bg-white/40 p-4 rounded-2xl border border-white/20">
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Company</span>
                <p className="text-slate-800 font-bold">{contact.company || '—'}</p>
              </div>
            </div>

            <div className="bg-white/40 p-4 rounded-2xl border border-white/20">
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Role</span>
              <p className="text-slate-800 font-bold">{contact.title || '—'}</p>
            </div>

            <div className="space-y-4">
              {contact.email && contact.email.length > 0 && (
                <div className="flex items-center bg-white/40 p-4 rounded-2xl border border-white/20">
                  <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center mr-4 shrink-0 font-black text-indigo-600 shadow-inner">@</div>
                  <p className="text-slate-700 font-medium truncate">{contact.email.join(', ')}</p>
                </div>
              )}
              {contact.phone && contact.phone.length > 0 && (
                <div className="flex items-center bg-white/40 p-4 rounded-2xl border border-white/20">
                  <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center mr-4 shrink-0 font-black text-indigo-600 shadow-inner">☏</div>
                  <p className="text-slate-700 font-medium truncate">{contact.phone.join(', ')}</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex gap-4">
            <Link to="/dashboard" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-xl transition-all shadow-indigo-200 text-center">
              {t('arView.backToDashboard')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArViewPage;