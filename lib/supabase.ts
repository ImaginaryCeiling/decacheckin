import { createClient } from '@supabase/supabase-js';

// 1. Public Client (Browser/Frontend) - Uses Publishable Key
// Safe to expose, respects RLS.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Validate URL to prevent build error
const isValidUrl = (url?: string) => url && (url.startsWith('http://') || url.startsWith('https://'));
const safeUrl = isValidUrl(supabaseUrl) ? supabaseUrl! : 'https://placeholder.supabase.co';

export const supabase = createClient(
  safeUrl, 
  supabasePublishableKey || 'placeholder-publishable-key'
);

// 2. Admin Client (Server-side only) - Uses Secret Key
// Bypasses RLS. Use ONLY in API routes / Server Actions.
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

// We only create this client if the secret key is available (server-side)
export const supabaseAdmin = supabaseSecretKey 
  ? createClient(safeUrl, supabaseSecretKey)
  : null;

if (!supabaseUrl || (!supabasePublishableKey && !supabaseSecretKey)) {
  if (process.env.NODE_ENV !== 'production' && typeof window === 'undefined') {
    console.warn('Missing Supabase environment variables');
  }
}
