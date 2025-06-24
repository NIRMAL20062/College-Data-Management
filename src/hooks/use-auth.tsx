
// src/hooks/use-auth.tsx
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { privilegedEmails } from '@/lib/privileged-users';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isPrivileged: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isPrivileged: false,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPrivileged, setIsPrivileged] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        let userIsPrivileged = false;

        if (!userDocSnap.exists()) {
          // New user: Create their profile in Firestore
          userIsPrivileged = user.email ? privilegedEmails.includes(user.email.toLowerCase()) : false;
          try {
            await setDoc(userDocRef, {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              createdAt: serverTimestamp(),
              isPrivileged: userIsPrivileged,
            });
          } catch (error) {
            console.error("Error creating user document:", error);
          }
        } else {
          // Existing user: get their privilege status from their profile
          const userData = userDocSnap.data();
          userIsPrivileged = userData?.isPrivileged || false;
        }
        
        setUser(user);
        setIsPrivileged(userIsPrivileged);
      } else {
        setUser(null);
        setIsPrivileged(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isPrivileged }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
