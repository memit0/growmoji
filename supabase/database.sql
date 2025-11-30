-- Drop existing objects to prevent errors on re-run
DROP FUNCTION IF EXISTS calculate_streak() CASCADE;
DROP FUNCTION IF EXISTS delete_user_data(user_id_param TEXT) CASCADE;

-- Drop tables (CASCADE handles dependent objects like policies, triggers, indexes, FKs)
DROP TABLE IF EXISTS habit_logs CASCADE;
DROP TABLE IF EXISTS habits CASCADE;
DROP TABLE IF EXISTS todos CASCADE;

-- Drop extensions
DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;

-- Drop extensions schema if it exists (for idempotency)
DROP SCHEMA IF EXISTS extensions CASCADE;

-- Create extensions schema
CREATE SCHEMA extensions;

-- Recreate database schema from a clean slate
-- Enable UUID extension in the 'extensions' schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- Create Habits Table
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id TEXT NOT NULL,
  emoji TEXT NOT NULL,
  start_date DATE NOT NULL,
  current_streak INTEGER DEFAULT 0,
  last_check_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Habit Logs Table
CREATE TABLE habit_logs (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  log_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(habit_id, log_date)
);

-- Create Todos Table
CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create Function for Streak Calculation
CREATE OR REPLACE FUNCTION calculate_streak() 
RETURNS TRIGGER AS $$
DECLARE
  last_log_date DATE;
  days_since_last INTEGER;
BEGIN
  -- Get the date of the previous log for this habit
  SELECT MAX(log_date) INTO last_log_date 
  FROM habit_logs 
  WHERE habit_id = NEW.habit_id AND log_date < NEW.log_date;
  
  -- Update the habit streak
  IF last_log_date IS NULL THEN
    -- First log for this habit
    UPDATE habits SET current_streak = 1, last_check_date = NEW.log_date WHERE id = NEW.habit_id;
  ELSE
    days_since_last := NEW.log_date - last_log_date;
    
    IF days_since_last = 1 THEN
      -- Consecutive day, increment streak
      UPDATE habits SET current_streak = current_streak + 1, last_check_date = NEW.log_date WHERE id = NEW.habit_id;
    ELSIF days_since_last = 2 THEN
      -- Missed one day, maintain streak but update last check date
      UPDATE habits SET last_check_date = NEW.log_date WHERE id = NEW.habit_id;
    ELSE
      -- Missed two or more days, reset streak
      UPDATE habits SET current_streak = 1, last_check_date = NEW.log_date WHERE id = NEW.habit_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public, pg_catalog, pg_temp;

-- Create Trigger for Streak Calculation
CREATE TRIGGER update_habit_streak
AFTER INSERT ON habit_logs
FOR EACH ROW EXECUTE FUNCTION calculate_streak();

-- Create Indexes for Performance
CREATE INDEX ON habits(user_id);
CREATE INDEX ON habit_logs(habit_id);
CREATE INDEX ON habit_logs(log_date);
CREATE INDEX ON todos(user_id);
CREATE INDEX ON todos(is_completed);

-- Enable Row Level Security for all tables
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for habits table
CREATE POLICY "Users can select their own habits"
ON habits FOR SELECT
USING ((select auth.uid())::text = user_id);

CREATE POLICY "Users can insert their own habits"
ON habits FOR INSERT
WITH CHECK ((select auth.uid())::text = user_id);

CREATE POLICY "Users can update their own habits"
ON habits FOR UPDATE
USING ((select auth.uid())::text = user_id)
WITH CHECK ((select auth.uid())::text = user_id);

CREATE POLICY "Users can delete their own habits"
ON habits FOR DELETE
USING ((select auth.uid())::text = user_id);

-- RLS Policies for todos table
CREATE POLICY "Users can select their own todos"
ON todos FOR SELECT
USING ((select auth.uid())::text = user_id);

CREATE POLICY "Users can insert their own todos"
ON todos FOR INSERT
WITH CHECK ((select auth.uid())::text = user_id);

CREATE POLICY "Users can update their own todos"
ON todos FOR UPDATE
USING ((select auth.uid())::text = user_id)
WITH CHECK ((select auth.uid())::text = user_id);

CREATE POLICY "Users can delete their own todos"
ON todos FOR DELETE
USING ((select auth.uid())::text = user_id);

-- RLS Policies for habit_logs table
CREATE POLICY "Users can select logs for their own habits"
ON habit_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM habits
    WHERE habits.id = habit_logs.habit_id
    AND habits.user_id = (select auth.uid())::text
  )
);

CREATE POLICY "Users can insert logs for their own habits"
ON habit_logs FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM habits
    WHERE habits.id = habit_logs.habit_id
    AND habits.user_id = (select auth.uid())::text
  )
);

