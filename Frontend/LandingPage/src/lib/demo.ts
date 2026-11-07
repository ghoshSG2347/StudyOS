// TEMPORARY FRONTEND DEMO MODE
// Remove/disable when Better Auth backend integration is complete.

/**
 * When enabled, provides a direct bypass via /workspace/demo to demonstrate
 * the Workspace UI without requiring a running Better Auth backend.
 *
 * Configurable via the VITE_DEMO_MODE environment variable:
 * - VITE_DEMO_MODE=true  (enabled)
 * - VITE_DEMO_MODE=false (disabled, strict production authentication)
 *
 * Defaults to true if unspecified to allow immediate frontend demonstration.
 */
export const IS_DEMO_MODE: boolean =
  import.meta.env.VITE_DEMO_MODE === undefined
    ? true
    : String(import.meta.env.VITE_DEMO_MODE).toLowerCase() === 'true';
