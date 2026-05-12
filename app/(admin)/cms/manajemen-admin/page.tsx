// import { createServerClient } from '@supabase/ssr';
// import { cookies } from 'next/headers';
// import { Shield, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';
// import TombolTambahAdmin from './TombolTambahAdmin';
// import AksiAdmin from './AksiAdmin';

// export default async function ManajemenAdminPage() {
//   const cookieStore = await cookies();
//   const supabase = createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         getAll() {
//           return cookieStore.getAll();
//         },
//       },
//     },
//   );

//   // Ambil semua data admin dari database
//   const { data: admins, error } = await supabase
//     .from('admin_profiles')
//     .select('*')
//     .order('created_at', { ascending: false });

//   if (error) {
//     return (
//       <div className='p-6 text-red-500'>
//         Gagal memuat data admin: {error.message}
//       </div>
//     );
//   }

//   return (
//     <div className='space-y-6'>
//       <div className='flex justify-between items-center'>
//         <div>
//           <h1 className='text-2xl font-bold text-gray-900'>Manajemen Admin</h1>
//           <p className='text-gray-500 text-sm mt-1'>
//             Kelola hak akses dan status admin portal MNI.
//           </p>
//         </div>
//         <TombolTambahAdmin />
//       </div>

//       <div className='bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm'>
//         <table className='w-full text-left text-sm'>
//           <thead className='bg-gray-50 border-b border-gray-200 text-gray-600'>
//             <tr>
//               <th className='px-6 py-4 font-semibold'>Email & Nama</th>
//               <th className='px-6 py-4 font-semibold'>Role / Kasta</th>
//               <th className='px-6 py-4 font-semibold'>Status</th>
//               <th className='px-6 py-4 font-semibold'>Akses Halaman</th>
//               <th className='px-6 py-4 font-semibold text-right'>Aksi</th>
//             </tr>
//           </thead>
//           <tbody className='divide-y divide-gray-100'>
//             {admins?.map((admin) => (
//               <tr
//                 key={admin.id}
//                 className='hover:bg-gray-50 transition-colors'>
//                 <td className='px-6 py-4'>
//                   <div className='font-medium text-gray-900'>
//                     {admin.nama_lengkap || 'Belum diatur'}
//                   </div>
//                   <div className='text-gray-500 text-xs'>{admin.email}</div>
//                 </td>
//                 <td className='px-6 py-4'>
//                   {admin.is_root ? (
//                     <span className='inline-flex items-center space-x-1 text-purple-700 bg-purple-100 px-2.5 py-1 rounded-md text-xs font-bold'>
//                       <ShieldAlert className='w-3.5 h-3.5' /> <span>ROOT</span>
//                     </span>
//                   ) : (
//                     <span className='inline-flex items-center space-x-1 text-blue-700 bg-blue-100 px-2.5 py-1 rounded-md text-xs font-bold'>
//                       <Shield className='w-3.5 h-3.5' /> <span>ADMIN</span>
//                     </span>
//                   )}
//                 </td>
//                 <td className='px-6 py-4'>
//                   {admin.is_active ? (
//                     <span className='inline-flex items-center text-green-600 font-medium'>
//                       <CheckCircle2 className='w-4 h-4 mr-1' /> Aktif
//                     </span>
//                   ) : (
//                     <span className='inline-flex items-center text-red-500 font-medium'>
//                       <XCircle className='w-4 h-4 mr-1' /> Nonaktif
//                     </span>
//                   )}
//                 </td>
//                 <td className='px-6 py-4'>
//                   {admin.is_root ? (
//                     <span className='text-gray-400 italic text-xs'>
//                       Semua Akses
//                     </span>
//                   ) : (
//                     <div className='flex flex-wrap gap-1'>
//                       {admin.akses_halaman?.map((path: string) => (
//                         <span
//                           key={path}
//                           className='bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs'>
//                           {path}
//                         </span>
//                       ))}
//                     </div>
//                   )}
//                 </td>
//                 <td className='px-6 py-4 text-right'>
//                   <AksiAdmin admin={admin} />
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }
//
//
//
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
