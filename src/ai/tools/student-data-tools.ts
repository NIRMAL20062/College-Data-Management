
'use server';

import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit, type QueryConstraint } from 'firebase/firestore';

export type ExamFilters = {
  semester?: number;
  subject?: string;
  examType?: 'IT 1' | 'IT 2' | 'Mid Sem' | 'End Sem';
};

export type NoteFilters = {
  nameQuery?: string;
};

/**
 * Fetches exam records for a specific user from Firestore based on filters.
 */
export async function fetchExams(userId: string, filters: ExamFilters) {
  if (!userId) {
    return 'Error: User ID is required to fetch exam marks.';
  }

  const examsRef = collection(db, `users/${userId}/exams`);

  try {
    // Fetch all exams for the user to avoid complex queries that require composite indexes.
    // Filtering will be done in the code, which is fine for the small number of exams per student.
    const querySnapshot = await getDocs(examsRef);

    let allExams = querySnapshot.docs.map(doc => doc.data());

    // Apply filters in code
    if (filters.semester) {
      allExams = allExams.filter(exam => exam.semester === filters.semester);
    }
    if (filters.examType) {
      allExams = allExams.filter(exam => exam.examType === filters.examType);
    }
    if (filters.subject) {
      allExams = allExams.filter(exam =>
        exam.subject.toLowerCase().includes(filters.subject!.toLowerCase())
      );
    }
    
    if (allExams.length === 0) {
      return 'I couldn\'t find any matching exam records with those details. Maybe try a different search?';
    }

    const exams = allExams.map(data => {
      return {
        subject: data.subject,
        examType: data.examType,
        date: data.date,
        obtained: data.obtained,
        total: data.total,
        percentage: Math.round((data.obtained / data.total) * 100),
      };
    });

    return `Here are the exam records I found:\n${exams
      .map(e => `- **${e.subject} (${e.examType})**: Scored ${e.obtained}/${e.total} (${e.percentage}%) on ${e.date}`)
      .join('\n')}`;

  } catch (error: any) {
    console.error("Error fetching exams from tool:", error);
    // Return a clear error message for the AI to process.
    return `An internal database error occurred while trying to fetch exam records. The error was: ${error.message}. Inform the user that there was a technical problem and they should contact support if it persists.`;
  }
}

/**
 * Fetches course notes from Firestore based on filters.
 */
export async function fetchNotes(filters: NoteFilters) {
  const notesRef = collection(db, 'notes');
  
  try {
    // Fetch all notes and filter in code for more robust searching.
    const q = query(notesRef, limit(50));
    const querySnapshot = await getDocs(q);

    let allNotes = querySnapshot.docs.map(doc => doc.data());

    if (filters.nameQuery) {
        allNotes = allNotes.filter(note => 
            note.name.toLowerCase().includes(filters.nameQuery!.toLowerCase())
        );
    }
    
    const limitedNotes = allNotes.slice(0, 5);

    if (limitedNotes.length === 0) {
      return 'I couldn\'t find any matching notes. You can see all available notes on the "Notes" page in the sidebar.';
    }

    const notes = limitedNotes.map(data => {
      return {
        name: data.name,
        type: data.type,
      };
    });

    return `I found these notes for you:\n${notes
      .map(n => `- **${n.name} (${n.type})**`)
      .join('\n')}\nI can't provide direct links, but you can find them all on the Notes page in the sidebar!`;

  } catch (error) {
    console.error("Error fetching notes from tool:", error);
    return 'An error occurred while trying to fetch notes.';
  }
}
