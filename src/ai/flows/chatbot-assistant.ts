'use server';

/**
 * @fileOverview A chatbot assistant for students to ask questions about course material and their academic data.
 *
 * - chatbotAssistant - A function that handles the chatbot assistant process.
 * - ChatbotAssistantInput - The input type for the chatbotAssistant function.
 * - ChatbotAssistantOutput - The return type for the chatbotAssistant function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { fetchExams, fetchNotes } from '@/ai/tools/student-data-tools';

const ChatbotAssistantInputSchema = z.object({
  question: z.string().describe('The question from the student.'),
  courseNotes: z.string().describe('The uploaded course notes.'),
  userId: z.string().describe('The authenticated user ID.'),
});
export type ChatbotAssistantInput = z.infer<typeof ChatbotAssistantInputSchema>;

const ChatbotAssistantOutputSchema = z.object({
  answer: z.string().describe('The answer to the question.'),
});
export type ChatbotAssistantOutput = z.infer<typeof ChatbotAssistantOutputSchema>;

const getExamMarks = ai.defineTool(
  {
    name: 'getExamMarks',
    description: "Get the current student's exam marks for a given semester, subject, or exam type.",
    inputSchema: z.object({
      semester: z.number().optional().describe('The semester number (e.g., 3 for Semester 3)'),
      subject: z.string().optional().describe('The name of the subject (e.g., "Probability for Computer Science")'),
      examType: z.enum(['IT 1', 'IT 2', 'Mid Sem', 'End Sem']).optional().describe('The type of exam. Must be one of: "IT 1", "IT 2", "Mid Sem", "End Sem".'),
    }),
    outputSchema: z.string(),
  },
  // The tool handler receives flow context as the second argument.
  async (filters, context) => {
    const userId = context?.auth?.uid;
    if (!userId) {
      return "Error: I could not verify your user ID. Please make sure you are logged in.";
    }
    return fetchExams(userId, filters);
  }
);

const findCourseNotes = ai.defineTool(
  {
    name: 'findCourseNotes',
    description: 'Search for available course notes, slides, or other resources.',
    inputSchema: z.object({
      nameQuery: z.string().optional().describe('A keyword to search for in the note name (e.g., "Chapter 5")'),
    }),
    outputSchema: z.string(),
  },
  async (filters) => fetchNotes(filters)
);

const chatbotPrompt = ai.definePrompt({
  name: 'chatbotPrompt',
  tools: [getExamMarks, findCourseNotes],
  input: { schema: ChatbotAssistantInputSchema },
  prompt: `You are AcademIQ-Bot, a friendly and helpful AI assistant for a college student.
Your MAIN GOAL is to answer the user's question.

Use the tools provided to answer questions about the user's exam marks or course notes.
If you use a tool, you MUST use the information returned by the tool to construct a friendly, conversational answer for the user. Your final response MUST be a text-based answer that directly addresses their original question.

User's Question:
"{{{question}}}"

Contextual Course Notes:
"{{{courseNotes}}}"
`,
});

export async function chatbotAssistant(input: ChatbotAssistantInput): Promise<ChatbotAssistantOutput> {
  // Pass the userId as auth context to the flow, which then passes it to the tool.
  return chatbotAssistantFlow(input, { auth: { uid: input.userId } });
}

const chatbotAssistantFlow = ai.defineFlow(
  {
    name: 'chatbotAssistantFlow',
    inputSchema: ChatbotAssistantInputSchema,
    outputSchema: ChatbotAssistantOutputSchema,
  },
  async (input) => {
    const result = await chatbotPrompt(input);

    const answer = result.text;
    
    if (!answer) {
      console.error("Chatbot failed to generate a final text response, likely after a tool call.", JSON.stringify(result, null, 2));
      return { answer: "I was able to find the information you asked for, but I'm having trouble putting it into words. Could you try asking in a slightly different way?" };
    }
    
    return { answer };
  }
);