// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const url = process.env.REACT_APP_SUPABASE_URL;
const anon = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Export null instead of throwing when env vars aren’t present
export const supabase = (url && anon) ? createClient(url, anon) : null;
