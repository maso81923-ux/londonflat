import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ffqwbtvdemoihuxbmczq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_rFuQxqMcTsb74DkaVa9NCg_Y91O37KV';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Log connection status
supabase.auth.onAuthStateChange((event) => {
  console.log(`Supabase Auth Event: ${event}`);
});
