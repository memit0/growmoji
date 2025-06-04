'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Timer } from "lucide-react";

export default function TimerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
          <Timer className="h-6 w-6 sm:h-8 sm:w-8" />
          Pomodoro Timer
        </h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Focus with the Pomodoro technique.
        </p>
      </div>

      <Card className="text-center py-8 sm:py-12">
        <CardContent>
          <Timer className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold mb-2">Timer Coming Soon</h3>
          <p className="text-muted-foreground text-sm sm:text-base px-4">
            Pomodoro timer functionality will be available here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 