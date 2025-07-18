// Local database implementation compatible with Supabase structure
import { v4 as uuidv4 } from 'uuid';

// Database keys for localStorage
const DB_KEYS = {
  USERS: 'cryptoboost_users',
  TRANSACTIONS: 'cryptoboost_transactions',
  INVESTMENTS: 'cryptoboost_investments',
  DEPOSITS: 'cryptoboost_deposits',
  WITHDRAWALS: 'cryptoboost_withdrawals',
  SETTINGS: 'cryptoboost_settings',
  AUTH_SESSION: 'cryptoboost_auth_session'
};

// Default settings
const DEFAULT_SETTINGS = {
  id: uuidv4(),
  btc_address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
  eth_address: '0x0000000000000000000000000000000000000000',
  sol_address: 'So11111111111111111111111111111111111111112',
  fee_wallet_address: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
  withdrawal_fee_percent: 3.0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Initialize database
export const initDatabase = () => {
  if (!localStorage.getItem(DB_KEYS.USERS)) {
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify([]));
  }
  if (!localStorage.getItem(DB_KEYS.TRANSACTIONS)) {
    localStorage.setItem(DB_KEYS.TRANSACTIONS, JSON.stringify([]));
  }
  if (!localStorage.getItem(DB_KEYS.INVESTMENTS)) {
    localStorage.setItem(DB_KEYS.INVESTMENTS, JSON.stringify([]));
  }
  if (!localStorage.getItem(DB_KEYS.DEPOSITS)) {
    localStorage.setItem(DB_KEYS.DEPOSITS, JSON.stringify([]));
  }
  if (!localStorage.getItem(DB_KEYS.WITHDRAWALS)) {
    localStorage.setItem(DB_KEYS.WITHDRAWALS, JSON.stringify([]));
  }
  if (!localStorage.getItem(DB_KEYS.SETTINGS)) {
    localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
  }
  
  // Create default admin user
  const users = JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]');
  const adminExists = users.find(u => u.email === 'admin@cryptoboost.com');
  
  if (!adminExists) {
    const adminUser = {
      id: '00000000-0000-0000-0000-000000000000',
      email: 'admin@cryptoboost.com',
      role: 'admin',
      balance: 100000,
      invested_amount: 0,
      total_profit: 0,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    users.push(adminUser);
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
  }
};

// Generic database operations
class LocalDatabase {
  constructor() {
    initDatabase();
  }

