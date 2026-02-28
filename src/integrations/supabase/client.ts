import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Get environment variables from .env file
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

console.log('Supabase Configuration:', {
  URL: SUPABASE_URL,
  KEY_LENGTH: SUPABASE_ANON_KEY?.length || 0,
  KEY_PRESENT: !!SUPABASE_ANON_KEY
});

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Create Supabase client
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

console.log('✅ Supabase client created successfully');
