'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import imageCompression from 'browser-image-compression';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  Search,
  Loader2,
  MapPin,
  PackageOpen,
  Camera,
  CheckCircle2,
  Clock,
  Filter,
  MessageCircle,
  Beef,
  X,
  Maximize2,
  CalendarDays,
  ChevronDown,
  CheckSquare,
} from 'lucide-react';

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    return false;
  }
};

export default function DistribusiDashboard() {
  const [pesananList, setPesananList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [activeFilter, setActiveFilter] = useState<
    'Semua' | 'Siap Antar' | 'Selesai'
  >('Semua');

  // --- STATE FILTER PERIODE SINGLE SELECT ---
  const [selectedPeriode, setSelectedPeriode] = useState<string>('');

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedKirim, setSelectedKirim] = useState<any>(null);
  const [catatanKurir, setCatatanKurir] = useState('');
  const [fotoBukti, setFotoBukti] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [viewImage, setViewImage] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const searchInputMobileRef = useRef<HTMLInputElement>(null);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const fetchSiapKirim = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('pesanan')
      .select('*, hewan(jenis, tipe, periode)')
      .in('status_pesanan', ['Selesai', 'Terkirim'])
      .order('status_pesanan', { ascending: false });

    if (data) setPesananList(data);
    setTimeout(() => setIsLoading(false), 400);
  };

  useEffect(() => {
    fetchSiapKirim();
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Ekstrak Periode Unik
  const availablePeriode = useMemo(() => {
    const periods = new Set(
      pesananList.map((p) => p.hewan?.periode || '1447 H'),
    );
    return Array.from(periods).sort((a, b) => b.localeCompare(a));
  }, [pesananList]);

  // Set Default Periode (Terbaru)
  useEffect(() => {
    if (availablePeriode.length > 0 && !selectedPeriode) {
      setSelectedPeriode(availablePeriode[0]);
    }
  }, [availablePeriode, selectedPeriode]);

  useEffect(() => {
    if (!fotoBukti) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(fotoBukti);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [fotoBukti]);

  const handleOpenWa = (e: React.MouseEvent, trx: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (!trx.whatsapp) return;
    let cleanWa = trx.whatsapp.replace(/\D/g, '');
    if (cleanWa.startsWith('0')) cleanWa = '62' + cleanWa.substring(1);

    const jenis = trx.hewan?.jenis || 'Kurban';
    const tipe = trx.hewan?.tipe || '';
    const hakDaging = trx.bagian_sepertiga || 'Sedekah Semua';
    const alamat = trx.alamat || 'Sesuai Pendaftaran';

    const msg = `Assalamu'alaikum Bpk/Ibu ${trx.nama_mudhohi},%0A%0ATerima kasih atas kurban *${jenis} ${tipe}* dengan kode transaksi *${trx.kode_trx}*. Semoga ibadah kurban Bpk/Ibu diterima di sisi Allah SWT dan membawa keberkahan.%0A%0AKami dari Panitia Kurban menginformasikan bahwa saat ini panitia kami sedang menuju alamat:%0A📍 ${alamat}%0A%0AUntuk mengantarkan hak daging kurban Anda berupa:%0A🥩 ${hakDaging}%0A%0A. Mohon kesediaannya untuk menunggu di lokasi. Jika ada kendala, silakan balas pesan ini.%0A%0A.. Terima kasih atas kepercayaan Anda. 🙏`;

    window.open(`https://wa.me/${cleanWa}?text=${msg}`, '_blank');
  };

  const handleOpenMaps = (e: React.MouseEvent, alamat: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!alamat) return;
    window.open(
      `https://maps.google.com/?q=${encodeURIComponent(alamat)}`,
      '_blank',
    );
  };

  const filteredData = useMemo(() => {
    return pesananList.filter((p) => {
      if (selectedPeriode && (p.hewan?.periode || '1447 H') !== selectedPeriode)
        return false;

      const matchesSearch =
        p.nama_mudhohi.toLowerCase().includes(search.toLowerCase()) ||
        p.kode_trx.toLowerCase().includes(search.toLowerCase()) ||
        (p.whatsapp && p.whatsapp.includes(search));

      const matchesTab =
        activeFilter === 'Semua'
          ? true
          : activeFilter === 'Siap Antar'
            ? p.status_pesanan === 'Selesai'
            : p.status_pesanan === 'Terkirim';

      return matchesSearch && matchesTab;
    });
  }, [pesananList, search, activeFilter, selectedPeriode]);

  const baseFilteredByPeriode = pesananList.filter(
    (p) => (p.hewan?.periode || '1447 H') === selectedPeriode,
  );
  const totalPaket = baseFilteredByPeriode.length;
  const totalTerkirim = baseFilteredByPeriode.filter(
    (p) => p.status_pesanan === 'Terkirim',
  ).length;
  const persenProgres =
    totalPaket === 0 ? 0 : Math.round((totalTerkirim / totalPaket) * 100);

  const handleSelesaikanPengiriman = async () => {
    if (!fotoBukti) return alert('Wajib melampirkan foto serah terima!');
    setIsSubmitting(true);

    try {
      const options = {
        maxSizeMB: 1.5,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(fotoBukti, options);

      const formData = new FormData();
      formData.append('file', compressedFile);
      formData.append('provider', 'ALIBABA');
      formData.append('folder', 'bukti-distribusi-assets');

      const resUpload = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (!resUpload.ok)
        throw new Error(`Server menolak gambar (${resUpload.status})`);

      const { url } = await resUpload.json();
      if (!url) throw new Error('URL Gambar gagal didapatkan.');

      const { data: psn } = await supabase
        .from('pesanan')
        .select('logs')
        .eq('id', selectedKirim.id)
        .single();
      const currentLogs = psn?.logs || [];
      const newLog = {
        status: 'Hak Daging Diterima',
        timestamp: new Date().toISOString(),
        oleh: 'Panitia Distribusi',
        catatan:
          catatanKurir || 'Daging kurban diserahkan ke mudhohi/penerima.',
      };

      const { error } = await supabase
        .from('pesanan')
        .update({
          status_pesanan: 'Terkirim',
          logs: [...currentLogs, newLog],
          bukti_kirim_url: url,
          catatan_kurir: catatanKurir,
        })
        .eq('id', selectedKirim.id);

      if (error) throw error;

      setSelectedKirim(null);
      setFotoBukti(null);
      setCatatanKurir('');
      fetchSiapKirim();
    } catch (err: any) {
      alert(`Gagal mengirim: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Varian Animasi Stagger Index-based
  const itemVariants: Variants = {
    hidden: { opacity: 0, scale: 0.85, x: -40 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        type: 'spring',
        stiffness: 350,
        damping: 25,
      },
    }),
    exit: (i: number) => ({
      opacity: 0,
      scale: 0.85,
      x: -40,
      transition: { delay: i * 0.02, duration: 0.2 },
    }),
  };

  return (
    <div className='min-h-screen bg-[#f8fafc] pb-36 pt-4 md:pt-8 px-4 md:px-10 font-sans relative'>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes border-pulse-amber {
          0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.25); border-color: rgba(245, 158, 11, 0.5); }
          70% { box-shadow: 0 0 0 6px rgba(245, 158, 11, 0); border-color: rgba(245, 158, 11, 0.1); }
          100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); border-color: rgba(245, 158, 11, 0.5); }
        }
        .card-antre-urgent {
          animation: border-pulse-amber 2s infinite;
          background: #fffdf7;
        }
        
        @keyframes marquee-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee-scroll 18s linear infinite;
        }
        .mask-marquee {
          mask-image: linear-gradient(to right, transparent, black 10px, black 90%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 10px, black 90%, transparent);
        }
      `,
        }}
      />

      {/* HEADER & FILTER */}
      <div
        className={`sticky top-0 z-[40] ${isScrolled ? 'bg-white/85 backdrop-blur-xl border-b border-slate-200/60 shadow-sm' : 'bg-transparent'} py-2 md:py-4 -mx-4 px-4 md:mx-0 md:px-6 flex justify-between items-center gap-3 lg:gap-6 transition-all duration-300`}>
        <div
          className={`flex items-start justify-start relative select-none transition-all duration-500 overflow-hidden ${isMobileSearchOpen ? 'max-w-0 opacity-0 -translate-x-10' : 'flex-1 lg:flex-none opacity-100 translate-x-0'}`}>
          <div
            className={`mt-2 md:mt-2.5 mr-2 w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-teal-600 shrink-0`}
          />
          <div className={`z-10 text-slate-800`}>
            <h1
              className={`tracking-tight font-bold text-xl md:text-2xl leading-none`}>
              Distribusi
            </h1>
            <div
              className={`transition-all duration-300 overflow-hidden ${isScrolled ? 'max-h-0 opacity-0' : 'max-h-20 opacity-100 mt-1'}`}>
              <p
                className={`text-[11px] md:text-xs font-medium text-slate-500`}>
                Manifes Pengantaran Daging
              </p>
            </div>
          </div>
        </div>

        <div
          className={`flex items-center gap-2 relative z-[70] transition-all duration-500 ${isMobileSearchOpen ? 'w-full' : 'w-auto'}`}>
          <div className='hidden md:flex items-center gap-2'>
            <div className='relative w-[280px]'>
              <Search className='w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400' />
              <input
                type='text'
                placeholder='Cari nama / WA...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className='w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-teal-500 text-sm font-medium shadow-sm transition-all'
              />
            </div>

            <div className='relative shrink-0 w-25'>
              <CalendarDays className='w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none' />
              <select
                value={selectedPeriode}
                onChange={(e) => setSelectedPeriode(e.target.value)}
                className='w-full pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-xs font-bold text-slate-600 appearance-none cursor-pointer hover:bg-slate-50 shadow-sm'>
                {availablePeriode.length === 0 && (
                  <option value=''>Data Kosong</option>
                )}
                {availablePeriode.map((p) => (
                  <option
                    key={p}
                    value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <ChevronDown className='w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none' />
            </div>
          </div>

          <AnimatePresence>
            {isMobileSearchOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: '100%', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className='md:hidden flex items-center gap-2 overflow-hidden w-full'>
                <div className='flex-1 relative w-full'>
                  <Search className='w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400' />
                  <input
                    ref={searchInputMobileRef}
                    autoFocus
                    type='text'
                    placeholder='Cari...'
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className='w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-teal-500 text-sm font-medium shadow-sm'
                  />
                </div>
                <button
                  onClick={() => {
                    setIsMobileSearchOpen(false);
                    setSearch('');
                  }}
                  className='shrink-0 p-2.5 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-xl shadow-sm'>
                  <X className='w-5 h-5' />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {!isMobileSearchOpen && (
            <div className='md:hidden flex items-center gap-2'>
              <button
                onClick={() => setIsMobileSearchOpen(true)}
                className='flex items-center justify-center bg-white border border-slate-200 w-11 h-11 rounded-xl shadow-sm text-slate-500'>
                <Search className='w-4 h-4' />
              </button>

              <div className='relative shrink-0 w-28'>
                <select
                  value={selectedPeriode}
                  onChange={(e) => setSelectedPeriode(e.target.value)}
                  className='w-full px-3 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-teal-500 text-xs font-bold text-slate-600 appearance-none cursor-pointer shadow-sm text-center'>
                  {availablePeriode.length === 0 && <option value=''>-</option>}
                  {availablePeriode.map((p) => (
                    <option
                      key={p}
                      value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <ChevronDown className='w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none' />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className='max-w-2xl mx-auto mt-4 md:mt-6 pb-20'>
        {isLoading ? (
          <div className='flex justify-center py-20'>
            <Loader2 className='w-8 h-8 animate-spin text-teal-600' />
          </div>
        ) : !selectedPeriode ? (
          <div className='text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-sm'>
            <CalendarDays className='w-10 h-10 text-slate-300 mx-auto mb-3' />
            <h3 className='text-base font-bold text-slate-600'>
              Pilih Periode
            </h3>
            <p className='text-xs text-slate-400 mt-1'>
              Silakan pilih periode kurban terlebih dahulu.
            </p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className='text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-sm'>
            <PackageOpen className='w-10 h-10 text-slate-300 mx-auto mb-3' />
            <h3 className='text-base font-bold text-slate-600'>
              Manifes Kosong
            </h3>
            <p className='text-xs text-slate-400 mt-1'>
              Data "{activeFilter}" tidak ditemukan.
            </p>
          </div>
        ) : (
          <div className='flex flex-col gap-3'>
            <AnimatePresence mode='popLayout'>
              {filteredData.map((trx, index) => {
                const isTerkirim = trx.status_pesanan === 'Terkirim';
                const isExpanded = expandedId === trx.id;

                const jenisHewan = trx.hewan?.jenis || 'Hewan';
                const tipeHewan = trx.hewan?.tipe || 'Kurban';
                const bagianDaging = trx.bagian_sepertiga || 'Sedekah Semua';
                const alamatPekurban = trx.alamat || 'Diambil di Masjid';

                // Elemen Marquee (Digandakan untuk scroll mulus)
                const tagItems = [
                  <>
                    <Beef className='w-3 h-3 inline mr-1' />
                    {jenisHewan} {tipeHewan}
                  </>,
                  <>
                    <PackageOpen className='w-3 h-3 inline mr-1' />
                    {bagianDaging}
                  </>,
                  <>
                    <MapPin className='w-3 h-3 inline mr-1' />
                    {alamatPekurban}
                  </>,
                ];

                return (
                  <motion.div
                    key={trx.id}
                    custom={index}
                    variants={itemVariants}
                    initial='hidden'
                    animate='visible'
                    exit='exit'
                    layout
                    className={`relative p-3 rounded-[1.25rem] border overflow-hidden group transition-all select-none ${
                      isTerkirim
                        ? 'border-slate-200 bg-slate-50'
                        : 'card-antre-urgent border-amber-300'
                    }`}>
                    <PackageOpen
                      className={`absolute -right-4 -bottom-4 w-24 h-24 opacity-[0.03] group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-700 pointer-events-none z-0 ${isTerkirim ? 'text-slate-800' : 'text-amber-800'}`}
                    />

                    {/* --- AREA ATAS (SELALU TAMPIL) --- */}
                    <div
                      className='flex items-center gap-3 relative z-10 cursor-pointer'
                      onClick={() => setExpandedId(isExpanded ? null : trx.id)}>
                      {/* Avatar / Eksekusi 2 */}
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isTerkirim && trx.bukti_kirim_url) {
                            setViewImage(trx.bukti_kirim_url);
                          } else if (!isTerkirim) {
                            setSelectedKirim(trx);
                          }
                        }}
                        className={`w-[70px] h-[70px] md:w-20 md:h-20 shrink-0 rounded-xl relative overflow-hidden flex flex-col items-center justify-center transition-all duration-300 ${
                          isTerkirim
                            ? 'bg-emerald-50 border border-emerald-100 hover:shadow-md hover:-translate-y-0.5'
                            : 'bg-amber-100/40 border-2 border-dashed border-amber-300 hover:bg-amber-100 hover:border-amber-400 hover:border-solid hover:-translate-y-0.5 hover:shadow-md'
                        }`}>
                        {/* Badge Absolute dalam Frame */}
                        <div
                          className={`absolute top-0 left-0 px-1.5 py-0.5 rounded-br-lg text-[8px] font-black uppercase tracking-wider z-20 ${
                            isTerkirim
                              ? 'bg-emerald-500 text-white'
                              : 'bg-amber-500 text-white'
                          }`}>
                          {isTerkirim ? 'Tuntas' : 'Antre'}
                        </div>

                        {isTerkirim && trx.bukti_kirim_url ? (
                          <img
                            src={trx.bukti_kirim_url}
                            className='w-full h-full object-cover'
                          />
                        ) : (
                          <div className='flex flex-col items-center justify-center opacity-60'>
                            <Camera
                              className={`w-5 h-5 md:w-6 md:h-6 mb-1 ${isTerkirim ? 'text-emerald-600' : 'text-amber-600'}`}
                            />
                            {!isTerkirim && (
                              <span className='text-[7px] md:text-[8px] font-bold text-amber-700 uppercase'>
                                Eksekusi
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Info Tengah */}
                      <div className='flex-1 min-w-0 py-1'>
                        <h3
                          className={`font-bold text-sm md:text-base leading-tight mb-1.5 ${isExpanded ? '' : 'line-clamp-1'} ${isTerkirim ? 'text-slate-600' : 'text-slate-800'}`}>
                          {trx.nama_mudhohi}
                        </h3>

                        {/* Marquee Tags */}
                        <div className='w-full overflow-hidden mask-marquee'>
                          <div className='flex w-max animate-marquee gap-2 items-center pr-2'>
                            {tagItems.map((item, idx) => (
                              <span
                                key={`a-${idx}`}
                                className={`text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap border ${isTerkirim ? 'bg-white border-slate-200 text-slate-500' : 'bg-amber-50/80 border-amber-200/60 text-amber-700'}`}>
                                {item}
                              </span>
                            ))}
                            {tagItems.map((item, idx) => (
                              <span
                                key={`b-${idx}`}
                                className={`text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap border ${isTerkirim ? 'bg-white border-slate-200 text-slate-500' : 'bg-amber-50/80 border-amber-200/60 text-amber-700'}`}>
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Panah Kanan */}
                      <div className='shrink-0 pl-1'>
                        <div
                          className={`p-1.5 rounded-lg transition-colors ${isExpanded ? 'bg-slate-200/50' : 'bg-transparent'}`}>
                          <ChevronDown
                            className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* --- AREA BAWAH (EXPANDED) --- */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className='relative z-10 overflow-hidden'>
                          <div className='mt-3 pt-3 border-t border-slate-200/60'>
                            {/* Detail Teks */}
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 mb-4 px-1 text-[11px] md:text-xs'>
                              <div className='flex gap-2'>
                                <span className='text-slate-400 font-bold w-16'>
                                  Kode
                                </span>
                                <span className='font-bold text-slate-700'>
                                  {trx.kode_trx}
                                </span>
                              </div>
                              <div className='flex gap-2'>
                                <span className='text-slate-400 font-bold w-16'>
                                  Kurban
                                </span>
                                <span className='font-bold text-slate-700'>
                                  {trx.hewan?.jenis || '-'}{' '}
                                  {trx.hewan?.tipe || ''}
                                </span>
                              </div>
                              <div className='flex gap-2'>
                                <span className='text-slate-400 font-bold w-16'>
                                  Kontak
                                </span>
                                <span className='font-bold text-slate-700'>
                                  {trx.whatsapp || '-'}
                                </span>
                              </div>
                              <div className='flex gap-2 md:col-span-2'>
                                <span className='text-slate-400 font-bold w-16 shrink-0'>
                                  Alamat
                                </span>
                                <span className='font-medium text-slate-600 leading-relaxed'>
                                  {trx.alamat || 'Diambil di Masjid'}
                                </span>
                              </div>
                              <div className='flex gap-2 md:col-span-2'>
                                <span className='text-slate-400 font-bold w-16 shrink-0'>
                                  Bagian 1/3
                                </span>
                                <span className='font-semibold text-slate-700'>
                                  {trx.bagian_sepertiga || 'Sedekah Semua'}
                                </span>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className='flex gap-2.5'>
                              {trx.whatsapp && (
                                <button
                                  onClick={(e) => handleOpenWa(e, trx)}
                                  className='h-11 w-14 shrink-0 bg-white border border-slate-200 shadow-sm hover:shadow-md active:shadow-none hover:-translate-y-0.5 active:translate-y-0 rounded-xl flex items-center justify-center text-slate-500 hover:text-[#25D366] hover:bg-slate-50 hover:border-slate-300 transition-all duration-300'>
                                  <MessageCircle className='w-5 h-5' />
                                </button>
                              )}
                              {trx.alamat && (
                                <button
                                  onClick={(e) => handleOpenMaps(e, trx.alamat)}
                                  className='h-11 w-14 shrink-0 bg-white border border-slate-200 shadow-sm hover:shadow-md active:shadow-none hover:-translate-y-0.5 active:translate-y-0 rounded-xl flex items-center justify-center text-slate-500 hover:text-blue-500 hover:bg-slate-50 hover:border-slate-300 transition-all duration-300'>
                                  <MapPin className='w-5 h-5' />
                                </button>
                              )}
                              {!isTerkirim && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedKirim(trx);
                                  }}
                                  className='h-11 flex-1 bg-amber-100 hover:bg-amber-200 border border-amber-200 hover:border-amber-300 shadow-sm hover:shadow-md active:shadow-none hover:-translate-y-0.5 active:translate-y-0 rounded-xl flex items-center justify-center text-amber-800 text-xs font-bold gap-2 transition-all duration-300'>
                                  <Camera className='w-4 h-4' /> Eksekusi
                                  Pengiriman
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* BOTTOM NAV / PROGRESS BAR */}
      <motion.div
        className={`fixed bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 z-[70] w-max max-w-[96%] bg-slate-900/95 backdrop-blur-2xl border border-white/10 shadow-[0_15px_40px_rgba(0,0,0,0.5)] rounded-full p-2 flex items-center transition-all duration-500`}>
        <div className='flex gap-1 overflow-x-auto hide-scrollbar rounded-full pr-3 sm:border-r border-slate-700/50'>
          {(['Semua', 'Siap Antar', 'Selesai'] as const).map((tab) => {
            const count =
              tab === 'Semua'
                ? totalPaket
                : tab === 'Siap Antar'
                  ? totalPaket - totalTerkirim
                  : totalTerkirim;
            return (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`shrink-0 px-4 py-2 rounded-full text-[10px] sm:text-xs font-bold transition-all flex items-center gap-1.5 ${activeFilter === tab ? 'bg-teal-500 text-white shadow-md' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}>
                {tab === 'Semua' && <Filter className='w-3 h-3' />}
                {tab === 'Siap Antar' && <Clock className='w-3 h-3' />}
                {tab === 'Selesai' && <CheckSquare className='w-3 h-3' />}
                {tab}
                {count > 0 && (
                  <sup className='ml-0.5 text-[8px] opacity-70'>{count}</sup>
                )}
              </button>
            );
          })}
        </div>
        <div className='pl-3 pr-2 sm:flex flex-col justify-center items-end'>
          <span className='text-[8px] text-slate-400 font-bold uppercase tracking-widest mb-1'>
            Progres
          </span>
          <div className='flex items-center gap-2'>
            <div className='w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden'>
              <div
                className='bg-teal-400 h-full transition-all duration-1000'
                style={{ width: `${persenProgres}%` }}></div>
            </div>
            <span className='text-[10px] text-white font-medium leading-none'>
              {totalTerkirim}/{totalPaket}
            </span>
          </div>
        </div>
      </motion.div>

      {/* LIGHTBOX BUKTI PENGIRIMAN */}
      <AnimatePresence>
        {viewImage && (
          <div className='fixed inset-0 z-[150] flex items-center justify-center p-4'>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='absolute inset-0 bg-black/95 backdrop-blur-sm'
              onClick={() => setViewImage(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className='relative z-10 w-full max-w-2xl flex flex-col items-center justify-center'>
              <img
                src={viewImage}
                alt='Bukti Full'
                className='w-full max-h-[80vh] object-contain rounded-xl'
              />
              <button
                onClick={() => setViewImage(null)}
                className='absolute -top-14 right-0 bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full backdrop-blur-sm transition-all shadow-lg'>
                <X className='w-6 h-6' />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL EKSEKUSI PENGIRIMAN */}
      <AnimatePresence>
        {selectedKirim && (
          <div className='fixed inset-0 z-[100] flex items-end sm:items-center justify-center'>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='absolute inset-0 bg-slate-900/50 backdrop-blur-sm'
              onClick={() => {
                if (!isSubmitting) {
                  setSelectedKirim(null);
                  setFotoBukti(null);
                  setCatatanKurir('');
                }
              }}
            />
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className='relative bg-white w-full sm:max-w-sm rounded-t-[2rem] sm:rounded-[2rem] p-6 pb-8 shadow-2xl'>
              <div className='w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-5 sm:hidden'></div>

              <div className='mb-5'>
                <h2 className='text-lg font-bold text-slate-800 flex items-center gap-2'>
                  <Camera className='w-5 h-5 text-teal-600' /> Bukti Pengiriman
                </h2>
                <p className='text-xs text-slate-500 mt-1'>
                  Penerima:{' '}
                  <b className='text-slate-800'>{selectedKirim.nama_mudhohi}</b>
                </p>
                <p className='text-xs text-slate-500 mt-1'>
                  Alamat:{' '}
                  <b className='text-slate-800'>{selectedKirim.alamat}</b>
                </p>
              </div>

              <div className='space-y-4'>
                <div>
                  <div
                    className={`relative w-full h-44 rounded-2xl border-2 flex flex-col items-center justify-center overflow-hidden transition-all ${previewUrl ? 'border-teal-500 shadow-md' : 'border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100'}`}>
                    <input
                      type='file'
                      accept='image/*,capture=camera'
                      onChange={(e) =>
                        setFotoBukti(e.target.files?.[0] || null)
                      }
                      className='absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20'
                      disabled={isSubmitting}
                    />
                    {previewUrl ? (
                      <>
                        <img
                          src={previewUrl}
                          className='w-full h-full object-cover scale-105'
                        />
                        <div className='absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-10'>
                          <Camera className='w-6 h-6 text-white mb-1' />
                          <span className='text-white text-xs font-bold'>
                            Ganti Foto
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className='text-center'>
                        <div className='w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm border border-slate-200'>
                          <Camera className='w-5 h-5 text-slate-500' />
                        </div>
                        <p className='text-[11px] font-bold text-slate-600'>
                          Buka Kamera
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <textarea
                    rows={2}
                    placeholder='Catatan pengiriman (Opsional)...'
                    value={catatanKurir}
                    onChange={(e) => setCatatanKurir(e.target.value)}
                    disabled={isSubmitting}
                    className='w-full border-2 border-slate-100 rounded-xl p-3 text-xs font-medium outline-none focus:border-slate-300 bg-slate-50 resize-none'
                  />
                </div>

                <div className='flex gap-2 pt-1'>
                  <button
                    onClick={() => {
                      setSelectedKirim(null);
                      setFotoBukti(null);
                      setCatatanKurir('');
                    }}
                    disabled={isSubmitting}
                    className='w-1/3 py-3 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 text-xs transition-colors'>
                    Batal
                  </button>
                  <button
                    onClick={handleSelesaikanPengiriman}
                    disabled={isSubmitting || !fotoBukti}
                    className='w-2/3 py-3 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 flex items-center justify-center gap-1.5 text-xs shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all duration-300'>
                    {isSubmitting ? (
                      <>
                        <Loader2 className='w-3.5 h-3.5 animate-spin' /> Loading
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className='w-3.5 h-3.5' /> Konfirmasi
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
//
//
//
// 'use client';

// import React, { useState, useEffect, useMemo, useRef } from 'react';
// import { supabase } from '@/lib/supabase';
// import imageCompression from 'browser-image-compression';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//   Search,
//   Loader2,
//   MapPin,
//   PackageOpen,
//   Camera,
//   CheckCircle2,
//   Phone,
//   Copy,
//   CheckSquare,
//   Clock,
//   Filter,
//   Navigation,
//   MessageCircle,
//   Beef,
//   X,
//   Maximize2,
// } from 'lucide-react';

// const copyToClipboard = async (text: string) => {
//   try {
//     await navigator.clipboard.writeText(text);
//     return true;
//   } catch (err) {
//     return false;
//   }
// };

// export default function DistribusiDashboard() {
//   const [pesananList, setPesananList] = useState<any[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [search, setSearch] = useState('');

//   const [activeFilter, setActiveFilter] = useState<
//     'Semua' | 'Siap Antar' | 'Selesai'
//   >('Semua');

//   const [selectedKirim, setSelectedKirim] = useState<any>(null);
//   const [catatanKurir, setCatatanKurir] = useState('');
//   const [fotoBukti, setFotoBukti] = useState<File | null>(null);
//   const [previewUrl, setPreviewUrl] = useState<string | null>(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // Lightbox View Image
//   const [viewImage, setViewImage] = useState<string | null>(null);

//   const [copiedId, setCopiedId] = useState<string | null>(null);
//   const [isScrolled, setIsScrolled] = useState(false);
//   const searchInputMobileRef = useRef<HTMLInputElement>(null);
//   const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

//   const fetchSiapKirim = async () => {
//     setIsLoading(true);
//     const { data } = await supabase
//       .from('pesanan')
//       .select('*, hewan(jenis, tipe)')
//       .in('status_pesanan', ['Selesai', 'Terkirim'])
//       .order('status_pesanan', { ascending: false });

//     if (data) setPesananList(data);
//     setTimeout(() => setIsLoading(false), 400);
//   };

//   useEffect(() => {
//     fetchSiapKirim();
//     const handleScroll = () => setIsScrolled(window.scrollY > 10);
//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   useEffect(() => {
//     if (!fotoBukti) {
//       setPreviewUrl(null);
//       return;
//     }
//     const url = URL.createObjectURL(fotoBukti);
//     setPreviewUrl(url);
//     return () => URL.revokeObjectURL(url);
//   }, [fotoBukti]);

//   const handleCopyWa = async (
//     e: React.MouseEvent,
//     pesananId: string,
//     wa: string,
//   ) => {
//     e.preventDefault();
//     e.stopPropagation();
//     if (!wa) return;
//     const success = await copyToClipboard(wa);
//     if (success) {
//       setCopiedId(pesananId);
//       setTimeout(() => setCopiedId(null), 2000);
//     }
//   };

//   const handleOpenWa = (e: React.MouseEvent, nama: string, wa: string) => {
//     e.preventDefault();
//     e.stopPropagation();
//     if (!wa) return;
//     let cleanWa = wa.replace(/\D/g, '');
//     if (cleanWa.startsWith('0')) cleanWa = '62' + cleanWa.substring(1);
//     const msg = `Assalamu'alaikum Bpk/Ibu ${nama}, kami dari Panitia Kurban. Saat ini kurir kami sedang menuju lokasi untuk mengantarkan hak daging kurban Anda. Mohon kesediaannya menunggu. Terima kasih.`;
//     window.open(
//       `https://wa.me/${cleanWa}?text=${encodeURIComponent(msg)}`,
//       '_blank',
//     );
//   };

//   const handleOpenMaps = (e: React.MouseEvent, alamat: string) => {
//     e.preventDefault();
//     e.stopPropagation();
//     if (!alamat) return;
//     window.open(
//       `https://maps.google.com/?q=${encodeURIComponent(alamat)}`,
//       '_blank',
//     );
//   };

//   const filteredData = useMemo(() => {
//     return pesananList.filter((p) => {
//       const matchesSearch =
//         p.nama_mudhohi.toLowerCase().includes(search.toLowerCase()) ||
//         p.kode_trx.toLowerCase().includes(search.toLowerCase()) ||
//         (p.whatsapp && p.whatsapp.includes(search));

//       const matchesTab =
//         activeFilter === 'Semua'
//           ? true
//           : activeFilter === 'Siap Antar'
//             ? p.status_pesanan === 'Selesai'
//             : p.status_pesanan === 'Terkirim';

//       return matchesSearch && matchesTab;
//     });
//   }, [pesananList, search, activeFilter]);

//   const totalPaket = pesananList.length;
//   const totalTerkirim = pesananList.filter(
//     (p) => p.status_pesanan === 'Terkirim',
//   ).length;
//   const persenProgres =
//     totalPaket === 0 ? 0 : Math.round((totalTerkirim / totalPaket) * 100);

//   const handleSelesaikanPengiriman = async () => {
//     if (!fotoBukti) return alert('Wajib melampirkan foto serah terima!');
//     setIsSubmitting(true);

//     try {
//       const options = {
//         maxSizeMB: 1.5,
//         maxWidthOrHeight: 1920,
//         useWebWorker: true,
//       };
//       const compressedFile = await imageCompression(fotoBukti, options);

//       const formData = new FormData();
//       formData.append('file', compressedFile);
//       formData.append('provider', 'ALIBABA');
//       formData.append('folder', 'bukti-distribusi-assets');

//       const resUpload = await fetch('/api/upload', {
//         method: 'POST',
//         body: formData,
//       });
//       if (!resUpload.ok)
//         throw new Error(`Server menolak gambar (${resUpload.status})`);

//       const { url } = await resUpload.json();
//       if (!url) throw new Error('URL Gambar gagal didapatkan.');

//       const { data: psn } = await supabase
//         .from('pesanan')
//         .select('logs')
//         .eq('id', selectedKirim.id)
//         .single();
//       const currentLogs = psn?.logs || [];
//       const newLog = {
//         status: 'Hak Daging Diterima',
//         timestamp: new Date().toISOString(),
//         oleh: 'Panitia Distribusi',
//         catatan:
//           catatanKurir || 'Daging kurban diserahkan ke mudhohi/penerima.',
//       };

//       const { error } = await supabase
//         .from('pesanan')
//         .update({
//           status_pesanan: 'Terkirim',
//           logs: [...currentLogs, newLog],
//           bukti_kirim_url: url,
//           catatan_kurir: catatanKurir,
//         })
//         .eq('id', selectedKirim.id);

//       if (error) throw error;

//       setSelectedKirim(null);
//       setFotoBukti(null);
//       setCatatanKurir('');
//       fetchSiapKirim();
//     } catch (err: any) {
//       alert(`Gagal mengirim: ${err.message}`);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const containerStagger = {
//     hidden: { opacity: 0 },
//     visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
//   };

//   return (
//     <div className='min-h-screen bg-[#f8fafc] pb-36 pt-4 md:pt-8 px-4 md:px-10 font-sans relative'>
//       <div
//         className={`sticky top-0 z-[40] ${isScrolled ? 'bg-white/85 backdrop-blur-xl border-b border-slate-200/60 shadow-sm' : 'bg-transparent'} py-1 md:py-4 -mx-4 px-4 md:mx-0 md:px-6 flex justify-between items-center gap-3 lg:gap-6 transition-all duration-300`}>
//         <div
//           className={`flex items-start justify-start relative select-none transition-all duration-500 overflow-hidden ${isMobileSearchOpen ? 'max-w-0 opacity-0 -translate-x-10' : 'flex-1 lg:flex-none opacity-100 translate-x-0'}`}>
//           <div
//             className={`mt-2 md:mt-2.5 mr-2 md:mr-3 w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-teal-600 shrink-0`}
//           />
//           <div className={`z-10 text-slate-800`}>
//             <h1
//               className={`tracking-tight font-bold text-xl md:text-2xl leading-none`}>
//               Distribusi
//             </h1>
//             <div
//               className={`transition-all duration-300 overflow-hidden ${isScrolled ? 'max-h-0 opacity-0' : 'max-h-20 opacity-100 mt-1'}`}>
//               <p
//                 className={`text-[11px] md:text-xs font-medium text-slate-500`}>
//                 Manifes Pengantaran Daging
//               </p>
//             </div>
//           </div>
//         </div>

//         <div
//           className={`flex items-center gap-2 relative z-[70] transition-all duration-500 ${isMobileSearchOpen ? 'w-full' : 'w-auto'}`}>
//           <div className='hidden md:block w-[320px] relative'>
//             <Search className='w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400' />
//             <input
//               type='text'
//               placeholder='Cari nama atau no WA...'
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className='w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm font-medium shadow-sm transition-all'
//             />
//           </div>

//           <AnimatePresence>
//             {isMobileSearchOpen && (
//               <motion.div
//                 initial={{ width: 0, opacity: 0 }}
//                 animate={{ width: '100%', opacity: 1 }}
//                 exit={{ width: 0, opacity: 0 }}
//                 transition={{ duration: 0.3 }}
//                 className='md:hidden flex items-center gap-2 overflow-hidden w-full'>
//                 <div className='flex-1 relative w-full'>
//                   <Search className='w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400' />
//                   <input
//                     ref={searchInputMobileRef}
//                     autoFocus
//                     type='text'
//                     placeholder='Cari data...'
//                     value={search}
//                     onChange={(e) => setSearch(e.target.value)}
//                     className='w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-teal-500 text-sm font-medium shadow-sm'
//                   />
//                 </div>
//                 <button
//                   onClick={() => {
//                     setIsMobileSearchOpen(false);
//                     setSearch('');
//                   }}
//                   className='shrink-0 p-2 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-xl shadow-sm'>
//                   <X className='w-5 h-5' />
//                 </button>
//               </motion.div>
//             )}
//           </AnimatePresence>

//           {!isMobileSearchOpen && (
//             <button
//               onClick={() => setIsMobileSearchOpen(true)}
//               className='md:hidden flex items-center justify-center bg-white border border-slate-200 w-10 h-10 rounded-xl shadow-sm text-slate-500 hover:text-teal-600 shrink-0'>
//               <Search className='w-4 h-4' />
//             </button>
//           )}
//         </div>
//       </div>

//       <motion.div
//         initial='hidden'
//         animate='visible'
//         variants={containerStagger}
//         className='max-w-3xl mx-auto space-y-3 md:space-y-4 relative mt-4 md:mt-6'>
//         {isLoading ? (
//           <div className='flex justify-center py-20'>
//             <Loader2 className='w-8 h-8 animate-spin text-teal-600' />
//           </div>
//         ) : filteredData.length === 0 ? (
//           <div className='text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-sm'>
//             <PackageOpen className='w-10 h-10 text-slate-300 mx-auto mb-3' />
//             <h3 className='text-base font-bold text-slate-600'>
//               Manifes Kosong
//             </h3>
//             <p className='text-xs text-slate-400 mt-1'>
//               Data "{activeFilter}" tidak ditemukan.
//             </p>
//           </div>
//         ) : (
//           <div className='flex flex-col gap-3 md:gap-4'>
//             <AnimatePresence>
//               {filteredData.map((trx) => {
//                 const isTerkirim = trx.status_pesanan === 'Terkirim';
//                 const jenisHewan = trx.hewan?.jenis || 'Hewan';
//                 const tipeHewan = trx.hewan?.tipe || 'Kurban';
//                 const isSapi = jenisHewan.toLowerCase().includes('sapi');

//                 const themeClass = isSapi
//                   ? 'bg-blue-50/80 text-blue-600 border-blue-200'
//                   : 'bg-orange-50/80 text-orange-600 border-orange-200';

//                 return (
//                   <motion.div
//                     key={trx.id}
//                     layout
//                     initial={{ opacity: 0, scale: 0.98 }}
//                     animate={{ opacity: 1, scale: 1 }}
//                     exit={{ opacity: 0, scale: 0.98 }}
//                     transition={{ duration: 0.2 }}
//                     className={`group relative flex flex-row items-stretch bg-white p-2.5 md:p-3 rounded-2xl md:rounded-3xl border transition-all gap-3 md:gap-4 overflow-hidden ${
//                       isTerkirim
//                         ? 'border-emerald-100 bg-slate-50/40 shadow-sm'
//                         : 'border-slate-200 hover:border-teal-300 hover:shadow-md'
//                     }`}>
//                     <PackageOpen
//                       className={`absolute -right-3 -bottom-3 w-28 h-28 opacity-5 group-hover:opacity-15 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700 pointer-events-none z-0 ${isTerkirim ? 'text-emerald-500' : 'text-slate-500'}`}
//                     />

//                     <div
//                       onClick={() =>
//                         isTerkirim &&
//                         trx.bukti_kirim_url &&
//                         setViewImage(trx.bukti_kirim_url)
//                       }
//                       className={`w-[73px] h-[73px] sm:w-[110px] sm:h-[110px] shrink-0 rounded-xl md:rounded-2xl overflow-hidden relative flex flex-col items-center justify-center border z-10 ${
//                         isTerkirim
//                           ? 'border-emerald-100 bg-emerald-50/50 cursor-pointer'
//                           : 'border-slate-100 bg-slate-50'
//                       }`}>
//                       {isTerkirim && trx.bukti_kirim_url ? (
//                         <>
//                           <img
//                             src={trx.bukti_kirim_url}
//                             alt='Bukti'
//                             className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
//                           />
//                           <div className='absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
//                             <Maximize2 className='w-5 h-5 text-white drop-shadow-md' />
//                           </div>
//                         </>
//                       ) : (
//                         <div className='flex flex-col items-center justify-center opacity-30'>
//                           <Camera
//                             className={`w-6 h-6 mb-1 ${isTerkirim ? 'text-emerald-600' : 'text-slate-500'}`}
//                           />
//                           <span className='text-[8px] font-bold uppercase tracking-widest text-slate-500'>
//                             No Photo
//                           </span>
//                         </div>
//                       )}

//                       <div
//                         className={`absolute top-1.5 left-1.5 backdrop-blur-md px-1.5 py-0.5 rounded text-[8px] font-bold uppercase shadow-sm z-20 flex items-center ${isTerkirim ? 'bg-emerald-500/90 text-white' : 'bg-slate-500/90 text-white'}`}>
//                         {isTerkirim ? (
//                           <CheckCircle2 className='w-2 h-2 mr-0.5 shrink-0' />
//                         ) : (
//                           <Clock className='w-2 h-2 mr-0.5 shrink-0' />
//                         )}
//                         <span className='leading-none pt-[1px]'>
//                           {isTerkirim ? 'Tuntas' : 'Antre'}
//                         </span>
//                       </div>
//                     </div>

//                     <div className='flex-1 w-full relative z-10 flex flex-col min-w-0 py-0.5'>
//                       <div className='flex flex-wrap items-center gap-1.5 mb-1.5'>
//                         <span className='text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase'>
//                           {trx.kode_trx}
//                         </span>
//                         <span
//                           className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border flex items-center ${themeClass}`}>
//                           <Beef className='w-2.5 h-2.5 mr-1 opacity-70' />
//                           {jenisHewan} {tipeHewan}
//                         </span>
//                         <span
//                           className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border flex items-center ${themeClass}`}>
//                           <PackageOpen className='w-2.5 h-2.5 mr-1 opacity-70' />{' '}
//                           {trx.bagian_sepertiga || 'Sedekah Semua'}
//                         </span>
//                       </div>

//                       <h3
//                         className={`text-sm sm:text-base font-bold leading-tight truncate mb-1.5 pr-2 ${isTerkirim ? 'text-slate-600' : 'text-slate-800'}`}>
//                         {trx.nama_mudhohi}
//                       </h3>

//                       <div className='p-1.5 border-white/20 backdrop-blur-sm rounded-md flex flex-col mb-1 gap-1.5'>
//                         <div className='flex items-center gap-1.5 text-xs text-slate-500 w-full'>
//                           <span className='flex-1 truncate font-medium'>
//                             {trx.alamat || (
//                               <i className='text-slate-400'>Ambil di Masjid</i>
//                             )}
//                           </span>
//                           {trx.alamat && (
//                             <button
//                               onClick={(e) => handleOpenMaps(e, trx.alamat)}
//                               className='p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-md transition-colors shrink-0'
//                               title='Maps'>
//                               <Navigation className='w-3.5 h-3.5' />
//                             </button>
//                           )}
//                         </div>

//                         {trx.whatsapp && (
//                           <div className='flex items-center gap-1.5 text-xs text-slate-500 w-full'>
//                             <span className='flex-1 font-mono font-medium tracking-tight truncate'>
//                               {trx.whatsapp}
//                             </span>
//                             <div className='flex items-center gap-1 shrink-0'>
//                               <button
//                                 onClick={(e) =>
//                                   handleOpenWa(
//                                     e,
//                                     trx.nama_mudhohi,
//                                     trx.whatsapp,
//                                   )
//                                 }
//                                 className='p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-emerald-600 rounded-md transition-colors'
//                                 title='Chat WA'>
//                                 <MessageCircle className='w-3.5 h-3.5' />
//                               </button>
//                               <button
//                                 onClick={(e) =>
//                                   handleCopyWa(e, trx.id, trx.whatsapp)
//                                 }
//                                 className='p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-teal-600 rounded-md transition-colors'
//                                 title='Copy WA'>
//                                 {copiedId === trx.id ? (
//                                   <CheckCircle2 className='w-3.5 h-3.5 text-teal-500' />
//                                 ) : (
//                                   <Copy className='w-3.5 h-3.5' />
//                                 )}
//                               </button>
//                             </div>
//                           </div>
//                         )}
//                       </div>

//                       {!isTerkirim && (
//                         <button
//                           onClick={() => setSelectedKirim(trx)}
//                           className='mt-auto w-full bg-slate-800 hover:bg-slate-900 text-white text-[11px] sm:text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-[0.98]'>
//                           <Camera className='w-3.5 h-3.5 text-teal-400' />{' '}
//                           Eksekusi Pengiriman
//                         </button>
//                       )}
//                     </div>
//                   </motion.div>
//                 );
//               })}
//             </AnimatePresence>
//           </div>
//         )}
//       </motion.div>

//       <motion.div
//         className={`fixed bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 z-[70] w-max max-w-[96%] bg-slate-900/95 backdrop-blur-2xl border border-white/10 shadow-[0_15px_40px_rgba(0,0,0,0.5)] rounded-full p-2 flex items-center transition-all duration-500`}>
//         <div className='flex gap-1 overflow-x-auto hide-scrollbar rounded-full pr-3 sm:border-r border-slate-700/50'>
//           {(['Semua', 'Siap Antar', 'Selesai'] as const).map((tab) => {
//             const count =
//               tab === 'Semua'
//                 ? pesananList.length
//                 : tab === 'Siap Antar'
//                   ? pesananList.filter((p) => p.status_pesanan !== 'Terkirim')
//                       .length
//                   : pesananList.filter((p) => p.status_pesanan === 'Terkirim')
//                       .length;
//             return (
//               <button
//                 key={tab}
//                 onClick={() => setActiveFilter(tab)}
//                 className={`shrink-0 px-4 py-2 rounded-full text-[10px] sm:text-xs font-bold transition-all flex items-center gap-1.5 ${activeFilter === tab ? 'bg-teal-500 text-white shadow-md' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}>
//                 {tab === 'Semua' && <Filter className='w-3 h-3' />}
//                 {tab === 'Siap Antar' && <Clock className='w-3 h-3' />}
//                 {tab === 'Selesai' && <CheckSquare className='w-3 h-3' />}
//                 {tab}
//                 {count > 0 && (
//                   <sup className='ml-0.5 text-[8px] opacity-70'>{count}</sup>
//                 )}
//               </button>
//             );
//           })}
//         </div>

//         <div className='pl-3 pr-2 sm:flex flex-col justify-center items-end'>
//           <span className='text-[8px] text-slate-400 font-bold uppercase tracking-widest mb-1'>
//             Progres
//           </span>
//           <div className='flex items-center gap-2'>
//             <div className='w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden'>
//               <div
//                 className='bg-teal-400 h-full transition-all duration-1000'
//                 style={{ width: `${persenProgres}%` }}></div>
//             </div>
//             <span className='text-[10px] text-white font-medium leading-none'>
//               {totalTerkirim}/{totalPaket}
//             </span>
//           </div>
//         </div>
//       </motion.div>

//       <AnimatePresence>
//         {viewImage && (
//           <div className='fixed inset-0 z-[150] flex items-center justify-center p-4'>
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               className='absolute inset-0 bg-black/95 backdrop-blur-sm'
//               onClick={() => setViewImage(null)}
//             />
//             <motion.div
//               initial={{ opacity: 0, scale: 0.95 }}
//               animate={{ opacity: 1, scale: 1 }}
//               exit={{ opacity: 0, scale: 0.95 }}
//               className='relative z-10 w-full max-w-2xl flex flex-col items-center justify-center'>
//               <img
//                 src={viewImage}
//                 alt='Bukti Full'
//                 className='w-full max-h-[80vh] object-contain rounded-xl'
//               />
//               <button
//                 onClick={() => setViewImage(null)}
//                 className='absolute -top-14 right-0 bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full backdrop-blur-sm transition-all shadow-lg'>
//                 <X className='w-6 h-6' />
//               </button>
//             </motion.div>
//           </div>
//         )}
//       </AnimatePresence>

//       <AnimatePresence>
//         {selectedKirim && (
//           <div className='fixed inset-0 z-[100] flex items-end sm:items-center justify-center'>
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               className='absolute inset-0 bg-slate-900/50 backdrop-blur-sm'
//               onClick={() => {
//                 if (!isSubmitting) {
//                   setSelectedKirim(null);
//                   setFotoBukti(null);
//                   setCatatanKurir('');
//                 }
//               }}
//             />
//             <motion.div
//               initial={{ opacity: 0, y: 100 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: 100 }}
//               className='relative bg-white w-full sm:max-w-sm rounded-t-[2rem] sm:rounded-[2rem] p-6 pb-8 shadow-2xl'>
//               <div className='w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-5 sm:hidden'></div>

//               <div className='mb-5'>
//                 <h2 className='text-lg font-bold text-slate-800 flex items-center gap-2'>
//                   <Camera className='w-5 h-5 text-teal-600' /> Bukti Pengiriman
//                 </h2>
//                 <p className='text-xs text-slate-500 mt-1'>
//                   Penerima:{' '}
//                   <b className='text-slate-800'>{selectedKirim.nama_mudhohi}</b>
//                 </p>
//                 <p className='text-xs text-slate-500 mt-1'>
//                   Alamat:{' '}
//                   <b className='text-slate-800'>{selectedKirim.alamat}</b>
//                 </p>
//               </div>

//               <div className='space-y-4'>
//                 <div>
//                   <div
//                     className={`relative w-full h-44 rounded-2xl border-2 flex flex-col items-center justify-center overflow-hidden transition-all ${previewUrl ? 'border-teal-500 shadow-md' : 'border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100'}`}>
//                     <input
//                       type='file'
//                       accept='image/*,capture=camera'
//                       onChange={(e) =>
//                         setFotoBukti(e.target.files?.[0] || null)
//                       }
//                       className='absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20'
//                       disabled={isSubmitting}
//                     />
//                     {previewUrl ? (
//                       <>
//                         <img
//                           src={previewUrl}
//                           className='w-full h-full object-cover scale-105'
//                         />
//                         <div className='absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-10'>
//                           <Camera className='w-6 h-6 text-white mb-1' />
//                           <span className='text-white text-xs font-bold'>
//                             Ganti Foto
//                           </span>
//                         </div>
//                       </>
//                     ) : (
//                       <div className='text-center'>
//                         <div className='w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm border border-slate-200'>
//                           <Camera className='w-5 h-5 text-slate-500' />
//                         </div>
//                         <p className='text-[11px] font-bold text-slate-600'>
//                           Buka Kamera
//                         </p>
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 <div>
//                   <textarea
//                     rows={2}
//                     placeholder='Catatan pengiriman (Opsional)...'
//                     value={catatanKurir}
//                     onChange={(e) => setCatatanKurir(e.target.value)}
//                     disabled={isSubmitting}
//                     className='w-full border-2 border-slate-100 rounded-xl p-3 text-xs font-medium outline-none focus:border-slate-300 bg-slate-50 resize-none'
//                   />
//                 </div>

//                 <div className='flex gap-2 pt-1'>
//                   <button
//                     onClick={() => {
//                       setSelectedKirim(null);
//                       setFotoBukti(null);
//                       setCatatanKurir('');
//                     }}
//                     disabled={isSubmitting}
//                     className='w-1/3 py-3 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 text-xs'>
//                     Batal
//                   </button>
//                   <button
//                     onClick={handleSelesaikanPengiriman}
//                     disabled={isSubmitting || !fotoBukti}
//                     className='w-2/3 py-3 rounded-xl font-bold text-white bg-slate-800 hover:bg-slate-900 disabled:opacity-50 flex items-center justify-center gap-1.5 text-xs shadow-sm'>
//                     {isSubmitting ? (
//                       <>
//                         <Loader2 className='w-3.5 h-3.5 animate-spin' /> Loading
//                       </>
//                     ) : (
//                       <>
//                         <CheckCircle2 className='w-3.5 h-3.5 text-teal-400' />{' '}
//                         Konfirmasi
//                       </>
//                     )}
//                   </button>
//                 </div>
//               </div>
//             </motion.div>
//           </div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }
