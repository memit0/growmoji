import { ConsoleWarningFilter } from '@/components/ConsoleWarningFilter';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Import environment validation (auto-runs in production)
import '@/lib/env-validation';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Growmoji - Build Better Habits",
  description: "The beautiful habit tracker that helps you build lasting habits and achieve your goals with emojis.",
  keywords: ["habit tracker", "productivity", "goals", "habits", "self-improvement", "emoji", "growmoji"],
  authors: [{ name: "Growmoji Team" }],
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  openGraph: {
    title: "Growmoji - Build Better Habits",
    description: "The beautiful habit tracker that helps you build lasting habits and achieve your goals with emojis.",
    type: "website",
    url: "https://growmoji.app",
  },
  icons: {
    icon: "/favicon.jpg",
  },
  twitter: {
    card: "summary_large_image",
    title: "Growmoji - Build Better Habits",
    description: "The beautiful habit tracker that helps you build lasting habits and achieve your goals with emojis.",
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
