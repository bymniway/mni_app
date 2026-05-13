'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Loader2,
  MessageSquare,
  Trash2,
  Search,
  AlertCircle,
  Image as ImageIcon,
  CheckCircle2,
  Circle,
  X,
  CheckSquare,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function KelolaKomentar() {
  const [comments, setComments] = useState<any[]>([]);
  const [galleryItems, setGalleryItems] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // STATE BARU: MULTI-SELECT
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: commentData } = await supabase
        .from('galeri_komentar')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: settings } = await supabase
        .from('pengaturan_web')
        .select('nilai')
        .eq('kunci', 'galeri_data')
        .single();

      if (settings?.nilai) {
        const parsedGallery = JSON.parse(settings.nilai);
        const mapping: Record<string, any> = {};
        parsedGallery.forEach((item: any) => {
          mapping[item.id] = item;
        });
        setGalleryItems(mapping);
      }

      if (commentData) setComments(commentData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // FUNGSI SELECT
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const filteredComments = comments.filter(
    (c) =>
      c.teks.toLowerCase().includes(search.toLowerCase()) ||
      c.nama.toLowerCase().includes(search.toLowerCase()),
  );

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredComments.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredComments.map((c) => c.id));
    }
  };

  // FUNGSI HAPUS (SINGLE & BULK)
  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus komentar ini secara permanen?')) return;

    const { error } = await supabase
      .from('galeri_komentar')
      .delete()
      .eq('id', id);
    if (!error) {
      setComments(comments.filter((c) => c.id !== id));
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    } else {
      alert('Gagal menghapus komentar.');
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Hapus permanen ${selectedIds.length} komentar terpilih?`))
      return;
    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from('galeri_komentar')
        .delete()
        .in('id', selectedIds);

      if (error) throw error;

      setComments((prev) => prev.filter((c) => !selectedIds.includes(c.id)));
      setSelectedIds([]);
    } catch (error) {
      alert('Gagal menghapus komentar masal.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className='relative'>
      {/* ==========================================
          FLOATING ACTION BAR (PILL) UNTUK BULK DELETE
          ========================================== */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', bounce: 0.4 }}
            className='fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-slate-900/95 backdrop-blur-xl border border-slate-700 text-white px-4 py-3 rounded-full shadow-[0_20px_40px_rgba(0,0,0,0.3)] flex items-center gap-3 w-max'>
            <div className='flex items-center gap-3 pl-2 pr-4 border-r border-slate-700'>
              <span className='flex h-2.5 w-2.5 relative'>
                <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75'></span>
                <span className='relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500'></span>
              </span>
              <span className='text-sm font-bold tracking-wide'>
                {selectedIds.length}{' '}
                <span className='text-slate-400 font-medium'>
                  Komentar Terpilih
                </span>
              </span>
            </div>

            <button
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className='flex items-center text-xs font-bold bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white px-5 py-2.5 rounded-full transition-all disabled:opacity-50'>
              {isDeleting ? (
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
              ) : (
                <Trash2 className='w-4 h-4 mr-2' />
              )}
              Hapus Semua
            </button>

            <button
              onClick={() => setSelectedIds([])}
              className='ml-1 p-2 bg-slate-800 text-slate-400 rounded-full hover:bg-slate-700 hover:text-white transition-colors'>
              <X className='w-4 h-4' />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==========================================
          KONTEN UTAMA (HEADER & TABEL)
          ========================================== */}
      <div className='bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 overflow-hidden'>
        {/* HEADER */}
        <div className='p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-b from-slate-50/50 to-white/20'>
          <div className='flex items-center gap-5'>
            <div className='p-4 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 rounded-2xl shadow-sm border border-blue-100/50'>
              <MessageSquare className='w-7 h-7' />
            </div>
            <div>
              <h2 className='text-2xl font-black text-slate-800 tracking-tight'>
                Moderasi Komentar
              </h2>
              <p className='text-sm text-slate-500 font-medium mt-1'>
                Kelola interaksi jamaah pada galeri kegiatan.
              </p>
            </div>
          </div>
          <div className='relative w-full md:w-80'>
            <Search className='w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400' />
            <input
              type='text'
              placeholder='Cari isi atau nama pengirim...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='pl-11 pr-4 py-3.5 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 w-full bg-white transition-all shadow-sm'
            />
          </div>
        </div>

        {/* TABEL */}
        <div className='overflow-x-auto'>
          <table className='w-full text-left text-sm'>
            <thead className='bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100'>
              <tr>
                <th className='px-8 py-5 w-10'>
                  <button
                    onClick={toggleSelectAll}
                    disabled={filteredComments.length === 0}
                    className='text-slate-400 hover:text-blue-600 transition-colors disabled:opacity-50'>
                    {selectedIds.length === filteredComments.length &&
                    filteredComments.length > 0 ? (
                      <CheckSquare className='w-5 h-5 text-blue-600' />
                    ) : (
                      <div className='w-5 h-5 rounded-[4px] border-2 border-slate-300'></div>
                    )}
                  </button>
                </th>
                <th className='px-4 py-5'>Pengirim & Waktu</th>
                <th className='px-6 py-5'>Isi Komentar</th>
                <th className='px-6 py-5'>Konteks Foto</th>
                <th className='px-8 py-5 text-right'>Aksi</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100/80'>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className='py-20 text-center'>
                    <Loader2 className='w-8 h-8 animate-spin text-blue-600 mx-auto' />
                    <p className='mt-3 text-sm font-medium text-slate-500'>
                      Memuat data...
                    </p>
                  </td>
                </tr>
              ) : filteredComments.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className='py-20 text-center text-slate-400 font-medium'>
                    <div className='w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100'>
                      <AlertCircle className='w-8 h-8 text-slate-300' />
                    </div>
                    Belum ada komentar yang sesuai.
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {filteredComments.map((c) => {
                    const photoInfo = galleryItems[c.galeri_id];
                    const isSelected = selectedIds.includes(c.id);

                    return (
                      <motion.tr
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{
                          opacity: 0,
                          scale: 0.95,
                          backgroundColor: '#fee2e2',
                        }}
                        key={c.id}
                        className={`group transition-colors ${isSelected ? 'bg-blue-50/50' : 'hover:bg-slate-50/80'}`}>
                        {/* COL: CHECKBOX */}
                        <td className='px-8 py-5'>
                          <button
                            onClick={() => toggleSelect(c.id)}
                            className='focus:outline-none transition-transform active:scale-90'>
                            {isSelected ? (
                              <CheckCircle2 className='w-5 h-5 text-blue-600 drop-shadow-sm' />
                            ) : (
                              <Circle className='w-5 h-5 text-slate-300 group-hover:text-blue-400 transition-colors' />
                            )}
                          </button>
                        </td>

                        {/* COL: PENGIRIM & WAKTU */}
                        <td className='px-4 py-5 whitespace-nowrap'>
                          <div className='flex items-center gap-3'>
                            <div className='w-10 h-10 rounded-full bg-gradient-to-tr from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-black text-sm shadow-sm border border-slate-200'>
                              {c.nama.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className='font-bold text-slate-800 text-[13px]'>
                                {c.nama}
                              </div>
                              <div className='text-[11px] text-slate-500 font-medium mt-0.5'>
                                {new Date(c.created_at).toLocaleString(
                                  'id-ID',
                                  {
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  },
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* COL: KOMENTAR */}
                        <td className='px-6 py-5 max-w-sm'>
                          <div className='bg-slate-100/50 text-slate-700 text-[13px] font-medium px-4 py-3 rounded-2xl rounded-tl-sm border border-slate-100 shadow-sm leading-relaxed'>
                            "{c.teks}"
                          </div>
                        </td>

                        {/* COL: FOTO REFERENSI */}
                        <td className='px-6 py-5'>
                          <div className='flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-200 shadow-sm w-max pr-4'>
                            <div className='w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0'>
                              {photoInfo?.gambar_url ? (
                                <img
                                  src={photoInfo.gambar_url}
                                  alt=''
                                  className='w-full h-full object-cover'
                                />
                              ) : (
                                <div className='w-full h-full flex items-center justify-center'>
                                  <ImageIcon className='w-5 h-5 text-slate-300' />
                                </div>
                              )}
                            </div>
                            <div className='max-w-[120px]'>
                              <p className='text-[11px] font-bold text-slate-700 truncate'>
                                {photoInfo?.judul || 'Dihapus'}
                              </p>
                              <p className='text-[9px] text-mni-primary uppercase font-black tracking-wider mt-0.5'>
                                {photoInfo?.kategori || '-'}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* COL: AKSI SINGLE DELETE */}
                        <td className='px-8 py-5 text-right'>
                          <button
                            onClick={() => handleDelete(c.id)}
                            className='p-2.5 text-slate-400 hover:text-white hover:bg-red-500 rounded-xl transition-all focus:outline-none shadow-sm hover:shadow-red-500/20'
                            title='Hapus Komentar'>
                            <Trash2 className='w-4 h-4' />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
