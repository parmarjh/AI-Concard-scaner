import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import ArViewPage from './pages/ArViewPage';
import AdminPage from './pages/AdminPage';
import ResearchPage from './pages/ResearchPage';
import { User } from './types';
import { auth, isFirebaseConfigured } from './firebaseConfig'; // Import Firebase auth and config check
import { onAuthStateChanged, User as FirebaseUser, signInWithPopup, signOut, GoogleAuthProvider } from 'firebase/auth';
import { googleAuthProvider } from './firebaseConfig';
import { SpinnerIcon } from './components/icons'; // For loading state
import { useTranslation } from 'react-i18next';

const App: React.FC = () => {
  const { t } = useTranslation();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true); // To handle initial auth state loading
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Only set up listener if Firebase is configured
    if (!isFirebaseConfigured || !auth) {
      setLoadingAuth(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // User is signed in
        setCurrentUser({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
        });
      } else {
        // User is signed out
        setCurrentUser(null);
      }
      setLoadingAuth(false);
      setAuthError(null);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleLogin = useCallback(async () => {
    if (!isFirebaseConfigured || !auth || !googleAuthProvider) {
      setAuthError(t('app.firebaseNotConfigured'));
      return;
    }
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        sessionStorage.setItem('googleAccessToken', credential.accessToken);
      }
      // onAuthStateChanged will handle setting the user
    } catch (error: any) {
      console.error("Error during Google sign-in:", error);
      setAuthError(error.message || t('app.authErrorDefault'));
    }
  }, [t]);

  const handleLogout = useCallback(async () => {
    if (!isFirebaseConfigured || !auth) {
      setAuthError(t('app.firebaseNotConfigured'));
      return;
    }
    setAuthError(null);
    try {
      await signOut(auth);
      // onAuthStateChanged will handle setting the user to null
    } catch (error: any) {
      console.error("Error during sign-out:", error);
      setAuthError(error.message || t('app.signoutErrorDefault'));
    }
  }, [t]);

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-light">
        <SpinnerIcon className="w-16 h-16 text-primary animate-spin-slow" />
        <p className="mt-4 text-neutral-dark text-lg">{t('app.loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={currentUser} onLogin={handleLogin} onLogout={handleLogout} />

      {authError && (
        <div className="glass border-l-4 border-red-500 text-red-700 p-4 container mx-auto mt-4 rounded-r-lg shadow-lg" role="alert">
          <p className="font-bold">{t('app.authErrorTitle')}</p>
          <p>{authError}</p>
        </div>
      )}

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="glass rounded-3xl p-6 md:p-10 shadow-2xl min-h-[70vh] mb-8">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/research" element={<ResearchPage />} />
            <Route path="/ar-view/:contactId" element={currentUser ? <ArViewPage /> : <Navigate to="/dashboard" />} />
            <Route path="/admin" element={currentUser ? <AdminPage /> : <Navigate to="/dashboard" />} />
            <Route path="*" element={
              <div className="text-center py-20 animate-fadeIn">
                <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 mb-6">{t('app.pageNotFound')}</h1>
                <p className="text-slate-600 text-lg">{t('app.pageNotFoundMessage')}</p>
                <img src="https://illustrations.popsy.co/indigo/product-launch.svg" alt="Page not found" className="mx-auto mt-12 w-3/4 max-w-sm" />
              </div>
            } />
          </Routes>
        </div>
      </main>

      <footer className="glass border-t border-white/20 text-slate-600 text-center p-6 text-sm">
        <p className="font-medium">{t('app.footer', { year: new Date().getFullYear() })}</p>
        <p className="text-xs mt-1 text-slate-400">Built with Gemini AI & Modern Web Tech</p>
      </footer>
    </div>
  );
};

export default App;