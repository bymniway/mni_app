// import { supabase } from '@/lib/supabase';
// import RamadhanUI from '@/components/public/RamadhanUI';
// import FloatingRamadhanPill from '@/components/public/FloatingRamadhanPill';

// export const dynamic = 'force-dynamic';
// export const revalidate = 0;

// export default async function RamadhanPage() {
//   // 1. Tarik Data Jadwal
//   const { data: schedules } = await supabase
//     .from('ramadan_schedules')
//     .select('*')
//     .order('tanggal', { ascending: true });

//   // 2. Tarik Data Laporan Keuangan
//   const { data: finances } = await supabase
//     .from('ramadan_finances')
//     .select('*')
//     .order('tanggal', { ascending: true });

//   // 3. Tarik Pengaturan Teks (Untuk Live Editor)
//   const { data: settings } = await supabase.from('pengaturan_web').select('*');
//   const getVal = (key: string, def = '') =>
//     settings?.find((s) => s.kunci === key)?.nilai || def;

//   const form = {
//     ramadhan_hero_judul: getVal('ramadhan_hero_judul', 'Semarak Ramadhan MNI'),
//     ramadhan_hero_deskripsi: getVal(
//       'ramadhan_hero_deskripsi',
//       'Informasi lengkap jadwal petugas tarawih, donatur takjil, dan transparansi infaq jamaah selama bulan suci.',
//     ),
//   };

//   // 4. Tentukan Tahun Hijriyah
//   let activeYear = '1447';
//   if (schedules && schedules.length > 0) {
//     activeYear = schedules[0].tahun_hijriyah;
//   }

//   return (
//     <div className='relative min-h-screen bg-[#f8fafc]'>
//       <main>
//         <RamadhanUI
//           form={form}
//           schedules={schedules || []}
//           finances={finances || []}
//           activeYear={activeYear}
//           isEditor={false}
//         />
//         {schedules && schedules.length > 0 && (
//           <FloatingRamadhanPill schedules={schedules} />
//         )}
//       </main>
//     </div>
//   );
// }
//
//
//
import { supabase } from '@/lib/supabase';
import RamadhanUI from '@/components/public/RamadhanUI';
import FloatingRamadhanPill from '@/components/public/FloatingRamadhanPill';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function RamadhanPage() {
  // 1. Tarik Data Jadwal
  const { data: schedules } = await supabase
    .from('ramadan_schedules')
    .select('*')
    .order('tanggal', { ascending: true });

  // 2. Tarik Data Laporan Keuangan
  const { data: finances } = await supabase
    .from('ramadan_finances')
    .select('*')
    .order('tanggal', { ascending: true });

  // 3. Tarik Pengaturan Teks (Untuk Live Editor)
  const { data: settings } = await supabase.from('pengaturan_web').select('*');
  const getVal = (key: string, def = '') =>
    settings?.find((s) => s.kunci === key)?.nilai || def;

  const form = {
    ramadhan_hero_judul: getVal('ramadhan_hero_judul', 'Semarak Ramadhan MNI'),
    ramadhan_hero_deskripsi: getVal(
      'ramadhan_hero_deskripsi',
      'Informasi lengkap jadwal petugas tarawih, donatur takjil, dan transparansi infaq jamaah selama bulan suci.',
    ),
  };

  // 4. PERBAIKAN UTAMA: Baca Tahun Aktif dari Pengaturan Admin
  const activeYear = getVal('ramadhan_tahun_aktif', '1446');

  // 5. FILTER DATA: Hanya ambil data yang sesuai dengan Tahun Aktif
  const activeSchedules = (schedules || []).filter(
    (s) => s.tahun_hijriyah === activeYear,
  );
  const activeFinances = (finances || []).filter(
    (f) => f.tahun_hijriyah === activeYear,
  );

  return (
    <div className='relative min-h-screen bg-[#f8fafc]'>
      <main>
        {/* Lempar data yang SUDAH DIFILTER ke UI */}
        <RamadhanUI
          form={form}
          schedules={activeSchedules}
          finances={activeFinances}
          activeYear={activeYear}
          isEditor={false}
        />
        {/* Floating Pill juga hanya mendeteksi jadwal di tahun aktif */}
        {activeSchedules.length > 0 && (
          <FloatingRamadhanPill schedules={activeSchedules} />
        )}
      </main>
    </div>
  );
}
