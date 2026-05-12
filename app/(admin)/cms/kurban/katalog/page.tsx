'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Loader2,
  Zap,
  Hand,
  Tag,
  Save,
  CreditCard,
  UploadCloud,
  ArchiveRestore,
  Trash,
  Clock,
  EyeOff,
  X,
  Gift,
  BoxIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function KelolaHewanKurban() {
  const [hewan, setHewan] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // State untuk Tab (Katalog Aktif vs Tong Sampah)
  const [activeTab, setActiveTab] = useState<'katalog' | 'sampah'>('katalog');

  // STATE BARU: Multi-Select
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const isSelectionMode = selectedIds.length > 0;

  // Pengaturan Pembayaran Kurban
  const [rekeningKurban, setRekeningKurban] = useState('');
  const [qrisKurbanUrl, setQrisKurbanUrl] = useState('');
  const [isSavingSetting, setIsSavingSetting] = useState(false);
  const [isUploadingQris, setIsUploadingQris] = useState(false);

  const [form, setForm] = useState({
    id: '',
    jenis: 'Sapi',
    tipe: '',
    berat: '',
    harga: '',
    gambar_url: '',
    status: 'Tersedia',
    mekanisme: 'Otomatis',
    deskripsi: '',
    periode: '1447',
  });

  const fetchData = async () => {
    setIsLoading(true);

    const { data: dataHewan, error: errHewan } = await supabase
      .from('hewan')
      .select('*')
      .eq('is_hidden', false)
      .order('created_at', { ascending: false });

    if (!errHewan && dataHewan) {
      const now = new Date().getTime();
      const expiredIds: string[] = [];

      const validHewan = dataHewan.filter((item) => {
        if (item.in_trash && item.trashed_at) {
          const diffTime = Math.abs(now - new Date(item.trashed_at).getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays > 30) {
            expiredIds.push(item.id);
            return false;
          }
        }
        return true;
      });

      if (expiredIds.length > 0) {
        await supabase
          .from('hewan')
          .update({ is_hidden: true })
          .in('id', expiredIds);
      }

      setHewan(validHewan);
    }

    const { data: dataWeb } = await supabase.from('pengaturan_web').select('*');
    if (dataWeb) {
      setRekeningKurban(
        dataWeb.find((s) => s.kunci === 'kurban_rekening')?.nilai || '',
      );
      setQrisKurbanUrl(
        dataWeb.find((s) => s.kunci === 'kurban_qris_url')?.nilai || '',
      );
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Kosongkan seleksi setiap kali pindah tab
  useEffect(() => {
    setSelectedIds([]);
  }, [activeTab]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      if (result.url) setForm({ ...form, gambar_url: result.url });
    } catch (error) {
      alert('Terjadi kesalahan saat mengunggah gambar.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadQris = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingQris(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', 'mni-assets');
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await res.json();
      if (result.url) setQrisKurbanUrl(result.url);
    } catch (error) {
      alert('Terjadi kesalahan saat mengunggah QRIS.');
    } finally {
      setIsUploadingQris(false);
    }
  };

  const handleSimpanPengaturan = async () => {
    setIsSavingSetting(true);
    try {
      await supabase.from('pengaturan_web').upsert(
        [
          { kunci: 'kurban_rekening', nilai: rekeningKurban },
          { kunci: 'kurban_qris_url', nilai: qrisKurbanUrl },
        ],
        { onConflict: 'kunci' },
      );
      alert('Pengaturan Pembayaran Kurban Berhasil Disimpan!');
    } catch (err) {
      alert('Gagal menyimpan pengaturan.');
    } finally {
      setIsSavingSetting(false);
    }
  };

  const handleSimpan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const dataSimpan = {
      jenis: form.jenis,
      tipe: form.tipe,
      berat: form.jenis === 'Jasa Potong' ? null : form.berat,
      harga: Number(form.harga),
      gambar_url: form.gambar_url,
      status: form.status,
      mekanisme: form.mekanisme,
      deskripsi: form.jenis === 'Jasa Potong' ? form.deskripsi : null,
      periode: form.periode,
    };
    try {
      if (form.id)
        await supabase.from('hewan').update(dataSimpan).eq('id', form.id);
      else await supabase.from('hewan').insert([dataSimpan]);
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      alert('Gagal menyimpan data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuangKeSampah = async (id: string) => {
    if (!confirm('Pindahkan kartu ini ke Tong Sampah?')) return;
    setIsLoading(true);
    await supabase
      .from('hewan')
      .update({ in_trash: true, trashed_at: new Date().toISOString() })
      .eq('id', id);
    fetchData();
  };

  const handleRestore = async (id: string) => {
    setIsLoading(true);
    await supabase
      .from('hewan')
      .update({ in_trash: false, trashed_at: null })
      .eq('id', id);
    fetchData();
  };

  const handleHapusSembunyi = async (id: string) => {
    if (!confirm('Hapus kartu ini dari tampilan Admin dan Publik?')) return;
    setIsLoading(true);
    await supabase
      .from('hewan')
      .update({ is_hidden: true, in_trash: false, trashed_at: null })
      .eq('id', id);
    fetchData();
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleBulkBuangKeSampah = async () => {
    if (!confirm(`Pindahkan ${selectedIds.length} kartu ke Tong Sampah?`))
      return;
    setIsLoading(true);
    await supabase
      .from('hewan')
      .update({ in_trash: true, trashed_at: new Date().toISOString() })
      .in('id', selectedIds);
    setSelectedIds([]);
    fetchData();
  };

  const handleBulkRestore = async () => {
    if (!confirm(`Pulihkan ${selectedIds.length} kartu ke Katalog?`)) return;
    setIsLoading(true);
    await supabase
      .from('hewan')
      .update({ in_trash: false, trashed_at: null })
      .in('id', selectedIds);
    setSelectedIds([]);
    fetchData();
  };

  const handleBulkHapusSembunyi = async () => {
    if (
      !confirm(
        `Hapus ${selectedIds.length} kartu secara permanen dari tampilan?`,
      )
    )
      return;
    setIsLoading(true);
    await supabase
      .from('hewan')
      .update({ is_hidden: true, in_trash: false, trashed_at: null })
      .in('id', selectedIds);
    setSelectedIds([]);
    fetchData();
  };

  const openEditModal = (item: any) => {
    setForm({
      id: item.id,
      jenis: item.jenis,
      tipe: item.tipe || '',
      berat: item.berat || '',
      harga: item.harga || '',
      gambar_url: item.gambar_url || '',
      status: item.status || 'Tersedia',
      mekanisme: item.mekanisme || 'Otomatis',
      deskripsi: item.deskripsi || '',
      periode: item.periode || '1447',
    });
    setIsModalOpen(true);
  };

  const resetForm = () =>
    setForm({
      id: '',
      jenis: 'Sapi',
      tipe: '',
      berat: '',
      harga: '',
      gambar_url: '',
      status: 'Tersedia',
      mekanisme: 'Otomatis',
      deskripsi: '',
      periode: '1447',
    });

  const hewanDitampilkan = hewan.filter((h) =>
    activeTab === 'sampah' ? h.in_trash : !h.in_trash,
  );

  return (
    <div className='space-y-6 relative'>
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
          PILL ACTION BAR ALA MACOS (GLASSMORPHISM)
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
                <span className='text-zinc-400 font-medium hidden sm:inline'>
                  Terpilih
                </span>
              </span>
            </div>

            <button
              onClick={() => setSelectedIds(hewanDitampilkan.map((h) => h.id))}
              className='text-xs font-bold text-zinc-400 hover:text-white transition-colors px-2'>
              Pilih Semua
            </button>

            {activeTab === 'katalog' ? (
              <>
                <button
                  onClick={handleBulkBuangKeSampah}
                  className='flex items-center text-xs font-bold bg-orange-500/20 text-orange-400 hover:bg-orange-500 hover:text-white px-4 py-2 rounded-full transition-colors ml-2 shadow-inner'>
                  <Trash2 className='w-3.5 h-3.5 mr-1.5' /> Buang
                </button>
                <button
                  onClick={handleBulkHapusSembunyi}
                  className='flex items-center text-xs font-bold bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white px-4 py-2 rounded-full transition-colors ml-2 shadow-inner'>
                  <EyeOff className='w-3.5 h-3.5 mr-1.5' /> Hapus
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleBulkRestore}
                  className='flex items-center text-xs font-bold bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white px-4 py-2 rounded-full transition-colors ml-2 shadow-inner'>
                  <ArchiveRestore className='w-3.5 h-3.5 mr-1.5' /> Pulihkan
                </button>
                <button
                  onClick={handleBulkHapusSembunyi}
                  className='flex items-center text-xs font-bold bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white px-4 py-2 rounded-full transition-colors ml-2 shadow-inner'>
                  <EyeOff className='w-3.5 h-3.5 mr-1.5' /> Hapus
                </button>
              </>
            )}

            <button
              onClick={() => setSelectedIds([])}
              className='ml-2 p-2 bg-zinc-800 text-zinc-400 rounded-full hover:bg-zinc-700 hover:text-white transition-colors'>
              <X className='w-4 h-4' />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Panel */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className='flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-mni-primary'>
            Katalog Kurban
          </h1>
          <p className='text-mni-muted text-sm mt-1'>
            Kelola data hewan dan pengaturan pembayaran Kurban.
          </p>
        </div>
        <div className='flex items-center gap-3'>
          <div className='flex bg-gray-100 p-1 rounded-xl shrink-0'>
            <button
              onClick={() => setActiveTab('katalog')}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'katalog' ? 'bg-white shadow-sm text-mni-primary' : 'text-gray-500 hover:text-gray-700'}`}>
              Katalog
            </button>
            <button
              onClick={() => setActiveTab('sampah')}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center ${activeTab === 'sampah' ? 'bg-white shadow-sm text-red-600' : 'text-gray-500 hover:text-red-500'}`}>
              <Trash2 className='w-4 h-4 mr-1.5' /> Sampah
            </button>
          </div>

          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className='flex items-center space-x-2 bg-mni-primary text-white px-5 py-2.5 rounded-xl font-medium shadow-sm hover:bg-mni-primaryHover transition-colors'>
            <Plus className='w-5 h-5' />{' '}
            <span className='hidden sm:block'>Tambah</span>
          </button>
        </div>
      </motion.div>

      {/* PANEL PENGATURAN PEMBAYARAN KURBAN */}
      {activeTab === 'katalog' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
          <div className='bg-gray-50 border-b border-gray-100 p-4 px-6'>
            <h2 className='font-bold text-gray-800 flex items-center gap-2'>
              <CreditCard className='w-5 h-5 text-mni-primary' /> Pengaturan
              Pembayaran Publik
            </h2>
          </div>
          <div className='p-6 flex flex-col lg:flex-row gap-8'>
            <div className='lg:w-2/3 space-y-4'>
              <div>
                <label className='block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2'>
                  Instruksi & Atas Nama Rekening Kurban
                </label>
                <input
                  type='text'
                  value={rekeningKurban}
                  onChange={(e) => setRekeningKurban(e.target.value)}
                  placeholder='Contoh: Bank BSI 7123456789 a.n Masjid Nurul Iman Kurban'
                  className='w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-mni-primary/20 focus:border-mni-primary bg-gray-50 focus:bg-white transition-all font-medium text-gray-800'
                />
              </div>
              <div className='pt-2'>
                <button
                  onClick={handleSimpanPengaturan}
                  disabled={isSavingSetting || isUploadingQris}
                  className='flex items-center bg-mni-primary hover:bg-mni-primaryHover text-white px-6 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50 shadow-sm'>
                  {isSavingSetting ? (
                    <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  ) : (
                    <Save className='w-4 h-4 mr-2' />
                  )}{' '}
                  {isSavingSetting ? 'Menyimpan...' : 'Simpan Pembayaran'}
                </button>
              </div>
            </div>
            <div className='lg:w-1/3 border-t lg:border-t-0 lg:border-l border-gray-100 lg:pl-8 pt-6 lg:pt-0'>
              <label className='block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2'>
                Gambar QRIS Kurban
              </label>
              <div className='flex gap-4 items-start'>
                <div className='w-32 h-32 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl overflow-hidden flex items-center justify-center relative group shrink-0'>
                  {qrisKurbanUrl ? (
                    <img
                      src={qrisKurbanUrl}
                      alt='QRIS Kurban'
                      className='w-full h-full object-contain p-2'
                    />
                  ) : (
                    <ImageIcon className='w-8 h-8 text-gray-300' />
                  )}
                  <label className='absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity'>
                    <UploadCloud className='w-5 h-5 text-white mb-1' />{' '}
                    <span className='text-white text-[10px] font-bold'>
                      Ganti QRIS
                    </span>
                    <input
                      type='file'
                      accept='image/*'
                      className='hidden'
                      onChange={handleUploadQris}
                      disabled={isUploadingQris}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Grid Katalog */}
      {isLoading ? (
        <div className='flex justify-center py-20'>
          <Loader2 className='w-10 h-10 animate-spin text-mni-primary' />
        </div>
      ) : hewanDitampilkan.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-20 text-gray-400'>
          {activeTab === 'sampah' ? (
            <Trash className='w-16 h-16 mb-4 text-gray-200' />
          ) : (
            <BoxIcon className='w-16 h-16 mb-4 text-gray-200' />
          )}
          <p className='text-lg font-bold'>
            {activeTab === 'sampah'
              ? 'Tong Sampah Kosong'
              : 'Belum Ada Data Hewan'}
          </p>
        </div>
      ) : (
        <motion.div
          initial='hidden'
          animate='visible'
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
          }}
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${isSelectionMode ? 'select-none' : ''}`}>
          {hewanDitampilkan.map((item) => {
            const isTersedia = item.status.toLowerCase() === 'tersedia';
            const isSelected = selectedIds.includes(item.id);

            let sisaHari = 30;
            if (item.in_trash && item.trashed_at) {
              const diffTime = Math.abs(
                new Date().getTime() - new Date(item.trashed_at).getTime(),
              );
              sisaHari = 30 - Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            }

            return (
              <motion.div
                variants={{
                  hidden: { opacity: 0, scale: 0.9 },
                  visible: { opacity: 1, scale: 1 },
                }}
                key={item.id}
                onClick={() => isSelectionMode && toggleSelect(item.id)}
                className={`bg-white rounded-[2rem] shadow-sm border overflow-hidden relative transition-all duration-300 group flex flex-col
                ${isSelectionMode ? 'animate-subtle-jiggle cursor-pointer' : 'hover:shadow-xl hover:border-gray-200'}
                ${!isTersedia || activeTab === 'sampah' ? 'grayscale-[40%]' : ''}
                ${isSelected ? 'border-teal-500 ring-2 ring-teal-500/30 shadow-md scale-[0.98]' : 'border-gray-100'}`}>
                {/* ==========================================
                    DOT INDIKATOR ELEGANT (GANTI CHECKBOX)
                    ========================================== */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelect(item.id);
                  }}
                  className={`absolute top-4 left-4 z-[50] w-[22px] h-[22px] rounded-full border-[1.5px] transition-all flex items-center justify-center
                    ${
                      isSelected
                        ? 'border-teal-500 bg-teal-500 shadow-[0_0_12px_rgba(20,184,166,0.6)]'
                        : 'border-white/90 bg-black/30 backdrop-blur-md hover:border-white'
                    }
                  `}>
                  {isSelected && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 20,
                      }}
                      className='w-2.5 h-2.5 rounded-full bg-white'
                    />
                  )}
                </button>

                {/* Badges Status & Sampah (Desain Premium) */}
                <div className='absolute top-4 right-4 z-10 flex flex-col gap-2 items-end'>
                  {activeTab === 'sampah' ? (
                    <span className='px-3 py-1.5 rounded-full text-[10px] uppercase font-bold shadow-md backdrop-blur-md border bg-zinc-900/90 text-white border-zinc-700 flex items-center'>
                      <Clock className='w-3 h-3 mr-1.5 text-red-400' /> Dihapus
                      dlm {sisaHari} Hari
                    </span>
                  ) : (
                    <>
                      <span
                        className={`px-3 py-1.5 rounded-full text-[10px] uppercase font-bold shadow-md backdrop-blur-md border flex items-center
                        ${isTersedia ? 'bg-white/90 text-emerald-700 border-emerald-200/50' : 'bg-zinc-900/90 text-white border-zinc-800'}
                      `}>
                        {isTersedia && (
                          <span className='w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse'></span>
                        )}
                        {item.status}
                      </span>
                      <span
                        className={`px-3 py-1.5 rounded-full text-[10px] uppercase font-bold shadow-md flex items-center backdrop-blur-md border bg-white/90 text-slate-600 border-slate-200/50`}>
                        {item.mekanisme === 'Otomatis' ? (
                          <Zap className='w-3 h-3 mr-1 text-slate-400' />
                        ) : (
                          <Hand className='w-3 h-3 mr-1 text-slate-400' />
                        )}
                        {item.mekanisme || 'Otomatis'}
                      </span>
                    </>
                  )}
                </div>

                {/* Area Gambar */}
                <div className='h-56 w-full bg-gray-50 flex items-center justify-center relative overflow-hidden shrink-0'>
                  {item.gambar_url ? (
                    <img
                      src={item.gambar_url}
                      alt={item.tipe}
                      className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-700'
                    />
                  ) : (
                    <ImageIcon className='w-12 h-12 text-gray-300' />
                  )}
                  <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 pt-12'>
                    <span className='text-white text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-md backdrop-blur-sm'>
                      {item.jenis}
                    </span>
                  </div>
                </div>

                {/* Detail & Tombol Aksi (Warna Minimalis & Ikon Kado) */}
                <div className='p-6 flex flex-col flex-1 relative bg-white overflow-hidden'>
                  {/* IKON KADO BACKGROUND MENGEMBANG */}
                  <div className='absolute -right-6 -bottom-6 opacity-[0.03] pointer-events-none group-hover:scale-125 transition-transform duration-700 z-0'>
                    <Gift className='w-40 h-40' />
                  </div>

                  <div className='relative z-10'>
                    <h3 className='text-xl font-bold text-slate-800 mb-1 truncate'>
                      {item.tipe || '-'}
                    </h3>
                    <p className='text-xl font-extrabold text-mni-primary mb-5'>
                      Rp {Number(item.harga).toLocaleString('id-ID')}
                    </p>

                    <div className='flex justify-end gap-1.5 pt-4 border-t border-slate-100'>
                      {!isSelectionMode &&
                        (activeTab === 'katalog' ? (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditModal(item);
                              }}
                              className='p-2 text-slate-400 hover:text-mni-primary hover:bg-mni-primary/10 rounded-xl transition-colors'>
                              <Edit2 className='w-4 h-4' />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBuangKeSampah(item.id);
                              }}
                              className='p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-colors'
                              title='Buang ke Tong Sampah'>
                              <Trash2 className='w-4 h-4' />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleHapusSembunyi(item.id);
                              }}
                              className='p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors'
                              title='Hapus Permanen Layar'>
                              <EyeOff className='w-4 h-4' />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRestore(item.id);
                              }}
                              className='flex items-center px-3 py-2 text-xs font-bold text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors'>
                              <ArchiveRestore className='w-4 h-4 mr-1.5' />{' '}
                              Pulihkan
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleHapusSembunyi(item.id);
                              }}
                              className='flex items-center px-3 py-2 text-xs font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors'>
                              <EyeOff className='w-4 h-4 mr-1.5' /> Hapus Total
                            </button>
                          </>
                        ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* MODAL FORM TETAP SAMA */}
      <AnimatePresence>
        {isModalOpen && (
          <div className='fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto'>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className='bg-white rounded-[2rem] w-full max-w-2xl my-8 shadow-2xl overflow-hidden'>
              <div className='bg-mni-surface p-6 border-b border-gray-100 flex justify-between items-center'>
                <h2 className='text-xl font-bold text-mni-primary flex items-center'>
                  <Tag className='w-5 h-5 mr-2' />{' '}
                  {form.id ? 'Edit Data Katalog' : 'Tambah Data Baru'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className='w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors font-bold'>
                  &times;
                </button>
              </div>

              <form
                onSubmit={handleSimpan}
                className='p-6 space-y-6'>
                {/* Panel Setting Status */}
                <div className='grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100'>
                  <div>
                    <label className='block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2'>
                      Mekanisme Penjualan
                    </label>
                    <select
                      value={form.mekanisme}
                      onChange={(e) =>
                        setForm({ ...form, mekanisme: e.target.value })
                      }
                      className='w-full border-none ring-1 ring-gray-200 rounded-xl px-4 py-2.5 outline-none font-semibold text-mni-text bg-white focus:ring-2 focus:ring-mni-primary transition-shadow'>
                      <option value='Otomatis'>Otomatis Disable </option>
                      <option value='Manual'>Manual Disable</option>
                    </select>
                  </div>
                  <div>
                    <label className='block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2'>
                      Status Visibilitas
                    </label>
                    <select
                      value={form.status}
                      onChange={(e) =>
                        setForm({ ...form, status: e.target.value })
                      }
                      className='w-full border-none ring-1 ring-gray-200 rounded-xl px-4 py-2.5 outline-none font-semibold text-mni-text bg-white focus:ring-2 focus:ring-mni-primary transition-shadow'>
                      <option value='Tersedia'>Tersedia / Tampilkan</option>
                      <option value='Terjual'>Terjual / Sembunyikan</option>
                    </select>
                  </div>
                </div>

                {/* Form Input Utama */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                  {/* Form Input Utama */}
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-5 md:col-span-2'>
                    <div>
                      <label className='block text-sm font-semibold mb-1.5 text-gray-700'>
                        Tahun (H)
                      </label>
                      <input
                        type='number'
                        required
                        placeholder='1447'
                        value={form.periode}
                        onChange={(e) =>
                          setForm({ ...form, periode: e.target.value })
                        }
                        className='w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-mni-primary bg-gray-50 focus:bg-white transition-colors'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-semibold mb-1.5 text-gray-700'>
                        Kategori
                      </label>
                      <select
                        value={form.jenis}
                        onChange={(e) =>
                          setForm({ ...form, jenis: e.target.value })
                        }
                        className='w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-mni-primary bg-gray-50 focus:bg-white transition-colors'>
                        <option value='Sapi'>Sapi</option>
                        <option value='Kambing'>Kambing</option>
                        <option value='Domba'>Domba</option>
                        <option value='Jasa Potong'>Jasa Potong</option>
                      </select>
                    </div>
                    <div>
                      <label className='block text-sm font-semibold mb-1.5 text-gray-700'>
                        Tipe
                      </label>
                      <input
                        type='text'
                        required
                        placeholder='Cth: Limosin A-01'
                        value={form.tipe}
                        onChange={(e) =>
                          setForm({ ...form, tipe: e.target.value })
                        }
                        className='w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-mni-primary bg-gray-50 focus:bg-white transition-colors'
                      />
                    </div>
                  </div>

                  {form.jenis !== 'Jasa Potong' && (
                    <div>
                      <label className='block text-sm font-semibold mb-1.5 text-gray-700'>
                        Estimasi Berat
                      </label>
                      <input
                        type='text'
                        placeholder='Contoh: 300 - 320 Kg'
                        value={form.berat}
                        onChange={(e) =>
                          setForm({ ...form, berat: e.target.value })
                        }
                        className='w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-mni-primary bg-gray-50 focus:bg-white transition-colors'
                      />
                    </div>
                  )}

                  <div>
                    <label className='block text-sm font-semibold mb-1.5 text-gray-700'>
                      Harga (Rp)
                    </label>
                    <input
                      type='number'
                      required
                      placeholder='Contoh: 3000000'
                      value={form.harga}
                      onChange={(e) =>
                        setForm({ ...form, harga: e.target.value })
                      }
                      className='w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-mni-primary font-bold text-mni-primary bg-gray-50 focus:bg-white transition-colors'
                    />
                  </div>
                </div>

                {form.jenis === 'Jasa Potong' && (
                  <div>
                    <label className='block text-sm font-semibold mb-1.5 text-gray-700'>
                      Deskripsi Layanan
                    </label>
                    <textarea
                      rows={2}
                      placeholder='Penjelasan mengenai jasa potong ini...'
                      value={form.deskripsi}
                      onChange={(e) =>
                        setForm({ ...form, deskripsi: e.target.value })
                      }
                      className='w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-mni-primary bg-gray-50 focus:bg-white transition-colors'
                    />
                  </div>
                )}

                <div>
                  <label className='block text-sm font-semibold mb-1.5 text-gray-700'>
                    Foto {form.jenis}
                  </label>
                  <div className='flex items-center gap-4'>
                    {form.gambar_url && (
                      <img
                        src={form.gambar_url}
                        alt='Preview'
                        className='w-16 h-16 object-cover rounded-xl border border-gray-200 shadow-sm'
                      />
                    )}
                    <div className='flex-1'>
                      <input
                        type='file'
                        accept='image/*'
                        onChange={handleFileUpload}
                        className='w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-mni-primary hover:file:bg-green-100 transition-colors cursor-pointer'
                      />
                      {isUploading && (
                        <p className='text-xs text-mni-primary mt-2 flex items-center'>
                          <Loader2 className='w-3 h-3 animate-spin mr-1' />{' '}
                          Sedang mengunggah gambar...
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className='pt-6 flex gap-4 border-t border-gray-100'>
                  <button
                    type='button'
                    onClick={() => setIsModalOpen(false)}
                    className='flex-1 bg-gray-100 text-gray-600 py-3.5 rounded-xl font-bold hover:bg-gray-200 transition-colors'>
                    Batal
                  </button>
                  <button
                    type='submit'
                    disabled={isLoading || isUploading}
                    className='flex-1 bg-mni-primary text-white py-3.5 rounded-xl font-bold hover:bg-mni-primaryHover transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center'>
                    {isLoading ? (
                      <Loader2 className='w-5 h-5 animate-spin' />
                    ) : (
                      'Simpan Data'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
