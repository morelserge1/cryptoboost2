import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Users, Wallet, ShieldCheck, Zap, Newspaper, LogOut, MessageSquare as MessageSquareQuote, Send, Activity, Cpu, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CryptoWallet from '@/components/CryptoWallet';
import AdminPanel from '@/components/AdminPanel';
import InvestmentPlans from '@/components/InvestmentPlans';
import LiveTrading from '@/components/LiveTrading';
import Ticker from '@/components/Ticker';
import CustomerReviews from '@/components/CustomerReviews';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { dbHelpers } from '@/lib/customSupabaseClient';

const Dashboard = ({ user, logout, allUsers, updateUser, deleteUser, banUser, promoteUser }) => {
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('wallet');
  const [totalInvested, setTotalInvested] = useState(0);
  const [displayedTotalCapital, setDisplayedTotalCapital] = useState(user.totalCapital || 0);
  const [transactions, setTransactions] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshData = useCallback(() => {
    const investments = JSON.parse(localStorage.getItem('investments') || '[]');
    const approvedInvestments = investments.filter(inv => inv.status === 'approved');
    const total = approvedInvestments.reduce((sum, inv) => sum + inv.price, 0);
    setTotalInvested(total);
  }, []);

  useEffect(() => {
    refreshData();
  }, [allUsers, refreshData]);

  const handleDataUpdate = useCallback(() => {
    refreshData();
  }, [refreshData]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  useEffect(() => {
    const PROFIT_DURATION = 4 * 60 * 60 * 1000;
    const interval = setInterval(() => {
      const allInvestments = JSON.parse(localStorage.getItem('investments') || '[]');
      const userInvestments = allInvestments.filter(inv => inv.userEmail === user.email);

      const completedBenefits = userInvestments
        .filter(inv => inv.isComplete)
        .reduce((sum, inv) => sum + (inv.finalProfitTarget || 0), 0);

      let currentDynamicBenefits = 0;
      userInvestments.forEach(inv => {
        if (inv.status === 'approved' && inv.approvalDate && !inv.isComplete) {
          const approvalTime = new Date(inv.approvalDate).getTime();
          const now = new Date().getTime();
          const elapsedTime = now - approvalTime;

          if (elapsedTime < PROFIT_DURATION) {
            const timeRatio = elapsedTime / PROFIT_DURATION;
            const baseProfit = timeRatio * (inv.finalProfitTarget || 0);
            const fluctuation = (Math.random() - 0.5) * baseProfit * 0.05;
            currentDynamicBenefits += Math.max(0, baseProfit + fluctuation);
          }
        }
      });

      setDisplayedTotalCapital((user.capital || 0) + completedBenefits + currentDynamicBenefits);
    }, 2000);

    return () => clearInterval(interval);
  }, [user.email, user.capital]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load user-specific data
        if (user?.id) {
          const [userTransactions, userInvestments] = await Promise.all([
            dbHelpers.getUserTransactions(user.id),
            dbHelpers.getUserInvestments(user.id)
          ]);

          setTransactions(userTransactions);
          setInvestments(userInvestments);
        }

        // Load admin data if user is admin
        if (user?.role === 'admin') {
          const [allDeposits, allWithdrawals] = await Promise.all([
            dbHelpers.getPendingDeposits(),
            dbHelpers.getPendingWithdrawals()
          ]);

          setDeposits(allDeposits);
          setWithdrawals(allWithdrawals);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  return (
    <div className="min-h-screen tech-bg cyber-grid">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8 glass-card p-6 rounded-xl neon-border"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 gradient-text-primary font-mono">⚡ CryptoBoost</h1>
              <p className="text-sm sm:text-base text-cyan-300 font-mono">TRADER: {user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-400 font-mono">SYSTÈME ACTIF</span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
               <Button asChild size="sm" className="btn-tech px-3 sm:px-4 py-2 text-xs sm:text-sm">
                  <a href="https://t.me/louis_botcrypto" target="_blank" rel="noopener noreferrer" className="flex items-center">
                    <Send className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-cyan-300" /> 
                    <span className="hidden sm:inline">Telegram Bot</span>
                    <span className="sm:hidden">Bot</span>
                  </a>
                </Button>
                <Button asChild size="sm" className="btn-tech px-3 sm:px-4 py-2 text-xs sm:text-sm">
                  <a href="https://t.me/direction_ltd_crypto67" target="_blank" rel="noopener noreferrer" className="flex items-center">
                    <Send className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-purple-300" /> 
                    <span className="hidden sm:inline">Conseiller</span>
                    <span className="sm:hidden">Support</span>
                  </a>
                </Button>
              <Button onClick={() => signOut()} variant="destructive" size="icon" className="rounded-full w-8 h-8 sm:w-10 sm:h-10 neon-border">
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </div>
        </motion.header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="h-auto glass-card-dark border-cyan-500/30 w-full grid grid-cols-2 sm:flex sm:flex-wrap justify-center p-1 gap-1">
             <TabsTrigger value="wallet" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-xs sm:text-sm px-2 sm:px-4 py-2 font-mono">
              <Wallet className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Portefeuille</span>
              <span className="sm:hidden">Wallet</span>
            </TabsTrigger>
            <TabsTrigger value="plans" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-xs sm:text-sm px-2 sm:px-4 py-2 font-mono">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Bots
            </TabsTrigger>
             <TabsTrigger value="reviews" className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-xs sm:text-sm px-2 sm:px-4 py-2 font-mono">
              <MessageSquareQuote className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Community
            </TabsTrigger>
            <TabsTrigger value="trading" className="data-[state=active]:bg-yellow-600 data-[state=active]:text-white text-xs sm:text-sm px-2 sm:px-4 py-2 font-mono">
              <Newspaper className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Live
            </TabsTrigger>
            {user.role === 'admin' && (
              <TabsTrigger value="admin" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-xs sm:text-sm px-2 sm:px-4 py-2 col-span-2 sm:col-span-1 font-mono">
                <ShieldCheck className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Admin
              </TabsTrigger>
            )}
          </TabsList>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8"
          >
            <Card className="glass-card neon-border bg-gradient-to-br from-green-500/20 to-emerald-600/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 sm:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-green-300 font-mono">CAPITAL INVESTI</CardTitle>
                <Database className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold font-mono">{formatCurrency(totalInvested)}</div>
                <p className="text-xs sm:text-sm text-green-400/80 font-mono">BOTS ACTIFS</p>
                <div className="data-bar mt-2"></div>
              </CardContent>
            </Card>

            <Card className="glass-card neon-border bg-gradient-to-br from-cyan-500/20 to-blue-600/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 sm:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-cyan-300 font-mono">CAPITAL TOTAL</CardTitle>
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold font-mono gradient-text-success">{formatCurrency(displayedTotalCapital)}</div>
                <p className="text-xs sm:text-sm text-cyan-400/80 font-mono">CAPITAL + PROFITS</p>
                <div className="data-bar mt-2"></div>
              </CardContent>
            </Card>

            <Card className="glass-card neon-border bg-gradient-to-br from-purple-500/20 to-pink-600/20 sm:col-span-2 lg:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 sm:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-purple-300 font-mono">COMMUNAUTÉ</CardTitle>
                <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold font-mono">500+</div>
                <p className="text-xs sm:text-sm text-purple-400/80 font-mono">TRADERS ACTIFS</p>
                <div className="data-bar mt-2"></div>
              </CardContent>
            </Card>
          </motion.div>

          <Ticker />

           <TabsContent value="wallet">
            <CryptoWallet user={user} updateUser={updateUser} onDataUpdate={handleDataUpdate}/>
          </TabsContent>

          <TabsContent value="plans">
            <InvestmentPlans onInvestment={handleDataUpdate} user={user} onLoginRequired={() => {}} updateUser={updateUser} />
          </TabsContent>

          <TabsContent value="reviews">
            <CustomerReviews />
          </TabsContent>

          <TabsContent value="trading">
            <LiveTrading />
          </TabsContent>

          {user.role === 'admin' && (
            <TabsContent value="admin">
              <AdminPanel 
                onUpdate={handleDataUpdate} 
                allUsers={allUsers}
                updateUser={updateUser}
                deleteUser={deleteUser}
                banUser={banUser}
                promoteUser={promoteUser}
                currentUser={user}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;