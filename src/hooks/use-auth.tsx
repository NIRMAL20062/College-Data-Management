
// src/hooks/use-auth.tsx
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { privilegedEmails } from '@/lib/privileged-users';

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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (user?.email) {
        setIsPrivileged(privilegedEmails.includes(user.email.toLowerCase()));
      } else {
        setIsPrivileged(false);
      }
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
