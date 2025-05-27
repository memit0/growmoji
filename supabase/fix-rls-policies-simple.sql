-- Simple RLS Policies for Proper User Isolation
-- This script creates RLS policies that work well with Clerk authentication
-- and require explicit user_id filtering in application queries

-- Temporarily disable RLS to update policies
ALTER TABLE habits DISABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE todos DISABLE ROW LEVEL SECURITY;
ALTER TABLE timer_settings DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS habits_authenticated_access ON habits;
DROP POLICY IF EXISTS habits_anon_access ON habits;
DROP POLICY IF EXISTS habits_user_access ON habits;
DROP POLICY IF EXISTS habit_logs_authenticated_access ON habit_logs;
DROP POLICY IF EXISTS habit_logs_anon_access ON habit_logs;
DROP POLICY IF EXISTS habit_logs_user_access ON habit_logs;
DROP POLICY IF EXISTS todos_authenticated_access ON todos;
DROP POLICY IF EXISTS todos_anon_access ON todos;
DROP POLICY IF EXISTS todos_user_access ON todos;
DROP POLICY IF EXISTS timer_settings_authenticated_access ON timer_settings;
DROP POLICY IF EXISTS timer_settings_anon_access ON timer_settings;
DROP POLICY IF EXISTS timer_settings_user_access ON timer_settings;

-- Re-enable RLS
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE timer_settings ENABLE ROW LEVEL SECURITY;

-- Create simple permissive policies for authenticated users
-- The application layer will handle user_id filtering
-- Service role bypasses RLS completely

-- Habits: Allow all operations for authenticated users
CREATE POLICY habits_policy ON habits
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Habit logs: Allow all operations for authenticated users  
CREATE POLICY habit_logs_policy ON habit_logs
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Todos: Allow all operations for authenticated users
CREATE POLICY todos_policy ON todos
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Timer settings: Allow all operations for authenticated users
CREATE POLICY timer_settings_policy ON timer_settings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Note: This approach relies on the application to always filter by user_id
-- The mobile and web apps MUST include .eq('user_id', userId) in all queries
-- Service role automatically bypasses RLS for server-side operations 