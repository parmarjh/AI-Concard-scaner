
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PlusIcon, SearchIcon, InfoIcon } from '../components/icons';
import AddCardModal from '../components/AddCardModal';
import DetailViewModal from '../components/DetailViewModal';
import ContactCard from '../components/ContactCard';
import { Contact } from '../types';
import ActionToolbar from '../components/ActionToolbar';
import { saveAs } from 'file-saver';
import { autoGenerateAvatar } from '../utils/avatarGenerator';

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
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
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [viewingContact, setViewingContact] = useState<Contact | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('contacts', JSON.stringify(contacts));
    } catch (error) {
      console.error("Error saving contacts to localStorage", error);
    }
  }, [contacts]);

  const handleAddContact = async (contactsInput: Contact | Contact[]) => {
    const contactsArray = Array.isArray(contactsInput) ? contactsInput : [contactsInput];

    // Process each contact (e.g., generate avatars)
    const processedContacts = await Promise.all(contactsArray.map(async (contact) => {
      if (!contact.cardImageUrl) {
        const avatarUrl = await autoGenerateAvatar({ name: contact.name });
        if (avatarUrl) {
          return { ...contact, cardImageUrl: avatarUrl };
        }
      }
      return contact;
    }));

    setContacts(prevContacts => {
      const newContacts = [...prevContacts];
      processedContacts.forEach(pc => {
        const index = newContacts.findIndex(c => c.id === pc.id);
        if (index !== -1) {
          newContacts[index] = pc; // Update existing
        } else {
          newContacts.push(pc); // Add new
        }
      });
      return newContacts;
    });

    setIsModalOpen(false);
    setEditingContact(null);
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
    saveAs(blob, 'contacts_backup.csv');
  };

  const handleDeleteContact = (id: string) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      setContacts(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setIsModalOpen(true);
  };

  const handleViewContact = (contact: Contact) => {
    setViewingContact(contact);
    setIsDetailModalOpen(true);
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
    <div className="animate-fadeIn pb-12">
      <header className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">
            {t('dashboard.title')}
          </h1>
          <p className="text-slate-400 font-medium text-lg mt-2">{t('dashboard.subtitle')}</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-2xl shadow-[0_10px_30px_rgba(79,70,229,0.3)] hover:shadow-[0_15px_35px_rgba(79,70,229,0.4)] transition-all flex items-center justify-center transform hover:-translate-y-1 active:scale-95"
          aria-label={t('dashboard.addNewCard')}
        >
          <div className="bg-white/20 p-1.5 rounded-lg mr-3 shadow-inner">
            <PlusIcon className="w-5 h-5 text-white" />
          </div>
          {t('dashboard.addNewCard')}
        </button>
      </header>

      {/* Action Toolbar */}
      <div className="mb-10">
        <ActionToolbar
          onSearch={setSearchTerm}
          searchTerm={searchTerm}
          onExport={handleExportContacts}
        />
      </div>

      {contacts.length === 0 ? (
        <div className="glass border border-white/40 p-16 rounded-[40px] shadow-2xl text-center relative overflow-hidden group">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-colors"></div>

          <img src="https://illustrations.popsy.co/indigo/product-launch.svg" alt="Launch" className="mx-auto mb-8 w-64 transform group-hover:scale-105 transition-transform duration-700" />
          <h2 className="text-3xl font-black text-slate-800 mb-4">{t('dashboard.noContactsTitle')}</h2>
          <p className="text-slate-500 max-w-md mx-auto mb-10 text-lg leading-relaxed">{t('dashboard.noContactsMessage')}</p>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-white hover:bg-slate-50 text-indigo-600 font-black py-4 px-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all border border-indigo-100"
          >
            {t('dashboard.addFirstCard')}
          </button>
        </div>
      ) : (
        filteredContacts.length === 0 && searchTerm ? (
          <div className="glass border border-white/40 p-16 rounded-[40px] shadow-2xl text-center">
            <div className="w-24 h-24 bg-indigo-100/50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <SearchIcon className="w-12 h-12 text-indigo-500" />
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-4">{t('dashboard.noResultsTitle')}</h2>
            <p className="text-slate-500 text-lg">{t('dashboard.noResultsMessage', { searchTerm })}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredContacts.map(contact => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onDelete={handleDeleteContact}
                onEdit={handleEditContact}
                onView={handleViewContact}
                onGenerateAvatar={handleGenerateAvatarAction}
              />
            ))}
          </div>
        )
      )}

      {isModalOpen && (
        <AddCardModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setEditingContact(null); }}
          onSave={handleAddContact}
          initialContact={editingContact}
        />
      )}

      {isDetailModalOpen && (
        <DetailViewModal
          isOpen={isDetailModalOpen}
          onClose={() => { setIsDetailModalOpen(false); setViewingContact(null); }}
          contact={viewingContact}
        />
      )}
    </div>
  );
};

export default DashboardPage;