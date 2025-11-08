// src/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    // This will show in the browser console if env vars are missing
    console.warn(
        "[Supabase] Missing REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_ANON_KEY"
    );
}

export const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;
