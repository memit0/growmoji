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

-- Create Timer Settings Table
CREATE TABLE timer_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL UNIQUE,
  work_duration INTEGER DEFAULT 25, -- in minutes
  break_duration INTEGER DEFAULT 5, -- in minutes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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

-- Enable Row Level Security
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE timer_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
DROP POLICY IF EXISTS habits_user_access ON habits;
CREATE POLICY habits_user_access ON habits
  FOR ALL USING ((auth.jwt()->>'sub')::text = user_id)
  WITH CHECK ((auth.jwt()->>'sub')::text = user_id);

DROP POLICY IF EXISTS habit_logs_user_access ON habit_logs;
CREATE POLICY habit_logs_user_access ON habit_logs
  FOR ALL USING (EXISTS (
    SELECT 1 FROM habits WHERE habits.id = habit_logs.habit_id AND habits.user_id = (auth.jwt()->>'sub')::text
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM habits WHERE habits.id = habit_logs.habit_id AND habits.user_id = (auth.jwt()->>'sub')::text
  ));

DROP POLICY IF EXISTS todos_user_access ON todos;
CREATE POLICY todos_user_access ON todos
  FOR ALL USING ((auth.jwt()->>'sub')::text = user_id)
  WITH CHECK ((auth.jwt()->>'sub')::text = user_id);

DROP POLICY IF EXISTS timer_settings_user_access ON timer_settings;
CREATE POLICY timer_settings_user_access ON timer_settings
  FOR ALL USING ((auth.jwt()->>'sub')::text = user_id)
  WITH CHECK ((auth.jwt()->>'sub')::text = user_id);