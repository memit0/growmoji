'use client';

import { Card, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function StatsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8" />
          Statistics
        </h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          View your progress and analytics.
        </p>
      </div>

      <Card className="text-center py-8 sm:py-12">
        <CardContent>
          <BarChart3 className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold mb-2">Statistics Coming Soon</h3>
          <p className="text-muted-foreground text-sm sm:text-base px-4">
            Detailed analytics and progress tracking will be available here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 