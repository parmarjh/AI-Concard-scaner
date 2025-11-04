import React from 'react';
import { useTranslation } from 'react-i18next';
import { SettingsIcon, UserIcon } from '../components/icons'; // Adjusted path

const AdminPage: React.FC = () => {
  const { t } = useTranslation();

  // Mock data for demonstration
  const stats = [
    { label: t('admin.totalUsers'), value: "2,345", icon: <UserIcon className="w-8 h-8 text-blue-500" /> },
    { label: t('admin.cardsScanned'), value: "15,678", icon: <SettingsIcon className="w-8 h-8 text-green-500" /> },
    { label: t('admin.storageUsed'), value: "12.5 GB", icon: <SettingsIcon className="w-8 h-8 text-yellow-500" /> },
    { label: t('admin.ocrAccuracy'), value: "92.7%", icon: <SettingsIcon className="w-8 h-8 text-purple-500" /> }
  ];

  const recentActivities = [
    { user: "Alice", action: "Uploaded 3 new cards", time: "2 min ago" },
    { user: "Bob", action: "Manually verified a card", time: "15 min ago" },
    { user: "System", action: "Storage check complete", time: "1 hour ago" },
    { user: "Charlie", action: "Joined the platform", time: "3 hours ago" }
  ];

  return (
    <div className="animate-fadeIn">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-primary flex items-center">
          <SettingsIcon className="w-10 h-10 mr-3 text-secondary" />
          {t('admin.title')}
        </h1>
        <p className="text-neutral-dark mt-2">{t('admin.subtitle')}</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-center space-x-4">
            <div className="p-3 bg-neutral-light rounded-full">
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-neutral font-medium">{stat.label}</p>
              <p className="text-2xl font-semibold text-neutral-dark">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder for future admin functionalities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold text-neutral-dark mb-4">{t('admin.userManagement')}</h2>
          <p className="text-neutral mb-4">{t('admin.userManagementDesc')}</p>
          <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors opacity-50 cursor-not-allowed">
            {t('admin.viewUsers')}
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold text-neutral-dark mb-4">{t('admin.ocrQueue')}</h2>
          <p className="text-neutral mb-4">{t('admin.ocrQueueDesc')}</p>
          <button className="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-opacity-80 transition-colors opacity-50 cursor-not-allowed">
            {t('admin.openQueue')}
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg md:col-span-2">
          <h2 className="text-2xl font-semibold text-neutral-dark mb-4">{t('admin.recentActivity')}</h2>
          <ul className="space-y-3">
            {recentActivities.map((activity, index) => (
              <li key={index} className="flex justify-between items-center p-3 bg-neutral-light rounded-md">
                <div>
                  <span className="font-semibold text-neutral-dark">{activity.user}: </span>
                  <span className="text-neutral">{activity.action}</span>
                </div>
                <span className="text-xs text-neutral-dark">{activity.time}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;