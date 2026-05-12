import { supabase } from '@/lib/supabase';
import ProfilTentang from '@/components/public/ProfilTentang';

export const revalidate = 0;

export default async function TentangPage() {
  const { data: settings } = await supabase.from('pengaturan_web').select('*');
  const getVal = (key: string, defaultVal: string) =>
    settings?.find((s) => s.kunci === key)?.nilai || defaultVal;

  // TANGKAP SEMUA DATA LEGALITAS, SEJARAH, REKENING DARI DATABASE
  const dataProfil = {
    judul: getVal('tentang_judul', 'Profil Masjid Nurul Iman'),
    deskripsi: getVal(
      'tentang_deskripsi',
      'Menjadi pusat ibadah dan pemberdayaan umat...',
    ),
    visi_teks: getVal('tentang_visi_teks', 'Mewujudkan generasi Rabbani...'),
    misi_teks: getVal('tentang_misi_teks', 'Menyelenggarakan kajian...'),
    sejarah_judul: getVal(
      'tentang_sejarah_judul',
      'Sejarah Berdirinya Masjid Nurul Iman',
    ),
    sejarah_teks: getVal(
      'tentang_sejarah_teks',
      'Masjid Nurul Iman didirikan pada tahun 2010...',
    ),
    pengurus_judul: getVal('tentang_pengurus_judul', 'Susunan Pengurus DKM'),
    pengurus_deskripsi: getVal(
      'tentang_pengurus_deskripsi',
      'Khidmat untuk umat...',
    ),
    legalitas_judul: getVal('tentang_legalitas_judul', 'Legalitas Yayasan'),
    legalitas_teks: getVal(
      'tentang_legalitas_teks',
      'Terdaftar resmi di Kemenag RI.\nSK. Kemenkumham RI No. AHU...',
    ),
    rekening_judul: getVal('tentang_rekening_judul', 'Rekening Resmi Donasi'),
    rekening_teks: getVal(
      'tentang_rekening_teks',
      'Bank Syariah Indonesia (BSI)\nNo. Rek: 7123-456-789\nA.N. DKM Nurul Iman',
    ),
  };

  let pengurusList = [];
  const jsonPengurus = getVal('tentang_pengurus_data', '[]');
  try {
    pengurusList = JSON.parse(jsonPengurus);
  } catch (e) {
    console.error('Gagal parse data pengurus');
  }

  return (
    <div className='overflow-hidden'>
      <ProfilTentang
        data={dataProfil}
        pengurusList={pengurusList}
      />
    </div>
  );
}
