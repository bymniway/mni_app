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
} from 'lucide-react';

export default function KelolaKomentar() {
  const [comments, setComments] = useState<any[]>([]);
  const [galleryItems, setGalleryItems] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Ambil semua komentar
      const { data: commentData } = await supabase
        .from('galeri_komentar')
        .select('*')
        .order('created_at', { ascending: false });

      // 2. Ambil data galeri dari pengaturan_web untuk mapping foto
      const { data: settings } = await supabase
        .from('pengaturan_web')
        .select('nilai')
        .eq('kunci', 'galeri_data')
        .single();

      if (settings?.nilai) {
        const parsedGallery = JSON.parse(settings.nilai);
        // Buat mapping ID -> Data Foto agar pencarian cepat
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

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus komentar ini secara permanen?')) return;

    const { error } = await supabase
      .from('galeri_komentar')
      .delete()
      .eq('id', id);
    if (!error) {
      setComments(comments.filter((c) => c.id !== id));
    } else {
      alert('Gagal menghapus komentar.');
    }
  };

  const filteredComments = comments.filter(
    (c) =>
      c.teks.toLowerCase().includes(search.toLowerCase()) ||
      c.nama.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className='bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden'>
      <div className='p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50'>
        <div className='flex items-center gap-4'>
          <div className='p-3 bg-blue-100 text-blue-700 rounded-xl'>
            <MessageSquare className='w-6 h-6' />
          </div>
          <div>
            <h2 className='text-xl font-black text-slate-800 tracking-tight'>
              Moderasi Komentar Galeri
            </h2>
            <p className='text-xs text-slate-500 font-medium mt-0.5'>
              Pantau komentar dan hubungkan dengan foto kegiatan.
            </p>
          </div>
        </div>
        <div className='relative w-full md:w-auto'>
          <Search className='w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400' />
          <input
            type='text'
            placeholder='Cari kata atau nama...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-mni-primary focus:ring-2 focus:ring-mni-primary/20 w-full md:w-72 bg-white transition-all shadow-sm'
          />
        </div>
      </div>

      <div className='overflow-x-auto'>
        <table className='w-full text-left text-sm'>
          <thead className='bg-white text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100'>
            <tr>
              <th className='px-6 py-4'>Waktu</th>
              <th className='px-6 py-4'>Foto / Kegiatan</th>
              <th className='px-6 py-4'>Pengirim</th>
              <th className='px-6 py-4'>Isi Komentar</th>
              <th className='px-6 py-4 text-center'>Aksi</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-slate-50'>
            {isLoading ? (
              <tr>
                <td
                  colSpan={5}
                  className='py-16 text-center'>
                  <Loader2 className='w-8 h-8 animate-spin text-mni-primary mx-auto' />
                </td>
              </tr>
            ) : filteredComments.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className='py-16 text-center text-slate-400 font-medium'>
                  <AlertCircle className='w-10 h-10 mb-3 opacity-30 mx-auto' />
                  Belum ada komentar yang masuk.
                </td>
              </tr>
            ) : (
              filteredComments.map((c) => {
                const photoInfo = galleryItems[c.galeri_id];
                return (
                  <tr
                    key={c.id}
                    className='hover:bg-slate-50/80 transition-colors group'>
                    <td className='px-6 py-4 whitespace-nowrap text-slate-500 text-[11px] font-medium'>
                      {new Date(c.created_at).toLocaleString('id-ID', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200'>
                          {photoInfo?.gambar_url ? (
                            <img
                              src={photoInfo.gambar_url}
                              alt=''
                              className='w-full h-full object-cover'
                            />
                          ) : (
                            <div className='w-full h-full flex items-center justify-center'>
                              <ImageIcon className='w-4 h-4 text-slate-300' />
                            </div>
                          )}
                        </div>
                        <div className='max-w-[150px]'>
                          <p className='text-[11px] font-bold text-slate-700 truncate'>
                            {photoInfo?.judul || 'Kegiatan Dihapus'}
                          </p>
                          <p className='text-[9px] text-slate-400 uppercase font-black tracking-tighter'>
                            {photoInfo?.kategori || '-'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span className='inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100'>
                        {c.nama}
                      </span>
                    </td>
                    <td className='px-6 py-4 text-slate-700 font-medium max-w-xs md:max-w-md'>
                      <p className='line-clamp-2'>"{c.teks}"</p>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-center'>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className='p-2 text-slate-300 hover:text-white hover:bg-red-500 rounded-lg transition-all focus:outline-none group-hover:text-red-400'
                        title='Hapus Permanen'>
                        <Trash2 className='w-5 h-5' />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
