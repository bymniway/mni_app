'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  User,
  Eye,
  Tag,
  Share2,
  Loader2,
  Download,
  BookOpen,
  PlayCircle,
  FileText,
  ChevronRight,
  Hash,
  Clock,
  ArrowUp,
  Volume2,
  Square,
  Type,
  Quote,
  Play,
  Pause,
  Zap,
  ScanLine,
} from 'lucide-react';

// ==========================================
// UTILITY FUNCTIONS
// ==========================================
const formatWaktu = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    weekday: 'long',
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

const iconMap: any = {
  Video: PlayCircle,
  Khutbah: BookOpen,
  Artikel: FileText,
};

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function DetailMediaPage() {
  const { slug } = useParams();
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);

  const [artikel, setArtikel] = useState<any>(null);
  const [rekomendasi, setRekomendasi] = useState<any[]>([]);
  const [tags, setTags] = useState<{ name: string; count: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Core State
  const [showFloatingBar, setShowFloatingBar] = useState(false);
  const [fontSizeLevel, setFontSizeLevel] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selection, setSelection] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);

  // Eksperimen Baru: Auto Scroll (Teleprompter)
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(1); // Pengatur kecepatan

  // Eksperimen Baru: Bionic Reading
  const [isBionic, setIsBionic] = useState(false);
  const [bionicHtml, setBionicHtml] = useState<string>('');

  // Eksperimen Baru: Focus Line Ruler
  const [isFocusRuler, setIsFocusRuler] = useState(false);

  // Fitur Reading Progress Bar
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('artikel')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error || !data) {
        router.push('/media');
        return;
      }
      setArtikel(data);

      if (data) {
        await supabase
          .from('artikel')
          .update({ views: data.views + 1 })
          .eq('id', data.id);

        const { data: recData } = await supabase
          .from('artikel')
          .select('*')
          .eq('is_published', true)
          .neq('id', data.id)
          .order('views', { ascending: false })
          .limit(4);
        if (recData) setRekomendasi(recData);

        const { data: catData } = await supabase
          .from('artikel')
          .select('kategori')
          .eq('is_published', true);
        if (catData) {
          const counts: any = {};
          catData.forEach((item) => {
            if (item.kategori)
              counts[item.kategori] = (counts[item.kategori] || 0) + 1;
          });
          const sortedTags = Object.keys(counts)
            .map((name) => ({ name, count: counts[name] }))
            .sort((a, b) => b.count - a.count);
          setTags(sortedTags);
        }
      }
      setIsLoading(false);
    };
    if (slug) fetchData();
  }, [slug, router]);

  // LOGIKA: BIONIC READING (Auto-Bold)
  useEffect(() => {
    if (artikel?.konten && isBionic && !bionicHtml) {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(artikel.konten, 'text/html');
        const walk = (node: any) => {
          if (node.nodeType === 3) {
            const text = node.nodeValue;
            if (!text.trim()) return;
            const newHtml = text.replace(/([a-zA-ZÀ-ÿ]+)/g, (word: string) => {
              let mid = Math.ceil(word.length / 2);
              if (word.length === 3) mid = 1;
              return `<b style="font-weight: 900; opacity: 1;">${word.slice(0, mid)}</b><span style="opacity: 0.7; font-weight: 400;">${word.slice(mid)}</span>`;
            });
            const span = document.createElement('span');
            span.innerHTML = newHtml;
            node.replaceWith(...span.childNodes);
          } else if (node.nodeType === 1) {
            Array.from(node.childNodes).forEach(walk);
          }
        };
        Array.from(doc.body.childNodes).forEach(walk);
        setBionicHtml(doc.body.innerHTML);
      } catch (e) {
        console.error('Bionic parser error', e);
      }
    }
  }, [isBionic, artikel]);

  // LOGIKA: AUTO SCROLL dengan Speed Multiplier
  useEffect(() => {
    let animationFrameId: number;
    const scroll = () => {
      if (isAutoScrolling) {
        window.scrollBy(0, 1.2 * scrollSpeed);
        animationFrameId = requestAnimationFrame(scroll);
      }
    };
    if (isAutoScrolling) animationFrameId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isAutoScrolling, scrollSpeed]);

  // FIX: Hentikan auto scroll HANYA kalau layar utama yang discroll
  useEffect(() => {
    const handleManualScroll = (e: Event) => {
      // Abaikan jika yang digeser adalah menu Floating Pill
      const target = e.target as Element;
      if (target.closest('#floating-pill-container')) return;

      if (isAutoScrolling) setIsAutoScrolling(false);
    };

    // Menggunakan touchmove agar tidak mati saat layar sekadar ditap
    window.addEventListener('wheel', handleManualScroll);
    window.addEventListener('touchmove', handleManualScroll, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleManualScroll);
      window.removeEventListener('touchmove', handleManualScroll);
    };
  }, [isAutoScrolling]);

  // LOGIKA: Text Selection Share (Highlight Instan)
  const handleTextSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.toString().trim().length > 10) {
      const range = sel.getRangeAt(0).getBoundingClientRect();
      setSelection({
        text: sel.toString(),
        x: range.left + range.width / 2,
        y: range.top + window.scrollY - 60,
      });
    } else {
      setSelection(null);
    }
  };

  const shareQuote = () => {
    if (!selection) return;
    const text = encodeURIComponent(
      `"${selection.text}"\n\nBaca selengkapnya di: ${window.location.href}`,
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    setSelection(null);
  };

  const handleShare = () => {
    const textInfo = encodeURIComponent(
      `Bacalah konten bermanfaat ini: "${artikel?.judul}"\n\n${window.location.href}`,
    );
    window.open(`https://api.whatsapp.com/send?text=${textInfo}`, '_blank');
  };

  // LOGIKA: Audio Reader (Text-to-Speech)
  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Browser Anda belum mendukung fitur Pembaca Suara.');
      return;
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = artikel?.konten || '';
      const textToRead = tempDiv.textContent || tempDiv.innerText || '';

      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = 'id-ID';
      utterance.rate = 0.9;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window)
        window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowFloatingBar(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mouseup', handleTextSelection);
    document.addEventListener('touchend', handleTextSelection);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mouseup', handleTextSelection);
      document.removeEventListener('touchend', handleTextSelection);
    };
  }, []);

  const handlePrint = () => window.print();
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const fontSizes = [
    { p: '1.125rem', h2: '1.875rem', drop: '4rem' },
    { p: '1.35rem', h2: '2.1rem', drop: '4.5rem' },
    { p: '1.6rem', h2: '2.5rem', drop: '5.2rem' },
  ];

  if (isLoading)
    return (
      <div className='min-h-screen flex items-center justify-center bg-[#f8fafc]'>
        <div className='flex flex-col items-center'>
          <Loader2 className='w-12 h-12 animate-spin text-teal-600 mb-4' />
          <p className='text-slate-400 font-bold text-sm tracking-widest animate-pulse'>
            MENYIAPKAN HALAMAN...
          </p>
        </div>
      </div>
    );

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div className='min-h-screen bg-[#f8fafc] pb-24 font-sans print:bg-white print:pb-0 relative'>
      {/* READING PROGRESS BAR */}
      <motion.div
        className='fixed top-0 left-0 right-0 h-1.5 bg-teal-500 z-[110] origin-left shadow-[0_0_10px_rgba(20,184,166,0.5)] no-print'
        style={{ scaleX }}
      />

      {/* OVERLAY: FOCUS LINE RULER */}
      {isFocusRuler && (
        <div className='fixed inset-0 z-[105] pointer-events-none flex flex-col justify-center transition-opacity duration-300 no-print'>
          <div className='h-[40vh] w-full bg-slate-900/40 backdrop-blur-[1px]'></div>
          <div className='h-[20vh] w-full border-y-2 border-teal-400 shadow-[0_0_30px_rgba(20,184,166,0.15)] bg-transparent'></div>
          <div className='h-[40vh] w-full bg-slate-900/40 backdrop-blur-[1px]'></div>
        </div>
      )}

      {/* SELECTION POPUP (Highlight Kutipan) */}
      <AnimatePresence>
        {selection && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{ left: selection.x, top: selection.y }}
            onClick={shareQuote}
            className='absolute z-[100] -translate-x-1/2 bg-slate-900 text-white px-5 py-2.5 rounded-full shadow-2xl font-bold text-xs flex items-center gap-2 hover:bg-teal-600 transition-colors border border-white/20'>
            <Quote className='w-3.5 h-3.5' /> Bagikan Kutipan
          </motion.button>
        )}
      </AnimatePresence>

      {/* CSS DYNAMIC & EDITORIAL STYLE */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        :root { --p-size: ${fontSizes[fontSizeLevel].p}; --h2-size: ${fontSizes[fontSizeLevel].h2}; --drop-size: ${fontSizes[fontSizeLevel].drop}; }
        ::selection { background: #14b8a6; color: #fff; }
        ::-moz-selection { background: #14b8a6; color: #fff; }
        .prose-dakwah p { margin-bottom: 1.6em; line-height: 1.85; font-size: var(--p-size); color: #334155; transition: font-size 0.3s ease; }
        .prose-dakwah > p:first-of-type::first-letter { font-size: var(--drop-size); font-weight: 900; float: left; margin-right: 0.75rem; line-height: 0.8; color: #0f766e; text-transform: uppercase; transition: font-size 0.3s ease; }
        .prose-dakwah h2 { font-size: var(--h2-size); font-weight: 800; color: #0f172a; margin-top: 2.5em; margin-bottom: 1em; letter-spacing: -0.025em; transition: font-size 0.3s ease; }
        .prose-dakwah h3 { font-size: 1.5rem; font-weight: 700; color: #1e293b; margin-top: 2em; margin-bottom: 1em; }
        .prose-dakwah blockquote { border-left: 5px solid #0f766e; padding: 1.5rem; background: #f0fdfa; border-radius: 0 1.5rem 1.5rem 0; font-size: 1.25rem; font-style: italic; color: #475569; margin: 2.5em 0; }
        .prose-dakwah ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1.5em; color: #475569; font-size: var(--p-size); line-height: 1.8; transition: font-size 0.3s ease; }
        .prose-dakwah ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1.5em; color: #475569; font-size: var(--p-size); line-height: 1.8; transition: font-size 0.3s ease; }
        .prose-dakwah img { border-radius: 1.5rem; margin: 3rem auto; box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1); max-width: 100%; height: auto; }
        .prose-dakwah a { color: #0ea5e9; text-decoration: underline; text-underline-offset: 4px; transition: color 0.2s; }
        .prose-dakwah a:hover { color: #0284c7; }
        .prose-dakwah .arabic { font-family: 'Amiri', serif; font-size: 2.5rem; line-height: 2.3; text-align: right; padding: 2.5rem; background: #ffffff; border: 1px solid #f1f5f9; border-radius: 1.5rem; border-right: 6px solid #0f766e; margin: 3rem 0; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.05); color: #0f172a; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        @media print {
            .no-print { display: none !important; }
            body { background: white; color: black; }
            .prose-dakwah { font-size: 12pt; }
        }
      `,
        }}
      />

      <div className='max-w-[1400px] mx-auto px-4 md:px-8 xl:px-12 pt-8 md:pt-12 flex flex-col lg:flex-row gap-8 xl:gap-16'>
        {/* ==================================================== */}
        {/* BAGIAN KIRI: KONTEN UTAMA ARTIKEL */}
        {/* ==================================================== */}
        <main className='w-full lg:w-[65%] xl:w-[70%] print:w-full'>
          <nav className='flex items-center justify-between mb-6 no-print'>
            <button
              onClick={() => router.push('/media')}
              className='flex items-center text-sm font-bold text-slate-500 hover:text-teal-600 transition-colors group'>
              <div className='w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center mr-3 group-hover:bg-teal-50 group-hover:border-teal-200 group-hover:-translate-x-1 transition-all shadow-sm'>
                <ArrowLeft className='w-4 h-4' />
              </div>
              Kembali ke Media
            </button>
            <div className='flex items-center gap-2'>
              <button
                onClick={handlePrint}
                className='p-2.5 text-slate-400 hover:text-teal-600 hover:bg-white rounded-full transition-all border border-transparent hover:border-slate-200'
                title='Cetak / Download PDF'>
                <Download className='w-5 h-5' />
              </button>
              <button
                onClick={handleShare}
                className='p-2.5 text-slate-400 hover:text-green-600 hover:bg-white rounded-full transition-all border border-transparent hover:border-slate-200'
                title='Bagikan via WA'>
                <Share2 className='w-5 h-5' />
              </button>
            </div>
          </nav>

          <div className='bg-white rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-12 lg:p-16 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative z-10'>
            <motion.header
              initial='hidden'
              animate='visible'
              variants={fadeInUp}
              className='mb-12 print:mb-6'>
              <div className='flex flex-wrap items-center gap-3 mb-8'>
                <span className='px-4 py-1.5 bg-teal-50 text-teal-700 rounded-full text-[11px] font-black uppercase tracking-widest shadow-sm'>
                  {artikel.tipe}
                </span>
                <span className='flex items-center text-[11px] font-bold text-slate-500 uppercase tracking-widest bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100'>
                  <Tag className='w-3.5 h-3.5 mr-1.5' />{' '}
                  {artikel.kategori || 'Tanpa Kategori'}
                </span>
              </div>

              <h1 className='text-3xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.15] tracking-tight mb-10'>
                {artikel.judul}
              </h1>

              <div className='flex flex-wrap items-center gap-y-6 gap-x-8 pb-8 border-b border-slate-100'>
                <div className='flex items-center'>
                  <div className='w-12 h-12 rounded-full bg-gradient-to-br from-teal-100 to-teal-50 flex items-center justify-center text-teal-600 mr-4 no-print shadow-inner'>
                    <User className='w-5 h-5' />
                  </div>
                  <div>
                    <p className='text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5'>
                      Penulis
                    </p>
                    <p className='text-sm font-bold text-slate-800'>
                      {artikel.penulis}
                    </p>
                  </div>
                </div>

                <div className='flex items-center gap-8'>
                  <div>
                    <p className='text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5'>
                      Diterbitkan
                    </p>
                    <p className='text-sm font-bold text-slate-800 flex items-center'>
                      <Calendar className='w-4 h-4 mr-2 text-slate-400 no-print' />{' '}
                      {formatWaktu(artikel.created_at)}
                    </p>
                  </div>
                  <div className='no-print'>
                    <p className='text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5'>
                      Estimasi
                    </p>
                    <p className='text-sm font-bold text-slate-800 flex items-center'>
                      <Clock className='w-4 h-4 mr-2 text-teal-500' />{' '}
                      {getReadingTime(artikel.konten)} Menit Baca
                    </p>
                  </div>
                  <div className='no-print hidden sm:block'>
                    <p className='text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5'>
                      Dilihat
                    </p>
                    <p className='text-sm font-bold text-slate-800 flex items-center'>
                      <Eye className='w-4 h-4 mr-2 text-teal-500' />{' '}
                      {artikel.views} Kali
                    </p>
                  </div>
                </div>
              </div>
            </motion.header>

            <motion.figure
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className='mb-14 w-full no-print'>
              {artikel.cover_url ? (
                <img
                  src={artikel.cover_url}
                  alt={artikel.judul}
                  className='w-full h-auto max-h-[600px] object-cover rounded-[2rem] shadow-[0_20px_50px_rgb(0,0,0,0.1)] border border-slate-100'
                />
              ) : (
                <div className='w-full aspect-[21/9] bg-slate-50 rounded-[2rem] flex flex-col items-center justify-center border-2 border-dashed border-slate-200'>
                  <BookOpen className='w-16 h-16 text-slate-300 mb-4' />
                  <span className='text-slate-400 font-bold uppercase tracking-widest text-xs'>
                    Media Center
                  </span>
                </div>
              )}
            </motion.figure>

            <motion.article
              initial='hidden'
              animate='visible'
              variants={fadeInUp}
              transition={{ delay: 0.2 }}>
              <div
                ref={contentRef}
                className='prose-dakwah relative z-10'
                dangerouslySetInnerHTML={{
                  __html: isBionic && bionicHtml ? bionicHtml : artikel.konten,
                }}
              />
            </motion.article>
          </div>

          <div className='mt-16 pt-10 border-t border-slate-200 no-print'>
            <div className='bg-gradient-to-br from-slate-50 to-white border border-slate-100 rounded-[2rem] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left shadow-sm'>
              <div>
                <h3 className='text-xl font-black text-slate-800 mb-2'>
                  Sebarkan Kebaikan Ini
                </h3>
                <p className='text-slate-500 font-medium'>
                  Satu *share* Anda bisa menjadi pintu hidayah bagi orang lain.
                </p>
              </div>
              <button
                onClick={handleShare}
                className='w-full md:w-auto bg-[#25D366] hover:bg-[#1ebd5a] text-white px-8 py-4 rounded-full font-bold flex items-center justify-center transition-all hover:-translate-y-1 shadow-lg shadow-green-500/30 shrink-0 text-lg'>
                <Share2 className='w-6 h-6 mr-3' /> Bagikan via WhatsApp
              </button>
            </div>
          </div>
        </main>

        {/* ==================================================== */}
        {/* BAGIAN KANAN: SIDEBAR REKOMENDASI (30%) */}
        {/* ==================================================== */}
        <aside className='w-full lg:w-[35%] xl:w-[30%] no-print lg:mt-0 relative pb-24'>
          <div className='sticky top-32 space-y-10'>
            {/* Widget: Subscribe */}
            <div className='bg-slate-900 rounded-[2rem] p-8 relative overflow-hidden group shadow-xl'>
              <div className='absolute top-0 right-0 p-8 opacity-10 pointer-events-none group-hover:scale-[1.7] group-hover:-rotate-12 transition-transform duration-1000 ease-out transform-gpu origin-center'>
                <BookOpen className='w-40 h-40 text-white' />
              </div>
              <div className='relative z-10'>
                <span className='bg-gradient-to-r from-teal-500 to-teal-400 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-5 inline-block shadow-sm'>
                  Media Center
                </span>
                <h4 className='text-2xl font-bold text-white mb-3 leading-tight'>
                  Dukung Syiar Digital MNI
                </h4>
                <p className='text-slate-300 text-sm mb-8 leading-relaxed font-medium'>
                  Jadikan diri Anda bagian dari penyebar kebaikan. Terus ikuti
                  update kajian dan artikel bermanfaat dari kami.
                </p>
                <Link
                  href='/media'
                  className='inline-flex items-center text-sm font-bold text-teal-300 hover:text-white transition-colors bg-white/10 hover:bg-white/20 px-5 py-2.5 rounded-xl backdrop-blur-sm'>
                  Jelajahi Konten <ChevronRight className='w-4 h-4 ml-1.5' />
                </Link>
              </div>
            </div>

            {/* Widget: Rekomendasi Artikel List */}
            {rekomendasi.length > 0 && (
              <div className='bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100'>
                <div className='flex items-center gap-3 mb-6'>
                  <div className='w-2 h-8 bg-teal-500 rounded-full'></div>
                  <h3 className='text-lg font-black text-slate-800 uppercase tracking-widest'>
                    Pilihan Redaksi
                  </h3>
                </div>

                <div className='space-y-6'>
                  {rekomendasi.map((item) => {
                    const RecIcon = iconMap[item.tipe] || FileText;
                    return (
                      <Link
                        key={item.id}
                        href={`/media/${item.slug}`}
                        className='group flex gap-4 items-center bg-white p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 shadow-sm hover:shadow-md'>
                        <div className='w-24 h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0 relative border border-slate-100'>
                          {item.cover_url ? (
                            <img
                              src={item.cover_url}
                              alt={item.judul}
                              className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
                            />
                          ) : (
                            <div className='w-full h-full flex items-center justify-center opacity-30'>
                              <RecIcon className='w-8 h-8 text-teal-600' />
                            </div>
                          )}
                        </div>
                        <div className='flex-1 py-1'>
                          <span className='text-[9px] font-black text-teal-600 uppercase tracking-wider mb-1.5 block bg-teal-50 w-max px-2 py-0.5 rounded'>
                            {item.kategori}
                          </span>
                          <h4 className='text-sm font-bold text-slate-800 leading-snug group-hover:text-teal-600 transition-colors line-clamp-2'>
                            {item.judul}
                          </h4>
                          <span className='text-[10px] text-slate-400 font-medium flex items-center mt-2'>
                            <Calendar className='w-3 h-3 mr-1' />{' '}
                            {formatWaktu(item.created_at)}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAGS REALTIME (Smart Superscript) */}
            {tags.length > 0 && (
              <div className='bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 overflow-hidden'>
                <div className='flex items-center gap-3 mb-5'>
                  <Hash className='w-5 h-5 text-slate-300' />
                  <h3 className='text-sm font-black text-slate-700 uppercase tracking-widest'>
                    Eksplorasi Topik
                  </h3>
                </div>

                <div className='flex overflow-x-auto hide-scrollbar gap-3 pb-2 cursor-grab active:cursor-grabbing snap-x snap-mandatory'>
                  {tags.map((tag) => (
                    <Link
                      href={`/media?kategori=${encodeURIComponent(tag.name)}`}
                      key={tag.name}
                      className='group snap-start shrink-0 px-5 py-2.5 bg-slate-50 text-slate-600 rounded-2xl text-xs font-bold border border-slate-100 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 transition-all shadow-sm flex items-center gap-1'>
                      {tag.name}
                      {tag.count > 1 && (
                        <sup className='text-[10px] font-black text-teal-500 opacity-80 group-hover:text-teal-700'>
                          {tag.count}
                        </sup>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* FLOATING ACTION PILL - RESPONSIVE MOBILE FIX */}
      <AnimatePresence>
        {showFloatingBar && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className='fixed bottom-6 left-1/2 -translate-x-1/2 z-[110] no-print w-[95%] sm:w-max max-w-full'>
            {/* INNER WRAPPER: Tambahkan id="floating-pill-container" agar tidak bentrok dengan auto-scroll */}
            <div
              id='floating-pill-container'
              className='bg-slate-900/90 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)] rounded-full p-1.5 md:p-2 flex items-center gap-1 overflow-x-auto hide-scrollbar flex-nowrap mx-auto'>
              <button
                onClick={scrollToTop}
                className='w-10 h-10 shrink-0 rounded-full hover:bg-white/10 flex items-center justify-center text-white transition-all'
                title='Ke Atas'>
                <ArrowUp className='w-5 h-5' />
              </button>

              <div className='w-px h-6 bg-white/10 mx-1 shrink-0'></div>

              {/* FITUR 1: Auto Scroll (Khutbah Mode) dengan Kecepatan */}
              <div className='flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/5 shrink-0'>
                <button
                  onClick={() => setIsAutoScrolling(!isAutoScrolling)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isAutoScrolling ? 'bg-teal-500 text-white animate-pulse shadow-md' : 'text-white hover:bg-white/10'}`}
                  title='Auto Scroll (Mode Khutbah)'>
                  {isAutoScrolling ? (
                    <Pause className='w-4 h-4 fill-white' />
                  ) : (
                    <Play className='w-4 h-4' />
                  )}
                </button>

                {isAutoScrolling && (
                  <button
                    onClick={() =>
                      setScrollSpeed((s) =>
                        s === 1 ? 1.5 : s === 1.5 ? 2 : s === 2 ? 0.5 : 1,
                      )
                    }
                    className='w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-teal-300 font-bold text-[10px] tracking-widest transition-colors'
                    title='Atur Kecepatan Scroll'>
                    {scrollSpeed}x
                  </button>
                )}
              </div>

              {/* FITUR 2: Bionic Reading */}
              <button
                onClick={() => setIsBionic(!isBionic)}
                className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center transition-all ${isBionic ? 'bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'text-white hover:bg-white/10'}`}
                title='Mode Baca Cepat (Bionic)'>
                <Zap className={`w-5 h-5 ${isBionic ? 'fill-white' : ''}`} />
              </button>

              {/* FITUR 3: Focus Line Ruler */}
              <button
                onClick={() => setIsFocusRuler(!isFocusRuler)}
                className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center transition-all ${isFocusRuler ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'text-white hover:bg-white/10'}`}
                title='Penggaris Fokus Membaca'>
                <ScanLine className='w-5 h-5' />
              </button>

              <div className='w-px h-6 bg-white/10 mx-1 shrink-0'></div>

              <button
                onClick={() => setFontSizeLevel((p) => (p >= 2 ? 0 : p + 1))}
                className='w-10 h-10 shrink-0 rounded-full hover:bg-white/10 flex items-center justify-center text-white relative'
                title='Ubah Ukuran Teks'>
                <Type className='w-5 h-5' />
                {fontSizeLevel > 0 && (
                  <span className='absolute top-2 right-2 w-2 h-2 bg-teal-400 rounded-full'></span>
                )}
              </button>

              <button
                onClick={toggleSpeech}
                className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center transition-all ${isSpeaking ? 'bg-teal-500 text-white animate-pulse' : 'text-white hover:bg-white/10'}`}
                title='Dengarkan (Audio Reader)'>
                {isSpeaking ? (
                  <Square className='w-4 h-4 fill-white' />
                ) : (
                  <Volume2 className='w-5 h-5' />
                )}
              </button>

              <div className='w-px h-6 bg-white/10 mx-1 shrink-0'></div>

              <button
                onClick={handleShare}
                className='px-4 md:px-5 h-10 shrink-0 rounded-full bg-teal-500 hover:bg-teal-400 text-white font-bold text-sm flex items-center shadow-lg shadow-teal-500/30 transition-colors ml-1'>
                <Share2 className='w-4 h-4 mr-1.5 md:mr-2' />{' '}
                <span className='hidden md:block'>Share</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
