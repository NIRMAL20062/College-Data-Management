"use client";

import { useEffect, useState } from "react";
import { generateMotivationalGreeting, type MotivationalGreetingOutput, type MotivationalGreetingInput } from "@/ai/flows/motivational-greeting";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";

export function MotivationalGreeting() {
  const [data, setData] = useState<MotivationalGreetingOutput | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This effect runs once on component mount (i.e., on page load/refresh)
    // to fetch a new quote.
    let isCancelled = false;
    
    async function fetchGreeting() {
      setLoading(true);
      try {
        // We pass a unique string on each call to bypass Genkit's caching mechanism.
        // This ensures a new quote is fetched from the AI on every page refresh.
        const result = await generateMotivationalGreeting({ cacheBuster: new Date().toISOString() });
        if (!isCancelled) {
          setData(result);
        }
      } catch (error) {
        console.error("Failed to generate motivational greeting:", error);
        if (!isCancelled) {
          setData({ quote: "The best way to predict the future is to create it.", person: "Peter Drucker" });
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }
    fetchGreeting();

    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <Card className="bg-gradient-to-r from-primary/80 to-accent/80 text-primary-foreground">
      <CardContent className="p-6">
        <div className="flex gap-4">
          <Sparkles className="h-6 w-6 shrink-0 mt-1" />
          {loading || !data ? (
            <div className="space-y-2 w-full">
              <Skeleton className="h-6 w-3/4 bg-white/20" />
              <Skeleton className="h-4 w-1/4 bg-white/20" />
            </div>
          ) : (
            <div>
              <p className="text-lg font-medium">\"{data.quote}\"</p>
              <p className="text-right text-sm font-light opacity-80 mt-1">- {data.person}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
