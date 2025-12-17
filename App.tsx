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
    <div className="min-h-screen bg-neutral-light flex flex-col">
      <Navbar user={currentUser} onLogin={handleLogin} onLogout={handleLogout} />
      {/* Firebase Config Warning hidden by request
      {!isFirebaseConfigured && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 container mx-auto mt-2" role="status">
          <p className="font-bold">{t('app.firebaseNotConfiguredAdmin')}</p>
          <p>{t('app.firebaseNotConfiguredAdminMessage')}</p>
        </div>
      )}
      */}
      {authError && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 container mx-auto mt-2" role="alert">
          <p className="font-bold">{t('app.authErrorTitle')}</p>
          <p>{authError}</p>
        </div>
      )}
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/research" element={<ResearchPage />} />
          <Route path="/ar-view/:contactId" element={currentUser ? <ArViewPage /> : <Navigate to="/dashboard" />} />
          <Route path="/admin" element={currentUser ? <AdminPage /> : <Navigate to="/dashboard" />} />
          <Route path="*" element={
            <div className="text-center py-10">
              <h1 className="text-3xl font-bold text-primary mb-4">{t('app.pageNotFound')}</h1>
              <p className="text-neutral-dark">{t('app.pageNotFoundMessage')}</p>
              <img src="https://illustrations.popsy.co/red/timed-out.svg" alt="Page not found illustration" className="mx-auto mt-8 w-1/2 max-w-sm" />
            </div>
          } />
        </Routes>
      </main>
      <footer className="bg-neutral-dark text-neutral-light text-center p-4 text-sm">
        {t('app.footer', { year: new Date().getFullYear() })}
      </footer>
    </div>
  );
};

export default App;