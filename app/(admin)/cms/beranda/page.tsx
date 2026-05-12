'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import HeroBeranda from '@/components/public/HeroBeranda';
import { Save, Loader2, MousePointerClick } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EditorBeranda() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // State Data Dinamis
  const [form, setForm] = useState<any>({
    info_dkm:
      "• Assalamu'alaikum. Shalat Idul Adha 1447 H akan diselenggarakan di Lapangan Utama. • Dibutuhkan segera tambahan relawan panitia Kurban. • Saldo wakaf pembebasan lahan parkir masih kurang Rp 15.000.000,-.",
    badge: 'Ahlan wa Sahlan',
    judul: 'Pusat Ibadah & Pemberdayaan Umat',
    deskripsi:
      'Masjid Nurul Iman hadir sebagai sentra kegiatan keislaman, merajut ukhuwah, dan menebar rahmah.',
    gambar_url: '',
    jadwal_judul: 'Jadwal Shalat',
    kas_ops_judul: 'Kas Operasional',
    kas_ops_desc: 'Laporan Transparansi Dana Umat',
    kas_ops_v1: 'Rp 15.450.000',
    kas_ops_l1: 'Saldo per Hari Ini',
    kas_ops_v2: 'Rp 3.120.000',
    kas_ops_l2: 'Pengeluaran Pekan Ini',
    kas_yatim_judul: 'Kas Yatim & Sosial',
    kas_yatim_desc: 'Penyaluran ZISWAF & Donasi',
    kas_yatim_v1: 'Rp 8.200.000',
    kas_yatim_l1: 'Saldo Anak Yatim',
    kas_yatim_v2: 'Rp 2.500.000',
    kas_yatim_l2: 'Penyaluran Bulan Ini',
    fasilitas_judul: 'Fasilitas Masjid',
    fasilitas: [],
    program_judul: 'Spotlight Program',
    program_desc: 'Info terkini dari kegiatan dan layanan utama Masjid.',

    // INFO TEKS KURBAN & ZISWAF
    kurban_info_0: 'Pendaftaran ditutup H-3 Idul Adha',
    kurban_info_1: 'Sapi Urunan B kurang 2 Shohibul lagi!',
    kurban_info_2: 'Tersedia cicilan 0% untuk Sapi Tipe A',
    kurban_info_3: 'Laporan penyembelihan live & transparan',
    ziswaf_info_0: 'Mari tunaikan kewajiban Zakat Fitrah Anda',
    ziswaf_info_1: 'Peluang Jariyah: Pembebasan Lahan Parkir',
    ziswaf_info_2: 'Sedekah subuh, pembuka pintu rezeki',

    layanan_judul: 'Layanan & Program MNI',
    layanan_desc:
      'Akses berbagai layanan terpadu masjid dengan mudah dan cepat.',
    layanan_1_judul: 'Layanan Kurban',
    layanan_1_desc:
      'Pilih hewan kurban terbaik dengan transparansi harga dan laporan pemotongan yang jelas ke perangkat Anda.',
    layanan_2_judul: 'Kalkulator ZISWAF',
    layanan_2_desc:
      'Hitung nisab zakat profesi dan harta Anda secara instan, serta salurkan untuk pemberdayaan umat.',
    layanan_3_judul: 'Jadwal Kajian',
    layanan_3_desc:
      'Ikuti berbagai majelis ilmu dan kajian rutin mingguan bersanad untuk memperdalam pemahaman agama.',
    quotes: [],
    media_judul: 'Media & Inspirasi',
    media_desc: 'Tingkatkan iman melalui ragam artikel dan kajian digital.',
    galeri_judul: 'Potret Kegiatan MNI',
    galeri_desc: 'Tarik manual untuk menggeser, atau biarkan mengalir sendiri.',
    kontak_judul: 'Hubungi Kami',
    kontak_alamat:
      'Jl. Kebahagiaan No. 99, Kecamatan Sukses, Kota Metropolitan, 12345',
    kontak_telp: '+62 812 3456 7890',
    kontak_email: 'sekretariat@nuruliman.id',
    banner_judul: 'Kenali Kami Lebih Dekat',
    banner_desc:
      'Pelajari sejarah, visi, dan susunan kepengurusan Masjid Nurul Iman.',
  });

  const [adj, setAdj] = useState('0');

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from('pengaturan_web').select('*');
      if (data) {
        const getVal = (key: string, def: string) =>
          data.find((d) => d.kunci === key)?.nilai || def;

        let parsedFasilitas = [
          { id: '1', nama: 'Ruang Ber-AC', iconName: 'Snowflake' },
          { id: '2', nama: 'Parkir Luas', iconName: 'Car' },
          { id: '3', nama: 'WiFi Gratis', iconName: 'Wifi' },
          { id: '4', nama: 'Air Minum', iconName: 'Coffee' },
          { id: '5', nama: 'Multimedia', iconName: 'MonitorPlay' },
        ];
        try {
          parsedFasilitas = JSON.parse(getVal('beranda_fasilitas_json', ''));
        } catch (e) {}

        let parsedQuotes = [
          {
            id: '1',
            text: 'Sebaik-baik manusia adalah yang paling bermanfaat bagi orang lain.',
            source: 'HR. Ahmad',
          },
          {
            id: '2',
            text: 'Barangsiapa menempuh suatu jalan untuk menuntut ilmu, maka Allah akan mudahkan baginya jalan menuju surga.',
            source: 'HR. Muslim',
          },
          {
            id: '3',
            text: 'Janganlah meremehkan kebaikan sekecil apapun, meski hanya dengan tersenyum saat berjumpa saudaramu.',
            source: 'HR. Muslim',
          },
        ];
        try {
          parsedQuotes = JSON.parse(getVal('beranda_quotes_json', ''));
        } catch (e) {}

        setForm({
          info_dkm: getVal('beranda_info_dkm', form.info_dkm),
          badge: getVal('beranda_hero_badge', form.badge),
          judul: getVal('beranda_hero_judul', form.judul),
          deskripsi: getVal('beranda_hero_deskripsi', form.deskripsi),
          gambar_url: getVal('beranda_hero_gambar', ''),
          jadwal_judul: getVal('beranda_jadwal_judul', form.jadwal_judul),
          kas_ops_judul: getVal('beranda_kas_ops_judul', form.kas_ops_judul),
          kas_ops_desc: getVal('beranda_kas_ops_desc', form.kas_ops_desc),
          kas_ops_v1: getVal('beranda_kas_ops_v1', form.kas_ops_v1),
          kas_ops_l1: getVal('beranda_kas_ops_l1', form.kas_ops_l1),
          kas_ops_v2: getVal('beranda_kas_ops_v2', form.kas_ops_v2),
          kas_ops_l2: getVal('beranda_kas_ops_l2', form.kas_ops_l2),
          kas_yatim_judul: getVal(
            'beranda_kas_yatim_judul',
            form.kas_yatim_judul,
          ),
          kas_yatim_desc: getVal('beranda_kas_yatim_desc', form.kas_yatim_desc),
          kas_yatim_v1: getVal('beranda_kas_yatim_v1', form.kas_yatim_v1),
          kas_yatim_l1: getVal('beranda_kas_yatim_l1', form.kas_yatim_l1),
          kas_yatim_v2: getVal('beranda_kas_yatim_v2', form.kas_yatim_v2),
          kas_yatim_l2: getVal('beranda_kas_yatim_l2', form.kas_yatim_l2),
          fasilitas_judul: getVal(
            'beranda_fasilitas_judul',
            form.fasilitas_judul,
          ),
          fasilitas: parsedFasilitas,
          program_judul: getVal('beranda_program_judul', form.program_judul),
          program_desc: getVal('beranda_program_desc', form.program_desc),

          // INFO TEKS KURBAN & ZISWAF
          kurban_info_0: getVal('beranda_kurban_info_0', form.kurban_info_0),
          kurban_info_1: getVal('beranda_kurban_info_1', form.kurban_info_1),
          kurban_info_2: getVal('beranda_kurban_info_2', form.kurban_info_2),
          kurban_info_3: getVal('beranda_kurban_info_3', form.kurban_info_3),
          ziswaf_info_0: getVal('beranda_ziswaf_info_0', form.ziswaf_info_0),
          ziswaf_info_1: getVal('beranda_ziswaf_info_1', form.ziswaf_info_1),
          ziswaf_info_2: getVal('beranda_ziswaf_info_2', form.ziswaf_info_2),

          layanan_judul: getVal('beranda_layanan_judul', form.layanan_judul),
          layanan_desc: getVal('beranda_layanan_desc', form.layanan_desc),
          layanan_1_judul: getVal(
            'beranda_layanan_1_judul',
            form.layanan_1_judul,
          ),
          layanan_1_desc: getVal('beranda_layanan_1_desc', form.layanan_1_desc),
          layanan_2_judul: getVal(
            'beranda_layanan_2_judul',
            form.layanan_2_judul,
          ),
          layanan_2_desc: getVal('beranda_layanan_2_desc', form.layanan_2_desc),
          layanan_3_judul: getVal(
            'beranda_layanan_3_judul',
            form.layanan_3_judul,
          ),
          layanan_3_desc: getVal('beranda_layanan_3_desc', form.layanan_3_desc),
          quotes: parsedQuotes,
          media_judul: getVal('beranda_media_judul', form.media_judul),
          media_desc: getVal('beranda_media_desc', form.media_desc),
          galeri_judul: getVal('beranda_galeri_judul', form.galeri_judul),
          galeri_desc: getVal('beranda_galeri_desc', form.galeri_desc),
          kontak_judul: getVal('beranda_kontak_judul', form.kontak_judul),
          kontak_alamat: getVal('beranda_kontak_alamat', form.kontak_alamat),
          kontak_telp: getVal('beranda_kontak_telp', form.kontak_telp),
          kontak_email: getVal('beranda_kontak_email', form.kontak_email),
          banner_judul: getVal('beranda_banner_judul', form.banner_judul),
          banner_desc: getVal('beranda_banner_desc', form.banner_desc),
        });
        setAdj(getVal('hijri_adjustment', '0'));
      }
      setIsLoading(false);
    };
    fetchSettings();
  }, []);

  const handleTextChange = (key: string, value: string) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleFasilitasUpdate = (id: string, newNama: string) => {
    setForm((prev: any) => ({
      ...prev,
      fasilitas: prev.fasilitas.map((f: any) =>
        f.id === id ? { ...f, nama: newNama } : f,
      ),
    }));
  };

  const handleFasilitasDelete = (id: string) => {
    setForm((prev: any) => ({
      ...prev,
      fasilitas: prev.fasilitas.filter((f: any) => f.id !== id),
    }));
  };

  const handleFasilitasAdd = () => {
    setForm((prev: any) => ({
      ...prev,
      fasilitas: [
        ...prev.fasilitas,
        {
          id: Date.now().toString(),
          nama: 'Fasilitas Baru',
          iconName: 'CheckCircle2',
        },
      ],
    }));
  };

  const handleQuoteUpdate = (id: string, key: string, value: string) => {
    setForm((prev: any) => ({
      ...prev,
      quotes: prev.quotes.map((q: any) =>
        q.id === id ? { ...q, [key]: value } : q,
      ),
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', 'mni-assets');
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await res.json();
      if (result.url)
        setForm((prev: any) => ({ ...prev, gambar_url: result.url }));
    } catch (error) {
      alert('Gagal upload gambar.');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePublish = async () => {
    setIsSaving(true);
    const updates = [
      { kunci: 'beranda_info_dkm', nilai: form.info_dkm },
      { kunci: 'beranda_hero_badge', nilai: form.badge },
      { kunci: 'beranda_hero_judul', nilai: form.judul },
      { kunci: 'beranda_hero_deskripsi', nilai: form.deskripsi },
      { kunci: 'beranda_hero_gambar', nilai: form.gambar_url },
      { kunci: 'beranda_jadwal_judul', nilai: form.jadwal_judul },
      { kunci: 'beranda_kas_ops_judul', nilai: form.kas_ops_judul },
      { kunci: 'beranda_kas_ops_desc', nilai: form.kas_ops_desc },
      { kunci: 'beranda_kas_ops_v1', nilai: form.kas_ops_v1 },
      { kunci: 'beranda_kas_ops_l1', nilai: form.kas_ops_l1 },
      { kunci: 'beranda_kas_ops_v2', nilai: form.kas_ops_v2 },
      { kunci: 'beranda_kas_ops_l2', nilai: form.kas_ops_l2 },
      { kunci: 'beranda_kas_yatim_judul', nilai: form.kas_yatim_judul },
      { kunci: 'beranda_kas_yatim_desc', nilai: form.kas_yatim_desc },
      { kunci: 'beranda_kas_yatim_v1', nilai: form.kas_yatim_v1 },
      { kunci: 'beranda_kas_yatim_l1', nilai: form.kas_yatim_l1 },
      { kunci: 'beranda_kas_yatim_v2', nilai: form.kas_yatim_v2 },
      { kunci: 'beranda_kas_yatim_l2', nilai: form.kas_yatim_l2 },
      { kunci: 'beranda_fasilitas_judul', nilai: form.fasilitas_judul },
      {
        kunci: 'beranda_fasilitas_json',
        nilai: JSON.stringify(form.fasilitas),
      },
      { kunci: 'beranda_program_judul', nilai: form.program_judul },
      { kunci: 'beranda_program_desc', nilai: form.program_desc },

      // INFO TEKS KURBAN & ZISWAF
      { kunci: 'beranda_kurban_info_0', nilai: form.kurban_info_0 },
      { kunci: 'beranda_kurban_info_1', nilai: form.kurban_info_1 },
      { kunci: 'beranda_kurban_info_2', nilai: form.kurban_info_2 },
      { kunci: 'beranda_kurban_info_3', nilai: form.kurban_info_3 },
      { kunci: 'beranda_ziswaf_info_0', nilai: form.ziswaf_info_0 },
      { kunci: 'beranda_ziswaf_info_1', nilai: form.ziswaf_info_1 },
      { kunci: 'beranda_ziswaf_info_2', nilai: form.ziswaf_info_2 },

      { kunci: 'beranda_layanan_judul', nilai: form.layanan_judul },
      { kunci: 'beranda_layanan_desc', nilai: form.layanan_desc },
      { kunci: 'beranda_layanan_1_judul', nilai: form.layanan_1_judul },
      { kunci: 'beranda_layanan_1_desc', nilai: form.layanan_1_desc },
      { kunci: 'beranda_layanan_2_judul', nilai: form.layanan_2_judul },
      { kunci: 'beranda_layanan_2_desc', nilai: form.layanan_2_desc },
      { kunci: 'beranda_layanan_3_judul', nilai: form.layanan_3_judul },
      { kunci: 'beranda_layanan_3_desc', nilai: form.layanan_3_desc },
      { kunci: 'beranda_quotes_json', nilai: JSON.stringify(form.quotes) },
      { kunci: 'beranda_media_judul', nilai: form.media_judul },
      { kunci: 'beranda_media_desc', nilai: form.media_desc },
      { kunci: 'beranda_galeri_judul', nilai: form.galeri_judul },
      { kunci: 'beranda_galeri_desc', nilai: form.galeri_desc },
      { kunci: 'beranda_kontak_judul', nilai: form.kontak_judul },
      { kunci: 'beranda_kontak_alamat', nilai: form.kontak_alamat },
      { kunci: 'beranda_kontak_telp', nilai: form.kontak_telp },
      { kunci: 'beranda_kontak_email', nilai: form.kontak_email },
      { kunci: 'beranda_banner_judul', nilai: form.banner_judul },
      { kunci: 'beranda_banner_desc', nilai: form.banner_desc },
      { kunci: 'hijri_adjustment', nilai: adj },
    ];

    for (const item of updates) {
      await supabase
        .from('pengaturan_web')
        .upsert(item, { onConflict: 'kunci' });
    }

    setIsSaving(false);
    alert('Perubahan Beranda & Koreksi Kalender berhasil dipublikasikan!');
  };

  if (isLoading)
    return (
      <div className='p-10 flex justify-center mt-20'>
        <Loader2 className='animate-spin text-mni-primary w-8 h-8' />
      </div>
    );

  return (
    <div className='relative'>
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className='sticky top-4 z-70 flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-gray-100 max-w-7xl mx-auto mb-8 gap-4'>
        <div className='flex items-center'>
          <div className='w-10 h-10 bg-mni-primary text-white rounded-xl flex items-center justify-center mr-3 shrink-0'>
            <MousePointerClick className='w-6 h-6' />
          </div>
          <div>
            <h1 className='text-2xl font-black text-slate-800 tracking-tight'>
              Live Visual Editor Beranda
            </h1>
            <p className='text-xs text-gray-500 font-medium hidden md:block'>
              Arahkan mouse untuk menjeda animasi, dan klik teks untuk mengedit.
            </p>
          </div>
        </div>

        <div className='flex items-center gap-3 w-full lg:w-auto'>
          <div className='flex flex-1 lg:flex-none items-center bg-gray-50 px-3 py-2 rounded-xl border border-gray-200'>
            <span className='text-[10px] font-bold text-gray-500 mr-2 uppercase tracking-wider hidden sm:block'>
              Koreksi Hijriah:
            </span>
            <select
              value={adj}
              onChange={(e) => setAdj(e.target.value)}
              className='bg-transparent text-sm font-bold text-gray-800 outline-none w-full lg:w-auto cursor-pointer'>
              <option value='-2'>-2 Hari</option>
              <option value='-1'>-1 Hari</option>
              <option value='0'>Normal (0)</option>
              <option value='1'>+1 Hari</option>
              <option value='2'>+2 Hari</option>
            </select>
          </div>
          <button
            onClick={handlePublish}
            disabled={isSaving || isUploading}
            className='bg-mni-primary text-white px-5 py-2.5 rounded-xl font-bold flex items-center shadow-md hover:bg-mni-primaryHover transition hover:-translate-y-0.5 shadow-teal-600/20 disabled:opacity-50 disabled:hover:translate-y-0 shrink-0'>
            {isSaving || isUploading ? (
              <Loader2 className='w-5 h-5 animate-spin mr-2' />
            ) : (
              <Save className='w-5 h-5 mr-2' />
            )}
            {isUploading ? 'Mengunggah...' : 'Publikasi'}
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className='bg-gray-50 -mx-4 md:-mx-8 px-4 md:px-8 py-8 min-h-screen'>
        <HeroBeranda
          data={form}
          isEditor={true}
          onTextChange={handleTextChange}
          onImageUpload={handleImageUpload}
          onImageRemove={() =>
            setForm((prev: any) => ({ ...prev, gambar_url: '' }))
          }
          onFasilitasAdd={handleFasilitasAdd}
          onFasilitasDelete={handleFasilitasDelete}
          onFasilitasUpdate={handleFasilitasUpdate}
          onQuoteUpdate={handleQuoteUpdate}
        />
      </motion.div>
    </div>
  );
}
