import { createClient } from '@supabase/supabase-js';
import TombolTambahAdmin from './TombolTambahAdmin';
import AdminGrid from './AdminGrid';

export default async function ManajemenAdminPage() {
  // GUNAKAN JALUR VIP: Kunci Master (Bypass RLS)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // Ambil semua data admin dari database tanpa terhalang RLS
  const { data: admins, error } = await supabaseAdmin
    .from('admin_profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className='p-6 text-red-500'>
        Gagal memuat data admin: {error.message}
      </div>
    );
  }

  // LOGIKA PENGURUTAN: Kasta Root (Dewa) harus selalu tampil di urutan teratas
  const sortedAdmins =
    admins?.sort((a, b) => {
      if (a.is_root === b.is_root) return 0;
      return a.is_root ? -1 : 1;
    }) || [];

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Manajemen Admin</h1>
          <p className='text-gray-500 text-sm mt-1'>
            Kelola hak akses dan status admin portal MNI.
          </p>
        </div>
        <TombolTambahAdmin />
      </div>

      {/* Tampilkan Grid Kartu Animasi */}
      <AdminGrid admins={sortedAdmins} />
    </div>
  );
}
