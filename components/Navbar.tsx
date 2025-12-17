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
    <nav className="bg-primary shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-white text-2xl font-bold hover:text-secondary transition-colors">
            {t('navbar.title')}
          </Link>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link to="/dashboard" className="text-neutral-light hover:text-secondary transition-colors px-3 py-2 rounded-md text-sm font-medium">{t('navbar.dashboard')}</Link>
            <Link to="/research" className="text-neutral-light hover:text-secondary transition-colors px-3 py-2 rounded-md text-sm font-medium flex items-center">
              <FileTextIcon className="w-4 h-4 mr-1" />
              Research
            </Link>

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="p-2 text-neutral-light hover:text-secondary transition-colors focus:outline-none"
                aria-label={t('navbar.language')}
              >
                <GlobeIcon className="w-6 h-6" />
              </button>
              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white rounded-md shadow-lg py-1 z-20 ring-1 ring-black ring-opacity-5">
                  {Object.keys(languages).map((lng) => (
                    <button
                      key={lng}
                      style={{ fontWeight: i18n.resolvedLanguage === lng ? 'bold' : 'normal' }}
                      type="submit"
                      onClick={() => changeLanguage(lng)}
                      className="block w-full text-left px-4 py-2 text-sm text-neutral-dark hover:bg-neutral-light"
                    >
                      {(languages as any)[lng].nativeName}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {user && (
              <>
                <Link to="/admin" className="text-neutral-light hover:text-secondary transition-colors px-3 py-2 rounded-md text-sm font-medium hidden sm:flex items-center">
                  <SettingsIcon className="w-5 h-5 mr-1" /> {t('navbar.admin')}
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center text-neutral-light focus:outline-none"
                    aria-expanded={userDropdownOpen}
                    aria-haspopup="true"
                    aria-label={t('navbar.userMenu')}
                  >
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || 'User'} className="w-8 h-8 rounded-full mr-2 border-2 border-neutral-light" />
                    ) : (
                      <UserIcon className="w-8 h-8 mr-2 rounded-full bg-neutral-light text-primary p-1" />
                    )}
                    <span className="hidden md:inline">{user.displayName || 'User'}</span>
                    <ChevronDownIcon className={`w-5 h-5 ml-1 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {userDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 ring-1 ring-black ring-opacity-5"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="user-menu-button"
                    >
                      <div className="px-4 py-2 text-sm text-neutral-dark border-b">
                        <p className="font-semibold">{user.displayName || 'User'}</p>
                        <p className="text-xs text-neutral truncate">{user.email}</p>
                      </div>
                      <Link
                        to="/admin"
                        className="block sm:hidden px-4 py-2 text-sm text-neutral-dark hover:bg-neutral-light w-full text-left flex items-center"
                        role="menuitem"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <SettingsIcon className="w-5 h-5 mr-2 text-primary" /> {t('navbar.admin')}
                      </Link>
                      <button
                        onClick={handleLogoutAttempt}
                        disabled={isAuthActionInProgress}
                        className="block w-full text-left px-4 py-2 text-sm text-neutral-dark hover:bg-neutral-light flex items-center disabled:opacity-50"
                        role="menuitem"
                        aria-label={t('navbar.logout')}
                      >
                        {isAuthActionInProgress && user ? ( // Show spinner only if logout is in progress
                          <SpinnerIcon className="w-5 h-5 mr-2" />
                        ) : (
                          <LogoutIcon className="w-5 h-5 mr-2 text-red-500" />
                        )}
                        {t('navbar.logout')}
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
            {!user && (
              <div className="hidden sm:flex items-center space-x-2">
                <button
                  onClick={handleAuthAttempt}
                  disabled={isAuthActionInProgress}
                  className="bg-white hover:bg-neutral-light text-primary font-semibold px-4 py-2 rounded-md text-sm flex items-center transition-colors shadow-sm hover:shadow-md disabled:opacity-70"
                  aria-label="Login with Google"
                >
                  {isAuthActionInProgress ? (
                    <SpinnerIcon className="w-5 h-5 mr-2 text-primary" />
                  ) : (
                    <GoogleIcon className="w-5 h-5 mr-2" />
                  )}
                  {t('navbar.login')}
                </button>
                <button
                  onClick={handleAuthAttempt} // Same handler as Firebase handles new user creation
                  disabled={isAuthActionInProgress}
                  className="border border-white text-white hover:bg-white hover:text-primary font-semibold px-4 py-2 rounded-md text-sm flex items-center transition-colors shadow-sm hover:shadow-md disabled:opacity-70"
                  aria-label="Sign Up with Google"
                >
                  {isAuthActionInProgress ? (
                    <SpinnerIcon className="w-5 h-5 mr-2 text-white group-hover:text-primary" /> // Adjust spinner color if needed
                  ) : (
                    <GoogleIcon className="w-5 h-5 mr-2" />
                  )}
                  {t('navbar.signup')}
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