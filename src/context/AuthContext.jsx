import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext(null);

/**
 * Provides { user, session, profile, profileLoaded, loading, signOut, refreshProfile }
 *
 * - `profile`       : row from public.profiles ({ id, username, email, created_at }) or null
 * - `profileLoaded` : true once the profile fetch has settled (may still be null if no row yet)
 * - `loading`       : true while the initial session rehydration is in progress
 */
export function AuthProvider({ children }) {
  const [session, setSession]           = useState(null);
  const [user, setUser]                 = useState(null);
  const [profile, setProfile]           = useState(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [loading, setLoading]           = useState(true);

  // Fetch profile row for a given user id
  const fetchProfile = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null);
      setProfileLoaded(true);
      return;
    }
    setProfileLoaded(false);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) console.warn('[AuthContext] profile fetch error:', error.message);
    setProfile(data ?? null);
    setProfileLoaded(true);
  }, []);

  // Exposed so pages can force a re-fetch (e.g. after inserting a new profile row)
  const refreshProfile = useCallback((overrideId) => {
    const targetId = overrideId || user?.id;
    if (targetId) fetchProfile(targetId);
  }, [user, fetchProfile]);

  useEffect(() => {
    // 1. Rehydrate existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      const u = session?.user ?? null;
      setUser(u);
      fetchProfile(u?.id ?? null);
      setLoading(false);
    });

    // 2. Subscribe to all auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        const u = session?.user ?? null;
        setUser(u);
        fetchProfile(u?.id ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const deleteAccount = async () => {
    const currentUser = user;
    if (!currentUser) throw new Error('No user logged in');

    // 1. Delete profile row from public.profiles
    const { error: profileErr } = await supabase
      .from('profiles')
      .delete()
      .eq('id', currentUser.id);
    if (profileErr) console.warn('[AuthContext] profile delete error:', profileErr.message);

    // 2. Clear this user's localStorage data
    const storageKey = `studyos_syllabi_v3_${currentUser.id}`;
    try { localStorage.removeItem(storageKey); } catch (_) { /* noop */ }

    // 3. Try to delete auth user via a Supabase RPC (requires server-side function)
    //    If the RPC doesn't exist, fall back to just signing out.
    try {
      const { error: rpcErr } = await supabase.rpc('delete_own_account');
      if (rpcErr) {
        console.warn('[AuthContext] RPC delete_own_account not available:', rpcErr.message);
      }
    } catch (_) { /* RPC not set up — that's OK */ }

    // 4. Sign out locally regardless
    setProfile(null);
    setProfileLoaded(false);
    await supabase.auth.signOut();
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setProfileLoaded(false);
  };

  return (
    <AuthContext.Provider value={{
      user, session, profile, profileLoaded, loading, signOut, deleteAccount, refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Hook — use anywhere inside <AuthProvider> */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
