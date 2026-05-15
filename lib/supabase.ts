// import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// // Client untuk operasi standar (bisa dipanggil dari Frontend/Client Components)
// export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// // Client dengan Service Role Key (HANYA boleh dipanggil di Backend/API Routes)
// // Berguna untuk bypass aturan RLS (Row Level Security) saat proses upload/verifikasi sensitif
// export const getServiceSupabase = () => {
//   const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
//   return createClient(supabaseUrl, serviceKey);
// };
//
//
//
import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

// 1. CLIENT SIDE (Untuk Sidebar, Editor, dan Komponen 'use client')
// Menggunakan SSR agar sinkron dengan Middleware (Cookies)
// Dibuat Singleton (di luar fungsi) agar bebas warning "Multiple GoTrueClient"
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

// 2. SERVER SIDE / ADMIN (Untuk API Routes & Server Actions)
// Menggunakan Service Role Key untuk bypass RLS.
// Tetap dalam fungsi agar key-nya hanya dipanggil saat dibutuhkan di server.
export const getServiceSupabase = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Pastikan tidak ada NEXT_PUBLIC_ di depannya
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
    auth: {
      persistSession: false, // Penting di server agar tidak rebutan session
      autoRefreshToken: false,
    },
  });
};
