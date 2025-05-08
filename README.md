# Habit Tracker - Productivity App

A modern productivity app built with React Native and Expo to help users track and maintain their daily habits and tasks.

##Database schema 

CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  emoji TEXT NOT NULL,
  start_date DATE NOT NULL,
  current_streak INTEGER DEFAULT 0,
  last_check_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE habit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  log_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(habit_id, log_date)
);

CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  content TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE timer_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  work_duration INTEGER DEFAULT 25, -- in minutes
  break_duration INTEGER DEFAULT 5, -- in minutes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habits RLS
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY habits_user_access ON habits
  FOR ALL USING (auth.uid() = user_id);

-- Habit Logs RLS (through parent habit)
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY habit_logs_user_access ON habit_logs
  FOR ALL USING (EXISTS (
    SELECT 1 FROM habits WHERE habits.id = habit_logs.habit_id AND habits.user_id = auth.uid()
  ));

-- Todos RLS
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
CREATE POLICY todos_user_access ON todos
  FOR ALL USING (auth.uid() = user_id);

-- Timer Settings RLS
ALTER TABLE timer_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY timer_settings_user_access ON timer_settings
  FOR ALL USING (auth.uid() = user_id);

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

CREATE TRIGGER update_habit_streak
AFTER INSERT ON habit_logs
FOR EACH ROW EXECUTE FUNCTION calculate_streak();

CREATE INDEX ON habits(user_id);
CREATE INDEX ON habit_logs(habit_id);
CREATE INDEX ON habit_logs(log_date);
CREATE INDEX ON todos(user_id);
CREATE INDEX ON todos(is_completed);


## Project Structure

```
habittracker/
├── app/                    # Main application screens and navigation
│   ├── (auth)/            # Authentication related screens
│   ├── (tabs)/            # Main tab navigation screens
│   └── _layout.tsx        # Root layout configuration
├── assets/                # Static assets (images, fonts, etc.)
├── components/            # Reusable UI components
│   ├── common/           # Shared components
│   ├── forms/            # Form-related components
│   └── ui/               # Basic UI components
├── constants/            # App-wide constants and configuration
│   ├── Colors.ts        # Color definitions
│   └── Layout.ts        # Layout constants
├── hooks/               # Custom React hooks
├── services/           # API and external service integrations
├── store/              # State management (Redux/Context)
│   ├── actions/        # Redux actions
│   ├── reducers/       # Redux reducers
│   └── types/          # TypeScript types for state
├── types/              # Global TypeScript type definitions
├── utils/              # Utility functions and helpers
└── config/             # Configuration files

```

## Feature Implementation Roadmap

### Phase 1: Foundation Setup
1. **Project Initialization**
   - Set up Expo project with TypeScript
   - Configure ESLint and Prettier
   - Set up navigation structure
   - Implement theme system (light/dark mode)

2. **Authentication System**
   - User registration
   - Login/Logout functionality
   - Password recovery
   - Session management
   - Secure storage implementation

### Phase 2: Core Features
3. **Habit Management**
   - Create new habits
   - Edit existing habits
   - Delete habits
   - Habit categories
   - Habit frequency settings
   - Streak tracking

4. **Task Management**
   - Create daily tasks
   - Task prioritization
   - Task completion tracking
   - Task categories
   - Due date management
   - Recurring tasks

### Phase 3: User Experience
5. **Progress Tracking**
   - Habit completion statistics
   - Daily/weekly/monthly views
   - Progress visualization (charts/graphs)
   - Achievement system
   - Streak rewards

6. **Notifications & Reminders**
   - Push notification setup
   - Custom reminder settings
   - Time-based notifications
   - Streak maintenance alerts
   - Achievement notifications

### Phase 4: Data & Sync
7. **Data Management**
   - Local storage implementation
   - Data backup system
   - Data export/import
   - Cloud synchronization
   - Offline support

### Phase 5: Enhancement
8. **Social Features**
   - Friend connections
   - Habit sharing
   - Progress sharing
   - Community challenges
   - Social accountability

9. **Advanced Features**
   - Habit templates
   - Custom habit icons
   - Advanced statistics
   - Goal setting
   - Progress reports

### Phase 6: Polish
10. **UI/UX Refinement**
    - Animations and transitions
    - Accessibility improvements
    - Performance optimization
    - Error handling
    - Loading states

11. **Testing & Deployment**
    - Unit testing
    - Integration testing
    - User acceptance testing
    - App store preparation
    - Production deployment

## Features (Planned)

- User authentication
- Habit tracking and management
- Daily task management
- Progress visualization
- Reminders and notifications
- Data synchronization
- Dark/Light theme support

## Tech Stack

- React Native
- Expo
- TypeScript
- Redux Toolkit (State Management)
- React Navigation
- AsyncStorage (Local Storage)
- React Native Paper (UI Components)

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

## Development Guidelines

- Follow TypeScript best practices
- Use functional components with hooks
- Implement proper error handling
- Write clean and maintainable code
- Add comments for complex logic
- Follow the established project structure

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## License

MIT License
