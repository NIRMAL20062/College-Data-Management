
'use server';

/**
 * @fileOverview A chatbot assistant for students to ask questions about course material and their academic data.
 *
 * - chatbotAssistant - A function that handles the chatbot assistant process.
 * - ChatbotAssistantInput - The input type for the chatbotAssistant function.
 * - ChatbotAssistantOutput - The return type for the chatbotAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
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

export async function chatbotAssistant(input: ChatbotAssistantInput): Promise<ChatbotAssistantOutput> {
  return chatbotAssistantFlow(input);
}

const studentDataPrompt = ai.definePrompt({
    name: 'chatbotAssistantPrompt',
    system: `You are a friendly and helpful AI assistant for a college student, like a real friend. Your name is AcademIQ-Bot.
- Your primary goal is to provide accurate, clear, and well-structured answers using Markdown.
- You have access to tools to retrieve the student's personal data from the application. Use these tools whenever a student asks about their marks or about available course notes.
  - Use the 'getExamMarks' tool to answer questions about their scores.
  - Use the 'findCourseNotes' tool to look up shared course materials.
- If you use a tool, present the information back to the user in a friendly, conversational way. Don't just dump the raw data.
- If the user asks a general question or one based on the provided course notes, answer it based on the context provided.
- If the provided course notes don't contain the answer, state that clearly and then provide a general answer from your knowledge base.
- Be encouraging and supportive in your tone.`,
});

const chatbotAssistantFlow = ai.defineFlow(
  {
    name: 'chatbotAssistantFlow',
    inputSchema: ChatbotAssistantInputSchema,
    outputSchema: ChatbotAssistantOutputSchema,
  },
  async (input) => {
    // Define tools dynamically to capture the userId in their scope.
    const getExamMarks = ai.defineTool(
      {
        name: 'getExamMarks',
        description: "Get a student's exam marks for a given semester, subject, or exam type.",
        inputSchema: z.object({
          semester: z.number().optional().describe('The semester number (e.g., 3 for Semester 3)'),
          subject: z.string().optional().describe('The name of the subject (e.g., "Probability for Computer Science")'),
          examType: z.enum(['IT 1', 'IT 2', 'Mid Sem', 'End Sem']).optional().describe('The type of exam.'),
        }),
        outputSchema: z.string(),
      },
      async (toolInput) => fetchExams(input.userId, toolInput)
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
      async (toolInput) => fetchNotes(toolInput)
    );

    const result = await ai.generate({
        prompt: studentDataPrompt,
        history: [
            { role: 'user', content: input.question },
            { role: 'system', content: `Contextual Course Notes: ${input.courseNotes || "No notes provided."}` },
        ],
        tools: [getExamMarks, findCourseNotes],
    });

    return { answer: result.text };
  }
);
