live on app store and web growmoji.app

# Habit Tracker - Productivity App

A modern productivity app built with React Native and Expo to help users track and maintain their daily habits and tasks.


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

## Features (Planned)

- User authentication
- Habit tracking and management
- Daily task management
- Progress visualization
- Reminders and notifications
- Data synchronization
- Dark/Light theme support

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

