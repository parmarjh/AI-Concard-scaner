import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

// Mock firebaseConfig
vi.mock('./firebaseConfig', () => ({
    auth: {},
    isFirebaseConfigured: true,
    googleAuthProvider: {},
}));

// Mock firebase/auth
vi.mock('firebase/auth', () => ({
    onAuthStateChanged: vi.fn((auth, callback) => {
        // Simulate user not signed in initially
        callback(null);
        return () => { }; // Unsubscribe function
    }),
    signInWithPopup: vi.fn(),
    signOut: vi.fn(),
    GoogleAuthProvider: {
        credentialFromResult: vi.fn(),
    },
}));

// Mock child components to avoid deep rendering complexity and focus on App structure
vi.mock('./components/Navbar', () => ({
    default: () => <div data-testid="navbar">Navbar</div>
}));

vi.mock('./pages/DashboardPage', () => ({
    default: () => <div>DashboardPage</div>
}));

vi.mock('./pages/ArViewPage', () => ({
    default: () => <div>ArViewPage</div>
}));

vi.mock('./pages/AdminPage', () => ({
    default: () => <div>AdminPage</div>
}));

vi.mock('./pages/ResearchPage', () => ({
    default: () => <div>ResearchPage</div>
}));

describe('App Component', () => {
    it('renders without crashing and shows Navbar', () => {
        render(
            <BrowserRouter>
                <App />
            </BrowserRouter>
        );
        // Should show navbar
        expect(screen.getByTestId('navbar')).toBeInTheDocument();
    });
});
