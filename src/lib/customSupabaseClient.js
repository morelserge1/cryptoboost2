
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tables schema helpers
export const TABLES = {
  USERS: 'users',
  TRANSACTIONS: 'transactions',
  INVESTMENTS: 'investments',
  DEPOSITS: 'deposits',
  WITHDRAWALS: 'withdrawals',
  SETTINGS: 'settings'
};

// Helper functions for database operations
export const dbHelpers = {
  // User operations
  async createUser(userData) {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .insert([userData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUserById(userId) {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateUser(userId, updates) {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Transaction operations
  async createTransaction(transactionData) {
    const { data, error } = await supabase
      .from(TABLES.TRANSACTIONS)
      .insert([transactionData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUserTransactions(userId) {
    const { data, error } = await supabase
      .from(TABLES.TRANSACTIONS)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Investment operations
  async createInvestment(investmentData) {
    const { data, error } = await supabase
      .from(TABLES.INVESTMENTS)
      .insert([investmentData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUserInvestments(userId) {
    const { data, error } = await supabase
      .from(TABLES.INVESTMENTS)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Deposit operations
  async createDeposit(depositData) {
    const { data, error } = await supabase
      .from(TABLES.DEPOSITS)
      .insert([depositData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getPendingDeposits() {
    const { data, error } = await supabase
      .from(TABLES.DEPOSITS)
      .select('*, users(*)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async updateDeposit(depositId, updates) {
    const { data, error } = await supabase
      .from(TABLES.DEPOSITS)
      .update(updates)
      .eq('id', depositId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Withdrawal operations
  async createWithdrawal(withdrawalData) {
    const { data, error } = await supabase
      .from(TABLES.WITHDRAWALS)
      .insert([withdrawalData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getPendingWithdrawals() {
    const { data, error } = await supabase
      .from(TABLES.WITHDRAWALS)
      .select('*, users(*)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async updateWithdrawal(withdrawalId, updates) {
    const { data, error } = await supabase
      .from(TABLES.WITHDRAWALS)
      .update(updates)
      .eq('id', withdrawalId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateInvestment(investmentId, updates) {
    const { data, error } = await supabase
      .from(TABLES.INVESTMENTS)
      .update(updates)
      .eq('id', investmentId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Settings operations
  async getSettings() {
    const { data, error } = await supabase
      .from(TABLES.SETTINGS)
      .select('*')
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateSettings(updates) {
    const { data, error } = await supabase
      .from(TABLES.SETTINGS)
      .upsert(updates)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Admin operations
  async getAllUsers() {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async deleteUser(userId) {
    const { error } = await supabase
      .from(TABLES.USERS)
      .delete()
      .eq('id', userId);
    
    if (error) throw error;
    return true;
  }
};
