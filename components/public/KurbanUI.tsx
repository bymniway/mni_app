'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Loader2,
  Scissors,
  ShoppingBag,
  Scale,
  Users,
  UserCheck,
  CalendarDays,
  ChevronDown,
  Truck,
  HeartHandshake,
  HelpCircle,
  ShieldAlert,
  FileText,
  Gift,
  MessageCircle,
  X,
  PlusCircle,
} from 'lucide-react';
import PanitiaKurban from './PanitiaKurban';

const IconMap: any = { ShoppingBag, Truck, Scissors, FileText };

export default function KurbanUI({
  form,
  distList,
  faqList,
  snkList,
  panitiaList,
  timelineList,
  katalogHewan,
  jasaPotong,
  daftarPekurban,
  periodeKurban,
  isEditor = false,
  onTextChange,
  onArrayChange,
  onArrayAdd,
  onArrayDelete,
  onPanitiaUpdate,
  onPanitiaDelete,
  onPanitiaAdd,
  onImageUpload,
}: any) {
  const [activeTab, setActiveTab] = useState<
    'beli' | 'jasa' | 'pekurban' | 'panitia'
  >('beli');
  const [pekurbanFilter, setPekurbanFilter] = useState('Semua');
  const [hewanFilter, setHewanFilter] = useState('Semua'); // STATE BARU: Untuk Filter Tipe Hewan
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const formatRupiah = (angka: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(angka);

  const handleShareWA = () => {
    const text = `Assalamu'alaikum. Mari tunaikan ibadah kurban Anda melalui Masjid Nurul Iman. Tersedia Sapi Utuh, Sapi Urunan 1/7, dan Kambing dengan kualitas terbaik.\n\nDaftar sekarang di: https://nuruliman.id/kurban`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const filteredPekurban =
    daftarPekurban?.filter((p: any) => {
      if (pekurbanFilter === 'Semua') return true;
      const isUrunan =
        p.hewan?.tipe?.toLowerCase().includes('urunan') ||
        p.hewan?.jenis?.toLowerCase().includes('urunan');
      const isSapi = p.hewan?.jenis?.toLowerCase().includes('sapi');
      const isKambing = p.hewan?.jenis?.toLowerCase().includes('kambing');
      if (pekurbanFilter === 'Sapi Urunan') return isUrunan;
      if (pekurbanFilter === 'Sapi Utuh') return isSapi && !isUrunan;
      if (pekurbanFilter === 'Kambing') return isKambing;
      return true;
    }) || [];

  const editableClass = isEditor
    ? 'cursor-text hover:ring-2 hover:ring-mni-primary/50 focus:ring-2 focus:ring-mni-primary focus:bg-white/90 rounded-lg px-2 py-1 outline-none transition-all duration-200 inline-block min-w-[50px]'
    : 'whitespace-pre-line';

  // LOGIKA PROGRESS BAR DINAMIS
  const timelineSafe = timelineList || [];
  let lastActiveIndex = 0;
  timelineSafe.forEach((step: any, idx: number) => {
    if (step.active) lastActiveIndex = idx;
  });
  const progressWidth =
    timelineSafe.length > 1
      ? (lastActiveIndex / (timelineSafe.length - 1)) * 100
      : 0;

  // FUNGSI HITUNG SLOT URUNAN REAL-TIME
  const hitungSlotTerisi = (hewanId: string) => {
    if (!daftarPekurban) return 0;
    // Hitung berapa orang yang beli hewan ini (Hanya hitung yang Lunas atau Menunggu)
    return daftarPekurban.filter((p: any) => p.hewan?.id === hewanId).length;
  };

  // 1. FILTER UTAMA: Singkirkan hewan yang ada di Tong Sampah atau Dihapus Total
  const activeKatalog =
    katalogHewan?.filter((h: any) => !h.in_trash && !h.is_hidden) || [];

  // LOGIKA FILTER TIPE HEWAN (Hanya menghitung hewan yang aktif)
  const tipeCounts =
    activeKatalog.reduce((acc: any, curr: any) => {
      const t = curr.tipe || 'Lainnya';
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, {}) || {};

  const filterTipeList = ['Semua', ...Object.keys(tipeCounts)];

  // 2. FILTER KEDUA: Filter berdasarkan Tag (Semua / Tipe A / Tipe B)
  const filteredKatalog = activeKatalog.filter((h: any) => {
    if (hewanFilter === 'Semua') return true;
    return (h.tipe || 'Lainnya') === hewanFilter;
  });

  return (
    <div className='max-w-6xl mx-auto px-4 py-10 overflow-hidden'>
      {/* 1. HEADER HERO */}
      <motion.div
        initial='hidden'
        animate='visible'
        className='text-center max-w-3xl mx-auto pt-8 mb-12 relative z-10'>
        <div className='inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-green-50 border border-green-100 text-green-700 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm'>
          <CalendarDays className='w-3.5 h-3.5 mr-2' /> Idul Adha{' '}
          {periodeKurban} H
        </div>
        <br />
        <h1
          contentEditable={isEditor}
          suppressContentEditableWarning
          onBlur={(e) =>
            isEditor &&
            onTextChange('kurban_hero_judul', e.currentTarget.textContent)
          }
          className={`text-4xl md:text-5xl font-black text-mni-primary mb-4 tracking-tight ${editableClass}`}>
          {form.kurban_hero_judul || 'Layanan Kurban MNI'}
        </h1>
        <br />
        <p
          contentEditable={isEditor}
          suppressContentEditableWarning
          onBlur={(e) =>
            isEditor &&
            onTextChange('kurban_hero_deskripsi', e.currentTarget.textContent)
          }
          className={`text-lg text-mni-muted leading-relaxed max-w-2xl mx-auto ${editableClass}`}>
          {form.kurban_hero_deskripsi ||
            'Tunaikan ibadah kurban Anda dengan mudah. Transparan dalam pelaporan, amanah dalam penyaluran, dan ketat sesuai syariat.'}
        </p>

        {!isEditor && (
          <div className='flex justify-center mt-6'>
            <button
              onClick={handleShareWA}
              className='flex items-center bg-[#25D366] hover:bg-[#20bd5a] text-white px-6 py-2.5 rounded-full font-bold text-sm transition-colors shadow-md hover:shadow-lg hover:-translate-y-0.5'>
              <MessageCircle className='w-4 h-4 mr-2' /> Bagikan Info WA
            </button>
          </div>
        )}
      </motion.div>

      {/* 2. TIMELINE PROGRES KEGIATAN */}
      <div className='max-w-4xl mx-auto mb-16 hidden md:block relative'>
        <div className='absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 z-0 rounded-full'></div>
        <div
          className='absolute top-1/2 left-0 h-1 bg-mni-primary -translate-y-1/2 z-0 rounded-full transition-all duration-700 ease-out'
          style={{ width: `${progressWidth}%` }}></div>
        <div className='relative z-10 flex justify-between'>
          {timelineSafe.map((step: any) => {
            const Icon = IconMap[step.iconName] || ShoppingBag;
            return (
              <div
                key={step.id}
                className='flex flex-col items-center group relative w-32'>
                {isEditor && (
                  <button
                    onClick={() =>
                      onArrayChange(
                        'timelineList',
                        step.id,
                        'active',
                        !step.active,
                      )
                    }
                    className={`absolute -top-10 px-3 py-1 rounded-md text-[10px] font-bold z-20 shadow-sm border transition-colors ${step.active ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-500 hover:text-white' : 'bg-green-50 text-green-600 border-green-100 hover:bg-green-500 hover:text-white'}`}>
                    Set {step.active ? 'Selesai' : 'Aktif'}
                  </button>
                )}
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center border-4 border-white shadow-md transition-transform group-hover:scale-110 relative z-10 ${step.active ? 'bg-mni-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                  <Icon className='w-6 h-6' />
                </div>
                <p
                  contentEditable={isEditor}
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    isEditor &&
                    onArrayChange(
                      'timelineList',
                      step.id,
                      'label',
                      e.currentTarget.textContent,
                    )
                  }
                  className={`mt-3 font-bold text-sm text-center w-full ${step.active ? 'text-mni-text' : 'text-gray-400'} ${editableClass}`}>
                  {step.label}
                </p>
                <p
                  contentEditable={isEditor}
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    isEditor &&
                    onArrayChange(
                      'timelineList',
                      step.id,
                      'desc',
                      e.currentTarget.textContent,
                    )
                  }
                  className={`text-xs font-medium text-center w-full ${step.active ? 'text-mni-primary/80' : 'text-gray-400'} ${editableClass}`}>
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. TAB NAVIGASI */}
      <div className='flex flex-col md:flex-row justify-center items-center gap-4 mb-12'>
        <div className='flex flex-col items-center'>
          <span className='text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2'>
            Layanan Transaksi
          </span>
          <div className='bg-white p-1.5 rounded-2xl border border-gray-200 flex shadow-sm gap-1.5'>
            <button
              onClick={() => setActiveTab('beli')}
              className={`flex items-center px-5 py-3 rounded-xl font-bold transition-all text-sm ${activeTab === 'beli' ? 'bg-mni-primary text-white shadow-md' : 'text-mni-muted hover:bg-green-50 hover:text-mni-primary'}`}>
              <ShoppingBag className='w-4 h-4 mr-2' /> Katalog Hewan
            </button>
            <button
              onClick={() => setActiveTab('jasa')}
              className={`flex items-center px-5 py-3 rounded-xl font-bold transition-all text-sm ${activeTab === 'jasa' ? 'bg-mni-accent text-white shadow-md' : 'text-mni-muted hover:bg-orange-50 hover:text-mni-accent'}`}>
              <Scissors className='w-4 h-4 mr-2' /> Titip Potong
            </button>
          </div>
        </div>
        <div className='flex flex-col items-center mt-4 md:mt-0'>
          <span className='text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2'>
            Transparansi Laporan
          </span>
          <div className='bg-white p-1.5 rounded-2xl border border-gray-200 flex shadow-sm gap-1.5'>
            <button
              onClick={() => setActiveTab('pekurban')}
              className={`flex items-center px-5 py-3 rounded-xl font-bold transition-all text-sm ${activeTab === 'pekurban' ? 'bg-gray-800 text-white shadow-md' : 'text-mni-muted hover:bg-gray-100 hover:text-gray-900'}`}>
              <Users className='w-4 h-4 mr-2' /> Daftar Pekurban
            </button>
            <button
              onClick={() => setActiveTab('panitia')}
              className={`flex items-center px-5 py-3 rounded-xl font-bold transition-all text-sm ${activeTab === 'panitia' ? 'bg-gray-800 text-white shadow-md' : 'text-mni-muted hover:bg-gray-100 hover:text-gray-900'}`}>
              <UserCheck className='w-4 h-4 mr-2' /> Susunan Panitia
            </button>
          </div>
        </div>
      </div>

      {/* ISI KONTEN TABS */}
      <div className='mt-8 min-h-[50vh]'>
        {/* TAB: BELI HEWAN */}
        {activeTab === 'beli' && (
          <div className='flex flex-col'>
            {/* FILTER HORIZONTAL TIPE HEWAN DENGAN MASK GRADIENT */}
            <div className='w-full relative mb-8'>
              <div
                className='flex overflow-x-auto gap-3 py-2 px-4 sm:px-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x'
                style={{
                  WebkitMaskImage:
                    'linear-gradient(to right, transparent 0%, black 20px, black calc(100% - 20px), transparent 100%)',
                  maskImage:
                    'linear-gradient(to right, transparent 0%, black 20px, black calc(100% - 20px), transparent 100%)',
                }}>
                {filterTipeList.map((tipe) => {
                  const count =
                    tipe === 'Semua' ? activeKatalog.length : tipeCounts[tipe];
                  const isActive = hewanFilter === tipe;
                  return (
                    <button
                      key={tipe}
                      onClick={() => setHewanFilter(tipe)}
                      className={`snap-start relative flex items-center justify-center whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold transition-all border-2 ${
                        isActive
                          ? 'bg-teal-50 border-teal-600 text-teal-700 shadow-sm'
                          : 'bg-white border-gray-100 text-gray-500 hover:text-teal-700 hover:border-teal-200 hover:bg-teal-50/50 shadow-sm'
                      }`}>
                      {tipe}
                      {/* Superscript Teal 700 Tanpa Background */}
                      <sup className='ml-1 text-teal-700 font-black text-[11px] leading-none'>
                        {count}
                      </sup>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
              {filteredKatalog?.map((hewan: any) => {
                const isUrunan =
                  hewan.tipe.toLowerCase().includes('urunan') ||
                  hewan.jenis.toLowerCase().includes('urunan');
                const slotTotal = 7;
                // Hitung Real-Time dari Database
                const slotTerisiReal = isUrunan
                  ? hitungSlotTerisi(hewan.id)
                  : 0;

                // Cek Ketersediaan:
                // Jika status dari admin = Terjual, ATAU (jika urunan dan slot sudah 7)
                const isPenuhOtomatis = isUrunan && slotTerisiReal >= slotTotal;
                const isTersedia =
                  hewan.status.toLowerCase() === 'tersedia' && !isPenuhOtomatis;

                return (
                  <div
                    key={hewan.id}
                    className={`h-full bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all group flex flex-col relative ${!isTersedia && 'opacity-80 grayscale-[20%]'}`}>
                    <div className='h-52 overflow-hidden relative z-10 shrink-0'>
                      {hewan.gambar_url ? (
                        <img
                          src={hewan.gambar_url}
                          className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-700'
                        />
                      ) : (
                        <div className='w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 font-medium text-sm'>
                          Tidak ada gambar
                        </div>
                      )}
                      <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent'></div>
                      <div className='absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-full text-[10px] font-bold text-mni-primary tracking-wider uppercase'>
                        {hewan.jenis}
                      </div>

                      <div
                        className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase shadow-sm ${isTersedia ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                        {isPenuhOtomatis ? 'Kuota Penuh' : hewan.status}
                      </div>

                      <div className='absolute bottom-4 left-4 right-4 text-white'>
                        <h3 className='text-xl font-bold'>{hewan.tipe}</h3>
                        {hewan.berat && (
                          <span className='text-sm font-medium text-gray-200 flex items-center mt-1'>
                            <Scale className='w-4 h-4 mr-1.5' /> Estimasi Berat:{' '}
                            {hewan.berat} Kg
                          </span>
                        )}
                      </div>
                    </div>

                    <div className='p-6 flex flex-col flex-1 relative bg-white'>
                      {/* ANIMASI KADO BACKGROUND CARD DIKEMBALIKAN */}
                      <div className='absolute -right-8 -bottom-8 opacity-[0.03] pointer-events-none z-0 group-hover:scale-125 transition-transform duration-700'>
                        <Gift className='w-40 h-40' />
                      </div>

                      <p className='text-sm text-gray-500 mb-5 line-clamp-3 leading-relaxed flex-1'>
                        {hewan.deskripsi}
                      </p>

                      <div className='mt-auto relative z-10'>
                        {/* MEKANISME PROGRESS BAR URUNAN REAL-TIME */}
                        {isUrunan && (
                          <div className='mb-5'>
                            <div className='flex justify-between items-end mb-2'>
                              <span className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>
                                Slot Terisi
                              </span>
                              <span
                                className={`text-sm font-bold ${slotTerisiReal >= slotTotal ? 'text-red-500' : 'text-mni-primary'}`}>
                                {slotTerisiReal}{' '}
                                <span className='text-xs text-gray-400 font-medium'>
                                  / {slotTotal} Orang
                                </span>
                              </span>
                            </div>
                            <div className='w-full bg-gray-100 rounded-full h-2 flex overflow-hidden shadow-inner'>
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{
                                  width: `${(slotTerisiReal / slotTotal) * 100}%`,
                                }}
                                transition={{ duration: 1 }}
                                className={`${slotTerisiReal >= slotTotal ? 'bg-red-500' : 'bg-mni-primary'} h-full rounded-full`}
                              />
                            </div>
                            {isTersedia && slotTerisiReal > 0 && (
                              <p className='text-[10px] text-mni-primary font-bold mt-2 text-right'>
                                🔥 Sisa {slotTotal - slotTerisiReal} Slot Lagi!
                              </p>
                            )}
                          </div>
                        )}

                        <div className='flex flex-col mb-5 pt-2 border-t border-gray-100'>
                          <span className='text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1'>
                            {isUrunan ? 'Harga 1/7 Bagian' : 'Total Biaya'}
                          </span>
                          <span
                            className={`text-2xl font-bold ${isTersedia ? 'text-mni-primary' : 'text-gray-400'}`}>
                            {formatRupiah(hewan.harga)}
                          </span>
                        </div>

                        {isTersedia && !isEditor ? (
                          <Link href={`/checkout?hewanId=${hewan.id}`}>
                            <button className='w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold hover:bg-mni-primary transition-colors shadow-md flex items-center justify-center relative z-20'>
                              <ShoppingBag className='w-5 h-5 mr-2' /> Pesan
                              Sekarang
                            </button>
                          </Link>
                        ) : (
                          <button
                            disabled
                            className='w-full bg-gray-100 text-gray-400 py-3.5 rounded-xl font-bold cursor-not-allowed border border-gray-200 relative z-20'>
                            {isEditor
                              ? 'Nonaktif di Mode Editor'
                              : 'Alhamdulillah Terjual'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB: JASA POTONG */}
        {activeTab === 'jasa' && (
          <div className='max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6'>
            {jasaPotong
              ?.filter((j: any) => !j.in_trash && !j.is_hidden)
              .map((jasa: any) => {
                const isTersedia = jasa.status.toLowerCase() === 'tersedia';
                return (
                  <div
                    key={jasa.id}
                    className={`bg-white rounded-3xl p-8 border border-gray-100 shadow-sm transition-all group relative overflow-hidden flex flex-col ${isTersedia ? 'hover:shadow-xl hover:border-mni-accent' : 'opacity-70 grayscale-[30%]'}`}>
                    <div className='absolute -right-6 -bottom-6 opacity-5 pointer-events-none group-hover:scale-125 transition-transform duration-700 z-0'>
                      <Scissors className='w-40 h-40 text-mni-accent' />
                    </div>
                    <div className='w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 text-mni-accent shadow-inner border border-orange-100 relative z-10 shrink-0'>
                      <Scissors className='w-8 h-8' />
                    </div>
                    <div className='flex justify-between items-center mb-3 relative z-10'>
                      <h3 className='text-xl font-bold text-mni-text'>
                        Titip {jasa.tipe}
                      </h3>
                      {!isTersedia && (
                        <span className='bg-red-50 text-red-600 text-[10px] font-bold px-3 py-1 rounded-full border border-red-100 uppercase tracking-wider'>
                          Penuh
                        </span>
                      )}
                    </div>
                    <p className='text-sm text-gray-500 mb-6 leading-relaxed relative z-10 flex-1'>
                      {jasa.deskripsi}
                    </p>
                    <div className='mb-6 relative z-10 mt-auto'>
                      <p className='text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1'>
                        Biaya Operasional
                      </p>
                      <span className='text-2xl font-bold text-mni-accent'>
                        {formatRupiah(jasa.harga)}
                      </span>
                      <span className='text-gray-400 text-sm font-bold'>
                        {' '}
                        / ekor
                      </span>
                    </div>
                    {isTersedia && !isEditor ? (
                      <Link
                        href={`/checkout?hewanId=${jasa.id}`}
                        className='relative z-20 block shrink-0'>
                        <button className='w-full bg-white border-2 border-mni-accent text-mni-accent hover:bg-mni-accent hover:text-white py-3.5 rounded-xl font-bold transition-colors shadow-sm'>
                          Daftar Titip Potong
                        </button>
                      </Link>
                    ) : (
                      <button
                        disabled
                        className='w-full bg-gray-100 text-gray-400 py-3.5 rounded-xl font-bold cursor-not-allowed border border-gray-200 relative z-20 shrink-0'>
                        {isEditor ? 'Nonaktif di Mode Editor' : 'Kuota Penuh'}
                      </button>
                    )}
                  </div>
                );
              })}
          </div>
        )}

        {/* TAB: PEKURBAN */}
        {activeTab === 'pekurban' && (
          <div className='max-w-5xl mx-auto space-y-8'>
            <div className='flex flex-col md:flex-row justify-between items-center bg-gray-900 rounded-[2rem] p-6 md:p-8 shadow-lg'>
              <div className='text-center md:text-left mb-6 md:mb-0 md:mr-8'>
                <h2 className='text-2xl font-black text-white mb-2'>
                  Daftar Shohibul Kurban
                </h2>
                <p className='text-sm text-gray-400'>
                  Semoga Allah SWT menerima amal ibadah kurban dari para jamaah.
                </p>
              </div>
              <div className='flex flex-wrap justify-center gap-2'>
                {['Semua', 'Sapi Utuh', 'Sapi Urunan', 'Kambing'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setPekurbanFilter(f)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors border ${pekurbanFilter === f ? 'bg-white text-gray-900 border-white' : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'}`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {filteredPekurban.length === 0 ? (
                <div className='col-span-full text-center py-16 text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200'>
                  <Users className='w-12 h-12 mb-3 mx-auto opacity-20' />
                  <p className='font-medium'>Belum ada data.</p>
                </div>
              ) : (
                filteredPekurban.map((pekurban: any, idx: number) => {
                  const isUrunan =
                    pekurban.hewan?.tipe?.toLowerCase().includes('urunan') ||
                    pekurban.hewan?.jenis?.toLowerCase().includes('urunan');
                  return (
                    <div
                      key={idx}
                      className='relative bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start space-x-4 hover:border-gray-300 transition-all overflow-hidden'>
                      <div
                        className={`relative z-10 w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${isUrunan ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'}`}>
                        <UserCheck className='w-6 h-6' />
                      </div>
                      <div className='flex-1 min-w-0 relative z-10'>
                        <h4 className='font-bold text-gray-900 text-base truncate'>
                          {pekurban.nama_mudhohi}
                        </h4>
                        <div className='flex flex-col text-xs text-gray-500 mt-2 space-y-1.5'>
                          <span className='font-medium bg-gray-50 px-2 py-1 rounded-lg w-max border border-gray-100'>
                            {pekurban.hewan?.jenis} - {pekurban.hewan?.tipe}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB: PANITIA */}
        {activeTab === 'panitia' && (
          <PanitiaKurban
            data={{
              judul: form.kurban_panitia_judul,
              deskripsi: form.kurban_panitia_deskripsi,
            }}
            panitiaList={panitiaList}
            periode={periodeKurban}
            isEditor={isEditor}
            onTextChange={(key: string, val: string) =>
              onTextChange(`kurban_panitia_${key}`, val)
            }
            onPanitiaUpdate={onPanitiaUpdate}
            onPanitiaDelete={onPanitiaDelete}
            onPanitiaAdd={onPanitiaAdd}
            onImageUpload={onImageUpload}
          />
        )}
      </div>

      {/* 4. TARGET DISTRIBUSI */}
      <div className='mt-20'>
        <div className='max-w-5xl mx-auto bg-white border border-gray-100 rounded-[2rem] p-8 md:p-10 shadow-sm relative overflow-hidden'>
          <div className='text-center mb-8 relative z-10'>
            <h3
              contentEditable={isEditor}
              suppressContentEditableWarning
              onBlur={(e) =>
                isEditor &&
                onTextChange('kurban_dist_judul', e.currentTarget.textContent)
              }
              className={`text-xl md:text-2xl font-bold text-mni-text inline-block ${editableClass}`}>
              {form.kurban_dist_judul || 'Target Distribusi Daging Kurban'}
            </h3>
            <p
              contentEditable={isEditor}
              suppressContentEditableWarning
              onBlur={(e) =>
                isEditor &&
                onTextChange(
                  'kurban_dist_deskripsi',
                  e.currentTarget.textContent,
                )
              }
              className={`text-sm text-gray-500 mt-2 max-w-xl mx-auto ${editableClass}`}>
              {form.kurban_dist_deskripsi ||
                'Penyaluran amanah, adil, dan tepat sasaran kepada mereka yang berhak menerima.'}
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10'>
            {distList?.map((dist: any) => (
              <div
                key={dist.id}
                className='bg-gray-50 border border-gray-100 rounded-2xl p-6 text-center group hover:bg-white hover:shadow-sm transition-all hover:-translate-y-1 hover:border-mni-primary/20 relative'>
                {isEditor && (
                  <button
                    onClick={() => onArrayDelete('distList', dist.id)}
                    className='absolute top-2 right-2 p-1.5 bg-red-50 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-colors'>
                    <X className='w-3 h-3' />
                  </button>
                )}
                <div
                  contentEditable={isEditor}
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    isEditor &&
                    onArrayChange(
                      'distList',
                      dist.id,
                      'persen',
                      e.currentTarget.textContent,
                    )
                  }
                  className={`text-3xl font-bold text-mni-primary mb-2 inline-block ${editableClass}`}>
                  {dist.persen || '0%'}
                </div>
                <div
                  contentEditable={isEditor}
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    isEditor &&
                    onArrayChange(
                      'distList',
                      dist.id,
                      'judul',
                      e.currentTarget.textContent,
                    )
                  }
                  className={`text-sm font-bold text-gray-800 mb-2 block ${editableClass}`}>
                  {dist.judul || 'Judul Kategori'}
                </div>
                <p
                  contentEditable={isEditor}
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    isEditor &&
                    onArrayChange(
                      'distList',
                      dist.id,
                      'deskripsi',
                      e.currentTarget.textContent,
                    )
                  }
                  className={`text-xs text-gray-500 leading-relaxed ${editableClass}`}>
                  {dist.deskripsi || 'Deskripsi singkat kategori distribusi.'}
                </p>
              </div>
            ))}
            {isEditor && (
              <button
                onClick={() => onArrayAdd('distList')}
                className='bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center min-h-[150px] text-gray-400 hover:text-mni-primary hover:border-mni-primary transition-all'>
                <PlusCircle className='w-6 h-6 mb-2' /> Tambah Target
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 5. FAQ & SYARAT KETENTUAN */}
      <div className='mt-16 pt-8'>
        <div className='max-w-3xl mx-auto'>
          <div className='text-center mb-10'>
            <h2
              contentEditable={isEditor}
              suppressContentEditableWarning
              onBlur={(e) =>
                isEditor &&
                onTextChange('kurban_faq_judul', e.currentTarget.textContent)
              }
              className={`text-2xl font-black text-gray-900 inline-flex items-center justify-center ${editableClass}`}>
              <HelpCircle className='w-6 h-6 mr-2 text-mni-primary' />{' '}
              {form.kurban_faq_judul || 'Tanya Jawab (F.A.Q)'}
            </h2>
            <p
              contentEditable={isEditor}
              suppressContentEditableWarning
              onBlur={(e) =>
                isEditor &&
                onTextChange(
                  'kurban_faq_deskripsi',
                  e.currentTarget.textContent,
                )
              }
              className={`text-sm text-gray-500 mt-2 block ${editableClass}`}>
              {form.kurban_faq_deskripsi ||
                'Jawaban cepat untuk pertanyaan seputar ibadah kurban di Masjid Nurul Iman.'}
            </p>
          </div>

          <div className='space-y-3 mb-16'>
            {faqList?.map((faq: any, i: number) => {
              const isOpen = activeFaq === i || isEditor;
              return (
                <div
                  key={faq.id}
                  className='bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm relative'>
                  <div className='w-full text-left p-5 flex justify-between items-start bg-gray-50/50'>
                    <div className='flex-1 pr-4'>
                      <span
                        contentEditable={isEditor}
                        suppressContentEditableWarning
                        onBlur={(e) =>
                          isEditor &&
                          onArrayChange(
                            'faqList',
                            faq.id,
                            'q',
                            e.currentTarget.textContent,
                          )
                        }
                        className={`font-bold text-gray-800 text-sm md:text-base block ${editableClass}`}>
                        {faq.q || 'Pertanyaan Baru?'}
                      </span>
                    </div>
                    {!isEditor ? (
                      <button
                        onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                        className='p-1 focus:outline-none'>
                        <ChevronDown
                          className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        />
                      </button>
                    ) : (
                      <button
                        onClick={() => onArrayDelete('faqList', faq.id)}
                        className='p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors'>
                        <X className='w-4 h-4' />
                      </button>
                    )}
                  </div>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className='overflow-hidden'>
                        <div className='p-5 pt-0 border-t border-gray-100'>
                          <div
                            contentEditable={isEditor}
                            suppressContentEditableWarning
                            onBlur={(e) =>
                              isEditor &&
                              onArrayChange(
                                'faqList',
                                faq.id,
                                'a',
                                e.currentTarget.innerText,
                              )
                            }
                            className={`text-sm text-gray-600 leading-relaxed block mt-3 ${editableClass}`}>
                            {faq.a ||
                              'Tuliskan jawaban dari pertanyaan di sini...'}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
            {isEditor && (
              <button
                onClick={() => onArrayAdd('faqList')}
                className='w-full py-4 bg-white border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center text-gray-400 hover:text-mni-primary hover:border-mni-primary transition-all font-bold text-sm'>
                <PlusCircle className='w-5 h-5 mr-2' /> Tambah Pertanyaan (FAQ)
              </button>
            )}
          </div>

          <div className='bg-blue-50/50 border border-blue-100 rounded-3xl p-6 md:p-8 flex items-start gap-4'>
            <ShieldAlert className='w-8 h-8 text-blue-500 shrink-0 mt-1' />
            <div className='flex-1'>
              <h4
                contentEditable={isEditor}
                suppressContentEditableWarning
                onBlur={(e) =>
                  isEditor &&
                  onTextChange('kurban_snk_judul', e.currentTarget.textContent)
                }
                className={`font-bold text-blue-900 mb-3 inline-block ${editableClass}`}>
                {form.kurban_snk_judul || 'Syarat & Ketentuan Kurban MNI'}
              </h4>
              <ul className='text-xs text-blue-800 space-y-3 leading-relaxed list-disc list-outside pl-4'>
                {snkList?.map((snk: any) => (
                  <li
                    key={snk.id}
                    className='relative group/snk'>
                    <span
                      contentEditable={isEditor}
                      suppressContentEditableWarning
                      onBlur={(e) =>
                        isEditor &&
                        onArrayChange(
                          'snkList',
                          snk.id,
                          'teks',
                          e.currentTarget.innerText,
                        )
                      }
                      className={`block pr-8 ${editableClass}`}>
                      {snk.teks || 'Syarat baru...'}
                    </span>
                    {isEditor && (
                      <button
                        onClick={() => onArrayDelete('snkList', snk.id)}
                        className='absolute right-0 top-0 p-1 text-red-400 hover:text-red-600 opacity-0 group-hover/snk:opacity-100 transition-opacity'>
                        <X className='w-3 h-3' />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
              {isEditor && (
                <button
                  onClick={() => onArrayAdd('snkList')}
                  className='mt-4 text-[10px] font-bold bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg flex items-center hover:bg-blue-600 hover:text-white transition-colors'>
                  <PlusCircle className='w-3 h-3 mr-1' /> Tambah Syarat
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
