'use client'
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PaywallModal } from "@/components/ui/PaywallModal";
import { useSubscription } from "@/hooks/useSubscription";
import {
  Apple,
  BarChart3,
  Calendar,
  CheckCircle,
  Crown,
  Download,
  Loader2,
  Smartphone,
  Star,
  Target
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function LandingPage() {
  const { offerings, isLoading: subscriptionLoading, error: subscriptionError } = useSubscription();
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);

  // Helper function to format period codes to readable text
  const formatPeriod = (period: string | undefined, packageIdentifier?: string): string => {
    // First, try to determine from package identifier (more reliable)
    if (packageIdentifier) {
      const identifier = packageIdentifier.toLowerCase();
      if (identifier.includes('annual') || identifier.includes('yearly') || identifier.includes('year')) {
        return 'year';
      }
      if (identifier.includes('monthly') || identifier.includes('month')) {
        return 'month';
      }
    }

    // Fallback to period code if package identifier doesn't help
    if (!period) return 'month';

    switch (period.toUpperCase()) {
      case 'P1M':
        return 'month';
      case 'P1Y':
      case 'P12M':
        return 'year';
      case 'P1W':
        return 'week';
      case 'P1D':
        return 'day';
      default:
        // Final fallback for any other period format
        if (period.toLowerCase().includes('month') || period.toLowerCase().includes('m')) {
          return 'month';
        }
        if (period.toLowerCase().includes('year') || period.toLowerCase().includes('annual')) {
          return 'year';
        }
        if (period.toLowerCase().includes('week')) {
          return 'week';
        }
        return period.toLowerCase();
    }
  };

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-16">
        <div className="text-center space-y-8">
          <Badge variant="secondary" className="px-4 py-2">
            ✨ The Beautiful Habit Tracker with Emojis
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Build Better Habits,
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Achieve Your Goals
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The most beautiful and intuitive habit tracker that helps you build lasting habits
            and achieve your goals with emojis, streaks, insights, and motivation.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth/sign-up">
              <Button size="lg" className="px-8">
                Start Building Habits
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg" className="px-8">
                Learn More
              </Button>
            </Link>
          </div>

          {/* App Store Badge */}
          <div className="flex justify-center items-center pt-8">
            <Link href="https://apps.apple.com/app/growmoji" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="flex items-center gap-2">
                <Apple className="h-5 w-5" />
                Download for iOS
              </Button>
            </Link>
          </div>
        </div>

        {/* Hero Image Placeholder */}
        <div className="mt-16 relative">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md mx-auto">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Today&apos;s Habits</h3>
                  <span className="text-sm text-muted-foreground">3/5 completed</span>
                </div>

                <div className="space-y-3">
                  {[
                    { emoji: "💧", name: "Drink Water", completed: true },
                    { emoji: "🏃", name: "Morning Run", completed: true },
                    { emoji: "📚", name: "Read 30 min", completed: true },
                    { emoji: "🧘", name: "Meditation", completed: false },
                    { emoji: "💤", name: "Sleep 8h", completed: false },
                  ].map((habit, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${habit.completed ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                        <span className="text-lg">{habit.emoji}</span>
                      </div>
                      <span className={`flex-1 ${habit.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {habit.name}
                      </span>
                      {habit.completed && <CheckCircle className="h-5 w-5 text-green-500" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">
            Everything you need to build lasting habits
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to help you stay motivated and track your progress with emojis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: <Target className="h-8 w-8 text-blue-600" />,
              title: "Smart Habit Tracking",
              description: "Track any habit with customizable frequencies and beautiful emoji visual feedback."
            },
            {
              icon: <BarChart3 className="h-8 w-8 text-green-600" />,
              title: "Streak Counting",
              description: "Build momentum with streak tracking that motivates you to keep going."
            },
            {
              icon: <Calendar className="h-8 w-8 text-purple-600" />,
              title: "Calendar View",
              description: "Visualize your progress with a beautiful calendar showing your habit history."
            },
            {
              icon: <CheckCircle className="h-8 w-8 text-orange-600" />,
              title: "Todo Integration",
              description: "Combine habits with tasks for a complete productivity system."
            },
            {
              icon: <Smartphone className="h-8 w-8 text-pink-600" />,
              title: "Cross-Platform Sync",
              description: "Access your habits on mobile, tablet, and web with real-time synchronization."
            },
            {
              icon: <Star className="h-8 w-8 text-yellow-600" />,
              title: "Beautiful Design",
              description: "Enjoy a clean, minimalistic interface that makes habit tracking a pleasure."
            }
          ].map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">
              Loved by thousands of users
            </h2>
            <p className="text-xl text-muted-foreground">
              See what our users say about Growmoji
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Product Manager",
                content: "Growmoji has completely transformed my daily routine. The emoji habits and streak feature keeps me motivated every single day.",
                rating: 5
              },
              {
                name: "Can Yuksel",
                role: "Software Engineer",
                content: "The most beautiful habit tracker I have ever used. The design is clean and the emoji features are exactly the simplicity I need.",
                rating: 5
              },
              {
                name: "Ege Mentes",
                role: "Student",
                content: "Growmoji has helped me stay on track. It's simple, effective, and helps build lasting behavioral changes with fun emojis.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6 space-y-4">
                  <div className="flex gap-1">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground italic">&quot;{testimonial.content}&quot;</p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-4 py-20">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that works best for you. Our mobile app is free to get started.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* iOS App - Free Section */}
          <Card className="border-2 border-purple-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-8 space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-purple-50 rounded-full flex items-center justify-center">
                  <Apple className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold mb-2">iOS App</h3>
                <div className="text-4xl font-bold text-purple-600 mb-2">Free</div>
                <p className="text-muted-foreground">Get started on mobile</p>
              </div>

              <ul className="space-y-3 mb-12">
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-purple-500 flex-shrink-0" />
                  <span>Up to 3 habits</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-purple-500 flex-shrink-0" />
                  <span>Basic streak tracking</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-purple-500 flex-shrink-0" />
                  <span>Daily task management</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-purple-500 flex-shrink-0" />
                  <span>Mobile widgets</span>
                </li>
              </ul>

              <Link href="https://apps.apple.com/app/growmoji" target="_blank" rel="noopener noreferrer" className="mt-8 block">
                <Button className="w-full h-12 text-lg bg-purple-600 hover:bg-purple-700">
                  Download App
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Web Premium Plans */}
          {subscriptionLoading ? (
            <div className="md:col-span-2 flex items-center justify-center py-16">
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                <p className="text-muted-foreground">Loading subscription plans...</p>
              </div>
            </div>
          ) : subscriptionError ? (
            <div className="md:col-span-2 flex items-center justify-center py-16">
              <div className="text-center space-y-4">
                <p className="text-red-600 font-medium">Unable to load pricing</p>
                <p className="text-sm text-muted-foreground">
                  Please try again later or contact support if the problem persists.
                </p>
              </div>
            </div>
          ) : offerings && offerings.length > 0 && offerings[0].availablePackages.length > 0 ? (
            offerings[0].availablePackages.map((pkg, index) => {
              const isYearly = pkg.identifier.toLowerCase().includes('annual') ||
                pkg.identifier.toLowerCase().includes('yearly') ||
                pkg.identifier.toLowerCase().includes('year');
              const period = formatPeriod(pkg.webBillingProduct?.normalPeriodDuration || undefined, pkg.identifier);

              return (
                <Card
                  key={index}
                  className={`border-2 shadow-lg hover:shadow-xl transition-shadow relative ${isYearly
                    ? 'border-blue-500'
                    : 'border-purple-200'
                    }`}
                >
                  {isYearly && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardContent className="p-8 space-y-6">
                    <div className="text-center">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${isYearly
                        ? 'bg-gradient-to-br from-blue-50 to-purple-50'
                        : 'bg-purple-50'
                        }`}>
                        <Crown className={`h-8 w-8 ${isYearly
                          ? 'text-blue-600'
                          : 'text-purple-600'
                          }`} />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">
                        {pkg.webBillingProduct?.title ||
                          (isYearly ? 'Web Premium Yearly' : 'Web Premium Monthly')}
                      </h3>
                      <div className={`text-4xl font-bold mb-2 ${isYearly
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'
                        : 'text-purple-600'
                        }`}>
                        {pkg.webBillingProduct?.currentPrice?.formattedPrice || 'Price unavailable'}
                      </div>
                      <p className="text-muted-foreground">per {period}</p>
                      {isYearly && (
                        <p className="text-sm text-green-600 font-medium mt-1">Save up to 50%</p>
                      )}
                    </div>

                    <ul className="space-y-3 mb-8">
                      <li className="flex items-center gap-3">
                        <CheckCircle className={`h-5 w-5 flex-shrink-0 ${isYearly ? 'text-blue-500' : 'text-purple-500'
                          }`} />
                        <span className="font-medium">Unlimited habits</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle className={`h-5 w-5 flex-shrink-0 ${isYearly ? 'text-blue-500' : 'text-purple-500'
                          }`} />
                        <span>Advanced analytics</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle className={`h-5 w-5 flex-shrink-0 ${isYearly ? 'text-blue-500' : 'text-purple-500'
                          }`} />
                        <span>Premium themes</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle className={`h-5 w-5 flex-shrink-0 ${isYearly ? 'text-blue-500' : 'text-purple-500'
                          }`} />
                        <span>Priority support</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle className={`h-5 w-5 flex-shrink-0 ${isYearly ? 'text-blue-500' : 'text-purple-500'
                          }`} />
                        <span>Everything in Free</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle className={`h-5 w-5 flex-shrink-0 ${isYearly ? 'text-blue-500' : 'text-purple-500'
                          }`} />
                        <span>Web access</span>
                      </li>
                    </ul>

                    <Button
                      onClick={() => setIsPaywallOpen(true)}
                      className={`w-full h-12 text-lg ${isYearly
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                        : 'bg-purple-600 hover:bg-purple-700'
                        }`}
                    >
                      <Crown className="h-5 w-5 mr-2" />
                      Get Premium
                    </Button>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="md:col-span-2 flex items-center justify-center py-16">
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">No subscription plans available at the moment.</p>
                <p className="text-sm text-muted-foreground">
                  Please try again later or contact support.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            All premium plans include 30-day money-back guarantee
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Cancel anytime
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              No hidden fees
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Secure payments
            </span>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to build better habits?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of users who are already transforming their lives with Growmoji.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/sign-up">
              <Button size="lg" variant="secondary" className="px-8">
                Get Started Free
              </Button>
            </Link>
            <Link href="https://apps.apple.com/app/growmoji" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="px-8 bg-white/20 text-white border-white/30 hover:bg-white/30 hover:text-white">
                <Download className="h-5 w-5 mr-2" />
                Download App
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Paywall Modal */}
      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        showCloseButton={true}
        title="Choose Your Premium Plan"
        subtitle="Unlock unlimited habits and premium features"
      />
    </div>
  );
}