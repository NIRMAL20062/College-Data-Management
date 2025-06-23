
'use server';

/**
 * @fileOverview A chatbot assistant for students to ask questions about course material.
 *
 * - chatbotAssistant - A function that handles the chatbot assistant process.
 * - ChatbotAssistantInput - The input type for the chatbotAssistant function.
 * - ChatbotAssistantOutput - The return type for the chatbotAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatbotAssistantInputSchema = z.object({
  question: z.string().describe('The question from the student.'),
  courseNotes: z.string().describe('The uploaded course notes.'),
});
export type ChatbotAssistantInput = z.infer<typeof ChatbotAssistantInputSchema>;

const ChatbotAssistantOutputSchema = z.object({
  answer: z.string().describe('The answer to the question.'),
});
export type ChatbotAssistantOutput = z.infer<typeof ChatbotAssistantOutputSchema>;

export async function chatbotAssistant(input: ChatbotAssistantInput): Promise<ChatbotAssistantOutput> {
  return chatbotAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatbotAssistantPrompt',
  input: {schema: ChatbotAssistantInputSchema},
  output: {schema: ChatbotAssistantOutputSchema},
  prompt: `You are a professional and highly intelligent AI assistant, similar to ChatGPT, designed to help students with their course material. Your primary goal is to provide accurate, clear, and well-structured answers.

  When you respond, please follow these guidelines:
  1.  **Structure your answers:** Use headings, bullet points, and numbered lists to organize information logically.
  2.  **Be clear and concise:** Explain complex topics in a simple and understandable way.
  3.  **Maintain a professional tone:** Be helpful, respectful, and authoritative in your subject matter expertise.
  4.  **Cite your source:** Base your answers primarily on the provided course notes. If the notes don't contain the answer, state that clearly and then provide a general answer from your knowledge base.

  Use the following course notes to answer the question.

  Course Notes:
  {{courseNotes}}

  Question:
  {{question}}

  Your Professional and Structured Answer:`,
});

const chatbotAssistantFlow = ai.defineFlow(
  {
    name: 'chatbotAssistantFlow',
    inputSchema: ChatbotAssistantInputSchema,
    outputSchema: ChatbotAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
