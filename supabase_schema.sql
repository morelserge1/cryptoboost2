-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) DEFAULT 'client' CHECK (role IN ('client', 'admin')),
  balance DECIMAL(15,2) DEFAULT 0,
  invested_amount DECIMAL(15,2) DEFAULT 0,
  total_profit DECIMAL(15,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'investment', 'profit')),
  amount DECIMAL(15,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  crypto_type VARCHAR(10),
  transaction_hash VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Investments table
CREATE TABLE IF NOT EXISTS investments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  expected_profit DECIMAL(10,2),
  final_profit_target DECIMAL(10,2),
  duration_days INTEGER DEFAULT 30,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'stopped')),
  approval_date TIMESTAMP WITH TIME ZONE,
  is_complete BOOLEAN DEFAULT FALSE,
  crypto_type TEXT,
  crypto_amount DECIMAL(20,8),
  paid_with TEXT,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deposits table
CREATE TABLE IF NOT EXISTS deposits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  crypto_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_comment TEXT,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Withdrawals table  
CREATE TABLE IF NOT EXISTS withdrawals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) DEFAULT 0,
  crypto_type TEXT NOT NULL,
  address TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note TEXT,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  btc_address VARCHAR(255),
  eth_address VARCHAR(255),
  sol_address VARCHAR(255),
  fee_wallet_address VARCHAR(255),
  withdrawal_fee_percent DECIMAL(5,2) DEFAULT 3.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_deposits_user_id ON deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_deposits_status ON deposits(status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_investments_updated_at BEFORE UPDATE ON investments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deposits_updated_at BEFORE UPDATE ON deposits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_withdrawals_updated_at BEFORE UPDATE ON withdrawals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Transactions
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Investments
CREATE POLICY "Users can view own investments" ON investments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own investments" ON investments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Deposits
CREATE POLICY "Users can view own deposits" ON deposits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own deposits" ON deposits FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Withdrawals
CREATE POLICY "Users can view own withdrawals" ON withdrawals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own withdrawals" ON withdrawals FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Settings (admin only)
CREATE POLICY "Only admins can access settings" ON settings FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Admin policies (admins can see all data)
CREATE POLICY "Admins can view all users" ON users FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can view all transactions" ON transactions FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can view all investments" ON investments FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can view all deposits" ON deposits FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can view all withdrawals" ON withdrawals FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Insert default admin user
INSERT INTO users (id, email, role, created_at) 
VALUES ('00000000-0000-0000-0000-000000000000', 'admin@cryptoboost.com', 'admin', NOW())
ON CONFLICT (email) DO NOTHING;

-- Insert default settings
INSERT INTO settings (btc_address, eth_address, sol_address, fee_wallet_address)
VALUES ('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', '0x0000000000000000000000000000000000000000', 'So11111111111111111111111111111111111111112', '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2')
ON CONFLICT DO NOTHING;

-- Function to add profit to user balance
CREATE OR REPLACE FUNCTION add_profit_to_balance(user_id UUID, profit_amount DECIMAL)
RETURNS VOID AS $$
BEGIN
    UPDATE users 
    SET balance = balance + profit_amount,
        total_profit = total_profit + profit_amount,
        updated_at = NOW()
    WHERE id = user_id;

    -- Create transaction record
    INSERT INTO transactions (user_id, type, amount, status, created_at)
    VALUES (user_id, 'profit', profit_amount, 'completed', NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle deposit approval
CREATE OR REPLACE FUNCTION handle_deposit_approval()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
        -- Update user balance
        UPDATE users 
        SET balance = balance + NEW.amount,
            updated_at = NOW()
        WHERE email = NEW.user_email;
        
        -- Create transaction record
        INSERT INTO transactions (user_id, type, amount, status, crypto_type, created_at)
        SELECT id, 'deposit', NEW.amount, 'completed', NEW.crypto_type, NOW()
        FROM users WHERE email = NEW.user_email;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle withdrawal approval
CREATE OR REPLACE FUNCTION handle_withdrawal_approval()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
        -- Deduct from user balance
        UPDATE users 
        SET balance = balance - NEW.amount,
            updated_at = NOW()
        WHERE email = NEW.user_email;
        
        -- Create transaction record
        INSERT INTO transactions (user_id, type, amount, status, crypto_type, created_at)
        SELECT id, 'withdrawal', -NEW.amount, 'completed', NEW.crypto_type, NOW()
        FROM users WHERE email = NEW.user_email;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER deposit_approval_trigger
    AFTER UPDATE ON deposits
    FOR EACH ROW
    EXECUTE FUNCTION handle_deposit_approval();

CREATE TRIGGER withdrawal_approval_trigger
    AFTER UPDATE ON withdrawals
    FOR EACH ROW
    EXECUTE FUNCTION handle_withdrawal_approval();