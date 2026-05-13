'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  BookOpen,
  PlayCircle,
  FileText,
  Calendar,
  Eye,
  User,
  Loader2,
  Mic,
  MicOff,
  LayoutGrid,
  List,
  Filter,
  CheckCircle2,
  Dices,
  Clock,
  Share2,
  Columns,
  ChevronUp,
  X,
} from 'lucide-react';

// ==========================================
// UTILITY FUNCTIONS & STYLES
// ==========================================
const formatWaktu = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const getSnippet = (html: string) => {
  if (!html) return '';
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  const text = tmp.textContent || tmp.innerText || '';
  return text.slice(0, 110) + '...';
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

const iconMap: any = {
  Video: PlayCircle,
  Khutbah: BookOpen,
  Artikel: FileText,
};

const HighlightText = ({
  text,
  highlight,
}: {
  text: string;
  highlight: string;
}) => {
  if (!highlight.trim()) return <span>{text}</span>;
  const regex = new RegExp(
    `(${highlight.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')})`,
    'gi',
  );
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className='bg-amber-200 text-slate-950 rounded-sm px-0.5'>
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </span>
  );
};

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function MediaPage() {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchInputMobileRef = useRef<HTMLInputElement>(null);

  const [artikelList, setArtikelList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [searchTerm, setSearchTerm] = useState('');

  const [sortBy, setSortBy] = useState<'terbaru' | 'terlama' | 'terpopuler'>(
    'terbaru',
  );
  const [isListening, setIsListening] = useState(false);
  const [peekedArticleId, setPeekedArticleId] = useState<number | null>(null);
  const peekTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'magazine'>(
    'grid',
  );
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [readArticles, setReadArticles] = useState<string[]>([]);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const [greeting, setGreeting] = useState({
    title: 'Media & Inspirasi',
    subtitle: 'Kumpulan kajian, artikel dakwah, dan khutbah pilihan.',
  });

  const [visibleCount, setVisibleCount] = useState(9);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [featuredIndex, setFeaturedIndex] = useState(0);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11)
      setGreeting({
        title: 'Selamat Pagi',
        subtitle: 'Awali harimu dengan ilmu...',
      });
    else if (hour >= 11 && hour < 15)
      setGreeting({
        title: 'Selamat Siang',
        subtitle: 'Rehat sejenak dengan kajian...',
      });
    else if (hour >= 15 && hour < 18)
      setGreeting({
        title: 'Selamat Sore',
        subtitle: 'Tutup hari dengan hikmah...',
      });
    else
      setGreeting({
        title: 'Selamat Malam',
        subtitle: 'Bekal hidayah sebelum terlelap...',
      });

    const fetchArtikel = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('artikel')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      if (!error && data) setArtikelList(data);
      setTimeout(() => setIsLoading(false), 800);
    };
    fetchArtikel();

    const storedReads = localStorage.getItem('mni_read_articles');
    if (storedReads) {
      try {
        setReadArticles(JSON.parse(storedReads));
      } catch (e) {
        console.error(e);
      }
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setVisibleCount(9);
  }, [activeFilter, searchTerm, sortBy]);

  const markAsRead = (slug: string) => {
    setReadArticles((prev) => {
      if (prev.includes(slug)) return prev;
      const updated = [...prev, slug];
      localStorage.setItem('mni_read_articles', JSON.stringify(updated));
      return updated;
    });
  };

  const handleQuickShare = (e: React.MouseEvent, item: any) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/media/${item.slug}`;
    const text = encodeURIComponent(
      `Bacalah konten bermanfaat ini: "${item.judul}"\n\n${url}`,
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const startListening = () => {
    if (
      !('webkitSpeechRecognition' in window) &&
      !('SpeechRecognition' in window)
    )
      return alert('Browser tidak mendukung suara.');
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchTerm(transcript);
      setIsSearchFocused(true);
      if (searchInputRef.current) searchInputRef.current.focus();
      if (searchInputMobileRef.current) searchInputMobileRef.current.focus();
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleRandomArticle = () => {
    if (artikelList.length === 0) return;
    const randomSlug =
      artikelList[Math.floor(Math.random() * artikelList.length)].slug;
    markAsRead(randomSlug);
    router.push(`/media/${randomSlug}`);
  };

  const handlePeekStart = (id: number) => {
    peekTimeoutRef.current = setTimeout(() => setPeekedArticleId(id), 400);
  };
  const handlePeekEnd = () => {
    if (peekTimeoutRef.current) clearTimeout(peekTimeoutRef.current);
    setPeekedArticleId(null);
  };
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // TRACK LOGIC FOR MARQUEE
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollYRef = useRef(typeof window !== 'undefined' ? window.scrollY : 0);
  const velocityRef = useRef(0);
  const isTouchingRef = useRef(false);
  const lastManualScroll = useRef(0);

  useEffect(() => {
    let rafId: number;
    const handleScroll = () => {
      const currentY = window.scrollY;
      const deltaY = currentY - scrollYRef.current;
      scrollYRef.current = currentY;
      velocityRef.current = deltaY * 1.5;
    };
    window.addEventListener('scroll', handleScroll);
    const tick = () => {
      velocityRef.current *= 0.9;
      if (trackRef.current && !isTouchingRef.current) {
        trackRef.current.scrollLeft += 0.5 + velocityRef.current;
        const maxScroll = trackRef.current.scrollWidth / 3;
        if (trackRef.current.scrollLeft >= maxScroll * 2)
          trackRef.current.scrollLeft -= maxScroll;
        else if (trackRef.current.scrollLeft <= 0)
          trackRef.current.scrollLeft += maxScroll;
        const skew = Math.max(Math.min(velocityRef.current * 0.3, 15), -15);
        trackRef.current
          .querySelectorAll('.cat-btn')
          .forEach((btn: any) => (btn.style.transform = `skewX(${-skew}deg)`));
      }
      rafId = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, [artikelList]);

  const handleManualScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!isTouchingRef.current) return;
    const current = e.currentTarget.scrollLeft;
    const delta = current - lastManualScroll.current;
    lastManualScroll.current = current;
    velocityRef.current = delta * 2;
  };

  const categories = useMemo(
    () => [
      'Semua',
      ...Array.from(
        new Set(artikelList.map((a) => a.kategori || 'Uncategorized')),
      ),
    ],
    [artikelList],
  );
  const getCategoryCount = (cat: string) =>
    cat === 'Semua'
      ? artikelList.length
      : artikelList.filter((item) => item.kategori === cat).length;
  const loopCategories = useMemo(
    () => [...categories, ...categories, ...categories],
    [categories],
  );

  const filteredAndSortedList = useMemo(() => {
    let result = artikelList.filter((item) => {
      const matchFilter =
        activeFilter === 'Semua' || item.kategori === activeFilter;
      const matchSearch =
        item.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.kategori.toLowerCase().includes(searchTerm.toLowerCase());
      return matchFilter && matchSearch;
    });
    if (sortBy === 'terbaru')
      result.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    else if (sortBy === 'terlama')
      result.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      );
    else if (sortBy === 'terpopuler') result.sort((a, b) => b.views - a.views);
    return result;
  }, [artikelList, activeFilter, searchTerm, sortBy]);

  const timeMarks = useMemo(() => {
    const marks: any[] = [];
    const seenLabels = new Set();
    filteredAndSortedList.forEach((item, index) => {
      const d = new Date(item.created_at);
      const label = d.toLocaleString('id-ID', {
        month: 'short',
        year: '2-digit',
      });
      if (!seenLabels.has(label)) {
        seenLabels.add(label);
        marks.push({
          label,
          id: `time-${d.getMonth()}-${d.getFullYear()}`,
          index,
        });
      }
    });
    return marks;
  }, [filteredAndSortedList]);

  const scrollToTime = (markId: string, indexInList: number) => {
    if (indexInList >= visibleCount) {
      setVisibleCount(indexInList + 6);
      setTimeout(() => {
        const element = document.getElementById(markId);
        if (element)
          window.scrollTo({ top: element.offsetTop - 150, behavior: 'smooth' });
      }, 150);
    } else {
      const element = document.getElementById(markId);
      if (element)
        window.scrollTo({ top: element.offsetTop - 150, behavior: 'smooth' });
    }
  };

  const topArticles = useMemo(() => {
    if (artikelList.length === 0) return [];
    return [...artikelList].sort((a, b) => b.views - a.views).slice(0, 5);
  }, [artikelList]);

  useEffect(() => {
    if (topArticles.length > 0) {
      const interval = setInterval(() => {
        setFeaturedIndex((prev) => (prev + 1) % topArticles.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [topArticles]);

  const featuredArticle = topArticles[featuredIndex];
  const visibleArticles = filteredAndSortedList.slice(0, visibleCount);
  const remainingArticlesCount = filteredAndSortedList.length - visibleCount;

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };
  const containerStagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  return (
    <div className='min-h-screen bg-[#f8fafc] pb-36 pt-8 md:pt-10 px-4 md:px-10 font-sans relative'>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .preserve-3d { transform-style: preserve-3d; } .perspective { perspective: 1000px; } 
        .hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .magazine-grid { column-count: 1; column-gap: 1.5rem; }
        @media (min-width: 768px) { .magazine-grid { column-count: 2; } }
        @media (min-width: 1024px) { .magazine-grid { column-count: 3; } }
        .magazine-item { break-inside: avoid; margin-bottom: 1.5rem; }
      `,
        }}
      />

      {!isLoading && timeMarks.length > 1 && (
        <div className='fixed right-2 md:right-6 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-2 py-4 px-1 bg-white/40 backdrop-blur-md rounded-full border border-white/20 hidden sm:flex shadow-2xl pointer-events-auto'>
          {timeMarks.map((mark, i) => (
            <button
              key={i}
              onClick={() => scrollToTime(mark.id, mark.index)}
              className='group relative flex items-center justify-center w-8 h-8 rounded-full hover:bg-teal-500 transition-all'>
              <div className='w-1.5 h-1.5 rounded-full bg-teal-500 group-hover:bg-white transition-colors'></div>
              <span className='absolute right-full mr-3 px-2 py-1 rounded bg-slate-900 text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl'>
                {mark.label}
              </span>
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            onClick={scrollToTop}
            className='fixed bottom-28 right-4 md:right-6 z-40 bg-teal-600 hover:bg-teal-700 text-white p-3 rounded-full shadow-[0_4px_20px_rgba(15,118,110,0.5)] transition-all pointer-events-auto'>
            <ChevronUp className='w-5 h-5 md:w-6 md:h-6' />
          </motion.button>
        )}
      </AnimatePresence>

      <motion.div
        initial='hidden'
        animate='visible'
        variants={containerStagger}
        className='max-w-7xl mx-auto space-y-6 md:space-y-8 relative'>
        {/* ==================================================== */}
        {/* iOS-STYLE STICKY HEADER DENGAN FULL-WIDTH MOBILE SEARCH */}
        {/* ==================================================== */}
        <div
          className={`sticky top-[80px] md:top-[96px] z-[30] bg-transparent py-2 md:py-3 -mx-4 px-4 md:mx-0 md:px-0 flex justify-between items-center gap-3 lg:gap-6 pointer-events-none`}>
          {/* KIRI: Sapaan Situasional (Animasi Menghilang saat Mobile Search Aktif) */}
          <div
            className={`flex items-start justify-center relative pointer-events-auto select-none transition-all duration-500 ease-in-out overflow-hidden ${isMobileSearchOpen ? 'max-w-0 opacity-0 -translate-x-10' : 'flex-1 lg:flex-none opacity-100 translate-x-0'}`}>
            {/* Titik Point Indikator (MNI Primary) */}
            <div
              className={`mt-2 md:mt-2.5 mr-2 md:mr-3 w-2 h-2 md:w-2.5 md:h-2.5 rounded-full transition-colors duration-300 shrink-0 ${isScrolled ? 'bg-white shadow-md' : 'bg-[#0f766e]'}`}
            />

            <div
              className={`transition-all duration-300 z-10 ${isScrolled ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]' : 'text-[#0f766e]'}`}>
              <h1
                className={`tracking-tight transition-all duration-300 origin-left ${isScrolled ? 'font-semibold text-base md:text-lg' : 'font-bold text-xl md:text-2xl'}`}>
                {greeting.title}
              </h1>
              <div
                className={`transition-all duration-300 overflow-hidden ${isScrolled ? 'max-h-0 opacity-0' : 'max-h-20 opacity-100'}`}>
                <p
                  className={`text-[11px] md:text-xs font-medium ${isScrolled ? '' : 'text-slate-500'}`}>
                  {greeting.subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* KANAN: Search & View Mode Toggle (Animasi Memanjang saat Mobile Search Aktif) */}
          <div
            className={`flex items-center gap-2 relative z-[70] transition-all duration-500 pointer-events-auto ${isMobileSearchOpen ? 'w-full' : 'w-auto'}`}>
            {/* SEARCH DESKTOP (Lebih Gemuk) */}
            <div className='hidden md:block w-[320px] relative'>
              <Search className='w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400' />
              <input
                ref={searchInputRef}
                type='text'
                placeholder='Cari judul atau topik...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                className='w-full pl-10 pr-10 py-2 md:py-2.5 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-xs md:text-sm font-medium shadow-sm'
              />
              <div className='absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center'>
                <button
                  onClick={startListening}
                  className='p-1.5 rounded-lg hover:bg-slate-100 transition-colors'
                  title='Pencarian Suara'>
                  {isListening ? (
                    <Mic className='w-3.5 h-3.5 text-red-500 animate-pulse' />
                  ) : (
                    <MicOff className='w-3.5 h-3.5 text-slate-400' />
                  )}
                </button>
              </div>
            </div>

            {/* MOBILE SEARCH OVERLAY (Membentang Penuh secara Horizontal) */}
            <AnimatePresence>
              {isMobileSearchOpen && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: '100%', opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  className='md:hidden flex items-center gap-2 overflow-hidden w-full'>
                  <div className='flex-1 relative w-full'>
                    <Search className='w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400' />
                    <input
                      ref={searchInputMobileRef}
                      autoFocus
                      type='text'
                      placeholder='Ketik kata kunci...'
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() =>
                        setTimeout(() => setIsSearchFocused(false), 200)
                      }
                      className='w-full pl-9 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:border-teal-500 transition-all text-sm font-medium shadow-sm'
                    />
                    <div className='absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center'>
                      <button
                        onClick={startListening}
                        className='p-1.5 rounded-lg hover:bg-slate-100 transition-colors'>
                        {isListening ? (
                          <Mic className='w-3.5 h-3.5 text-red-500 animate-pulse' />
                        ) : (
                          <MicOff className='w-3.5 h-3.5 text-slate-400' />
                        )}
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsMobileSearchOpen(false);
                      setSearchTerm('');
                    }}
                    className='shrink-0 p-2.5 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-xl shadow-sm'>
                    <X className='w-4 h-4' />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* MOBILE SEARCH ICON TOGGLE (Sembunyi saat aktif) */}
            {!isMobileSearchOpen && (
              <button
                onClick={() => setIsMobileSearchOpen(true)}
                className='md:hidden flex items-center justify-center bg-white/95 backdrop-blur-sm border border-slate-200 w-[38px] h-[38px] rounded-xl shadow-sm text-slate-500 hover:text-teal-600 transition-colors shrink-0'>
                <Search className='w-4 h-4' />
              </button>
            )}

            {/* View Modes Toggle (Lebih Gemuk & Sembunyi di HP saat Search aktif) */}
            <div
              className={`items-center bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-1 shadow-sm shrink-0 h-[38px] md:h-[42px] ${isMobileSearchOpen ? 'hidden md:flex' : 'flex'}`}>
              <button
                onClick={() => setViewMode('grid')}
                className={`h-full px-2.5 rounded-lg transition-all flex items-center justify-center ${viewMode === 'grid' ? 'bg-teal-50 text-teal-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                title='Grid'>
                <LayoutGrid className='w-4 h-4' />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`h-full px-2.5 rounded-lg transition-all flex items-center justify-center ${viewMode === 'list' ? 'bg-teal-50 text-teal-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                title='List'>
                <List className='w-4 h-4' />
              </button>
              <button
                onClick={() => setViewMode('magazine')}
                className={`h-full px-2.5 rounded-lg transition-all flex items-center justify-center ${viewMode === 'magazine' ? 'bg-teal-50 text-teal-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                title='Magazine'>
                <Columns className='w-4 h-4' />
              </button>
            </div>

            {/* AUTOCOMPLETE UNIVERSAL (Komplit & Detail) */}
            <AnimatePresence>
              {isSearchFocused && searchTerm.trim() !== '' && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className='absolute top-[120%] left-0 right-0 md:w-[320px] bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden z-[90]'>
                  {filteredAndSortedList.slice(0, 4).length > 0 ? (
                    <div className='flex flex-col'>
                      <div className='px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between'>
                        <span className='text-[10px] font-bold text-slate-400 uppercase tracking-wider'>
                          Hasil Pencarian
                        </span>
                      </div>
                      {filteredAndSortedList.slice(0, 4).map((item) => {
                        const isRead = readArticles.includes(item.slug);
                        const readTime = getReadingTime(item.konten);
                        return (
                          <Link
                            key={`auto-${item.id}`}
                            href={`/media/${item.slug}`}
                            onClick={() => markAsRead(item.slug)}
                            className='px-4 py-3 hover:bg-teal-50 flex items-center gap-3 border-b border-slate-50 last:border-0 transition-colors group'>
                            <Search className='w-3.5 h-3.5 text-slate-300 group-hover:text-teal-500 shrink-0' />
                            <div className='flex-1 overflow-hidden'>
                              <p
                                className={`text-xs md:text-sm font-bold truncate transition-colors ${isRead ? 'text-slate-500' : 'text-slate-800 group-hover:text-teal-700'}`}>
                                <HighlightText
                                  text={item.judul}
                                  highlight={searchTerm}
                                />
                              </p>

                              {/* Semua Penanda Muncul di Autocomplete */}
                              <div className='flex flex-wrap items-center gap-1.5 mt-1.5'>
                                <span className='text-[8px] font-bold text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded uppercase'>
                                  {item.kategori}
                                </span>
                                {isRead && (
                                  <span className='text-[8px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded uppercase flex items-center'>
                                    <CheckCircle2 className='w-2 h-2 mr-0.5' />{' '}
                                    Dibaca
                                  </span>
                                )}
                                <span className='text-[8px] font-semibold text-slate-400 flex items-center'>
                                  <Clock className='w-2 h-2 mr-0.5' />{' '}
                                  {readTime} Mnt
                                </span>
                                <span className='text-[8px] font-semibold text-slate-400 flex items-center'>
                                  <Eye className='w-2 h-2 mr-0.5' />{' '}
                                  {formatViews(item.views)}
                                </span>
                                <span className='text-[8px] font-semibold text-slate-400 flex items-center ml-auto truncate max-w-[80px]'>
                                  <User className='w-2 h-2 mr-0.5 shrink-0' />{' '}
                                  {item.penulis}
                                </span>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <div className='px-4 py-6 text-center flex flex-col items-center'>
                      <Search className='w-8 h-8 text-slate-200 mb-2' />
                      <p className='text-xs font-bold text-slate-600'>
                        Tidak ada hasil
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* FEATURED ARTICLE BANNER (Disempurnakan & Proporsional Mobile) */}
        {!isLoading &&
          featuredArticle &&
          searchTerm === '' &&
          activeFilter === 'Semua' &&
          sortBy === 'terbaru' && (
            <motion.div
              variants={fadeInUp}
              className='relative z-0 mt-2'
              layout>
              <AnimatePresence mode='wait'>
                <motion.div
                  key={featuredArticle.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.5 }}>
                  <Link
                    href={`/media/${featuredArticle.slug}`}
                    onClick={() => markAsRead(featuredArticle.slug)}
                    className='group relative bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl aspect-[1/1] sm:aspect-[4/3] md:aspect-[21/9] flex items-end block'>
                    <img
                      src={
                        featuredArticle.cover_url ||
                        'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&q=80'
                      }
                      alt={featuredArticle.judul}
                      className='absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000'
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent'></div>
                    <div className='absolute -bottom-10 -right-10 opacity-10 pointer-events-none group-hover:scale-[2] group-hover:-rotate-12 transition-transform duration-1000 ease-out z-0'>
                      <BookOpen className='w-64 h-64 text-white' />
                    </div>

                    <div className='relative z-10 p-5 md:p-12 w-full'>
                      <div className='flex flex-wrap items-center gap-1.5 md:gap-2 mb-2 md:mb-4'>
                        <span className='bg-teal-600 text-white text-[9px] md:text-[10px] font-bold px-2.5 py-1 md:px-3 md:py-1.5 rounded-full uppercase tracking-wider'>
                          Pilihan Redaksi
                        </span>
                        {readArticles.includes(featuredArticle.slug) && (
                          <span className='bg-slate-800/80 backdrop-blur-md border border-white/10 text-slate-300 text-[9px] md:text-[10px] font-bold px-2.5 py-1 md:px-3 md:py-1.5 rounded-full flex items-center'>
                            <CheckCircle2 className='w-2.5 h-2.5 md:w-3 h-3 mr-1' />{' '}
                            Dibaca
                          </span>
                        )}
                        <span className='bg-white/20 backdrop-blur-md border border-white/20 text-white text-[9px] md:text-[10px] font-bold px-2.5 py-1 md:px-3 md:py-1.5 rounded-full flex items-center'>
                          <Clock className='w-2.5 h-2.5 md:w-3 h-3 mr-1' />{' '}
                          {getReadingTime(featuredArticle.konten)} Mnt
                        </span>
                        <span className='bg-white/20 backdrop-blur-md border border-white/20 text-white text-[9px] md:text-[10px] font-bold px-2.5 py-1 md:px-3 md:py-1.5 rounded-full flex items-center'>
                          <Eye className='w-2.5 h-2.5 md:w-3 h-3 mr-1' />{' '}
                          {formatViews(featuredArticle.views)} Views
                        </span>
                      </div>
                      {/* Judul proporsional di mobile (text-xl line-clamp-3) */}
                      <h2
                        className={`text-xl sm:text-2xl md:text-4xl font-bold leading-tight md:leading-snug mb-2 md:mb-4 line-clamp-3 md:line-clamp-none ${readArticles.includes(featuredArticle.slug) ? 'text-slate-400' : 'text-white group-hover:text-teal-300 transition-colors'}`}>
                        {featuredArticle.judul}
                      </h2>
                      <div className='flex flex-wrap items-center text-slate-300 text-[10px] md:text-sm font-medium gap-4 md:gap-6'>
                        <span className='flex items-center text-teal-100'>
                          <User className='w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2' />{' '}
                          {featuredArticle.penulis}
                        </span>
                        <span className='flex items-center'>
                          <Calendar className='w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2' />{' '}
                          {formatWaktu(featuredArticle.created_at)}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}

        {/* LOADING & CONTENT GRID */}
        {isLoading ? (
          <div className='flex justify-center py-20'>
            <Loader2 className='w-10 h-10 animate-spin text-[#0f766e]' />
          </div>
        ) : visibleArticles.length === 0 ? (
          <div className='text-center py-20 bg-white rounded-[2rem] border border-slate-200 relative z-0'>
            <BookOpen className='w-16 h-16 text-slate-200 mx-auto mb-4' />
            <h3 className='text-xl font-bold text-slate-700'>
              Belum Ada Konten
            </h3>
            <p className='text-slate-500 mt-2'>Konten tidak ditemukan.</p>
          </div>
        ) : (
          <>
            <motion.div
              variants={containerStagger}
              className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6' : viewMode === 'list' ? 'flex flex-col gap-4' : 'magazine-grid'} perspective relative z-0 mt-4`}>
              <AnimatePresence>
                {visibleArticles.map((item, index) => {
                  const Icon = iconMap[item.tipe] || FileText;
                  const isRead = readArticles.includes(item.slug);
                  const readTime = getReadingTime(item.konten);

                  const d = new Date(item.created_at);
                  const timeId = `time-${d.getMonth()}-${d.getFullYear()}`;
                  const isFirstInTime =
                    filteredAndSortedList.findIndex((a) => {
                      const ad = new Date(a.created_at);
                      return (
                        ad.getMonth() === d.getMonth() &&
                        ad.getFullYear() === d.getFullYear()
                      );
                    }) === index;

                  if (viewMode === 'list') {
                    return (
                      <motion.div
                        key={item.id}
                        id={isFirstInTime ? timeId : undefined}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}>
                        <Link
                          href={`/media/${item.slug}`}
                          onClick={() => markAsRead(item.slug)}
                          className='group relative flex flex-col md:flex-row items-start md:items-center bg-white p-3 md:p-4 rounded-[1.5rem] md:rounded-3xl border border-slate-200 hover:border-teal-300 hover:shadow-lg transition-all gap-3 md:gap-6 overflow-hidden'>
                          <div className='absolute right-0 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none group-hover:scale-[2.5] group-hover:-rotate-12 transition-transform duration-700 ease-out z-0'>
                            <Icon className='w-40 h-40 text-[#0f766e]' />
                          </div>

                          <div className='w-full md:w-48 h-36 md:h-24 shrink-0 rounded-[1rem] md:rounded-2xl overflow-hidden bg-slate-100 relative z-10'>
                            {item.cover_url ? (
                              <img
                                src={item.cover_url}
                                alt={item.judul}
                                className={`w-full h-full object-cover group-hover:scale-105 transition-transform ${isRead ? 'opacity-80 grayscale-[20%]' : ''}`}
                              />
                            ) : (
                              <div className='w-full h-full flex items-center justify-center opacity-20'>
                                <Icon className='w-8 h-8 text-[#0f766e]' />
                              </div>
                            )}

                            <div className='absolute bottom-2 right-2 bg-white/90 backdrop-blur-md px-2 py-1 rounded-md text-[9px] font-bold text-slate-700 uppercase shadow-sm z-20 flex items-center'>
                              <Icon className='w-3 h-3 mr-1 text-teal-600 shrink-0' />
                              <span className='leading-none pt-[1px]'>
                                {item.tipe}
                              </span>
                            </div>

                            <button
                              onClick={(e) => handleQuickShare(e, item)}
                              className='absolute top-2 right-2 bg-green-500/90 hover:bg-green-500 text-white p-1.5 rounded-full shadow-md backdrop-blur-sm opacity-90 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-30'
                              title='Bagikan ke WhatsApp'>
                              <Share2 className='w-3.5 h-3.5' />
                            </button>
                          </div>

                          <div className='flex-1 w-full relative z-10 px-1 md:px-0 py-1'>
                            <div className='flex flex-wrap items-center gap-1.5 md:gap-2 mb-2'>
                              <span className='text-[9px] md:text-[10px] font-bold text-teal-600 uppercase tracking-wider bg-teal-50 px-2 md:px-2.5 py-1 rounded-md'>
                                {item.kategori}
                              </span>
                              {isRead && (
                                <span className='text-[8px] md:text-[9px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-1.5 md:px-2 py-0.5 md:py-1 rounded-md uppercase flex items-center'>
                                  <CheckCircle2 className='w-2.5 h-2.5 md:w-3 md:h-3 mr-0.5 md:mr-1 text-slate-400' />{' '}
                                  Dibaca
                                </span>
                              )}
                              <span className='text-[9px] md:text-[10px] font-semibold text-slate-400 flex items-center'>
                                <Clock className='w-2.5 h-2.5 md:w-3 md:h-3 mr-1' />{' '}
                                {readTime} Mnt
                              </span>
                              <span className='text-[9px] md:text-[10px] font-semibold text-slate-400 flex items-center ml-auto md:ml-0'>
                                <Eye className='w-2.5 h-2.5 md:w-3 md:h-3 mr-1' />{' '}
                                {formatViews(item.views)}
                              </span>
                            </div>

                            <div className='flex items-start gap-2 mb-2'>
                              <h3
                                className={`text-base md:text-lg font-bold leading-snug transition-colors line-clamp-2 md:line-clamp-1 ${isRead ? 'text-slate-500 group-hover:text-teal-600' : 'text-slate-800 group-hover:text-teal-700'}`}>
                                <HighlightText
                                  text={item.judul}
                                  highlight={searchTerm}
                                />
                              </h3>
                            </div>

                            <div className='flex items-center justify-between text-[10px] md:text-xs font-medium text-slate-500 border-t border-slate-50 pt-2 md:border-0 md:pt-0'>
                              <div className='flex items-center'>
                                <User className='w-3 h-3 md:w-3.5 md:h-3.5 mr-1.5 text-slate-400' />{' '}
                                {item.penulis}
                              </div>
                              <span>{formatWaktu(item.created_at)}</span>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  }

                  return (
                    <motion.div
                      key={item.id}
                      id={isFirstInTime ? timeId : undefined}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      className={`relative ${viewMode === 'magazine' ? 'magazine-item' : ''}`}
                      onMouseMove={(e) => {
                        if (window.innerWidth < 1024) return;
                        const card = e.currentTarget;
                        const { width, height, left, top } =
                          card.getBoundingClientRect();
                        const target = card.querySelector(
                          '.grid-card',
                        ) as HTMLElement;
                        if (target) {
                          target.style.transform = `rotateX(${-((e.clientY - top - height / 2) / (height / 2)) * 15}deg) rotateY(${((e.clientX - left - width / 2) / (width / 2)) * 15}deg)`;
                          target.style.zIndex = '30';
                        }
                      }}
                      onMouseLeave={(e) => {
                        const target = e.currentTarget.querySelector(
                          '.grid-card',
                        ) as HTMLElement;
                        if (target) {
                          target.style.transform = `rotateX(0deg) rotateY(0deg)`;
                          target.style.zIndex = '1';
                        }
                      }}>
                      <Link
                        href={`/media/${item.slug}`}
                        onClick={() => markAsRead(item.slug)}
                        className='group block bg-white border border-slate-200 rounded-[1.5rem] md:rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all h-full flex flex-col preserve-3d grid-card transition-transform duration-100 ease-out'>
                        <div className='absolute -bottom-12 -right-12 opacity-[0.03] group-hover:opacity-[0.1] pointer-events-none group-hover:scale-[3] group-hover:-rotate-12 transition-all duration-1000 ease-out transform-gpu z-0 group-hover:translate-z-10'>
                          <Icon className='w-64 h-64 text-[#0f766e]' />
                        </div>

                        <div
                          className={`relative overflow-hidden bg-slate-100 z-10 shrink-0 ${viewMode === 'magazine' && index % 2 === 0 ? 'aspect-[4/5] md:aspect-[4/5]' : 'aspect-[4/3] md:aspect-video'}`}
                          onMouseEnter={() => handlePeekStart(item.id)}
                          onMouseLeave={handlePeekEnd}
                          onTouchStart={() => handlePeekStart(item.id)}
                          onTouchEnd={handlePeekEnd}>
                          {item.cover_url ? (
                            <img
                              src={item.cover_url}
                              alt={item.judul}
                              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ${isRead ? 'opacity-80 grayscale-[20%]' : ''}`}
                            />
                          ) : (
                            <div className='w-full h-full flex items-center justify-center opacity-20'>
                              <Icon className='w-20 h-20 text-[#0f766e]' />
                            </div>
                          )}

                          <div className='absolute bottom-2 md:bottom-3 right-2 md:right-3 bg-white/90 backdrop-blur-md px-2 md:px-2.5 py-1 md:py-1.5 rounded-md md:rounded-lg text-[9px] md:text-[10px] font-bold text-slate-700 uppercase shadow-sm z-20 flex items-center'>
                            <Icon className='w-3 h-3 mr-1 md:mr-1.5 text-teal-600 shrink-0' />
                            <span className='leading-none pt-[1px]'>
                              {item.tipe}
                            </span>
                          </div>

                          <button
                            onClick={(e) => handleQuickShare(e, item)}
                            className='absolute top-2 right-2 md:top-3 md:right-3 bg-green-500/90 hover:bg-green-500 text-white p-2 rounded-full shadow-lg backdrop-blur-sm opacity-90 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-30'
                            title='Bagikan ke WhatsApp'>
                            <Share2 className='w-4 h-4' />
                          </button>

                          <AnimatePresence>
                            {peekedArticleId === item.id && (
                              <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className='absolute inset-0 bg-slate-900/85 backdrop-blur-sm p-4 md:p-5 flex items-center justify-center z-20'>
                                <p className='text-white text-xs md:text-sm italic font-medium leading-relaxed'>
                                  "{getSnippet(item.konten)}"
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <div className='p-4 md:p-6 flex flex-col flex-1 relative z-10 translate-z-20'>
                          <div className='flex flex-wrap items-center gap-1.5 md:gap-2 mb-3'>
                            <span className='text-[9px] md:text-[10px] font-bold text-teal-600 uppercase tracking-wider bg-teal-50 px-2 md:px-2.5 py-1 rounded-md'>
                              {item.kategori}
                            </span>
                            {isRead && (
                              <span className='text-[8px] md:text-[9px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-1.5 md:px-2 py-0.5 md:py-1 rounded-md uppercase flex items-center'>
                                <CheckCircle2 className='w-2.5 h-2.5 md:w-3 md:h-3 mr-0.5 md:mr-1 text-slate-400' />{' '}
                                Dibaca
                              </span>
                            )}
                            <span className='text-[9px] md:text-[10px] font-semibold text-slate-400 flex items-center'>
                              <Clock className='w-2.5 h-2.5 md:w-3 md:h-3 mr-1' />{' '}
                              {readTime} Mnt
                            </span>
                            <span className='text-[9px] md:text-[10px] font-semibold text-slate-400 flex items-center ml-auto md:ml-0'>
                              <Eye className='w-2.5 h-2.5 md:w-3 md:h-3 mr-1' />{' '}
                              {formatViews(item.views)}
                            </span>
                          </div>

                          <div className='flex items-start gap-2 mb-3'>
                            <h3
                              className={`text-base md:text-lg font-bold leading-snug transition-colors line-clamp-2 ${isRead ? 'text-slate-500 group-hover:text-teal-600' : 'text-slate-800 group-hover:text-teal-700'}`}>
                              <HighlightText
                                text={item.judul}
                                highlight={searchTerm}
                              />
                            </h3>
                          </div>

                          <div className='mt-auto pt-3 md:pt-4 border-t border-slate-100 flex items-center justify-between'>
                            <div className='flex items-center text-[10px] md:text-xs font-semibold text-slate-500'>
                              <User className='w-3 h-3 md:w-3.5 md:h-3.5 mr-1.5 text-slate-400' />{' '}
                              {item.penulis}
                            </div>
                            <span className='text-[9px] md:text-[10px] text-slate-400 font-medium'>
                              {formatWaktu(item.created_at)}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>

            {/* TOMBOL MUAT LEBIH BANYAK + SUPERSCRIPT BERSIH */}
            {visibleCount < filteredAndSortedList.length && (
              <div className='flex justify-center pt-10 pb-4 relative z-10 pointer-events-auto'>
                <button
                  onClick={() => setVisibleCount((prev) => prev + 9)}
                  className='bg-white border-2 border-slate-200 text-teal-600 text-xs md:text-sm font-bold px-6 py-2.5 md:px-8 md:py-3 rounded-full hover:bg-teal-50 hover:border-teal-300 shadow-sm hover:shadow-md transition-all flex items-center'>
                  Muat Lebih Banyak{' '}
                  <sup className='ml-1 opacity-80 font-black text-[9px] md:text-[10px]'>
                    {remainingArticlesCount}
                  </sup>
                </button>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* ==================================================== */}
      {/* BOTTOM STICKY PILL (LEBIH GEMUK & DADU PRESISI) */}
      {/* ==================================================== */}
      <motion.div
        className={`fixed bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 z-[70] w-[94%] sm:w-max max-w-full bg-slate-900/95 backdrop-blur-2xl border border-white/10 shadow-[0_15px_40px_rgba(0,0,0,0.5)] rounded-full p-2 md:p-2.5 flex items-center transition-all duration-500 pointer-events-auto ${isScrolled ? 'translate-y-0 opacity-100' : 'translate-y-28 opacity-0 pointer-events-none'}`}>
        <div
          className='relative w-[180px] sm:w-[50vw] md:w-[380px] flex items-center overflow-x-auto hide-scrollbar rounded-l-full'
          style={{
            WebkitMaskImage:
              'linear-gradient(to right, black 85%, transparent 100%)',
            maskImage: 'linear-gradient(to right, black 85%, transparent 100%)',
          }}
          ref={trackRef}
          onScroll={handleManualScroll}
          onTouchStart={() => (isTouchingRef.current = true)}
          onTouchEnd={() => (isTouchingRef.current = false)}
          onMouseEnter={() => (isTouchingRef.current = true)}
          onMouseLeave={() => (isTouchingRef.current = false)}>
          <div className='flex gap-1.5 px-2 w-max'>
            {loopCategories.map((filter, idx) => (
              <button
                key={idx}
                onClick={() => setActiveFilter(filter)}
                className={`cat-btn shrink-0 px-4 md:px-5 py-2 md:py-2.5 rounded-full text-[10px] md:text-xs font-bold transition-all ${activeFilter === filter ? 'bg-teal-500 text-white shadow-md' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}>
                {filter}
                {getCategoryCount(filter) > 1 && (
                  <sup className='ml-0.5 text-[8px] opacity-70'>
                    {getCategoryCount(filter)}
                  </sup>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className='w-px h-6 md:h-7 bg-white/20 mx-1.5 md:mx-2 shrink-0'></div>

        {/* SORTING IN PILL */}
        <div className='flex items-center shrink-0 px-1 py-1 cursor-pointer'>
          <Filter className='w-3.5 h-3.5 text-slate-300 mr-1' />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className='bg-transparent text-[10px] md:text-xs font-bold text-white outline-none cursor-pointer appearance-none pr-1'>
            <option
              value='terbaru'
              className='bg-slate-800'>
              Terbaru
            </option>
            <option
              value='terlama'
              className='bg-slate-800'>
              Terlama
            </option>
            <option
              value='terpopuler'
              className='bg-slate-800'>
              Populer
            </option>
          </select>
        </div>

        <div className='w-px h-6 md:h-7 bg-white/20 mx-1.5 md:mx-2 shrink-0'></div>

        {/* DADU PRESISI DI SISI KANAN PILL (Mengisi ruang padding agar pas bulat) */}
        <button
          onClick={handleRandomArticle}
          className='flex items-center justify-center shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-full bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-white transition-all shadow-md ml-auto mr-0.5 md:mr-1'
          title='Gacha Hidayah'>
          <Dices className='w-4 h-4 md:w-5 md:h-5' />
        </button>
      </motion.div>
    </div>
  );
}
