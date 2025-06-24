'use server';

/**
 * @fileOverview An AI agent that debugs code snippets for students.
 *
 * - debugCode - A function that handles the code debugging process.
 * - DebugCodeInput - The input type for the debugCode function.
 * - DebugCodeOutput - The return type for the debugCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DebugCodeInputSchema = z.object({
  codeSnippet: z.string().describe('The code snippet to debug.'),
});
export type DebugCodeInput = z.infer<typeof DebugCodeInputSchema>;

const DebugCodeOutputSchema = z.object({
  isBugFree: z.boolean().describe('Whether or not the code snippet has any bugs.'),
  bug: z.string().describe('A short, one-sentence description of the bug. Empty if no bug is found.'),
  explanation: z
    .string()
    .describe('A detailed explanation of why the code is wrong and how the fix works. If bug-free, explain why it is correct.'),
  fixedCode: z.string().describe('The complete, corrected code snippet. Empty if no bug is found.'),
});
export type DebugCodeOutput = z.infer<typeof DebugCodeOutputSchema>;

export async function debugCode(input: DebugCodeInput): Promise<DebugCodeOutput> {
  return codeDebuggerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'codeDebuggerPrompt',
  input: {schema: DebugCodeInputSchema},
  output: {schema: DebugCodeOutputSchema},
  prompt: `You are an expert code debugger for a university computer science department. Your tone should be helpful and educational. Your goal is to help students learn, not just to give them the answer.

Analyze the following code snippet.

First, determine if there is a bug in the code.

If the code is bug-free, you MUST:
1. Set the 'isBugFree' field to true.
2. Provide a brief explanation in the 'explanation' field of why the code is correct and works as intended.
3. Leave the 'bug' and 'fixedCode' fields as empty strings.

If there is a bug, you MUST:
1. Set the 'isBugFree' field to false.
2. Identify the bug and describe it in a single sentence in the 'bug' field.
3. In the 'explanation' field, provide a clear, step-by-step explanation of the logical error. Explain what the bug causes and why the corrected version fixes it.
4. Provide the complete, corrected code in the 'fixedCode' field.

Code Snippet:
{{codeSnippet}}
`,
});

const codeDebuggerFlow = ai.defineFlow(
  {
    name: 'codeDebuggerFlow',
    inputSchema: DebugCodeInputSchema,
    outputSchema: DebugCodeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
