import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Apple,
    BarChart3,
    Calendar,
    CheckCircle,
    Download,
    Smartphone,
    Star,
    Target
} from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
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
            <Button variant="outline" className="flex items-center gap-2">
              <Apple className="h-5 w-5" />
              Download for iOS
            </Button>
          </div>
        </div>
        
        {/* Hero Image Placeholder */}
        <div className="mt-16 relative">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md mx-auto">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Today's Habits</h3>
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
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        habit.completed ? 'bg-green-100' : 'bg-gray-100'
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
              See what our users say about GrowMoji
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Product Manager",
                content: "GrowMoji has completely transformed my daily routine. The emoji habits and streak feature keeps me motivated every single day.",
                rating: 5
              },
              {
                name: "Mike Chen",
                role: "Software Engineer",
                content: "The most beautiful habit tracker I've ever used. The design is clean and the emoji features are exactly what I need.",
                rating: 5
              },
              {
                name: "Emily Davis",
                role: "Fitness Coach",
                content: "I recommend GrowMoji to all my clients. It's simple, effective, and helps build lasting behavioral changes with fun emojis.",
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
                  <p className="text-muted-foreground italic">"{testimonial.content}"</p>
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

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to build better habits?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of users who are already transforming their lives with GrowMoji.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/sign-up">
              <Button size="lg" variant="secondary" className="px-8">
                Get Started Free
              </Button>
            </Link>
            <Button size="lg" className="px-8 bg-white/20 text-white border-white/30 hover:bg-white/30 hover:text-white">
              <Download className="h-5 w-5 mr-2" />
              Download App
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
} 