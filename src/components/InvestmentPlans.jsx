import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, BarChart, TrendingUp, Zap, Copy, Check, Clock, Wallet, Cpu, Shield, Activity, Target } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const plans = [
  { 
    name: "STARTER BOT", 
    price: 250, 
    profitTarget: 6900, 
    profitRange: "250€ → 2,500€", 
    roi: "900%",
    features: [
      "Algorithme de base", 
      "5 exchanges connectés", 
      "Support email 24h", 
      "Dashboard temps réel"
    ], 
    icon: <BarChart className="w-10 h-10 text-cyan-400" />, 
    color: "cyan",
    gradient: "from-cyan-500/20 to-blue-500/20",
    borderColor: "border-cyan-500/30"
  },
  { 
    name: "PRO ALGORITHM", 
    price: 500, 
    profitTarget: 10900, 
    profitRange: "500€ → 5,500€", 
    roi: "1000%",
    features: [
      "IA avancée + ML", 
      "12 exchanges premium", 
      "Support prioritaire", 
      "Analytics avancés",
      "Signaux exclusifs"
    ], 
    icon: <Cpu className="w-10 h-10 text-purple-400" />, 
    color: "purple", 
    popular: true,
    gradient: "from-purple-500/20 to-pink-500/20",
    borderColor: "border-purple-500/30"
  },
  { 
    name: "QUANTUM ELITE", 
    price: 1000, 
    profitTarget: 16900, 
    profitRange: "1000€ → 8,500€", 
    roi: "750%",
    features: [
      "Quantum computing", 
      "20+ exchanges VIP", 
      "Conseiller dédié", 
      "Stratégies custom",
      "API privée",
      "Hedge fund access"
    ], 
    icon: <Zap className="w-10 h-10 text-yellow-400" />, 
    color: "yellow",
    gradient: "from-yellow-500/20 to-orange-500/20",
    borderColor: "border-yellow-500/30"
  },
];

const cryptoPrices = { BTC: 60000, ETH: 3000, SOL: 150 };

const PlanCard = ({ plan, index, onSelectPlan }) => (
  <motion.div 
    initial={{ opacity: 0, y: 50 }} 
    whileInView={{ opacity: 1, y: 0 }} 
    viewport={{ once: true }} 
    transition={{ delay: index * 0.15, duration: 0.5 }} 
    className="h-full group"
  >
    <Card className={`relative flex flex-col h-full glass-card ${plan.borderColor} backdrop-blur-sm hover:neon-glow transition-all duration-500 shadow-2xl group-hover:scale-105 holographic`}>
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg neon-glow animate-pulse-neon">
            🔥 PLUS POPULAIRE
          </div>
        </div>
      )}
      
      <CardHeader className="text-center p-6 relative">
        <div className={`mx-auto mb-4 p-4 glass-card-dark rounded-full ${plan.borderColor} animate-float`}>
          {plan.icon}
        </div>
        <CardTitle className="text-2xl font-bold text-white font-mono mb-2">{plan.name}</CardTitle>
        <div className="text-sm font-mono text-gray-400 mb-2">ROI TARGET: {plan.roi}</div>
        <CardDescription className="text-base text-cyan-200">
          <span className={`font-bold text-${plan.color}-400 font-mono`}>{plan.profitRange}</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-grow space-y-6 p-6 pt-0">
        <div className="text-center">
          <div className="text-4xl font-extrabold text-white font-mono mb-2">{plan.price}€</div>
          <div className="text-sm text-gray-400">INVESTISSEMENT INITIAL</div>
          <div className="data-bar mt-2"></div>
        </div>

        <div className="space-y-4">
          <div className="text-center">
            <div className="text-xs font-mono text-cyan-400 bg-black/30 px-3 py-1 rounded-full inline-block mb-3">
              FONCTIONNALITÉS INCLUSES
            </div>
          </div>
          <ul className="space-y-3 text-gray-300">
            {plan.features.map((feature, i) => ( 
              <li key={i} className="flex items-start group-hover:text-white transition-colors"> 
                <CheckCircle className={`w-5 h-5 mr-3 text-${plan.color}-400 shrink-0 mt-0.5`} /> 
                <span className="leading-relaxed font-medium">{feature}</span> 
              </li> 
            ))}
          </ul>
        </div>

        {/* Performance Indicators */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="glass-card-dark p-2 rounded">
            <Shield className="w-4 h-4 text-green-400 mx-auto mb-1" />
            <div className="text-xs text-green-400 font-mono">SÉCURISÉ</div>
          </div>
          <div className="glass-card-dark p-2 rounded">
            <Activity className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
            <div className="text-xs text-cyan-400 font-mono">24/7</div>
          </div>
          <div className="glass-card-dark p-2 rounded">
            <Target className="w-4 h-4 text-purple-400 mx-auto mb-1" />
            <div className="text-xs text-purple-400 font-mono">AUTO</div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Button 
          onClick={() => onSelectPlan(plan)} 
          className={`w-full btn-tech py-4 text-lg font-bold ${plan.borderColor} animate-pulse-neon group-hover:neon-glow transition-all duration-300`}
        >
          <Zap className="w-5 h-5 mr-2" />
          ACTIVER {plan.name}
        </Button>
      </CardFooter>
    </Card>
  </motion.div>
);

