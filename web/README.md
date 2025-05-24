# HabitKit Web

The beautiful web version of HabitKit - a habit tracker that helps you build lasting habits and achieve your goals.

## 🌟 Features

- **Beautiful Landing Page** - Replicates the HabitKit design with modern gradients and clean UI
- **Premium Web App** - Full-featured habit tracking for authenticated users
- **Real-time Sync** - Syncs with mobile app data via Supabase
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile web
- **Clean Architecture** - Built with Next.js 14+ App Router and TypeScript

## 🚀 Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Styling**: Tailwind CSS + shadcn/ui components
- **Authentication**: Clerk (synced with mobile app)
- **Database**: Supabase (shared with mobile app)
- **State Management**: Zustand
- **TypeScript**: Full type safety
- **Deployment**: Vercel-ready

## 📁 Project Structure

```
web/
├── app/
│   ├── (landing)/          # Public landing pages
│   │   ├── page.tsx       # Home page
│   │   └── layout.tsx     # Landing layout
│   ├── (app)/             # Protected app routes
│   │   ├── dashboard/     # Main dashboard
│   │   ├── habits/        # Habit management
│   │   ├── calendar/      # Calendar view
│   │   ├── stats/         # Statistics
│   │   ├── todos/         # Todo management
│   │   ├── timer/         # Pomodoro timer
│   │   └── layout.tsx     # App layout
│   ├── auth/              # Authentication pages
│   │   ├── sign-in/
│   │   └── sign-up/
│   └── layout.tsx         # Root layout
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── landing/           # Landing page components
│   ├── app/               # App-specific components
│   └── shared/            # Shared components
├── lib/
│   ├── supabase.ts        # Database client
│   ├── auth.ts            # Auth utilities
│   └── utils.ts           # Utility functions
└── hooks/                 # Custom React hooks
```

## 🛠️ Setup & Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Setup**:
   Create `.env.local` with your credentials:
   ```env
   # Supabase (shared with mobile app)
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key

   # App Store URLs (for landing page)
   NEXT_PUBLIC_APP_STORE_URL=your_app_store_url
   NEXT_PUBLIC_GOOGLE_PLAY_URL=your_google_play_url
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎨 Design System

The web version follows the same design principles as the mobile app:

- **Colors**: Blue to purple gradients with neutral grays
- **Typography**: Inter font family for clean readability
- **Components**: shadcn/ui for consistent, accessible components
- **Spacing**: 8px grid system for consistent layouts
- **Animations**: Subtle micro-interactions with Framer Motion

## 🔐 Authentication

- **Clerk Integration**: Unified auth with mobile app
- **Premium Access**: Web app is for premium users only
- **Session Sync**: Maintains auth state across tabs/windows
- **Secure Routes**: Protected routes require authentication

## 💾 Database Integration

- **Shared Schema**: Uses same database as mobile app
- **Real-time Sync**: Supabase real-time subscriptions
- **Row Level Security**: Secure data access per user
- **Optimistic Updates**: Immediate UI updates with server sync

### Database Tables

- `habits` - User habits with streaks and metadata
- `habit_logs` - Daily completion tracking
- `todos` - Task management
- `timer_settings` - Pomodoro timer configuration

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository**:
   - Import project to Vercel
   - Connect your Git repository

2. **Environment Variables**:
   - Add all `.env.local` variables to Vercel
   - Ensure production URLs are used

3. **Deploy**:
   ```bash
   npm run build
   ```

### Manual Deployment

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Start production server**:
   ```bash
   npm start
   ```

## 📱 Mobile App Integration

The web version is designed to complement the mobile app:

- **Data Sync**: Real-time synchronization with mobile app data
- **Premium Gate**: Web access requires mobile app subscription
- **Feature Parity**: Core features match mobile app functionality
- **Cross-Platform**: Seamless experience across devices

## 🎯 Key Features

### Landing Page
- Hero section with app preview
- Feature highlights with icons
- Customer testimonials
- App store download links
- Responsive design

### Web App Dashboard
- Today's habit overview
- Progress statistics
- Streak tracking
- Quick actions
- Recent activity feed

### Habit Management
- Create and edit habits
- Track daily completion
- View streak history
- Calendar visualization

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js recommended config
- **Prettier**: Consistent code formatting
- **Components**: Functional components with hooks

## 🚫 Restrictions

As per the web version specifications:

- **NO RevenueCat**: Billing handled through mobile app
- **NO Widgets**: Home screen widgets are mobile-only
- **NO Push Notifications**: Uses browser notifications sparingly
- **Premium Only**: Web access requires mobile app subscription

## 📊 Performance

- **Core Web Vitals**: Optimized for LCP, FID, and CLS
- **Bundle Size**: Minimized with code splitting
- **Images**: Next.js Image optimization
- **Caching**: Aggressive static asset caching

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is part of the HabitKit ecosystem. All rights reserved.

---

**Note**: This is the web version of HabitKit. For the mobile app, see the parent directory.
