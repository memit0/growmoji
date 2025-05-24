'use client';

import { Card, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function StatsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="h-8 w-8" />
          Statistics
        </h1>
        <p className="text-muted-foreground mt-1">
          View your progress and analytics.
        </p>
      </div>

      <Card className="text-center py-12">
        <CardContent>
          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Statistics Coming Soon</h3>
          <p className="text-muted-foreground">
            Detailed analytics and progress tracking will be available here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 