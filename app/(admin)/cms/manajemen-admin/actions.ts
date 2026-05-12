'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

export async function tambahAdminAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const nama_lengkap = formData.get('nama') as string;
  const is_root = formData.get('is_root') === 'true';

  // 1. Panggil Supabase menggunakan KUNCI MASTER (Bypass RLS)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  try {
    // 2. Buat akun di sistem Authentication (Tanpa verifikasi email)
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Bypass wajib klik link verifikasi email
      });

    if (authError) throw new Error(`Gagal buat Auth: ${authError.message}`);
    if (!authData.user) throw new Error('User gagal dibuat');

    // 3. Masukkan "KTP" ke tabel admin_profiles
    const { error: profileError } = await supabaseAdmin
      .from('admin_profiles')
      .insert({
        id: authData.user.id,
        email,
        nama_lengkap,
        is_root,
        is_active: true,
        akses_halaman: is_root ? [] : ['/cms/beranda'], // Default akses awal
      });

    if (profileError) {
      // Jika gagal buat profil, hapus auth-nya agar bersih (Rollback)
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw new Error(`Gagal buat Profil: ${profileError.message}`);
    }

    // 4. Refresh halaman secara otomatis agar data baru muncul
    revalidatePath('/cms/manajemen-admin');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

// Fungsi untuk Mengubah Data Admin
export async function updateAdminAction(id: string, formData: FormData) {
  const nama_lengkap = formData.get('nama') as string;
  const is_root = formData.get('is_root') === 'true';
  const is_active = formData.get('is_active') === 'true';

  // Ambil data akses_halaman dari form (dikirim sebagai JSON string)
  const akses_halaman = JSON.parse(formData.get('akses_halaman') as string);

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // ==========================================
  // PERTAHANAN LAPIS BAJA DI SERVER
  // ==========================================
  // Ambil dulu KTP asli dari database untuk mengecek emailnya
  const { data: targetAdmin } = await supabaseAdmin
    .from('admin_profiles')
    .select('email')
    .eq('id', id)
    .single();

  // Jika yang mau diedit adalah Super Admin, paksa statusnya selalu Dewa & Aktif
  let finalIsRoot = is_root;
  let finalIsActive = is_active;

  if (targetAdmin?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL) {
    finalIsRoot = true;
    finalIsActive = true;
  }
  // ==========================================

  const { error } = await supabaseAdmin
    .from('admin_profiles')
    .update({
      nama_lengkap,
      is_root,
      is_active,
      akses_halaman: is_root ? [] : akses_halaman, // Root tidak butuh pembatasan
    })
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/cms/manajemen-admin');
  return { success: true };
}

// Fungsi untuk Menghapus Admin (Hapus Auth & Profile Sekaligus)
export async function hapusAdminAction(id: string) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // Hapus di Auth (Otomatis menghapus profile karena ada Cascade di DB kita)
  const { error } = await supabaseAdmin.auth.admin.deleteUser(id);

  if (error) return { error: error.message };

  revalidatePath('/cms/manajemen-admin');
  return { success: true };
}

// Fungsi untuk Menghapus Banyak Admin Sekaligus
export async function hapusBanyakAdminAction(ids: string[]) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  for (const id of ids) {
    await supabaseAdmin.auth.admin.deleteUser(id);
  }

  revalidatePath('/cms/manajemen-admin');
  return { success: true };
}

// Fungsi untuk Memaksa Reset Password (Ganti Sandi)
export async function resetPasswordAdminAction(id: string, formData: FormData) {
  const passwordLembek = formData.get('password') as string;

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // Paksa update password di sistem Auth Supabase
  const { error } = await supabaseAdmin.auth.admin.updateUserById(id, {
    password: passwordLembek,
  });

  if (error) return { error: error.message };
  return { success: true };
}
