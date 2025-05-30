-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Habits Table
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  emoji TEXT NOT NULL,
  start_date DATE NOT NULL,
  current_streak INTEGER DEFAULT 0,
  last_check_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Habit Logs Table
CREATE TABLE habit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  log_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(habit_id, log_date)
);

-- Create Todos Table
CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
      -- Missed multiple days, reset streak
      UPDATE habits SET current_streak = 1, last_check_date = NEW.log_date WHERE id = NEW.habit_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own habits"
ON habits FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own habits"
ON habits FOR UPDATE
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own habits"
ON habits FOR DELETE
USING (auth.uid()::text = user_id);

-- RLS Policies for todos table
CREATE POLICY "Users can select their own todos"
ON todos FOR SELECT
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own todos"
ON todos FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own todos"
ON todos FOR UPDATE
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own todos"
ON todos FOR DELETE
USING (auth.uid()::text = user_id);

-- RLS Policies for habit_logs table
CREATE POLICY "Users can select logs for their own habits"
ON habit_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM habits
    WHERE habits.id = habit_logs.habit_id
    AND habits.user_id = auth.uid()::text
  )
);

CREATE POLICY "Users can insert logs for their own habits"
ON habit_logs FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM habits
    WHERE habits.id = habit_logs.habit_id
    AND habits.user_id = auth.uid()::text
  )
);

CREATE POLICY "Users can update logs for their own habits"
ON habit_logs FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM habits
    WHERE habits.id = habit_logs.habit_id
    AND habits.user_id = auth.uid()::text
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM habits
    WHERE habits.id = habit_logs.habit_id
    AND habits.user_id = auth.uid()::text
  )
);

CREATE POLICY "Users can delete logs for their own habits"
ON habit_logs FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM habits
    WHERE habits.id = habit_logs.habit_id
    AND habits.user_id = auth.uid()::text
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

