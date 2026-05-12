'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import ProfilTentang from '@/components/public/ProfilTentang';
import { Save, Loader2, MousePointerClick, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EditorProfil() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // STATE BARU: MULTI-SELECT PENGURUS (ID bertipe number)
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const isSelectionMode = selectedIds.length > 0;

  const [form, setForm] = useState({
    judul: '',
    deskripsi: '',
    visi_teks: '',
    misi_teks: '',
    sejarah_judul: '',
    sejarah_teks: '',
    pengurus_judul: '',
    pengurus_deskripsi: '',
    legalitas_judul: '',
    legalitas_teks: '',
    rekening_judul: '',
    rekening_teks: '',
  });

  const [pengurusList, setPengurusList] = useState<any[]>([]);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from('pengaturan_web').select('*');
      if (data) {
        const getVal = (key: string) =>
          data.find((d) => d.kunci === key)?.nilai || '';

        setForm({
          judul: getVal('tentang_judul'),
          deskripsi: getVal('tentang_deskripsi'),
          visi_teks: getVal('tentang_visi_teks'),
          misi_teks: getVal('tentang_misi_teks'),
          sejarah_judul: getVal('tentang_sejarah_judul'),
          sejarah_teks: getVal('tentang_sejarah_teks'),
          pengurus_judul: getVal('tentang_pengurus_judul'),
          pengurus_deskripsi: getVal('tentang_pengurus_deskripsi'),
          legalitas_judul: getVal('tentang_legalitas_judul'),
          legalitas_teks: getVal('tentang_legalitas_teks'),
          rekening_judul: getVal('tentang_rekening_judul'),
          rekening_teks: getVal('tentang_rekening_teks'),
        });

        const jsonPengurus = getVal('tentang_pengurus_data');
        if (jsonPengurus) {
          try {
            setPengurusList(JSON.parse(jsonPengurus));
          } catch (e) {
            console.log('Gagal parse JSON Pengurus');
          }
        }
      }
      setIsLoading(false);
    };
    fetchSettings();
  }, []);

  const handleTextChange = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handlePengurusUpdate = (id: number, key: string, value: string) => {
    setPengurusList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [key]: value } : p)),
    );
  };

  const handlePengurusDelete = (id: number) => {
    if (confirm('Yakin ingin menghapus pengurus ini?')) {
      setPengurusList((prev) => prev.filter((p) => p.id !== id));
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  };

  const handlePengurusAdd = () => {
    const newPengurus = {
      id: Date.now(),
      nama: 'Nama Baru',
      jabatan: 'Jabatan Baru',
      gambar_url: '',
    };
    setPengurusList((prev) => [...prev, newPengurus]);
  };

  const handlePengurusImageUpload = async (
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
      if (result.url) {
        setPengurusList((prev) =>
          prev.map((p) => (p.id === id ? { ...p, gambar_url: result.url } : p)),
        );
      }
    } catch (error) {
      alert('Gagal upload gambar pengurus.');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePublish = async () => {
    setIsSaving(true);
    const updates = [
      { kunci: 'tentang_judul', nilai: form.judul },
      { kunci: 'tentang_deskripsi', nilai: form.deskripsi },
      { kunci: 'tentang_visi_teks', nilai: form.visi_teks },
      { kunci: 'tentang_misi_teks', nilai: form.misi_teks },
      { kunci: 'tentang_sejarah_judul', nilai: form.sejarah_judul },
      { kunci: 'tentang_sejarah_teks', nilai: form.sejarah_teks },
      { kunci: 'tentang_pengurus_judul', nilai: form.pengurus_judul },
      { kunci: 'tentang_pengurus_deskripsi', nilai: form.pengurus_deskripsi },
      { kunci: 'tentang_legalitas_judul', nilai: form.legalitas_judul },
      { kunci: 'tentang_legalitas_teks', nilai: form.legalitas_teks },
      { kunci: 'tentang_rekening_judul', nilai: form.rekening_judul },
      { kunci: 'tentang_rekening_teks', nilai: form.rekening_teks },
      { kunci: 'tentang_pengurus_data', nilai: JSON.stringify(pengurusList) },
    ];

    for (const item of updates) {
      await supabase
        .from('pengaturan_web')
        .upsert(item, { onConflict: 'kunci' });
    }

    setIsSaving(false);
    alert('Perubahan Profil & Kepengurusan berhasil dipublikasikan!');
  };

  // FUNGSI BARU: MULTI-SELECT BULK DELETE
  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleBulkDelete = () => {
    if (confirm(`Hapus ${selectedIds.length} pengurus terpilih?`)) {
      setPengurusList((prev) =>
        prev.filter((p) => !selectedIds.includes(p.id)),
      );
      setSelectedIds([]);
    }
  };

  if (isLoading)
    return (
      <div className='p-10 flex justify-center mt-20'>
        <Loader2 className='animate-spin text-mni-primary w-8 h-8' />
      </div>
    );

  return (
    <div className='relative min-h-screen'>
      {/* ==========================================
          INJECT ANIMASI JIGGLE ELEGANT
          ========================================== */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes subtle-jiggle {
          0% { transform: rotate(-0.5deg) scale(0.99); }
          50% { transform: rotate(0.5deg) scale(0.99); }
          100% { transform: rotate(-0.5deg) scale(0.99); }
        }
        .animate-subtle-jiggle {
          animation: subtle-jiggle 0.4s ease-in-out infinite;
          transform-origin: center center;
          cursor: pointer !important;
        }
        .animate-subtle-jiggle:nth-child(even) {
          animation-direction: reverse;
          animation-duration: 0.45s;
        }
      `,
        }}
      />

      {/* ==========================================
          FLOATING ACTION BAR (PILL) ALA MACOS
          ========================================== */}
      <AnimatePresence>
        {isSelectionMode && (
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', bounce: 0.3 }}
            className='fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 text-white px-3 py-3 rounded-full shadow-2xl flex items-center gap-3 w-max'>
            <div className='flex items-center gap-3 pl-2 pr-4 border-r border-zinc-700'>
              <span className='flex h-3 w-3 relative'>
                <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75'></span>
                <span className='relative inline-flex rounded-full h-3 w-3 bg-teal-500'></span>
              </span>
              <span className='text-sm font-bold tracking-wide'>
                {selectedIds.length}{' '}
                <span className='text-zinc-400 font-medium'>Terpilih</span>
              </span>
            </div>

            <button
              onClick={() => setSelectedIds(pengurusList.map((p) => p.id))}
              className='text-xs font-bold text-zinc-400 hover:text-white transition-colors px-2'>
              Pilih Semua
            </button>

            <button
              onClick={handleBulkDelete}
              className='flex items-center text-xs font-bold bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white px-4 py-2 rounded-full transition-colors ml-2'>
              <Trash2 className='w-3.5 h-3.5 mr-1.5' /> Hapus
            </button>

            <button
              onClick={() => setSelectedIds([])}
              className='ml-2 p-2 bg-zinc-800 text-zinc-400 rounded-full hover:bg-zinc-700 hover:text-white transition-colors'>
              <X className='w-4 h-4' />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className='sticky top-4 z-50 flex justify-between items-center bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-gray-100 max-w-7xl mx-auto mb-8'>
        <div className='flex items-center'>
          <div className='w-10 h-10 bg-mni-primary/10 text-mni-primary rounded-xl flex items-center justify-center mr-3'>
            <MousePointerClick className='w-5 h-5' />
          </div>
          <div>
            <h1 className='text-xl font-bold text-mni-text'>
              Live Visual Editor Tentang Kami
            </h1>
            <p className='text-xs text-gray-500 font-medium'>
              Klik teks untuk edit. Arahkan kursor ke card untuk upload
              pengurus.
            </p>
          </div>
        </div>
        <button
          onClick={handlePublish}
          disabled={isSaving || isUploading}
          className='bg-mni-primary text-white px-6 py-2.5 rounded-xl font-bold flex items-center shadow-md hover:bg-mni-primaryHover transition disabled:opacity-50'>
          {isSaving || isUploading ? (
            <Loader2 className='w-5 h-5 animate-spin mr-2' />
          ) : (
            <Save className='w-5 h-5 mr-2' />
          )}{' '}
          {isUploading ? 'Mengunggah...' : 'Publikasikan'}
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className='bg-gray-50 -mx-4 md:-mx-8 px-4 md:px-8 py-8 min-h-screen'>
        {/* PEMBUNGKUS COMPONENT UNTUK MENCEGAH HIGHLIGHT TEKS SAAT MULTI-SELECT */}
        <div className={isSelectionMode ? 'select-none' : ''}>
          <ProfilTentang
            data={form}
            pengurusList={pengurusList}
            isEditor={true}
            onTextChange={handleTextChange}
            onPengurusUpdate={handlePengurusUpdate}
            onPengurusDelete={handlePengurusDelete}
            onPengurusAdd={handlePengurusAdd}
            onPengurusImageUpload={handlePengurusImageUpload}
            // PROPS MULTI-SELECT
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            isSelectionMode={isSelectionMode}
          />
        </div>
      </motion.div>
    </div>
  );
}
