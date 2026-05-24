'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  UploadCloud,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ImageIcon,
  WalletCards,
  Receipt,
  MessageCircle,
  FileText, // Icon untuk Daftar
  UserCheck, // Icon untuk Verifikasi
  CircleCheckBig, // Icon untuk Lunas
  XCircle, // Icon untuk status Batal
} from 'lucide-react';

// ==========================================
// DESAIN STEP TRACKER PREMIUM & PROFESIONAL
// ==========================================
const PremiumStepTracker = ({ status }: { status: string }) => {
  const steps = [
    { id: 1, label: 'Pendaftaran', desc: 'Booking via Web', icon: FileText },
    { id: 2, label: 'Verifikasi', desc: 'Pengecekan Dana', icon: UserCheck },
    {
      id: 3,
      label: 'Lunas',
      desc: 'Kurban Terkonfirmasi',
      icon: CircleCheckBig,
    },
  ];

  const isCancelled = status === 'Dibatalkan';

  const getCurrentStep = () => {
    if (status === 'Lunas' || status === 'Selesai') return 3;
    if (status === 'Menunggu') return 2;
    return 1;
  };

  const currentStep = getCurrentStep();

  // Jika dibatalkan, progress tetap 0, tapi ditandai merah
  const progressWidth = isCancelled
    ? '0%'
    : currentStep === 1
      ? '0%'
      : currentStep === 2
        ? '50%'
        : '100%';

  return (
    <div className='w-full py-4 sm:py-6 px-1'>
      <div className='relative'>
        {/* 1. Garis Progress Latar */}
        <div className='absolute top-4 sm:top-5 left-0 right-0 h-0.5 bg-slate-100 rounded-full' />

        {/* 2. Garis Progress Aktif */}
        <div
          className={`absolute top-4 sm:top-5 left-0 h-0.5 rounded-full transition-all duration-700 ease-in-out ${isCancelled ? 'bg-rose-500' : 'bg-teal-600 shadow-[0_0_8px_rgba(13,148,136,0.4)]'}`}
          style={{ width: progressWidth }}
        />

        {/* 3. Titik & Label Status */}
        <div className='relative flex justify-between z-10'>
          {steps.map((step) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.id && !isCancelled;
            const isActive = currentStep === step.id;

            return (
              <div
                key={step.id}
                className='flex flex-col items-center group w-1/3'>
                {/* Lingkaran Indikator */}
                <div
                  className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-all duration-500 shadow-sm  ${
                    isCompleted
                      ? 'bg-teal-600 border-emerald-500 text-white'
                      : isActive && isCancelled
                        ? 'bg-rose-500 border-rose-700 text-white ring-4 ring-rose-50'
                        : isActive
                          ? 'bg-white border-teal-600 text-teal-600 ring-4 ring-teal-50'
                          : 'bg-white border-slate-200 text-slate-300'
                  }`}>
                  {isCompleted ? (
                    <Check className='w-4 h-4 sm:w-5 sm:h-5 animate-in zoom-in duration-300' />
                  ) : isActive && isCancelled ? (
                    <XCircle className='w-4 h-4 sm:w-5 sm:h-5 animate-in zoom-in duration-300' />
                  ) : (
                    <Icon
                      className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'animate-pulse' : ''}`}
                    />
                  )}
                </div>

                {/* Teks Label - Responsif */}
                <div className='text-center mt-2 sm:mt-3 space-y-0.5'>
                  <p
                    className={`text-[9px] sm:text-[11px] font-bold uppercase tracking-wider transition-colors duration-300 ${
                      isCompleted || isActive
                        ? isCancelled
                          ? 'text-rose-600'
                          : 'text-teal-700'
                        : 'text-slate-400'
                    }`}>
                    {isCancelled && isActive ? 'Dibatalkan' : step.label}
                  </p>
                  <p className='hidden sm:block text-[9px] font-medium text-slate-400 leading-tight'>
                    {isCancelled && isActive ? 'Transaksi Hangus' : step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// KOMPONEN UTAMA HALAMAN KONFIRMASI
// ==========================================
export default function KonfirmasiPage() {
  const searchParams = useSearchParams();
  const hewanId = searchParams.get('hewanId');
  const [kodeTrx, setKodeTrx] = useState('');
  const [pesanan, setPesanan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [rekeningTujuan, setRekeningTujuan] = useState(
    'Bank BSI 7331949738 a.n Masjid Nurul Iman LAN',
  );

  const eksekusiCariPesanan = useCallback(async (kode: string) => {
    if (!kode) return;
    setIsLoading(true);
    setPesanan(null);
    setFile(null);

    try {
      const { data, error } = await supabase
        .from('pesanan')
        .select('*, hewan(jenis, tipe, harga)')
        .eq('kode_trx', kode.trim().toUpperCase())
        .single();

      if (error || !data) throw new Error('Pesanan tidak ditemukan.');
      setPesanan(data);
    } catch (error: any) {
      alert(error.message || 'Terjadi kesalahan saat mencari.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const trx = searchParams.get('trx');
    if (trx) {
      setKodeTrx(trx);
      eksekusiCariPesanan(trx);
    }
  }, [searchParams, eksekusiCariPesanan]);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);
  // 1. Simpan rekening di state global komponen

  // 2. Efek untuk mengambil rekening (Jalankan saat pesanan ditemukan)
  useEffect(() => {
    const fetchRekening = async () => {
      try {
        const { data, error } = await supabase
          .from('pengaturan_web')
          .select('nilai')
          .eq('kunci', 'kurban_rekening')
          .single();

        if (data) setRekeningTujuan(data.nilai);
      } catch (err) {
        console.error('Gagal ambil rekening:', err);
      }
    };

    fetchRekening();
  }, []); // Jalankan cukup sekali saat halaman dimuat

  const handleUpload = async () => {
    if (!file || !pesanan)
      return alert('Silakan pilih foto bukti transfer terlebih dahulu!');
    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('pesananId', pesanan.id);

    try {
      const response = await fetch('/api/konfirmasi', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setPesanan({
          ...pesanan,
          status_pesanan: 'Menunggu',
          ...(pesanan.bukti_transfer_url
            ? { bukti_tf_tambahan_url: result.url }
            : { bukti_transfer_url: result.url }),
        });
      } else {
        alert(`Gagal: ${result.error}`);
      }
    } catch (error) {
      console.error(error);
      alert('Gagal menghubungi server untuk mengunggah bukti transfer.');
    } finally {
      setIsUploading(false);
    }
  };

  const getWaLink = () => {
    if (!pesanan) return '#';
    const msg = `Halo Panitia Kurban MNI, saya ${pesanan.nama_mudhohi}, terkait transaksi ${pesanan.kode_trx} dengan status ${pesanan.status_pesanan}. Mohon bantuannya.`;
    return `https://wa.me/6281234567890?text=${encodeURIComponent(msg)}`;
  };

  // Helper untuk format tanggal yang aman dari Invalid Date
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '-';
    }
  };

  return (
    <div className='min-h-screen bg-[#F8FAFC] py-8 sm:py-12 px-4 sm:px-6 font-sans selection:bg-teal-100 selection:text-teal-900'>
      <div className='max-w-xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out'>
        {/* Header Section */}
        <div className='text-center space-y-1.5 sm:space-y-2 print:hidden'>
          <h1 className='text-2xl sm:text-[28px] leading-tight font-extrabold text-teal-600 tracking-tight'>
            Konfirmasi Pembayaran
          </h1>
          <p className='text-xs sm:text-[15px] text-slate-500 font-medium'>
            Lengkapi proses pendaftaran kurban Anda.
          </p>
        </div>

        {/* Search Bar - Responsif */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            eksekusiCariPesanan(kodeTrx);
          }}
          className='relative flex items-center shadow-sm rounded-xl sm:rounded-2xl bg-white transition-all focus-within:shadow-md focus-within:ring-1 focus-within:ring-teal-500/20 print:hidden border border-slate-200/80'>
          <Search className='absolute left-4 sm:left-5 w-4 h-4 sm:w-5 sm:h-5 text-slate-400' />
          <input
            type='text'
            value={kodeTrx}
            onChange={(e) => setKodeTrx(e.target.value)}
            placeholder='Masukkan Kode QRB-MNI'
            className='w-full bg-transparent border-none py-3.5 sm:py-4 pl-10 sm:pl-14 pr-24 sm:pr-32 text-sm sm:text-[15px] font-semibold text-teal-700 placeholder:text-slate-400 focus:ring-0 uppercase outline-none'
            required
          />
          <div className='absolute right-1.5 sm:right-2'>
            <button
              type='submit'
              disabled={isLoading}
              className='bg-teal-600 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm hover:bg-teal-700 transition-all active:scale-95 flex items-center justify-center min-w-[60px] sm:min-w-[80px]'>
              {isLoading ? (
                <Loader2 className='w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin' />
              ) : (
                'Cari'
              )}
            </button>
          </div>
        </form>

        {/* STATE: LOADING SKELETON */}
        {isLoading && !pesanan && (
          <div className='bg-white rounded-2xl sm:rounded-[28px] p-5 sm:p-8 shadow-sm border border-slate-100 animate-pulse print:hidden'>
            <div className='flex justify-between items-center mb-8'>
              <div className='space-y-2'>
                <div className='h-3 w-20 sm:w-24 bg-slate-200 rounded-full'></div>
                <div className='h-5 sm:h-6 w-32 sm:w-48 bg-slate-200 rounded-full'></div>
              </div>
              <div className='h-5 sm:h-6 w-16 sm:w-20 bg-slate-200 rounded-full'></div>
            </div>
            <div className='h-20 sm:h-24 w-full bg-slate-100 rounded-xl sm:rounded-2xl'></div>
          </div>
        )}

        {/* STATE: DATA DITEMUKAN */}
        {pesanan && !isLoading && (
          <div className='bg-white rounded-2xl sm:rounded-[28px] p-5 sm:p-8 shadow-sm border border-slate-100 space-y-6 sm:space-y-8 animate-in fade-in zoom-in-95 duration-500 ease-out print:shadow-none print:border-none print:p-0'>
            {/* INJEKSI STEP TRACKER BARU */}
            <div className='flex justify-between items-start sm:items-center pb-4 border-b border-slate-100'>
              <div>
                <p className='text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest'>
                  No. Pesanan
                </p>
                <p className='text-sm sm:text-base font-bold text-teal-700 font-mono tracking-wide'>
                  {pesanan.kode_trx}
                </p>
              </div>
              <div className='text-right'>
                <div className='sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto  sm:mt-0'>
                  <span
                    className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-md sm:rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider border ${
                      pesanan.status_pesanan === 'Booking'
                        ? 'bg-slate-50 text-slate-600 border-slate-200'
                        : pesanan.status_pesanan === 'Menunggu'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : pesanan.status_pesanan === 'Lunas' ||
                              pesanan.status_pesanan === 'Selesai'
                            ? 'bg-emerald-50 text-teal-600 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                    {pesanan.status_pesanan}
                  </span>
                  {/* Info Tanggal Realtime (Aman dari Invalid Date) */}
                  <p className='text-[9px] sm:text-[10px] text-slate-400 mt-2 sm:mt-2 font-medium pr-3 sm:pl-3'>
                    Diperbarui: {formatDate(pesanan.updated_at)}
                  </p>
                </div>
              </div>
            </div>
            <div className='w-full block border-b border-slate-100 pb-2 sm:mb-4'>
              <PremiumStepTracker status={pesanan.status_pesanan} />
            </div>

            {/* Informasi Pekurban - Responsif (Flex Wrap) */}
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 ml-1 sm:ml-2'>
              <div className='space-y-0.5 sm:space-y-1'>
                <p className='text-[10px] sm:text-[11px] font-bold uppercase text-slate-400 tracking-widest'>
                  Shohibul Kurban
                </p>
                <p className='text-lg sm:text-xl font-bold text-teal-700 tracking-tight'>
                  {pesanan.nama_mudhohi}
                </p>
                <p className='text-xs sm:text-sm text-slate-500 font-medium'>
                  {pesanan.hewan.jenis} - {pesanan.hewan.tipe}
                </p>
              </div>
              {/* <div className='flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto mt-2 sm:mt-0'>
                <span
                  className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-md sm:rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider border ${
                    pesanan.status_pesanan === 'Booking'
                      ? 'bg-slate-50 text-slate-600 border-slate-200'
                      : pesanan.status_pesanan === 'Menunggu'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : pesanan.status_pesanan === 'Lunas' ||
                            pesanan.status_pesanan === 'Selesai'
                          ? 'bg-emerald-50 text-teal-600 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                  {pesanan.status_pesanan}
                </span>
                {/* Info Tanggal Realtime (Aman dari Invalid Date) */}
              {/* <p className='text-[9px] sm:text-[10px] text-slate-400 sm:mt-2 font-medium'>
                  Diperbarui: {formatDate(pesanan.updated_at)}
                </p> */}
              {/* </div>  */}
            </div>

            {/* RINCIAN TAGIHAN */}
            <div className='relative bg-[#F8FAFC] rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-slate-100 overflow-hidden group'>
              {/* Ikon Receipt Responsif */}
              <Receipt className='absolute -right-4 -bottom-4 sm:-right-6 sm:-bottom-6 w-32 h-32 sm:w-40 sm:h-40 text-slate-200/50 transform group-hover:scale-110 group-hover:-rotate-3 transition-all duration-1000 ease-out z-0 pointer-events-none' />

              <div className='relative z-10'>
                {pesanan.kekurangan_dana > 0 &&
                pesanan.status_pesanan !== 'Lunas' ? (
                  <>
                    <div className='space-y-2.5 sm:space-y-3 mb-4 sm:mb-5'>
                      <div className='flex justify-between items-center text-xs sm:text-[14px]'>
                        <span className='text-slate-500 font-medium'>
                          Harga Kurban
                        </span>
                        <span className='font-bold text-slate-800'>
                          Rp {pesanan.total_bayar.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className='flex justify-between items-center text-xs sm:text-[14px]'>
                        <span className='text-slate-500 font-medium'>
                          Dana Terdahulu
                        </span>
                        <span className='font-bold text-teal-600'>
                          - Rp{' '}
                          {(
                            pesanan.total_bayar - pesanan.kekurangan_dana
                          ).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                    <div className='border-t border-dashed border-slate-300 pt-3 sm:pt-4 flex items-center justify-between'>
                      <p className='text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest'>
                        Sisa Tagihan
                      </p>
                      <div className='text-right'>
                        <p className='text-xl sm:text-[24px] leading-none font-bold text-slate-900 tracking-tight'>
                          Rp {pesanan.kekurangan_dana.toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className='flex items-center justify-between'>
                    <p className='text-[9px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest'>
                      Total Nilai Kurban
                    </p>
                    <div className='flex flex-col items-end'>
                      <p className='text-[17px] sm:text-[28px] leading-none font-bold text-slate-900 tracking-tight'>
                        Rp {pesanan.total_bayar.toLocaleString('id-ID')}
                      </p>
                      {pesanan.status_pesanan === 'Lunas' && (
                        <div className='inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 mt-1.5 sm:mt-2 bg-emerald-100/50 rounded-md border border-emerald-200/50 backdrop-blur-sm'>
                          <CheckCircle2 className='w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600' />
                          <span className='text-[9px] sm:text-[10px] font-bold text-teal-600 uppercase tracking-wider'>
                            Terverifikasi
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* AREA AKSI: Dinamis Berdasarkan Status */}
            {pesanan.status_pesanan === 'Dibatalkan' ? (
              // AKSI JIKA DIBATALKAN (BARU)
              <div className='pt-6 pb-2 text-center space-y-4 animate-in slide-in-from-bottom-2 duration-500 print:hidden'>
                <div className='w-16 h-16 sm:w-20 sm:h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-2 border border-rose-100/50 shadow-inner'>
                  <XCircle className='w-8 h-8 sm:w-10 sm:h-10 text-rose-500' />
                </div>
                <h3 className='text-lg sm:text-2xl font-bold text-slate-900 tracking-tight'>
                  Transaksi Dibatalkan
                </h3>
                <p className='text-xs sm:text-[15px] leading-relaxed text-slate-600 font-medium max-w-[320px] mx-auto'>
                  Mohon maaf, pemesanan kurban ini telah dibatalkan. Jika
                  terdapat kekeliruan, silakan hubungi admin masjid.
                </p>
              </div>
            ) : pesanan.status_pesanan === 'Booking' ||
              pesanan.status_pesanan === 'Ditolak' ? (
              // AKSI JIKA BOOKING / DITOLAK (UPLOAD)
              <div className='space-y-4 sm:space-y-6 print:hidden animate-in fade-in duration-500'>
                {/* Info Rekening Bank Widget */}
                <div className='flex items-center justify-between p-3 sm:p-4 bg-white border border-slate-200 rounded-xl sm:rounded-2xl shadow-sm hover:bg-slate-50/80 transition-colors'>
                  <div className='flex items-center gap-3'>
                    <div className='w-9 h-9 sm:w-11 sm:h-11 bg-teal-50 rounded-full flex items-center justify-center border border-teal-100/50 shadow-inner'>
                      <WalletCards className='w-4 h-4 sm:w-5 sm:h-5 text-teal-600' />
                    </div>
                    <div>
                      <p className='text-[9px] sm:text-[13px] font-bold text-slate-500 uppercase  mb-0.5'>
                        {rekeningTujuan}
                      </p>
                      {/* <p className='text-sm sm:text-[17px] font-bold text-slate-800 tracking-wide font-mono'>
                        1934339080
                      </p> */}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const angkaSaja = rekeningTujuan.replace(/\D/g, '');
                      if (angkaSaja) {
                        navigator.clipboard.writeText(angkaSaja);
                        setIsCopied(true);
                        setTimeout(() => setIsCopied(false), 2000);
                      }
                    }}
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center transition-all active:scale-90 ${isCopied ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'}`}
                    title='Salin Rekening'>
                    {isCopied ? (
                      <Check className='w-4 h-4' />
                    ) : (
                      <Copy className='w-4 h-4' />
                    )}
                  </button>
                </div>

                {/* Pesan Konteks */}
                <div className='flex gap-2 sm:gap-3 items-start px-2 bg-amber-50/50 border border-amber-100 p-3 sm:p-4 rounded-xl text-amber-900'>
                  <AlertCircle className='w-4 h-4 sm:w-5 sm:h-5 text-amber-500 shrink-0 mt-0.5' />
                  <p className='text-xs sm:text-[13px] leading-relaxed font-medium'>
                    Silakan transfer nominal di atas ke rekening tujuan, lalu
                    unggah foto struknya di bawah.
                  </p>
                </div>

                {/* Upload Area */}
                <div className='relative overflow-hidden group'>
                  <input
                    type='file'
                    accept='image/*'
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className='absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20'
                  />
                  <div
                    className={`w-full border-2 border-dashed rounded-xl sm:rounded-[24px] transition-all duration-300 flex flex-col items-center justify-center overflow-hidden relative z-10 ${previewUrl ? 'border-transparent bg-slate-50 p-1 sm:p-2' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 p-6 sm:p-8 min-h-[140px] sm:min-h-[170px]'}`}>
                    {previewUrl ? (
                      <div className='relative w-full h-[180px] sm:h-[220px] rounded-lg sm:rounded-[18px] overflow-hidden bg-white shadow-sm border border-slate-200/50'>
                        <img
                          src={previewUrl}
                          className='w-full h-full object-cover opacity-95 ' //p-1 sm:p-2
                          alt='Preview Slip'
                        />
                        <div className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/10'>
                          <span className='bg-white text-slate-800 text-[10px] sm:text-xs font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-md'>
                            Ganti Gambar
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className='text-center space-y-2 sm:space-y-3 pointer-events-none'>
                        <div className='w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto border border-slate-100'>
                          <ImageIcon className='w-4 h-4 sm:w-5 sm:h-5 text-teal-600' />
                        </div>
                        <div>
                          <p className='text-xs sm:text-[14px] font-bold text-slate-600'>
                            Pilih Foto Bukti Transfer
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleUpload}
                  disabled={isUploading || !file}
                  className='w-full bg-teal-600 text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-[13px] sm:text-[15px] shadow-sm hover:bg-teal-700 disabled:opacity-50 transition-all active:scale-95 flex justify-center items-center gap-2'>
                  {isUploading ? (
                    <Loader2 className='w-4 h-4 sm:w-5 sm:h-5 animate-spin' />
                  ) : (
                    <UploadCloud className='w-4 h-4 sm:w-5 sm:h-5' />
                  )}
                  Konfirmasi Pembayaran
                </button>
              </div>
            ) : (
              // AKSI JIKA MENUNGGU / LUNAS
              <div className='pt-6 sm:pt-8 pb-2 sm:pb-4 text-center space-y-4 sm:space-y-5 animate-in slide-in-from-bottom-2 duration-500 print:hidden'>
                <div className='w-16 h-16 sm:w-20 sm:h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-2 border border-emerald-100/50 shadow-inner'>
                  <CheckCircle2 className='w-8 h-8 sm:w-10 sm:h-10 text-teal-600' />
                </div>
                <h3 className='text-lg sm:text-2xl font-bold text-slate-900 tracking-tight'>
                  {pesanan.status_pesanan === 'Lunas'
                    ? 'Kurban Terkonfirmasi'
                    : 'Dokumen Diterima'}
                </h3>
                <p className='text-xs sm:text-[15px] leading-relaxed text-slate-600 font-medium max-w-[280px] sm:max-w-[320px] mx-auto'>
                  {pesanan.status_pesanan === 'Lunas'
                    ? 'Pendaftaran kurban Anda telah lunas diverifikasi. Semoga Allah menerima amal ibadah Anda.'
                    : 'Bukti transfer Anda telah aman tersimpan. Mohon tunggu proses verifikasi mutasi bank oleh admin panitia.'}
                </p>
              </div>
            )}

            {/* WA Help Section */}
            <div className='border-t border-slate-100 pt-5 sm:pt-6 mt-6 sm:mt-8 text-center'>
              <a
                href={getWaLink()}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-600 hover:text-teal-700 transition-colors text-[11px] sm:text-sm font-semibold border border-slate-100'>
                <MessageCircle className='w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500' />{' '}
                Kendala? Chat Admin
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
