import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const supabaseUrl = rawUrl.replace(/['"]/g, '').trim();
const supabaseAnonKey = rawKey.replace(/['"]/g, '').trim();

const isValidUrl = supabaseUrl.length > 10 && (supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://'));

export const supabase = (isValidUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true },
      realtime: { params: { eventsPerSecond: 20 } }
    }) 
  : null;
