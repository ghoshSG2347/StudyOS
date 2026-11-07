import type { StudentProfile, ProfileFormData, EducationLevel } from '@/types/profile';

const STORAGE_KEY_PREFIX = 'studyos_student_profile';
export const PROFILE_CHANGE_EVENT = 'studyos:profile-changed';

export function getStorageKey(userId?: string): string {
  return userId ? `${STORAGE_KEY_PREFIX}_${userId}` : STORAGE_KEY_PREFIX;
}

export function getDefaultProfile(email?: string, name?: string, userId?: string): StudentProfile {
  return {
    id: userId || 'demo-student',
    fullName: name?.trim() || 'Alex Chen',
    email: email?.trim() || 'alex.chen@studyos.demo',
    avatarUrl: undefined,
    institute: 'University of California, Berkeley',
    educationLevel: 'College / University',
    collegeDetails: {
      courseOrBranch: 'Computer Science & Engineering',
      currentSemester: '4th Semester',
    },
    completedOnboarding: false,
    updatedAt: new Date().toISOString(),
  };
}

export function getStoredProfile(userId?: string): StudentProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StudentProfile;
    if (parsed && typeof parsed === 'object' && parsed.fullName && parsed.email) {
      return parsed;
    }
    return null;
  } catch (err) {
    console.warn('Failed to parse stored profile:', err);
    return null;
  }
}

export function saveStoredProfile(profile: StudentProfile): void {
  if (typeof window === 'undefined') return;
  try {
    const key = getStorageKey(profile.id);
    localStorage.setItem(key, JSON.stringify(profile));
    // Also save under default key if this is the active user
    localStorage.setItem(STORAGE_KEY_PREFIX, JSON.stringify(profile));

    // Notify all active listeners in the current window and other tabs
    window.dispatchEvent(new CustomEvent(PROFILE_CHANGE_EVENT, { detail: profile }));
  } catch (err) {
    console.error('Failed to save profile to localStorage:', err);
    throw new Error('Storage quota exceeded. Try using a smaller profile image.');
  }
}

export function clearStoredProfile(userId?: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(getStorageKey(userId));
  if (!userId) {
    localStorage.removeItem(STORAGE_KEY_PREFIX);
  }
}

export function hasCompletedOnboarding(userId?: string): boolean {
  const profile = getStoredProfile(userId);
  return Boolean(profile?.completedOnboarding);
}

/**
 * Extracts clean, human-readable initials from a student's full name.
 * e.g., "Alex Chen" -> "AC", "Bidisha Ghosh" -> "BG", "Sam" -> "S"
 */
export function getInitials(fullName: string): string {
  if (!fullName || !fullName.trim()) return 'S';
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'S';
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Converts a StudentProfile into the flat form structure used by onboarding & edit modal.
 */
export function profileToFormData(profile: StudentProfile): ProfileFormData {
  return {
    fullName: profile.fullName || '',
    email: profile.email || '',
    avatarUrl: profile.avatarUrl,
    institute: profile.institute || '',
    educationLevel: profile.educationLevel || '',
    currentClass: profile.schoolDetails?.currentClass || '',
    courseOrBranch: profile.collegeDetails?.courseOrBranch || '',
    currentSemester: profile.collegeDetails?.currentSemester || '',
  };
}

/**
 * Converts form data back into a structured StudentProfile, ensuring mutually
 * exclusive conditional branches (School vs College) don't leak stale fields.
 */
export function formDataToProfile(
  formData: ProfileFormData,
  existingProfile?: StudentProfile | null,
  completedOnboarding = true,
  userId?: string
): StudentProfile {
  const educationLevel: EducationLevel | undefined =
    formData.educationLevel === 'School' || formData.educationLevel === 'College / University'
      ? formData.educationLevel
      : undefined;

  return {
    id: userId || existingProfile?.id || 'demo-student',
    fullName: formData.fullName.trim(),
    email: formData.email.trim(),
    avatarUrl: formData.avatarUrl,
    institute: formData.institute.trim() || undefined,
    educationLevel,
    schoolDetails:
      educationLevel === 'School' && formData.currentClass.trim()
        ? { currentClass: formData.currentClass.trim() }
        : undefined,
    collegeDetails:
      educationLevel === 'College / University' &&
      (formData.courseOrBranch.trim() || formData.currentSemester.trim())
        ? {
            courseOrBranch: formData.courseOrBranch.trim(),
            currentSemester: formData.currentSemester.trim(),
          }
        : undefined,
    completedOnboarding,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Resizes and compresses an uploaded image file on an off-screen HTML5 canvas.
 * Produces a high-quality, lightweight base64 JPEG (<80KB) to prevent localStorage quota issues.
 */
export async function compressAndResizeImage(
  file: File,
  maxWidth = 256,
  maxHeight = 256,
  quality = 0.82
): Promise<string> {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Unsupported image format. Please upload a JPEG, PNG, WEBP, or GIF.');
  }

  // Max 8MB raw upload limit before downscaling
  if (file.size > 8 * 1024 * 1024) {
    throw new Error('Image is too large. Please select a file smaller than 8 MB.');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read the image file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image for processing.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio preserved dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas rendering context unavailable.'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

