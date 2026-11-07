import { useEffect, useState, useCallback, useMemo } from 'react';
import type { StudentProfile } from '@/types/profile';
import {
  getStoredProfile,
  getDefaultProfile,
  saveStoredProfile,
  getInitials,
  PROFILE_CHANGE_EVENT,
} from '@/lib/profile';
import { useAuthSession } from './useAuthSession';

export function useProfile(customUserId?: string) {
  const { session } = useAuthSession();
  const userId = customUserId || session?.userId;
  const userEmail = session?.email;
  const userName = session?.name;

  const loadCurrentProfile = useCallback((): StudentProfile => {
    const stored = getStoredProfile(userId);
    if (stored) return stored;
    return getDefaultProfile(userEmail, userName, userId);
  }, [userId, userEmail, userName]);

  const [profile, setProfile] = useState<StudentProfile>(loadCurrentProfile);

  // Sync state if session changes
  useEffect(() => {
    setProfile(loadCurrentProfile());
  }, [loadCurrentProfile]);

  // Subscribe to profile changes across windows and components
  useEffect(() => {
    const handleProfileChange = (e: Event) => {
      const customEvent = e as CustomEvent<StudentProfile>;
      if (customEvent.detail) {
        setProfile(customEvent.detail);
      } else {
        setProfile(loadCurrentProfile());
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && e.key.startsWith('studyos_student_profile')) {
        setProfile(loadCurrentProfile());
      }
    };

    window.addEventListener(PROFILE_CHANGE_EVENT, handleProfileChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener(PROFILE_CHANGE_EVENT, handleProfileChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadCurrentProfile]);

  const updateProfile = useCallback(
    (updater: Partial<StudentProfile> | ((prev: StudentProfile) => StudentProfile)) => {
      setProfile((current) => {
        const next: StudentProfile =
          typeof updater === 'function' ? updater(current) : { ...current, ...updater };
        saveStoredProfile(next);
        return next;
      });
    },
    []
  );

  const save = useCallback((newProfile: StudentProfile) => {
    saveStoredProfile(newProfile);
    setProfile(newProfile);
  }, []);

  const initials = useMemo(() => getInitials(profile.fullName), [profile.fullName]);

  return {
    profile,
    updateProfile,
    saveProfile: save,
    initials,
    hasCompletedOnboarding: profile.completedOnboarding,
  };
}

