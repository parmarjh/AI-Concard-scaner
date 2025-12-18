import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PlusIcon, SearchIcon, InfoIcon } from '../components/icons';
import AddCardModal from '../components/AddCardModal';
import ContactCard from '../components/ContactCard';
import { Contact } from '../types';
import ActionToolbar from '../components/ActionToolbar';
import { saveAs } from 'file-saver';
import { autoGenerateAvatar } from '../utils/avatarGenerator';

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

  const handleAddContact = async (newContact: Contact) => {
    // Auto-generate avatar if no image provided
    if (!newContact.cardImageUrl) {
      const avatarUrl = await autoGenerateAvatar({ name: newContact.name });
      if (avatarUrl) {
        newContact.cardImageUrl = avatarUrl;
      }
    }
    setContacts(prevContacts => [...prevContacts, newContact]);
    setIsModalOpen(false); // Close modal after adding
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (contact.company && contact.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (contact.title && contact.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (contact.notes && contact.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleExportContacts = () => {
    if (contacts.length === 0) {
      alert("No contacts to save.");
      return;
    }
    const headers = ["Name", "Title", "Company", "Phone", "Email", "Address", "Website", "Notes"];
    const csvContent = [
      headers.join(","),
      ...contacts.map(c => [
        `"${c.name || ''}"`,
        `"${c.title || ''}"`,
        `"${c.company || ''}"`,
        `"${(c.phone || []).join('; ')}"`,
        `"${(c.email || []).join('; ')}"`,
        `"${c.address || ''}"`,
        `"${c.website || ''}"`,
        `"${c.notes || ''}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'contacts_backup.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDeleteContact = (id: string) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      setContacts(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleEditContact = (contact: Contact) => {
    // For now, prompt as a placeholder or complex implementation
    alert(`Edit functionality for ${contact.name} coming soon!`);
  };

  const handleGenerateAvatarAction = async (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;

    try {
      const avatarUrl = await autoGenerateAvatar(contact, 'personas');

      if (avatarUrl) {
        setContacts(prev => prev.map(c =>
          c.id === contactId ? { ...c, cardImageUrl: avatarUrl, updatedAt: new Date().toISOString() } : c
        ));
      }
    } catch (error) {
      console.error("Error generating avatar:", error);
    }
  };

  return (
    <div className="animate-fadeIn">
      <header className="mb-6">
        <h1 className="text-4xl font-bold text-primary">{t('dashboard.title')}</h1>
        <p className="text-neutral-dark mt-2">{t('dashboard.subtitle')}</p>
      </header>

      {/* New Action Toolbar */}
      <ActionToolbar
        onSearch={setSearchTerm}
        searchTerm={searchTerm}
        onExport={handleExportContacts}
      />

      <div className="mb-6 flex justify-end">
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
              <ContactCard
                key={contact.id}
                contact={contact}
                onDelete={handleDeleteContact}
                onEdit={handleEditContact}
                onGenerateAvatar={handleGenerateAvatarAction}
              />
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