CREATE POLICY "Users can update logs for their own habits"
ON habit_logs FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM habits
    WHERE habits.id = habit_logs.habit_id
    AND habits.user_id = (select auth.uid())::text
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM habits
    WHERE habits.id = habit_logs.habit_id
    AND habits.user_id = (select auth.uid())::text
  )
);

CREATE POLICY "Users can delete logs for their own habits"
ON habit_logs FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM habits
    WHERE habits.id = habit_logs.habit_id
    AND habits.user_id = (select auth.uid())::text
  )
);

-- Create Function for User Data Deletion
CREATE OR REPLACE FUNCTION delete_user_data(user_id_param TEXT)
RETURNS void AS $$
BEGIN
  -- Delete todos
  DELETE FROM todos WHERE user_id = user_id_param;
  
  -- Delete habits (this will cascade delete habit_logs due to FK constraint)
  DELETE FROM habits WHERE user_id = user_id_param;
  
  -- Any other user-related data cleanup can be added here
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp;

-- Optimized habit logging function that handles toggle and streak calculation server-side
CREATE OR REPLACE FUNCTION toggle_habit_log(
  habit_id UUID,
  user_id_param UUID,
  log_date DATE
) RETURNS TABLE(
  id UUID,
  user_id UUID,
  emoji TEXT,
  start_date DATE,
  current_streak INTEGER,
  last_check_date DATE,
  created_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  habit_record RECORD;
  log_exists BOOLEAN;
  new_streak INTEGER;
  new_last_check_date DATE;
BEGIN
  -- Check if habit exists and belongs to user
  SELECT * INTO habit_record
  FROM habits h
  WHERE h.id = habit_id AND h.user_id = user_id_param::text;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Habit not found or access denied';
  END IF;

  -- Check if log exists for today
  SELECT EXISTS(
    SELECT 1 FROM habit_logs hl 
    WHERE hl.habit_id = habit_id AND hl.log_date = log_date
  ) INTO log_exists;

  IF log_exists THEN
    -- Unlog: Delete today's log
    DELETE FROM habit_logs 
    WHERE habit_logs.habit_id = habit_id AND habit_logs.log_date = log_date;
    
    -- Recalculate streak after deletion
    SELECT 
      COALESCE(calculate_habit_streak(habit_id), 0),
      (SELECT MAX(hl.log_date) FROM habit_logs hl WHERE hl.habit_id = habit_id)
    INTO new_streak, new_last_check_date;
    
  ELSE
    -- Log: Insert new log entry
    INSERT INTO habit_logs (habit_id, log_date) 
    VALUES (habit_id, log_date);
    
    -- Calculate new streak
    IF habit_record.last_check_date IS NULL THEN
      new_streak := 1;
    ELSIF habit_record.last_check_date = log_date - INTERVAL '1 day' THEN
      new_streak := habit_record.current_streak + 1; -- Consecutive day
    ELSIF habit_record.last_check_date = log_date - INTERVAL '2 days' THEN
      new_streak := habit_record.current_streak; -- Missed 1 day, maintain streak
    ELSE
      new_streak := 1; -- Missed 2+ days in a row, reset streak
    END IF;
    
    new_last_check_date := log_date;
  END IF;

  -- Update habit with new streak and last check date
  UPDATE habits 
  SET 
    current_streak = new_streak,
    last_check_date = new_last_check_date
  WHERE habits.id = habit_id AND habits.user_id = user_id_param::text;

  -- Return updated habit
  RETURN QUERY
  SELECT h.id, h.user_id, h.emoji, h.start_date, h.current_streak, h.last_check_date, h.created_at
  FROM habits h
  WHERE h.id = habit_id AND h.user_id = user_id_param::text;
END;
$$;

-- Helper function to calculate streak from existing logs
CREATE OR REPLACE FUNCTION calculate_habit_streak(habit_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  streak INTEGER := 0;
  curr_date DATE;
  prev_date DATE;
  log_record RECORD;
BEGIN
  -- Get logs in descending order
  FOR log_record IN
    SELECT log_date 
    FROM habit_logs 
    WHERE habit_logs.habit_id = habit_id 
    ORDER BY log_date DESC
    LIMIT 100
  LOOP
    IF curr_date IS NULL THEN
      -- First iteration
      curr_date := log_record.log_date;
      streak := 1;
    ELSE
      prev_date := curr_date;
      curr_date := log_record.log_date;
      
      -- Check date gap with one-day grace
      IF prev_date - curr_date = 1 THEN
        -- Consecutive day extends streak
        streak := streak + 1;
      ELSIF prev_date - curr_date = 2 THEN
        -- One-day gap: continue chain without increment
        CONTINUE;
      ELSE
        -- Two or more missed days break the chain
        EXIT;
      END IF;
    END IF;
  END LOOP;

  RETURN COALESCE(streak, 0);
END;
$$;

