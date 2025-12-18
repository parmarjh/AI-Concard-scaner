
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Contact } from '../types';
import ContactQRCode from './ContactQRCode';
import { ArIcon, EditIcon, DeleteIcon, UserIcon, StarIcon, QrCodeIcon, GoogleIcon, SpinnerIcon } from './icons';
import { saveToGoogleContacts } from '../utils/googleContacts';

interface ContactCardProps {
  contact: Contact;
  onEdit?: (contact: Contact) => void;
  onDelete?: (id: string) => void;
}

const ContactCard: React.FC<ContactCardProps> = ({ contact, onEdit, onDelete }) => {
  const { t } = useTranslation();
  const [showQR, setShowQR] = React.useState(false);
  const [isSavingGoogle, setIsSavingGoogle] = React.useState(false);

  const handleGoogleSave = async () => {
    if (isSavingGoogle) return;
    setIsSavingGoogle(true);
    const result = await saveToGoogleContacts(contact);
    alert(result.message);
    setIsSavingGoogle(false);
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
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out overflow-hidden flex flex-col">
      <div className="p-5 flex-grow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            {contact.cardImageUrl ? (
              <img src={contact.cardImageUrl} alt={contact.name} className="w-12 h-12 rounded-full mr-3 object-cover border-2 border-primary/20" />
            ) : (
              <div className="w-12 h-12 rounded-full mr-3 bg-primary/10 flex items-center justify-center text-primary">
                <UserIcon className="w-6 h-6" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-primary truncate" title={contact.name}>{contact.name}</h3>
              {contact.title && <p className="text-sm text-neutral-dark truncate" title={contact.title}>{contact.title}</p>}
            </div>
          </div>
        </div>

        {contact.company && <p className="text-sm font-medium text-secondary mb-2 truncate" title={contact.company}>{contact.company}</p>}

        <div className="space-y-1 text-sm">
          {displayInfo("email", contact.email)}
          {displayInfo("phone", contact.phone)}
          {contact.website && (
            <p className="text-xs text-neutral truncate">
              <span className="font-medium">{t('contactCard.website')}:</span>
              <a
                href={contact.website.startsWith('http') ? contact.website : `http://${contact.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {contact.website}
              </a>
            </p>
          )}
          {contact.address && <p className="text-xs text-neutral truncate" title={contact.address}><span className="font-medium">{t('contactCard.address')}:</span> {contact.address}</p>}
        </div>
      </div>

      <div className="bg-neutral-light/50 p-3 border-t border-neutral-200">
        <div className="flex items-center justify-end space-x-2">
          {onEdit && (
            <button
              onClick={() => onEdit(contact)}
              className="flex items-center text-xs font-medium text-neutral-dark hover:text-primary bg-white hover:bg-neutral-light border border-neutral-300 px-3 py-1.5 rounded-md transition-colors mr-2"
              title="Edit Contact"
            >
              <EditIcon className="w-4 h-4 mr-1.5" />
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => contact.id && onDelete(contact.id)}
              className="flex items-center text-xs font-medium text-red-600 hover:text-red-700 bg-white hover:bg-red-50 border border-neutral-300 px-3 py-1.5 rounded-md transition-colors mr-2"
              title="Delete Contact"
            >
              <DeleteIcon className="w-4 h-4 mr-1.5" />
              Delete
            </button>
          )}
          <button
            onClick={handleGoogleSave}
            className="flex items-center text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md transition-colors mr-2"
            title="Save to Google Contacts"
            disabled={isSavingGoogle}
          >
            {isSavingGoogle ? <SpinnerIcon className="w-4 h-4 mr-1.5" /> : <GoogleIcon className="w-4 h-4 mr-1.5" />}
            Google
          </button>
          <button
            onClick={() => setShowQR(true)}
            className="flex items-center text-xs font-medium text-primary hover:text-primary-dark bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md transition-colors mr-2"
            title="Show Barcode"
          >
            <QrCodeIcon className="w-4 h-4 mr-1.5" />
            Code
          </button>
          <Link
            to={`/ar-view/${contact.id}`}
            className="flex items-center text-xs font-medium text-secondary hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-md transition-colors"
            aria-label={t('contactCard.arViewLabel', { name: contact.name })}
          >
            <ArIcon className="w-4 h-4 mr-1.5" />
            {t('contactCard.arView')}
          </Link>
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