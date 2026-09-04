'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Loader2,
  AlertCircle,
  FileText,
  UserCheck,
  CircleCheckBig,
  XCircle,
  ArrowRight,
  Receipt,
  Users,
  Timer,
  PackageOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  History,
  Check,
  X,
} from 'lucide-react';

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
};

const cleanUrl = (url: string) => {
  if (!url) return '';
  return url.replace(/["']/g, '').trim();
};

const ImageCarousel = ({ rawUrlData }: { rawUrlData: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fullscreenScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rawUrlData) return;

    const cleanUrlStr = (url: string) => url?.replace(/["']/g, '').trim();

    try {
      const parsed = JSON.parse(rawUrlData);
      if (Array.isArray(parsed)) {
        setImages(parsed.map(cleanUrlStr));
      } else if (typeof parsed === 'string') {
        setImages([cleanUrlStr(parsed)]);
      } else {
        setImages([cleanUrlStr(rawUrlData)]);
      }
    } catch {
      setImages([cleanUrlStr(rawUrlData)]);
    }
  }, [rawUrlData]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollPosition = container.scrollLeft;
    const width = container.clientWidth;
    const newIndex = Math.round(scrollPosition / width);
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  };

  const scrollTo = (index: number, isFs: boolean = false) => {
    const ref = isFs ? fullscreenScrollRef : scrollContainerRef;
    if (ref.current) {
      const width = ref.current.clientWidth;
      ref.current.scrollTo({
        left: index * width,
        behavior: 'smooth',
      });
    }
  };

  // Sinkronisasi posisi scroll antara Carousel Inline dan Fullscreen
  useEffect(() => {
    if (isFullscreen && fullscreenScrollRef.current) {
      fullscreenScrollRef.current.scrollLeft =
        currentIndex * fullscreenScrollRef.current.clientWidth;
    } else if (!isFullscreen && scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft =
        currentIndex * scrollContainerRef.current.clientWidth;
    }
  }, [isFullscreen]);

  if (images.length === 0) return null;

  return (
    <>
      {/* INLINE CAROUSEL */}
      <div className='relative w-full h-48 sm:h-64 rounded-xl overflow-hidden shadow-sm border border-emerald-200/50 group cursor-pointer'>
        {images.length > 1 && (
          <div className='absolute top-3 right-3 z-10 bg-black/60 text-white text-[10px] font-bold px-2.5 py-1 rounded-md backdrop-blur-sm shadow-sm pointer-events-none'>
            {currentIndex + 1} / {images.length}
          </div>
        )}

        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className='flex w-full h-full overflow-x-auto snap-x snap-mandatory scroll-smooth'
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style
            dangerouslySetInnerHTML={{
              __html: `div::-webkit-scrollbar { display: none; }`,
            }}
          />

          {images.map((img, idx) => (
            <div
              key={idx}
              className='min-w-full h-full snap-center shrink-0 relative'
              onClick={() => setIsFullscreen(true)}>
              <img
                src={img}
                alt={`Bukti ${idx + 1}`}
                className='w-full h-full object-cover'
              />
              <div className='absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none'>
                <Search className='w-8 h-8 text-white drop-shadow-md' />
              </div>
            </div>
          ))}
        </div>

        {images.length > 1 && (
          <div className='absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none'>
            {images.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 shadow-sm ${
                  currentIndex === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* FULLSCREEN LIGHTBOX (IG STYLE) */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-lg'>
            <div className='absolute top-4 sm:top-6 right-4 sm:right-6 z-50 flex items-center gap-3 sm:gap-4'>
              {images.length > 1 && (
                <div className='bg-white/10 text-white text-xs font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full backdrop-blur-md'>
                  {currentIndex + 1} / {images.length}
                </div>
              )}
              <button
                onClick={() => setIsFullscreen(false)}
                className='text-white bg-white/10 hover:bg-white/30 p-2 sm:p-2.5 rounded-full backdrop-blur-md transition-all shadow-lg'>
                <X className='w-5 h-5 sm:w-6 sm:h-6' />
              </button>
            </div>

            <div
              ref={fullscreenScrollRef}
              onScroll={handleScroll}
              className='flex w-full h-full overflow-x-auto snap-x snap-mandatory scroll-smooth items-center'
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <style
                dangerouslySetInnerHTML={{
                  __html: `div::-webkit-scrollbar { display: none; }`,
                }}
              />
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className='min-w-full h-full flex items-center justify-center snap-center p-0 sm:p-12 relative'>
                  <img
                    src={img}
                    alt={`Full ${idx + 1}`}
                    className='max-w-full max-h-[100vh] sm:max-h-full object-contain'
                  />
                </div>
              ))}
            </div>

            {images.length > 1 && (
              <div className='absolute bottom-6 sm:bottom-8 left-0 right-0 flex justify-center gap-2 z-50'>
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => scrollTo(idx, true)}
                    className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 shadow-md ${
                      currentIndex === idx
                        ? 'w-6 sm:w-8 bg-white'
                        : 'w-1.5 sm:w-2 bg-white/40 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const UrunanProgress = ({
  hewanId,
  hewanTipe,
  hewanJenis,
}: {
  hewanId: string;
  hewanTipe: string;
  hewanJenis: string;
}) => {
  const [terisi, setTerisi] = useState(0);
  const isUrunan =
    hewanTipe?.toLowerCase().includes('urunan') ||
    hewanJenis?.toLowerCase().includes('urunan');

  useEffect(() => {
    if (!isUrunan) return;
    const fetchSlot = async () => {
      const { count, error } = await supabase
        .from('pesanan')
        .select('id', { count: 'exact' })
        .eq('hewan_id', hewanId)
        .in('status_pesanan', [
          'Booking',
          'Menunggu',
          'Lunas',
          'Selesai',
          'Terkirim',
        ])
        .limit(0);
      if (error) {
        console.error('Gagal mengambil kuota urunan:', error.message);
        return;
      }
      setTerisi(count || 0);
    };
    fetchSlot();
  }, [hewanId, isUrunan]);

  if (!isUrunan) return null;
  return (
    <div className='mt-3 pt-3 border-t border-slate-200/60'>
      <div className='flex justify-between items-center mb-2'>
        <p className='text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5'>
          <Users className='w-3.5 h-3.5' /> Kuota Sapi Patungan
        </p>
        <p className='text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded'>
          {terisi} dari 7 Terisi
        </p>
      </div>
      <div className='flex gap-1.5 w-full'>
        {[1, 2, 3, 4, 5, 6, 7].map((slot) => (
          <div
            key={slot}
            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${slot <= terisi ? 'bg-teal-500 shadow-[0_0_5px_rgba(20,184,166,0.5)]' : 'bg-slate-200'}`}
          />
        ))}
      </div>
    </div>
  );
};

const SlaughterCountdown = ({ statusPesanan }: { statusPesanan: string }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [targetDateMs, setTargetDateMs] = useState<number | null>(null);

  useEffect(() => {
    const hitungIdulAdha = async () => {
      let hijriAdj = 0;
      try {
        const { data } = await supabase
          .from('pengaturan_web')
          .select('nilai')
          .eq('kunci', 'hijri_adjustment')
          .single();
        if (data && data.nilai) hijriAdj = parseInt(data.nilai) || 0;
      } catch (err) {
        console.error('Gagal memuat hijri_adjustment, menggunakan 0');
      }

      const hijriFormatterParts = new Intl.DateTimeFormat(
        'en-US-u-ca-islamic',
        {
          month: 'numeric',
          day: 'numeric',
        },
      );

      let checkDate = new Date();
      checkDate.setHours(10, 0, 0, 0);

      for (let i = 0; i < 365; i++) {
        const adjustedDate = new Date(
          checkDate.getTime() + hijriAdj * 86400000,
        );
        const parts = hijriFormatterParts.formatToParts(adjustedDate);
        const hMonth = parseInt(
          parts.find((p) => p.type === 'month')?.value || '0',
        );
        const hDay = parseInt(
          parts.find((p) => p.type === 'day')?.value || '0',
        );

        if (hMonth === 12 && hDay === 10) {
          setTargetDateMs(checkDate.getTime());
          break;
        }
        checkDate.setDate(checkDate.getDate() + 1);
      }
    };
    hitungIdulAdha();
  }, []);

  useEffect(() => {
    if (
      statusPesanan === 'Selesai' ||
      statusPesanan === 'Terkirim' ||
      !targetDateMs
    )
      return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDateMs - now;

      if (distance < 0) {
        setTimeLeft('Memulai Penyembelihan...');
        clearInterval(interval);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      const formattedSeconds = seconds.toString().padStart(2, '0');
      setTimeLeft(
        `${days} hari ${hours} jam ${minutes} menit ${formattedSeconds} detik`,
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDateMs, statusPesanan]);

  if (statusPesanan !== 'Lunas' || !targetDateMs) return null;

  return (
    <div className='bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl p-4 mb-4 text-white shadow-lg shadow-teal-600/20 animate-in fade-in zoom-in duration-500 flex items-center justify-between'>
      <div>
        <p className='text-[10px] font-bold text-teal-100 uppercase tracking-widest mb-0.5 flex items-center gap-1.5'>
          <Timer className='w-3.5 h-3.5' /> Hitung Mundur Eksekusi
        </p>
        <p className='text-xl font-black tracking-tight'>{timeLeft}</p>
      </div>
    </div>
  );
};

const SmartVerticalTracker = ({ pesanan }: { pesanan: any }) => {
  const status = pesanan.status_pesanan;
  const logs = pesanan.logs || [];
  const findLog = (targetStatuses: string[]) =>
    logs
      .slice()
      .reverse()
      .find((l: any) => targetStatuses.includes(l.status));

  const getLevel = () => {
    if (status === 'Terkirim') return 5;
    if (status === 'Selesai') return 4;
    if (status === 'Lunas') return 3;
    if (status === 'Menunggu' || status === 'Ditolak') return 2;
    return 1;
  };

  const currentLevel = getLevel();
  const isCancelled = status === 'Dibatalkan';
  const isRejected = status === 'Ditolak';
  const lineHeights = ['0%', '25%', '50%', '75%', '100%'];
  const activeLineHeight = isCancelled ? '0%' : lineHeights[currentLevel - 1];

  const stepsInfo = [
    {
      level: 1,
      title: 'Pendaftaran',
      desc: 'Formulir kurban dan slot berhasil dicatat sistem.',
      icon: FileText,
      time: findLog(['Booking'])?.timestamp || pesanan.created_at,
      catatan: null,
    },
    {
      level: 2,
      title: isRejected ? 'Verifikasi Gagal' : 'Verifikasi Pembayaran',
      desc: isRejected
        ? 'Terdapat masalah pada pembayaran.'
        : 'Pengecekan dana transfer oleh verifikator.',
      icon: UserCheck,
      time:
        findLog(['Menunggu', 'Ditolak'])?.timestamp ||
        (currentLevel === 2 ? pesanan.updated_at : null),
      catatan: isRejected
        ? pesanan.catatan_admin ||
          'Silakan cek kembali nominal dan bukti struk Anda.'
        : null,
    },
    {
      level: 3,
      title: 'Pembayaran Lunas',
      desc: 'Dana terverifikasi. Kuota kurban Anda telah dikunci.',
      icon: Receipt,
      time:
        findLog(['Lunas'])?.timestamp ||
        (currentLevel === 3 ? pesanan.updated_at : null),
      catatan: null,
    },
    {
      level: 4,
      title: 'Penyembelihan',
      desc: 'Alhamdulillah Hewan kurban telah disembelih sesuai Syariat Islam.',
      icon: CircleCheckBig,
      time:
        findLog(['Selesai', 'Sembelih Selesai'])?.timestamp ||
        (currentLevel === 4 ? pesanan.updated_at : null),
      catatan: findLog(['Selesai', 'Sembelih Selesai'])?.catatan,
    },
    {
      level: 5,
      title: 'Distribusi Daging',
      desc: 'Hak daging kurban telah disalurkan / diterima.',
      icon: PackageOpen,
      time:
        findLog(['Terkirim', 'Hak Daging Diterima'])?.timestamp ||
        (currentLevel === 5 ? pesanan.updated_at : null),
      catatan: findLog(['Terkirim', 'Hak Daging Diterima'])?.catatan,
    },
  ];

  return (
    <div className='relative pt-2 pb-6 pl-4 sm:pl-6 w-full'>
      <div className='absolute top-6 bottom-12 left-[31px] sm:left-[39px] w-0.5 bg-slate-100 rounded-full' />
      <div
        className={`absolute top-6 left-[31px] sm:left-[39px] w-0.5 rounded-full transition-all duration-1000 ease-in-out ${isRejected ? 'bg-rose-500' : 'bg-teal-500'}`}
        style={{ height: activeLineHeight }}
      />
      <div className='space-y-6 sm:space-y-8'>
        {stepsInfo.map((step) => {
          const isPassed =
            currentLevel > step.level && !isCancelled && !isRejected;
          const isActive = currentLevel === step.level;
          const isErrorState = isActive && (isCancelled || isRejected);
          const Icon = step.icon;

          return (
            <div
              key={step.level}
              className='relative z-10 flex items-start gap-4 sm:gap-5 group'>
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${isPassed ? 'border-emerald-500 bg-teal-600 text-white shadow-sm' : isErrorState ? 'bg-rose-500 border-rose-600 text-white ring-4 ring-rose-50' : isActive ? 'bg-white border-teal-500 text-teal-600 ring-4 ring-teal-50' : 'bg-white border-slate-200 text-slate-300'}`}>
                {isPassed ? (
                  <Check className='w-4 h-4 sm:w-5 sm:h-5 animate-in zoom-in duration-300' />
                ) : isErrorState ? (
                  <XCircle className='w-4 h-4 sm:w-5 sm:h-5 animate-in zoom-in duration-300' />
                ) : (
                  <Icon
                    className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'animate-pulse' : ''}`}
                  />
                )}
              </div>
              <div
                className={`flex-1 pt-0.5 sm:pt-1 transition-opacity duration-500 ${isPassed || isActive ? 'opacity-100' : 'opacity-40'}`}>
                <div className='flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-4 mb-1'>
                  <h4
                    className={`text-sm sm:text-[15px] font-bold tracking-tight ${isErrorState ? 'text-rose-600' : isActive ? 'text-teal-700' : 'text-slate-800'}`}>
                    {isCancelled && isActive
                      ? 'Transaksi Dibatalkan'
                      : step.title}
                  </h4>
                  {step.time && (
                    <span className='text-[10px] sm:text-[11px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md self-start sm:self-auto'>
                      {formatDate(step.time)}
                    </span>
                  )}
                </div>
                <p className='text-xs sm:text-[13px] text-slate-500 font-medium leading-relaxed max-w-[90%]'>
                  {isCancelled && isActive
                    ? 'Pesanan hangus. Hubungi admin jika terdapat kesalahan.'
                    : step.desc}
                </p>
                {step.catatan && (
                  <div
                    className={`mt-3 p-3 sm:p-4 rounded-xl border text-xs sm:text-[13px] font-medium leading-relaxed ${isErrorState ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                    {isErrorState && (
                      <AlertCircle className='w-4 h-4 inline-block mr-1.5 -mt-0.5 text-rose-500' />
                    )}
                    {step.catatan}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

function StatusContent() {
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState('');

  const [hasil, setHasil] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sudahCari, setSudahCari] = useState(false);

  const hasAutoSearched = useRef(false);

  const eksekusiCariStatus = useCallback(async (targetKeyword: string) => {
    if (!targetKeyword) return;
    const cleanKeyword = targetKeyword.trim();

    const isMurniAngka = /^\d+$/.test(cleanKeyword);

    if (isMurniAngka && cleanKeyword.length < 10) {
      alert('Masukkan minimal 10 digit nomor WhatsApp untuk mencari.');
      return;
    }

    setIsLoading(true);
    setSudahCari(true);

    try {
      let supabaseQuery = supabase
        .from('pesanan')
        .select('*, hewan(jenis, tipe, harga)');

      if (isMurniAngka) {
        supabaseQuery = supabaseQuery.ilike('whatsapp', `%${cleanKeyword}%`);
      } else {
        supabaseQuery = supabaseQuery.eq(
          'kode_trx',
          cleanKeyword.toUpperCase(),
        );
      }

      const { data, error } = await supabaseQuery.order('created_at', {
        ascending: false,
      });

      if (error) throw error;
      setHasil(data || []);
    } catch (error) {
      console.error(error);
      alert('Gagal mencari data. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const trx = searchParams.get('trx');

    if (trx && !hasAutoSearched.current) {
      setKeyword(trx);
      eksekusiCariStatus(trx);
      hasAutoSearched.current = true;
    }
  }, [searchParams, eksekusiCariStatus]);

  const cariStatus = (e: React.FormEvent) => {
    e.preventDefault();
    eksekusiCariStatus(keyword);
  };

  const [showRiwayat, setShowRiwayat] = useState(false);

  return (
    <div className='min-h-screen bg-[#F8FAFC] py-8 sm:py-12 px-4 sm:px-6 font-sans selection:bg-teal-100 selection:text-teal-900'>
      <div className='max-w-2xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out'>
        {/* Header & Search Bar */}
        <motion.div
          initial={{ y: 100, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.5 }}
          className='text-center space-y-1.5 sm:space-y-2'>
          <h1 className='text-2xl sm:text-[28px] leading-tight font-extrabold text-teal-600 tracking-tight'>
            Lacak Status Kurban
          </h1>
          <p className='text-xs sm:text-[15px] text-slate-500 font-medium'>
            Pantau progress pendaftaran dan penyaluran kurban Anda.
          </p>
        </motion.div>

        <motion.form
          onSubmit={cariStatus}
          initial={{ y: 100, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.5 }}
          className='relative flex items-center shadow-sm rounded-xl sm:rounded-2xl bg-white transition-all focus-within:shadow-md focus-within:ring-1 focus-within:ring-teal-500/20 border border-slate-200/80'>
          <Search className='absolute left-4 sm:left-5 w-4 h-4 sm:w-5 sm:h-5 text-slate-400' />
          <input
            type='text'
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder='Kode QRB- atau No WhatsApp...'
            className='w-full bg-transparent border-none py-3.5 sm:py-4 pl-10 sm:pl-14 pr-24 sm:pr-32 text-sm sm:text-[15px] font-semibold text-teal-700 placeholder:text-slate-400 focus:ring-0 outline-none'
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
                'Lacak'
              )}
            </button>
          </div>
        </motion.form>

        <div className='space-y-6'>
          {isLoading && (
            <div className='bg-white rounded-2xl sm:rounded-[28px] p-5 sm:p-8 shadow-sm border border-slate-100 animate-pulse'>
              <div className='h-40 w-full bg-slate-100 rounded-xl sm:rounded-2xl'></div>
            </div>
          )}

          {!isLoading && sudahCari && hasil.length === 0 && (
            <div className='text-center p-8 sm:p-12 bg-white rounded-2xl sm:rounded-[28px] shadow-sm border border-slate-100 animate-in zoom-in-95'>
              <div className='w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-inner'>
                <AlertCircle className='w-8 h-8 sm:w-10 sm:h-10 text-slate-400' />
              </div>
              <h3 className='text-lg sm:text-xl font-bold text-slate-800 tracking-tight'>
                Pesanan Tidak Ditemukan
              </h3>
              <p className='text-xs sm:text-sm text-slate-500 mt-2 max-w-[280px] mx-auto leading-relaxed'>
                Pastikan Kode Transaksi (QRB-) atau Nomor WhatsApp yang Anda
                masukkan sudah benar.
              </p>
            </div>
          )}

          {!isLoading &&
            hasil.map((pesanan) => (
              <div
                key={pesanan.id}
                className='bg-white rounded-2xl sm:rounded-[28px] shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out overflow-hidden'>
                <div className='bg-white px-5 sm:px-8 py-5 flex justify-between items-center'>
                  <div>
                    <p className='text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-widest'>
                      Kode Transaksi
                    </p>
                    <p className='text-base sm:text-lg font-bold text-teal-700 font-mono tracking-wide'>
                      {pesanan.kode_trx}
                    </p>
                  </div>
                  <span
                    className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-md sm:rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider border ${pesanan.status_pesanan === 'Booking' ? 'bg-slate-50 text-slate-600 border-slate-200' : pesanan.status_pesanan === 'Menunggu' ? 'bg-amber-50 text-amber-700 border-amber-200' : pesanan.status_pesanan === 'Lunas' || pesanan.status_pesanan === 'Selesai' || pesanan.status_pesanan === 'Terkirim' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                    {pesanan.status_pesanan}
                  </span>
                </div>

                <div className='p-5 sm:p-8 space-y-6 sm:space-y-8'>
                  <div className='relative bg-[#F8FAFC] rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-100 overflow-hidden flex justify-between items-start'>
                    <div className='relative z-10 w-full'>
                      <p className='text-[10px] sm:text-[11px] font-bold uppercase text-slate-400 tracking-widest'>
                        Shohibul Kurban
                      </p>
                      <p className='text-lg sm:text-xl font-bold text-teal-700 tracking-tight leading-none mt-2 mb-2'>
                        {pesanan.nama_mudhohi}
                      </p>
                      <p className='text-xs sm:text-sm text-slate-400 font-medium'>
                        {pesanan.hewan.jenis} - {pesanan.hewan.tipe}
                      </p>
                      <UrunanProgress
                        hewanId={pesanan.hewan_id}
                        hewanTipe={pesanan.hewan.tipe}
                        hewanJenis={pesanan.hewan.jenis}
                      />
                    </div>
                  </div>

                  <div className='relative bg-[#F8FAFC] rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-100 overflow-hidden group'>
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
                                Rp{' '}
                                {pesanan.kekurangan_dana.toLocaleString(
                                  'id-ID',
                                )}
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
                            <p className='text-[17px] sm:text-[28px] leading-none font-bold text-teal-700 tracking-tight'>
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

                  <SlaughterCountdown statusPesanan={pesanan.status_pesanan} />
                  <SmartVerticalTracker pesanan={pesanan} />

                  {pesanan.logs && pesanan.logs.length > 0 && (
                    <div className='mt-6 border-t border-slate-100 pt-4'>
                      <button
                        onClick={() => setShowRiwayat(!showRiwayat)}
                        className='w-full flex items-center justify-between text-xs font-bold text-slate-500 hover:text-teal-600 transition-colors'>
                        <span className='flex items-center gap-2'>
                          <History className='w-4 h-4' /> Lihat Riwayat Lengkap
                        </span>
                        {showRiwayat ? (
                          <ChevronUp className='w-4 h-4' />
                        ) : (
                          <ChevronDown className='w-4 h-4' />
                        )}
                      </button>
                      {showRiwayat && (
                        <div className='mt-4 pl-2 space-y-4 animate-in slide-in-from-top-2 duration-300'>
                          {pesanan.logs.map((log: any, idx: number) => (
                            <div
                              key={idx}
                              className="relative pl-5 before:content-[''] before:absolute before:left-0 before:top-1.5 before:w-2 before:h-2 before:bg-slate-300 before:rounded-full after:content-[''] after:absolute after:left-[3px] after:top-4 after:bottom-[-20px] after:w-0.5 after:bg-slate-100 last:after:hidden">
                              <p className='text-[10px] font-bold text-slate-400'>
                                {formatDate(log.timestamp)} • {log.oleh}
                              </p>
                              <p className='text-[12px] font-bold text-slate-700 leading-snug'>
                                {log.status}
                              </p>
                              <p className='text-[11px] text-slate-500'>
                                {log.catatan}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {(pesanan.status_pesanan === 'Selesai' ||
                    pesanan.status_pesanan === 'Terkirim') &&
                    pesanan.bukti_sembelih_url && (
                      <div className='bg-teal-50/50 border border-emerald-100 rounded-2xl p-4 sm:p-5 mt-4 animate-in fade-in'>
                        <p className='text-[10px] sm:text-[11px] font-bold uppercase text-teal-600 tracking-widest mb-3 flex items-center gap-1.5'>
                          <CheckCircle2 className='w-4 h-4' /> Dokumentasi
                          Penyembelihan
                        </p>
                        <ImageCarousel
                          rawUrlData={pesanan.bukti_sembelih_url}
                        />
                      </div>
                    )}

                  {pesanan.status_pesanan === 'Terkirim' &&
                    pesanan.bukti_kirim_url && (
                      <div className='bg-teal-50/50 border border-emerald-100 rounded-2xl p-4 sm:p-5 mt-4 animate-in fade-in'>
                        <p className='text-[10px] sm:text-[11px] font-bold uppercase text-teal-600 tracking-widest mb-3 flex items-center gap-1.5'>
                          <PackageOpen className='w-4 h-4' /> Dokumentasi
                          Penerimaan Daging
                        </p>
                        <ImageCarousel rawUrlData={pesanan.bukti_kirim_url} />
                      </div>
                    )}

                  {(pesanan.status_pesanan === 'Booking' ||
                    pesanan.status_pesanan === 'Ditolak' ||
                    (pesanan.status_pesanan === 'Menunggu' &&
                      pesanan.kekurangan_dana > 0)) && (
                    <div className='pt-2 border-t border-slate-100'>
                      <a
                        href={`/kurban/konfirmasi?trx=${pesanan.kode_trx}`}
                        className='w-full bg-teal-600 text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-[13px] sm:text-[15px] flex justify-center items-center gap-2'>
                        Selesaikan Pembayaran <ArrowRight className='w-4 h-4' />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

import { Suspense } from 'react';

export default function LacakStatusPage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen flex items-center justify-center text-teal-700 font-bold'>
          Memuat halaman pelacakan...
        </div>
      }>
      <StatusContent />
    </Suspense>
  );
}
