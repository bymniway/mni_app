import { supabase } from '@/lib/supabase';
import JadwalKajian from '@/components/public/JadwalKajian';

export const revalidate = 0; // Memastikan data selalu segar saat direfresh

export default async function KajianPage() {
  // Ambil pengaturan dari Supabase
  const { data: settings } = await supabase.from('pengaturan_web').select('*');
  const getVal = (key: string, defaultVal: string) =>
    settings?.find((s) => s.kunci === key)?.nilai || defaultVal;

  const dataKajian = {
    judul: getVal('kajian_judul', 'Jadwal Majelis Ilmu'),
    deskripsi: getVal(
      'kajian_deskripsi',
      "Mari makmurkan masjid dan segarkan iman dengan menuntut ilmu syar'i.",
    ),
  };

  let kajianList = [];
  const jsonKajian = getVal('kajian_data', '[]');
  try {
    kajianList = JSON.parse(jsonKajian);
  } catch (e) {
    console.error('Gagal parse data kajian');
  }

  return (
    <div className='overflow-hidden bg-gray-50/30 min-h-screen py-10'>
      <JadwalKajian
        data={dataKajian}
        kajianList={kajianList}
        isEditor={false}
      />
    </div>
  );
}
