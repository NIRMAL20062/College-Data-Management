
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
  const queryConstraints: QueryConstraint[] = [];

  // Simplify the query to be less restrictive. We will filter more precisely in the code.
  if (filters.semester) {
    queryConstraints.push(where('semester', '==', filters.semester));
  }
  if (filters.examType) {
    queryConstraints.push(where('examType', '==', filters.examType));
  }

  try {
    const q = query(examsRef, ...queryConstraints);
    const querySnapshot = await getDocs(q);

    // Initial fetch from Firestore
    let allExamsForQuery = querySnapshot.docs.map(doc => doc.data());

    // If a subject filter exists, apply it here in a case-insensitive way.
    if (filters.subject) {
      allExamsForQuery = allExamsForQuery.filter(exam =>
        exam.subject.toLowerCase().includes(filters.subject!.toLowerCase())
      );
    }
    
    if (allExamsForQuery.length === 0) {
      return 'I couldn\'t find any matching exam records with those details. Maybe try a different search?';
    }

    const exams = allExamsForQuery.map(data => {
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
    if (error.code === 'failed-precondition') {
        return "I can't search the exam records right now because a database index is missing. The developer will need to create one in Firebase for this to work.";
    }
    return 'An error occurred while trying to fetch exam records.';
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
