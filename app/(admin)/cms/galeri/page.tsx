'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import GaleriKegiatan from '@/components/public/GaleriKegiatan';
import { Save, Loader2, MousePointerClick, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EditorGaleri() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [form, setForm] = useState({ judul: '', deskripsi: '' });
  const [galleryList, setGalleryList] = useState<any[]>([]);

  // PENTING: State selectedIds dan isSelectionMode sudah DIBERSIHKAN dari sini
  // karena logika multi-select-nya sudah diurus secara mandiri oleh komponen Child (GaleriKegiatan)

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from('pengaturan_web').select('*');
      if (data) {
        const getVal = (key: string) =>
          data.find((d) => d.kunci === key)?.nilai || '';
        setForm({
          judul: getVal('galeri_judul'),
          deskripsi: getVal('galeri_deskripsi'),
        });

        const jsonGaleri = getVal('galeri_data');
        if (jsonGaleri) {
          try {
            setGalleryList(JSON.parse(jsonGaleri));
          } catch (e) {
            console.log('Parse error');
          }
        }
      }
      setIsLoading(false);
    };
    fetchSettings();
  }, []);

  const handleTextChange = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleItemUpdate = (id: string, key: string, value: string) => {
    setGalleryList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [key]: value } : p)),
    );
  };

  const handleItemDelete = (id: string) => {
    if (confirm('Hapus kotak foto ini dari galeri?')) {
      setGalleryList((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleItemAdd = () => {
    const newItem = {
      id: Date.now().toString(),
      kategori: 'Baru',
      judul: 'Kegiatan Baru',
      gambar_urls: [],
      gambar_url: '',
      tanggal: new Date().toISOString(),
      deskripsi:
        'Tuliskan deskripsi ringkas tentang dokumentasi kegiatan ini...',
    };
    setGalleryList((prev) => [...prev, newItem]);
  };

  const handleImageUpload = async (
    id: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    for (const file of files) {
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
          uploadedUrls.push(result.url);
        }
      } catch (error) {
        console.error('Gagal upload gambar:', error);
      }
    }

    if (uploadedUrls.length > 0) {
      setGalleryList((prev) =>
        prev.map((p) => {
          if (p.id === id) {
            const currentUrls =
              p.gambar_urls || (p.gambar_url ? [p.gambar_url] : []);
            return {
              ...p,
              gambar_urls: [...currentUrls, ...uploadedUrls],
            };
          }
          return p;
        }),
      );
    }
    setIsUploading(false);
  };

  const handlePublish = async () => {
    setIsSaving(true);
    const updates = [
      { kunci: 'galeri_judul', nilai: form.judul },
      { kunci: 'galeri_deskripsi', nilai: form.deskripsi },
      { kunci: 'galeri_data', nilai: JSON.stringify(galleryList) },
    ];
    for (const item of updates) {
      await supabase
        .from('pengaturan_web')
        .upsert(item, { onConflict: 'kunci' });
    }
    setIsSaving(false);
    alert('Galeri berhasil dipublikasikan!');
  };

  // ==========================================
  // FUNGSI BARU: TANGKAP ARRAY ID DARI CHILD, LALU HAPUS DARI STATE
  // ==========================================
  const handleBulkDelete = (idsToDelete: string[]) => {
    // Hapus array ID terpilih dari daftar galeri yang ada di layar (tanpa alert confirm lagi)
    setGalleryList((prev) => prev.filter((p) => !idsToDelete.includes(p.id)));
  };

  if (isLoading)
    return (
      <div className='p-10 flex justify-center mt-20'>
        <Loader2 className='animate-spin text-mni-primary w-8 h-8' />
      </div>
    );

  return (
    <div className='relative min-h-screen'>
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

      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className='sticky top-4 z-[60] flex flex-col md:flex-row justify-between items-start md:items-center bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-gray-100 max-w-7xl mx-auto mb-8 gap-4'>
        <div className='flex items-center'>
          <div className='w-10 h-10 bg-mni-primary/10 text-mni-primary rounded-xl flex items-center justify-center mr-3'>
            <MousePointerClick className='w-5 h-5' />
          </div>
          <div>
            <h1 className='text-xl font-bold text-mni-text'>
              Live Visual Editor Galeri
            </h1>
            <p className='text-xs text-gray-500 font-medium hidden md:block'>
              Klik teks untuk edit. Arahkan kursor ke foto untuk tambah/ubah.
            </p>
          </div>
        </div>

        <div className='flex items-center gap-3 w-full md:w-auto'>
          <button
            onClick={handleItemAdd}
            className='bg-white border border-gray-200 text-mni-primary px-4 py-2.5 rounded-xl font-bold flex items-center justify-center shadow-sm hover:bg-gray-50 hover:border-mni-primary transition-all flex-1 md:flex-none'>
            <Plus className='w-4 h-4 mr-2' /> Tambah Gambar
          </button>
          <button
            onClick={handlePublish}
            disabled={isSaving || isUploading}
            className='bg-mni-primary text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center shadow-md hover:bg-mni-primaryHover transition disabled:opacity-50 flex-1 md:flex-none'>
            {isSaving || isUploading ? (
              <Loader2 className='w-5 h-5 animate-spin mr-2' />
            ) : (
              <Save className='w-5 h-5 mr-2' />
            )}{' '}
            {isUploading ? 'Mengunggah...' : 'Publikasikan'}
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className='bg-gray-50 -mx-4 md:-mx-8 px-4 md:px-8 py-8 min-h-screen relative z-10'>
        {/* ==========================================
            PEMBUNGKUS COMPONENT GALERI YANG SUDAH TERHUBUNG
            ========================================== */}
        <GaleriKegiatan
          data={form}
          galleryList={galleryList}
          isEditor={true}
          onTextChange={handleTextChange}
          onItemUpdate={handleItemUpdate}
          onItemDelete={handleItemDelete}
          onImageUpload={handleImageUpload}
          onBulkDelete={handleBulkDelete} // <-- INI DIA PENGHUBUNGNYA! 🚀
        />
      </motion.div>
    </div>
  );
}
