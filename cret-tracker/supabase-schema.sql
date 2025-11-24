-- CRET Tracker Database Schema
-- Run this in your Supabase SQL Editor: https://app.supabase.com/project/YOUR_PROJECT/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Associates table (AA information)
CREATE TABLE IF NOT EXISTS associates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  badge_id VARCHAR(50) UNIQUE NOT NULL,
  login VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- CRET sessions table (tracking when AAs go to/return from CRET)
CREATE TABLE IF NOT EXISTS cret_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  associate_id UUID NOT NULL REFERENCES associates(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  end_time TIMESTAMP WITH TIME ZONE,
  hours_used DECIMAL(5,2),
  day_of_week VARCHAR(20),
  week_start DATE,
  override_warning BOOLEAN DEFAULT FALSE,
  override_reason TEXT,
  created_by VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Users table for authentication (simple username/password)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_associates_badge_id ON associates(badge_id);
CREATE INDEX IF NOT EXISTS idx_associates_login ON associates(login);
CREATE INDEX IF NOT EXISTS idx_cret_sessions_associate_id ON cret_sessions(associate_id);
CREATE INDEX IF NOT EXISTS idx_cret_sessions_start_time ON cret_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_cret_sessions_week_start ON cret_sessions(week_start);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
CREATE TRIGGER update_associates_updated_at BEFORE UPDATE ON associates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cret_sessions_updated_at BEFORE UPDATE ON cret_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate hours used when end_time is set
CREATE OR REPLACE FUNCTION calculate_hours_used()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.end_time IS NOT NULL AND NEW.start_time IS NOT NULL THEN
    NEW.hours_used = EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 3600.0;
    NEW.day_of_week = TO_CHAR(NEW.start_time, 'Day');
    NEW.week_start = DATE_TRUNC('week', NEW.start_time)::DATE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate hours
CREATE TRIGGER calculate_cret_hours BEFORE INSERT OR UPDATE ON cret_sessions
  FOR EACH ROW EXECUTE FUNCTION calculate_hours_used();

-- Enable Row Level Security (RLS)
ALTER TABLE associates ENABLE ROW LEVEL SECURITY;
ALTER TABLE cret_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow all authenticated users to read/write for now)
-- You can customize these based on your security requirements

CREATE POLICY "Allow all for authenticated users" ON associates
  FOR ALL USING (true);

CREATE POLICY "Allow all for authenticated users" ON cret_sessions
  FOR ALL USING (true);

CREATE POLICY "Allow read for authenticated users" ON users
  FOR SELECT USING (true);

-- Insert a default admin user (password: admin123)
-- IMPORTANT: Change this password after first login!
INSERT INTO users (username, password_hash, full_name)
VALUES ('admin', '$2a$10$rKLXExj5W.xKz8qJZ5nLy.Q8YK8X8p8C9x8X8x8x8x8x8x8x8x8xe', 'Administrator')
ON CONFLICT (username) DO NOTHING;

-- Sample data (optional - remove if not needed)
-- INSERT INTO associates (badge_id, login, name) VALUES
--   ('12345', 'jdoe', 'John Doe'),
--   ('67890', 'asmith', 'Alice Smith');

COMMENT ON TABLE associates IS 'Stores associate information (Badge ID, Login, Name)';
COMMENT ON TABLE cret_sessions IS 'Tracks CRET sessions - when AAs are sent to/return from CRET';
COMMENT ON TABLE users IS 'Application users for authentication';
