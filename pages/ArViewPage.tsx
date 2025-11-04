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
    <div className="animate-fadeIn">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-primary flex items-center">
          <ArIcon className="w-8 h-8 mr-3 text-secondary" />
          {t('arView.title', { name: contact.name })}
        </h1>
        <p className="text-neutral-dark mt-1">{t('arView.subtitle')}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="relative group bg-white p-6 rounded-xl shadow-2xl overflow-hidden aspect-[1.586]  mx-auto w-full max-w-lg"> {/* Aspect ratio of a typical business card */}
          {contact.cardImageUrl ? (
            <img 
              src={contact.cardImageUrl} 
              alt={`${contact.name}'s business card`} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                 <ArIcon className="w-24 h-24 text-white opacity-20" />
            </div>
          )}
          <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-10 transition-opacity duration-300"></div>
          
          {/* Simulated AR Overlay */}
          <div className="absolute top-4 left-4 p-3 bg-gradient-to-br from-primary/80 to-secondary/80 backdrop-blur-sm rounded-lg text-white shadow-lg">
            <h3 className="text-xl font-bold">{contact.name}</h3>
            <p className="text-sm">{contact.title}</p>
            <p className="text-sm font-semibold">{contact.company}</p>
          </div>
          <div className="absolute bottom-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded text-xs text-neutral-dark shadow-md">
            <p>{contact.email?.[0]}</p>
            <p>{contact.phone?.[0]}</p>
            {contact.website && <a href={`http://${contact.website}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{contact.website}</a>}
          </div>
           <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <ArIcon className="w-20 h-20 text-white opacity-50" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-xl space-y-3">
          <h2 className="text-2xl font-semibold text-neutral-dark mb-3 border-b pb-2 flex items-center">
            <InfoIcon className="w-6 h-6 mr-2 text-primary" /> {t('arView.detailsTitle')}
          </h2>
          <p><strong>{t('addCardModal.form.name')}:</strong> {contact.name}</p>
          <p><strong>{t('addCardModal.form.title')}:</strong> {contact.title || t('arView.notAvailable')}</p>
          <p><strong>{t('addCardModal.form.company')}:</strong> {contact.company || t('arView.notAvailable')}</p>
          <p><strong>{t('addCardModal.form.email')}:</strong> {contact.email?.join(', ') || t('arView.notAvailable')}</p>
          <p><strong>{t('addCardModal.form.phone')}:</strong> {contact.phone?.join(', ') || t('arView.notAvailable')}</p>
          <p><strong>{t('addCardModal.form.website')}:</strong> {contact.website ? <a href={`http://${contact.website}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{contact.website}</a> : t('arView.notAvailable')}</p>
          <Link to="/dashboard" className="mt-6 inline-block bg-secondary text-white px-6 py-2 rounded-lg hover:bg-opacity-80 transition-colors">
           {t('arView.backToDashboard')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ArViewPage;