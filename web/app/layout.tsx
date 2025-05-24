import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GrowMoji - Build Better Habits",
  description: "The beautiful habit tracker that helps you build lasting habits and achieve your goals with emojis.",
  keywords: ["habit tracker", "productivity", "goals", "habits", "self-improvement", "emoji", "growmoji"],
  authors: [{ name: "GrowMoji Team" }],
  openGraph: {
    title: "GrowMoji - Build Better Habits",
    description: "The beautiful habit tracker that helps you build lasting habits and achieve your goals with emojis.",
    type: "website",
    url: "https://growmoji.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "GrowMoji - Build Better Habits",
    description: "The beautiful habit tracker that helps you build lasting habits and achieve your goals with emojis.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
