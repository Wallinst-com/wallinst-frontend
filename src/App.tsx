import React from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';

import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';

import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SocialProof } from './components/SocialProof';
import { HowItWorks } from './components/HowItWorks';
import { Features } from './components/Features';
import { UseCases } from './components/UseCases';
import { Contact } from './components/Contact';
import { FAQ } from './components/FAQ';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';
import TermsOfService, { TermsSection } from './components/Terms';

import { Dashboard } from './components/Dashboard';
import { SignIn } from './components/SignIn';
import { InstagramCallback } from './components/InstagramCallback';
import { FacebookCallback } from './components/FacebookCallback';
import { AdminDashboard } from './components/AdminDashboard';
import { RequireAdmin } from './components/RequireAdmin';
import PrivacyPolicy from './components/PrivacyPolicy';
import { SentDMs } from './components/SentDMs';
import { Toaster } from './components/ui/sonner';

function LandingPage({ onSignIn }: { onSignIn: () => void }) {
  const scrollToContact = () => {
    const el = document.getElementById('contact');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="bg-white min-h-screen">
      <Navbar onSignIn={onSignIn} onRequestAccess={scrollToContact} />
      <Hero onRequestAccess={scrollToContact} />
      <SocialProof onRequestAccess={scrollToContact} />
      <HowItWorks />
      <Features />
      <UseCases />
      <Contact />
      <FAQ />
      <TermsSection />
      <FinalCTA onRequestAccess={scrollToContact} />
      <Footer />
    </div>
  );
}

/**
 * Landing page. "Sign In" always goes to /signin so users see the sign-in form.
 */
function AutoRedirectHome() {
  const navigate = useNavigate();

  const handleSignInClick = () => {
    navigate('/signin');
  };

  return <LandingPage onSignIn={handleSignInClick} />;
}
  


function RequireAuth({ children }: { children: JSX.Element }) {
  const { isAuthenticated, isLoading } = useAuth();
  const { user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-600">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }
  if (user?.role === 'admin' && location.pathname !== '/admin') {
    return <Navigate to="/admin" replace />;
  }
  return children;
}

function SignInRoute() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-600">
        Loading...
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return (
    <SignIn
      onSignIn={() => {
        // Navigation is now handled inside SignIn component via useEffect
      }}
      onBack={() => {
        navigate('/');
      }}
    />
  );
}

function SentDMsWrapper() {
  const navigate = useNavigate();
  return <SentDMs onBack={() => navigate('/dashboard')} />;
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster />
      <SpeedInsights />
      <Routes>
        {/* Landing */}
        <Route path="/" element={<AutoRedirectHome />} />

        {/* Auth */}
        <Route
          path="/signin"
          element={
            <SignInRoute />
          }
        />
        {/* Dashboard (protected) */}
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard onSignOut={() => (window.location.href = '/')} />
            </RequireAuth>
          }
        />

        {/* Sent DMs (protected) */}
        <Route
          path="/sent-dms"
          element={
            <RequireAuth>
              <SentDMsWrapper />
            </RequireAuth>
          }
        />

        {/* Instagram OAuth callback */}
        <Route
          path="/instagram/callback"
          element={
            <RequireAuth>
              <InstagramCallback
                onDone={() => {
                  // Navigation handled in component
                }}
                onError={() => {
                  // Navigation handled in component
                }}
              />
            </RequireAuth>
          }
        />

        {/* Facebook OAuth callback */}
        <Route
          path="/facebook/callback"
          element={
            <RequireAuth>
              <FacebookCallback
                onDone={() => {
                  // Navigation handled in component
                }}
                onError={() => {
                  // Navigation handled in component
                }}
              />
            </RequireAuth>
          }
        />

        {/* Privacy policy */}
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />

              {/* Admin Dashboard (protected + admin only) */}
      <Route
        path="/admin"
        element={
          <RequireAuth>
            <RequireAdmin>
              <AdminDashboard />
            </RequireAdmin>
          </RequireAuth>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}