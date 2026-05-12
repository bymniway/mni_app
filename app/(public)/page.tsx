// import { supabase } from '@/lib/supabase';
// import HeroBeranda from '@/components/public/HeroBeranda';

// // WAJIB: Agar halaman selalu menarik data terbaru dari database
// export const revalidate = 0;

// export default async function BerandaPage() {
//   // 1. Ambil data dinamis dari Supabase
//   const { data: settings } = await supabase.from('pengaturan_web').select('*');

//   // Fungsi kecil untuk mengambil nilai
//   const getVal = (key: string, defaultVal: string) =>
//     settings?.find((s) => s.kunci === key)?.nilai || defaultVal;

//   // Bungkus data untuk dikirim ke UI
//   const dataPengaturan = {
//     badge: getVal('beranda_hero_badge', 'Ahlan wa Sahlan di MNI App'),
//     judul: getVal('beranda_hero_judul', 'Pusat Informasi & Layanan Umat'),
//     deskripsi: getVal(
//       'beranda_hero_deskripsi',
//       'Selamat datang di portal resmi Masjid Nurul Iman.',
//     ),
//     gambar_url: getVal('beranda_hero_gambar', ''),
//     program_judul: getVal('beranda_program_judul', 'Layanan & Program MNI'),
//     program_deskripsi: getVal(
//       'beranda_program_deskripsi',
//       'Akses berbagai layanan masjid dengan mudah dan cepat melalui genggaman Anda.',
//     ),
//     banner_judul: getVal('beranda_banner_judul', 'Susunan Kepengurusan'),
//     banner_deskripsi: getVal(
//       'beranda_banner_deskripsi',
//       'Kenali lebih dekat struktur organisasi dan panitia yang berkhidmat di Masjid Nurul Iman.',
//     ),
//   };

//   // 2. Data dummy Jadwal Shalat
//   const jadwalShalatHariIni = [
//     { nama: 'Subuh', waktu: '04:35' },
//     { nama: 'Dzuhur', waktu: '11:52' },
//     { nama: 'Ashar', waktu: '15:13' },
//     { nama: 'Maghrib', waktu: '17:48' },
//     { nama: 'Isya', waktu: '19:01' },
//   ];

//   return (
//     <div className='overflow-hidden'>
//       {/*
//         Panggil Mesin Utama (HeroBeranda)
//         - isPublic={true} : Mengaktifkan klik pada Link
//         - jadwalShalat : Melempar data array shalat
//       */}
//       <HeroBeranda
//         data={dataPengaturan}
//         isPublic={true}
//         jadwalShalat={jadwalShalatHariIni}
//       />
//     </div>
//   );
// }
//
//
//
import { supabase } from '@/lib/supabase';
import HeroBeranda from '@/components/public/HeroBeranda';

export const revalidate = 0;

export default async function BerandaPage() {
  const { data: settings } = await supabase.from('pengaturan_web').select('*');

  const dataPengaturan: any = {};
  if (settings) {
    settings.forEach((item) => {
      if (item.kunci.startsWith('beranda_')) {
        // Hilangkan awalan 'beranda_'
        let key = item.kunci.replace('beranda_', '');

        // SINKRONISASI: Petakan kunci hero agar pas dengan komponen
        if (key === 'hero_badge') key = 'badge';
        if (key === 'hero_judul') key = 'judul';
        if (key === 'hero_deskripsi') key = 'deskripsi';
        if (key === 'fasilitas_json') key = 'fasilitas';
        if (key === 'quotes_json') key = 'quotes';

        try {
          dataPengaturan[key] = JSON.parse(item.nilai);
        } catch (e) {
          dataPengaturan[key] = item.nilai;
        }
      }
    });
  }

  return (
    <div className='overflow-hidden'>
      <HeroBeranda
        data={dataPengaturan}
        isPublic={true}
      />
    </div>
  );
}
