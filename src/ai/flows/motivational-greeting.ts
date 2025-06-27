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
  quote: z.string().describe('A motivational quote from a famous person.'),
  person: z.string().describe("The name of the person who said the quote."),
});
export type MotivationalGreetingOutput = z.infer<typeof MotivationalGreetingOutputSchema>;

export async function generateMotivationalGreeting(): Promise<MotivationalGreetingOutput> {
  return motivationalGreetingFlow();
}

const prompt = ai.definePrompt({
  name: 'motivationalGreetingPrompt',
  output: {schema: MotivationalGreetingOutputSchema},
  prompt: `You are a motivational AI. Generate an inspiring quote suitable for a student, from a well-known historical figure, leader, scientist, or artist. Provide the quote and the person's name. Each response should be unique.`,
});

const motivationalGreetingFlow = ai.defineFlow({
  name: 'motivationalGreetingFlow',
  outputSchema: MotivationalGreetingOutputSchema,
}, async () => {
  const {output} = await prompt({});
  return output!;
});
