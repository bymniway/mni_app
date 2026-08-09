'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import {
  CalendarDays,
  Users,
  Gift,
  Wallet,
  Search,
  MapPin,
  Clock,
  Receipt,
  PlusCircle,
  Trash2,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  X,
  ArrowRightCircle,
} from 'lucide-react';

interface RamadhanUIProps {
  form: any;
  schedules: any[];
  finances: any[];
  activeYear: string;
  isEditor?: boolean;
  onTextChange?: (key: string, value: string) => void;
  onYearChange?: (year: string) => void;
  onScheduleUpdate?: (id: string, field: string, value: any) => void;
  onScheduleDelete?: (id: string) => void;
  onScheduleAdd?: () => void;
  onFinanceUpdate?: (id: string, field: string, value: string) => void;
  onFinanceDelete?: (id: string) => void;
  onFinanceAdd?: () => void;
}

export default function RamadhanUI({
  form,
  schedules,
  finances,
  activeYear,
  isEditor = false,
  onTextChange,
  onYearChange,
  onScheduleUpdate,
  onScheduleDelete,
  onScheduleAdd,
  onFinanceUpdate,
  onFinanceDelete,
  onFinanceAdd,
}: RamadhanUIProps) {
  const searchParams = useSearchParams();
  const urlTab = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState<'imam' | 'takjil' | 'laporan'>(
    'imam',
  );

  // 3. UBAH TAB SECARA OTOMATIS JIKA ADA TITIPAN DI URL
  useEffect(() => {
    if (
      urlTab &&
      ['imam', 'takjil', 'laporan'].includes(urlTab.toLowerCase())
    ) {
      setActiveTab(urlTab.toLowerCase() as 'imam' | 'takjil' | 'laporan');
    }
  }, [urlTab]);

  const [searchImam, setSearchImam] = useState('');
  const [searchTakjil, setSearchTakjil] = useState('');

  // Status Filter untuk Tab Imam & Takjil
  const [filterStatusImam, setFilterStatusImam] = useState<
    'semua' | 'terlaksana' | 'menunggu'
  >('semua');
  const [filterStatusTakjil, setFilterStatusTakjil] = useState<
    'semua' | 'tersalurkan' | 'menunggu'
  >('semua');

  // --- STATE MULTI-SELECT (JIGGLE MODE) ---
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const isSelectionMode = selectedIds.length > 0;

  useEffect(() => setSelectedIds([]), [activeTab]);

  const toggleSelect = (id: string) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );

  const handleBulkDelete = () => {
    if (confirm(`Hapus ${selectedIds.length} data terpilih?`)) {
      selectedIds.forEach((id) => {
        if (activeTab === 'laporan') onFinanceDelete?.(id);
        else onScheduleDelete?.(id);
      });
      setSelectedIds([]);
    }
  };

  // --- STATE DUAL SLIDER LAPORAN ---
  const uniqueDates = useMemo(
    () => Array.from(new Set(finances.map((f) => f.tanggal))).sort(),
    [finances],
  );
  const maxSliderIdx = uniqueDates.length > 0 ? uniqueDates.length - 1 : 0;

  const [rangeMinIdx, setRangeMinIdx] = useState(0);
  const [rangeMaxIdx, setRangeMaxIdx] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const [activeSliderThumb, setActiveSliderThumb] = useState<'min' | 'max'>(
    'max',
  );
  const [selectedFinanceId, setSelectedFinanceId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    setRangeMaxIdx(maxSliderIdx);
    if (maxSliderIdx === 0) setRangeMinIdx(0);
  }, [maxSliderIdx]);

  const filterStartDate = uniqueDates[rangeMinIdx] || '';
  const filterEndDate = uniqueDates[rangeMaxIdx] || '';

  const editableClass = isEditor
    ? 'cursor-text hover:ring-2 hover:ring-emerald-500/50 focus:ring-2 focus:ring-emerald-500 focus:bg-slate-50 rounded-lg px-2 py-0.5 outline-none transition-all duration-200 inline-block min-w-[30px]'
    : 'whitespace-pre-line';
  const formatRupiah = (angka: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(angka);
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  const formatShortDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
    });

  // --- LOGIKA HELPER TANGGAL & AUTO-CEKLIS ---
  const isTodayDate = (dateString: string) => {
    const now = new Date();
    const [year, month, day] = dateString.split('-').map(Number);
    return (
      now.getFullYear() === year &&
      now.getMonth() === month - 1 &&
      now.getDate() === day
    );
  };

  const checkIsDone = (dateString: string, type: 'imam' | 'takjil') => {
    const now = new Date();
    const [year, month, day] = dateString.split('-').map(Number);
    const scheduleDate = new Date(year, month - 1, day);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (scheduleDate < today) return true;
    if (scheduleDate > today) return false;

    const currentHour = now.getHours();
    if (type === 'imam') return currentHour >= 22;
    if (type === 'takjil') return currentHour >= 18;
    return false;
  };

  const filteredImam = useMemo(
    () =>
      schedules.filter((s) => {
        const term = searchImam.toLowerCase();
        // Pencarian diperluas ke penceramah
        const penceramah = s.penceramah || '';
        const matchSearch =
          s.imam.toLowerCase().includes(term) ||
          s.bilal.toLowerCase().includes(term) ||
          penceramah.toLowerCase().includes(term) ||
          formatDate(s.tanggal).toLowerCase().includes(term);
        const isDone = s.status_imam || checkIsDone(s.tanggal, 'imam');

        if (filterStatusImam === 'terlaksana' && !isDone) return false;
        if (filterStatusImam === 'menunggu' && isDone) return false;
        return matchSearch;
      }),
    [schedules, searchImam, filterStatusImam],
  );

  // const filteredImam = useMemo(
  //   () =>
  //     schedules.filter((s) => {
  //       const term = searchImam.toLowerCase();
  //       const matchSearch =
  //         s.imam.toLowerCase().includes(term) ||
  //         s.bilal.toLowerCase().includes(term) ||
  //         formatDate(s.tanggal).toLowerCase().includes(term);
  //       const isDone = s.status_imam || checkIsDone(s.tanggal, 'imam');

  //       if (filterStatusImam === 'terlaksana' && !isDone) return false;
  //       if (filterStatusImam === 'menunggu' && isDone) return false;
  //       return matchSearch;
  //     }),
  //   [schedules, searchImam, filterStatusImam],
  // );

  const filteredTakjil = useMemo(
    () =>
      schedules.filter((s) => {
        const term = searchTakjil.toLowerCase();
        const donatur = s.donatur_takjil || 'hamba allah';
        const alamat = s.alamat_takjil || '';
        const matchSearch =
          donatur.toLowerCase().includes(term) ||
          alamat.toLowerCase().includes(term) ||
          formatDate(s.tanggal).toLowerCase().includes(term);
        const isDone = s.status_takjil || checkIsDone(s.tanggal, 'takjil');

        if (filterStatusTakjil === 'tersalurkan' && !isDone) return false;
        if (filterStatusTakjil === 'menunggu' && isDone) return false;
        return matchSearch;
      }),
    [schedules, searchTakjil, filterStatusTakjil],
  );

  const filteredFinances = useMemo(
    () =>
      finances.filter((f) => {
        if (!filterStartDate && !filterEndDate) return true;
        const time = new Date(f.tanggal).getTime();
        const start = filterStartDate ? new Date(filterStartDate).getTime() : 0;
        const end = filterEndDate
          ? new Date(filterEndDate).getTime()
          : Infinity;
        return time >= start && time <= end;
      }),
    [finances, filterStartDate, filterEndDate],
  );

  const totalPemasukanFilter = filteredFinances.reduce(
    (sum, f) => sum + Number(f.pemasukan),
    0,
  );
  const totalPengeluaranFilter = filteredFinances.reduce(
    (sum, f) => sum + Number(f.pengeluaran),
    0,
  );
  const totalSaldoFilter = totalPemasukanFilter - totalPengeluaranFilter;

  const tabContentVariant: Variants = {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
    exit: {
      opacity: 0,
      y: -15,
      scale: 0.98,
      transition: { duration: 0.2, ease: 'easeIn' },
    },
  };

  return (
    <div className='max-w-6xl mx-auto px-4 py-10 relative'>
      {/* --- INJECT ANIMASI CSS --- */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes subtle-jiggle { 0% { transform: rotate(-0.5deg) scale(0.99); } 50% { transform: rotate(0.5deg) scale(0.99); } 100% { transform: rotate(-0.5deg) scale(0.99); } }
        .animate-subtle-jiggle { animation: subtle-jiggle 0.4s ease-in-out infinite; cursor: pointer !important; }
        .animate-subtle-jiggle:nth-child(even) { animation-direction: reverse; animation-duration: 0.45s; }
        
        @keyframes border-glow-emerald { 0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5); } 70% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); } 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }
        @keyframes border-glow-orange { 0% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.5); } 70% { box-shadow: 0 0 0 8px rgba(249, 115, 22, 0); } 100% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0); } }
        .pulse-border-emerald { animation: border-glow-emerald 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; border-color: #34d399 !important; }
        .pulse-border-orange { animation: border-glow-orange 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; border-color: #fb923c !important; }

        .custom-range { -webkit-appearance: none; appearance: none; pointer-events: none; background: transparent; }
        .custom-range::-webkit-slider-thumb { pointer-events: auto; -webkit-appearance: none; appearance: none; width: 22px; height: 22px; background: white; border: 4.5px solid #10b981; border-radius: 50%; cursor: grab; box-shadow: 0 2px 6px rgba(0,0,0,0.15); transition: transform 0.1s; }
        .custom-range::-webkit-slider-thumb:active { cursor: grabbing; transform: scale(1.15); }
        .hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `,
        }}
      />

      {/* FLOATING ACTION BAR MULTI-SELECT */}
      <AnimatePresence>
        {isSelectionMode && isEditor && (
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.9 }}
            className='fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] bg-slate-900/90 backdrop-blur-xl border border-slate-800 text-white px-3 py-3 rounded-full shadow-2xl flex items-center gap-3 w-max'>
            <div className='flex items-center gap-3 pl-2 pr-4 border-r border-slate-700'>
              <span className='flex h-3 w-3 relative'>
                <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75'></span>
                <span className='relative inline-flex rounded-full h-3 w-3 bg-emerald-500'></span>
              </span>
              <span className='text-sm font-medium tracking-wide'>
                {selectedIds.length}{' '}
                <span className='text-slate-400 font-medium hidden sm:inline'>
                  Terpilih
                </span>
              </span>
            </div>
            <button
              onClick={() => {
                const allIds =
                  activeTab === 'imam'
                    ? filteredImam.map((i) => i.id)
                    : activeTab === 'takjil'
                      ? filteredTakjil.map((t) => t.id)
                      : filteredFinances.map((f) => f.id);
                setSelectedIds(allIds);
              }}
              className='text-xs font-medium text-slate-400 hover:text-white transition-colors px-2'>
              Pilih Semua
            </button>
            <button
              onClick={handleBulkDelete}
              className='flex items-center text-xs font-medium bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white px-4 py-2 rounded-full transition-colors ml-2 shadow-inner'>
              <Trash2 className='w-3.5 h-3.5 mr-1.5' /> Hapus
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className='ml-2 p-2 bg-slate-800 text-slate-400 rounded-full hover:bg-slate-700 hover:text-white transition-colors'>
              <X className='w-4 h-4' />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className='text-center max-w-3xl mx-auto pt-8 mb-12 relative z-10'>
        <div className='inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold tracking-wider mb-4 shadow-sm'>
          <CalendarDays className='w-3.5 h-3.5 mr-2' /> Ramadhan{' '}
          <span
            contentEditable={isEditor}
            suppressContentEditableWarning
            onBlur={(e) =>
              isEditor && onYearChange?.(e.currentTarget.innerText)
            }
            className={`ml-1 outline-none ${isEditor ? 'border-b border-emerald-400 bg-white/50 px-1 rounded' : ''}`}>
            {activeYear}
          </span>{' '}
          H
        </div>
        <h1
          contentEditable={isEditor}
          suppressContentEditableWarning
          onBlur={(e) =>
            isEditor &&
            onTextChange?.(
              'ramadhan_hero_judul',
              e.currentTarget.textContent || '',
            )
          }
          className={`text-3xl md:text-5xl font-black text-emerald-800 mb-4 tracking-tight block ${editableClass}`}>
          {form.ramadhan_hero_judul}
        </h1>
        <p
          contentEditable={isEditor}
          suppressContentEditableWarning
          onBlur={(e) =>
            isEditor &&
            onTextChange?.(
              'ramadhan_hero_deskripsi',
              e.currentTarget.textContent || '',
            )
          }
          className={`text-base md:text-lg text-slate-500 leading-relaxed max-w-2xl mx-auto block font-medium ${editableClass}`}>
          {form.ramadhan_hero_deskripsi}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className='flex justify-center w-full mb-8 relative z-20'>
        <div className='w-full sm:w-auto overflow-x-auto hide-scrollbar'>
          <div className='bg-white p-1.5 rounded-full border border-slate-200 flex shadow-sm gap-1.5 w-max mx-auto'>
            <button
              onClick={() => setActiveTab('imam')}
              className={`group relative overflow-hidden justify-center flex items-center px-5 py-3 rounded-full font-medium transition-all text-sm ${activeTab === 'imam' ? 'bg-emerald-700 text-white shadow-md' : 'text-slate-500'}`}>
              <span className='absolute inset-0 bg-emerald-600 rounded-full scale-x-0 origin-right group-hover:scale-x-100 group-hover:origin-left transition-transform duration-400 ease-in-out'></span>
              <Users className='w-4 h-4 mr-2 group-hover:text-white transition-colors duration-400 z-10 ' />
              <span className='relative group-hover:text-white transition-colors duration-400 '>
                Tarawih
              </span>
            </button>
            <button
              onClick={() => setActiveTab('takjil')}
              className={`group relative overflow-hidden justify-center flex items-center px-5 py-3 rounded-full font-medium transition-all text-sm ${activeTab === 'takjil' ? 'bg-mni-accent text-white shadow-md' : 'text-slate-500'}`}>
              <span className='absolute inset-0 bg-orange-300  rounded-full scale-x-0 origin-right group-hover:scale-x-100 group-hover:origin-left transition-transform duration-400 ease-in-out'></span>
              <Gift className='w-4 h-4 mr-2 group-hover:text-white transition-colors duration-400 z-10' />
              <span className='relative group-hover:text-white transition-colors duration-400 '>
                Takjil
              </span>
            </button>
            <button
              onClick={() => setActiveTab('laporan')}
              className={`group relative overflow-hidden justify-center flex items-center px-5 py-3 rounded-full font-medium transition-all text-sm ${activeTab === 'laporan' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>
              <span className='absolute inset-0 bg-slate-400  rounded-full scale-x-0 origin-right group-hover:scale-x-100 group-hover:origin-left transition-transform duration-400 ease-in-out'></span>
              <Wallet className='w-4 h-4 mr-2 group-hover:text-white transition-colors duration-400 z-10' />
              <span className='relative group-hover:text-white transition-colors duration-400 '>
                K.A.R
              </span>
            </button>
          </div>
        </div>
      </motion.div>

      <div
        className={`mt-4 min-h-[50vh] relative ${isSelectionMode ? 'select-none' : ''}`}>
        <AnimatePresence mode='wait'>
          {/* ================= TAB IMAM ================= */}
          {activeTab === 'imam' && (
            <motion.div
              key='tab-imam'
              variants={tabContentVariant}
              initial='hidden'
              animate='visible'
              exit='exit'>
              <div className='flex flex-col sm:flex-row max-w-2xl mx-auto gap-3 mb-8'>
                <div className='relative flex-1'>
                  <Search className='w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400' />
                  <input
                    type='text'
                    placeholder='Cari Imam, Penceramah...'
                    value={searchImam}
                    onChange={(e) => setSearchImam(e.target.value)}
                    className='w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 text-sm shadow-sm font-medium'
                  />
                </div>
                <div className='flex bg-white rounded-2xl border border-slate-200 p-1 shadow-sm shrink-0 w-full sm:w-max mx-auto justify-center'>
                  {['semua', 'terlaksana', 'menunggu'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilterStatusImam(f as any)}
                      className={`flex-1 sm:flex-none px-4 py-2 text-xs font-semibold rounded-xl capitalize transition-colors ${filterStatusImam === f ? 'bg-emerald-100 text-emerald-800' : 'text-slate-500 hover:bg-slate-50'}`}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
                {filteredImam.map((item, idx) => {
                  const isDone =
                    item.status_imam || checkIsDone(item.tanggal, 'imam');
                  const isCurrentDay = isTodayDate(item.tanggal);
                  const isSelected = selectedIds.includes(item.id);
                  const cardGlowClass =
                    !isDone && !isSelected && isCurrentDay
                      ? 'pulse-border-emerald '
                      : '';
                  const baseCardClass = isSelected
                    ? 'border-emerald-500 shadow-sm ring-2 ring-emerald-500/30 scale-[0.98] bg-white'
                    : isDone
                      ? 'bg-emerald-50/40 border-emerald-300 shadow-sm hover:border-emerald-400'
                      : 'bg-white border-slate-200 shadow-sm hover:border-emerald-300';

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (idx % 3) * 0.1 }}
                      onClick={() => isSelectionMode && toggleSelect(item.id)}
                      className={`p-5 rounded-3xl border transition-all relative overflow-hidden group 
                      ${isSelectionMode ? 'animate-subtle-jiggle cursor-pointer' : 'hover:-translate-y-1 hover:shadow-lg cursor-default'}
                      ${cardGlowClass} ${baseCardClass}`}>
                      {isEditor && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelect(item.id);
                          }}
                          className={`absolute top-4 right-4 z-[30] w-5 h-5 rounded-full border-[1.5px] transition-all flex items-center justify-center ${isSelected ? 'border-emerald-500 bg-emerald-500 shadow-md' : 'border-slate-300 bg-white/80 backdrop-blur-sm hover:border-emerald-400'}`}>
                          {isSelected && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className='w-2 h-2 rounded-full bg-white'
                            />
                          )}
                        </button>
                      )}

                      <div className='absolute -right-4 -bottom-4 opacity-[0.03] pointer-events-none group-hover:scale-[1.5] group-hover:-rotate-12 transition-all duration-1000 ease-in-out z-0'>
                        <Users className='w-32 h-32 text-emerald-600' />
                      </div>

                      <div className='relative z-10'>
                        <div className='flex items-center gap-2 mb-4'>
                          <div
                            className={`px-2.5 py-1 text-[11px] font-semibold rounded-md shadow-sm ${isDone ? 'bg-white text-slate-600 border border-slate-200' : 'bg-emerald-100 text-emerald-800'}`}>
                            {isEditor ? (
                              <input
                                type='date'
                                defaultValue={item.tanggal}
                                onBlur={(e) =>
                                  onScheduleUpdate?.(
                                    item.id,
                                    'tanggal',
                                    e.target.value,
                                  )
                                }
                                className='bg-transparent border-none outline-none font-semibold cursor-pointer w-[100px]'
                              />
                            ) : (
                              formatDate(item.tanggal)
                            )}
                          </div>
                          <button
                            onClick={() =>
                              isEditor &&
                              !isSelectionMode &&
                              onScheduleUpdate?.(
                                item.id,
                                'status_imam',
                                !item.status_imam,
                              )
                            }
                            className={`flex items-center justify-center rounded-full transition-transform ${isEditor && !isSelectionMode ? 'cursor-pointer hover:scale-110' : 'cursor-default pointer-events-none'} ${isDone ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 gap-1.5 px-2.5 py-0.5 text-[10px] font-bold uppercase' : 'bg-emerald-50 text-emerald-500 border border-emerald-200 w-7 h-7 shadow-sm'}`}>
                            {isDone ? (
                              <>
                                <CheckCircle2 className='w-3 h-3' /> Terlaksana
                              </>
                            ) : (
                              <Clock className='w-4 h-4 animate-pulse' />
                            )}
                          </button>
                        </div>

                        <div className='space-y-3'>
                          <div>
                            <p className='text-[10px] uppercase font-semibold text-emerald-600/70 tracking-widest mb-0.5'>
                              Imam Tarawih
                            </p>
                            <p
                              contentEditable={isEditor && !isSelectionMode}
                              suppressContentEditableWarning
                              onBlur={(e) =>
                                isEditor &&
                                onScheduleUpdate?.(
                                  item.id,
                                  'imam',
                                  e.currentTarget.innerText,
                                )
                              }
                              className={`text-[15px] font-bold text-slate-700 ${editableClass}`}>
                              {item.imam}
                            </p>
                          </div>
                          <div>
                            <p className='text-[10px] uppercase font-semibold text-emerald-600/70 tracking-widest mb-0.5'>
                              Penceramah
                            </p>
                            <p
                              contentEditable={isEditor && !isSelectionMode}
                              suppressContentEditableWarning
                              onBlur={(e) =>
                                isEditor &&
                                onScheduleUpdate?.(
                                  item.id,
                                  'penceramah',
                                  e.currentTarget.innerText,
                                )
                              }
                              className={`text-xs font-medium text-slate-600 ${editableClass}`}>
                              {item.penceramah ||
                                (isEditor ? 'Ketuk untuk menambah...' : '-')}
                            </p>
                          </div>
                          <div>
                            <p className='text-[10px] uppercase font-semibold text-emerald-600/70 tracking-widest mb-0.5'>
                              Bilal
                            </p>
                            <p
                              contentEditable={isEditor && !isSelectionMode}
                              suppressContentEditableWarning
                              onBlur={(e) =>
                                isEditor &&
                                onScheduleUpdate?.(
                                  item.id,
                                  'bilal',
                                  e.currentTarget.innerText,
                                )
                              }
                              className={`text-xs font-medium text-slate-500 ${editableClass}`}>
                              {item.bilal}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                {isEditor && (
                  <motion.button
                    onClick={onScheduleAdd}
                    className='h-full w-full bg-transparent border-2 border-dashed border-slate-300 rounded-3xl flex items-center justify-center p-5 text-slate-400 hover:text-emerald-600 hover:border-emerald-600 hover:bg-emerald-50 transition-all min-h-[180px]'>
                    <PlusCircle className='w-6 h-6 mr-2' />
                    <span className='font-semibold text-sm tracking-wider uppercase'>
                      Tambah
                    </span>
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}

          {/* ================= TAB TAKJIL ================= */}
          {activeTab === 'takjil' && (
            <motion.div
              key='tab-takjil'
              variants={tabContentVariant}
              initial='hidden'
              animate='visible'
              exit='exit'>
              <div className='flex flex-col sm:flex-row max-w-2xl mx-auto gap-3 mb-8'>
                <div className='relative flex-1'>
                  <Search className='w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400' />
                  <input
                    type='text'
                    placeholder='Cari Mutashaddiq, Alamat...'
                    value={searchTakjil}
                    onChange={(e) => setSearchTakjil(e.target.value)}
                    className='w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 text-sm shadow-sm font-medium'
                  />
                </div>
                <div className='flex bg-white rounded-2xl border border-slate-200 p-1 shadow-sm shrink-0 w-full sm:w-max mx-auto justify-center'>
                  {['semua', 'tersalurkan', 'menunggu'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilterStatusTakjil(f as any)}
                      className={`flex-1 sm:flex-none px-4 py-2 text-xs font-semibold rounded-xl capitalize transition-colors ${filterStatusTakjil === f ? 'bg-orange-100 text-orange-800' : 'text-slate-500 hover:bg-slate-50'}`}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {filteredTakjil.map((item, idx) => {
                  const isDone =
                    item.status_takjil || checkIsDone(item.tanggal, 'takjil');
                  const isCurrentDay = isTodayDate(item.tanggal);
                  const isSelected = selectedIds.includes(item.id);
                  const cardGlowClass =
                    !isDone && !isSelected && isCurrentDay
                      ? 'pulse-border-orange'
                      : '';
                  const baseCardClass = isSelected
                    ? 'border-orange-500 ring-2 ring-orange-500/30 scale-[0.98] bg-white'
                    : isDone
                      ? 'bg-orange-50/40 border-orange-200 hover:border-orange-400'
                      : 'bg-white border-slate-200 shadow-sm hover:border-orange-300';

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (idx % 3) * 0.1 }}
                      onClick={() => isSelectionMode && toggleSelect(item.id)}
                      className={`p-5 rounded-3xl border transition-all relative overflow-hidden group 
                      ${isSelectionMode ? 'animate-subtle-jiggle cursor-pointer' : 'hover:-translate-y-1 hover:shadow-lg cursor-default'}
                      ${cardGlowClass} ${baseCardClass}`}>
                      {isEditor && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelect(item.id);
                          }}
                          className={`absolute top-4 right-4 z-[30] w-5 h-5 rounded-full border-[1.5px] transition-all flex items-center justify-center ${isSelected ? 'border-orange-500 bg-orange-500 shadow-md' : 'border-slate-300 bg-white/80 backdrop-blur-sm hover:border-orange-400'}`}>
                          {isSelected && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className='w-2 h-2 rounded-full bg-white'
                            />
                          )}
                        </button>
                      )}

                      <div className='absolute -right-4 -bottom-4 opacity-[0.03] pointer-events-none group-hover:scale-[1.5] group-hover:-rotate-12 transition-all duration-1000 ease-in-out z-0'>
                        <Gift className='w-32 h-32 text-orange-600' />
                      </div>

                      <div className='relative z-10'>
                        <div className='flex items-center gap-2 mb-4'>
                          <div
                            className={`px-2.5 py-1 text-[11px] font-semibold rounded-md shadow-sm ${isDone ? 'bg-white text-slate-600 border border-slate-200' : 'bg-orange-100 text-orange-800'}`}>
                            {isEditor ? (
                              <input
                                type='date'
                                defaultValue={item.tanggal}
                                onBlur={(e) =>
                                  onScheduleUpdate?.(
                                    item.id,
                                    'tanggal',
                                    e.target.value,
                                  )
                                }
                                className='bg-transparent border-none outline-none font-semibold cursor-pointer w-[100px]'
                              />
                            ) : (
                              formatDate(item.tanggal)
                            )}
                          </div>
                          <button
                            onClick={() =>
                              isEditor &&
                              !isSelectionMode &&
                              onScheduleUpdate?.(
                                item.id,
                                'status_takjil',
                                !item.status_takjil,
                              )
                            }
                            className={`flex items-center justify-center rounded-full transition-transform ${isEditor && !isSelectionMode ? 'cursor-pointer hover:scale-110' : 'cursor-default pointer-events-none'} ${isDone ? 'bg-orange-50 text-orange-600 border border-orange-200 gap-1.5 px-2.5 py-0.5 text-[10px] font-bold uppercase' : 'bg-orange-50 text-orange-500 border border-orange-200 w-7 h-7 shadow-sm'}`}>
                            {isDone ? (
                              <>
                                <CheckCircle2 className='w-3 h-3' /> Tersalurkan
                              </>
                            ) : (
                              <Clock className='w-4 h-4 animate-pulse' />
                            )}
                          </button>
                        </div>

                        <div>
                          <p className='text-[10px] uppercase font-semibold text-orange-600/70 tracking-widest mb-0.5'>
                            Mutashaddiq
                          </p>
                          <p
                            contentEditable={isEditor && !isSelectionMode}
                            suppressContentEditableWarning
                            onBlur={(e) =>
                              isEditor &&
                              onScheduleUpdate?.(
                                item.id,
                                'donatur_takjil',
                                e.currentTarget.innerText,
                              )
                            }
                            className={`text-[15px] font-bold text-slate-700 leading-snug ${editableClass}`}>
                            {item.donatur_takjil || 'Hamba Allah'}
                          </p>
                          {(item.alamat_takjil || isEditor) && (
                            <div className='mt-3 flex items-start gap-1.5 bg-slate-50/50 p-2 rounded-lg border border-slate-100/50'>
                              <MapPin className='w-3 h-3 shrink-0 mt-0.5 text-orange-400' />
                              <p
                                contentEditable={isEditor && !isSelectionMode}
                                suppressContentEditableWarning
                                onBlur={(e) =>
                                  isEditor &&
                                  onScheduleUpdate?.(
                                    item.id,
                                    'alamat_takjil',
                                    e.currentTarget.innerText,
                                  )
                                }
                                className={`text-[11px] leading-tight text-slate-500 flex-1 font-medium ${editableClass}`}>
                                {item.alamat_takjil ||
                                  (isEditor ? 'Tambahkan Alamat...' : '')}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                {isEditor && (
                  <motion.button
                    onClick={onScheduleAdd}
                    className='h-full w-full bg-transparent border-2 border-dashed border-slate-300 rounded-3xl flex items-center justify-center p-5 text-slate-400 hover:text-orange-600 hover:border-orange-600 hover:bg-orange-50 transition-all min-h-[180px]'>
                    <PlusCircle className='w-6 h-6 mr-2' />
                    <span className='font-semibold text-sm tracking-wider uppercase'>
                      Tambah
                    </span>
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}

          {/* ================= TAB LAPORAN ================= */}
          {activeTab === 'laporan' && (
            <motion.div
              key='tab-laporan'
              variants={tabContentVariant}
              initial='hidden'
              animate='visible'
              exit='exit'>
              {/* PEMBUNGKUS METRIK KHUSUS */}
              <div className='bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm mb-6'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className='bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm relative overflow-hidden group hover:-translate-y-1 hover:shadow-md transition-all duration-300'>
                    <TrendingUp className='absolute -right-4 -bottom-4 w-20 h-20 text-emerald-500 opacity-[0.05] group-hover:scale-[1.5] group-hover:-rotate-12 transition-all duration-700' />
                    <p className='text-[10px] font-semibold uppercase text-emerald-700/70 mb-1 relative z-10 tracking-wider'>
                      Total Pemasukan
                    </p>
                    <p className='text-[22px] font-bold text-emerald-700 relative z-10'>
                      {formatRupiah(totalPemasukanFilter)}
                    </p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className='bg-white p-5 rounded-2xl border border-red-100 shadow-sm relative overflow-hidden group hover:-translate-y-1 hover:shadow-md transition-all duration-300'>
                    <TrendingDown className='absolute -right-4 -bottom-4 w-20 h-20 text-red-500 opacity-[0.05] group-hover:scale-[1.5] group-hover:-rotate-12 transition-all duration-700' />
                    <p className='text-[10px] font-semibold uppercase text-red-700/70 mb-1 relative z-10 tracking-wider'>
                      Total Pengeluaran
                    </p>
                    <p className='text-[22px] font-bold text-red-600 relative z-10'>
                      {formatRupiah(totalPengeluaranFilter)}
                    </p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className='bg-white p-5 rounded-2xl border border-slate-300 shadow-sm relative overflow-hidden group hover:-translate-y-1 hover:shadow-md transition-all duration-300'>
                    <Wallet className='absolute -right-4 -bottom-4 w-20 h-20 text-slate-500 opacity-[0.05] group-hover:scale-[1.5] group-hover:-rotate-12 transition-all duration-700' />
                    <p className='text-[10px] font-semibold uppercase text-slate-500 mb-1 relative z-10 tracking-wider'>
                      Sisa Saldo
                    </p>
                    <p className='text-[22px] font-bold text-slate-700 relative z-10'>
                      {formatRupiah(totalSaldoFilter)}
                    </p>
                  </motion.div>
                </div>
              </div>

              {/* FILTER RANGE SLIDER (BERDIRI SENDIRI) */}
              <div className='mb-8 px-2'>
                {uniqueDates.length > 1 ? (
                  <div className='relative w-full h-8 flex items-center select-none group'>
                    {/* Tooltip Hover Kiri */}
                    <div
                      className={`absolute bottom-full mb-3 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded shadow-md pointer-events-none font-bold whitespace-nowrap transition-opacity duration-300 ${isSliding ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                      style={{
                        left: `${(rangeMinIdx / maxSliderIdx) * 100}%`,
                      }}>
                      {formatShortDate(uniqueDates[rangeMinIdx])}
                    </div>
                    {/* Tooltip Hover Kanan (Hanya tampil jika beda titik) */}
                    {rangeMinIdx !== rangeMaxIdx && (
                      <div
                        className={`absolute bottom-full mb-3 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded shadow-md pointer-events-none font-bold whitespace-nowrap transition-opacity duration-300 ${isSliding ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                        style={{
                          left: `${(rangeMaxIdx / maxSliderIdx) * 100}%`,
                        }}>
                        {formatShortDate(uniqueDates[rangeMaxIdx])}
                      </div>
                    )}

                    {/* Track Garis Slider */}
                    <div className='absolute left-0 right-0 h-2 bg-slate-200 rounded-full border border-slate-200/50 overflow-hidden'>
                      <div
                        className='absolute h-full bg-emerald-500'
                        style={{
                          left: `${(rangeMinIdx / maxSliderIdx) * 100}%`,
                          right: `${100 - (rangeMaxIdx / maxSliderIdx) * 100}%`,
                        }}
                      />
                    </div>

                    {/* Titik-titik Snap (Dots) */}
                    <div className='absolute left-0 right-0 h-2 flex justify-between pointer-events-none px-[10px]'>
                      {uniqueDates.map((_, i) => (
                        <div
                          key={i}
                          className='w-1.5 h-1.5 rounded-full bg-white/60 z-10 my-auto'
                        />
                      ))}
                    </div>

                    <input
                      type='range'
                      min='0'
                      max={maxSliderIdx}
                      value={rangeMinIdx}
                      onChange={(e) =>
                        setRangeMinIdx(
                          Math.min(Number(e.target.value), rangeMaxIdx),
                        )
                      }
                      onMouseDown={() => {
                        setIsSliding(true);
                        setActiveSliderThumb('min');
                      }}
                      onMouseUp={() => setIsSliding(false)}
                      onTouchStart={() => {
                        setIsSliding(true);
                        setActiveSliderThumb('min');
                      }}
                      onTouchEnd={() => setIsSliding(false)}
                      className={`custom-range absolute w-full top-1/2 -translate-y-1/2 left-0 right-0 h-2 ${activeSliderThumb === 'min' ? 'z-30' : 'z-20'}`}
                    />

                    <input
                      type='range'
                      min='0'
                      max={maxSliderIdx}
                      value={rangeMaxIdx}
                      onChange={(e) =>
                        setRangeMaxIdx(
                          Math.max(Number(e.target.value), rangeMinIdx),
                        )
                      }
                      onMouseDown={() => {
                        setIsSliding(true);
                        setActiveSliderThumb('max');
                      }}
                      onMouseUp={() => setIsSliding(false)}
                      onTouchStart={() => {
                        setIsSliding(true);
                        setActiveSliderThumb('max');
                      }}
                      onTouchEnd={() => setIsSliding(false)}
                      className={`custom-range absolute w-full top-1/2 -translate-y-1/2 left-0 right-0 h-2 ${activeSliderThumb === 'max' ? 'z-30' : 'z-20'}`}
                    />
                  </div>
                ) : (
                  <div className='text-xs text-slate-400 text-center font-medium'>
                    Membutuhkan minimal 2 rekapan hari untuk menggunakan filter
                    geser.
                  </div>
                )}
                {/* Teks Ujung Slider Statis */}
                {uniqueDates.length > 1 && (
                  <div className='flex justify-between text-[10px] font-bold text-slate-400 mt-2 px-1'>
                    <span>{formatShortDate(uniqueDates[0])}</span>
                    <span>{formatShortDate(uniqueDates[maxSliderIdx])}</span>
                  </div>
                )}
              </div>

              {/* LIST RECORD HARIAN (LEPAS DARI BUNGKUSAN CARD) */}
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {filteredFinances.map((fin, idx) => {
                  const dailyTotal =
                    Number(fin.pemasukan) - Number(fin.pengeluaran);
                  const isSelected = selectedIds.includes(fin.id);

                  return (
                    <motion.div
                      layout
                      key={fin.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-20px' }}
                      transition={{ delay: (idx % 3) * 0.1 }}
                      onClick={() =>
                        isSelectionMode
                          ? toggleSelect(fin.id)
                          : setSelectedFinanceId(fin.id)
                      }
                      className={`p-4 flex justify-between items-center rounded-2xl border transition-all duration-300 relative overflow-hidden group cursor-pointer
                      ${isSelectionMode ? 'animate-subtle-jiggle' : 'hover:-translate-y-1.5 hover:shadow-md hover:border-emerald-300 bg-white'}
                      ${isSelected ? 'border-emerald-500 ring-2 ring-emerald-500/30 scale-[0.98] bg-white' : 'border-slate-200 bg-white'}`}>
                      {isEditor && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelect(fin.id);
                          }}
                          className={`absolute top-1/2 -translate-y-1/2 right-4 z-[30] w-5 h-5 rounded-full border-[1.5px] transition-all flex items-center justify-center ${isSelected ? 'border-emerald-500 bg-emerald-500 shadow-md' : 'border-slate-300 bg-white/80 backdrop-blur-sm hover:border-emerald-400'}`}>
                          {isSelected && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className='w-2 h-2 rounded-full bg-white'
                            />
                          )}
                        </button>
                      )}

                      {/* BG ICON YANG MENGEMBANG */}
                      <div className='absolute -right-4 -bottom-4 opacity-[0.03] pointer-events-none group-hover:scale-[1.8] group-hover:-rotate-12 transition-all duration-1000 ease-in-out z-0'>
                        <Receipt className='w-24 h-24 text-emerald-600' />
                      </div>

                      <div className='flex items-center gap-3 relative z-10'>
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-300 ${dailyTotal >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                          <Receipt className='w-5 h-5' />
                        </div>
                        <div>
                          <p className='text-[11px] font-medium text-slate-500 flex items-center gap-1 mb-0.5'>
                            <Clock className='w-3 h-3 text-slate-400' />
                            {formatDate(fin.tanggal)}
                          </p>
                          <p
                            className={`text-[15px] font-bold ${dailyTotal >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                            {dailyTotal >= 0 ? '+' : ''}
                            {formatRupiah(dailyTotal)}
                          </p>
                        </div>
                      </div>

                      {/* PANAH KANAN INTERAKTIF */}
                      {!isEditor && !isSelectionMode && (
                        <ArrowRightCircle className='w-5 h-5 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1.5 transition-all duration-300 relative z-10' />
                      )}
                    </motion.div>
                  );
                })}
                {isEditor && (
                  <motion.button
                    layout
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    onClick={onFinanceAdd}
                    className='h-full w-full bg-transparent border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center p-4 text-slate-400 hover:text-emerald-600 hover:border-emerald-600 hover:bg-emerald-50 transition-all min-h-[70px] group'>
                    <PlusCircle className='w-5 h-5 mr-2 group-hover:scale-110 transition-transform' />
                    <span className='font-semibold text-xs tracking-wider uppercase'>
                      Tambah
                    </span>
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ================= MODAL POP-UP LAPORAN ================= */}
      <AnimatePresence>
        {selectedFinanceId && activeTab === 'laporan' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedFinanceId(null)}
            className='fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4'>
            {finances
              .filter((f) => f.id === selectedFinanceId)
              .map((fin) => (
                <motion.div
                  key={fin.id}
                  initial={{ scale: 0.95, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                  className='bg-white rounded-[2rem] w-full max-w-sm shadow-2xl overflow-hidden relative'>
                  <div className='p-5 bg-slate-50 border-b border-slate-100 flex justify-between items-center'>
                    <div className='flex items-center gap-3'>
                      <div className='w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center'>
                        <Receipt className='w-5 h-5' />
                      </div>
                      <div>
                        <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
                          Rincian Harian
                        </p>
                        <p className='text-sm font-bold text-slate-800'>
                          {isEditor ? (
                            <input
                              type='date'
                              defaultValue={fin.tanggal}
                              onBlur={(e) =>
                                onFinanceUpdate?.(
                                  fin.id,
                                  'tanggal',
                                  e.target.value,
                                )
                              }
                              className='bg-transparent outline-none cursor-pointer text-emerald-600 font-bold'
                            />
                          ) : (
                            formatDate(fin.tanggal)
                          )}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedFinanceId(null)}
                      className='p-2 bg-white rounded-full text-slate-400 hover:bg-slate-200 transition-colors shadow-sm'>
                      <X className='w-4 h-4' />
                    </button>
                  </div>

                  <div className='p-6 space-y-5'>
                    <div className='flex justify-between items-center pb-4 border-b border-dashed border-slate-200'>
                      <span className='text-sm text-slate-500 font-medium'>
                        Pemasukan Kotak Amal
                      </span>
                      <span
                        contentEditable={isEditor}
                        suppressContentEditableWarning
                        onBlur={(e) =>
                          isEditor &&
                          onFinanceUpdate?.(
                            fin.id,
                            'pemasukan',
                            e.currentTarget.innerText,
                          )
                        }
                        className={`text-[17px] font-bold text-emerald-600 ${editableClass}`}>
                        {isEditor ? fin.pemasukan : formatRupiah(fin.pemasukan)}
                      </span>
                    </div>
                    <div>
                      <div className='flex justify-between items-center mb-3'>
                        <span className='text-sm text-slate-500 font-medium'>
                          Pengeluaran Hari Ini
                        </span>
                        <span
                          contentEditable={isEditor}
                          suppressContentEditableWarning
                          onBlur={(e) =>
                            isEditor &&
                            onFinanceUpdate?.(
                              fin.id,
                              'pengeluaran',
                              e.currentTarget.innerText,
                            )
                          }
                          className={`text-[17px] font-bold text-red-500 ${editableClass}`}>
                          {isEditor
                            ? fin.pengeluaran
                            : `- ${formatRupiah(fin.pengeluaran)}`}
                        </span>
                      </div>
                      {(fin.pengeluaran > 0 || isEditor) && (
                        <div className='bg-slate-50/80 p-4 rounded-xl border border-slate-100 text-sm text-slate-600 leading-relaxed shadow-inner mt-2'>
                          <span className='font-bold block mb-1.5 text-slate-700 uppercase tracking-wider text-[10px]'>
                            Catatan Rincian:
                          </span>
                          <span
                            contentEditable={isEditor}
                            suppressContentEditableWarning
                            onBlur={(e) =>
                              isEditor &&
                              onFinanceUpdate?.(
                                fin.id,
                                'keterangan_pengeluaran',
                                e.currentTarget.innerText,
                              )
                            }
                            className={`block font-medium text-[13px] ${editableClass}`}>
                            {fin.keterangan_pengeluaran ||
                              (isEditor
                                ? 'Ketuk untuk menulis rincian...'
                                : '-')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
//
//
//
// 'use client';

// import React, { useState, useMemo, useEffect } from 'react';
// import { motion, Variants, AnimatePresence } from 'framer-motion';
// import {
//   CalendarDays,
//   Users,
//   Gift,
//   Wallet,
//   Search,
//   MapPin,
//   Clock,
//   Receipt,
//   PlusCircle,
//   Trash2,
//   CheckCircle2,
//   TrendingUp,
//   TrendingDown,
//   X,
//   ArrowRightCircle,
//   Filter,
// } from 'lucide-react';

// interface RamadhanUIProps {
//   form: any;
//   schedules: any[];
//   finances: any[];
//   activeYear: string;
//   isEditor?: boolean;
//   onTextChange?: (key: string, value: string) => void;
//   onScheduleUpdate?: (id: string, field: string, value: any) => void;
//   onScheduleDelete?: (id: string) => void;
//   onScheduleAdd?: () => void;
//   onFinanceUpdate?: (id: string, field: string, value: string) => void;
//   onFinanceDelete?: (id: string) => void;
//   onFinanceAdd?: () => void;
// }

// export default function RamadhanUI({
//   form,
//   schedules,
//   finances,
//   activeYear,
//   isEditor = false,
//   onTextChange,
//   onScheduleUpdate,
//   onScheduleDelete,
//   onScheduleAdd,
//   onFinanceUpdate,
//   onFinanceDelete,
//   onFinanceAdd,
// }: RamadhanUIProps) {
//   const [activeTab, setActiveTab] = useState<'imam' | 'takjil' | 'laporan'>(
//     'imam',
//   );
//   const [searchImam, setSearchImam] = useState('');
//   const [searchTakjil, setSearchTakjil] = useState('');

//   // --- STATE MULTI-SELECT (JIGGLE MODE) ---
//   const [selectedIds, setSelectedIds] = useState<string[]>([]);
//   const isSelectionMode = selectedIds.length > 0;

//   useEffect(() => {
//     // Reset seleksi saat pindah tab
//     setSelectedIds([]);
//   }, [activeTab]);

//   const toggleSelect = (id: string) => {
//     setSelectedIds((prev) =>
//       prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
//     );
//   };

//   const handleBulkDelete = () => {
//     if (confirm(`Hapus ${selectedIds.length} data terpilih?`)) {
//       selectedIds.forEach((id) => {
//         if (activeTab === 'laporan') onFinanceDelete?.(id);
//         else onScheduleDelete?.(id);
//       });
//       setSelectedIds([]);
//     }
//   };

//   // --- STATE SLIDER & LAPORAN ---
//   const uniqueDates = useMemo(
//     () => Array.from(new Set(finances.map((f) => f.tanggal))).sort(),
//     [finances],
//   );
//   const maxSliderIdx = uniqueDates.length > 0 ? uniqueDates.length - 1 : 0;

//   const [rangeMinIdx, setRangeMinIdx] = useState(0);
//   const [rangeMaxIdx, setRangeMaxIdx] = useState(maxSliderIdx);
//   const [selectedFinanceId, setSelectedFinanceId] = useState<string | null>(
//     null,
//   );

//   // Auto-sync slider saat data bertambah
//   useEffect(() => {
//     setRangeMaxIdx(maxSliderIdx);
//   }, [maxSliderIdx]);

//   const filterStartDate = uniqueDates[rangeMinIdx] || '';
//   const filterEndDate = uniqueDates[rangeMaxIdx] || '';

//   const editableClass = isEditor
//     ? 'cursor-text hover:ring-2 hover:ring-emerald-500/50 focus:ring-2 focus:ring-emerald-500 focus:bg-white/90 rounded-lg px-2 py-1 outline-none transition-all duration-200 inline-block min-w-[50px]'
//     : 'whitespace-pre-line';
//   const formatRupiah = (angka: number) =>
//     new Intl.NumberFormat('id-ID', {
//       style: 'currency',
//       currency: 'IDR',
//       minimumFractionDigits: 0,
//     }).format(angka);
//   const formatDate = (dateString: string) =>
//     new Date(dateString).toLocaleDateString('id-ID', {
//       day: 'numeric',
//       month: 'short',
//       year: 'numeric',
//     });

//   // --- AUTO-CEKLIS LOGIC ---
//   const checkIsDone = (dateString: string, type: 'imam' | 'takjil') => {
//     const now = new Date();
//     const [year, month, day] = dateString.split('-').map(Number);
//     const scheduleDate = new Date(year, month - 1, day);
//     const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

//     if (scheduleDate < today) return true;
//     if (scheduleDate > today) return false;

//     const currentHour = now.getHours();
//     if (type === 'imam') return currentHour >= 22;
//     if (type === 'takjil') return currentHour >= 18;
//     return false;
//   };

//   const filteredImam = useMemo(
//     () =>
//       schedules.filter(
//         (s) =>
//           s.imam.toLowerCase().includes(searchImam.toLowerCase()) ||
//           s.bilal.toLowerCase().includes(searchImam.toLowerCase()) ||
//           formatDate(s.tanggal)
//             .toLowerCase()
//             .includes(searchImam.toLowerCase()),
//       ),
//     [schedules, searchImam],
//   );

//   const filteredTakjil = useMemo(
//     () =>
//       schedules.filter((s) => {
//         const term = searchTakjil.toLowerCase();
//         const donatur = s.donatur_takjil || 'hamba allah';
//         const alamat = s.alamat_takjil || '';
//         return (
//           donatur.toLowerCase().includes(term) ||
//           alamat.toLowerCase().includes(term) ||
//           formatDate(s.tanggal).toLowerCase().includes(term)
//         );
//       }),
//     [schedules, searchTakjil],
//   );

//   const filteredFinances = useMemo(
//     () =>
//       finances.filter((f) => {
//         if (!filterStartDate && !filterEndDate) return true;
//         const time = new Date(f.tanggal).getTime();
//         const start = filterStartDate ? new Date(filterStartDate).getTime() : 0;
//         const end = filterEndDate
//           ? new Date(filterEndDate).getTime()
//           : Infinity;
//         return time >= start && time <= end;
//       }),
//     [finances, filterStartDate, filterEndDate],
//   );

//   // Kalkulasi Metrik Filter
//   const totalPemasukanFilter = filteredFinances.reduce(
//     (sum, f) => sum + Number(f.pemasukan),
//     0,
//   );
//   const totalPengeluaranFilter = filteredFinances.reduce(
//     (sum, f) => sum + Number(f.pengeluaran),
//     0,
//   );
//   const totalSaldoFilter = totalPemasukanFilter - totalPengeluaranFilter;

//   const tabContentVariant: Variants = {
//     hidden: { opacity: 0, y: 15, scale: 0.98 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       scale: 1,
//       transition: { duration: 0.4, ease: 'easeOut' },
//     },
//     exit: {
//       opacity: 0,
//       y: -15,
//       scale: 0.98,
//       transition: { duration: 0.2, ease: 'easeIn' },
//     },
//   };

//   return (
//     <div className='max-w-6xl mx-auto px-4 py-10 relative'>
//       {/* ==========================================
//           INJECT ANIMASI CSS UNTUK JIGGLE & DUAL SLIDER
//           ========================================== */}
//       <style
//         dangerouslySetInnerHTML={{
//           __html: `
//         @keyframes subtle-jiggle {
//           0% { transform: rotate(-0.5deg) scale(0.99); }
//           50% { transform: rotate(0.5deg) scale(0.99); }
//           100% { transform: rotate(-0.5deg) scale(0.99); }
//         }
//         .animate-subtle-jiggle { animation: subtle-jiggle 0.4s ease-in-out infinite; cursor: pointer !important; }
//         .animate-subtle-jiggle:nth-child(even) { animation-direction: reverse; animation-duration: 0.45s; }

//         .custom-range::-webkit-slider-thumb {
//           pointer-events: auto; appearance: none; width: 20px; height: 20px;
//           background: white; border: 4px solid #10b981; border-radius: 50%; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.2);
//         }
//       `,
//         }}
//       />

//       {/* ==========================================
//           FLOATING ACTION BAR (BULK DELETE)
//           ========================================== */}
//       <AnimatePresence>
//         {isSelectionMode && isEditor && (
//           <motion.div
//             initial={{ y: 100, opacity: 0, scale: 0.9 }}
//             animate={{ y: 0, opacity: 1, scale: 1 }}
//             exit={{ y: 100, opacity: 0, scale: 0.9 }}
//             transition={{ type: 'spring', bounce: 0.3 }}
//             className='fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] bg-slate-900/90 backdrop-blur-xl border border-slate-800 text-white px-3 py-3 rounded-full shadow-2xl flex items-center gap-3 w-max'>
//             <div className='flex items-center gap-3 pl-2 pr-4 border-r border-slate-700'>
//               <span className='flex h-3 w-3 relative'>
//                 <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75'></span>
//                 <span className='relative inline-flex rounded-full h-3 w-3 bg-emerald-500'></span>
//               </span>
//               <span className='text-sm font-bold tracking-wide'>
//                 {selectedIds.length}{' '}
//                 <span className='text-slate-400 font-medium hidden sm:inline'>
//                   Terpilih
//                 </span>
//               </span>
//             </div>
//             <button
//               onClick={() => {
//                 const allIds =
//                   activeTab === 'imam'
//                     ? filteredImam.map((i) => i.id)
//                     : activeTab === 'takjil'
//                       ? filteredTakjil.map((t) => t.id)
//                       : filteredFinances.map((f) => f.id);
//                 setSelectedIds(allIds);
//               }}
//               className='text-xs font-bold text-slate-400 hover:text-white transition-colors px-2'>
//               Pilih Semua
//             </button>
//             <button
//               onClick={handleBulkDelete}
//               className='flex items-center text-xs font-bold bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white px-4 py-2 rounded-full transition-colors ml-2 shadow-inner'>
//               <Trash2 className='w-3.5 h-3.5 mr-1.5' /> Hapus
//             </button>
//             <button
//               onClick={() => setSelectedIds([])}
//               className='ml-2 p-2 bg-slate-800 text-slate-400 rounded-full hover:bg-slate-700 hover:text-white transition-colors'>
//               <X className='w-4 h-4' />
//             </button>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       <motion.div
//         initial={{ opacity: 0, y: 40 }}
//         animate={{ opacity: 1, y: 0 }}
//         className='text-center max-w-3xl mx-auto pt-8 mb-12 relative z-10'>
//         <div className='inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm'>
//           <CalendarDays className='w-3.5 h-3.5 mr-2' /> Ramadhan {activeYear} H
//         </div>
//         <h1
//           contentEditable={isEditor}
//           suppressContentEditableWarning
//           onBlur={(e) =>
//             isEditor &&
//             onTextChange?.(
//               'ramadhan_hero_judul',
//               e.currentTarget.textContent || '',
//             )
//           }
//           className={`text-4xl md:text-5xl font-black text-emerald-800 mb-4 tracking-tight block ${editableClass}`}>
//           {form.ramadhan_hero_judul}
//         </h1>
//         <p
//           contentEditable={isEditor}
//           suppressContentEditableWarning
//           onBlur={(e) =>
//             isEditor &&
//             onTextChange?.(
//               'ramadhan_hero_deskripsi',
//               e.currentTarget.textContent || '',
//             )
//           }
//           className={`text-lg text-slate-500 leading-relaxed max-w-2xl mx-auto block ${editableClass}`}>
//           {form.ramadhan_hero_deskripsi}
//         </p>
//       </motion.div>

//       <div className='flex justify-center mb-8 relative z-20'>
//         <div className='bg-white p-1.5 rounded-2xl border border-slate-200 flex shadow-sm gap-1.5 flex-wrap justify-center'>
//           <button
//             onClick={() => setActiveTab('imam')}
//             className={`flex items-center px-5 py-3 rounded-xl font-bold transition-all text-sm ${activeTab === 'imam' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:bg-emerald-50'}`}>
//             <Users className='w-4 h-4 mr-2' /> Jadwal Tarawih
//           </button>
//           <button
//             onClick={() => setActiveTab('takjil')}
//             className={`flex items-center px-5 py-3 rounded-xl font-bold transition-all text-sm ${activeTab === 'takjil' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-500 hover:bg-orange-50'}`}>
//             <Gift className='w-4 h-4 mr-2' /> Jadwal Takjil
//           </button>
//           <button
//             onClick={() => setActiveTab('laporan')}
//             className={`flex items-center px-5 py-3 rounded-xl font-bold transition-all text-sm ${activeTab === 'laporan' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>
//             <Wallet className='w-4 h-4 mr-2' /> Laporan Keuangan
//           </button>
//         </div>
//       </div>

//       <div
//         className={`mt-4 min-h-[50vh] relative ${isSelectionMode ? 'select-none' : ''}`}>
//         <AnimatePresence mode='wait'>
//           {/* ================= TAB IMAM ================= */}
//           {activeTab === 'imam' && (
//             <motion.div
//               key='tab-imam'
//               variants={tabContentVariant}
//               initial='hidden'
//               animate='visible'
//               exit='exit'>
//               <div className='relative max-w-md mx-auto mb-8'>
//                 <Search className='w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400' />
//                 <input
//                   type='text'
//                   placeholder='Cari Nama Imam, Penceramah...'
//                   value={searchImam}
//                   onChange={(e) => setSearchImam(e.target.value)}
//                   className='w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm'
//                 />
//               </div>

//               <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
//                 {filteredImam.map((item, idx) => {
//                   const isDone =
//                     item.status_imam || checkIsDone(item.tanggal, 'imam');
//                   const isSelected = selectedIds.includes(item.id);

//                   return (
//                     <motion.div
//                       key={item.id}
//                       initial={{ opacity: 0, y: 30 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       transition={{ delay: (idx % 3) * 0.1 }}
//                       onClick={() => isSelectionMode && toggleSelect(item.id)}
//                       className={`p-6 rounded-3xl border transition-all relative overflow-hidden group
//                       ${isSelectionMode ? 'animate-subtle-jiggle cursor-pointer' : 'hover:-translate-y-1 hover:shadow-xl cursor-default'}
//                       ${isSelected ? 'border-emerald-500 ring-2 ring-emerald-500/30 scale-[0.98]' : isDone ? 'border-emerald-100 bg-emerald-50/40 opacity-90 grayscale-[15%] shadow-none' : 'border-slate-100 bg-white shadow-sm'}`}>
//                       {/* DOT SELEKSI */}
//                       {isEditor && (
//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             toggleSelect(item.id);
//                           }}
//                           className={`absolute top-5 right-5 z-[30] w-6 h-6 rounded-full border-[2px] transition-all flex items-center justify-center ${isSelected ? 'border-emerald-500 bg-emerald-500 shadow-md' : 'border-slate-300 bg-white/80 backdrop-blur-sm hover:border-emerald-400'}`}>
//                           {isSelected && (
//                             <motion.span
//                               initial={{ scale: 0 }}
//                               animate={{ scale: 1 }}
//                               className='w-2.5 h-2.5 rounded-full bg-white'
//                             />
//                           )}
//                         </button>
//                       )}

//                       <div className='absolute -right-4 -bottom-4 opacity-[0.03] pointer-events-none group-hover:scale-[1.5] group-hover:-rotate-12 transition-all duration-700 z-0'>
//                         <Users className='w-32 h-32 text-emerald-600' />
//                       </div>

//                       <div className='relative z-10'>
//                         {/* WIDGET TANGGAL & STATUS (SEJAJAR) */}
//                         <div className='flex items-center gap-3 mb-5'>
//                           <div
//                             className={`px-3 py-1 text-xs font-bold rounded-lg shadow-sm ${isDone ? 'bg-white text-emerald-800' : 'bg-emerald-100 text-emerald-800'}`}>
//                             {isEditor ? (
//                               <input
//                                 type='date'
//                                 defaultValue={item.tanggal}
//                                 onBlur={(e) =>
//                                   onScheduleUpdate?.(
//                                     item.id,
//                                     'tanggal',
//                                     e.target.value,
//                                   )
//                                 }
//                                 className='bg-transparent border-none outline-none font-bold cursor-pointer w-[110px]'
//                               />
//                             ) : (
//                               formatDate(item.tanggal)
//                             )}
//                           </div>
//                           <button
//                             onClick={() =>
//                               isEditor &&
//                               !isSelectionMode &&
//                               onScheduleUpdate?.(
//                                 item.id,
//                                 'status_imam',
//                                 !item.status_imam,
//                               )
//                             }
//                             className={`flex items-center gap-1.5 text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border shadow-sm transition-transform ${isEditor && !isSelectionMode ? 'cursor-pointer hover:scale-105' : 'cursor-default pointer-events-none'} ${isDone ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
//                             {isDone ? (
//                               <CheckCircle2 className='w-3.5 h-3.5' />
//                             ) : (
//                               <Clock className='w-3.5 h-3.5 animate-pulse text-amber-500' />
//                             )}
//                             {isDone ? 'Terlaksana' : 'Tertunda'}
//                           </button>
//                         </div>

//                         <div className='space-y-4'>
//                           <div>
//                             <p className='text-[10px] uppercase font-bold text-emerald-600/70 tracking-wider mb-1'>
//                               Imam Tarawih
//                             </p>
//                             <p
//                               contentEditable={isEditor && !isSelectionMode}
//                               suppressContentEditableWarning
//                               onBlur={(e) =>
//                                 isEditor &&
//                                 onScheduleUpdate?.(
//                                   item.id,
//                                   'imam',
//                                   e.currentTarget.innerText,
//                                 )
//                               }
//                               className={`text-lg font-bold text-slate-800 ${editableClass}`}>
//                               {item.imam}
//                             </p>
//                           </div>
//                           <div>
//                             <p className='text-[10px] uppercase font-bold text-emerald-600/70 tracking-wider mb-1'>
//                               Penceramah (Opsional)
//                             </p>
//                             <p
//                               contentEditable={isEditor && !isSelectionMode}
//                               suppressContentEditableWarning
//                               onBlur={(e) =>
//                                 isEditor &&
//                                 onScheduleUpdate?.(
//                                   item.id,
//                                   'penceramah',
//                                   e.currentTarget.innerText,
//                                 )
//                               }
//                               className={`text-sm font-semibold text-slate-600 ${editableClass}`}>
//                               {item.penceramah ||
//                                 (isEditor ? 'Ketuk untuk menambah...' : '-')}
//                             </p>
//                           </div>
//                           <div>
//                             <p className='text-[10px] uppercase font-bold text-emerald-600/70 tracking-wider mb-1'>
//                               Bilal
//                             </p>
//                             <p
//                               contentEditable={isEditor && !isSelectionMode}
//                               suppressContentEditableWarning
//                               onBlur={(e) =>
//                                 isEditor &&
//                                 onScheduleUpdate?.(
//                                   item.id,
//                                   'bilal',
//                                   e.currentTarget.innerText,
//                                 )
//                               }
//                               className={`text-sm font-semibold text-slate-500 ${editableClass}`}>
//                               {item.bilal}
//                             </p>
//                           </div>
//                         </div>
//                       </div>
//                     </motion.div>
//                   );
//                 })}
//                 {isEditor && (
//                   <motion.button
//                     onClick={onScheduleAdd}
//                     className='h-full w-full bg-transparent border-2 border-dashed border-slate-300 rounded-3xl flex items-center justify-center p-5 text-slate-400 hover:text-emerald-600 hover:border-emerald-600 hover:bg-emerald-50 transition-all min-h-[200px]'>
//                     <PlusCircle className='w-8 h-8 mr-2' />
//                     <span className='font-bold text-sm tracking-wider uppercase'>
//                       Tambah
//                     </span>
//                   </motion.button>
//                 )}
//               </div>
//             </motion.div>
//           )}

//           {/* ================= TAB TAKJIL ================= */}
//           {activeTab === 'takjil' && (
//             <motion.div
//               key='tab-takjil'
//               variants={tabContentVariant}
//               initial='hidden'
//               animate='visible'
//               exit='exit'>
//               <div className='relative max-w-md mx-auto mb-8'>
//                 <Search className='w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400' />
//                 <input
//                   type='text'
//                   placeholder='Cari Donatur, Alamat...'
//                   value={searchTakjil}
//                   onChange={(e) => setSearchTakjil(e.target.value)}
//                   className='w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-orange-500 shadow-sm'
//                 />
//               </div>

//               <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
//                 {filteredTakjil.map((item, idx) => {
//                   const isDone =
//                     item.status_takjil || checkIsDone(item.tanggal, 'takjil');
//                   const isSelected = selectedIds.includes(item.id);

//                   return (
//                     <motion.div
//                       key={item.id}
//                       initial={{ opacity: 0, y: 30 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       transition={{ delay: (idx % 3) * 0.1 }}
//                       onClick={() => isSelectionMode && toggleSelect(item.id)}
//                       className={`p-6 rounded-3xl border transition-all relative overflow-hidden group
//                       ${isSelectionMode ? 'animate-subtle-jiggle cursor-pointer' : 'hover:-translate-y-1 hover:shadow-xl cursor-default'}
//                       ${isSelected ? 'border-orange-500 ring-2 ring-orange-500/30 scale-[0.98]' : isDone ? 'border-orange-100 bg-orange-50/40 opacity-90 grayscale-[15%] shadow-none' : 'border-slate-100 bg-white shadow-sm'}`}>
//                       {isEditor && (
//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             toggleSelect(item.id);
//                           }}
//                           className={`absolute top-5 right-5 z-[30] w-6 h-6 rounded-full border-[2px] transition-all flex items-center justify-center ${isSelected ? 'border-orange-500 bg-orange-500 shadow-md' : 'border-slate-300 bg-white/80 backdrop-blur-sm hover:border-orange-400'}`}>
//                           {isSelected && (
//                             <motion.span
//                               initial={{ scale: 0 }}
//                               animate={{ scale: 1 }}
//                               className='w-2.5 h-2.5 rounded-full bg-white'
//                             />
//                           )}
//                         </button>
//                       )}

//                       <div className='absolute -right-4 -bottom-4 opacity-[0.03] pointer-events-none group-hover:scale-[1.5] group-hover:-rotate-12 transition-all duration-700 z-0'>
//                         <Gift className='w-32 h-32 text-orange-600' />
//                       </div>

//                       <div className='relative z-10'>
//                         <div className='flex items-center gap-3 mb-5'>
//                           <div
//                             className={`px-3 py-1 text-xs font-bold rounded-lg shadow-sm ${isDone ? 'bg-white text-orange-800' : 'bg-orange-100 text-orange-800'}`}>
//                             {isEditor ? (
//                               <input
//                                 type='date'
//                                 defaultValue={item.tanggal}
//                                 onBlur={(e) =>
//                                   onScheduleUpdate?.(
//                                     item.id,
//                                     'tanggal',
//                                     e.target.value,
//                                   )
//                                 }
//                                 className='bg-transparent border-none outline-none font-bold cursor-pointer w-[110px]'
//                               />
//                             ) : (
//                               formatDate(item.tanggal)
//                             )}
//                           </div>
//                           <button
//                             onClick={() =>
//                               isEditor &&
//                               !isSelectionMode &&
//                               onScheduleUpdate?.(
//                                 item.id,
//                                 'status_takjil',
//                                 !item.status_takjil,
//                               )
//                             }
//                             className={`flex items-center gap-1.5 text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border shadow-sm transition-transform ${isEditor && !isSelectionMode ? 'cursor-pointer hover:scale-105' : 'cursor-default pointer-events-none'} ${isDone ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
//                             {isDone ? (
//                               <CheckCircle2 className='w-3.5 h-3.5' />
//                             ) : (
//                               <Clock className='w-3.5 h-3.5 animate-pulse text-amber-500' />
//                             )}
//                             {isDone ? 'Tersalurkan' : 'Tertunda'}
//                           </button>
//                         </div>

//                         <div>
//                           <p className='text-[10px] uppercase font-bold text-orange-600/70 tracking-wider mb-1'>
//                             Donatur / Sponsor
//                           </p>
//                           <p
//                             contentEditable={isEditor && !isSelectionMode}
//                             suppressContentEditableWarning
//                             onBlur={(e) =>
//                               isEditor &&
//                               onScheduleUpdate?.(
//                                 item.id,
//                                 'donatur_takjil',
//                                 e.currentTarget.innerText,
//                               )
//                             }
//                             className={`text-sm font-bold text-slate-800 leading-snug line-clamp-3 ${editableClass}`}>
//                             {item.donatur_takjil || 'Hamba Allah'}
//                           </p>
//                           {(item.alamat_takjil || isEditor) && (
//                             <div className='mt-3 flex items-start gap-2 bg-white/40 p-2.5 rounded-xl border border-orange-50/50'>
//                               <MapPin className='w-4 h-4 shrink-0 mt-0.5 text-orange-400' />
//                               <p
//                                 contentEditable={isEditor && !isSelectionMode}
//                                 suppressContentEditableWarning
//                                 onBlur={(e) =>
//                                   isEditor &&
//                                   onScheduleUpdate?.(
//                                     item.id,
//                                     'alamat_takjil',
//                                     e.currentTarget.innerText,
//                                   )
//                                 }
//                                 className={`text-sm text-slate-600 flex-1 ${editableClass}`}>
//                                 {item.alamat_takjil ||
//                                   (isEditor ? 'Tambahkan Alamat...' : '')}
//                               </p>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </motion.div>
//                   );
//                 })}
//                 {isEditor && (
//                   <motion.button
//                     onClick={onScheduleAdd}
//                     className='h-full w-full bg-transparent border-2 border-dashed border-slate-300 rounded-3xl flex items-center justify-center p-5 text-slate-400 hover:text-orange-600 hover:border-orange-600 hover:bg-orange-50 transition-all min-h-[200px]'>
//                     <PlusCircle className='w-8 h-8 mr-2' />
//                     <span className='font-bold text-sm tracking-wider uppercase'>
//                       Tambah
//                     </span>
//                   </motion.button>
//                 )}
//               </div>
//             </motion.div>
//           )}

//           {/* ================= TAB LAPORAN & MODAL POP-UP ================= */}
//           {activeTab === 'laporan' && (
//             <motion.div
//               key='tab-laporan'
//               variants={tabContentVariant}
//               initial='hidden'
//               animate='visible'
//               exit='exit'>
//               {/* FILTER RANGE DUAL SLIDER & CARD METRIK */}
//               <div className='bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm mb-8'>
//                 <div className='flex items-center gap-2 mb-6'>
//                   <Filter className='w-5 h-5 text-emerald-600' />
//                   <h3 className='text-base font-bold text-slate-800'>
//                     Filter Rentang Waktu (Geser Slider)
//                   </h3>
//                 </div>

//                 {/* Custom Dual Range Slider UI */}
//                 {uniqueDates.length > 0 ? (
//                   <div className='relative w-full h-8 flex items-center mb-6 select-none'>
//                     <div className='absolute w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200'>
//                       <div
//                         className='absolute h-full bg-emerald-400 opacity-30'
//                         style={{
//                           left: `${(rangeMinIdx / maxSliderIdx) * 100}%`,
//                           right: `${100 - (rangeMaxIdx / maxSliderIdx) * 100}%`,
//                         }}
//                       />
//                       <div
//                         className='absolute h-full bg-emerald-500 shadow-sm'
//                         style={{
//                           left: `${(rangeMinIdx / maxSliderIdx) * 100}%`,
//                           right: `${100 - (rangeMaxIdx / maxSliderIdx) * 100}%`,
//                         }}
//                       />
//                     </div>
//                     <input
//                       type='range'
//                       min='0'
//                       max={maxSliderIdx}
//                       value={rangeMinIdx}
//                       onChange={(e) => {
//                         const v = Number(e.target.value);
//                         if (v <= rangeMaxIdx) setRangeMinIdx(v);
//                       }}
//                       className='custom-range absolute w-full appearance-none bg-transparent pointer-events-none z-10 outline-none'
//                     />
//                     <input
//                       type='range'
//                       min='0'
//                       max={maxSliderIdx}
//                       value={rangeMaxIdx}
//                       onChange={(e) => {
//                         const v = Number(e.target.value);
//                         if (v >= rangeMinIdx) setRangeMaxIdx(v);
//                       }}
//                       className='custom-range absolute w-full appearance-none bg-transparent pointer-events-none z-20 outline-none'
//                     />
//                   </div>
//                 ) : (
//                   <div className='text-sm text-slate-400 mb-6'>
//                     Belum ada data untuk difilter.
//                   </div>
//                 )}

//                 <div className='flex justify-between items-center text-xs font-bold text-slate-500 mb-6'>
//                   <span className='bg-slate-50 px-3 py-1 rounded-lg border border-slate-200'>
//                     {filterStartDate ? formatDate(filterStartDate) : '-'}
//                   </span>
//                   <span className='text-slate-300'>Sampai</span>
//                   <span className='bg-slate-50 px-3 py-1 rounded-lg border border-slate-200'>
//                     {filterEndDate ? formatDate(filterEndDate) : '-'}
//                   </span>
//                 </div>

//                 {/* 3 Metrik Utama Berdasarkan Filter */}
//                 <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
//                   <div className='bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 relative overflow-hidden group'>
//                     <TrendingUp className='absolute -right-4 -bottom-4 w-20 h-20 text-emerald-500 opacity-5 group-hover:scale-[1.5] group-hover:-rotate-12 transition-all duration-700' />
//                     <p className='text-[10px] font-bold uppercase text-emerald-600/70 mb-1 relative z-10'>
//                       Pemasukan Range Ini
//                     </p>
//                     <p className='text-2xl font-black text-emerald-700 relative z-10'>
//                       {formatRupiah(totalPemasukanFilter)}
//                     </p>
//                   </div>
//                   <div className='bg-red-50/50 p-5 rounded-2xl border border-red-100 relative overflow-hidden group'>
//                     <TrendingDown className='absolute -right-4 -bottom-4 w-20 h-20 text-red-500 opacity-5 group-hover:scale-[1.5] group-hover:-rotate-12 transition-all duration-700' />
//                     <p className='text-[10px] font-bold uppercase text-red-600/70 mb-1 relative z-10'>
//                       Pengeluaran Range Ini
//                     </p>
//                     <p className='text-2xl font-black text-red-700 relative z-10'>
//                       {formatRupiah(totalPengeluaranFilter)}
//                     </p>
//                   </div>
//                   <div className='bg-slate-900 p-5 rounded-2xl border border-slate-800 relative overflow-hidden group shadow-lg'>
//                     <Wallet className='absolute -right-4 -bottom-4 w-20 h-20 text-white opacity-5 group-hover:scale-[1.5] group-hover:-rotate-12 transition-all duration-700' />
//                     <p className='text-[10px] font-bold uppercase text-slate-400 mb-1 relative z-10'>
//                       Saldo Tersisa (Range Ini)
//                     </p>
//                     <p className='text-2xl font-black text-white relative z-10'>
//                       {formatRupiah(totalSaldoFilter)}
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               {/* PILLS LIST LAPORAN */}
//               <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
//                 {filteredFinances.map((fin, idx) => {
//                   const dailyTotal =
//                     Number(fin.pemasukan) - Number(fin.pengeluaran);
//                   const isSelected = selectedIds.includes(fin.id);

//                   return (
//                     <motion.div
//                       layout
//                       key={fin.id}
//                       initial={{ opacity: 0, y: 30 }}
//                       whileInView={{ opacity: 1, y: 0 }}
//                       viewport={{ once: true, margin: '-20px' }}
//                       transition={{ delay: (idx % 3) * 0.1 }}
//                       onClick={() =>
//                         isSelectionMode
//                           ? toggleSelect(fin.id)
//                           : setSelectedFinanceId(fin.id)
//                       }
//                       className={`p-5 flex justify-between items-center rounded-2xl border transition-all duration-300 relative overflow-hidden group
//                       ${isSelectionMode ? 'animate-subtle-jiggle cursor-pointer' : 'hover:-translate-y-1 hover:shadow-md cursor-pointer bg-white'}
//                       ${isSelected ? 'border-emerald-500 ring-2 ring-emerald-500/30 scale-[0.98] bg-white' : 'border-slate-200'}`}>
//                       {isEditor && (
//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             toggleSelect(fin.id);
//                           }}
//                           className={`absolute top-1/2 -translate-y-1/2 right-5 z-[30] w-6 h-6 rounded-full border-[2px] transition-all flex items-center justify-center ${isSelected ? 'border-emerald-500 bg-emerald-500 shadow-md' : 'border-slate-300 bg-white/80 backdrop-blur-sm hover:border-emerald-400'}`}>
//                           {isSelected && (
//                             <motion.span
//                               initial={{ scale: 0 }}
//                               animate={{ scale: 1 }}
//                               className='w-2.5 h-2.5 rounded-full bg-white'
//                             />
//                           )}
//                         </button>
//                       )}

//                       <div className='absolute -right-4 -bottom-4 opacity-[0.03] pointer-events-none group-hover:scale-[1.5] group-hover:-rotate-12 transition-all duration-700 z-0'>
//                         <Receipt className='w-32 h-32 text-emerald-600' />
//                       </div>

//                       <div className='flex items-center gap-4 relative z-10'>
//                         <div
//                           className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-300 ${dailyTotal >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
//                           <Receipt className='w-6 h-6' />
//                         </div>
//                         <div>
//                           <p className='text-xs font-bold text-slate-400 flex items-center gap-1.5 mb-0.5'>
//                             <Clock className='w-3 h-3' />
//                             {formatDate(fin.tanggal)}
//                           </p>
//                           <p
//                             className={`text-lg font-black ${dailyTotal >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
//                             {dailyTotal >= 0 ? '+' : ''}
//                             {formatRupiah(dailyTotal)}
//                           </p>
//                         </div>
//                       </div>
//                       {!isEditor && !isSelectionMode && (
//                         <ArrowRightCircle className='w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-colors' />
//                       )}
//                     </motion.div>
//                   );
//                 })}
//                 {isEditor && (
//                   <motion.button
//                     layout
//                     initial={{ opacity: 0 }}
//                     whileInView={{ opacity: 1 }}
//                     viewport={{ once: true }}
//                     onClick={onFinanceAdd}
//                     className='h-full w-full bg-transparent border-2 border-dashed border-slate-300 rounded-3xl flex items-center justify-center p-5 text-slate-400 hover:text-emerald-600 hover:border-emerald-600 hover:bg-emerald-50 transition-all min-h-[80px] group'>
//                     <PlusCircle className='w-6 h-6 mr-2 group-hover:scale-110 transition-transform' />
//                     <span className='font-bold text-sm tracking-wider uppercase'>
//                       Tambah
//                     </span>
//                   </motion.button>
//                 )}
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>

//       {/* ================= MODAL POP-UP LAPORAN KEUANGAN ================= */}
//       <AnimatePresence>
//         {selectedFinanceId && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             onClick={() => setSelectedFinanceId(null)}
//             className='fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4'>
//             {finances
//               .filter((f) => f.id === selectedFinanceId)
//               .map((fin) => (
//                 <motion.div
//                   key={fin.id}
//                   initial={{ scale: 0.95, y: 20 }}
//                   animate={{ scale: 1, y: 0 }}
//                   exit={{ scale: 0.95, y: 20 }}
//                   onClick={(e) => e.stopPropagation()}
//                   className='bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative'>
//                   <div className='p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center'>
//                     <div className='flex items-center gap-3'>
//                       <div className='w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center'>
//                         <Receipt className='w-5 h-5' />
//                       </div>
//                       <div>
//                         <p className='text-xs font-bold text-slate-400 uppercase tracking-widest'>
//                           Rincian Laporan
//                         </p>
//                         <p className='text-sm font-bold text-slate-800'>
//                           {isEditor ? (
//                             <input
//                               type='date'
//                               defaultValue={fin.tanggal}
//                               onBlur={(e) =>
//                                 onFinanceUpdate?.(
//                                   fin.id,
//                                   'tanggal',
//                                   e.target.value,
//                                 )
//                               }
//                               className='bg-transparent outline-none cursor-pointer text-emerald-600'
//                             />
//                           ) : (
//                             formatDate(fin.tanggal)
//                           )}
//                         </p>
//                       </div>
//                     </div>
//                     <button
//                       onClick={() => setSelectedFinanceId(null)}
//                       className='p-2 bg-white rounded-full text-slate-400 hover:bg-slate-200 transition-colors'>
//                       <X className='w-5 h-5' />
//                     </button>
//                   </div>

//                   <div className='p-6 space-y-5'>
//                     <div className='flex justify-between items-center pb-4 border-b border-dashed border-slate-200'>
//                       <span className='text-sm text-slate-500 font-medium'>
//                         Pemasukan Kotak Amal
//                       </span>
//                       <span
//                         contentEditable={isEditor}
//                         suppressContentEditableWarning
//                         onBlur={(e) =>
//                           isEditor &&
//                           onFinanceUpdate?.(
//                             fin.id,
//                             'pemasukan',
//                             e.currentTarget.innerText,
//                           )
//                         }
//                         className={`text-lg font-black text-emerald-600 ${editableClass}`}>
//                         {isEditor ? fin.pemasukan : formatRupiah(fin.pemasukan)}
//                       </span>
//                     </div>
//                     <div>
//                       <div className='flex justify-between items-center mb-3'>
//                         <span className='text-sm text-slate-500 font-medium'>
//                           Pengeluaran Hari Ini
//                         </span>
//                         <span
//                           contentEditable={isEditor}
//                           suppressContentEditableWarning
//                           onBlur={(e) =>
//                             isEditor &&
//                             onFinanceUpdate?.(
//                               fin.id,
//                               'pengeluaran',
//                               e.currentTarget.innerText,
//                             )
//                           }
//                           className={`text-lg font-black text-red-500 ${editableClass}`}>
//                           {isEditor
//                             ? fin.pengeluaran
//                             : `- ${formatRupiah(fin.pengeluaran)}`}
//                         </span>
//                       </div>
//                       {(fin.pengeluaran > 0 || isEditor) && (
//                         <div className='bg-red-50/50 p-4 rounded-xl border border-red-100 text-sm text-red-700 leading-relaxed shadow-inner'>
//                           <span className='font-black block mb-1 text-red-800 uppercase text-[10px] tracking-widest'>
//                             Catatan / Rincian:
//                           </span>
//                           <span
//                             contentEditable={isEditor}
//                             suppressContentEditableWarning
//                             onBlur={(e) =>
//                               isEditor &&
//                               onFinanceUpdate?.(
//                                 fin.id,
//                                 'keterangan_pengeluaran',
//                                 e.currentTarget.innerText,
//                               )
//                             }
//                             className={`block ${editableClass}`}>
//                             {fin.keterangan_pengeluaran ||
//                               (isEditor
//                                 ? 'Ketuk untuk menulis rincian...'
//                                 : 'Tidak ada catatan rincian yang disertakan.')}
//                           </span>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </motion.div>
//               ))}
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }
