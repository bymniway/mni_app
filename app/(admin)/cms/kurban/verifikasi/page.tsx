'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Loader2,
  Clock,
  AlertCircle,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  Wallet,
  Receipt,
  PackageOpen,
  MapPin,
  UploadCloud,
  CheckSquare,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function VerifikasiKurbanPage() {
  const [pesananList, setPesananList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('Semua');
  const [search, setSearch] = useState('');

  // Split-Pane State
  const [selectedTrx, setSelectedTrx] = useState<any | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [alasanTolak, setAlasanTolak] = useState('');

  // STATE BARU: PENYEMBELIHAN
  const [fileSembelih, setFileSembelih] = useState<File | null>(null);
  const [isSelesaikanLoading, setIsSelesaikanLoading] = useState(false);

  const fetchPesanan = async (preserveSelectedId?: number) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('pesanan')
        .select('*, hewan(*)')
        .order('created_at', { ascending: false });

      if (data) {
        setPesananList(data);
        if (preserveSelectedId) {
          const updatedSelected = data.find((t) => t.id === preserveSelectedId);
          if (updatedSelected) setSelectedTrx(updatedSelected);
        }
      }
    } catch (error) {
      console.error('Error fetching pesanan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPesanan();
  }, []);

  const formatRp = (angka: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(angka);

  const formatStatusDisplay = (status: string) => {
    if (!status) return '';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  const filteredData = pesananList.filter((trx) => {
    const statusDisplay = formatStatusDisplay(trx.status_pesanan);
    const matchFilter = filter === 'Semua' || statusDisplay === filter;
    const matchSearch =
      trx.nama_mudhohi?.toLowerCase().includes(search.toLowerCase()) ||
      trx.kode_trx?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts = {
    Semua: pesananList.length,
    Booking: pesananList.filter(
      (t) => formatStatusDisplay(t.status_pesanan) === 'Booking',
    ).length,
    Menunggu: pesananList.filter(
      (t) => formatStatusDisplay(t.status_pesanan) === 'Menunggu',
    ).length,
    Lunas: pesananList.filter(
      (t) => formatStatusDisplay(t.status_pesanan) === 'Lunas',
    ).length,
    Selesai: pesananList.filter(
      (t) => formatStatusDisplay(t.status_pesanan) === 'Selesai',
    ).length,
    Ditolak: pesananList.filter(
      (t) => formatStatusDisplay(t.status_pesanan) === 'Ditolak',
    ).length,
  };

  // SINKRONISASI GOOGLE SHEETS
  const syncToGoogleSheet = async (p: any) => {
    try {
      await fetch('/api/sync-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tanggal: new Date().toLocaleString('id-ID', {
            dateStyle: 'medium',
            timeStyle: 'short',
          }),
          kode: p.kode_trx,
          nama: p.nama_mudhohi,
          alamat: p.alamat || '-',
          jenis: p.hewan?.jenis || '-',
          tipe: p.hewan?.tipe || '-',
          berat: p.hewan?.berat || '-',
          harga: Number(p.total_bayar),
          bagian_sepertiga: p.bagian_sepertiga || 'Sedekah Semua',
        }),
      });
    } catch (err) {
      console.error('Gagal sinkronisasi ke Sheets:', err);
    }
  };

  // LOGIKA VERIFIKASI
  const handleVerifikasi = async (status: 'Lunas' | 'Ditolak') => {
    if (!selectedTrx) return;
    if (status === 'Ditolak' && !alasanTolak)
      return alert('Mohon isi alasan penolakan pada kolom yang tersedia.');

    setIsProcessing(true);
    try {
      const response = await fetch('/api/admin/verifikasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idPesanan: selectedTrx.id,
          emailUser: selectedTrx.email,
          namaMudhohi: selectedTrx.nama_mudhohi,
          kodeTrx: selectedTrx.kode_trx,
          totalBayar: selectedTrx.total_bayar,
          alamat: selectedTrx.alamat,
          bagianSepertiga: selectedTrx.bagian_sepertiga,
          statusTujuan: status,
          detailHewan: `${selectedTrx.hewan?.jenis} - ${selectedTrx.hewan?.tipe}`,
          alasanTolak: alasanTolak,
        }),
      });

      if (!response.ok) {
        const resError = await response.json();
        throw new Error(resError.error || 'Gagal terhubung ke API verifikasi');
      }

      if (status === 'Lunas') await syncToGoogleSheet(selectedTrx);

      // Logika Kuota Hewan Terjual
      if (status === 'Lunas') {
        const isOtomatis =
          selectedTrx.hewan?.mekanisme === 'Otomatis' ||
          !selectedTrx.hewan?.mekanisme;
        const isJasaPotong =
          String(selectedTrx.hewan?.jenis).toLowerCase() === 'jasa potong';
        const tipeHewan = String(selectedTrx.hewan?.tipe || '').toLowerCase();
        const jenisHewan = String(selectedTrx.hewan?.jenis || '').toLowerCase();
        const isUrunan =
          tipeHewan.includes('urunan') ||
          jenisHewan.includes('urunan') ||
          tipeHewan.includes('uruan') ||
          jenisHewan.includes('uruan');

        if (!isJasaPotong && isOtomatis) {
          if (isUrunan) {
            const { count } = await supabase
              .from('pesanan')
              .select('*', { count: 'exact', head: true })
              .eq('hewan_id', selectedTrx.hewan_id)
              .in('status_pesanan', ['Menunggu', 'Lunas', 'Selesai']);
            if (Number(count || 0) >= 7) {
              await supabase
                .from('hewan')
                .update({ status: 'Terjual' })
                .eq('id', selectedTrx.hewan_id);
            }
          } else {
            await supabase
              .from('hewan')
              .update({ status: 'Terjual' })
              .eq('id', selectedTrx.hewan_id);
          }
        }
      }

      setAlasanTolak('');
      fetchPesanan(selectedTrx.id);
    } catch (error: any) {
      alert(`Gagal memproses verifikasi: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // =========================================================================
  // FUNGSI BARU: SELESAIKAN KURBAN
  // =========================================================================
  const handleSelesaikanKurban = async () => {
    if (!selectedTrx || !fileSembelih)
      return alert('Mohon unggah foto bukti penyembelihan terlebih dahulu.');

    setIsSelesaikanLoading(true);
    try {
      // 1. Upload Foto Sembelih
      const formData = new FormData();
      formData.append('file', fileSembelih);
      formData.append('bucket', 'mni-assets');

      const resUpload = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const resultUpload = await resUpload.json();

      if (!resultUpload.url)
        throw new Error('Gagal mengunggah foto penyembelihan.');

      // 2. Panggil API Laporan Selesai Kurban
      const response = await fetch('/api/admin/kurban-selesai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idPesanan: selectedTrx.id,
          emailUser: selectedTrx.email,
          namaMudhohi: selectedTrx.nama_mudhohi,
          kodeTrx: selectedTrx.kode_trx,
          detailHewan: `${selectedTrx.hewan?.jenis} - ${selectedTrx.hewan?.tipe}`,
          gambarSembelihUrl: resultUpload.url,
        }),
      });

      if (!response.ok) throw new Error('Gagal memproses penyelesaian kurban.');

      setFileSembelih(null);
      alert(
        'Kurban berhasil diselesaikan! Email laporan telah dikirim ke Pequrban.',
      );
      fetchPesanan(selectedTrx.id);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSelesaikanLoading(false);
    }
  };

  return (
    <div className='p-4 md:p-6 w-full max-w-[1600px] mx-auto animate-in fade-in h-[calc(100vh-4rem)] flex flex-col'>
      <div className='mb-5 shrink-0'>
        <h1 className='text-2xl md:text-xl font-semibold text-slate-800 tracking-tight'>
          Verifikasi Kurban
        </h1>
        <p className='text-sm text-slate-500 mt-1 font-medium'>
          Cek bukti transfer dan laporkan penyembelihan kurban.
        </p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0'>
        {/* PANEL KIRI */}
        <div className='lg:col-span-5 bg-white border border-slate-200 rounded-[1.5rem] shadow-sm flex flex-col h-[500px] lg:h-full overflow-hidden relative group/left'>
          <div className='p-4 border-b border-slate-100 bg-slate-50/80 space-y-3 shrink-0 relative z-10'>
            <div className='relative w-full'>
              <Search className='w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400' />
              <input
                type='text'
                placeholder='Cari Kode TRX / Nama...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className='w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-sm font-medium transition-all shadow-sm'
              />
            </div>
            <div className='flex gap-2 overflow-x-auto hide-scrollbar pb-1'>
              {[
                'Semua',
                'Booking',
                'Menunggu',
                'Lunas',
                'Selesai',
                'Ditolak',
              ].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-lg text-[11px] md:text-xs font-bold transition-all whitespace-nowrap border ${filter === f ? 'bg-teal-700 text-white border-teal-700 shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-teal-700 hover:border-teal-200'}`}>
                  {f}{' '}
                  {counts[f as keyof typeof counts] > 0 && (
                    <sup className='ml-0.5 font-black opacity-80'>
                      {counts[f as keyof typeof counts]}
                    </sup>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className='flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50/50 relative z-10'>
            {isLoading ? (
              <div className='py-12 flex justify-center'>
                <Loader2 className='w-6 h-6 text-teal-600 animate-spin' />
              </div>
            ) : filteredData.length === 0 ? (
              <div className='py-12 text-center text-slate-400 text-sm font-medium'>
                Tidak ada pesanan ditemukan.
              </div>
            ) : (
              filteredData.map((trx) => {
                const isSelected = selectedTrx?.id === trx.id;
                const statusDisp = formatStatusDisplay(trx.status_pesanan);

                return (
                  <div
                    key={trx.id}
                    onClick={() => setSelectedTrx(trx)}
                    className={`p-4 rounded-xl cursor-pointer transition-all border ${isSelected ? 'bg-teal-50 border-teal-300 shadow-sm ring-1 ring-teal-300/50' : 'bg-white border-slate-200 hover:border-teal-300 hover:shadow-sm'}`}>
                    <div className='flex justify-between items-start mb-2'>
                      <div className='pr-2'>
                        <p className='font-bold text-slate-800 text-sm leading-tight line-clamp-1'>
                          {trx.nama_mudhohi}
                        </p>
                        <p className='text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5'>
                          {trx.kode_trx}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wide border
                        ${
                          statusDisp === 'Lunas'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : statusDisp === 'Selesai'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : statusDisp === 'Booking'
                                ? 'bg-purple-50 text-purple-600 border-purple-200'
                                : statusDisp === 'Ditolak'
                                  ? 'bg-red-50 text-red-700 border-red-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                        {statusDisp === 'Menunggu' && (
                          <Clock className='w-3 h-3 mr-1' />
                        )}
                        {statusDisp === 'Selesai' && (
                          <CheckSquare className='w-3 h-3 mr-1' />
                        )}
                        {statusDisp}
                      </span>
                    </div>
                    <div className='flex justify-between items-end mt-2'>
                      <p className='text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-md line-clamp-1 max-w-[50%]'>
                        {trx.hewan?.jenis} - {trx.hewan?.tipe}
                      </p>
                      <p className='text-sm font-black text-teal-700'>
                        {formatRp(trx.total_bayar)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* PANEL KANAN */}
        <div className='lg:col-span-7 bg-white border border-slate-200 rounded-[1.5rem] shadow-sm h-[600px] lg:h-full flex flex-col overflow-hidden relative'>
          {!selectedTrx ? (
            <div className='flex flex-col items-center justify-center h-full text-slate-400 space-y-4'>
              <div className='w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100'>
                <ImageIcon className='w-6 h-6 text-slate-300' />
              </div>
              <p className='font-medium text-sm text-center px-6'>
                Pilih pesanan dari antrean untuk memverifikasi.
              </p>
            </div>
          ) : (
            <>
              {/* Header Panel Kanan */}
              <div className='p-5 border-b border-slate-100 bg-white flex justify-between items-center shrink-0'>
                <div>
                  <h2 className='text-xl font-bold text-slate-800 flex items-center gap-2'>
                    <Receipt className='w-5 h-5 text-teal-600' />{' '}
                    {selectedTrx.kode_trx}
                  </h2>
                  <p className='text-[11px] font-medium text-slate-400 mt-1'>
                    Tanggal Masuk:{' '}
                    {new Date(selectedTrx.created_at).toLocaleString('id-ID', {
                      dateStyle: 'full',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
                <div className='text-right'>
                  <p className='text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1'>
                    Status
                  </p>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-lg text-[11px] font-bold border
                    ${
                      formatStatusDisplay(selectedTrx.status_pesanan) ===
                      'Lunas'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : formatStatusDisplay(selectedTrx.status_pesanan) ===
                            'Selesai'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : formatStatusDisplay(selectedTrx.status_pesanan) ===
                              'Booking'
                            ? 'bg-purple-50 text-purple-600 border-purple-200'
                            : formatStatusDisplay(
                                  selectedTrx.status_pesanan,
                                ) === 'Ditolak'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                    {formatStatusDisplay(selectedTrx.status_pesanan)}
                  </span>
                </div>
              </div>

              {/* Konten Scroll Satu Kolom */}
              <div className='flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50/30'>
                {/* 1. Gambar Bukti Transfer */}
                {selectedTrx.bukti_transfer_url ? (
                  <div className='bg-slate-100/50 rounded-2xl p-4 border border-slate-200 flex flex-col justify-center items-center relative overflow-hidden group min-h-[250px]'>
                    <ImageIcon className='absolute -right-4 -bottom-4 w-32 h-32 text-slate-200/50 group-hover:scale-110 transition-transform duration-700 pointer-events-none' />
                    <p className='absolute top-4 left-4 bg-white/90 backdrop-blur text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 py-1 rounded-full shadow-sm z-10 border border-slate-100'>
                      Bukti Transfer
                    </p>
                    <img
                      src={selectedTrx.bukti_transfer_url}
                      alt='Bukti Transfer'
                      className='w-full max-h-[350px] object-contain rounded-xl shadow-sm relative z-10 group-hover:scale-[1.02] transition-transform duration-500'
                    />
                  </div>
                ) : (
                  <div className='bg-blue-50/50 rounded-2xl p-8 border border-blue-100 flex flex-col justify-center items-center text-center'>
                    <AlertCircle className='w-10 h-10 text-blue-300 mb-3' />
                    <p className='text-sm font-bold text-blue-800'>
                      Belum Ada Bukti Transfer
                    </p>
                    <p className='text-xs text-blue-600 mt-1'>
                      Jamaah ini masih berstatus Booking.
                    </p>
                  </div>
                )}

                {/* 2. Kotak Ringkasan Data */}
                <div className='bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group'>
                  <Wallet className='absolute -left-6 -bottom-6 w-32 h-32 text-slate-50 group-hover:scale-110 transition-transform duration-700 pointer-events-none' />
                  <div className='relative z-10 space-y-4'>
                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <p className='text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1'>
                          Nama Mudhohi
                        </p>
                        <p className='font-bold text-slate-800 text-sm'>
                          {selectedTrx.nama_mudhohi}
                        </p>
                      </div>
                      <div>
                        <p className='text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1'>
                          Kontak WhatsApp
                        </p>
                        <p className='font-semibold text-slate-700 text-sm'>
                          {selectedTrx.whatsapp}
                        </p>
                      </div>
                    </div>
                    <div className='pt-4 border-t border-slate-100 grid grid-cols-2 gap-4'>
                      <div>
                        <p className='text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1'>
                          Hewan Pilihan
                        </p>
                        <p className='font-bold text-teal-700 text-sm'>
                          {selectedTrx.hewan?.jenis} - {selectedTrx.hewan?.tipe}
                        </p>
                      </div>
                      <div>
                        <p className='text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1'>
                          Email Invoice
                        </p>
                        <p className='font-medium text-slate-600 text-xs break-all'>
                          {selectedTrx.email}
                        </p>
                      </div>
                    </div>
                    <div className='pt-4 border-t border-slate-100 flex justify-between items-center'>
                      <p className='text-xs font-bold text-slate-500 uppercase tracking-wider'>
                        Total Bayar
                      </p>
                      <div className='text-right'>
                        <p className='text-2xl font-black text-teal-700'>
                          {formatRp(selectedTrx.total_bayar)}
                        </p>
                        {selectedTrx.hewan && (
                          <p className='text-[10px] font-semibold text-slate-400 mt-0.5'>
                            Termasuk Kode Unik Rp{' '}
                            {selectedTrx.total_bayar - selectedTrx.hewan.harga}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Info Tambahan (Alamat & Request Daging) */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden group'>
                    <MapPin className='absolute -right-3 -bottom-3 w-16 h-16 text-slate-50 group-hover:scale-110 transition-transform duration-700 pointer-events-none' />
                    <div className='relative z-10'>
                      <p className='text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center'>
                        Alamat Domisili
                      </p>
                      <p className='text-sm font-medium text-slate-700 leading-snug'>
                        {selectedTrx.alamat || 'Tidak disertakan'}
                      </p>
                    </div>
                  </div>
                  <div className='bg-blue-50/50 border border-blue-100 rounded-2xl p-5 shadow-sm relative overflow-hidden group'>
                    <PackageOpen className='absolute -right-3 -bottom-3 w-16 h-16 text-blue-50/50 group-hover:scale-110 transition-transform duration-700 pointer-events-none' />
                    <div className='relative z-10'>
                      <p className='text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-2 flex items-center'>
                        Request Hak Daging 1/3
                      </p>
                      <p className='text-sm font-semibold text-blue-900 leading-snug'>
                        {selectedTrx.bagian_sepertiga ||
                          'Disedekahkan sepenuhnya'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ================= 4. PANEL AKSI SESUAI STATUS ================= */}

                {/* AKSI JIKA STATUS MENUNGGU VERIFIKASI */}
                {formatStatusDisplay(selectedTrx.status_pesanan) ===
                  'Menunggu' && (
                  <div className='bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4'>
                    <p className='text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center'>
                      Eksekusi Verifikasi
                    </p>
                    <button
                      onClick={() => handleVerifikasi('Lunas')}
                      disabled={isProcessing}
                      className='w-full bg-teal-700 hover:bg-teal-800 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2.5 transition-all shadow-md shadow-teal-900/10 disabled:opacity-50 text-sm'>
                      {isProcessing ? (
                        <Loader2 className='w-5 h-5 animate-spin' />
                      ) : (
                        <>
                          <CheckCircle className='w-5 h-5' /> Sahkan Pembayaran
                          Lunas
                        </>
                      )}
                    </button>

                    <div className='relative flex items-center py-2'>
                      <div className='flex-grow border-t border-slate-100'></div>
                      <span className='flex-shrink-0 mx-4 text-slate-300 text-[10px] font-bold uppercase'>
                        Atau
                      </span>
                      <div className='flex-grow border-t border-slate-100'></div>
                    </div>

                    <div className='bg-red-50 p-4 rounded-xl border border-red-100 space-y-3'>
                      <p className='text-[10px] font-bold text-red-800 uppercase flex items-center'>
                        <AlertCircle className='w-3 h-3 mr-1.5' /> Opsi
                        Penolakan
                      </p>
                      <input
                        type='text'
                        placeholder='Ketik alasan (misal: Bukti buram/nominal tidak pas)'
                        value={alasanTolak}
                        onChange={(e) => setAlasanTolak(e.target.value)}
                        className='w-full bg-white border border-red-200 rounded-lg px-4 py-2.5 text-sm font-medium outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/20 transition-all placeholder:text-slate-400'
                      />
                      <button
                        onClick={() => handleVerifikasi('Ditolak')}
                        disabled={isProcessing}
                        className='w-full bg-white text-red-600 border border-red-200 hover:bg-red-600 hover:text-white hover:border-red-600 py-2.5 rounded-lg font-bold text-sm flex justify-center items-center gap-2 transition-all disabled:opacity-50'>
                        <XCircle className='w-4 h-4' /> Tolak Pendaftaran
                      </button>
                    </div>
                  </div>
                )}

                {/* AKSI JIKA STATUS LUNAS (FORM PENYEMBELIHAN) */}
                {formatStatusDisplay(selectedTrx.status_pesanan) ===
                  'Lunas' && (
                  <div className='bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 shadow-sm space-y-4'>
                    <div className='flex items-center gap-2 mb-2'>
                      <CheckSquare className='w-5 h-5 text-emerald-600' />
                      <h3 className='font-bold text-emerald-800'>
                        Laporan Penyembelihan
                      </h3>
                    </div>
                    <p className='text-sm text-emerald-700/80 mb-4'>
                      Unggah foto penyembelihan hewan sebagai bukti kepada
                      pequrban, sistem akan otomatis mengirimkan email
                      konfirmasinya.
                    </p>

                    <div className='border-2 border-dashed border-emerald-200 bg-white rounded-xl p-6 text-center hover:bg-emerald-50 transition-colors cursor-pointer relative'>
                      <UploadCloud className='w-8 h-8 text-emerald-500 mx-auto mb-3' />
                      <p className='text-sm font-semibold text-emerald-700'>
                        {fileSembelih
                          ? fileSembelih.name
                          : 'Pilih Foto Penyembelihan Kurban'}
                      </p>
                      <input
                        type='file'
                        accept='image/*'
                        onChange={(e) =>
                          setFileSembelih(e.target.files?.[0] || null)
                        }
                        className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
                      />
                    </div>

                    <button
                      onClick={handleSelesaikanKurban}
                      disabled={isSelesaikanLoading || !fileSembelih}
                      className='w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2.5 transition-all shadow-md shadow-emerald-900/10 disabled:opacity-50 text-sm mt-4'>
                      {isSelesaikanLoading ? (
                        <Loader2 className='w-5 h-5 animate-spin' />
                      ) : (
                        <>
                          <CheckCircle className='w-5 h-5' /> Selesaikan Kurban
                          & Kirim Email
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* INFO JIKA STATUS SELESAI */}
                {formatStatusDisplay(selectedTrx.status_pesanan) ===
                  'Selesai' && (
                  <div className='bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center'>
                    <CheckCircle className='w-12 h-12 text-emerald-500 mx-auto mb-3' />
                    <h3 className='text-lg font-bold text-emerald-800 mb-1'>
                      Kurban Telah Selesai
                    </h3>
                    <p className='text-sm text-emerald-600'>
                      Email bukti penyembelihan sudah berhasil dikirimkan ke
                      pequrban.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
