"use client";

import { useEffect, useState } from "react";
import { generateMotivationalGreeting } from "@/ai/flows/motivational-greeting";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";

export function MotivationalGreeting() {
  const [greeting, setGreeting] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGreeting() {
      try {
        const result = await generateMotivationalGreeting();
        setGreeting(result.greeting);
      } catch (error) {
        console.error("Failed to generate motivational greeting:", error);
        setGreeting("Have a productive day!");
      } finally {
        setLoading(false);
      }
    }
    fetchGreeting();
  }, []);

  return (
    <Card className="bg-gradient-to-r from-primary/80 to-accent/80 text-primary-foreground">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Sparkles className="h-6 w-6" />
          {loading ? (
            <Skeleton className="h-6 w-3/4 bg-white/20" />
          ) : (
            <p className="text-lg font-medium">{greeting}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
