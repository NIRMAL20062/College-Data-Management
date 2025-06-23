'use server';

/**
 * @fileOverview Generates a daily motivational greeting.
 *
 * - generateMotivationalGreeting - A function that generates a motivational greeting.
 * - MotivationalGreetingOutput - The output type for the generateMotivationalGreeting function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MotivationalGreetingOutputSchema = z.object({
  greeting: z.string().describe('A motivational greeting for the day.'),
});
export type MotivationalGreetingOutput = z.infer<typeof MotivationalGreetingOutputSchema>;

export async function generateMotivationalGreeting(): Promise<MotivationalGreetingOutput> {
  return motivationalGreetingFlow();
}

const prompt = ai.definePrompt({
  name: 'motivationalGreetingPrompt',
  output: {schema: MotivationalGreetingOutputSchema},
  prompt: `You are a motivational AI assistant that inspires students to study. Generate a short, one-sentence motivational greeting for the day.`,
});

const motivationalGreetingFlow = ai.defineFlow({
  name: 'motivationalGreetingFlow',
  outputSchema: MotivationalGreetingOutputSchema,
}, async () => {
  const {output} = await prompt({});
  return output!;
});
