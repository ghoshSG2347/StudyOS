export type EducationLevel = 'School' | 'College / University';

export interface SchoolDetails {
  currentClass: string; // e.g. "Class 10", "Class 12"
}

export interface CollegeDetails {
  courseOrBranch: string; // e.g. "B.Tech Computer Science"
  currentSemester: string; // e.g. "4th Semester"
}

export interface StudentProfile {
  id: string; // User ID or 'demo-student'
  fullName: string; // Required
  email: string; // Read-only from authentication
  avatarUrl?: string; // Optional base64 or URL
  institute?: string; // Optional (School / College name)
  educationLevel?: EducationLevel; // Optional
  schoolDetails?: SchoolDetails; // Populated only if educationLevel === 'School'
  collegeDetails?: CollegeDetails; // Populated only if educationLevel === 'College / University'
  completedOnboarding: boolean; // True once user completes or skips onboarding
  updatedAt: string;
}

export interface ProfileFormData {
  fullName: string;
  email: string;
  avatarUrl?: string;
  institute: string;
  educationLevel: EducationLevel | '';
  currentClass: string;
  courseOrBranch: string;
  currentSemester: string;
}