  // Get all records from a table
  getAll(table) {
    try {
      const data = localStorage.getItem(table);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error getting all from ${table}:`, error);
      return [];
    }
  }

  // Get a single record by ID
  getById(table, id) {
    try {
      const data = this.getAll(table);
      return data.find(item => item.id === id) || null;
    } catch (error) {
      console.error(`Error getting by ID from ${table}:`, error);
      return null;
    }
  }

  // Get records by criteria
  getBy(table, criteria) {
    try {
      const data = this.getAll(table);
      return data.filter(item => {
        return Object.keys(criteria).every(key => item[key] === criteria[key]);
      });
    } catch (error) {
      console.error(`Error getting by criteria from ${table}:`, error);
      return [];
    }
  }

  // Insert a new record
  insert(table, record) {
    try {
      const data = this.getAll(table);
      const newRecord = {
        ...record,
        id: record.id || uuidv4(),
        created_at: record.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      data.push(newRecord);
      localStorage.setItem(table, JSON.stringify(data));
      return newRecord;
    } catch (error) {
      console.error(`Error inserting into ${table}:`, error);
      throw error;
    }
  }

  // Update a record
  update(table, id, updates) {
    try {
      const data = this.getAll(table);
      const index = data.findIndex(item => item.id === id);
      
      if (index === -1) {
        throw new Error(`Record with id ${id} not found`);
      }
      
      data[index] = {
        ...data[index],
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      localStorage.setItem(table, JSON.stringify(data));
      return data[index];
    } catch (error) {
      console.error(`Error updating ${table}:`, error);
      throw error;
    }
  }

  // Delete a record
  delete(table, id) {
    try {
      const data = this.getAll(table);
      const filteredData = data.filter(item => item.id !== id);
      localStorage.setItem(table, JSON.stringify(filteredData));
      return true;
    } catch (error) {
      console.error(`Error deleting from ${table}:`, error);
      throw error;
    }
  }

  // Upsert (insert or update)
  upsert(table, record, criteria = {}) {
    try {
      const existing = this.getBy(table, criteria);
      
      if (existing.length > 0) {
        return this.update(table, existing[0].id, record);
      } else {
        return this.insert(table, record);
      }
    } catch (error) {
      console.error(`Error upserting in ${table}:`, error);
      throw error;
    }
  }
}

export const localDB = new LocalDatabase();

// Auth simulation
export const localAuth = {
  currentUser: null,
  
  // Get current session
  getSession() {
    return new Promise((resolve) => {
      try {
        const session = localStorage.getItem(DB_KEYS.AUTH_SESSION);
        if (session) {
          const sessionData = JSON.parse(session);
          this.currentUser = sessionData.user;
          resolve({ data: { session: sessionData }, error: null });
        } else {
          resolve({ data: { session: null }, error: null });
        }
      } catch (error) {
        resolve({ data: { session: null }, error });
      }
    });
  },

  // Sign in with email and password
  signInWithPassword({ email, password }) {
    return new Promise((resolve) => {
      try {
        const users = localDB.getAll(DB_KEYS.USERS);
        const user = users.find(u => u.email === email);
        
        if (!user) {
          resolve({ data: null, error: { message: 'User not found' } });
          return;
        }

        if (!user.is_active) {
          resolve({ data: null, error: { message: 'Account is suspended' } });
          return;
        }

        // In a real app, you'd verify password here
        // For demo purposes, we'll accept any password for existing users
        const sessionData = {
          user: { id: user.id, email: user.email },
          access_token: 'dummy-token-' + user.id,
          refresh_token: 'dummy-refresh-' + user.id
        };

        localStorage.setItem(DB_KEYS.AUTH_SESSION, JSON.stringify(sessionData));
        this.currentUser = sessionData.user;
        
        resolve({ data: sessionData, error: null });
      } catch (error) {
        resolve({ data: null, error });
      }
    });
  },

  // Sign up with email and password
  signUp({ email, password }) {
    return new Promise((resolve) => {
      try {
        const users = localDB.getAll(DB_KEYS.USERS);
        const existingUser = users.find(u => u.email === email);
        
        if (existingUser) {
          resolve({ data: null, error: { message: 'User already exists' } });
          return;
        }

        const newUser = {
          id: uuidv4(),
          email,
          role: 'client',
          balance: 0,
          invested_amount: 0,
          total_profit: 0,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        localDB.insert(DB_KEYS.USERS, newUser);

        const sessionData = {
          user: { id: newUser.id, email: newUser.email },
          access_token: 'dummy-token-' + newUser.id,
          refresh_token: 'dummy-refresh-' + newUser.id
        };

        localStorage.setItem(DB_KEYS.AUTH_SESSION, JSON.stringify(sessionData));
        this.currentUser = sessionData.user;
        
        resolve({ data: sessionData, error: null });
      } catch (error) {
        resolve({ data: null, error });
      }
    });
  },

  // Sign out
  signOut() {
    return new Promise((resolve) => {
      try {
        localStorage.removeItem(DB_KEYS.AUTH_SESSION);
        this.currentUser = null;
        resolve({ error: null });
      } catch (error) {
        resolve({ error });
      }
    });
  },

  // Auth state change listener
  onAuthStateChange(callback) {
    // Simple implementation - in a real app this would be more sophisticated
    const checkAuth = () => {
      const session = localStorage.getItem(DB_KEYS.AUTH_SESSION);
      if (session) {
        try {
          const sessionData = JSON.parse(session);
          callback('SIGNED_IN', sessionData);
        } catch (error) {
          callback('SIGNED_OUT', null);
        }
      } else {
        callback('SIGNED_OUT', null);
      }
    };

    // Check immediately
    checkAuth();

    // Return a subscription object
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            // In a real implementation, this would remove the listener
          }
        }
      }
    };
  }
};

export { DB_KEYS };