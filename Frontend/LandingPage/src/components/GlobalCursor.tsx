import { useCustomCursor } from '@/hooks/useCustomCursor';

/**
 * GlobalCursor renders and manages the StudyOS custom pointer across all routes.
 * Mounted at the root application level to ensure seamless route transitions
 * without flickering, reset, or duplication.
 */
export function GlobalCursor() {
  useCustomCursor();
  return null;
}
