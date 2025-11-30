# Habit Tracker - Productivity App


<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/mehmetbattal/habittracker">
    <img src="assets/images/icon.png" alt="Growmoji Logo" width="80" height="80">
  </a>

<h3 align="center">Growmoji - Habit Tracker</h3>

  <p align="center">
    A beautiful, minimalistic habit tracking app with todo management and Pomodoro timer. Built with React Native, Expo, and Supabase.
    <br />
    <a href="https://github.com/mehmetbattal/habittracker"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/mehmetbattal/habittracker/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    &middot;
    <a href="https://github.com/mehmetbattal/habittracker/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
        <li><a href="#features">Features</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
        <li><a href="#configuration">Configuration</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#project-structure">Project Structure</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

Growmoji is a modern, cross-platform habit tracking application designed with a focus on beautiful, minimalistic design. The app helps users build lasting habits, manage todos, and stay focused with a Pomodoro timer without any of the unnecessary complexities.

<img width="1626" height="933" alt="image" src="https://github.com/user-attachments/assets/0bd9d7f4-9163-4352-b674-6093c137e647" />

<img width="1626" height="933" alt="image" src="https://github.com/user-attachments/assets/a38ef503-eadc-4b8b-99c8-20ea3859b7e4" />

<img width="1626" height="933" alt="image" src="https://github.com/user-attachments/assets/955d9e1a-6588-4e01-8cb8-9c804bd334f6" />


### Key Features

- **🎯 Habit Tracking**
  - Track habits with customizable emojis
  - Streak counting and visualization
  - Calendar view for historical data
  - Flexible frequency types (daily, weekly, etc.)
  - Progress analytics and insights

- **📋 Todo Management**
  - Create and manage tasks
  - Priority levels and due dates
  - Category organization
  - Completion tracking

- **⏲️ Pomodoro Timer**
  - Configurable work/break intervals
  - Sound notifications
  - Session history and statistics
  - Link timer sessions to specific tasks

- **🌐 Cross-Platform**
  - Native iOS app
  - Web version (Next.js)
  - Real-time data synchronization via Supabase
  - Offline capabilities

- **💎 Premium Features**
  - Unlimited habits (free tier: 3 habits)
  - Advanced analytics
  - Widget support (iOS)
  - Premium themes

<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Built With

