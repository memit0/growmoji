import { ConsoleWarningFilter } from '@/components/ConsoleWarningFilter';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Import environment validation (auto-runs in production)
import '@/lib/env-validation';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://growmoji.app"),
  title: "Growmoji - Build Better Habits",
  description: "The beautiful habit tracker that helps you build lasting habits and achieve your goals with emojis.",
  keywords: ["habit tracker", "productivity", "goals", "habits", "self-improvement", "emoji", "growmoji"],
  authors: [{ name: "Growmoji Team" }],
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  openGraph: {
    title: "Growmoji - Build Better Habits",
    description: "Transform your life with beautiful habit tracking. Build streaks, achieve goals, and grow with emojis! ✨",
    images: "/og",
    type: "website",
    url: "https://growmoji.app",
  },
  icons: {
    icon: "/favicon.jpg",
  },
  twitter: {
    card: "summary_large_image",
    title: "Growmoji 🌱",
    description: "Transform your life with beautiful habit tracking. Build streaks, achieve goals, and grow with emojis! ✨",
    site: "@growmoji",
    creator: "@mebattll",
    images: "/og",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ConsoleWarningFilter />
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
