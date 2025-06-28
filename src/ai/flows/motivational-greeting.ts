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
  // No input needed. The prompt itself will handle variety.
});
export type MotivationalGreetingInput = z.infer<typeof MotivationalGreetingInputSchema>;

const MotivationalGreetingOutputSchema = z.object({
  quote: z.string().describe('A motivational quote from a famous person. The quote itself, without quotation marks.'),
  person: z.string().describe("The name of the person who said the quote."),
});
export type MotivationalGreetingOutput = z.infer<typeof MotivationalGreetingOutputSchema>;

export async function generateMotivationalGreeting(): Promise<MotivationalGreetingOutput> {
  return motivationalGreetingFlow({});
}

const prompt = ai.definePrompt({
  name: 'motivationalGreetingPrompt',
  input: {schema: MotivationalGreetingInputSchema},
  output: {schema: MotivationalGreetingOutputSchema},
  prompt: `You are a motivational AI. Your task is to provide a unique and inspiring quote for a student.

  IMPORTANT: You MUST choose a different person for each quote. Do NOT repeat people.
  Select a quote from a diverse range of well-known figures, including leaders, scientists, artists, philosophers, and entrepreneurs. Avoid using Marie Curie.

  Provide the quote and the person's name.
  Do NOT include quotation marks in the 'quote' field.`,
  config: {
    temperature: 1.2, // Increase randomness for more varied quotes and people.
  },
});

const motivationalGreetingFlow = ai.defineFlow({
  name: 'motivationalGreetingFlow',
  inputSchema: MotivationalGreetingInputSchema,
  outputSchema: MotivationalGreetingOutputSchema,
}, async (input) => {
  const {output} = await prompt(input);
  return output!;
});
