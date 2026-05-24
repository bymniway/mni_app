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
  Settings,
  ZoomIn,
  X,
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

  // STATE: PENYEMBELIHAN
  const [fileSembelih, setFileSembelih] = useState<File[]>([]);
  // const [fileSembelih, setFileSembelih] = useState<File | null>(null);
  const [isSelesaikanLoading, setIsSelesaikanLoading] = useState(false);

  // STATE: MODAL RESOLUSI & HITUNG DANA
  const [showModalResolusi, setShowModalResolusi] = useState(false);
  const [tipeResolusi, setTipeResolusi] = useState<'batal' | 'pindah' | null>(
    null,
  );
  const [hewanPenggantiId, setHewanPenggantiId] = useState('');
  const [daftarHewanTersedia, setDaftarHewanTersedia] = useState<any[]>([]);
  const [fileRefund, setFileRefund] = useState<File | null>(null);

  // STATE: TRACKER GAMBAR & ZOOM
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  // Reset gambar aktif setiap kali pindah transaksi
  useEffect(() => {
    setActiveImage(null);
  }, [selectedTrx]);

  const fetchPesanan = async (preserveSelectedId?: string) => {
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

  const fetchHewanTersedia = async () => {
    const { data } = await supabase
      .from('hewan')
      .select('*')
      .eq('status', 'Tersedia')
      .order('harga', { ascending: true });
    if (data) setDaftarHewanTersedia(data);
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
    Dibatalkan: pesananList.filter(
      (t) => formatStatusDisplay(t.status_pesanan) === 'Dibatalkan',
    ).length,
  };

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

  // LOGIKA VERIFIKASI UTAMA
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
            const { count, error } = await supabase
              .from('pesanan')
              .select('*', { count: 'exact', head: true })
              .eq('hewan_id', selectedTrx.hewan_id)
              .in('status_pesanan', [
                'Menunggu',
                'Lunas',
                'Selesai',
                'Booking',
                'Terkirim',
              ])
              .limit(0);

            if (error) {
              console.error('Gagal cek kuota admin:', error.message);
            }
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

  // LOGIKA PENYEMBELIHAN
  const handleSelesaikanKurban = async () => {
    if (!selectedTrx || fileSembelih.length === 0) return alert('Pilih foto!');
    setIsSelesaikanLoading(true);
    try {
      // Looping upload semua gambar
      const uploadPromises = fileSembelih.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('bucket', 'mni-assets');
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const { url } = await res.json();
        return url;
      });
      const urls = await Promise.all(uploadPromises);

      if (!urls.length) throw new Error('Gagal mengunggah foto penyembelihan.');

      const response = await fetch('/api/admin/kurban-selesai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idPesanan: selectedTrx.id,
          emailUser: selectedTrx.email,
          namaMudhohi: selectedTrx.nama_mudhohi,
          kodeTrx: selectedTrx.kode_trx,
          detailHewan: `${selectedTrx.hewan?.jenis} - ${selectedTrx.hewan?.tipe}`,

          // PERBAIKAN: Ubah dari urls[0] menjadi urls agar semua gambar tersimpan!
          gambarSembelihUrl: urls,
        }),
      });

      if (!response.ok) throw new Error('Gagal memproses penyelesaian kurban.');

      setFileSembelih([]);
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

  // LOGIKA EKSEKUSI RESOLUSI (BATAL / PINDAH) + UPLOAD REFUND
  const handleEksekusiResolusi = async (tipe: 'batal' | 'pindah' | null) => {
    if (!selectedTrx || !tipe) return;

    // 1. HITUNG DANA RIIL YANG SUDAH MASUK KAS MASJID SEJAUH INI
    const isBookingGres =
      selectedTrx.status_pesanan === 'Booking' &&
      !selectedTrx.bukti_transfer_url;
    const danaTerbayar = isBookingGres
      ? 0
      : selectedTrx.total_bayar - (selectedTrx.kekurangan_dana || 0);

    // 2. KALKULASI SELISIH UNTUK PINDAH HEWAN
    const hewanBaru = daftarHewanTersedia.find(
      (h) => h.id === hewanPenggantiId,
    );
    const hargaBaru = hewanBaru?.harga || 0;
    const selisih = hargaBaru - danaTerbayar; // Selisih murni dari uang yang sudah masuk

    // 3. VALIDASI WAJIB REFUND (Hanya jika masjid benar-benar memegang uang jamaah)
    const isButuhRefund =
      (tipe === 'batal' && danaTerbayar > 0) ||
      (tipe === 'pindah' && selisih < 0);

    if (isButuhRefund && !fileRefund) {
      return alert(
        'Mohon unggah bukti transfer pengembalian dana (Refund) terlebih dahulu!',
      );
    }

    setIsProcessing(true);
    try {
      let bukti_refund_url = '';

      if (fileRefund) {
        const formData = new FormData();
        formData.append('file', fileRefund);
        formData.append('bucket', 'mni-assets');
        const resUpload = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const resultUpload = await resUpload.json();
        if (!resultUpload.url)
          throw new Error('Gagal mengunggah bukti refund.');
        bukti_refund_url = resultUpload.url;
      }

      // 4. PANGGIL API DENGAN VARIABEL DANA TERBAYAR
      const response = await fetch('/api/admin/resolusi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipe_resolusi: tipe,
          id_pesanan: selectedTrx.id,
          id_hewan_lama: selectedTrx.hewan_id,
          id_hewan_baru: hewanPenggantiId,
          email_jamaah: selectedTrx.email,
          nama_jamaah: selectedTrx.nama_mudhohi,
          kode_trx: selectedTrx.kode_trx,
          status_saat_ini: selectedTrx.status_pesanan,
          dana_terbayar: danaTerbayar, // <--- GANTI harga_hewan_lama dengan ini
          bukti_refund_url: bukti_refund_url,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal mengeksekusi resolusi');
      }

      alert(`Aksi ${tipe === 'batal' ? 'Pembatalan' : 'Pindah Hewan'} sukses!`);
      setShowModalResolusi(false);
      setTipeResolusi(null);
      setHewanPenggantiId('');
      setFileRefund(null);
      fetchPesanan(selectedTrx.id);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className='p-4 md:p-6 w-full max-w-[1600px] mx-auto animate-in fade-in h-[calc(100vh-4rem)] flex flex-col'>
      <div className='mb-5 shrink-0'>
        <h1 className='text-2xl md:text-xl font-semibold text-slate-800 tracking-tight'>
          Verifikasi Kurban
        </h1>
        <p className='text-sm text-slate-500 mt-1 font-medium'>
          Cek bukti transfer, laporkan penyembelihan, dan kelola status kurban
          jamaah.
        </p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0'>
        {/* PANEL KIRI: DAFTAR TRANSAKSI */}
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
                'Dibatalkan',
              ].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-lg text-[11px] md:text-xs font-bold transition-all whitespace-nowrap border ${
                    filter === f
                      ? 'bg-teal-600 text-white border-teal-700 shadow-sm'
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-teal-700 hover:border-teal-200'
                  }`}>
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
                    className={`p-4 rounded-xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-teal-50 border-teal-300 shadow-sm ring-1 ring-teal-300/50'
                        : 'bg-white border-slate-200 hover:border-teal-300 hover:shadow-sm'
                    }`}>
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
                                : statusDisp === 'Dibatalkan'
                                  ? 'bg-slate-100 text-slate-600 border-slate-300'
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

        {/* PANEL KANAN: DETAIL & AKSI */}
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
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
                <div className='flex items-center gap-4'>
                  <div className='text-right hidden sm:block'>
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
                            : formatStatusDisplay(
                                  selectedTrx.status_pesanan,
                                ) === 'Booking'
                              ? 'bg-purple-50 text-purple-600 border-purple-200'
                              : formatStatusDisplay(
                                    selectedTrx.status_pesanan,
                                  ) === 'Dibatalkan'
                                ? 'bg-slate-100 text-slate-600 border-slate-300'
                                : formatStatusDisplay(
                                      selectedTrx.status_pesanan,
                                    ) === 'Ditolak'
                                  ? 'bg-red-50 text-red-700 border-red-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                      {formatStatusDisplay(selectedTrx.status_pesanan)}
                    </span>
                  </div>
                  {/* TOMBOL MENU LANJUTAN */}
                  <div className='border-l border-slate-200 pl-4'>
                    <button
                      onClick={() => {
                        fetchHewanTersedia();
                        setShowModalResolusi(true);
                      }}
                      className='p-2 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-lg border border-slate-200 transition-colors'
                      title='Tindakan Lanjutan (Batal/Pindah Hewan)'>
                      <Settings className='w-5 h-5' />
                    </button>
                  </div>
                </div>
              </div>

              {/* Konten Detail */}
              <div className='flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50/30'>
                {/* 1. KOMPONEN TRACKING BUKTI TRANSAKSI */}
                <div className='bg-white rounded-2xl border border-slate-200 shadow-sm p-5'>
                  <h3 className='text-sm font-bold text-slate-800 mb-4 flex items-center gap-2'>
                    <ImageIcon className='w-4 h-4 text-teal-600' /> Dokumen
                    Transaksi
                  </h3>

                  {(() => {
                    const listBukti = [
                      {
                        id: 'awal',
                        label: 'Pendaftaran Awal',
                        url: selectedTrx.bukti_transfer_url,
                        color: 'bg-teal-500',
                      },
                      {
                        id: 'refund',
                        label: 'Refund Panitia',
                        url: selectedTrx.bukti_refund_url,
                        color: 'bg-red-500',
                      },
                      {
                        id: 'tambahan',
                        label: 'Pelunasan Kekurangan',
                        url: selectedTrx.bukti_tf_tambahan_url,
                        color: 'bg-blue-500',
                      },
                    ].filter((b) => b.url);

                    if (listBukti.length === 0) {
                      return (
                        <div className='bg-blue-50/50 rounded-xl p-6 border border-blue-100 flex flex-col justify-center items-center text-center'>
                          <AlertCircle className='w-8 h-8 text-blue-300 mb-2' />
                          <p className='text-sm font-bold text-blue-800'>
                            Belum Ada Dokumen
                          </p>
                          <p className='text-[10px] text-blue-600 mt-1'>
                            Jamaah ini masih berstatus Booking/Dibatalkan.
                          </p>
                        </div>
                      );
                    }

                    // Tentukan gambar yang sedang dilihat
                    const currentImgUrl =
                      activeImage || listBukti[listBukti.length - 1].url;

                    return (
                      <div className='flex flex-col md:flex-row gap-6'>
                        {/* Kiri: Viewer Utama */}
                        <div className='flex-1 relative group'>
                          <div className='bg-slate-100/50 rounded-xl p-2 border border-slate-200 flex justify-center items-center h-[280px] relative overflow-hidden'>
                            <img
                              src={currentImgUrl}
                              alt='Bukti'
                              className='w-full h-full object-contain'
                            />
                            <button
                              onClick={() => setIsZoomed(true)}
                              className='absolute bottom-3 right-3 bg-white/90 backdrop-blur text-slate-700 p-2 rounded-lg shadow-sm border border-slate-200 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-50'>
                              <ZoomIn className='w-4 h-4' />
                            </button>
                          </div>
                        </div>

                        {/* Kanan: Timeline Tracker */}
                        <div className='w-full md:w-48 flex flex-col justify-center'>
                          <div className='border-l-2 border-slate-200 pl-4 space-y-6 relative ml-2'>
                            {listBukti.map((bukti) => (
                              <div
                                key={bukti.id}
                                className='relative'>
                                <div
                                  className={`absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full border-[3px] border-white shadow-sm ${bukti.color}`}></div>
                                <p className='text-xs font-bold text-slate-700 leading-tight'>
                                  {bukti.label}
                                </p>
                                <button
                                  onClick={() => setActiveImage(bukti.url)}
                                  className={`mt-1 text-[10px] px-3 py-1 rounded-md font-bold transition-all ${currentImgUrl === bukti.url ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                                  Lihat Gambar
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* 2. Kotak Ringkasan Data (UPDATE DENGAN LOGIKA SELISIH) */}
                <div className='bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group'>
                  <Wallet className='absolute -left-6 -bottom-6 w-32 h-32 text-slate-50' />
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

                    {/* Rincian Hewan & Selisih Harga */}
                    {/* Rincian Hewan & Selisih Harga */}
                    <div className='pt-4 border-t border-slate-100 space-y-3'>
                      <div>
                        <p className='text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1'>
                          Hewan Terpilih
                        </p>
                        <p className='font-bold text-teal-700 text-sm'>
                          {selectedTrx.hewan?.jenis} - {selectedTrx.hewan?.tipe}
                          <span className='text-slate-500 font-normal ml-1'>
                            ({formatRp(selectedTrx.hewan?.harga)})
                          </span>
                        </p>
                      </div>

                      {/* TAMPILAN MATEMATIKA SELARAS & HILANG SAAT LUNAS */}
                      {selectedTrx.kekurangan_dana > 0 &&
                        selectedTrx.status_pesanan !== 'Lunas' && (
                          <div className='bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1.5 shadow-sm'>
                            <div className='flex justify-between'>
                              <span>Harga Hewan Baru:</span>
                              <span className='font-medium'>
                                Rp{' '}
                                {selectedTrx.total_bayar.toLocaleString(
                                  'id-ID',
                                )}
                              </span>
                            </div>
                            <div className='flex justify-between'>
                              <span>Dana Terdahulu:</span>
                              <span className='font-medium text-emerald-600'>
                                - Rp{' '}
                                {(
                                  selectedTrx.total_bayar -
                                  selectedTrx.kekurangan_dana
                                ).toLocaleString('id-ID')}
                              </span>
                            </div>
                            <div className='flex justify-between border-t border-slate-200 pt-1.5 mt-1.5 font-bold text-orange-600'>
                              <span>Sisa Kekurangan:</span>
                              <span>
                                Rp{' '}
                                {selectedTrx.kekurangan_dana.toLocaleString(
                                  'id-ID',
                                )}
                              </span>
                            </div>
                          </div>
                        )}
                    </div>

                    <div className='pt-4 border-t border-slate-100 flex justify-between items-center'>
                      <p className='text-xs font-bold text-slate-500 uppercase tracking-wider'>
                        Total Tagihan Sekarang
                      </p>
                      <div className='text-right'>
                        <p className='text-2xl font-black text-teal-700'>
                          {formatRp(selectedTrx.total_bayar)}
                        </p>
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

                {/* AKSI: JIKA STATUS BOOKING */}
                {formatStatusDisplay(selectedTrx.status_pesanan) ===
                  'Booking' && (
                  <div className='bg-blue-50 border border-blue-200 rounded-2xl p-5 shadow-sm text-center'>
                    <Clock className='w-10 h-10 text-blue-400 mx-auto mb-3' />
                    <h3 className='font-bold text-blue-800 mb-1'>
                      Menunggu Pembayaran Jamaah
                    </h3>
                    <p className='text-xs text-blue-600 leading-relaxed'>
                      Jamaah sedang dalam proses pembayaran (Awal / Kekurangan
                      Dana). Sistem akan otomatis berubah menjadi Menunggu jika
                      jamaah sudah mengunggah bukti transfer.
                    </p>
                    <p className='text-[10px] font-bold text-blue-500 mt-3'>
                      *Gunakan ikon Gear (⚙️) di sudut kanan atas jika ingin
                      membatalkan transaksi secara manual.
                    </p>
                  </div>
                )}

                {/* 4. AKSI: MENUNGGU VERIFIKASI */}
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
                        <AlertCircle className='w-3 h-3 mr-1.5' /> Tolak Bukti
                        Transfer
                      </p>
                      <input
                        type='text'
                        placeholder='Alasan (misal: Bukti buram)'
                        value={alasanTolak}
                        onChange={(e) => setAlasanTolak(e.target.value)}
                        className='w-full bg-white border border-red-200 rounded-lg px-4 py-2.5 text-sm font-medium outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/20'
                      />
                      <button
                        onClick={() => handleVerifikasi('Ditolak')}
                        disabled={isProcessing}
                        className='w-full bg-white text-red-600 border border-red-200 hover:bg-red-600 hover:text-white py-2.5 rounded-lg font-bold text-sm flex justify-center items-center gap-2 transition-all disabled:opacity-50'>
                        <XCircle className='w-4 h-4' /> Tolak
                      </button>
                    </div>
                  </div>
                )}

                {/* 5. AKSI: LUNAS (FORM PENYEMBELIHAN) */}
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
                      Unggah foto penyembelihan untuk dikirim via email.
                    </p>

                    <div className='border-2 border-dashed border-emerald-200 bg-white rounded-xl p-6 text-center hover:bg-emerald-50 transition-colors cursor-pointer relative'>
                      <UploadCloud className='w-8 h-8 text-emerald-500 mx-auto mb-3' />
                      <p className='text-sm font-semibold text-emerald-700'>
                        {fileSembelih.length > 0
                          ? `${fileSembelih.length} Foto Dipilih`
                          : 'Pilih Foto Kurban (Bisa Lebih Dari 1)'}
                      </p>
                      <input
                        type='file'
                        accept='image/*'
                        multiple // <--- Tambahkan atribut multiple
                        onChange={(e) =>
                          setFileSembelih(Array.from(e.target.files || []))
                        }
                        className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
                      />
                    </div>
                    {/* <div className='border-2 border-dashed border-emerald-200 bg-white rounded-xl p-6 text-center hover:bg-emerald-50 transition-colors cursor-pointer relative'>
                      <UploadCloud className='w-8 h-8 text-emerald-500 mx-auto mb-3' />
                      <p className='text-sm font-semibold text-emerald-700'>
                        {fileSembelih ? fileSembelih.name : 'Pilih Foto Kurban'}
                      </p>
                      <input
                        type='file'
                        accept='image/*'
                        onChange={(e) =>
                          setFileSembelih(e.target.files?.[0] || null)
                        }
                        className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
                      />
                    </div> */}
                    <button
                      onClick={handleSelesaikanKurban}
                      disabled={isSelesaikanLoading || !fileSembelih}
                      className='w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2.5 transition-all shadow-md shadow-emerald-900/10 disabled:opacity-50 text-sm mt-4'>
                      {isSelesaikanLoading ? (
                        <Loader2 className='w-5 h-5 animate-spin' />
                      ) : (
                        <>
                          <CheckCircle className='w-5 h-5' /> Selesaikan & Kirim
                          Email
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ================= MODAL TINDAKAN LANJUTAN (BATAL / PINDAH HEWAN) ================= */}
      {showModalResolusi && selectedTrx && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in'>
          <div className='bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden'>
            <div className='p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50'>
              <h3 className='font-bold text-slate-800 flex items-center gap-2'>
                <AlertCircle className='w-5 h-5 text-red-500' /> Tindakan
                Lanjutan
              </h3>
              <button
                onClick={() => setShowModalResolusi(false)}
                className='text-slate-400 hover:text-red-500'>
                <XCircle className='w-5 h-5' />
              </button>
            </div>

            <div className='p-6 space-y-5 max-h-[70vh] overflow-y-auto'>
              <div className='grid grid-cols-2 gap-3'>
                <button
                  onClick={() => {
                    setTipeResolusi('pindah');
                    setHewanPenggantiId('');
                  }}
                  className={`py-3 rounded-xl border-2 font-bold text-sm transition-all ${tipeResolusi === 'pindah' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-slate-200 text-slate-500 hover:border-orange-200'}`}>
                  Pindah Hewan
                </button>
                <button
                  onClick={() => setTipeResolusi('batal')}
                  className={`py-3 rounded-xl border-2 font-bold text-sm transition-all ${tipeResolusi === 'batal' ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-200 text-slate-500 hover:border-red-200'}`}>
                  Batal & Refund
                </button>
              </div>

              {/* LOGIKA PINDAH HEWAN */}
              {tipeResolusi === 'pindah' && (
                <div className='space-y-4 animate-in slide-in-from-top-2'>
                  <div>
                    <label className='text-xs font-bold text-slate-500 uppercase mb-2 block'>
                      Pilih Hewan Pengganti
                    </label>
                    <select
                      className='w-full p-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none'
                      value={hewanPenggantiId}
                      onChange={(e) => setHewanPenggantiId(e.target.value)}>
                      <option value=''>
                        -- Pilih Hewan (Dari Katalog Tersedia) --
                      </option>
                      {daftarHewanTersedia.map((h) => (
                        <option
                          key={h.id}
                          value={h.id}>
                          {h.jenis} {h.tipe} - {h.berat}kg (Rp{' '}
                          {h.harga.toLocaleString('id-ID')})
                        </option>
                      ))}
                    </select>
                  </div>

                  {hewanPenggantiId &&
                    (() => {
                      const hewanBaru = daftarHewanTersedia.find(
                        (h) => h.id === hewanPenggantiId,
                      );

                      // Gunakan logika yang sama dengan fungsi eksekusi di atas
                      const isBookingGres =
                        selectedTrx.status_pesanan === 'Booking' &&
                        !selectedTrx.bukti_transfer_url;
                      const danaTerbayar = isBookingGres
                        ? 0
                        : selectedTrx.total_bayar -
                          (selectedTrx.kekurangan_dana || 0);

                      const hargaBaru = hewanBaru?.harga || 0;
                      const selisih = hargaBaru - danaTerbayar;

                      return (
                        <div className='bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2'>
                          <div className='flex justify-between text-sm'>
                            <span className='text-slate-500'>
                              Dana Terbayar:
                            </span>
                            <span className='font-medium'>
                              Rp {danaTerbayar.toLocaleString('id-ID')}
                            </span>
                          </div>
                          <div className='flex justify-between text-sm'>
                            <span className='text-slate-500'>
                              Harga Hewan Baru:
                            </span>
                            <span className='font-medium text-orange-600'>
                              Rp {hargaBaru.toLocaleString('id-ID')}
                            </span>
                          </div>
                          <div className='pt-2 border-t border-slate-200 flex justify-between items-center'>
                            <span className='text-xs font-bold uppercase text-slate-800'>
                              Status Selisih:
                            </span>
                            <span
                              className={`font-black text-lg ${selisih > 0 ? 'text-red-600' : selisih < 0 ? 'text-emerald-600' : 'text-slate-600'}`}>
                              {selisih > 0
                                ? `Kurang Rp ${selisih.toLocaleString('id-ID')}`
                                : selisih < 0
                                  ? `Kelebihan Rp ${Math.abs(selisih).toLocaleString('id-ID')}`
                                  : 'PAS (Sesuai)'}
                            </span>
                          </div>

                          {/* Input file refund otomatis tersembunyi jika danaTerbayar adalah 0 */}
                          {selisih < 0 && (
                            <div className='mt-4 pt-4 border-t border-slate-200'>
                              <label className='text-xs font-bold text-slate-700 mb-1 block'>
                                Upload Bukti Pengembalian Kelebihan Dana (Wajib)
                              </label>
                              <input
                                type='file'
                                accept='image/*'
                                onChange={(e) =>
                                  setFileRefund(e.target.files?.[0] || null)
                                }
                                className='w-full text-xs file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-emerald-100 file:text-emerald-700 hover:file:bg-emerald-200 cursor-pointer outline-none'
                              />
                            </div>
                          )}
                        </div>
                      );
                    })()}
                </div>
              )}

              {/* LOGIKA BATAL */}
              {tipeResolusi === 'batal' && (
                <div className='bg-red-50 p-4 rounded-xl border border-red-100 animate-in slide-in-from-top-2'>
                  <p className='text-sm text-red-800 font-medium mb-2'>
                    Anda akan membatalkan pesanan atas nama{' '}
                    <b>{selectedTrx.nama_mudhohi}</b>.
                  </p>
                  <div className='mt-4 pt-4 border-t border-red-200'>
                    <label className='text-xs font-bold text-red-800 mb-1 block'>
                      Upload Bukti Transfer Refund (Wajib)
                    </label>
                    <input
                      type='file'
                      accept='image/*'
                      onChange={(e) =>
                        setFileRefund(e.target.files?.[0] || null)
                      }
                      className='w-full text-xs file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-red-200 file:text-red-800 hover:file:bg-red-300 cursor-pointer outline-none'
                    />
                  </div>
                </div>
              )}
            </div>

            <div className='p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3'>
              <button
                onClick={() => setShowModalResolusi(false)}
                className='px-5 py-2.5 rounded-lg text-sm font-bold text-slate-500 bg-white border border-slate-200 hover:bg-slate-100'>
                Batal
              </button>
              <button
                disabled={
                  isProcessing ||
                  !tipeResolusi ||
                  (tipeResolusi === 'pindah' && !hewanPenggantiId)
                }
                onClick={() => handleEksekusiResolusi(tipeResolusi)}
                className='px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2'>
                {isProcessing ? (
                  <Loader2 className='w-4 h-4 animate-spin' />
                ) : (
                  <CheckCircle className='w-4 h-4' />
                )}
                Konfirmasi & Kirim Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ZOOM GAMBAR */}
      {isZoomed && activeImage && (
        <div className='fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in'>
          <button
            onClick={() => setIsZoomed(false)}
            className='absolute top-6 right-6 text-white/50 hover:text-white transition-colors bg-white/10 p-2 rounded-full'>
            <X className='w-6 h-6' />
          </button>
          <img
            src={activeImage}
            alt='Zoomed Bukti'
            className='max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl'
          />
        </div>
      )}
    </div>
  );
}
