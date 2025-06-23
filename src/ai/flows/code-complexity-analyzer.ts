// src/ai/flows/code-complexity-analyzer.ts
'use server';

/**
 * @fileOverview Analyzes code snippets to determine time complexity.
 *
 * - analyzeCodeComplexity - A function that analyzes the time complexity of a given code snippet.
 * - CodeComplexityInput - The input type for the analyzeCodecomplexity function.
 * - CodeComplexityOutput - The return type for the analyzeCodeComplexity function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CodeComplexityInputSchema = z.object({
  codeSnippet: z.string().describe('The code snippet to analyze.'),
});

export type CodeComplexityInput = z.infer<typeof CodeComplexityInputSchema>;

const CodeComplexityOutputSchema = z.object({
  timeComplexity: z.string().describe('The time complexity of the code snippet (e.g., O(n), O(log n), O(n^2)).'),
  explanation: z
    .string()
    .describe('A brief explanation of why the code has the determined time complexity.'),
});

export type CodeComplexityOutput = z.infer<typeof CodeComplexityOutputSchema>;

export async function analyzeCodeComplexity(input: CodeComplexityInput): Promise<CodeComplexityOutput> {
  return analyzeCodeComplexityFlow(input);
}

const analyzeCodeComplexityPrompt = ai.definePrompt({
  name: 'analyzeCodeComplexityPrompt',
  input: {schema: CodeComplexityInputSchema},
  output: {schema: CodeComplexityOutputSchema},
  prompt: `You are an expert software engineer specializing in analyzing code and determining its time complexity.

  Analyze the following code snippet and determine its time complexity. Provide a brief explanation of your reasoning.

  Code Snippet:
  \`\`\`
  {{codeSnippet}}
  \`\`\`

  Time Complexity: (e.g., O(n), O(log n), O(n^2))
  Explanation:`, // Ensure the prompt ends with the desired output format
});

const analyzeCodeComplexityFlow = ai.defineFlow(
  {
    name: 'analyzeCodeComplexityFlow',
    inputSchema: CodeComplexityInputSchema,
    outputSchema: CodeComplexityOutputSchema,
  },
  async input => {
    const {output} = await analyzeCodeComplexityPrompt(input);
    return output!;
  }
);
