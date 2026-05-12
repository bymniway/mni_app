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
