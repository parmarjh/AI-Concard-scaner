import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PlusIcon, SearchIcon, InfoIcon } from '../components/icons';
import AddCardModal from '../components/AddCardModal';
import ContactCard from '../components/ContactCard';
import { Contact } from '../types';

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>(() => {
    try {
      const savedContacts = localStorage.getItem('contacts');
      return savedContacts ? JSON.parse(savedContacts) : [];
    } catch (error) {
      console.error("Error loading contacts from localStorage", error);
      return [];
    }
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('contacts', JSON.stringify(contacts));
    } catch (error) {
      console.error("Error saving contacts to localStorage", error);
    }
  }, [contacts]);

  const handleAddContact = (newContact: Contact) => {
    setContacts(prevContacts => [...prevContacts, newContact]);
    setIsModalOpen(false); // Close modal after adding
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (contact.company && contact.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (contact.title && contact.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="animate-fadeIn">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-primary">{t('dashboard.title')}</h1>
        <p className="text-neutral-dark mt-2">{t('dashboard.subtitle')}</p>
      </header>

      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-1/2 md:w-1/3">
          <input
            type="text"
            placeholder={t('dashboard.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition-shadow"
            aria-label={t('dashboard.searchLabel')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral">
            <SearchIcon className="w-5 h-5" />
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out flex items-center transform hover:scale-105"
          aria-label={t('dashboard.addNewCard')}
        >
          <PlusIcon className="w-5 h-5 mr-2" /> {t('dashboard.addNewCard')}
        </button>
      </div>

      {contacts.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow-xl text-center">
          <h2 className="text-2xl font-semibold text-neutral-dark mb-3">{t('dashboard.noContactsTitle')}</h2>
          <p className="text-neutral mb-6">{t('dashboard.noContactsMessage')}</p>
          <img src="https://illustrations.popsy.co/red/graphic-design.svg" alt="No contacts illustration" className="mx-auto mt-4 w-1/2 max-w-xs" />
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-8 bg-secondary hover:bg-emerald-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            {t('dashboard.addFirstCard')}
          </button>
        </div>
      ) : (
        filteredContacts.length === 0 && searchTerm ? (
            <div className="bg-white p-8 rounded-xl shadow-xl text-center">
                <InfoIcon className="w-16 h-16 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-neutral-dark mb-3">{t('dashboard.noResultsTitle')}</h2>
                <p className="text-neutral">{t('dashboard.noResultsMessage', { searchTerm })}</p>
            </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContacts.map(contact => (
              <ContactCard key={contact.id} contact={contact} />
            ))}
          </div>
        )
      )}

      {isModalOpen && (
        <AddCardModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleAddContact}
        />
      )}
    </div>
  );
};

export default DashboardPage;