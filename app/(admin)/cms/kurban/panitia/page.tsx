'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import KurbanUI from '@/components/public/KurbanUI';
import { Save, Loader2, MousePointerClick } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EditorHalamanKurban() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [form, setForm] = useState({
    kurban_hero_judul: '',
    kurban_hero_deskripsi: '',
    kurban_dist_judul: '',
    kurban_dist_deskripsi: '',
    kurban_faq_judul: '',
    kurban_faq_deskripsi: '',
    kurban_snk_judul: '',
    kurban_panitia_judul: '',
    kurban_panitia_deskripsi: '',
  });

  const [distList, setDistList] = useState<any[]>([]);
  const [faqList, setFaqList] = useState<any[]>([]);
  const [snkList, setSnkList] = useState<any[]>([]);
  const [panitiaList, setPanitiaList] = useState<any[]>([]);
  const [timelineList, setTimelineList] = useState<any[]>([]);

  const [katalogHewan, setKatalogHewan] = useState<any[]>([]);
  const [jasaPotong, setJasaPotong] = useState<any[]>([]);
  const [daftarPekurban, setDaftarPekurban] = useState<any[]>([]);
  const [periodeKurban, setPeriodeKurban] = useState('1447');

  useEffect(() => {
    const fetchData = async () => {
      const { data: hewanData } = await supabase
        .from('hewan')
        .select('*')
        .order('harga');
      if (hewanData) {
        setJasaPotong(hewanData.filter((i) => i.jenis === 'Jasa Potong'));
        setKatalogHewan(hewanData.filter((i) => i.jenis !== 'Jasa Potong'));
        const periods = hewanData
          .map((h) => parseInt(h.periode))
          .filter((p) => !isNaN(p));
        if (periods.length > 0)
          setPeriodeKurban(Math.max(...periods).toString());
      }

      const { data: pesananData } = await supabase
        .from('pesanan')
        .select(
          `created_at, nama_mudhohi, status_pesanan, hewan_id, hewan (id, jenis, tipe)`,
        )
        .in('status_pesanan', ['Menunggu', 'Lunas', 'Diterima'])
        .order('created_at', { ascending: false });

      if (pesananData) setDaftarPekurban(pesananData);

      const { data } = await supabase.from('pengaturan_web').select('*');
      if (data) {
        const getVal = (key: string) =>
          data.find((d) => d.kunci === key)?.nilai || '';
        setForm({
          kurban_hero_judul: getVal('kurban_hero_judul'),
          kurban_hero_deskripsi: getVal('kurban_hero_deskripsi'),
          kurban_dist_judul: getVal('kurban_dist_judul'),
          kurban_dist_deskripsi: getVal('kurban_dist_deskripsi'),
          kurban_faq_judul: getVal('kurban_faq_judul'),
          kurban_faq_deskripsi: getVal('kurban_faq_deskripsi'),
          kurban_snk_judul: getVal('kurban_snk_judul'),
          kurban_panitia_judul: getVal('kurban_panitia_judul'),
          kurban_panitia_deskripsi: getVal('kurban_panitia_deskripsi'),
        });

        const parseJSON = (key: string, setter: any, defaultVal: any[]) => {
          const jsonStr = getVal(key);
          if (jsonStr) {
            try {
              setter(JSON.parse(jsonStr));
            } catch (e) {
              setter(defaultVal);
            }
          } else {
            setter(defaultVal);
          }
        };

        parseJSON('kurban_dist_data', setDistList, []);
        parseJSON('kurban_faq_data', setFaqList, []);
        parseJSON('kurban_snk_data', setSnkList, []);
        parseJSON('kurban_panitia_data', setPanitiaList, []);
        parseJSON('kurban_timeline_data', setTimelineList, []);
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const handleTextChange = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleArrayChange = (
    type: string,
    id: number,
    key: string,
    value: any,
  ) => {
    const setters: any = {
      distList: setDistList,
      faqList: setFaqList,
      snkList: setSnkList,
      timelineList: setTimelineList,
    };
    setters[type]((prev: any[]) =>
      prev.map((item: any) =>
        item.id === id ? { ...item, [key]: value } : item,
      ),
    );
  };

  const handleArrayDelete = (type: string, id: number) => {
    if (confirm('Yakin hapus baris ini?')) {
      const setters: any = {
        distList: setDistList,
        faqList: setFaqList,
        snkList: setSnkList,
      };
      setters[type]((prev: any[]) =>
        prev.filter((item: any) => item.id !== id),
      );
    }
  };

  const handleArrayAdd = (type: string) => {
    const id = Date.now();
    if (type === 'distList')
      setDistList((prev) => [
        ...prev,
        { id, persen: '0%', judul: 'Judul Baru', deskripsi: 'Deskripsi Baru' },
      ]);
    if (type === 'faqList')
      setFaqList((prev) => [
        ...prev,
        { id, q: 'Pertanyaan Baru?', a: 'Jawaban...' },
      ]);
    if (type === 'snkList')
      setSnkList((prev) => [...prev, { id, teks: 'Syarat Ketentuan Baru...' }]);
  };

  const handlePanitiaUpdate = (id: number, key: string, value: string) =>
    setPanitiaList((p) =>
      p.map((x) => (x.id === id ? { ...x, [key]: value } : x)),
    );

  // PERBAIKAN: Confirm dipindah ke komponen anak agar Bulk Delete bisa berjalan mulus
  const handlePanitiaDelete = (id: number) => {
    setPanitiaList((p) => p.filter((x) => x.id !== id));
  };

  const handlePanitiaAdd = () =>
    setPanitiaList((p) => [
      ...p,
      {
        id: Date.now(),
        nama: 'Nama Baru',
        jabatan: 'Seksi Baru',
        foto_url: '',
      },
    ]);

  const handleImageUpload = async (
    id: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
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
        setPanitiaList((prev) =>
          prev.map((p) => (p.id === id ? { ...p, foto_url: result.url } : p)),
        );
    } catch (error) {
      alert('Gagal upload gambar.');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePublish = async () => {
    setIsSaving(true);
    const updates = [
      { kunci: 'kurban_hero_judul', nilai: form.kurban_hero_judul },
      { kunci: 'kurban_hero_deskripsi', nilai: form.kurban_hero_deskripsi },
      { kunci: 'kurban_dist_judul', nilai: form.kurban_dist_judul },
      { kunci: 'kurban_dist_deskripsi', nilai: form.kurban_dist_deskripsi },
      { kunci: 'kurban_faq_judul', nilai: form.kurban_faq_judul },
      { kunci: 'kurban_faq_deskripsi', nilai: form.kurban_faq_deskripsi },
      { kunci: 'kurban_snk_judul', nilai: form.kurban_snk_judul },
      { kunci: 'kurban_panitia_judul', nilai: form.kurban_panitia_judul },
      {
        kunci: 'kurban_panitia_deskripsi',
        nilai: form.kurban_panitia_deskripsi,
      },
      { kunci: 'kurban_dist_data', nilai: JSON.stringify(distList) },
      { kunci: 'kurban_faq_data', nilai: JSON.stringify(faqList) },
      { kunci: 'kurban_snk_data', nilai: JSON.stringify(snkList) },
      { kunci: 'kurban_panitia_data', nilai: JSON.stringify(panitiaList) },
      { kunci: 'kurban_timeline_data', nilai: JSON.stringify(timelineList) },
    ];

    for (const item of updates) {
      await supabase
        .from('pengaturan_web')
        .upsert(item, { onConflict: 'kunci' });
    }
    setIsSaving(false);
    alert('Seluruh Halaman Kurban berhasil dipublikasikan!');
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
        className='sticky top-4 z-50 flex justify-between items-center bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-gray-100 max-w-7xl mx-auto mb-8'>
        <div className='flex items-center'>
          <div className='w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mr-3'>
            <MousePointerClick className='w-5 h-5' />
          </div>
          <div>
            <h1 className='text-xl font-bold text-mni-text'>
              Live Visual Editor Kurban
            </h1>
            <p className='text-xs text-gray-500 font-medium hidden md:block'>
              Klik teks untuk edit. Klik icon tambah (+) untuk membuat data
              baru.
            </p>
          </div>
        </div>
        <button
          onClick={handlePublish}
          disabled={isSaving || isUploading}
          className='bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center shadow-md hover:bg-green-700 transition disabled:opacity-50'>
          {isSaving || isUploading ? (
            <Loader2 className='w-5 h-5 animate-spin mr-2' />
          ) : (
            <Save className='w-5 h-5 mr-2' />
          )}{' '}
          {isUploading ? 'Mengunggah...' : 'Publikasikan'}
        </button>
      </motion.div>

      <div className='bg-gray-50/50 -mx-4 md:-mx-8 py-8 min-h-screen pointer-events-auto'>
        <KurbanUI
          form={form}
          distList={distList}
          faqList={faqList}
          snkList={snkList}
          panitiaList={panitiaList}
          timelineList={timelineList}
          katalogHewan={katalogHewan}
          jasaPotong={jasaPotong}
          daftarPekurban={daftarPekurban}
          periodeKurban={periodeKurban}
          isEditor={true}
          onTextChange={handleTextChange}
          onArrayChange={handleArrayChange}
          onArrayAdd={handleArrayAdd}
          onArrayDelete={handleArrayDelete}
          onPanitiaUpdate={handlePanitiaUpdate}
          onPanitiaDelete={handlePanitiaDelete}
          onPanitiaAdd={handlePanitiaAdd}
          onImageUpload={handleImageUpload}
        />
      </div>
    </div>
  );
}
