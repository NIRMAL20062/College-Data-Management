"use client";

import { useEffect, useState } from "react";
import { generateMotivationalGreeting, type MotivationalGreetingOutput } from "@/ai/flows/motivational-greeting";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";

export function MotivationalGreeting() {
  const [data, setData] = useState<MotivationalGreetingOutput | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;
    
    async function fetchGreeting() {
      setLoading(true);
      try {
        // The temperature setting in the Genkit flow now handles variety.
        // No need to pass a cache-busting argument.
        const result = await generateMotivationalGreeting();
        if (!isCancelled) {
          setData(result);
        }
      } catch (error) {
        console.error("Failed to generate motivational greeting:", error);
        if (!isCancelled) {
          // Fallback quote in case of an error
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
            <figure className="w-full">
              <blockquote className="text-lg font-medium border-l-2 border-white/50 pl-4 italic">
                "{data.quote}"
              </blockquote>
              <figcaption className="text-right text-sm font-light opacity-80 mt-2">
                - {data.person}
              </figcaption>
            </figure>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
