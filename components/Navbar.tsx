import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User } from '../types';
import { UserIcon, LogoutIcon, SettingsIcon, GoogleIcon, SpinnerIcon, ChevronDownIcon, GlobeIcon, FileTextIcon } from './icons';
import { useTranslation } from 'react-i18next';

interface NavbarProps {
  user: User | null;
  onLogin: () => Promise<void>;
  onLogout: () => Promise<void>;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogin, onLogout }) => {
  const { t, i18n } = useTranslation();
  const [isAuthActionInProgress, setIsAuthActionInProgress] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const languages = {
    en: { nativeName: 'English' },
    es: { nativeName: 'Español' }
  };

  const handleAuthAttempt = async () => {
    setIsAuthActionInProgress(true);
    try {
      await onLogin(); // onLogin handles both login and signup with Google
    } catch (error) {
      // Error is handled in App.tsx
      console.error("Navbar: Auth attempt failed", error);
    } finally {
      setIsAuthActionInProgress(false);
    }
  };

  const handleLogoutAttempt = async () => {
    setIsAuthActionInProgress(true); // Can use the same state for logout spinner if desired, or a separate one.
    setUserDropdownOpen(false); // Close dropdown on logout attempt
    try {
      await onLogout();
    } catch (error) {
      // Error is handled in App.tsx
      console.error("Navbar: Logout failed", error);
    } finally {
      setIsAuthActionInProgress(false);
    }
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setLangDropdownOpen(false);
  };

  return (
    <nav className="glass sticky top-0 z-[60] border-b border-white/20">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <span className="text-indigo-600 dark:text-indigo-400 text-2xl font-black tracking-tight group-hover:text-purple-600 transition-colors">
              {t('navbar.title')}
            </span>
          </Link>

          <div className="flex items-center space-x-3 sm:space-x-6">
            <div className="hidden lg:flex items-center space-x-2">
              <Link to="/dashboard" className="text-slate-600 hover:text-indigo-600 transition-all px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-50">
                {t('navbar.dashboard')}
              </Link>
              <Link to="/research" className="text-slate-600 hover:text-indigo-600 transition-all px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-50 flex items-center">
                <FileTextIcon className="w-4 h-4 mr-2" />
                Research
              </Link>
            </div>

            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all focus:outline-none"
                aria-label={t('navbar.language')}
              >
                <GlobeIcon className="w-5 h-5" />
              </button>
              {langDropdownOpen && (
                <div className="absolute right-0 mt-3 w-40 glass rounded-2xl shadow-xl py-2 z-20 border border-white/20 animate-fadeIn overflow-hidden">
                  {Object.keys(languages).map((lng) => (
                    <button
                      key={lng}
                      onClick={() => changeLanguage(lng)}
                      className={`block w-full text-left px-5 py-2.5 text-sm transition-colors ${i18n.resolvedLanguage === lng ? 'text-indigo-600 bg-indigo-50 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      {(languages as any)[lng].nativeName}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {user ? (
              <>
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center p-1 px-2 pr-3 bg-white/50 hover:bg-white rounded-2xl transition-all border border-transparent hover:border-indigo-100 shadow-sm focus:outline-none"
                  >
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || 'User'} className="w-8 h-8 rounded-xl shadow-md" />
                    ) : (
                      <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                        {user.displayName?.[0] || 'U'}
                      </div>
                    )}
                    <ChevronDownIcon className={`w-4 h-4 ml-2 text-slate-400 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-56 glass rounded-2xl shadow-xl py-2 z-20 border border-white/20 animate-fadeIn overflow-hidden">
                      <div className="px-5 py-3 border-b border-slate-100">
                        <p className="font-bold text-slate-800 text-sm truncate">{user.displayName || 'User'}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>
                      <Link
                        to="/admin"
                        className="px-5 py-2.5 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all flex items-center font-medium"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <SettingsIcon className="w-4 h-4 mr-3" /> {t('navbar.admin')}
                      </Link>
                      <button
                        onClick={handleLogoutAttempt}
                        disabled={isAuthActionInProgress}
                        className="w-full text-left px-5 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-all flex items-center font-medium disabled:opacity-50"
                      >
                        {isAuthActionInProgress ? (
                          <SpinnerIcon className="w-4 h-4 mr-3 animate-spin" />
                        ) : (
                          <LogoutIcon className="w-4 h-4 mr-3" />
                        )}
                        {t('navbar.logout')}
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleAuthAttempt}
                  disabled={isAuthActionInProgress}
                  className="hidden sm:flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-indigo-200 shadow-lg hover:shadow-indigo-300 transform hover:-translate-y-0.5 disabled:opacity-70"
                >
                  {isAuthActionInProgress ? <SpinnerIcon className="w-4 h-4 mr-2 animate-spin" /> : <GoogleIcon className="w-4 h-4 mr-2" />}
                  {t('navbar.login')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;