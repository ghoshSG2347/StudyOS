import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) throw error;
      if (mounted) {
        setUser(data.session?.user ?? null);
        setLoading(false);
      }
    }).catch((error) => {
      console.error('Unable to restore authentication session:', error);
      if (mounted) setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    loading,
    signIn: async (email, password) => {
      try {
        return await supabase.auth.signInWithPassword({ email, password });
      } catch (error) {
        console.error('Sign-in request failed:', error);
        return { data: { user: null, session: null }, error: new Error('AUTH_NETWORK_ERROR') };
      }
    },
    signUp: async (email, password, fullName) => {
      try {
        return await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } }
        });
      } catch (error) {
        console.error('Registration request failed:', error);
        return { data: { user: null, session: null }, error: new Error('AUTH_NETWORK_ERROR') };
      }
    },
    signOut: () => supabase.auth.signOut()
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
