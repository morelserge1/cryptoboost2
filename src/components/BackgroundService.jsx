// Background service component for profit calculations
import { useEffect } from 'react';
import { startProfitCalculationJob } from '@/lib/profitCalculator';
import { localDB, DB_KEYS } from '@/lib/localDatabase';

export default function BackgroundService() {
  useEffect(() => {
    // Initialize database and start profit calculation job
    console.log('Starting background services...');
    
    // Start profit calculation job
    startProfitCalculationJob();
    
    // Create some test data for demonstration
    const createTestData = () => {
      const users = localDB.getAll(DB_KEYS.USERS);
      const testUser = users.find(u => u.email === 'test@example.com');
      
      if (!testUser) {
        // Create test user
        const newTestUser = localDB.insert(DB_KEYS.USERS, {
          email: 'test@example.com',
          role: 'client',
          balance: 1000,
          invested_amount: 0,
          total_profit: 0,
          is_active: true
        });
        
        console.log('Created test user:', newTestUser);
        
        // Create test investment
        localDB.insert(DB_KEYS.INVESTMENTS, {
          user_id: newTestUser.id,
          user_email: newTestUser.email,
          plan_name: 'starter',
          amount: 500,
          expected_profit: 75, // 15% of 500
          final_profit_target: 75,
          duration_days: 30,
          status: 'approved',
          approval_date: new Date().toISOString(),
          is_complete: false,
          paid_with: 'balance'
        });
        
        console.log('Created test investment');
      }
    };
    
    // Create test data after a short delay
    setTimeout(createTestData, 1000);
    
    return () => {
      // Cleanup if needed
      console.log('Background services stopped');
    };
  }, []);

  return null; // This component doesn't render anything
}