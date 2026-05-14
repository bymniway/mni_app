'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  motion,
  Variants,
  useMotionValue,
  useAnimationFrame,
  AnimatePresence,
} from 'framer-motion';
import { supabase } from '@/lib/supabase';
import {
  ArrowRight,
  MapPin,
  Heart,
  Gift,
  BookOpen,
  Users,
  Clock,
  PlayCircle,
  FileText,
  ChevronRight,
  Calendar,
  Moon,
  Settings,
  Megaphone,
  Wallet,
  Snowflake,
  Car,
  Wifi,
  Coffee,
  MonitorPlay,
  HeartHandshake,
  TrendingUp,
  CheckCircle2,
  ArrowUpRight,
  Quote,
  Phone,
  Mail,
  PenTool,
  X,
  Plus,
  Eye,
  User,
  Loader2,
} from 'lucide-react';
import CountdownHariBesar from '@/components/public/CountdownHariBesar';

// ==========================================
// UTILITY FUNCTIONS & STYLES (Ditambahkan untuk Media)
// ==========================================
const formatWaktu = (dateStr: string) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const getReadingTime = (text: string) => {
  if (!text) return 1;
  const words = text
    .replace(/<[^>]*>/g, '')
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
};

const formatViews = (views: number) => {
  if (!views) return '0';
  if (views >= 1000000)
    return (views / 1000000).toFixed(1).replace(/\.0$/, '') + ' Jt';
  if (views >= 1000)
    return (views / 1000).toFixed(1).replace(/\.0$/, '') + ' rb';
  return views.toString();
};

const iconMapMedia: any = {
  Video: PlayCircle,
  Khutbah: BookOpen,
  Artikel: FileText,
};

const IconMap: any = {
  Snowflake,
  Car,
  Wifi,
  Coffee,
  MonitorPlay,
  CheckCircle2,
};