* [![React Native][ReactNative.js]][ReactNative-url]
* [![Expo][Expo.dev]][Expo-url]
* [![Next.js][Next.js]][Next-url]
* [![TypeScript][TypeScript.org]][TypeScript-url]
* [![Supabase][Supabase.io]][Supabase-url]
* [![Tailwind CSS][TailwindCSS.com]][TailwindCSS-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

This section will guide you through setting up the project locally.

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Supabase account
- Google Cloud Console account (for Google Sign-In)
- RevenueCat account (for subscriptions)

### Installation

1. Clone the repository
   ```sh
   git clone https://github.com/mehmetbattal/habittracker.git
   cd habittracker
   ```

2. Install dependencies
   ```sh
   npm install
   ```

3. Set up environment variables
   Create a `.env` file in the root directory:
   ```env
   # Supabase Configuration
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Google Sign-In Configuration
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_google_web_client_id
   EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your_google_ios_client_id

   # RevenueCat API Keys
   EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=your_revenuecat_ios_key
   ```

4. Set up Supabase database
   Run the SQL schema from `supabase/database.sql` in your Supabase project.

5. Start the development server
   ```sh
   npm start
   ```

6. Run on your preferred platform
   ```sh
   # iOS
   npm run ios

   # Android
   npm run android

   # Web
   npm run web
   ```

### Configuration

#### iOS Setup

1. Configure Apple Sign-In in `app.config.ts`
2. Set up Google Sign-In URL scheme in `app.json`
3. Configure app groups for widgets in `ios/Growmoji/Growmoji.entitlements`

#### Web Setup

The web version is located in the `web/` directory and uses Next.js. See `web/README.md` for detailed setup instructions.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- USAGE -->
## Usage

### Mobile App

1. **First Launch**: Complete the onboarding flow to set up your preferences
2. **Create Habits**: Tap the "+" button to add a new habit with an emoji
3. **Track Progress**: Tap habits to mark them as complete for the day
4. **View Stats**: Check your dashboard for streak counts and progress graphs
5. **Manage Todos**: Create and organize your tasks
6. **Use Timer**: Start a Pomodoro session to stay focused

### Web App

1. Visit the web app URL
2. Sign in with your account (syncs with mobile app)
3. Access all features through the web interface
4. Data syncs in real-time across all platforms

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- PROJECT STRUCTURE -->
## Project Structure

```
habittracker/
├── app/                    # Expo Router app directory
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main app tabs
│   └── components/        # App-specific components
├── components/            # Shared React Native components
│   ├── ui/               # UI components (HabitCard, TodoCard, etc.)
│   └── common/           # Common components
├── lib/                   # Core libraries
│   ├── services/         # Business logic services
│   ├── supabase.ts       # Supabase client
│   └── utils/            # Utility functions
├── contexts/              # React contexts (Auth, Theme, etc.)
├── hooks/                 # Custom React hooks
├── web/                   # Next.js web application
├── ios/                   # iOS native code
├── targets/               # iOS widget target
└── supabase/              # Database schema
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ROADMAP -->
## Roadmap

- [x] Habit tracking with streak counting
- [x] Todo management
- [x] Pomodoro timer
- [x] Cross-platform sync
- [x] Web version
- [x] iOS widgets
- [ ] Android widgets
- [ ] Advanced analytics dashboard
- [ ] Habit templates
- [ ] Social features (sharing streaks)
- [ ] Export data functionality

See the [open issues](https://github.com/mehmetbattal/habittracker/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and patterns
- Use TypeScript for type safety
- Write meaningful commit messages
- Test on both iOS and web platforms
- Ensure the design remains minimalistic and clean (v0 shadcn style)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTACT -->
## Contact

Mehmet Battal - [@mebattll](https://twitter.com/mebattll)

Project Link: [https://github.com/mehmetbattal/habittracker](https://github.com/mehmetbattal/habittracker)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

* [Expo](https://expo.dev/) - Amazing framework for React Native development
* [Supabase](https://supabase.com/) - Open source Firebase alternative
* [shadcn/ui](https://ui.shadcn.com/) - Beautiful component library
* [RevenueCat](https://www.revenuecat.com/) - Subscription management
* [Next.js](https://nextjs.org/) - React framework for web
* [Best-README-Template](https://github.com/othneildrew/Best-README-Template) - Great README template 

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/mehmetbattal/habittracker.svg?style=for-the-badge
[contributors-url]: https://github.com/mehmetbattal/habittracker/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/mehmetbattal/habittracker.svg?style=for-the-badge
[forks-url]: https://github.com/mehmetbattal/habittracker/network/members
[stars-shield]: https://img.shields.io/github/stars/mehmetbattal/habittracker.svg?style=for-the-badge
[stars-url]: https://github.com/mehmetbattal/habittracker/stargazers
[issues-shield]: https://img.shields.io/github/issues/mehmetbattal/habittracker.svg?style=for-the-badge
[issues-url]: https://github.com/mehmetbattal/habittracker/issues
[license-shield]: https://img.shields.io/github/license/mehmetbattal/habittracker.svg?style=for-the-badge
[license-url]: https://github.com/mehmetbattal/habittracker/blob/master/LICENSE.txt
[product-screenshot]: assets/images/icon.png
<!-- Tech Stack Badges -->
[ReactNative.js]: https://img.shields.io/badge/React%20Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[ReactNative-url]: https://reactnative.dev/
[Expo.dev]: https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white
[Expo-url]: https://expo.dev/
[Next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[TypeScript.org]: https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white
[TypeScript-url]: https://www.typescriptlang.org/
[Supabase.io]: https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=white
[Supabase-url]: https://supabase.com/
[TailwindCSS.com]: https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white
[TailwindCSS-url]: https://tailwindcss.com/
