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

