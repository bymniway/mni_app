import { supabase } from '@/lib/supabase';
import KurbanUI from '@/components/public/KurbanUI';
import FloatingAction from '@/components/public/FloatingAction';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function KurbanPage() {
  const { data: hewanData } = await supabase
    .from('hewan')
    .select('*')
    .neq('status', 'Arsip')
    .order('harga', { ascending: true });
  const jasaPotong =
    hewanData?.filter((item) => item.jenis === 'Jasa Potong') || [];
  const katalogHewan =
    hewanData?.filter((item) => item.jenis !== 'Jasa Potong') || [];

  let periodeKurban = '1447';
  if (hewanData) {
    const periods = hewanData
      .map((h) => parseInt(h.periode))
      .filter((p) => !isNaN(p));
    if (periods.length > 0) periodeKurban = Math.max(...periods).toString();
  }

  // AMBIL STATUS MENUNGGU, LUNAS, DITERIMA AGAR PROGRESS BAR REAL-TIME AKURAT
  const { data: daftarPekurban } = await supabase
    .from('pesanan')
    .select(
      `created_at, nama_mudhohi, status_pesanan, hewan_id, hewan (id, jenis, tipe, berat)`,
    )
    .in('status_pesanan', ['Booking', 'Menunggu', 'Lunas', 'Diterima'])
    .order('created_at', { ascending: false });

  const { data: settings } = await supabase.from('pengaturan_web').select('*');
  const getVal = (key: string, def = '') =>
    settings?.find((s) => s.kunci === key)?.nilai || def;

  const form = {
    kurban_hero_judul: getVal('kurban_hero_judul'),
    kurban_hero_deskripsi: getVal('kurban_hero_deskripsi'),
    kurban_dist_judul: getVal('kurban_dist_judul'),
    kurban_dist_deskripsi: getVal('kurban_dist_deskripsi'),
    kurban_faq_judul: getVal('kurban_faq_judul'),
    kurban_faq_deskripsi: getVal('kurban_faq_deskripsi'),
    kurban_snk_judul: getVal('kurban_snk_judul'),
    kurban_panitia_judul: getVal('kurban_panitia_judul'),
    kurban_panitia_deskripsi: getVal('kurban_panitia_deskripsi'),
  };

  const parseJSON = (key: string, def: any[]) => {
    const str = getVal(key);
    if (str) {
      try {
        return JSON.parse(str);
      } catch (e) {
        return def;
      }
    }
    return def;
  };

  const distList = parseJSON('kurban_dist_data', []);
  const faqList = parseJSON('kurban_faq_data', []);
  const snkList = parseJSON('kurban_snk_data', []);
  const panitiaList = parseJSON('kurban_panitia_data', []);
  const timelineList = parseJSON('kurban_timeline_data', []); // BACA TIMELINE DARI DB

  return (
    <div className='relative min-h-screen'>
      <main>
        <KurbanUI
          form={form}
          distList={distList}
          faqList={faqList}
          snkList={snkList}
          panitiaList={panitiaList}
          timelineList={timelineList} // PASS KE COMPONENT
          katalogHewan={katalogHewan}
          jasaPotong={jasaPotong}
          daftarPekurban={daftarPekurban || []}
          periodeKurban={periodeKurban}
          isEditor={false}
        />
      </main>

      {/* 2. Tombol Melayang Mobile akan selalu ada di pojok kanan bawah */}
      <FloatingAction />
    </div>
  );
}
