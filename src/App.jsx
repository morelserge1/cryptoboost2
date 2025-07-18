import React, { useState, Suspense } from 'react';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import BackgroundService from '@/components/BackgroundService';

// Lazy loading des composants lourds
const LoginScreen = React.lazy(() => import('@/screens/LoginScreen'));
const Dashboard = React.lazy(() => import('@/screens/Dashboard'));
const LandingScreen = React.lazy(() => import('@/screens/LandingScreen'));
const FloatingTelegramButton = React.lazy(() => import('@/components/FloatingTelegramButton'));
const RealtimeNotifications = React.lazy(() => import('@/components/RealtimeNotifications'));

function App() {
  const { user, loading, signIn, signOut, signUp } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  const handleLoginRequired = () => {
    setShowLogin(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white">Chargement de CryptoBoost...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>CryptoBoost - Bot d'Arbitrage Crypto</title>
        <meta name="description" content="Boostez vos revenus passifs grâce à nos bots crypto intelligents, qui exploitent les écarts de prix entre plateformes 24h/24, 7j/7." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </Helmet>

      <div className="min-h-screen bg-slate-900 text-white font-sans">
        <BackgroundService />
        
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
              <p className="text-white">Chargement des composants...</p>
            </div>
          </div>
        }>
          {user ? (
            <Dashboard 
              user={user} 
              logout={signOut} 
            />
          ) : showLogin ? (
            <LoginScreen 
              onBack={() => setShowLogin(false)}
              onLogin={signIn} 
              onRegister={signUp}
            />
          ) : (
            <LandingScreen onLoginRequired={handleLoginRequired} />
          )}

          <FloatingTelegramButton />
          <RealtimeNotifications />
        </Suspense>
        
        <Toaster />
      </div>
    </>
  );
}

export default App;