export default function HeroBeranda({
  data,
  isMobileView = false,
  isPublic = false,
  isEditor = false,
  onTextChange,
  onFasilitasAdd,
  onFasilitasDelete,
  onFasilitasUpdate,
  onQuoteUpdate,
}: any) {
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };
  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: 'easeOut' },
    },
  };

  const wheelVariants: Variants = {
    initial: { opacity: 0, y: 30 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 25 },
    },
    exit: { opacity: 0, y: -30, transition: { duration: 0.2 } },
  };

  const editableClass = isEditor
    ? 'cursor-text hover:bg-white/20 hover:ring-2 hover:ring-white/50 rounded-md px-1 outline-none focus:ring-2 focus:ring-mni-accent transition-all inline-block pointer-events-auto'
    : '';
  const editableClassDark = isEditor
    ? 'cursor-text hover:bg-black/10 hover:ring-2 hover:ring-black/20 rounded-md px-1 outline-none focus:ring-2 focus:ring-mni-primary transition-all inline-block pointer-events-auto'
    : '';

  const CardWrapper = ({ href, children, className }: any) => {
    if (isPublic && !isEditor)
      return (
        <Link
          href={href}
          className={className}>
          {children}
        </Link>
      );
    return <div className={`${className} cursor-default`}>{children}</div>;
  };

  const [prayerData, setPrayerData] = useState<any>(null);
  const [calcMethod, setCalcMethod] = useState(20);
  const [isFetching, setIsFetching] = useState(true);

  // === STATE UNTUK MEDIA DINAMIS ===
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [isMediaFetching, setIsMediaFetching] = useState(true);
  const [readMedia, setReadMedia] = useState<string[]>([]);
  const [featuredMediaIdx, setFeaturedMediaIdx] = useState(0);

  useEffect(() => {
    const fetchPrayerTimes = async () => {
      setIsFetching(true);
      try {
        const { data: adjData } = await supabase
          .from('pengaturan_web')
          .select('nilai')
          .eq('kunci', 'hijri_adjustment')
          .single();
        const adjValue = adjData?.nilai ? parseInt(adjData.nilai) : 0;

        const res = await fetch(
          `https://api.aladhan.com/v1/timingsByCity?city=Jakarta&country=Indonesia&method=${calcMethod}&adj=${adjValue}`,
        );
        const result = await res.json();
        setPrayerData(result.data);
      } catch (error) {
      } finally {
        setIsFetching(false);
      }
    };
    fetchPrayerTimes();
  }, [calcMethod]);

  // === FETCH DATA MEDIA ===
  useEffect(() => {
    const fetchMedia = async () => {
      setIsMediaFetching(true);
      const { data, error } = await supabase
        .from('artikel')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      if (!error && data) setMediaList(data);
      setIsMediaFetching(false);
    };
    fetchMedia();

    const storedReads = localStorage.getItem('mni_read_articles');
    if (storedReads) {
      try {
        setReadMedia(JSON.parse(storedReads));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const topMediaArticles = useMemo(() => {
    if (mediaList.length === 0) return [];
    return [...mediaList].sort((a, b) => b.views - a.views).slice(0, 5);
  }, [mediaList]);

  const recentMediaArticles = useMemo(() => {
    if (mediaList.length === 0) return [];
    return [...mediaList]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      .slice(0, 3);
  }, [mediaList]);

  useEffect(() => {
    if (isEditor) return;
    if (topMediaArticles.length > 0) {
      const interval = setInterval(() => {
        setFeaturedMediaIdx((prev) => (prev + 1) % topMediaArticles.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [topMediaArticles, isEditor]);

  const currentFeaturedMedia = topMediaArticles[featuredMediaIdx];

  const jadwalHariIni = prayerData
    ? [
        { nama: 'Subuh', waktu: prayerData.timings.Fajr },
        { nama: 'Dzuhur', waktu: prayerData.timings.Dhuhr },
        { nama: 'Ashar', waktu: prayerData.timings.Asr },
        { nama: 'Maghrib', waktu: prayerData.timings.Maghrib },
        { nama: 'Isya', waktu: prayerData.timings.Isha },
      ]
    : [];

  const kurbanInfoTexts = [
    data?.kurban_info_0 || 'Pendaftaran ditutup H-3 Idul Adha',
    data?.kurban_info_1 || 'Sapi Urunan B kurang 2 Shohibul lagi!',
    data?.kurban_info_2 || 'Tersedia cicilan 0% untuk Sapi Tipe A',
    data?.kurban_info_3 || 'Laporan penyembelihan live & transparan',
  ];
  const ziswafInfoTexts = [
    data?.ziswaf_info_0 || 'Mari tunaikan kewajiban Zakat Fitrah Anda',
    data?.ziswaf_info_1 || 'Peluang Jariyah: Pembebasan Lahan Parkir',
    data?.ziswaf_info_2 || 'Sedekah subuh, pembuka pintu rezeki',
  ];

  const kasOpsData = [
    {
      val: data?.kas_ops_v1,
      label: data?.kas_ops_l1,
      keyV: 'kas_ops_v1',
      keyL: 'kas_ops_l1',
    },
    {
      val: data?.kas_ops_v2,
      label: data?.kas_ops_l2,
      keyV: 'kas_ops_v2',
      keyL: 'kas_ops_l2',
    },
  ];
  const kasYatimData = [
    {
      val: data?.kas_yatim_v1,
      label: data?.kas_yatim_l1,
      keyV: 'kas_yatim_v1',
      keyL: 'kas_yatim_l1',
    },
    {
      val: data?.kas_yatim_v2,
      label: data?.kas_yatim_l2,
      keyV: 'kas_yatim_v2',
      keyL: 'kas_yatim_l2',
    },
  ];

  const [activeIdx, setActiveIdx] = useState(0);
  const [financeIdx, setFinanceIdx] = useState(0);
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [isAnimationPaused, setIsAnimationPaused] = useState(false);

  const [stats, setStats] = useState({
    kurban: {
      sapi: 0,
      kambing: 0,
      domba: 0,
      total_transaksi: 0,
      mudhohi_unik: 0,
    },
    ziswaf: {
      mal: '0',
      wakaf: '0',
      infaq: '0',
      shadaqoh: '0',
      fitrah_jiwa: 0,
      fitrah_uang: '0',
      fidyah: 0,
    },
  });

  useEffect(() => {
    const fetchRealMetrics = async () => {
      // 1. Fetch data web settings
      const { data: settings } = await supabase
        .from('pengaturan_web')
        .select('*');

      let hargaZiswaf = { fitrah_beras: 45000, fidyah: 15000 };
      try {
        const { data: dataHarga } = await supabase
          .from('ziswaf')
          .select('harga_beras_fitrah, harga_fidyah')
          .eq('id', 1)
          .single();
        if (dataHarga) {
          hargaZiswaf.fitrah_beras = dataHarga.harga_beras_fitrah || 45000;
          hargaZiswaf.fidyah = dataHarga.harga_fidyah || 15000;
        }
      } catch (err) {
        console.error('Gagal menarik harga Master Control Ziswaf', err);
      }

      let ziswafData = {
        mal: '0',
        wakaf: '0',
        infaq: '0',
        shadaqoh: '0',
        fitrah_jiwa: 0,
        fitrah_uang: '0',
        fidyah: 0,
      };

      if (settings) {
        const getVal = (k: string, def: string) =>
          settings.find((s) => s.kunci === k)?.nilai || def;

        ziswafData = {
          mal: getVal('ziswaf_stat_mal', '0'),
          wakaf: getVal('ziswaf_stat_wakaf', '0'),
          infaq: getVal('ziswaf_stat_infaq', '0'),
          shadaqoh: getVal('ziswaf_stat_shadaqoh', '0'),
          fitrah_jiwa: parseInt(getVal('ziswaf_stat_fitrah_jiwa', '0')),
          fitrah_uang: getVal('ziswaf_stat_fitrah_uang', '0'),
          fidyah: parseInt(getVal('ziswaf_stat_fidyah', '0')),
        };
      }

      let kurbanData = {
        sapi: 0,
        kambing: 0,
        domba: 0,
        total_transaksi: 0,
        mudhohi_unik: 0,
      };
      try {
        const { data: pesananData, error } = await supabase
          .from('pesanan')
          .select('*, hewan(jenis, tipe)');

        if (!error && pesananData) {
          const valid = pesananData.filter(
            (p) => p.status_pesanan?.toLowerCase() !== 'ditolak',
          );
          kurbanData.total_transaksi = valid.length;
          kurbanData.mudhohi_unik = new Set(valid.map((p) => p.whatsapp)).size;

          let sapiUtuhJasa = 0;
          let sapiUrunanShohibul = 0;

          valid.forEach((p) => {
            const jenis = p.hewan?.jenis?.toLowerCase() || '';
            const tipe = p.hewan?.tipe?.toLowerCase() || '';
            const infoHewan = `${jenis} ${tipe}`;

            const isSapi =
              infoHewan.includes('sapi') ||
              infoHewan.includes('bali') ||
              infoHewan.includes('limousin') ||
              infoHewan.includes('brahman') ||
              /\bpo\b/.test(infoHewan);
            const isKambing = infoHewan.includes('kambing');
            const isDomba = infoHewan.includes('domba');
            const isUrunan = infoHewan.includes('urun');

            if (isSapi) {
              if (isUrunan) sapiUrunanShohibul++;
              else sapiUtuhJasa++;
            } else if (isKambing) kurbanData.kambing++;
            else if (isDomba) kurbanData.domba++;
          });

          kurbanData.sapi = sapiUtuhJasa + Math.floor(sapiUrunanShohibul / 7);
        }
      } catch (err) {
        console.error(err);
      }

      try {
        const { data: ziswafRes, error: ziswafErr } = await supabase
          .from('transaksi_ziswaf')
          .select('kategori, nominal, status_pesanan');

        if (!ziswafErr && ziswafRes) {
          const diterimaZiswaf = ziswafRes.filter(
            (p) =>
              p.status_pesanan?.toLowerCase() === 'diterima' ||
              p.status_pesanan?.toLowerCase() === 'lunas' ||
              p.status_pesanan?.toLowerCase() === 'selesai',
          );

          let mal = 0,
            wakaf = 0,
            infaq = 0,
            shadaqoh = 0,
            fitrah = 0,
            fidyah = 0;

          diterimaZiswaf.forEach((p) => {
            const nominal = Number(p.nominal) || 0;
            const kat = p.kategori?.toLowerCase() || '';

            if (kat.includes('fitrah')) fitrah += nominal;
            else if (kat.includes('mal') || kat.includes('maal'))
              mal += nominal;
            else if (kat.includes('infaq')) infaq += nominal;
            else if (kat.includes('wakaf')) wakaf += nominal;
            else if (kat.includes('shadaqoh') || kat.includes('sedekah'))
              shadaqoh += nominal;
            else if (kat.includes('fidyah')) fidyah += nominal;
          });

          const formatJt = (num: number) =>
            (num / 1000000).toFixed(1).replace(/\.0$/, '');

          if (mal > 0) ziswafData.mal = formatJt(mal);
          if (wakaf > 0) ziswafData.wakaf = formatJt(wakaf);
          if (infaq > 0) ziswafData.infaq = formatJt(infaq);
          if (shadaqoh > 0) ziswafData.shadaqoh = formatJt(shadaqoh);

          if (fitrah > 0) {
            ziswafData.fitrah_uang = formatJt(fitrah);
            ziswafData.fitrah_jiwa = Math.floor(
              (fitrah / hargaZiswaf.fitrah_beras) * 3.5,
            );
          }
          if (fidyah > 0) {
            ziswafData.fidyah = Math.floor(fidyah / hargaZiswaf.fidyah);
          }
        }
      } catch (err) {
        console.error(err);
      }

      setStats({
        kurban: kurbanData,
        ziswaf: ziswafData,
      });
    };
    fetchRealMetrics();
  }, []);

  useEffect(() => {
    if (isEditor) return;
    if (isAnimationPaused) return;
    const intervalData = setInterval(
      () => setActiveIdx((prev) => prev + 1),
      5000,
    );
    const intervalFinance = setInterval(
      () => setFinanceIdx((prev) => prev + 1),
      4000,
    );
    const intervalQuote = setInterval(
      () => setQuoteIdx((prev) => prev + 1),
      12000,
    );
    return () => {
      clearInterval(intervalData);
      clearInterval(intervalFinance);
      clearInterval(intervalQuote);
    };
  }, [isAnimationPaused, isEditor]);

  // 1. BEKUKAN INDEX SAAT EDIT: Jika mode edit, paksa index selalu 0 (diam di tempat)
  const safeActiveIdx = isEditor ? 0 : activeIdx;
  const safeFinanceIdx = isEditor ? 0 : financeIdx;

  // 2. TEKS BERHENTI BERUBAH: Gunakan index yang sudah dibekukan
  const currentKurbanText =
    kurbanInfoTexts[safeActiveIdx % (kurbanInfoTexts?.length || 1)];
  const currentZiswafText =
    ziswafInfoTexts[safeActiveIdx % (ziswafInfoTexts?.length || 1)];

  // 3. CAROUSEL TENGAH BERHENTI ROTASI: Paksa selalu nampil data ke-0 saat diedit
  const kurbanDataView = isEditor ? 0 : safeActiveIdx % 2;
  const ziswafDataView = isEditor ? 0 : safeActiveIdx % 3;
  const viewRolling2 = isEditor ? 0 : safeFinanceIdx % 2;

  // ================= GALERI SLIDER =================
  const [realGaleri, setRealGaleri] = useState<any[]>([]);

  useEffect(() => {
    const fetchGaleri = async () => {
      // Menarik data langsung dari tabel 'galeri' terbaru
      const { data, error } = await supabase
        .from('galeri')
        .select('*')
        .order('tanggal', { ascending: false }) // Urutkan dari yang terbaru
        .limit(8); // Ambil 8 foto terbaru saja agar beranda ringan

      if (!error && data) {
        setRealGaleri(data);
      }
    };
    fetchGaleri();
  }, []);
  const dummyImages = useMemo(
    () =>
      [1, 2, 3, 4].map((id) => ({
        id,
        gambar_url: `https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&q=80&sig=${id}`,
        judul: 'Momen Kebersamaan',
      })),
    [],
  );
  const displayGaleri = realGaleri.length > 0 ? realGaleri : dummyImages;
  const infiniteGaleri = [
    ...displayGaleri,
    ...displayGaleri,
    ...displayGaleri,
    ...displayGaleri,
    ...displayGaleri,
    ...displayGaleri,
  ];

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const direction = useRef(-1);
  const baseSpeed = useRef(1);
  const [isPaused, setIsPaused] = useState(false);
  const [dragConstraints, setDragConstraints] = useState({
    right: 0,
    left: -9999,
  });

  useEffect(() => {
    if (containerRef.current && contentRef.current)
      setDragConstraints({
        right: 0,
        left: -(
          contentRef.current.scrollWidth - containerRef.current.offsetWidth
        ),
      });
  }, [displayGaleri.length]);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const diff = currentScrollY - lastScrollY;
      if (Math.abs(diff) > 5) {
        direction.current = diff > 0 ? -1 : 1;
        baseSpeed.current = 3;
      }
      lastScrollY = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    const damping = setInterval(() => {
      if (baseSpeed.current > 1) baseSpeed.current -= 0.1;
    }, 50);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(damping);
    };
  }, []);

  useAnimationFrame((t, delta) => {
    if (isPaused || dragConstraints.left >= 0) return;
    let nextX = x.get() + direction.current * baseSpeed.current * (delta / 16);
    if (nextX <= dragConstraints.left) {
      nextX = dragConstraints.left;
      direction.current = 1;
    } else if (nextX >= dragConstraints.right) {
      nextX = dragConstraints.right;
      direction.current = -1;
    }
    x.set(nextX);
  });

  return (
    <div
      className={`pb-20 overflow-hidden ${isEditor ? 'max-w-7xl mx-auto' : ''}`}>
      <style
        dangerouslySetInnerHTML={{
          __html: `@keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } } .animate-marquee { animation: marquee 25s linear infinite; } .animate-marquee:hover { animation-play-state: paused; }`,
        }}
      />

      {/* 0. TICKER PENGUMUMAN */}
      <div className='bg-amber-50 border-b border-amber-100 flex items-center px-4 md:px-10 py-2.5 relative z-30'>
        <div className='flex items-center text-amber-600 font-bold text-xs uppercase tracking-wider shrink-0 bg-amber-50 pr-4 z-10'>
          <Megaphone className='w-4 h-4 mr-2 animate-pulse' /> Info DKM
        </div>
        <div className='overflow-hidden flex-1 relative flex items-center h-full'>
          <div
            className={`whitespace-nowrap text-amber-800 text-sm font-medium flex items-center w-full ${isEditor ? 'overflow-x-auto pb-1 custom-scroll-light' : 'animate-marquee'}`}>
            <span
              contentEditable={isEditor}
              suppressContentEditableWarning
              onBlur={(e) =>
                isEditor &&
                onTextChange('info_dkm', e.currentTarget.textContent)
              }
              className={`${isEditor ? 'cursor-text hover:bg-amber-100 rounded px-2 outline-none focus:ring-2 focus:ring-amber-400 min-w-full block transition-colors' : ''}`}>
              {data?.info_dkm ||
                "• Assalamu'alaikum. Shalat Idul Adha 1447 H akan diselenggarakan di Lapangan Utama. • Dibutuhkan segera tambahan relawan panitia Kurban. • Saldo wakaf pembebasan lahan parkir masih kurang Rp 15.000.000,-."}
            </span>
          </div>
        </div>
      </div>

      <motion.section
        initial='hidden'
        animate='visible'
        variants={staggerContainer}
        className={`relative bg-mni-primary bg-mni-gradient text-white rounded-[2rem] overflow-hidden shadow-2xl group mx-4 md:mx-10 mt-6 md:mt-8`}>
        <div className='absolute -right-20 -bottom-32 opacity-[0.08] group-hover:scale-[1.15] transition-transform duration-1000 ease-out pointer-events-none'>
          <Moon className='w-[500px] h-[500px]' />
        </div>
        <div
          className={`relative z-10 ${isMobileView ? 'p-6 pb-20' : 'px-8 py-16 md:p-20 md:pb-32'} flex flex-col md:flex-row items-center justify-between gap-10`}>
          <motion.div
            variants={staggerContainer}
            className='md:w-3/5 space-y-6 text-center md:text-left'>
            <motion.div
              variants={fadeInUp}
              className='inline-block bg-white/20 backdrop-blur-sm border border-white/30 text-xs font-bold tracking-wide rounded-full px-4 py-1.5'>
              <span
                contentEditable={isEditor}
                suppressContentEditableWarning
                onBlur={(e) =>
                  isEditor && onTextChange('badge', e.currentTarget.textContent)
                }
                className={editableClass}>
                {data?.badge}
              </span>
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              className={`${isMobileView ? 'text-3xl' : 'text-4xl md:text-6xl'} font-extrabold leading-tight`}>
              <span
                contentEditable={isEditor}
                suppressContentEditableWarning
                onBlur={(e) =>
                  isEditor && onTextChange('judul', e.currentTarget.textContent)
                }
                className={editableClass}>
                {data?.judul}
              </span>
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className={`${isMobileView ? 'text-sm' : 'text-lg'} text-green-50 max-w-xl mx-auto md:mx-0 leading-relaxed`}>
              <span
                contentEditable={isEditor}
                suppressContentEditableWarning
                onBlur={(e) =>
                  isEditor &&
                  onTextChange('deskripsi', e.currentTarget.textContent)
                }
                className={editableClass}>
                {data?.deskripsi}
              </span>
            </motion.p>
            <motion.div
              variants={fadeInUp}
              className={`flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4`}>
              <CardWrapper
                href='/kurban'
                className='bg-white text-mni-primary px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all shadow-lg text-center hover:-translate-y-1'>
                Layanan Kurban
              </CardWrapper>
              <CardWrapper
                href='/ziswaf'
                className='bg-mni-accent text-white px-8 py-4 rounded-xl font-bold hover:bg-opacity-90 transition-all shadow-lg text-center hover:-translate-y-1'>
                Donasi ZISWAF
              </CardWrapper>
            </motion.div>
          </motion.div>
          <motion.div
            variants={fadeInUp}
            className='md:w-2/5 flex justify-center'>
            <div className='w-64 h-64 bg-gradient-to-tr from-green-400/20 to-white/10 rounded-full border-4 border-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl'>
              <MapPin className='w-14 h-14 mx-auto mb-2 opacity-80' />
            </div>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true }}
        variants={staggerContainer}
        className={`bg-mni-surface rounded-3xl p-6 md:p-8 shadow-md border border-gray-100 relative z-20 mx-4 md:mx-16 -mt-12 md:-mt-20`}>
        <div className='flex flex-col md:flex-row items-center justify-between mb-6 gap-4'>
          <div className='flex items-center space-x-3 text-center md:text-left'>
            <Clock className='w-8 h-8 text-mni-primary hidden md:block' />
            <div>
              <h2 className='text-xl font-bold text-mni-text'>
                <span
                  contentEditable={isEditor}
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    isEditor &&
                    onTextChange('jadwal_judul', e.currentTarget.textContent)
                  }
                  className={editableClassDark}>
                  {data?.jadwal_judul}
                </span>
              </h2>
              <p className='text-sm text-mni-muted font-medium mt-1'>
                {isFetching
                  ? 'Memuat tanggal...'
                  : prayerData
                    ? `${prayerData.date.hijri.day} ${prayerData.date.hijri.month.en} ${prayerData.date.hijri.year} H  •  ${prayerData.date.gregorian.weekday.en}, ${prayerData.date.readable}`
                    : ''}
              </p>
            </div>
          </div>
          <div className='flex items-center bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl'>
            <Settings className='w-4 h-4 text-gray-400 mr-2' />
            <select
              value={calcMethod}
              onChange={(e) => setCalcMethod(Number(e.target.value))}
              className='bg-transparent text-xs font-bold text-gray-600 outline-none cursor-pointer'>
              <option value='20'>Kemenag RI</option>
              <option value='3'>MWL (Global)</option>
              <option value='4'>Makkah</option>
            </select>
          </div>
        </div>
        <div className='grid grid-cols-5 gap-2 md:gap-4'>
          {isFetching ? (
            <div className='col-span-5 text-center py-6 text-gray-400'>
              Melacak posisi & jadwal...
            </div>
          ) : (
            jadwalHariIni.map((jadwal: any, idx: number) => (
              <div
                key={idx}
                className='bg-white border border-gray-100 rounded-2xl p-3 md:p-4 text-center relative overflow-hidden group hover:shadow-md transition-shadow hover:-translate-y-1 cursor-default'>
                <div className='absolute -right-4 -top-4 opacity-[0.03] group-hover:scale-125 transition-transform duration-500 pointer-events-none'>
                  <Clock className='w-20 h-20 text-mni-primary' />
                </div>
                <p className='relative z-10 text-[10px] md:text-sm text-mni-muted font-bold uppercase tracking-wider mb-1'>
                  {jadwal.nama}
                </p>
                <p className='relative z-10 text-base md:text-2xl font-bold text-mni-primary'>
                  {jadwal.waktu}
                </p>
              </div>
            ))
          )}
        </div>
      </motion.section>

      <motion.section
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, margin: '-50px' }}
        variants={staggerContainer}
        className='max-w-7xl mx-auto px-4 md:px-10 grid grid-cols-1 lg:grid-cols-3 gap-6 mt-16 md:mt-24'>
        <motion.div
          variants={fadeInUp}
          className='lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4'
          onMouseEnter={() => !isEditor && setIsAnimationPaused(true)}
          onMouseLeave={() => !isEditor && setIsAnimationPaused(false)}>
          <div className='bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200 p-6 rounded-3xl relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300'>
            <div className='absolute -right-8 -bottom-8 opacity-5 group-hover:scale-125 transition-transform duration-700 pointer-events-none'>
              <Wallet className='w-40 h-40 text-green-900' />
            </div>
            <div className='relative z-10'>
              <div className='flex items-center justify-between mb-4'>
                <div className='w-10 h-10 bg-green-500 text-white rounded-xl flex items-center justify-center'>
                  <Wallet className='w-5 h-5' />
                </div>
                <span className='text-[10px] font-bold text-green-600 bg-green-200/50 px-2.5 py-1 rounded-full flex items-center'>
                  <TrendingUp className='w-3 h-3 mr-1' /> Real-time
                </span>
              </div>
              <div className='mb-3'>
                <h4 className='text-sm font-bold text-green-800 uppercase tracking-wider'>
                  <span
                    contentEditable={isEditor}
                    suppressContentEditableWarning
                    onBlur={(e) =>
                      isEditor &&
                      onTextChange('kas_ops_judul', e.currentTarget.textContent)
                    }
                    className={editableClassDark}>
                    {data?.kas_ops_judul}
                  </span>
                </h4>
                <p className='text-[10px] font-medium text-green-700/70 mt-0.5'>
                  <span
                    contentEditable={isEditor}
                    suppressContentEditableWarning
                    onBlur={(e) =>
                      isEditor &&
                      onTextChange('kas_ops_desc', e.currentTarget.textContent)
                    }
                    className={editableClassDark}>
                    {data?.kas_ops_desc}
                  </span>
                </p>
              </div>
              <div
                className={`relative border-t border-green-300/40 pt-2 ${isEditor ? 'h-[75px] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex flex-col gap-3' : 'h-[60px] overflow-hidden'}`}>
                {isEditor ? (
                  kasOpsData.map((item, idx) => (
                    <div
                      key={idx}
                      className='flex flex-col justify-start bg-green-500/10 p-2 rounded-lg shrink-0'>
                      <h3 className='text-lg font-bold text-green-950 tracking-tight'>
                        <span
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) =>
                            onTextChange(item.keyV, e.currentTarget.textContent)
                          }
                          className={editableClassDark}>
                          {item.val}
                        </span>
                      </h3>
                      <p className='text-[10px] font-bold text-green-700/80 uppercase tracking-wider'>
                        <span
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) =>
                            onTextChange(item.keyL, e.currentTarget.textContent)
                          }
                          className={editableClassDark}>
                          {item.label}
                        </span>
                      </p>
                    </div>
                  ))
                ) : (
                  <AnimatePresence>
                    <motion.div
                      key={viewRolling2}
                      variants={wheelVariants}
                      initial='initial'
                      animate='animate'
                      exit='exit'
                      className='absolute top-2 left-0 right-0 flex flex-col justify-start'>
                      <h3 className='text-2xl font-bold text-green-950 tracking-tight'>
                        <span>{kasOpsData[viewRolling2].val}</span>
                      </h3>
                      <p className='text-[10px] font-bold text-green-700/80 mt-0.5 uppercase tracking-wider'>
                        <span>{kasOpsData[viewRolling2].label}</span>
                      </p>
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            </div>
          </div>

          <div className='bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 p-6 rounded-3xl relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300'>
            <div className='absolute -right-8 -bottom-8 opacity-5 group-hover:scale-125 transition-transform duration-700 pointer-events-none'>
              <HeartHandshake className='w-40 h-40 text-blue-900' />
            </div>
            <div className='relative z-10'>
              <div className='flex items-center justify-between mb-4'>
                <div className='w-10 h-10 bg-blue-500 text-white rounded-xl flex items-center justify-center'>
                  <HeartHandshake className='w-5 h-5' />
                </div>
                <span className='text-[10px] font-bold text-blue-600 bg-blue-200/50 px-2.5 py-1 rounded-full flex items-center'>
                  <CheckCircle2 className='w-3 h-3 mr-1' /> Amanah
                </span>
              </div>
              <div className='mb-3'>
                <h4 className='text-sm font-bold text-blue-800 uppercase tracking-wider'>
                  <span
                    contentEditable={isEditor}
                    suppressContentEditableWarning
                    onBlur={(e) =>
                      isEditor &&
                      onTextChange(
                        'kas_yatim_judul',
                        e.currentTarget.textContent,
                      )
                    }
                    className={editableClassDark}>
                    {data?.kas_yatim_judul}
                  </span>
                </h4>
                <p className='text-[10px] font-medium text-blue-700/70 mt-0.5'>
                  <span
                    contentEditable={isEditor}
                    suppressContentEditableWarning
                    onBlur={(e) =>
                      isEditor &&
                      onTextChange(
                        'kas_yatim_desc',
                        e.currentTarget.textContent,
                      )
                    }
                    className={editableClassDark}>
                    {data?.kas_yatim_desc}
                  </span>
                </p>
              </div>
              <div
                className={`relative border-t border-blue-300/40 pt-2 ${isEditor ? 'h-[75px] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex flex-col gap-3' : 'h-[60px] overflow-hidden'}`}>
                {isEditor ? (
                  kasYatimData.map((item, idx) => (
                    <div
                      key={idx}
                      className='flex flex-col justify-start bg-blue-500/10 p-2 rounded-lg shrink-0'>
                      <h3 className='text-lg font-bold text-blue-950 tracking-tight'>
                        <span
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) =>
                            onTextChange(item.keyV, e.currentTarget.textContent)
                          }
                          className={editableClassDark}>
                          {item.val}
                        </span>
                      </h3>
                      <p className='text-[10px] font-bold text-blue-700/80 uppercase tracking-wider'>
                        <span
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) =>
                            onTextChange(item.keyL, e.currentTarget.textContent)
                          }
                          className={editableClassDark}>
                          {item.label}
                        </span>
                      </p>
                    </div>
                  ))
                ) : (
                  <AnimatePresence>
                    <motion.div
                      key={viewRolling2}
                      variants={wheelVariants}
                      initial='initial'
                      animate='animate'
                      exit='exit'
                      className='absolute top-2 left-0 right-0 flex flex-col justify-start'>
                      <h3 className='text-2xl font-bold text-blue-950 tracking-tight'>
                        <span>{kasYatimData[viewRolling2].val}</span>
                      </h3>
                      <p className='text-[10px] font-bold text-blue-700/80 mt-0.5 uppercase tracking-wider'>
                        <span>{kasYatimData[viewRolling2].label}</span>
                      </p>
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Fasilitas Masjid */}
        <motion.div
          variants={fadeInUp}
          className='bg-white border border-gray-100 shadow-sm p-6 rounded-3xl flex flex-col justify-center'>
          <h3 className='text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-5 text-center lg:text-left'>
            <span
              contentEditable={isEditor}
              suppressContentEditableWarning
              onBlur={(e) =>
                isEditor &&
                onTextChange('fasilitas_judul', e.currentTarget.textContent)
              }
              className={editableClassDark}>
              {data?.fasilitas_judul}
            </span>
          </h3>
          <div className='flex flex-wrap justify-center lg:justify-start gap-4'>
            {data?.fasilitas?.map((f: any) => {
              const Icon = IconMap[f.iconName] || CheckCircle2;
              return (
                <div
                  key={f.id}
                  className='relative flex flex-col items-center group cursor-default'>
                  {isEditor && (
                    <button
                      onClick={() => onFasilitasDelete(f.id)}
                      className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 z-20 hover:scale-110 transition-all'>
                      <X className='w-3 h-3' />
                    </button>
                  )}
                  <div className='w-12 h-12 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center mb-2 group-hover:bg-mni-primary group-hover:text-white transition-all shadow-sm group-hover:-translate-y-1 relative'>
                    <Icon className='w-6 h-6' />
                  </div>
                  <span
                    contentEditable={isEditor}
                    suppressContentEditableWarning
                    onBlur={(e) =>
                      isEditor &&
                      onFasilitasUpdate(f.id, e.currentTarget.textContent)
                    }
                    className={`text-[9px] font-bold text-gray-500 text-center ${editableClassDark}`}>
                    {f.nama}
                  </span>
                </div>
              );
            })}
            {isEditor && (
              <button
                onClick={onFasilitasAdd}
                className='w-12 h-12 border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center text-gray-400 hover:text-mni-primary hover:border-mni-primary transition-colors'>
                <Plus className='w-5 h-5' />
              </button>
            )}
          </div>
        </motion.div>
      </motion.section>

      <div className='mt-16 md:mt-24'>
        <CountdownHariBesar isEditor={isEditor} />
      </div>

      <motion.section
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, margin: '-50px' }}
        variants={staggerContainer}
        className='max-w-7xl mx-auto px-4 md:px-10 mt-16 md:mt-24'>
        <div className='flex justify-between items-end mb-8'>
          <div>
            <h2 className='text-2xl md:text-3xl font-bold text-mni-text mb-2'>
              <span
                contentEditable={isEditor}
                suppressContentEditableWarning
                onBlur={(e) =>
                  isEditor &&
                  onTextChange('program_judul', e.currentTarget.textContent)
                }
                className={editableClassDark}>
                {data?.program_judul}
              </span>
            </h2>
            <p className='text-mni-muted'>
              <span
                contentEditable={isEditor}
                suppressContentEditableWarning
                onBlur={(e) =>
                  isEditor &&
                  onTextChange('program_desc', e.currentTarget.textContent)
                }
                className={editableClassDark}>
                {data?.program_desc}
              </span>
            </p>
          </div>
        </div>

        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6`}>
          <motion.div
            variants={fadeInUp}
            whileHover={{ y: -5 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className='lg:col-span-2'>
            <CardWrapper
              href='/kajian'
              className='group block relative bg-gray-900 rounded-[2rem] overflow-hidden shadow-md h-full min-h-[300px] border border-gray-800'>
              <img
                src='https://images.unsplash.com/photo-1604054923518-e491a9a6acbc?auto=format&fit=crop&q=80'
                alt='Kajian'
                className='absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700'
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent'></div>
              <div className='absolute inset-0 p-8 flex flex-col justify-between'>
                <div className='flex justify-between items-start'>
                  <span className='bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center'>
                    <BookOpen className='w-3.5 h-3.5 mr-1.5' /> Kajian Terdekat
                  </span>
                  <div className='bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center animate-pulse'>
                    <Clock className='w-3.5 h-3.5 mr-1.5' /> Malam Ini
                  </div>
                </div>
                <div>
                  <h3 className='text-2xl md:text-3xl font-bold text-white mb-2 leading-tight group-hover:text-blue-300 transition-colors'>
                    Tafsir Ibnu Katsir: Surat Al-Kahfi
                  </h3>
                  <p className='text-gray-300 font-medium mb-4 flex items-center'>
                    <Users className='w-4 h-4 mr-2' /> Ust. Dr. Muhammad Lc.,
                    M.A.
                  </p>
                  <div className='flex items-center justify-between'>
                    <p className='text-xs text-gray-400'>
                      Ba'da Maghrib s.d Isya • Ruang Utama Masjid
                    </p>
                    <ArrowUpRight className='w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity' />
                  </div>
                </div>
              </div>
            </CardWrapper>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className='flex flex-col gap-6'
            onMouseEnter={() => !isEditor && setIsAnimationPaused(true)}
            onMouseLeave={() => !isEditor && setIsAnimationPaused(false)}>
            {/* CARD KURBAN */}
            <CardWrapper
              href='/kurban'
              className='group block relative bg-gradient-to-br from-green-800 to-green-950 rounded-3xl p-6 overflow-hidden shadow-md h-full flex-1 hover:-translate-y-1 transition-all duration-300 border border-green-700'>
              <div className='absolute -right-8 -top-8 opacity-[0.05] group-hover:scale-125 transition-transform duration-700 pointer-events-none text-white'>
                <Gift className='w-40 h-40' />
              </div>
              <div className='relative z-10 flex flex-col h-full justify-between'>
                <div className='flex justify-between items-center mb-2'>
                  <div className='w-10 h-10 bg-green-500/30 border border-green-400/30 rounded-xl flex items-center justify-center text-green-100'>
                    <Gift className='w-5 h-5' />
                  </div>
                  <span className='text-[10px] font-bold bg-white text-green-900 px-2.5 py-1 rounded-full'>
                    Kurban 1447 H
                  </span>
                </div>

                <div className='my-3 h-[50px] flex items-center'>
                  <AnimatePresence mode='wait'>
                    {kurbanDataView === 0 ? (
                      <motion.div
                        key='k1'
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -15 }}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                        className='flex items-baseline justify-between w-full text-white'>
                        <div className='text-center'>
                          <span className='text-2xl font-bold'>
                            {stats.kurban.sapi}
                          </span>{' '}
                          <span className='block text-[10px] font-bold text-green-200 uppercase tracking-wider'>
                            Sapi
                          </span>
                        </div>
                        <span className='text-green-500/50'>|</span>
                        <div className='text-center'>
                          <span className='text-2xl font-bold'>
                            {stats.kurban.kambing}
                          </span>{' '}
                          <span className='block text-[10px] font-bold text-green-200 uppercase tracking-wider'>
                            Kambing
                          </span>
                        </div>
                        <span className='text-green-500/50'>|</span>
                        <div className='text-center'>
                          <span className='text-2xl font-bold'>
                            {stats.kurban.domba}
                          </span>{' '}
                          <span className='block text-[10px] font-bold text-green-200 uppercase tracking-wider'>
                            Domba
                          </span>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key='k2'
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -15 }}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                        className='flex items-center justify-between w-full text-white'>
                        <div>
                          <p className='text-[10px] font-bold text-green-300 uppercase tracking-wider mb-0.5'>
                            Total Pendaftaran
                          </p>
                          <span className='text-3xl font-bold'>
                            {stats.kurban.total_transaksi}
                          </span>{' '}
                        </div>
                        <div className='text-right'>
                          <p className='text-[10px] font-bold text-green-300 uppercase tracking-wider mb-0.5'>
                            Mudhohi Unik
                          </p>
                          <span className='text-xl font-bold text-green-50'>
                            {stats.kurban.mudhohi_unik}
                          </span>{' '}
                          <span className='text-sm font-medium text-green-100'>
                            Orang
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div
                  className={`border-t border-green-700/50 pt-2.5 mt-1 ${isEditor ? 'flex flex-col gap-2 h-[80px] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden' : 'min-h-[2.5rem] flex items-start overflow-hidden'}`}>
                  {isEditor ? (
                    kurbanInfoTexts.map((text, idx) => (
                      <p
                        key={idx}
                        className='text-green-100/90 text-xs font-medium flex items-start w-full leading-snug bg-green-900/50 p-1.5 rounded'>
                        <ArrowRight className='w-3.5 h-3.5 mr-1.5 mt-0.5 shrink-0 text-green-400' />
                        <span
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) =>
                            onTextChange(
                              `kurban_info_${idx}`,
                              e.currentTarget.textContent,
                            )
                          }
                          className={editableClass}>
                          {text}
                        </span>
                      </p>
                    ))
                  ) : (
                    <AnimatePresence mode='wait'>
                      <motion.p
                        key={activeIdx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                        className='text-green-100/90 text-xs font-medium flex items-start w-full leading-snug'>
                        <ArrowRight className='w-3.5 h-3.5 mr-1.5 mt-0.5 shrink-0 text-green-400' />
                        <span>{currentKurbanText}</span>
                      </motion.p>
                    </AnimatePresence>
                  )}
                </div>
              </div>
            </CardWrapper>

            {/* CARD ZISWAF */}
            <CardWrapper
              href='/ziswaf'
              className='group block relative bg-gradient-to-br from-orange-600 to-orange-800 rounded-3xl p-6 overflow-hidden shadow-md h-full flex-1 hover:-translate-y-1 transition-all duration-300 border border-orange-500'>
              <div className='absolute -right-8 -top-8 opacity-[0.05] group-hover:scale-125 transition-transform duration-700 pointer-events-none text-white'>
                <Heart className='w-40 h-40' />
              </div>
              <div className='relative z-10 flex flex-col h-full justify-between'>
                <div className='flex justify-between items-center mb-2'>
                  <div className='w-10 h-10 bg-orange-400/30 border border-orange-300/30 rounded-xl flex items-center justify-center text-orange-50'>
                    <Heart className='w-5 h-5' />
                  </div>
                  <span className='text-[10px] font-bold bg-white text-orange-800 px-2.5 py-1 rounded-full'>
                    ZISWAF
                  </span>
                </div>

                <div className='my-3 h-[50px] flex items-center'>
                  <AnimatePresence mode='wait'>
                    {ziswafDataView === 0 && (
                      <motion.div
                        key='z1'
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -15 }}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                        className='flex justify-between items-end w-full'>
                        <div>
                          <p className='text-[10px] font-bold text-orange-200 uppercase tracking-wider mb-0.5'>
                            Zakat Mal
                          </p>
                          <p className='text-xl font-bold text-white'>
                            Rp {stats.ziswaf.mal}
                            <span className='text-sm font-medium'> Jt</span>
                          </p>
                        </div>
                        <div className='text-right'>
                          <p className='text-[10px] font-bold text-orange-200 uppercase tracking-wider mb-0.5'>
                            Wakaf
                          </p>
                          <p className='text-xl font-bold text-white'>
                            Rp {stats.ziswaf.wakaf}
                            <span className='text-sm font-medium'> Jt</span>
                          </p>
                        </div>
                      </motion.div>
                    )}
                    {ziswafDataView === 1 && (
                      <motion.div
                        key='z2'
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -15 }}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                        className='flex justify-between items-end w-full'>
                        <div>
                          <p className='text-[10px] font-bold text-orange-200 uppercase tracking-wider mb-0.5'>
                            Infaq
                          </p>
                          <p className='text-xl font-bold text-white'>
                            Rp {stats.ziswaf.infaq}
                            <span className='text-sm font-medium'> Jt</span>
                          </p>
                        </div>
                        <div className='text-right'>
                          <p className='text-[10px] font-bold text-orange-200 uppercase tracking-wider mb-0.5'>
                            Shadaqoh
                          </p>
                          <p className='text-xl font-bold text-white'>
                            Rp {stats.ziswaf.shadaqoh}
                            <span className='text-sm font-medium'> Jt</span>
                          </p>
                        </div>
                      </motion.div>
                    )}
                    {ziswafDataView === 2 && (
                      <motion.div
                        key='z3'
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -15 }}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                        className='flex justify-between items-end w-full'>
                        <div>
                          <p className='text-[10px] font-bold text-orange-200 uppercase tracking-wider mb-0.5'>
                            Zakat Fitrah
                          </p>
                          <p className='text-lg font-bold text-white'>
                            {stats.ziswaf.fitrah_jiwa}
                            <span className='text-xs font-medium'> L</span>{' '}
                            <span className='text-sm font-normal opacity-50 mx-1'>
                              |
                            </span>{' '}
                            <span className='text-base'>
                              {stats.ziswaf.fitrah_uang}
                              <span className='text-xs font-medium'> Jt</span>
                            </span>
                          </p>
                        </div>
                        <div className='text-right'>
                          <p className='text-[10px] font-bold text-orange-200 uppercase tracking-wider mb-0.5'>
                            Fidyah
                          </p>
                          <p className='text-xl font-bold text-white'>
                            {stats.ziswaf.fidyah}
                            <span className='text-sm font-medium'> Box</span>
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div
                  className={`border-t border-orange-500/50 pt-2.5 mt-1 ${isEditor ? 'flex flex-col gap-2 h-[80px] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden' : 'min-h-[2.5rem] flex items-start overflow-hidden'}`}>
                  {isEditor ? (
                    ziswafInfoTexts.map((text, idx) => (
                      <p
                        key={idx}
                        className='text-orange-50/90 text-xs font-medium flex items-start w-full leading-snug bg-orange-900/50 p-1.5 rounded'>
                        <ArrowRight className='w-3.5 h-3.5 mr-1.5 mt-0.5 shrink-0 text-orange-300' />
                        <span
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) =>
                            onTextChange(
                              `ziswaf_info_${idx}`,
                              e.currentTarget.textContent,
                            )
                          }
                          className={editableClass}>
                          {text}
                        </span>
                      </p>
                    ))
                  ) : (
                    <AnimatePresence mode='wait'>
                      <motion.p
                        key={activeIdx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                        className='text-orange-50/90 text-xs font-medium flex items-start w-full leading-snug'>
                        <ArrowRight className='w-3.5 h-3.5 mr-1.5 mt-0.5 shrink-0 text-orange-300' />
                        <span>{currentZiswafText}</span>
                      </motion.p>
                    </AnimatePresence>
                  )}
                </div>
              </div>
            </CardWrapper>
          </motion.div>
        </div>
      </motion.section>

      {/* 5. LAYANAN & PROGRAM UTAMA */}
      <motion.section
        initial='hidden'
        whileInView='visible'
        variants={staggerContainer}
        className='max-w-7xl mx-auto px-4 md:px-10 mt-16 md:mt-24'>
        <motion.div
          variants={fadeInUp}
          className='text-center mb-12'>
          <h2 className='text-3xl font-bold text-mni-primary mb-3'>
            <span
              contentEditable={isEditor}
              suppressContentEditableWarning
              onBlur={(e) =>
                isEditor &&
                onTextChange('layanan_judul', e.currentTarget.textContent)
              }
              className={editableClassDark}>
              {data?.layanan_judul}
            </span>
          </h2>
          <p className='text-mni-muted max-w-2xl mx-auto'>
            <span
              contentEditable={isEditor}
              suppressContentEditableWarning
              onBlur={(e) =>
                isEditor &&
                onTextChange('layanan_desc', e.currentTarget.textContent)
              }
              className={editableClassDark}>
              {data?.layanan_desc}
            </span>
          </p>
        </motion.div>
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-6`}>
          <motion.div
            whileHover={{ y: -8 }}
            transition={{ type: 'spring', stiffness: 300 }}>
            <CardWrapper
              href='/kurban'
              className='group block bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-full hover:shadow-xl hover:border-mni-primary/30 transition-all duration-300 relative overflow-hidden'>
              <div className='absolute -right-8 -top-8 opacity-[0.03] group-hover:scale-125 transition-transform duration-700 pointer-events-none text-mni-text'>
                <Gift className='w-48 h-48' />
              </div>
              <div className='relative z-10'>
                <div className='w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-mni-primary group-hover:text-white transition-all duration-300'>
                  <Gift className='w-7 h-7' />
                </div>
                <h3 className='text-xl font-bold text-mni-text mb-3'>
                  <span
                    contentEditable={isEditor}
                    suppressContentEditableWarning
                    onBlur={(e) =>
                      isEditor &&
                      onTextChange(
                        'layanan_1_judul',
                        e.currentTarget.textContent,
                      )
                    }
                    className={editableClassDark}>
                    {data?.layanan_1_judul}
                  </span>
                </h3>
                <p className='text-mni-muted text-sm leading-relaxed'>
                  <span
                    contentEditable={isEditor}
                    suppressContentEditableWarning
                    onBlur={(e) =>
                      isEditor &&
                      onTextChange(
                        'layanan_1_desc',
                        e.currentTarget.textContent,
                      )
                    }
                    className={editableClassDark}>
                    {data?.layanan_1_desc}
                  </span>
                </p>
              </div>
            </CardWrapper>
          </motion.div>
          <motion.div
            whileHover={{ y: -8 }}
            transition={{ type: 'spring', stiffness: 300 }}>
            <CardWrapper
              href='/ziswaf'
              className='group block bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-full hover:shadow-xl hover:border-mni-accent/30 transition-all duration-300 relative overflow-hidden'>
              <div className='absolute -right-8 -top-8 opacity-[0.03] group-hover:scale-125 transition-transform duration-700 pointer-events-none text-mni-text'>
                <Heart className='w-48 h-48' />
              </div>
              <div className='relative z-10'>
                <div className='w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-mni-accent group-hover:text-white transition-all duration-300'>
                  <Heart className='w-7 h-7' />
                </div>
                <h3 className='text-xl font-bold text-mni-text mb-3'>
                  <span
                    contentEditable={isEditor}
                    suppressContentEditableWarning
                    onBlur={(e) =>
                      isEditor &&
                      onTextChange(
                        'layanan_2_judul',
                        e.currentTarget.textContent,
                      )
                    }
                    className={editableClassDark}>
                    {data?.layanan_2_judul}
                  </span>
                </h3>
                <p className='text-mni-muted text-sm leading-relaxed'>
                  <span
                    contentEditable={isEditor}
                    suppressContentEditableWarning
                    onBlur={(e) =>
                      isEditor &&
                      onTextChange(
                        'layanan_2_desc',
                        e.currentTarget.textContent,
                      )
                    }
                    className={editableClassDark}>
                    {data?.layanan_2_desc}
                  </span>
                </p>
              </div>
            </CardWrapper>
          </motion.div>
          <motion.div
            whileHover={{ y: -8 }}
            transition={{ type: 'spring', stiffness: 300 }}>
            <CardWrapper
              href='/kajian'
              className='group block bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-full hover:shadow-xl hover:border-blue-500/30 transition-all duration-300 relative overflow-hidden'>
              <div className='absolute -right-8 -top-8 opacity-[0.03] group-hover:scale-125 transition-transform duration-700 pointer-events-none text-mni-text'>
                <BookOpen className='w-48 h-48' />
              </div>
              <div className='relative z-10'>
                <div className='w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300'>
                  <BookOpen className='w-7 h-7' />
                </div>
                <h3 className='text-xl font-bold text-mni-text mb-3'>
                  <span
                    contentEditable={isEditor}
                    suppressContentEditableWarning
                    onBlur={(e) =>
                      isEditor &&
                      onTextChange(
                        'layanan_3_judul',
                        e.currentTarget.textContent,
                      )
                    }
                    className={editableClassDark}>
                    {data?.layanan_3_judul}
                  </span>
                </h3>
                <p className='text-mni-muted text-sm leading-relaxed'>
                  <span
                    contentEditable={isEditor}
                    suppressContentEditableWarning
                    onBlur={(e) =>
                      isEditor &&
                      onTextChange(
                        'layanan_3_desc',
                        e.currentTarget.textContent,
                      )
                    }
                    className={editableClassDark}>
                    {data?.layanan_3_desc}
                  </span>
                </p>
              </div>
            </CardWrapper>
          </motion.div>
        </div>
      </motion.section>

      {/* 6. QUOTE OF THE DAY */}
      <motion.section
        initial='hidden'
        whileInView='visible'
        variants={fadeInUp}
        className='max-w-4xl mx-auto px-4 md:px-10 mt-16 md:mt-24 text-center'>
        <div
          className={`relative ${isEditor ? 'h-[180px] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex flex-col gap-6 py-2' : 'h-[200px] flex items-center justify-center'}`}
          onMouseEnter={() => !isEditor && setIsAnimationPaused(true)}
          onMouseLeave={() => !isEditor && setIsAnimationPaused(false)}>
          {isEditor ? (
            data?.quotes?.map((q: any) => (
              <div
                key={q.id}
                className='flex flex-col items-center w-full bg-gray-50/50 p-6 rounded-3xl border border-gray-100 shrink-0'>
                <Quote className='w-8 h-8 text-mni-primary/20 mx-auto mb-2 transform -scale-x-100' />
                <h3 className='text-lg font-bold text-mni-text leading-relaxed tracking-tight max-w-3xl text-center'>
                  "
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) =>
                      onQuoteUpdate(q.id, 'text', e.currentTarget.textContent)
                    }
                    className={editableClassDark}>
                    {q.text}
                  </span>
                  "
                </h3>
                <p className='text-xs font-bold text-mni-muted tracking-widest uppercase mt-4 text-center'>
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) =>
                      onQuoteUpdate(q.id, 'source', e.currentTarget.textContent)
                    }
                    className={editableClassDark}>
                    {q.source}
                  </span>
                </p>
              </div>
            ))
          ) : (
            <AnimatePresence mode='wait'>
              {data?.quotes && data.quotes.length > 0 && (
                <motion.div
                  key={quoteIdx % data.quotes.length}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.8 }}
                  className='absolute flex flex-col items-center w-full'>
                  <Quote className='w-10 h-10 text-mni-primary/20 mx-auto mb-4 transform -scale-x-100' />
                  <h3 className='text-xl md:text-2xl font-bold text-mni-text leading-relaxed tracking-tight max-w-3xl'>
                    "{data.quotes[quoteIdx % data.quotes.length].text}"
                  </h3>
                  <div className='w-12 h-1 bg-mni-accent mx-auto mt-5 rounded-full mb-3'></div>
                  <p className='text-sm font-bold text-mni-muted tracking-widest uppercase'>
                    {data.quotes[quoteIdx % data.quotes.length].source}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </motion.section>

      {/* 7. MEDIA & INSPIRASI (DIHUBUNGKAN DENGAN LOGIKA FETCH MEDIA) */}
      <motion.section
        initial='hidden'
        whileInView='visible'
        variants={staggerContainer}
        className='max-w-7xl mx-auto px-4 md:px-10 mt-16 md:mt-24'>
        <div className='flex justify-between items-end mb-8 gap-4'>
          <div className='flex-1'>
            <h2 className='text-2xl md:text-3xl font-bold text-mni-text mb-2'>
              <span
                contentEditable={isEditor}
                suppressContentEditableWarning
                onBlur={(e) =>
                  isEditor &&
                  onTextChange('media_judul', e.currentTarget.textContent)
                }
                className={editableClassDark}>
                {data?.media_judul}
              </span>
            </h2>
            <p className='text-mni-muted'>
              <span
                contentEditable={isEditor}
                suppressContentEditableWarning
                onBlur={(e) =>
                  isEditor &&
                  onTextChange('media_desc', e.currentTarget.textContent)
                }
                className={editableClassDark}>
                {data?.media_desc}
              </span>
            </p>
          </div>

          <Link
            href={'/media'}
            className='flex items-center text-mni-primary font-bold text-xs md:text-base hover:text-teal-700 transition-colors shrink-0 mb-1 md:mb-0'>
            Lihat Semua <ArrowRight className='w-4 h-4 ml-1 md:ml-2' />
          </Link>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* BANNER UTAMA DINAMIS */}
          <motion.div
            variants={fadeInUp}
            className='lg:col-span-2 relative bg-gray-900 rounded-3xl overflow-hidden shadow-md group aspect-[16/9] lg:aspect-auto'>
            <AnimatePresence mode='wait'>
              {currentFeaturedMedia ? (
                <motion.div
                  key={currentFeaturedMedia.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className='absolute inset-0 w-full h-full'>
                  <CardWrapper
                    href={`/media/${currentFeaturedMedia.slug}`}
                    className='block w-full h-full'>
                    <img
                      src={
                        currentFeaturedMedia.cover_url ||
                        'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&q=80'
                      }
                      alt='Featured'
                      className='absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700'
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent'></div>
                    <div className='absolute inset-0 p-6 md:p-10 flex flex-col justify-end relative z-10'>
                      {/* PENANDA LENGKAP */}
                      <div className='flex flex-wrap items-center gap-1.5 md:gap-2 mb-3'>
                        <span className='bg-mni-primary text-white text-[10px] md:text-xs font-bold px-2.5 md:px-3 py-1 md:py-1.5 rounded-full uppercase tracking-wider'>
                          Pilihan Redaksi
                        </span>
                        {readMedia.includes(currentFeaturedMedia.slug) && (
                          <span className='bg-slate-800/80 backdrop-blur-md border border-white/10 text-slate-300 text-[9px] md:text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center'>
                            <CheckCircle2 className='w-3 h-3 mr-1' /> Dibaca
                          </span>
                        )}
                        <span className='bg-white/20 backdrop-blur-md border border-white/20 text-white text-[9px] md:text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center'>
                          <Clock className='w-3 h-3 mr-1' />{' '}
                          {getReadingTime(currentFeaturedMedia.konten)} Mnt
                        </span>
                        <span className='bg-white/20 backdrop-blur-md border border-white/20 text-white text-[9px] md:text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center'>
                          <Eye className='w-3 h-3 mr-1' />{' '}
                          {formatViews(currentFeaturedMedia.views)} Views
                        </span>
                      </div>

                      <h3 className='text-xl md:text-2xl font-bold text-white mb-3 leading-tight group-hover:text-green-300 transition-colors line-clamp-3 md:line-clamp-none'>
                        {currentFeaturedMedia.judul}
                      </h3>

                      <div className='flex flex-wrap items-center text-gray-300 text-xs md:text-sm font-medium gap-4 md:gap-6'>
                        <span className='flex items-center text-green-100 mr-3 md:mr-0'>
                          <User className='w-3 h-3 md:w-4 md:h-4 mr-1.5' />{' '}
                          {currentFeaturedMedia.penulis}
                        </span>
                        <span className='flex items-center'>
                          <Calendar className='w-3 h-3 md:w-4 md:h-4 mr-1.5' />{' '}
                          {formatWaktu(currentFeaturedMedia.created_at)}
                        </span>
                      </div>
                    </div>
                  </CardWrapper>
                </motion.div>
              ) : (
                <div className='w-full h-full flex items-center justify-center absolute inset-0'>
                  <Loader2 className='w-8 h-8 animate-spin text-gray-500' />
                </div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* LIST ARTIKEL TERBARU KANAN DINAMIS */}
          <motion.div
            variants={fadeInUp}
            className='flex flex-col gap-4'>
            {isMediaFetching ? (
              <div className='flex items-center justify-center py-10'>
                <Loader2 className='w-6 h-6 animate-spin text-mni-primary' />
              </div>
            ) : recentMediaArticles.length > 0 ? (
              recentMediaArticles.map((item, idx) => {
                const Icon = iconMapMedia[item.tipe] || FileText;
                const isRead = readMedia.includes(item.slug);
                const readTime = getReadingTime(item.konten);

                return (
                  <CardWrapper
                    key={idx}
                    href={`/media/${item.slug}`}
                    className='block bg-white border border-gray-100 p-3 md:p-4 rounded-3xl shadow-sm flex items-center gap-3 md:gap-4 group cursor-pointer hover:border-mni-primary hover:shadow-md transition-all'>
                    <div className='w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-white shrink-0 bg-slate-100 relative overflow-hidden'>
                      {item.cover_url ? (
                        <img
                          src={item.cover_url}
                          alt={item.judul}
                          className='absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform'
                        />
                      ) : (
                        <Icon className='w-6 h-6 md:w-8 h-8 opacity-40 text-mni-primary z-10' />
                      )}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex flex-wrap items-center gap-1 md:gap-1.5 mb-1.5'>
                        <span className='text-[8px] md:text-[9px] font-bold text-mni-primary uppercase tracking-wider bg-green-50 px-1.5 py-0.5 rounded-md'>
                          {item.kategori}
                        </span>
                        {isRead && (
                          <span className='text-[8px] md:text-[9px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-md flex items-center'>
                            <CheckCircle2 className='w-2 h-2 mr-0.5' /> Dibaca
                          </span>
                        )}
                        <span className='text-[8px] md:text-[9px] font-semibold text-slate-400 flex items-center'>
                          <Clock className='w-2 h-2 mr-0.5' /> {readTime} Mnt
                        </span>
                        <span className='text-[8px] md:text-[9px] font-semibold text-slate-400 flex items-center'>
                          <Eye className='w-2 h-2 mr-0.5' /> {item.views}
                        </span>
                      </div>
                      <h4 className='font-bold text-mni-text text-xs md:text-sm leading-snug line-clamp-2 group-hover:text-mni-primary transition-colors'>
                        {item.judul}
                      </h4>
                      <div className='flex items-center justify-between text-[9px] md:text-[10px] text-gray-400 mt-2 font-medium'>
                        <div className='flex items-center'>
                          <User className='w-3 h-3 mr-1' /> {item.penulis}
                        </div>
                        <span>{formatWaktu(item.created_at)}</span>
                      </div>
                    </div>
                  </CardWrapper>
                );
              })
            ) : (
              <div className='text-center py-10 text-gray-400 text-sm font-medium'>
                Belum ada artikel.
              </div>
            )}
          </motion.div>
        </div>
      </motion.section>

      {/* 8. GALERI & KONTAK */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className='py-10 bg-white border border-gray-100 shadow-sm rounded-[2rem] overflow-hidden mt-16 md:mt-24 mx-4 md:mx-10'>
        <div className='px-6 md:px-10 mb-8 text-center'>
          <h2 className='text-2xl font-bold text-mni-text'>
            <span
              contentEditable={isEditor}
              suppressContentEditableWarning
              onBlur={(e) =>
                isEditor &&
                onTextChange('galeri_judul', e.currentTarget.textContent)
              }
              className={editableClassDark}>
              {data?.galeri_judul}
            </span>
          </h2>
          <p className='text-sm text-mni-muted mt-2'>
            <span
              contentEditable={isEditor}
              suppressContentEditableWarning
              onBlur={(e) =>
                isEditor &&
                onTextChange('galeri_desc', e.currentTarget.textContent)
              }
              className={editableClassDark}>
              {data?.galeri_desc}
            </span>
          </p>
        </div>
        <div
          ref={containerRef}
          className='px-6 md:px-10 cursor-grab active:cursor-grabbing'>
          <motion.div
            ref={contentRef}
            drag='x'
            dragConstraints={dragConstraints}
            dragElastic={0}
            style={{ x }}
            onDragStart={() => setIsPaused(true)}
            onDragEnd={() => setTimeout(() => setIsPaused(false), 2500)}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setTimeout(() => setIsPaused(false), 2500)}
            className='flex gap-4 w-max'>
            {infiniteGaleri.map((item, idx) => {
              // LOGIKA BARU: Ambil gambar pertama jika formatnya array (multi-image),
              // atau ambil gambar_url biasa, atau gunakan gambar default.
              const coverImage =
                item.gambar_urls && item.gambar_urls.length > 0
                  ? item.gambar_urls[0]
                  : item.gambar_url;

              return (
                <div
                  key={idx}
                  className='shrink-0 w-[280px] md:w-[350px] aspect-[4/3] rounded-3xl overflow-hidden relative group border border-gray-100 shadow-sm'>
                  <img
                    src={
                      coverImage ||
                      'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&q=80'
                    }
                    alt={item.judul || 'Galeri'}
                    draggable={false}
                    className='absolute inset-0 w-full h-full object-cover pointer-events-none'
                  />
                </div>
              );
            })}
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, margin: '-50px' }}
        variants={staggerContainer}
        className='max-w-7xl mx-auto px-4 md:px-10 mt-16 md:mt-24 grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <motion.div
          variants={fadeInUp}
          className='bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center'>
          <h3 className='text-2xl font-bold text-mni-text mb-6'>
            <span
              contentEditable={isEditor}
              suppressContentEditableWarning
              onBlur={(e) =>
                isEditor &&
                onTextChange('kontak_judul', e.currentTarget.textContent)
              }
              className={editableClassDark}>
              {data?.kontak_judul}
            </span>
          </h3>
          <div className='space-y-6'>
            {[
              {
                icon: MapPin,
                label: 'Alamat',
                val: data?.kontak_alamat,
                key: 'kontak_alamat',
              },
              {
                icon: Phone,
                label: 'Telepon',
                val: data?.kontak_telp,
                key: 'kontak_telp',
              },
              {
                icon: Mail,
                label: 'Email',
                val: data?.kontak_email,
                key: 'kontak_email',
              },
            ].map((item, i) => (
              <div
                key={i}
                className='flex items-start'>
                <div className='w-10 h-10 bg-green-50 text-mni-primary rounded-xl flex items-center justify-center shrink-0 mr-4'>
                  <item.icon className='w-5 h-5' />
                </div>
                <div>
                  <p className='font-bold text-mni-text text-sm'>
                    {item.label}
                  </p>
                  <p className='text-sm text-gray-500 mt-1 leading-relaxed'>
                    <span
                      contentEditable={isEditor}
                      suppressContentEditableWarning
                      onBlur={(e) =>
                        isEditor &&
                        onTextChange(item.key, e.currentTarget.textContent)
                      }
                      className={editableClassDark}>
                      {item.val}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div
          variants={fadeInUp}
          className='lg:col-span-2 h-[300px] lg:h-auto rounded-3xl overflow-hidden shadow-sm border border-gray-100 relative bg-gray-200'>
          <iframe
            src='https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3965.909495013794!2d106.8372737!3d-6.2756296!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f23fa7e40f75%3A0x1ea63791167375d!2sMasjid%20Nurul%20lman!5e0!3m2!1sid!2sid!4v1778511751368!5m2!1sid!2sid'
            className='absolute inset-0 w-full h-full border-0'
            allowFullScreen
            loading='lazy'
            referrerPolicy='no-referrer-when-downgrade'></iframe>
        </motion.div>
      </motion.section>

      <motion.section
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, margin: '-50px' }}
        variants={fadeInUp}
        className={`max-w-7xl mx-auto px-4 md:px-10 mt-16 md:mt-24 pb-10`}>
        <div className='bg-gray-900 text-white rounded-3xl p-10 flex flex-col md:flex-row items-center justify-between'>
          <div className='mb-6 md:mb-0 md:w-2/3'>
            <div className='flex items-center justify-center md:justify-start mb-2'>
              <Users className='w-6 h-6 mr-3 text-mni-accent shrink-0' />
              <h2 className={`text-2xl font-bold`}>
                <span
                  contentEditable={isEditor}
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    isEditor &&
                    onTextChange('banner_judul', e.currentTarget.textContent)
                  }
                  className={editableClass}>
                  {data?.banner_judul}
                </span>
              </h2>
            </div>
            <p className={`text-gray-400`}>
              <span
                contentEditable={isEditor}
                suppressContentEditableWarning
                onBlur={(e) =>
                  isEditor &&
                  onTextChange('banner_desc', e.currentTarget.textContent)
                }
                className={editableClass}>
                {data?.banner_desc}
              </span>
            </p>
          </div>
          <CardWrapper
            href='/tentang'
            className='bg-white text-gray-900 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition hover:-translate-y-1 inline-block'>
            Lihat Profil Masjid
          </CardWrapper>
        </div>
      </motion.section>
    </div>
  );
}
