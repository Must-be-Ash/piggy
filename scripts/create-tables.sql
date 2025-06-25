-- Create users table for storing creator profiles
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  address VARCHAR(42) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  bio TEXT,
  slug VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create donations table for tracking donations (optional)
CREATE TABLE IF NOT EXISTS donations (
  id SERIAL PRIMARY KEY,
  recipient_address VARCHAR(42) NOT NULL,
  sender_address VARCHAR(42),
  token_address VARCHAR(42),
  token_symbol VARCHAR(10) NOT NULL,
  amount VARCHAR(50) NOT NULL,
  amount_usd DECIMAL(10,2),
  tx_hash VARCHAR(66) UNIQUE NOT NULL,
  chain_id INTEGER NOT NULL,
  block_number BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recipient_address) REFERENCES users(address)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_address ON users(address);
CREATE INDEX IF NOT EXISTS idx_users_slug ON users(slug);
CREATE INDEX IF NOT EXISTS idx_donations_recipient ON donations(recipient_address);
CREATE INDEX IF NOT EXISTS idx_donations_tx_hash ON donations(tx_hash);
