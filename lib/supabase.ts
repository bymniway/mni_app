import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client untuk operasi standar (bisa dipanggil dari Frontend/Client Components)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client dengan Service Role Key (HANYA boleh dipanggil di Backend/API Routes)
// Berguna untuk bypass aturan RLS (Row Level Security) saat proses upload/verifikasi sensitif
export const getServiceSupabase = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, serviceKey);
};
