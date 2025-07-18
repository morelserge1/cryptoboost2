// Local Supabase client implementation
import { localDB, localAuth, DB_KEYS } from './localDatabase.js';

// Simulate Supabase client
export const supabase = {
  auth: localAuth,
  
  // Simulate from() method
  from(table) {
    return new LocalTable(table);
  }
};

class LocalTable {
  constructor(tableName) {
    this.tableName = this.getTableKey(tableName);
    this.selectFields = '*';
    this.filters = [];
    this.orderBy = null;
    this.limitCount = null;
    this.singleRecord = false;
  }

  getTableKey(tableName) {
    const tableMap = {
      'users': DB_KEYS.USERS,
      'transactions': DB_KEYS.TRANSACTIONS,
      'investments': DB_KEYS.INVESTMENTS,
      'deposits': DB_KEYS.DEPOSITS,
      'withdrawals': DB_KEYS.WITHDRAWALS,
      'settings': DB_KEYS.SETTINGS
    };
    return tableMap[tableName] || tableName;
  }

  select(fields = '*') {
    this.selectFields = fields;
    return this;
  }

  eq(field, value) {
    this.filters.push({ type: 'eq', field, value });
    return this;
  }

  neq(field, value) {
    this.filters.push({ type: 'neq', field, value });
    return this;
  }

  gt(field, value) {
    this.filters.push({ type: 'gt', field, value });
    return this;
  }

  gte(field, value) {
    this.filters.push({ type: 'gte', field, value });
    return this;
  }

  lt(field, value) {
    this.filters.push({ type: 'lt', field, value });
    return this;
  }

  lte(field, value) {
    this.filters.push({ type: 'lte', field, value });
    return this;
  }

  like(field, value) {
    this.filters.push({ type: 'like', field, value });
    return this;
  }

  in(field, values) {
    this.filters.push({ type: 'in', field, values });
    return this;
  }

  order(field, options = {}) {
    this.orderBy = { field, ascending: options.ascending !== false };
    return this;
  }

  limit(count) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.singleRecord = true;
    return this;
  }

  applyFilters(data) {
    return data.filter(item => {
      return this.filters.every(filter => {
        const fieldValue = item[filter.field];
        
        switch (filter.type) {
          case 'eq':
            return fieldValue === filter.value;
          case 'neq':
            return fieldValue !== filter.value;
          case 'gt':
            return fieldValue > filter.value;
          case 'gte':
            return fieldValue >= filter.value;
          case 'lt':
            return fieldValue < filter.value;
          case 'lte':
            return fieldValue <= filter.value;
          case 'like':
            return String(fieldValue).toLowerCase().includes(String(filter.value).toLowerCase());
          case 'in':
            return filter.values.includes(fieldValue);
          default:
            return true;
        }
      });
    });
  }

  applyOrder(data) {
    if (!this.orderBy) return data;
    
    return [...data].sort((a, b) => {
      const aValue = a[this.orderBy.field];
      const bValue = b[this.orderBy.field];
      
      if (aValue < bValue) return this.orderBy.ascending ? -1 : 1;
      if (aValue > bValue) return this.orderBy.ascending ? 1 : -1;
      return 0;
    });
  }

  applyLimit(data) {
    if (this.limitCount === null) return data;
    return data.slice(0, this.limitCount);
  }

  async insert(records) {
    return new Promise((resolve) => {
      try {
        const recordsArray = Array.isArray(records) ? records : [records];
        const insertedRecords = recordsArray.map(record => localDB.insert(this.tableName, record));
        
        resolve({
          data: this.singleRecord ? insertedRecords[0] : insertedRecords,
          error: null
        });
      } catch (error) {
        resolve({ data: null, error });
      }
    });
  }

  async update(updates) {
    return new Promise((resolve) => {
      try {
        const data = localDB.getAll(this.tableName);
        const filteredData = this.applyFilters(data);
        
        if (filteredData.length === 0) {
          resolve({ data: null, error: { message: 'No records found to update' } });
          return;
        }

        const updatedRecords = filteredData.map(record => {
          return localDB.update(this.tableName, record.id, updates);
        });

        resolve({
          data: this.singleRecord ? updatedRecords[0] : updatedRecords,
          error: null
        });
      } catch (error) {
        resolve({ data: null, error });
      }
    });
  }

  async delete() {
    return new Promise((resolve) => {
      try {
        const data = localDB.getAll(this.tableName);
        const filteredData = this.applyFilters(data);
        
        filteredData.forEach(record => {
          localDB.delete(this.tableName, record.id);
        });

        resolve({ data: filteredData, error: null });
      } catch (error) {
        resolve({ data: null, error });
      }
    });
  }

  async upsert(records) {
    return new Promise((resolve) => {
      try {
        const recordsArray = Array.isArray(records) ? records : [records];
        const data = localDB.getAll(this.tableName);
        const upsertedRecords = [];

        recordsArray.forEach(record => {
          const existingRecord = data.find(item => item.id === record.id);
          
          if (existingRecord) {
            const updated = localDB.update(this.tableName, record.id, record);
            upsertedRecords.push(updated);
          } else {
            const inserted = localDB.insert(this.tableName, record);
            upsertedRecords.push(inserted);
          }
        });

        resolve({
          data: this.singleRecord ? upsertedRecords[0] : upsertedRecords,
          error: null
        });
      } catch (error) {
        resolve({ data: null, error });
      }
    });
  }

  // Execute the query
  async then(resolve, reject) {
    try {
      let data = localDB.getAll(this.tableName);
      
      // Apply filters
      data = this.applyFilters(data);
      
      // Apply ordering
      data = this.applyOrder(data);
      
      // Apply limit
      data = this.applyLimit(data);
      
      // Handle joins for related data (simplified)
      if (this.selectFields.includes('users(')) {
        data = data.map(item => {
          if (item.user_email) {
            const users = localDB.getAll(DB_KEYS.USERS);
            const user = users.find(u => u.email === item.user_email);
            return { ...item, users: user };
          }
          return item;
        });
      }
      
      const result = {
        data: this.singleRecord ? (data[0] || null) : data,
        error: null
      };
      
      resolve(result);
    } catch (error) {
      const result = { data: null, error };
      if (reject) {
        reject(result);
      } else {
        resolve(result);
      }
    }
  }
}

// Tables schema helpers
export const TABLES = {
  USERS: 'users',
  TRANSACTIONS: 'transactions',
  INVESTMENTS: 'investments',
  DEPOSITS: 'deposits',
  WITHDRAWALS: 'withdrawals',
  SETTINGS: 'settings'
};

// Helper functions for database operations - compatible with Supabase client
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

  async getUserByEmail(email) {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        if (error.message && error.message.includes('not found')) {
          return null;
        }
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      throw error;
    }
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

  async getInvestmentsByUserEmail(userEmail) {
    const { data, error } = await supabase
      .from(TABLES.INVESTMENTS)
      .select('*')
      .eq('user_email', userEmail)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
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
  },

  async addProfitToUserBalance(userId, profit, initialInvestment) {
    const user = await this.getUserById(userId);
    const updatedUser = {
      balance: (user.balance || 0) + profit + initialInvestment,
      total_profit: (user.total_profit || 0) + profit
    };
    
    return await this.updateUser(userId, updatedUser);
  }
};