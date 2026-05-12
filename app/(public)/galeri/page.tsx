import { supabase } from '@/lib/supabase';
import GaleriKegiatan from '@/components/public/GaleriKegiatan';

export const revalidate = 0;

export default async function GaleriPage() {
  const { data: settings } = await supabase.from('pengaturan_web').select('*');
  const getVal = (key: string, defaultVal: string) =>
    settings?.find((s) => s.kunci === key)?.nilai || defaultVal;

  const dataGaleri = {
    judul: getVal('galeri_judul', 'Galeri Kegiatan'),
    deskripsi: getVal(
      'galeri_deskripsi',
      'Rekam jejak kebaikan dan semarak dakwah...',
    ),
  };

  let galleryList = [];
  const jsonGaleri = getVal('galeri_data', '[]');
  try {
    galleryList = JSON.parse(jsonGaleri);
  } catch (e) {
    console.error('Gagal parse data galeri');
  }

  return (
    <div className='overflow-hidden'>
      <GaleriKegiatan
        data={dataGaleri}
        galleryList={galleryList}
      />
    </div>
  );
}
