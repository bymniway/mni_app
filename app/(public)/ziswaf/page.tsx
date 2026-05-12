import { supabase } from '@/lib/supabase';
import ZiswafCalculator from '@/components/public/ZiswafCalculator';

export const revalidate = 0;

export default async function ZiswafPage() {
  const { data: settings } = await supabase.from('pengaturan_web').select('*');
  const getVal = (key: string, defaultVal: string) =>
    settings?.find((s) => s.kunci === key)?.nilai || defaultVal;

  const dataZiswaf = {
    judul: getVal('ziswaf_judul', 'Layanan ZISWAF'),
    deskripsi: getVal(
      'ziswaf_deskripsi',
      'Tunaikan kewajiban zakat dan raih pahala jariyah melalui layanan terpadu DKM Masjid Nurul Iman.',
    ),
  };

  // Data Wakaf (Diganti menjadi Atap dan Kusen Masjid)
  let wakafList = [];
  const jsonWakaf = getVal('ziswaf_wakaf_data', '[]');
  try {
    wakafList = JSON.parse(jsonWakaf);
  } catch (e) {
    console.error('Gagal parse data wakaf');
  }

  if (wakafList.length === 0) {
    wakafList = [
      {
        id: 1,
        judul: 'Penggantian Atap Masjid',
        deskripsi:
          'Peremajaan struktur atap dan kubah masjid yang sudah termakan usia untuk kenyamanan ibadah jamaah.',
        target: 250000000,
        terkumpul: 120000000,
        gambar_url:
          'https://images.unsplash.com/photo-1552858725-2758b5fb1286?auto=format&fit=crop&q=80',
      },
      {
        id: 2,
        judul: 'Pengadaan Kusen & Pintu Jati',
        deskripsi:
          'Penggantian kusen dan pintu utama masjid menggunakan kayu jati berkualitas agar kokoh dan tahan lama.',
        target: 85000000,
        terkumpul: 15000000,
        gambar_url:
          'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&q=80',
      },
    ];
  }

  return (
    <div className='overflow-hidden bg-slate-50 min-h-screen'>
      <ZiswafCalculator
        data={dataZiswaf}
        wakafList={wakafList}
      />
    </div>
  );
}
