'use server';

/**
 * @fileOverview Generates a daily motivational greeting.
 *
 * - generateMotivationalGreeting - A function that generates a motivational greeting.
 * - MotivationalGreetingInput - The input type for the generateMotivationalGreeting function.
 * - MotivationalGreetingOutput - The output type for the generateMotivationalGreeting function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MotivationalGreetingInputSchema = z.object({
  // This field is used to bypass caching and ensure a new quote is generated on each request.
  cacheBuster: z.string().optional(),
});
export type MotivationalGreetingInput = z.infer<typeof MotivationalGreetingInputSchema>;

const MotivationalGreetingOutputSchema = z.object({
  quote: z.string().describe('A motivational quote from a famous person.'),
  person: z.string().describe("The name of the person who said the quote."),
});
export type MotivationalGreetingOutput = z.infer<typeof MotivationalGreetingOutputSchema>;

export async function generateMotivationalGreeting(input?: MotivationalGreetingInput): Promise<MotivationalGreetingOutput> {
  return motivationalGreetingFlow(input || {});
}

const prompt = ai.definePrompt({
  name: 'motivationalGreetingPrompt',
  output: {schema: MotivationalGreetingOutputSchema},
  prompt: `You are a motivational AI. Generate a unique and inspiring quote suitable for a student, from a well-known historical figure, leader, scientist, or artist. Provide the quote and the person's name. Ensure each response is different from the last.`,
  config: {
    temperature: 1.0, // Increase randomness for more varied quotes.
  },
});

const motivationalGreetingFlow = ai.defineFlow({
  name: 'motivationalGreetingFlow',
  inputSchema: MotivationalGreetingInputSchema,
  outputSchema: MotivationalGreetingOutputSchema,
}, async () => {
  const {output} = await prompt({});
  return output!;
});
