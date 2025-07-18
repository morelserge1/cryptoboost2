
import React, { useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from '@/components/ui/use-toast';

const RealtimeNotifications = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Listen for investment updates
    const investmentSubscription = supabase
      .channel('investment_updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'investments',
          filter: `user_email=eq.${user.email}`
        },
        (payload) => {
          const { new: newInvestment, old: oldInvestment } = payload;
          
          if (oldInvestment.status === 'pending' && newInvestment.status === 'approved') {
            toast({
              title: "🚀 Investissement Approuvé!",
              description: `Votre ${newInvestment.plan_name} est maintenant actif.`,
              duration: 5000,
            });
          } else if (oldInvestment.status === 'pending' && newInvestment.status === 'rejected') {
            toast({
              title: "❌ Investissement Rejeté",
              description: `Votre ${newInvestment.plan_name} a été rejeté.`,
              duration: 5000,
            });
          }
        }
      )
      .subscribe();

    // Listen for deposit updates
    const depositSubscription = supabase
      .channel('deposit_updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'deposits',
          filter: `user_email=eq.${user.email}`
        },
        (payload) => {
          const { new: newDeposit, old: oldDeposit } = payload;
          
          if (oldDeposit.status === 'pending' && newDeposit.status === 'approved') {
            toast({
              title: "✅ Dépôt Approuvé!",
              description: `Votre dépôt de ${newDeposit.amount}€ a été validé.`,
              duration: 5000,
            });
          } else if (oldDeposit.status === 'pending' && newDeposit.status === 'rejected') {
            toast({
              title: "❌ Dépôt Rejeté",
              description: `Votre dépôt de ${newDeposit.amount}€ a été rejeté.`,
              duration: 5000,
            });
          }
        }
      )
      .subscribe();

    // Listen for withdrawal updates
    const withdrawalSubscription = supabase
      .channel('withdrawal_updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'withdrawals',
          filter: `user_email=eq.${user.email}`
        },
        (payload) => {
          const { new: newWithdrawal, old: oldWithdrawal } = payload;
          
          if (oldWithdrawal.status === 'pending' && newWithdrawal.status === 'approved') {
            toast({
              title: "💰 Retrait Approuvé!",
              description: `Votre retrait de ${newWithdrawal.amount}€ a été traité.`,
              duration: 5000,
            });
          } else if (oldWithdrawal.status === 'pending' && newWithdrawal.status === 'rejected') {
            toast({
              title: "❌ Retrait Rejeté",
              description: `Votre retrait de ${newWithdrawal.amount}€ a été rejeté.`,
              duration: 5000,
            });
          }
        }
      )
      .subscribe();

    return () => {
      investmentSubscription.unsubscribe();
      depositSubscription.unsubscribe();
      withdrawalSubscription.unsubscribe();
    };
  }, [user]);

  return null; // This component doesn't render anything
};

export default RealtimeNotifications;
