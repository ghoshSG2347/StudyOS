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
  const [mfaPending, setMfaPending]     = useState(false);

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
      .select('id, username, email, created_at')
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
      if (!mfaPending) {
        setSession(session);
        const u = session?.user ?? null;
        setUser(u);
        fetchProfile(u?.id ?? null);
      }
      setLoading(false);
    });

    // 2. Subscribe to all auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mfaPending) {
          setSession(session);
          const u = session?.user ?? null;
          setUser(u);
          fetchProfile(u?.id ?? null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile, mfaPending]);

  const beginMfa = useCallback(() => {
    setMfaPending(true);
    setSession(null);
    setUser(null);
    setProfile(null);
    setProfileLoaded(true);
  }, []);

  const completeMfa = useCallback(async () => {
    setMfaPending(false);
    const { data: { session: verifiedSession } } = await supabase.auth.getSession();
    setSession(verifiedSession);
    const verifiedUser = verifiedSession?.user ?? null;
    setUser(verifiedUser);
    await fetchProfile(verifiedUser?.id ?? null);
  }, [fetchProfile]);

  const cancelMfa = useCallback(async () => {
    setMfaPending(false);
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    setProfileLoaded(true);
  }, []);

  const deleteAccount = async () => {
    const currentUser = user;
    if (!currentUser) throw new Error('No user logged in');

    // The RPC is the authoritative deletion path and must succeed.
    const { error: rpcErr } = await supabase.rpc('delete_own_account');
    if (rpcErr) {
      throw new Error('Account deletion could not be completed. Please try again.');
    }

    // The auth.users foreign key cascade removes the profile and other owned rows.
    const storageKey = `studyos_syllabi_v3_${currentUser.id}`;
    try {
      localStorage.removeItem(storageKey);
    } catch (storageError) {
      console.warn('[AuthContext] Could not clear local syllabus data:', storageError);
    } finally {
      setProfile(null);
      setProfileLoaded(false);
      setSession(null);
      setUser(null);
      await supabase.auth.signOut();
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setProfileLoaded(false);
  };

  return (
    <AuthContext.Provider value={{
      user, session, profile, profileLoaded, loading, mfaPending,
      beginMfa, completeMfa, cancelMfa, signOut, deleteAccount, refreshProfile
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
