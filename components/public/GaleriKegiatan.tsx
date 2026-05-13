'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  ImageIcon,
  X,
  PlusCircle,
  Camera,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  MessageCircle,
  Send,
  User,
  ChevronUp,
  Trash2,
} from 'lucide-react';

// ==========================================
// HELPER: Format Waktu & Angka
// ==========================================
const formatWaktu = (dateStr: string) => {
  if (!dateStr) return '';
  const s = Math.floor(
    (new Date().getTime() - new Date(dateStr).getTime()) / 1000,
  );
  if (s < 60) return 'Baru saja';
  if (s < 3600) return `${Math.floor(s / 60)} mnt lalu`;
  if (s < 86400) return `${Math.floor(s / 3600)} jam lalu`;
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
  });
};

const formatAngka = (angka: number) => {
  if (!angka) return 0;
  if (angka >= 1000000)
    return (angka / 1000000).toFixed(1).replace(/\.0$/, '') + 'jt';
  if (angka >= 1000) return (angka / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return angka;
};

// ==========================================
// KOMPONEN MINI: CAROUSEL NATIVE ALA IG
// ==========================================
const IGCarousel = ({
  item,
  isEditor,
  onImageUpload,
  isLightbox = false,
  onOpenLightbox,
  isSelectionMode = false, // <-- Tambahan deteksi mode seleksi
}: any) => {
  const images =
    item.gambar_urls?.length > 0
      ? item.gambar_urls
      : item.gambar_url
        ? [item.gambar_url]
        : [];
  const [imgIndex, setImgIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const width = scrollRef.current.clientWidth;
    const index = Math.round(scrollLeft / width);
    if (index !== imgIndex) setImgIndex(index);
  };

  if (images.length === 0) {
    return (
      <div
        className='w-full h-full flex items-center justify-center bg-gray-100 pointer-events-auto cursor-pointer'
        onClick={() => {
          if (isSelectionMode) return;
          if (!isEditor && onOpenLightbox) onOpenLightbox(item.id);
        }}>
        <ImageIcon className='w-16 h-16 text-gray-300' />
        {isEditor && !isSelectionMode && (
          <label className='absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 hover:opacity-100 cursor-pointer transition-opacity z-20'>
            <PlusCircle className='w-8 h-8 mb-2 drop-shadow-md' />
            <span className='text-sm font-bold drop-shadow-md'>
              Upload Gambar
            </span>
            <input
              type='file'
              accept='image/*'
              multiple
              className='hidden'
              onChange={(e) => onImageUpload && onImageUpload(item.id, e)}
            />
          </label>
        )}
      </div>
    );
  }

  return (
    <div className='relative w-full h-full overflow-hidden bg-black/5'>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className={`flex w-full h-full overflow-x-auto snap-x snap-mandatory hide-scrollbar pointer-events-auto ${isLightbox ? '' : 'gap-0 md:gap-0'}`}
        style={{ scrollBehavior: 'smooth' }}>
        {images.map((img: string, idx: number) => (
          <div
            key={idx}
            className='w-full h-full shrink-0 snap-center relative cursor-pointer overflow-hidden'
            onClick={() => {
              if (isSelectionMode) return;
              if (!isEditor && onOpenLightbox) onOpenLightbox(item.id);
            }}>
            <Image
              src={img}
              alt={item.judul || 'Gallery Image'}
              fill
              unoptimized
              sizes='(max-width: 768px) 100vw, 50vw'
              className={`transition-transform duration-700 pointer-events-none object-cover ${isLightbox ? '' : 'group-hover:scale-105'}`}
            />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <div
          className={`absolute left-1/2 -translate-x-1/2 flex gap-1.5 z-30 pointer-events-none ${isLightbox ? 'bottom-4' : 'top-3 md:top-4'}`}>
          {/* PERBAIKAN: Menambahkan tipe :any untuk _ agar garis merah hilang */}
          {images.map((_: any, idx: number) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 shadow-sm ${idx === imgIndex ? 'w-3 bg-mni-primary' : 'w-1.5 bg-white/70'}`}
            />
          ))}
        </div>
      )}

      {isEditor && !isSelectionMode && (
        <label className='absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 hover:opacity-100 cursor-pointer transition-opacity z-20 pointer-events-auto'>
          <PlusCircle className='w-8 h-8 mb-2 drop-shadow-md' />
          <span className='text-sm font-bold drop-shadow-md'>
            Tambah Gambar Baru
          </span>
          <input
            type='file'
            accept='image/*'
            multiple
            className='hidden'
            onChange={(e) => onImageUpload && onImageUpload(item.id, e)}
          />
        </label>
      )}
    </div>
  );
};

export default function GaleriKegiatan({
  data,
  galleryList,
  isEditor = false,
  onTextChange,
  onItemDelete,
  onItemUpdate,
  onImageUpload,
  // PROP BARU: Fungsi Hapus Massal dari Parent
  onBulkDelete,
}: any) {
  // PERBAIKAN: Menambahkan tipe :any agar framer-motion tidak protes (garis merah hilang)
  const fadeInUp: any = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };
  const containerStagger: any = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  // ==========================================
  // STATE MULTI-SELECT GALERI
  // ==========================================
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const isSelectionMode = selectedIds.length > 0;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleBulkDeleteAction = () => {
    if (confirm(`Hapus ${selectedIds.length} foto terpilih dari galeri?`)) {
      if (onBulkDelete) {
        onBulkDelete(selectedIds);
      } else {
        alert(
          'Prop onBulkDelete belum dihubungkan dari file Parent. Data belum terhapus.',
        );
      }
      setSelectedIds([]);
    }
  };

  const editableClass = isEditor
    ? 'cursor-text hover:ring-2 hover:ring-white/50 focus:ring-2 focus:ring-white focus:bg-white/20 rounded-md px-1 outline-none transition-all block'
    : '';

  const sortedGalleryList = useMemo(() => {
    return [...(galleryList || [])].sort(
      (a, b) =>
        new Date(b.tanggal || 0).getTime() - new Date(a.tanggal || 0).getTime(),
    );
  }, [galleryList]);

  const categories = [
    'Semua',
    ...Array.from(
      new Set(
        sortedGalleryList?.map((item: any) => item.kategori || 'Uncategorized'),
      ),
    ),
  ];

  const getCategoryCount = (cat: string) => {
    if (cat === 'Semua') return sortedGalleryList?.length || 0;
    return (
      sortedGalleryList?.filter((item: any) => item.kategori === cat).length ||
      0
    );
  };

  const [activeFilter, setActiveFilter] = useState('Semua');
  const filteredList =
    sortedGalleryList?.filter(
      (item: any) => activeFilter === 'Semua' || item.kategori === activeFilter,
    ) || [];
  const ITEMS_PER_PAGE = 6;
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
    setVisibleCount(ITEMS_PER_PAGE);
  };
  const displayList = isEditor
    ? sortedGalleryList
    : filteredList.slice(0, visibleCount);

  // LIGHTBOX & INTERAKSI (Tetap utuh seperti asli)
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [activeInlineComment, setActiveInlineComment] = useState<string | null>(
    null,
  );
  const [myComment, setMyComment] = useState('');
  const [myName, setMyName] = useState('');
  const [isNamingPhase, setIsNamingPhase] = useState(false);
  const [pendingGaleriId, setPendingGaleriId] = useState<string | null>(null);
  const [interactionData, setInteractionData] = useState<
    Record<string, { likes: number; comments: any[]; isFetching: boolean }>
  >({});
  const [userDeviceID, setUserDeviceID] = useState('');
  const [localLiked, setLocalLiked] = useState<Record<string, boolean>>({});
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isRolling, setIsRolling] = useState(true);
  const [rollIndex, setRollIndex] = useState(0);
  const [commentLimit, setCommentLimit] = useState(4);

  useEffect(() => {
    if (lightboxIdx !== null) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [lightboxIdx]);

  useEffect(() => {
    if (!isRolling || lightboxIdx === null) return;
    const currentComments =
      interactionData[filteredList[lightboxIdx]?.id]?.comments || [];
    if (currentComments.length <= 4) return;
    const timer = setInterval(() => {
      setRollIndex((prev) => (prev + 1) % currentComments.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [lightboxIdx, interactionData, isRolling, filteredList]);

  const getCurrentCommentsDisplay = () => {
    if (lightboxIdx === null) return [];
    const currentComments =
      interactionData[filteredList[lightboxIdx].id]?.comments || [];
    const total = currentComments.length;
    if (total === 0) return [];
    if (isRolling && total > 4) {
      let rollingDisplay = [];
      for (let i = 0; i < 4; i++) {
        const actualIndex = (rollIndex + i) % total;
        rollingDisplay.push({
          ...currentComments[actualIndex],
          originalIndex: actualIndex,
        });
      }
      return rollingDisplay;
    } else {
      const sliced = currentComments.slice(-commentLimit);
      const startIndex = total - sliced.length;
      return sliced.map((c: any, i: number) => ({
        ...c,
        originalIndex: startIndex + i,
      }));
    }
  };

  const displayedComments = getCurrentCommentsDisplay();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      let did = localStorage.getItem('mni_device_id');
      if (!did) {
        did = 'user_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('mni_device_id', did);
      }
      setUserDeviceID(did);

      const savedLikes = localStorage.getItem('mni_liked_items');
      if (savedLikes) {
        try {
          setLocalLiked(JSON.parse(savedLikes));
        } catch (e) {}
      }

      const handleScrollToTopVisible = () => {
        if (window.scrollY > 300) setShowScrollTop(true);
        else setShowScrollTop(false);
      };
      window.addEventListener('scroll', handleScrollToTopVisible);
      return () =>
        window.removeEventListener('scroll', handleScrollToTopVisible);
    }
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    displayList?.forEach((item: any) => {
      setInteractionData((prev) => {
        if (prev[item.id]) return prev;
        fetch(`/api/galeri/interaksi?id=${item.id}`)
          .then((res) => res.json())
          .then((data) => {
            setInteractionData((curr) => ({
              ...curr,
              [item.id]: {
                likes: data.likes,
                comments: data.comments,
                isFetching: false,
              },
            }));
          })
          .catch(() => {});
        return {
          ...prev,
          [item.id]: { likes: 0, comments: [], isFetching: true },
        };
      });
    });
  }, [displayList]);

  const fetchInteractions = async (galeriId: string) => {
    if (interactionData[galeriId]?.isFetching) return;
    setInteractionData((prev) => ({
      ...prev,
      [galeriId]: { ...prev[galeriId], isFetching: true },
    }));
    try {
      const res = await fetch(`/api/galeri/interaksi?id=${galeriId}`);
      const data = await res.json();
      setInteractionData((prev) => ({
        ...prev,
        [galeriId]: {
          likes: data.likes,
          comments: data.comments,
          isFetching: false,
        },
      }));
    } catch (err) {
      setInteractionData((prev) => ({
        ...prev,
        [galeriId]: { ...prev[galeriId], isFetching: false },
      }));
    }
  };

  const openLightbox = (id: string) => {
    if (isEditor || isSelectionMode) return;
    const index = filteredList.findIndex((item: any) => item.id === id);
    setLightboxIdx(index);
    setIsRolling(true);
    setRollIndex(0);
    setCommentLimit(4);
    setIsCaptionExpanded(false);
    fetchInteractions(id);
  };

  const closeLightbox = () => {
    setLightboxIdx(null);
    setMyComment('');
    setMyName('');
    setIsNamingPhase(false);
  };

  const closeInlineComment = () => {
    setActiveInlineComment(null);
    setMyComment('');
    setMyName('');
    setIsNamingPhase(false);
  };

  const toggleLike = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isEditor) return;
    const isCurrentlyLiked = localLiked[id];
    const newLocalLiked = { ...localLiked, [id]: !isCurrentlyLiked };
    setLocalLiked(newLocalLiked);
    localStorage.setItem('mni_liked_items', JSON.stringify(newLocalLiked));
    setInteractionData((prev) => {
      const currentLikes = prev[id]?.likes || 0;
      const newLikes = Math.max(0, currentLikes + (isCurrentlyLiked ? -1 : 1));
      return { ...prev, [id]: { ...prev[id], likes: newLikes } };
    });
    try {
      await fetch('/api/galeri/interaksi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'LIKE',
          galeriId: id,
          userId: userDeviceID,
        }),
      });
    } catch (error) {}
  };

  const handleIntentSubmit = (galeriId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!myComment.trim()) return;
    setPendingGaleriId(galeriId);
    setIsNamingPhase(true);
  };

  const executeSubmitComment = async (forceAnonymous = false) => {
    if (!pendingGaleriId) return;
    const finalName = forceAnonymous
      ? 'Hamba Allah'
      : myName.trim()
        ? myName.trim()
        : 'Hamba Allah';
    const newComment = {
      nama: finalName,
      teks: myComment,
      created_at: new Date().toISOString(),
    };
    try {
      const res = await fetch('/api/galeri/interaksi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'COMMENT',
          galeriId: pendingGaleriId,
          nama: newComment.nama,
          teks: newComment.teks,
          deviceId: userDeviceID,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      setInteractionData((prev) => ({
        ...prev,
        [pendingGaleriId]: {
          ...prev[pendingGaleriId],
          comments: [...(prev[pendingGaleriId]?.comments || []), newComment],
        },
      }));
      setIsRolling(false);
      setCommentLimit(100);
      closeInlineComment();
      setMyComment('');
      setIsNamingPhase(false);
    } catch (err: any) {
      alert(err.message);
      setIsNamingPhase(false);
    }
  };

  const handleShare = (item: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const textInfo = encodeURIComponent(
      `Mari lihat dokumentasi kegiatan "${item.judul || 'Masjid Nurul Iman'}" selengkapnya di tautan berikut:\n\n${window.location.href}`,
    );
    window.open(`https://api.whatsapp.com/send?text=${textInfo}`, '_blank');
  };

  return (
    <div className='space-y-10 animate-in fade-in duration-700 py-10 relative'>
      {/* ==========================================
          INJECT ANIMASI JIGGLE ELEGANT & SCROLLBAR
          ========================================== */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .hide-scrollbar::-webkit-scrollbar { display: none; } 
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          .custom-scroll-light::-webkit-scrollbar { width: 4px; }
          .custom-scroll-light::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.3); border-radius: 4px; }
          
          /* Animasi Jiggle Organik yang Kalem (Smooth) */
          @keyframes subtle-jiggle {
            0% { transform: rotate(-0.5deg) scale(0.99); }
            50% { transform: rotate(0.5deg) scale(0.99); }
            100% { transform: rotate(-0.5deg) scale(0.99); }
          }
          .animate-subtle-jiggle {
            animation: subtle-jiggle 0.4s ease-in-out infinite;
            transform-origin: center center;
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
        {isSelectionMode && isEditor && (
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', bounce: 0.3 }}
            className='fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 text-white px-3 py-3 rounded-full shadow-2xl flex items-center gap-3 w-max'>
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
              onClick={() =>
                setSelectedIds(displayList.map((item: any) => item.id))
              }
              className='text-xs font-bold text-zinc-400 hover:text-white transition-colors px-2'>
              Pilih Semua
            </button>

            <button
              onClick={handleBulkDeleteAction}
              className='flex items-center text-xs font-bold bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white px-4 py-2 rounded-full transition-colors ml-2 shadow-inner'>
              <Trash2 className='w-3.5 h-3.5 mr-1.5' /> Hapus
            </button>

            <button
              onClick={() => setSelectedIds([])}
              className='ml-2 p-2 bg-zinc-800 text-zinc-400 rounded-full hover:bg-zinc-700 hover:text-white transition-colors'>
              <X className='w-4 h-4' />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isNamingPhase && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm'
            onClick={() => setIsNamingPhase(false)}>
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className='bg-white rounded-[2rem] p-6 md:p-8 w-full max-w-sm shadow-2xl relative'
              onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setIsNamingPhase(false)}
                className='absolute top-5 right-5 p-2 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-full transition-colors'>
                <X className='w-5 h-5' />
              </button>
              <div className='w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mb-5 border border-teal-100'>
                <User className='w-7 h-7' />
              </div>
              <h3 className='text-xl font-black text-slate-800 mb-2'>
                Identitas Komentar
              </h3>
              <p className='text-sm text-slate-500 mb-6 leading-relaxed'>
                Masukkan nama Anda agar interaksi lebih akrab, atau pilih
                anonim.
              </p>
              <input
                type='text'
                autoFocus
                value={myName}
                onChange={(e) => setMyName(e.target.value)}
                placeholder='Contoh: Abu Fulan...'
                className='w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-mni-primary focus:ring-2 focus:ring-mni-primary/20 transition-all mb-6'
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    executeSubmitComment(false);
                  }
                }}
              />
              <div className='flex gap-3'>
                <button
                  onClick={() => executeSubmitComment(true)}
                  className='flex-1 py-3 text-sm font-bold text-slate-500 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors'>
                  Anonim Saja
                </button>
                <button
                  onClick={() => executeSubmitComment(false)}
                  className='flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-xl shadow-md transition-all'>
                  Kirim
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial='hidden'
        animate='visible'
        variants={containerStagger}
        className='text-center max-w-2xl mx-auto px-4'>
        <motion.div
          variants={fadeInUp}
          className='inline-flex items-center justify-center p-3 bg-blue-50 rounded-2xl mb-4'>
          <Camera className='w-8 h-8 text-blue-600' />
        </motion.div>
        <motion.h1
          variants={fadeInUp}
          contentEditable={isEditor}
          suppressContentEditableWarning
          onBlur={(e) =>
            isEditor && onTextChange('judul', e.currentTarget.textContent)
          }
          className={`text-4xl font-extrabold text-mni-primary mb-4 ${isEditor ? 'hover:bg-gray-100 rounded-xl p-2 outline-none focus:ring-2 focus:ring-mni-primary' : ''}`}>
          {data?.judul || 'Galeri Kegiatan'}
        </motion.h1>
        <motion.p
          variants={fadeInUp}
          contentEditable={isEditor}
          suppressContentEditableWarning
          onBlur={(e) =>
            isEditor && onTextChange('deskripsi', e.currentTarget.textContent)
          }
          className={`text-lg text-mni-muted leading-relaxed ${isEditor ? 'hover:bg-gray-100 rounded-xl p-2 outline-none focus:ring-2 focus:ring-mni-primary' : ''}`}>
          {data?.deskripsi || 'Rekam jejak kebaikan dan semarak dakwah...'}
        </motion.p>
      </motion.div>

      {!isEditor && (
        <div className='relative max-w-4xl mx-auto'>
          <div className='absolute left-0 top-0 bottom-0 w-12 md:w-20 bg-gradient-to-r from-gray-50 md:from-color-mni-surface to-transparent z-10 pointer-events-none'></div>
          <div className='flex overflow-x-auto hide-scrollbar gap-3 pb-4 pt-2'>
            <div className='shrink-0 w-4 md:w-10'></div>
            {categories.map((filter: any, idx) => {
              const count = getCategoryCount(filter);
              return (
                <button
                  key={idx}
                  onClick={() => handleFilterClick(filter)}
                  className={`shrink-0 px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${activeFilter === filter ? 'bg-mni-primary text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200 hover:border-mni-primary hover:text-mni-primary'}`}>
                  {filter}
                  {count > 1 && (
                    <sup
                      className={`text-[9px] font-black opacity-60 ${activeFilter === filter ? 'text-white' : 'text-mni-primary'}`}>
                      {count}
                    </sup>
                  )}
                </button>
              );
            })}
            <div className='shrink-0 w-4 md:w-10'></div>
          </div>
          <div className='absolute right-0 top-0 bottom-0 w-12 md:w-20 bg-gradient-to-l from-gray-50 md:from-color-mni-surface to-transparent z-10 pointer-events-none'></div>
        </div>
      )}

      {/* ========================================== */}
      {/* GRID FEED INSTAGRAM DENGAN JIGGLE & DOT */}
      {/* ========================================== */}
      <div
        className={`max-w-4xl mx-auto px-1 sm:px-2 ${isSelectionMode ? 'select-none' : ''}`}>
        <motion.div
          initial='hidden'
          animate='visible'
          variants={containerStagger}
          className='grid grid-cols-1 md:grid-cols-3 gap-[2px]'>
          <AnimatePresence>
            {displayList?.map((item: any, index: number) => {
              const isSelected = selectedIds.includes(item.id);

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  key={item.id}
                  onClick={() => isSelectionMode && toggleSelect(item.id)}
                  className={`group relative rounded-[10px] overflow-hidden aspect-[4/5] bg-mni-surface block shadow-sm transition-all duration-300
                    ${isSelectionMode ? 'animate-subtle-jiggle cursor-pointer' : !isEditor ? 'cursor-pointer hover:shadow-lg' : ''}
                    ${isSelected ? 'ring-2 ring-teal-500 shadow-teal-500/30 scale-[0.98]' : 'border border-gray-100'}
                  `}>
                  {/* ==========================================
                      DOT INDIKATOR ELEGANT (GANTI CHECKBOX)
                      ========================================== */}
                  {isEditor && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelect(item.id);
                      }}
                      className={`absolute top-4 left-4 z-[50] w-[22px] h-[22px] rounded-full border-[1.5px] transition-all flex items-center justify-center
                        ${
                          isSelected
                            ? 'border-teal-500 bg-teal-500 shadow-[0_0_12px_rgba(20,184,166,0.6)]'
                            : 'border-white/80 bg-black/20 backdrop-blur-md hover:border-white'
                        }
                      `}>
                      {/* Animasi Zoom Titik Putih saat diklik menggunakan Framer Motion */}
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
                  )}

                  {/* Sembunyikan tombol delete individu jika sedang dalam mode seleksi */}
                  {isEditor && !isSelectionMode && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onItemDelete(item.id);
                      }}
                      className='absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all z-[50] shadow-lg'
                      title='Hapus Foto'>
                      <X className='w-4 h-4' />
                    </button>
                  )}

                  {/* KOMPONEN CAROUSEL GAMBAR */}
                  <div className='absolute inset-0 w-full h-full z-0'>
                    <IGCarousel
                      item={item}
                      isEditor={isEditor}
                      onImageUpload={onImageUpload}
                      onOpenLightbox={openLightbox}
                      isSelectionMode={isSelectionMode}
                    />
                  </div>

                  {/* OVERLAY TEKS & TOMBOL */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent pointer-events-none transition-opacity duration-300 z-10 ${isEditor ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}></div>

                  <div
                    className={`absolute bottom-0 left-0 w-full p-4 z-20 pointer-events-none flex flex-row items-end justify-between transition-all duration-300 ${isEditor ? 'translate-y-0 opacity-100' : 'translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100'}`}>
                    {/* KIRI: KETERANGAN TEKS */}
                    <div className='flex flex-col items-start flex-1 pr-4 min-w-0'>
                      <div
                        contentEditable={isEditor && !isSelectionMode}
                        suppressContentEditableWarning
                        onBlur={(e) =>
                          isEditor &&
                          onItemUpdate(
                            item.id,
                            'kategori',
                            e.currentTarget.textContent,
                          )
                        }
                        className={`inline-block px-2.5 py-0.5 bg-mni-accent text-white text-[9px] font-bold rounded-full mb-1.5 uppercase tracking-wider ${editableClass} ${isSelectionMode ? 'pointer-events-none' : 'pointer-events-auto'} shadow-sm`}>
                        {item.kategori || 'Kategori'}
                      </div>
                      <h3
                        contentEditable={isEditor && !isSelectionMode}
                        suppressContentEditableWarning
                        onBlur={(e) =>
                          isEditor &&
                          onItemUpdate(
                            item.id,
                            'judul',
                            e.currentTarget.textContent,
                          )
                        }
                        className={`text-white font-bold text-sm md:text-base leading-tight line-clamp-2 ${editableClass} ${isSelectionMode ? 'pointer-events-none' : 'pointer-events-auto'} w-full`}>
                        {item.judul || 'Judul Kegiatan'}
                      </h3>

                      <div className='text-[9px] md:text-[10px] text-white/70 font-normal mt-0.5 mb-1'>
                        {item.tanggal ? formatWaktu(item.tanggal) : 'Lama'}
                      </div>
                      <p
                        contentEditable={isEditor && !isSelectionMode}
                        suppressContentEditableWarning
                        onBlur={(e) =>
                          isEditor &&
                          onItemUpdate(
                            item.id,
                            'deskripsi',
                            e.currentTarget.textContent,
                          )
                        }
                        className={`text-white/80 text-[10px] md:text-[11px] leading-snug line-clamp-2 ${editableClass} ${isSelectionMode ? 'pointer-events-none' : 'pointer-events-auto'} w-full`}>
                        {item.deskripsi ||
                          'Ketik deskripsi kegiatan di sini...'}
                      </p>
                    </div>

                    {/* KANAN: TOMBOL INTERAKSI */}
                    {!isEditor && (
                      <div className='flex flex-col items-center gap-2.5 shrink-0 pointer-events-auto pb-0.5'>
                        <button
                          onClick={(e) => toggleLike(item.id, e)}
                          className='group flex flex-col items-center gap-0.5 focus:outline-none hover:scale-110 active:scale-95 transition-transform'>
                          <Heart
                            className={`w-[18px] h-[18px] drop-shadow-md transition-colors ${localLiked[item.id] ? 'fill-red-500 text-red-500' : 'text-white'}`}
                          />
                          <span className='text-[8px] font-bold text-white drop-shadow-md'>
                            {interactionData[item.id]?.isFetching
                              ? '...'
                              : formatAngka(
                                  interactionData[item.id]?.likes || 0,
                                )}
                          </span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            fetchInteractions(item.id);
                            setActiveInlineComment(
                              activeInlineComment === item.id ? null : item.id,
                            );
                          }}
                          className='group flex flex-col items-center gap-0.5 focus:outline-none hover:scale-110 active:scale-95 transition-transform'>
                          <MessageCircle className='w-[18px] h-[18px] text-white drop-shadow-md transition-colors' />
                          <span className='text-[8px] font-bold text-white drop-shadow-md'>
                            {interactionData[item.id]?.isFetching
                              ? '...'
                              : formatAngka(
                                  interactionData[item.id]?.comments?.length ||
                                    0,
                                )}
                          </span>
                        </button>

                        <button
                          onClick={(e) => handleShare(item, e)}
                          className='group flex flex-col items-center gap-0.5 focus:outline-none hover:scale-110 active:scale-95 transition-transform'>
                          <Share2 className='w-[18px] h-[18px] text-white drop-shadow-md transition-colors' />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* FORM KOMENTAR INLINE */}
                  <AnimatePresence>
                    {activeInlineComment === item.id && (
                      <motion.form
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        onClick={(e) => e.stopPropagation()}
                        onSubmit={(e) => handleIntentSubmit(item.id, e)}
                        className='absolute bottom-3 left-3 right-3 p-1 bg-black/50 backdrop-blur-xl border border-white/20 shadow-2xl z-40 flex items-center rounded-full pointer-events-auto'>
                        <input
                          type='text'
                          autoFocus
                          value={myComment}
                          onChange={(e) => setMyComment(e.target.value)}
                          placeholder='Tulis komentar...'
                          className='flex-1 min-w-0 bg-transparent text-white placeholder:text-white/60 text-[11px] px-2.5 outline-none'
                        />
                        <button
                          type='submit'
                          className='w-7 h-7 rounded-full bg-mni-primary text-white flex items-center justify-center hover:bg-mni-primaryHover transition-colors shrink-0 shadow-sm'>
                          <Send className='w-3.5 h-3.5 ml-0.5' />
                        </button>
                        <button
                          type='button'
                          onClick={closeInlineComment}
                          className='w-7 h-7 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-colors shrink-0 ml-1.5 mr-0.5 shadow-sm'>
                          <X className='w-4 h-4' />
                        </button>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>

      {!isEditor && visibleCount < filteredList.length && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className='text-center pt-8'>
          <div className='relative inline-block'>
            <button
              onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
              className='px-8 py-3 bg-white border-2 border-gray-200 text-mni-text font-bold rounded-xl hover:border-mni-primary hover:text-mni-primary transition-all active:scale-95'>
              Muat Lebih Banyak
            </button>
            <span className='absolute -top-3 -right-3 bg-mni-primary text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md'>
              {filteredList.length - visibleCount}
            </span>
          </div>
        </motion.div>
      )}

      {/* LIGHTBOX MODAL */}
      <AnimatePresence>
        {lightboxIdx !== null && filteredList[lightboxIdx] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center'
            onClick={closeLightbox}>
            <button
              className='absolute top-4 md:top-6 right-4 md:right-6 z-[60] p-3 bg-white/10 hover:bg-red-500 text-white rounded-full transition-colors backdrop-blur-md'
              onClick={closeLightbox}>
              <X className='w-6 h-6' />
            </button>

            {/* HEADER LIGHTBOX */}
            <div className='absolute top-4 md:top-7 left-4 md:left-8 z-[60] flex flex-col items-start pointer-events-none'>
              <span className='inline-block px-3 py-1 bg-mni-accent text-white text-[10px] font-bold rounded-full mb-2 uppercase tracking-wider shadow-md'>
                {filteredList[lightboxIdx].kategori || 'Galeri'}
              </span>
              <h2 className='text-white font-bold text-lg md:text-xl drop-shadow-md max-w-[250px] md:max-w-md leading-snug line-clamp-2 mb-1'>
                {filteredList[lightboxIdx].judul || 'Kegiatan MNI'}
              </h2>

              <div className='text-[12px] text-white/50 font-normal lowercase mb-2 pointer-events-auto'>
                •{' '}
                {filteredList[lightboxIdx].tanggal
                  ? formatWaktu(filteredList[lightboxIdx].tanggal)
                  : 'Dokumentasi Lama'}
              </div>

              {filteredList[lightboxIdx].deskripsi && (
                <div
                  className='text-white/90 text-xs md:text-sm drop-shadow-md max-w-[320px] md:max-w-[410px] pointer-events-auto overflow-y-auto custom-scroll-light mt-1'
                  onClick={(e) => e.stopPropagation()}>
                  {!isCaptionExpanded &&
                  filteredList[lightboxIdx].deskripsi.length > 80 ? (
                    <>
                      {filteredList[lightboxIdx].deskripsi.substring(0, 80)}...{' '}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsCaptionExpanded(true);
                        }}
                        className='text-white/60 font-normal hover:font-semibold hover:text-white ml-1'>
                        selengkapnya
                      </button>
                    </>
                  ) : (
                    <>
                      {filteredList[lightboxIdx].deskripsi}
                      {isCaptionExpanded && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsCaptionExpanded(false);
                          }}
                          className='text-white/60 font-normal hover:font-semibold hover:text-white ml-1 block mt-1'>
                          Sembunyikan
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {lightboxIdx > 0 && (
              <button
                className='absolute left-2 md:left-6 z-50 p-3 md:p-4 bg-black/50 hover:bg-white text-white hover:text-black rounded-full transition-all backdrop-blur-md'
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIdx(lightboxIdx - 1);
                  fetchInteractions(filteredList[lightboxIdx - 1].id);
                  setMyComment('');
                  setIsCaptionExpanded(false);
                }}>
                <ChevronLeft className='w-6 h-6 md:w-8 md:h-8' />
              </button>
            )}
            {lightboxIdx < filteredList.length - 1 && (
              <button
                className='absolute right-2 md:right-6 z-50 p-3 md:p-4 bg-black/50 hover:bg-white text-white hover:text-black rounded-full transition-all backdrop-blur-md'
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIdx(lightboxIdx + 1);
                  fetchInteractions(filteredList[lightboxIdx + 1].id);
                  setMyComment('');
                  setIsCaptionExpanded(false);
                }}>
                <ChevronRight className='w-6 h-6 md:w-8 md:h-8' />
              </button>
            )}

            <div
              className='relative w-full h-[85vh] flex items-center justify-center p-0 md:p-10'
              onClick={(e) => e.stopPropagation()}>
              <motion.div
                key={lightboxIdx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className='relative w-full max-w-lg aspect-[4/5] md:h-full md:w-auto mx-auto shadow-2xl'>
                <IGCarousel
                  item={filteredList[lightboxIdx]}
                  isLightbox={true}
                />
              </motion.div>

              <div className='absolute right-4 bottom-[70px] md:right-8 md:bottom-5 flex flex-row md:flex-col items-center gap-3 md:gap-4 z-40'>
                <button
                  onClick={(e) => toggleLike(filteredList[lightboxIdx].id, e)}
                  className='group flex flex-col items-center gap-1 focus:outline-none'>
                  <motion.div
                    whileTap={{ scale: 0.8 }}
                    className={`p-2.5 md:p-3.5 rounded-full backdrop-blur-md shadow-lg transition-colors ${localLiked[filteredList[lightboxIdx].id] ? 'bg-red-500 text-white' : 'bg-black/50 text-white hover:bg-black/80 border border-white/20'}`}>
                    <Heart
                      className={`w-5 h-5 md:w-6 md:h-6 ${localLiked[filteredList[lightboxIdx].id] ? 'fill-current' : ''}`}
                    />
                  </motion.div>
                  <span className='text-[10px] md:text-[11px] font-bold text-white drop-shadow-md md:block'>
                    {interactionData[filteredList[lightboxIdx].id]?.isFetching
                      ? '...'
                      : formatAngka(
                          interactionData[filteredList[lightboxIdx].id]
                            ?.likes || 0,
                        )}
                  </span>
                </button>
                <button
                  className='group flex flex-col items-center gap-1 focus:outline-none'
                  onClick={(e) => handleShare(filteredList[lightboxIdx], e)}>
                  <div className='p-2.5 md:p-3.5 bg-black/50 hover:bg-black/80 border border-white/20 text-white rounded-full backdrop-blur-md shadow-lg transition-colors'>
                    <Share2 className='w-5 h-5 md:w-6 md:h-6' />
                  </div>
                  <span className='text-[10px] md:text-[11px] font-bold text-white drop-shadow-md md:block'>
                    Share
                  </span>
                </button>
              </div>

              <div className='absolute left-4 md:left-24 bottom-[85px] md:bottom-[40px] flex flex-col gap-2 z-40 pointer-events-none w-max max-w-[80vw] md:max-w-md'>
                {(interactionData[filteredList[lightboxIdx].id]?.comments
                  ?.length || 0) > 4 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isRolling) {
                        setIsRolling(false);
                        setCommentLimit(100);
                      } else {
                        setIsRolling(true);
                        setCommentLimit(4);
                        setRollIndex(0);
                      }
                    }}
                    className='pointer-events-auto text-[10px] text-white/80 hover:text-white drop-shadow-md bg-black/40 hover:bg-black/60 px-3 py-1.5 rounded-full w-max backdrop-blur-md transition-colors'>
                    {isRolling
                      ? `Lihat semua ${interactionData[filteredList[lightboxIdx].id]?.comments.length} komentar...`
                      : 'Sembunyikan komentar'}
                  </button>
                )}

                <div
                  className={`flex flex-col gap-3 ${!isRolling ? 'max-h-[50vh] overflow-y-auto pointer-events-auto custom-scroll-light pr-4 overscroll-contain' : ''}`}
                  onWheel={(e) => e.stopPropagation()}
                  onTouchMove={(e) => e.stopPropagation()}>
                  <AnimatePresence mode='popLayout'>
                    {displayedComments.map((comment: any) => (
                      <motion.div
                        key={comment.originalIndex}
                        layout
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{
                          opacity: 0,
                          scale: 0.8,
                          transition: { duration: 0.2 },
                        }}
                        transition={{
                          type: 'spring',
                          stiffness: 300,
                          damping: 25,
                        }}
                        className='flex items-center gap-3 bg-black/50 backdrop-blur-md px-3 md:px-4 py-2 md:py-2.5 rounded-full border border-white/10 w-max max-w-[300px] md:max-w-xl shadow-lg'>
                        <div className='w-6 h-6 md:w-7 md:h-7 rounded-full bg-gradient-to-tr from-mni-primary to-mni-accent flex items-center justify-center text-white text-[10px] md:text-[11px] font-bold shrink-0'>
                          {comment.nama.charAt(0)}
                        </div>
                        <div className='flex flex-col'>
                          <span className='text-[9px] md:text-[10px] font-bold text-white/60 flex items-center gap-1.5'>
                            {comment.nama}
                            <span className='font-normal opacity-70 text-[8px]'>
                              • {formatWaktu(comment.created_at)}
                            </span>
                          </span>
                          <span className='text-[11px] md:text-xs text-white leading-tight drop-shadow-md line-clamp-2 mt-0.5'>
                            {comment.teks}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div
              className='absolute bottom-0 left-0 w-full bg-gradient-to-t from-black via-black/80 to-transparent pt-12 pb-6 px-4 z-[60] flex flex-col items-center'
              onClick={(e) => e.stopPropagation()}>
              <form
                onSubmit={(e) =>
                  handleIntentSubmit(filteredList[lightboxIdx].id, e)
                }
                className='w-full max-w-4xl flex items-center gap-2 md:gap-3 bg-white/10 backdrop-blur-xl border border-white/20 p-2 rounded-full shadow-2xl focus-within:ring-2 focus-within:ring-mni-primary/50 transition-all'>
                <div className='w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0 ml-1'>
                  <MessageCircle className='w-5 h-5' />
                </div>
                <input
                  type='text'
                  value={myComment}
                  onChange={(e) => setMyComment(e.target.value)}
                  placeholder='Tambahkan komentar Anda...'
                  className='flex-1 bg-transparent border-none outline-none text-white text-sm md:text-base placeholder:text-white/50 px-2'
                />
                <button
                  type='submit'
                  disabled={!myComment.trim()}
                  className='w-10 h-10 bg-mni-primary hover:bg-mni-primaryHover disabled:opacity-50 text-white rounded-full transition-colors flex items-center justify-center shrink-0 shadow-sm'>
                  <Send className='w-5 h-5 ml-1' />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={scrollToTop}
            className='fixed bottom-8 right-8 z-[40] p-3 md:p-3.5 bg-mni-primary text-white rounded-full shadow-[0_10px_20px_rgba(0,0,0,0.2)] hover:bg-mni-primaryHover hover:scale-110 transition-all duration-300'>
            <ChevronUp className='w-5 h-5 md:w-6 md:h-6' />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
