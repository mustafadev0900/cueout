import Layout from "./Layout.jsx";

import Onboarding from "./Onboarding";

import Auth from "./Auth";

import PhoneVerification from "./PhoneVerification";

import Home from "./Home";

import History from "./History";

import Account from "./Account";

import Paywall from "./Paywall";

import PersonaSettings from "./PersonaSettings";

import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { useEffect, useState } from 'react';

const PAGES = {
    
    Onboarding: Onboarding,
    
    Auth: Auth,
    
    PhoneVerification: PhoneVerification,
    
    Home: Home,
    
    History: History,
    
    Account: Account,
    
    Paywall: Paywall,
    
    PersonaSettings: PersonaSettings,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Component that redirects to the correct initial page based on auth state
function InitialRoute() {
    const { user, isLoading } = useAuth();
    const [hasSeenOnboarding, setHasSeenOnboarding] = useState(null);

    useEffect(() => {
        // Check if user has completed onboarding
        const onboardingComplete = localStorage.getItem('onboardingComplete');
        setHasSeenOnboarding(onboardingComplete === 'true');
    }, []);

    // Wait for auth and onboarding status to load
    if (isLoading || hasSeenOnboarding === null) {
        return null; // or a loading spinner
    }

    // If logged in, go to Home
    if (user) {
        return <Navigate to="/Home" replace />;
    }

    // If not logged in but has seen onboarding, go to Auth
    if (hasSeenOnboarding) {
        return <Navigate to="/Auth" replace />;
    }

    // Otherwise, show onboarding
    return <Navigate to="/Onboarding" replace />;
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);

    return (
        <Layout currentPageName={currentPage}>
            <Routes>

                    <Route path="/" element={<InitialRoute />} />


                <Route path="/Onboarding" element={<Onboarding />} />

                <Route path="/Auth" element={<Auth />} />

                <Route path="/PhoneVerification" element={<PhoneVerification />} />

                <Route path="/Home" element={<Home />} />

                <Route path="/History" element={<History />} />

                <Route path="/Account" element={<Account />} />

                <Route path="/Paywall" element={<Paywall />} />

                <Route path="/PersonaSettings" element={<PersonaSettings />} />

            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}