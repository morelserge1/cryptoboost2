
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogIn, UserPlus, ArrowLeft } from 'lucide-react';

const LoginScreen = ({ onBack, onLogin, onRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const result = await onLogin(email, password);
      if (result.error) {
        setError(result.error.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const result = await onRegister(regEmail, regPassword);
      if (result.error) {
        setError(result.error.message);
      } else {
        setRegEmail('');
        setRegPassword('');
        setActiveTab('login');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen tech-bg cyber-grid flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div className="mb-6 text-center">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4 text-cyan-300 hover:text-cyan-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-3xl font-bold gradient-text-primary font-mono">⚡ CryptoBoost</h1>
          <p className="text-cyan-300 font-mono">Bot d'Arbitrage Crypto</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 glass-card-dark border-cyan-500/30">
            <TabsTrigger value="login" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white font-mono">
              Connexion
            </TabsTrigger>
            <TabsTrigger value="register" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white font-mono">
              Inscription
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card className="glass-card neon-border">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-white font-mono">Se connecter</CardTitle>
                <CardDescription className="text-cyan-300">
                  Accédez à votre dashboard de trading
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-cyan-300 font-mono">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="admin@cryptoboost.com" 
                      required 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      className="bg-slate-800 border-cyan-500/30 text-white"
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-cyan-300 font-mono">Mot de passe</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="Votre mot de passe" 
                      required 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      className="bg-slate-800 border-cyan-500/30 text-white"
                      disabled={loading}
                    />
                  </div>
                  {error && (
                    <div className="text-red-400 text-sm font-mono bg-red-900/20 p-2 rounded">
                      {error}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex-col gap-4">
                  <Button 
                    type="submit" 
                    className="w-full btn-tech"
                    disabled={loading}
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    {loading ? 'Connexion...' : 'Se connecter'}
                  </Button>
                  <div className="text-xs text-cyan-400 font-mono text-center">
                    <p>Comptes de test :</p>
                    <p>Admin: admin@cryptoboost.com</p>
                    <p>Test: test@local.com</p>
                  </div>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card className="glass-card neon-border">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-white font-mono">S'inscrire</CardTitle>
                <CardDescription className="text-cyan-300">
                  Créez votre compte trader
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleRegister}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-email" className="text-cyan-300 font-mono">Email</Label>
                    <Input 
                      id="reg-email" 
                      type="email" 
                      placeholder="votre@email.com" 
                      required 
                      value={regEmail} 
                      onChange={(e) => setRegEmail(e.target.value)} 
                      className="bg-slate-800 border-cyan-500/30 text-white"
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password" className="text-cyan-300 font-mono">Mot de passe</Label>
                    <Input 
                      id="reg-password" 
                      type="password" 
                      placeholder="Votre mot de passe" 
                      required 
                      value={regPassword} 
                      onChange={(e) => setRegPassword(e.target.value)} 
                      className="bg-slate-800 border-cyan-500/30 text-white"
                      disabled={loading}
                    />
                  </div>
                  {error && (
                    <div className="text-red-400 text-sm font-mono bg-red-900/20 p-2 rounded">
                      {error}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex-col gap-4">
                  <Button 
                    type="submit" 
                    className="w-full btn-tech bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    disabled={loading}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    {loading ? 'Inscription...' : 'S\'inscrire'}
                  </Button>
                  <div className="text-xs text-cyan-400 font-mono text-center">
                    <p>Rejoignez notre communauté de traders automatisés</p>
                  </div>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default LoginScreen;