const InvestmentPlans = ({ onInvestment, user, onLoginRequired, updateUser }) => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [copied, setCopied] = useState(false);
  const [depositAddresses, setDepositAddresses] = useState({});
  const [activeTab, setActiveTab] = useState('BTC');
  const [paymentMethod, setPaymentMethod] = useState('deposit');
  const [depositAmount, setDepositAmount] = useState('');

  useEffect(() => {
    const storedAddresses = JSON.parse(localStorage.getItem('depositAddresses'));
    if (storedAddresses) {
      setDepositAddresses(storedAddresses);
    }
  }, [selectedPlan]);
  
  const handleSelectPlan = (plan) => {
    if (user) {
      setSelectedPlan(plan);
      setPaymentMethod('deposit');
    } else {
      onLoginRequired();
    }
  };

  const cryptoAmount = selectedPlan ? (selectedPlan.price / cryptoPrices[activeTab]) : 0;
  const currentAddress = depositAddresses[activeTab] || '';

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(currentAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "✅ Copié !", description: "L'adresse de dépôt a été copiée." });
  };
  
  const handleConfirmInvestment = () => {
    const investments = JSON.parse(localStorage.getItem('investments') || '[]');
    let paymentDetails = {};
    let updatedUser;
    
    if (paymentMethod === 'capital') {
      if ((user.totalCapital || 0) < selectedPlan.price) {
        toast({ variant: 'destructive', title: '❌ Capital insuffisant', description: 'Votre capital total est insuffisant pour ce plan.' });
        return;
      }
      updatedUser = { 
        ...user, 
        investedCapital: (user.investedCapital || 0) + selectedPlan.price,
      };
      paymentDetails = {
        cryptoType: 'EUR',
        cryptoAmount: selectedPlan.price,
        paidWith: 'capital'
      };
      toast({ title: "🚀 Bot activé!", description: "Votre algorithme de trading est maintenant actif." });
    } else {
        updatedUser = {
            ...user,
            investedCapital: (user.investedCapital || 0) + selectedPlan.price,
            totalCapital: (user.totalCapital || 0) + selectedPlan.price,
            totalDeposited: (user.totalDeposited || 0) + selectedPlan.price,
        };
        paymentDetails = {
            cryptoType: activeTab,
            cryptoAmount: cryptoAmount,
            paidWith: 'deposit'
        };
        toast({ title: "⏳ Validation en cours", description: "Votre bot sera activé après validation du paiement." });
    }
    
    updateUser(updatedUser);

    const newInvestment = {
      user_id: user.id,
      plan_name: selectedPlan.name,
      amount: selectedPlan.price,
      expected_profit: selectedPlan.profitTarget,
      duration_days: selectedPlan.duration || 30,
      status: 'pending',
      ...paymentDetails
    };
    
    await dbHelpers.createInvestment(newInvestment);
    
    setSelectedPlan(null);
    if(onInvestment) onInvestment();
  };

  return (
    <>
      <div className="py-16 bg-gradient-to-b from-black/20 to-black/40">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 px-4"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-6">
            <span className="gradient-text-primary font-mono">ALGORITHMES</span> DE TRADING
          </h2>
          <p className="text-xl text-cyan-100 max-w-4xl mx-auto leading-relaxed mb-8">
            Choisissez votre niveau d'automatisation. Nos bots IA travaillent 24h/24 pour maximiser vos profits.
          </p>
          
          {/* Performance Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            {[
              { label: "Précision IA", value: "94.7%", color: "text-green-400" },
              { label: "Trades/Jour", value: "2,847", color: "text-cyan-400" },
              { label: "Uptime", value: "99.9%", color: "text-purple-400" }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.map((plan, index) => <PlanCard key={plan.name} plan={plan} index={index} onSelectPlan={handleSelectPlan} />)}
          </div>
        </div>
      </div>

      <Dialog open={!!selectedPlan} onOpenChange={() => setSelectedPlan(null)}>
        <DialogContent className="sm:max-w-md glass-card border-cyan-500/30 text-white">
          <DialogHeader>
            <DialogTitle className="font-mono gradient-text-primary">
              ACTIVATION • {selectedPlan?.name}
            </DialogTitle>
            <DialogDescription className="text-cyan-200">
              Sélectionnez votre méthode de paiement pour activer votre bot de trading.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={paymentMethod} onValueChange={setPaymentMethod} className="w-full">
            <TabsList className="grid w-full grid-cols-2 glass-card-dark">
              <TabsTrigger value="deposit" className="font-mono">CRYPTO DEPOSIT</TabsTrigger>
              <TabsTrigger 
                value="capital" 
                disabled={(user?.totalCapital || 0) < (selectedPlan?.price || 0)}
                className="font-mono"
              >
                CAPITAL ({new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(user?.totalCapital || 0)})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="deposit">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
                <TabsList className="grid w-full grid-cols-3 glass-card-dark">
                  <TabsTrigger value="BTC" className="font-mono">BTC</TabsTrigger>
                  <TabsTrigger value="ETH" className="font-mono">ETH</TabsTrigger>
                  <TabsTrigger value="SOL" className="font-mono">SOL</TabsTrigger>
                </TabsList>
                <TabsContent value={activeTab}>
                  <div className="py-4 space-y-6">
                    <div className="text-center p-6 glass-card-dark rounded-lg neon-border">
                      <div className="text-cyan-300 font-mono text-sm mb-2">MONTANT REQUIS</div>
                      <div className="text-3xl font-bold text-white font-mono">
                        {cryptoAmount.toFixed(6)} {activeTab}
                      </div>
                      <div className="text-sm text-gray-400 mt-2">≈ {selectedPlan?.price}€</div>
                    </div>
                    
                    <div>
                      <Label htmlFor="deposit-address" className="text-cyan-300 font-mono">
                        ADRESSE DE DÉPÔT {activeTab}
                      </Label>
                      <div className="flex items-center space-x-2 mt-2">
                        <Input 
                          id="deposit-address" 
                          value={currentAddress} 
                          readOnly 
                          className="glass-card-dark border-cyan-500/30 text-white font-mono text-sm" 
                        />
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={handleCopyToClipboard} 
                          className="btn-tech border-cyan-500/30 shrink-0"
                        >
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="glass-card-dark p-4 rounded-lg border border-yellow-500/30">
                      <div className="flex items-start">
                        <Clock className="w-5 h-5 text-yellow-400 mr-3 mt-1 shrink-0" />
                        <div>
                          <div className="text-yellow-400 font-mono text-sm font-bold">IMPORTANT</div>
                          <div className="text-gray-300 text-sm mt-1">
                            Après le paiement, cliquez sur "CONFIRMER PAIEMENT" pour activer votre bot.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="capital">
              <div className="py-4 space-y-6 text-center">
                <div className="glass-card-dark p-6 rounded-lg">
                  <Wallet className="w-16 h-16 mx-auto text-purple-400 mb-4"/>
                  <h3 className="text-xl font-bold font-mono mb-3">ACTIVATION INSTANTANÉE</h3>
                  <p className="text-cyan-200 mb-4">
                    Utilisation de <span className="font-bold text-white font-mono">
                      {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(selectedPlan?.price || 0)}
                    </span> de votre capital pour activer le {selectedPlan?.name}.
                  </p>
                  <div className="text-sm text-gray-400">
                    Votre bot commencera à trader immédiatement après confirmation.
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button 
              onClick={handleConfirmInvestment} 
              className="w-full btn-tech py-3 text-lg font-bold neon-border animate-pulse-neon"
            >
              {paymentMethod === 'deposit' ? (
                <>
                  <Clock className="w-5 h-5 mr-2" />
                  CONFIRMER PAIEMENT
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  ACTIVER BOT MAINTENANT
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InvestmentPlans;