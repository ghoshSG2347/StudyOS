import { createClient } from '@supabase/supabase-js';

// Default project credentials to ensure production deployment never crashes with a blank screen
// even if environment variables are not yet configured in the hosting provider dashboard.
const DEFAULT_SUPABASE_URL = 'https://lzeamzfkwuxlkxzalwtp.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6ZWFtemZrd3V4bGt4emFsd3RwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0MzE4NDEsImV4cCI6MjEwNDAwNzg0MX0.tLd7ExhIkkJG6YeQ_8z_JdX9XFcXFURsmZx08Ji5ZQk';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[StudyOS] Missing Supabase env vars. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in Vercel or .env'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);

