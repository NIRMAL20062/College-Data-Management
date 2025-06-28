
// src/hooks/use-auth.tsx
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { privilegedEmails } from '@/lib/privileged-users';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isPrivileged: boolean;
  currentSemester: number | null;
  setCurrentSemester: (semester: number) => Promise<void>;
  rollNumber: string | null;
  setRollNumber: (rollNumber: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isPrivileged: false,
  currentSemester: null,
  setCurrentSemester: async () => {},
  rollNumber: null,
  setRollNumber: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPrivileged, setIsPrivileged] = useState(false);
  const [currentSemester, setSemesterState] = useState<number | null>(null);
  const [rollNumber, setRollNumberState] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        let userIsPrivileged = false;
        let userCurrentSemester = 1; // Default to 1
        let userRollNumber = ''; // Default to empty string

        if (!userDocSnap.exists()) {
          // New user: Create their profile in Firestore
          userIsPrivileged = user.email ? privilegedEmails.includes(user.email.toLowerCase()) : false;
          try {
            await setDoc(userDocRef, {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || user.email?.split('@')[0] || 'New User',
              photoURL: user.photoURL,
              createdAt: serverTimestamp(),
              isPrivileged: userIsPrivileged,
              currentSemester: userCurrentSemester,
              rollNumber: userRollNumber,
            });
          } catch (error) {
            console.error("Error creating user document:", error);
          }
        } else {
          // Existing user: get their data from their profile
          const userData = userDocSnap.data();
          userIsPrivileged = userData?.isPrivileged || false;
          userCurrentSemester = userData?.currentSemester || 1;
          userRollNumber = userData?.rollNumber || '';
        }
        
        setUser(user);
        setIsPrivileged(userIsPrivileged);
        setSemesterState(userCurrentSemester);
        setRollNumberState(userRollNumber);
      } else {
        setUser(null);
        setIsPrivileged(false);
        setSemesterState(null);
        setRollNumberState(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const setCurrentSemester = async (semester: number) => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { currentSemester: semester });
      setSemesterState(semester);
    }
  };

  const setRollNumber = async (rollNumber: string) => {
    if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, { rollNumber: rollNumber.trim() });
        setRollNumberState(rollNumber.trim());
    }
  };


  return (
    <AuthContext.Provider value={{ user, loading, isPrivileged, currentSemester, setCurrentSemester, rollNumber, setRollNumber }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
