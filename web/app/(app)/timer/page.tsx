'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Timer } from "lucide-react";

export default function TimerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Timer className="h-8 w-8" />
          Pomodoro Timer
        </h1>
        <p className="text-muted-foreground mt-1">
          Focus with the Pomodoro technique.
        </p>
      </div>

      <Card className="text-center py-12">
        <CardContent>
          <Timer className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Timer Coming Soon</h3>
          <p className="text-muted-foreground">
            Pomodoro timer functionality will be available here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 