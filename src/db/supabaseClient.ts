import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qpmgaejnvxgrzrdxpitt.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_sowtXiQPWwwvygDiLFfPbg_UV7OXpS2';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Log connection status
supabase.auth.onAuthStateChange((event) => {
  console.log(`Supabase Auth Event: ${event}`);
});
