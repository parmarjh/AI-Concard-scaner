
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Contact } from '../types';
import ContactQRCode from './ContactQRCode';
import { ArIcon, EditIcon, DeleteIcon, UserIcon, StarIcon, QrCodeIcon, GoogleIcon, SpinnerIcon, MapPinIcon, DocumentIcon, SearchIcon } from './icons';
import { saveToGoogleContacts } from '../utils/googleContacts';

interface ContactCardProps {
  contact: Contact;
  onEdit?: (contact: Contact) => void;
  onDelete?: (id: string) => void;
  onView?: (contact: Contact) => void;
  onGenerateAvatar?: (id: string) => void;
}

const ContactCard: React.FC<ContactCardProps> = ({ contact, onEdit, onDelete, onView, onGenerateAvatar }) => {
  const { t } = useTranslation();
  const [showQR, setShowQR] = React.useState(false);
  const [isSavingGoogle, setIsSavingGoogle] = React.useState(false);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = React.useState(false);

  const handleGoogleSave = async () => {
    if (isSavingGoogle) return;
    setIsSavingGoogle(true);
    const result = await saveToGoogleContacts(contact);
    alert(result.message);
    setIsSavingGoogle(false);
  };

  const handleGenerateAIPhoto = async () => {
    if (!onGenerateAvatar || !contact.id) return;
    setIsGeneratingAvatar(true);
    await onGenerateAvatar(contact.id);
    setIsGeneratingAvatar(false);
  };

  const displayInfo = (labelKey: 'email' | 'phone' | 'website' | 'address', value?: string | string[]) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return null;
    const displayValue = Array.isArray(value) ? value.join(', ') : value;
    const label = t(`contactCard.${labelKey}`);
    return (
      <p className="text-xs text-neutral truncate">
        <span className="font-medium">{label}:</span> {displayValue}
      </p>
    );
  };

  return (
    <div
      className="glass group relative rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_rgba(99,102,241,0.2)] hover:-translate-y-2 border border-white/40"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

      <div className="p-6 relative">
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-200 blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
            {contact.cardImageUrl ? (
              <img src={contact.cardImageUrl} alt={contact.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md relative z-10" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 relative z-10">
                <UserIcon className="w-8 h-8" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xl font-bold text-slate-800 truncate leading-tight mb-1" title={contact.name}>{contact.name}</h3>
            {contact.title && <p className="text-sm font-medium text-slate-400 truncate uppercase tracking-wider">{contact.title}</p>}
          </div>
        </div>

        {contact.company && (
          <div className="mb-4 inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold uppercase tracking-widest">
            {contact.company}
          </div>
        )}

        <div className="space-y-3">
          {contact.email && contact.email.length > 0 && (
            <div className="flex items-center text-sm text-slate-500">
              <span className="w-5 h-5 mr-3 flex items-center justify-center text-indigo-400 font-bold shrink-0">@</span>
              <span className="truncate">{contact.email[0]}</span>
            </div>
          )}
          {contact.phone && contact.phone.length > 0 && (
            <div className="flex items-center text-sm text-slate-500">
              <span className="w-5 h-5 mr-3 flex items-center justify-center text-indigo-400 shrink-0">☏</span>
              <span className="truncate">{contact.phone[0]}</span>
            </div>
          )}
          {contact.website && (
            <div className="flex items-center text-sm">
              <span className="w-5 h-5 mr-3 flex items-center justify-center text-indigo-400 shrink-0">🌐</span>
              <a
                href={contact.website.startsWith('http') ? contact.website : `http://${contact.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-700 font-medium truncate"
                onClick={(e) => e.stopPropagation()}
              >
                {contact.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
          {contact.address && (
            <div className="flex items-start text-sm text-slate-500">
              <span className="w-5 h-5 mr-3 mt-0.5 flex items-center justify-center text-indigo-400 shrink-0">
                <MapPinIcon className="w-4 h-4" />
              </span>
              <span className="line-clamp-2">{contact.address}</span>
            </div>
          )}
          {contact.notes && (
            <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 italic text-xs text-slate-500 line-clamp-2 relative group-hover:bg-indigo-50/30 transition-colors">
              <div className="flex items-center gap-1.5 mb-1">
                <DocumentIcon className="w-3 h-3 text-indigo-400" />
                <span className="font-bold uppercase tracking-widest text-[8px]">Notes</span>
              </div>
              {contact.notes}
            </div>
          )}
        </div>
      </div>

      <div className="px-6 py-4 bg-white/30 backdrop-blur-sm border-t border-white/20">
        <div className="flex items-center justify-end space-x-1">
          <button
            onClick={handleGenerateAIPhoto}
            className="p-2 text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
            title="Generate AI Photo"
            disabled={isGeneratingAvatar || !onGenerateAvatar}
          >
            {isGeneratingAvatar ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : <StarIcon className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setShowQR(true)}
            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
            title="Show QR Code"
          >
            <QrCodeIcon className="w-5 h-5" />
          </button>

          <Link
            to={`/ar-view/${contact.id}`}
            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
            title="AR View"
          >
            <ArIcon className="w-5 h-5" />
          </Link>

          <div className="h-4 w-px bg-slate-200 mx-1"></div>

          {onView && (
            <button
              onClick={() => onView(contact)}
              className="p-2 text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
              title="View Details"
            >
              <SearchIcon className="w-5 h-5" />
            </button>
          )}

          {onEdit && (
            <button
              onClick={() => onEdit(contact)}
              className="p-2 text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
              title="Edit"
            >
              <EditIcon className="w-5 h-5" />
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => contact.id && onDelete(contact.id)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
              title="Delete"
            >
              <DeleteIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <ContactQRCode
        contact={contact}
        isOpen={showQR}
        onClose={() => setShowQR(false)}
      />
    </div>
  );
};

export default ContactCard;