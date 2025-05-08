-- Create enum types
CREATE TYPE priority_level AS ENUM ('high', 'medium', 'low');
CREATE TYPE habit_frequency AS ENUM ('daily', 'weekly', 'monthly', 'custom');
CREATE TYPE timer_type AS ENUM ('work', 'break', 'long_break');

-- Enable RLS
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create todos table
CREATE TABLE todos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ,
    priority priority_level DEFAULT 'medium',
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create habits table
CREATE TABLE habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    emoji TEXT,
    frequency habit_frequency DEFAULT 'daily',
    frequency_config JSONB, -- For custom frequency settings
    start_date DATE NOT NULL,
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create habit_logs table for tracking daily completions
CREATE TABLE habit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    date DATE NOT NULL,
    notes TEXT
);

-- Create timer_sessions table
CREATE TABLE timer_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    timer_type timer_type NOT NULL,
    duration_minutes INT NOT NULL,
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    todo_id UUID REFERENCES todos(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_todos_user_id ON todos(user_id);
CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habit_logs_habit_id ON habit_logs(habit_id);
CREATE INDEX idx_habit_logs_user_id ON habit_logs(user_id);
CREATE INDEX idx_timer_sessions_user_id ON timer_sessions(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE timer_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can only see their own todos"
    ON todos FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own todos"
    ON todos FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own todos"
    ON todos FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own todos"
    ON todos FOR DELETE
    USING (auth.uid() = user_id);

-- Habits policies
CREATE POLICY "Users can only see their own habits"
    ON habits FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own habits"
    ON habits FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habits"
    ON habits FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habits"
    ON habits FOR DELETE
    USING (auth.uid() = user_id);

-- Habit logs policies
CREATE POLICY "Users can only see their own habit logs"
    ON habit_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own habit logs"
    ON habit_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habit logs"
    ON habit_logs FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habit logs"
    ON habit_logs FOR DELETE
    USING (auth.uid() = user_id);

-- Timer sessions policies
CREATE POLICY "Users can only see their own timer sessions"
    ON timer_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own timer sessions"
    ON timer_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own timer sessions"
    ON timer_sessions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own timer sessions"
    ON timer_sessions FOR DELETE
    USING (auth.uid() = user_id);

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating timestamps
CREATE TRIGGER update_todos_updated_at
    BEFORE UPDATE ON todos
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_habits_updated_at
    BEFORE UPDATE ON habits
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column(); 