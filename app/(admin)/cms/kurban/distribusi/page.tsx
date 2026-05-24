'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Search,
  Loader2,
  MapPin,
  PackageOpen,
  Camera,
  CheckCircle2,
  User,
} from 'lucide-react';

export default function DistribusiDashboard() {
  const [pesananList, setPesananList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // State untuk Modal Pengiriman
  const [selectedKirim, setSelectedKirim] = useState<any>(null);
  const [catatanKurir, setCatatanKurir] = useState('');
  const [fotoBukti, setFotoBukti] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSiapKirim = async () => {
    setIsLoading(true);
    // Hanya ambil yang sudah Selesai (Disembelih) tapi belum Didistribusikan
    const { data } = await supabase
      .from('pesanan')
      .select('*, hewan(jenis, tipe)')
      .in('status_pesanan', ['Selesai', 'Terkirim'])
      .order('status_pesanan', { ascending: false }); // 'Selesai' di atas, 'Terkirim' di bawah

    if (data) setPesananList(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSiapKirim();
  }, []);

  // Handle Preview Foto
  useEffect(() => {
    if (!fotoBukti) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(fotoBukti);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [fotoBukti]);

  const filteredData = pesananList.filter(
    (p) =>
      p.nama_mudhohi.toLowerCase().includes(search.toLowerCase()) ||
      p.kode_trx.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSelesaikanPengiriman = async () => {
    if (!fotoBukti) return alert('Wajib melampirkan foto serah terima daging!');
    setIsSubmitting(true);

    try {
      // 1. Upload Foto
      const formData = new FormData();
      formData.append('file', fotoBukti);
      formData.append('bucket', 'mni-assets');
      const resUpload = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const { url } = await resUpload.json();
      if (!url) throw new Error('Gagal upload foto');

      // 2. Tarik Log Lama untuk Audit Trail
      const { data: psn } = await supabase
        .from('pesanan')
        .select('logs')
        .eq('id', selectedKirim.id)
        .single();
      const currentLogs = psn?.logs || [];
      const newLog = {
        status: 'Hak Daging Diterima',
        timestamp: new Date().toISOString(),
        oleh: 'Panitia Bagian Distribusi',
        catatan:
          catatanKurir ||
          'Daging kurban telah diserahkan kepada mudhohi/penerima.',
      };

      // 3. Update Database (Kita asumsikan Mas punya kolom 'bukti_kirim_url' dan 'catatan_kurir')
      const { error } = await supabase
        .from('pesanan')
        .update({
          status_pesanan: 'Terkirim',
          logs: [...currentLogs, newLog],
          // Opsional jika Mas mau tambah kolom ini di Supabase:
          bukti_kirim_url: url,
          catatan_kurir: catatanKurir,
        })
        .eq('id', selectedKirim.id);

      if (error) throw error;

      alert('Distribusi berhasil dicatat!');
      setSelectedKirim(null);
      setFotoBukti(null);
      setCatatanKurir('');
      fetchSiapKirim();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='min-h-screen bg-slate-50 pb-20'>
      {/* HEADER MOBILE-FIRST */}
      <div className='bg-teal-600 text-white p-5 rounded-2xl shadow-md sticky top-0 z-40'>
        <h1 className='text-xl font-bold tracking-tight'>Distribusi Daging</h1>
        <p className='text-teal-100 text-xs mt-1'>
          Panel khusus panitia Distribusi untuk mengelola pengiriman daging
          kurban ke penerima.
        </p>

        <div className='relative mt-4'>
          <Search className='absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400' />
          <input
            type='text'
            placeholder='Cari nama / kode...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='w-full bg-white text-slate-800 rounded-full py-3 pl-11 pr-4 text-sm font-medium outline-none shadow-sm focus:ring-2 focus:ring-teal-400'
          />
        </div>
      </div>

      {/* DAFTAR TUGAS KIRIM */}
      <div className='p-4 space-y-4'>
        {isLoading ? (
          <div className='flex justify-center py-10'>
            <Loader2 className='w-6 h-6 animate-spin text-teal-600' />
          </div>
        ) : filteredData.length === 0 ? (
          <p className='text-center text-slate-400 py-10 text-sm'>
            Belum ada paket daging yang siap kirim.
          </p>
        ) : (
          filteredData.map((trx) => (
            <div
              key={trx.id}
              className={`bg-white p-4 rounded-2xl shadow-sm border ${trx.status_pesanan === 'Terkirim' ? 'border-emerald-200 opacity-70' : 'border-slate-200'}`}>
              <div className='flex justify-between items-start mb-3'>
                <div>
                  <p className='text-xs font-bold text-slate-400'>
                    {trx.kode_trx}
                  </p>
                  <p className='font-bold text-slate-800 text-lg leading-tight'>
                    {trx.nama_mudhohi}
                  </p>
                </div>
                {trx.status_pesanan === 'Terkirim' ? (
                  <span className='bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1'>
                    <CheckCircle2 className='w-3 h-3' /> Selesai
                  </span>
                ) : (
                  <span className='bg-orange-100 text-orange-700 px-2 py-1 rounded text-[10px] font-bold'>
                    Siap Antar
                  </span>
                )}
              </div>

              <div className='bg-slate-50 p-3 rounded-xl space-y-2 mb-4'>
                <div className='flex items-start gap-2 text-sm'>
                  <MapPin className='w-4 h-4 text-red-500 shrink-0 mt-0.5' />
                  <p className='text-slate-600 font-medium leading-snug'>
                    {trx.alamat || 'Diambil di Masjid'}
                  </p>
                </div>
                <div className='flex items-start gap-2 text-sm'>
                  <PackageOpen className='w-4 h-4 text-blue-500 shrink-0 mt-0.5' />
                  <p className='text-slate-600 font-medium leading-snug'>
                    Request 1/3:{' '}
                    <b>{trx.bagian_sepertiga || 'Sedekah Semua'}</b>
                  </p>
                </div>
              </div>

              {trx.status_pesanan !== 'Terkirim' && (
                <button
                  onClick={() => setSelectedKirim(trx)}
                  className='w-full bg-teal-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-800 active:scale-95 transition-all'>
                  Eksekusi Pengiriman
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* MODAL EKSEKUSI KURIR (BOTTOM SHEET STYLE) */}
      {selectedKirim && (
        <div className='fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center animate-in fade-in'>
          <div className='bg-white w-full sm:max-w-md rounded-t-[2rem] sm:rounded-[2rem] p-5 pb-8 animate-in slide-in-from-bottom-10'>
            <div className='w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-5 sm:hidden'></div>

            <h2 className='text-xl font-black text-slate-800 mb-1'>
              Laporan Serah Terima
            </h2>
            <p className='text-sm text-slate-500 mb-5'>
              Kurban milik <b>{selectedKirim.nama_mudhohi}</b>
            </p>

            <div className='space-y-4'>
              {/* Upload Foto (Camera Mode) */}
              <div>
                <label className='text-xs font-bold text-slate-500 uppercase mb-2 block'>
                  Foto Bukti / Penerima
                </label>
                <div className='relative w-full h-40 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center overflow-hidden'>
                  <input
                    type='file'
                    accept='image/*,capture=camera'
                    onChange={(e) => setFotoBukti(e.target.files?.[0] || null)}
                    className='absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20'
                  />
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      className='w-full h-full object-cover opacity-90'
                    />
                  ) : (
                    <>
                      <Camera className='w-8 h-8 text-slate-400 mb-2' />
                      <span className='text-xs font-bold text-slate-500'>
                        Buka Kamera / Galeri
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Catatan Kurir */}
              <div>
                <label className='text-xs font-bold text-slate-500 uppercase mb-2 block'>
                  Catatan Pengirim (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder='Misal: Diterima oleh istrinya / Ditaruh di teras...'
                  value={catatanKurir}
                  onChange={(e) => setCatatanKurir(e.target.value)}
                  className='w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-slate-50'
                />
              </div>

              <div className='flex gap-3 pt-2'>
                <button
                  onClick={() => {
                    setSelectedKirim(null);
                    setFotoBukti(null);
                  }}
                  className='w-1/3 py-3.5 rounded-xl font-bold text-slate-600 bg-slate-100'>
                  Batal
                </button>
                <button
                  onClick={handleSelesaikanPengiriman}
                  disabled={isSubmitting || !fotoBukti}
                  className='w-2/3 py-3.5 rounded-xl font-bold text-white bg-teal-600 disabled:opacity-50 flex items-center justify-center gap-2'>
                  {isSubmitting ? (
                    <Loader2 className='w-4 h-4 animate-spin' />
                  ) : (
                    <CheckCircle2 className='w-4 h-4' />
                  )}
                  Selesaikan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
