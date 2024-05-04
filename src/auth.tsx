import { createContext, useContext, useEffect, useState } from 'react';

import { Session, User } from '@supabase/supabase-js';
import { db } from './lib/supabase';

export const AuthContext = createContext<{ user: User | null; session: Session | null }>({
  user: null,
  session: null,
});

export const AuthContextProvider = (props: any) => {
  const [userSession, setUserSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    db.auth.getSession().then(({ data: { session } }) => {
      setUserSession(session);
      setUser(session?.user ?? null);
    });

    const { data: authListener } = db.auth.onAuthStateChange(async (event, session) => {
      console.log(`Supabase auth event: ${event}`);
      setUserSession(session);
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription;
    };
  }, []);

  const value = {
    userSession,
    user,
  };
  return <AuthContext.Provider value={value} {...props} />;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a AuthContextProvider.');
  }
  return context;
};