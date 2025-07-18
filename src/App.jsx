import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import LoginScreen from '@/screens/LoginScreen';
import Dashboard from '@/screens/Dashboard';
import LandingScreen from '@/screens/LandingScreen';
import FloatingTelegramButton from '@/components/FloatingTelegramButton';
import RealtimeNotifications from '@/components/RealtimeNotifications';

function App() {
  const { user, loading, signIn, signOut, signUp } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  const handleLoginRequired = () => {
    setShowLogin(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
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
        <Toaster />
        <RealtimeNotifications />
      </div>
    </>
  );
}

export default App;