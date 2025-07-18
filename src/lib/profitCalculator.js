// Server-side profit calculation and background jobs
import { localDB, DB_KEYS } from './localDatabase.js';

// Profit calculation constants
const PROFIT_RATES = {
  starter: 0.15,    // 15% per month
  pro: 0.25,        // 25% per month
  expert: 0.40      // 40% per month
};

const PLAN_DURATIONS = {
  starter: 30,      // 30 days
  pro: 30,          // 30 days
  expert: 30        // 30 days
};

// Calculate daily profit rate
function getDailyProfitRate(planName) {
  const monthlyRate = PROFIT_RATES[planName.toLowerCase()] || 0;
  return monthlyRate / 30; // Convert to daily rate
}

// Calculate current profit for an investment
function calculateCurrentProfit(investment) {
  const now = new Date();
  const approvalDate = new Date(investment.approval_date);
  const daysPassed = Math.floor((now - approvalDate) / (1000 * 60 * 60 * 24));
  
  if (daysPassed <= 0) return 0;
  
  const dailyRate = getDailyProfitRate(investment.plan_name);
  const currentProfit = investment.amount * dailyRate * daysPassed;
  
  // Cap at expected profit
  return Math.min(currentProfit, investment.expected_profit || 0);
}

// Update profits for all active investments
export function updateAllProfits() {
  try {
    const investments = localDB.getAll(DB_KEYS.INVESTMENTS);
    const activeInvestments = investments.filter(inv => 
      inv.status === 'approved' && !inv.is_complete
    );

    activeInvestments.forEach(investment => {
      const currentProfit = calculateCurrentProfit(investment);
      const targetProfit = investment.expected_profit || 0;
      
      // Check if investment is complete
      const now = new Date();
      const approvalDate = new Date(investment.approval_date);
      const daysPassed = Math.floor((now - approvalDate) / (1000 * 60 * 60 * 24));
      const duration = PLAN_DURATIONS[investment.plan_name.toLowerCase()] || 30;
      
      if (daysPassed >= duration || currentProfit >= targetProfit) {
        // Mark as complete and add final profit to user balance
        localDB.update(DB_KEYS.INVESTMENTS, investment.id, {
          is_complete: true,
          final_profit_target: targetProfit
        });
        
        // Add profit to user balance
        const user = localDB.getById(DB_KEYS.USERS, investment.user_id);
        if (user) {
          const newBalance = (user.balance || 0) + targetProfit + investment.amount;
          const newTotalProfit = (user.total_profit || 0) + targetProfit;
          
          localDB.update(DB_KEYS.USERS, user.id, {
            balance: newBalance,
            total_profit: newTotalProfit
          });
          
          // Create transaction record
          localDB.insert(DB_KEYS.TRANSACTIONS, {
            user_id: user.id,
            type: 'profit',
            amount: targetProfit,
            status: 'completed',
            notes: `Profit from ${investment.plan_name} plan`
          });
        }
      }
    });
    
    console.log(`Updated profits for ${activeInvestments.length} investments`);
  } catch (error) {
    console.error('Error updating profits:', error);
  }
}

// Handle deposit approval
export function handleDepositApproval(depositId) {
  try {
    const deposit = localDB.getById(DB_KEYS.DEPOSITS, depositId);
    if (!deposit || deposit.status !== 'approved') return;
    
    const users = localDB.getAll(DB_KEYS.USERS);
    const user = users.find(u => u.email === deposit.user_email);
    
    if (user) {
      const newBalance = (user.balance || 0) + deposit.amount;
      localDB.update(DB_KEYS.USERS, user.id, { balance: newBalance });
      
      // Create transaction record
      localDB.insert(DB_KEYS.TRANSACTIONS, {
        user_id: user.id,
        type: 'deposit',
        amount: deposit.amount,
        status: 'completed',
        crypto_type: deposit.crypto_type,
        notes: 'Deposit approved by admin'
      });
    }
  } catch (error) {
    console.error('Error handling deposit approval:', error);
  }
}

// Handle withdrawal approval
export function handleWithdrawalApproval(withdrawalId) {
  try {
    const withdrawal = localDB.getById(DB_KEYS.WITHDRAWALS, withdrawalId);
    if (!withdrawal || withdrawal.status !== 'approved') return;
    
    const users = localDB.getAll(DB_KEYS.USERS);
    const user = users.find(u => u.email === withdrawal.user_email);
    
    if (user) {
      const totalAmount = withdrawal.amount + (withdrawal.tax || 0);
      const newBalance = (user.balance || 0) - totalAmount;
      localDB.update(DB_KEYS.USERS, user.id, { balance: Math.max(0, newBalance) });
      
      // Create transaction record
      localDB.insert(DB_KEYS.TRANSACTIONS, {
        user_id: user.id,
        type: 'withdrawal',
        amount: -totalAmount,
        status: 'completed',
        crypto_type: withdrawal.crypto_type,
        notes: 'Withdrawal approved by admin'
      });
    }
  } catch (error) {
    console.error('Error handling withdrawal approval:', error);
  }
}

// Start background profit calculation job
export function startProfitCalculationJob() {
  // Update profits every 5 minutes
  setInterval(() => {
    updateAllProfits();
  }, 5 * 60 * 1000);
  
  // Initial update
  updateAllProfits();
  
  console.log('Profit calculation job started');
}

// Get investment statistics
export function getInvestmentStats() {
  try {
    const investments = localDB.getAll(DB_KEYS.INVESTMENTS);
    const users = localDB.getAll(DB_KEYS.USERS);
    
    const stats = {
      totalInvestments: investments.length,
      activeInvestments: investments.filter(inv => inv.status === 'approved' && !inv.is_complete).length,
      completedInvestments: investments.filter(inv => inv.is_complete).length,
      totalInvestedAmount: investments.reduce((sum, inv) => sum + (inv.amount || 0), 0),
      totalProfitPaid: users.reduce((sum, user) => sum + (user.total_profit || 0), 0),
      totalUsers: users.length,
      activeUsers: users.filter(user => user.is_active).length
    };
    
    return stats;
  } catch (error) {
    console.error('Error getting investment stats:', error);
    return {};
  }
}