// 'use client';

// import { useState, useEffect } from 'react';
// import { supabase } from '@/lib/supabase';
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
// } from 'lucide-react';

// // Fungsi Helper untuk menyalin teks (No WA)
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

//   // State untuk Fitur Tab Filter
//   const [activeFilter, setActiveFilter] = useState<
//     'Semua' | 'Siap Antar' | 'Selesai'
//   >('Semua');

//   const [selectedKirim, setSelectedKirim] = useState<any>(null);
//   const [catatanKurir, setCatatanKurir] = useState('');
//   const [fotoBukti, setFotoBukti] = useState<File | null>(null);
//   const [previewUrl, setPreviewUrl] = useState<string | null>(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const [copiedId, setCopiedId] = useState<string | null>(null);

//   const fetchSiapKirim = async () => {
//     setIsLoading(true);

//     const { data } = await supabase
//       .from('pesanan')
//       .select('*, hewan(jenis, tipe)')
//       .in('status_pesanan', ['Selesai', 'Terkirim'])
//       .order('status_pesanan', { ascending: false }); // 'Selesai' di atas, 'Terkirim' di bawah

//     if (data) setPesananList(data);
//     setIsLoading(false);
//   };

//   useEffect(() => {
//     fetchSiapKirim();
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

//   // Fungsi Copy No WA
//   const handleCopyWa = async (pesananId: string, wa: string) => {
//     if (!wa) return;
//     const success = await copyToClipboard(wa);
//     if (success) {
//       setCopiedId(pesananId);
//       setTimeout(() => setCopiedId(null), 2000);
//     }
//   };

//   // Logika Filter Ganda (Search Box + Tab Filter)
//   const filteredData = pesananList.filter((p) => {
//     const matchesSearch =
//       p.nama_mudhohi.toLowerCase().includes(search.toLowerCase()) ||
//       p.kode_trx.toLowerCase().includes(search.toLowerCase()) ||
//       (p.whatsapp && p.whatsapp.includes(search));

//     const matchesTab =
//       activeFilter === 'Semua'
//         ? true
//         : activeFilter === 'Siap Antar'
//           ? p.status_pesanan === 'Selesai'
//           : p.status_pesanan === 'Terkirim';

//     return matchesSearch && matchesTab;
//   });

//   // Kalkulasi Statistik Distribusi
//   const totalPaket = pesananList.length;
//   const totalTerkirim = pesananList.filter(
//     (p) => p.status_pesanan === 'Terkirim',
//   ).length;
//   const persenProgres =
//     totalPaket === 0 ? 0 : Math.round((totalTerkirim / totalPaket) * 100);

//   const handleSelesaikanPengiriman = async () => {
//     if (!fotoBukti) return alert('Wajib melampirkan foto serah terima daging!');
//     setIsSubmitting(true);

//     try {
//       const formData = new FormData();
//       formData.append('file', fotoBukti);
//       formData.append('provider', 'ALIBABA');
//       formData.append('folder', 'bukti-distribusi-assets');
//       const resUpload = await fetch('/api/upload', {
//         method: 'POST',
//         body: formData,
//       });
//       const { url } = await resUpload.json();
//       if (!url) throw new Error('Gagal upload foto');

//       const { data: psn } = await supabase
//         .from('pesanan')
//         .select('logs')
//         .eq('id', selectedKirim.id)
//         .single();
//       const currentLogs = psn?.logs || [];
//       const newLog = {
//         status: 'Hak Daging Diterima',
//         timestamp: new Date().toISOString(),
//         oleh: 'Panitia Bagian Distribusi',
//         catatan:
//           catatanKurir ||
//           'Daging kurban telah diserahkan kepada mudhohi/penerima.',
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
//       fetchSiapKirim(); // Refresh data untuk meng-update progress bar
//     } catch (err: any) {
//       alert(err.message);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className='min-h-screen bg-[#F8FAFC] pb-24 font-sans'>
//       {/* HEADER STICKY PREMIUM */}
//       <div className='sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm'>
//         <div className='bg-gradient-to-r from-teal-700 to-emerald-600 px-5 py-6 rounded-b-[32px] shadow-lg shadow-teal-900/10'>
//           <h1 className='text-2xl font-extrabold text-white tracking-tight mb-1'>
//             Distribusi Daging
//           </h1>

//           {/* Progress Bar Indikator */}
//           <div className='mt-4 bg-white/10 rounded-xl p-3 border border-white/20 backdrop-blur-sm'>
//             <div className='flex justify-between items-center mb-2'>
//               <span className='text-[11px] font-bold text-teal-100 uppercase tracking-wider'>
//                 Progres Hari Ini
//               </span>
//               <span className='text-xs font-bold text-white bg-white/20 px-2 py-0.5 rounded'>
//                 {totalTerkirim} / {totalPaket} Paket
//               </span>
//             </div>
//             <div className='w-full bg-black/20 rounded-full h-1.5 overflow-hidden'>
//               <div
//                 className='bg-emerald-400 h-1.5 rounded-full transition-all duration-1000 ease-out'
//                 style={{ width: `${persenProgres}%` }}></div>
//             </div>
//           </div>

//           <div className='relative mt-5'>
//             <Search className='absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400' />
//             <input
//               type='text'
//               placeholder='Cari nama / kode trx / no WA...'
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className='w-full bg-white text-slate-800 rounded-full py-3.5 pl-11 pr-4 text-sm font-semibold outline-none shadow-sm focus:ring-4 focus:ring-teal-400/30 transition-all placeholder:font-medium placeholder:text-slate-400'
//             />
//           </div>
//         </div>

//         {/* TAB FILTER (Siap Antar / Selesai) */}
//         <div className='flex gap-2 px-4 py-3 overflow-x-auto hide-scrollbar'>
//           {(['Semua', 'Siap Antar', 'Selesai'] as const).map((tab) => (
//             <button
//               key={tab}
//               onClick={() => setActiveFilter(tab)}
//               className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-1.5 ${
//                 activeFilter === tab
//                   ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20 ring-2 ring-teal-600/20'
//                   : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
//               }`}>
//               {tab === 'Semua' && <Filter className='w-3 h-3' />}
//               {tab === 'Siap Antar' && <Clock className='w-3 h-3' />}
//               {tab === 'Selesai' && <CheckSquare className='w-3 h-3' />}
//               {tab}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* DAFTAR TUGAS KIRIM (PREMIUM CARDS) */}
//       <div className='p-4 sm:p-6 space-y-4 max-w-3xl mx-auto'>
//         {isLoading ? (
//           <div className='flex flex-col items-center justify-center py-12 space-y-3'>
//             <Loader2 className='w-8 h-8 animate-spin text-teal-600' />
//             <p className='text-sm font-semibold text-slate-400'>
//               Memuat data distribusi...
//             </p>
//           </div>
//         ) : filteredData.length === 0 ? (
//           <div className='text-center py-16 bg-white rounded-[28px] border border-dashed border-slate-300'>
//             <PackageOpen className='w-12 h-12 text-slate-300 mx-auto mb-3' />
//             <h3 className='text-lg font-bold text-slate-700'>
//               Tidak ada paket
//             </h3>
//             <p className='text-slate-500 text-sm mt-1'>
//               Data untuk filter "{activeFilter}" tidak ditemukan.
//             </p>
//           </div>
//         ) : (
//           filteredData.map((trx) => {
//             const isTerkirim = trx.status_pesanan === 'Terkirim';
//             return (
//               <div
//                 key={trx.id}
//                 className={`relative bg-white p-5 rounded-[24px] transition-all duration-300 ${
//                   isTerkirim
//                     ? 'border border-emerald-100 shadow-sm opacity-80 bg-gradient-to-b from-emerald-50/30 to-transparent'
//                     : 'border border-slate-200/80 shadow-lg shadow-slate-200/40 hover:-translate-y-0.5'
//                 }`}>
//                 {/* Header Card */}
//                 <div className='flex justify-between items-start mb-4'>
//                   <div>
//                     <p className='text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-0.5'>
//                       {trx.kode_trx}
//                     </p>
//                     <h3 className='font-extrabold text-slate-800 text-lg leading-tight'>
//                       {trx.nama_mudhohi}
//                     </h3>
//                   </div>
//                   {isTerkirim ? (
//                     <span className='bg-emerald-100/80 text-emerald-700 px-2.5 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 border border-emerald-200'>
//                       <CheckCircle2 className='w-3.5 h-3.5' /> Tuntas
//                     </span>
//                   ) : (
//                     <span className='bg-orange-100/80 text-orange-700 px-2.5 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 border border-orange-200 animate-pulse'>
//                       <Clock className='w-3.5 h-3.5' /> Siap Antar
//                     </span>
//                   )}
//                 </div>

//                 {/* Info Container */}
//                 <div className='bg-[#F8FAFC] p-4 rounded-2xl space-y-3 mb-5 border border-slate-100'>
//                   {/* Alamat */}
//                   <div className='flex items-start gap-2.5 text-sm'>
//                     <div className='bg-red-100 text-red-600 p-1.5 rounded-lg shrink-0 mt-0.5'>
//                       <MapPin className='w-4 h-4' />
//                     </div>
//                     <p className='text-slate-600 font-medium leading-snug pt-1'>
//                       {trx.alamat || (
//                         <span className='italic text-slate-400'>
//                           Diambil di Masjid
//                         </span>
//                       )}
//                     </p>
//                   </div>

//                   {/* Request Bagian */}
//                   <div className='flex items-start gap-2.5 text-sm'>
//                     <div className='bg-blue-100 text-blue-600 p-1.5 rounded-lg shrink-0 mt-0.5'>
//                       <PackageOpen className='w-4 h-4' />
//                     </div>
//                     <p className='text-slate-600 font-medium leading-snug pt-1'>
//                       Request Hak 1/3: <br />
//                       <b className='text-slate-800'>
//                         {trx.bagian_sepertiga || 'Sedekah Semua'}
//                       </b>
//                     </p>
//                   </div>

//                   {/* Nomor WhatsApp Copy Feature */}
//                   {trx.whatsapp && (
//                     <div className='flex items-center justify-between gap-2.5 text-sm pt-2 border-t border-slate-200/60 mt-1'>
//                       <div className='flex items-center gap-2.5'>
//                         <div className='bg-emerald-100 text-emerald-600 p-1.5 rounded-lg shrink-0'>
//                           <Phone className='w-4 h-4' />
//                         </div>
//                         <p className='text-slate-700 font-bold font-mono tracking-wide'>
//                           {trx.whatsapp}
//                         </p>
//                       </div>
//                       <button
//                         onClick={() => handleCopyWa(trx.id, trx.whatsapp)}
//                         className='p-2 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold text-slate-500'>
//                         {copiedId === trx.id ? (
//                           <span className='text-teal-600 flex items-center gap-1'>
//                             <CheckCircle2 className='w-3.5 h-3.5' /> Disalin
//                           </span>
//                         ) : (
//                           <>
//                             <Copy className='w-3.5 h-3.5' /> Salin
//                           </>
//                         )}
//                       </button>
//                     </div>
//                   )}
//                 </div>

//                 {/* Action Button */}
//                 {!isTerkirim && (
//                   <button
//                     onClick={() => setSelectedKirim(trx)}
//                     className='w-full bg-teal-600 text-white py-3.5 rounded-2xl font-bold text-sm sm:text-[15px] hover:bg-teal-700 hover:shadow-lg hover:shadow-teal-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2'>
//                     <Camera className='w-4 h-4' /> Ambil Foto Serah Terima
//                   </button>
//                 )}
//               </div>
//             );
//           })
//         )}
//       </div>

//       {/* MODAL EKSEKUSI KURIR (PREMIUM BOTTOM SHEET) */}
//       {selectedKirim && (
//         <div className='fixed inset-0 z-50 flex items-end sm:items-center justify-center'>
//           {/* Backdrop (Klik luar untuk menutup) */}
//           <div
//             className='absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300'
//             onClick={() => {
//               if (!isSubmitting) {
//                 setSelectedKirim(null);
//                 setFotoBukti(null);
//               }
//             }}
//           />

//           <div className='relative bg-white w-full sm:max-w-md rounded-t-[32px] sm:rounded-[32px] p-6 sm:p-8 pb-8 animate-in slide-in-from-bottom-full duration-400 ease-out shadow-2xl'>
//             {/* Grabber untuk indikator swipe di mobile */}
//             <div className='w-14 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 sm:hidden'></div>

//             <div className='mb-6'>
//               <h2 className='text-2xl font-black text-slate-800 tracking-tight'>
//                 Verifikasi Daging
//               </h2>
//               <p className='text-[15px] text-slate-500 font-medium mt-1 leading-snug'>
//                 Penerima:{' '}
//                 <b className='text-teal-700'>{selectedKirim.nama_mudhohi}</b>
//               </p>
//             </div>

//             <div className='space-y-5'>
//               {/* Premium Upload Box */}
//               <div>
//                 <div className='flex justify-between items-end mb-2'>
//                   <label className='text-[11px] font-bold text-slate-500 uppercase tracking-widest'>
//                     Bukti Foto (Wajib)
//                   </label>
//                 </div>
//                 <div
//                   className={`relative w-full h-48 sm:h-56 rounded-2xl border-2 flex flex-col items-center justify-center overflow-hidden transition-all ${
//                     previewUrl
//                       ? 'border-teal-500 shadow-lg shadow-teal-500/20'
//                       : 'border-dashed border-slate-300 bg-gradient-to-b from-slate-50 to-slate-100 hover:border-teal-400 hover:bg-teal-50/50'
//                   }`}>
//                   <input
//                     type='file'
//                     accept='image/*,capture=camera'
//                     onChange={(e) => setFotoBukti(e.target.files?.[0] || null)}
//                     className='absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20'
//                     disabled={isSubmitting}
//                   />
//                   {previewUrl ? (
//                     <>
//                       <img
//                         src={previewUrl}
//                         className='w-full h-full object-cover scale-105'
//                       />
//                       <div className='absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-10'>
//                         <Camera className='w-8 h-8 text-white mb-1' />
//                         <span className='text-white text-xs font-bold'>
//                           Ketuk untuk mengganti
//                         </span>
//                       </div>
//                     </>
//                   ) : (
//                     <div className='text-center p-4'>
//                       <div className='w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-100'>
//                         <Camera className='w-7 h-7 text-teal-600' />
//                       </div>
//                       <p className='text-sm font-bold text-slate-700'>
//                         Buka Kamera / Galeri
//                       </p>
//                       <p className='text-xs text-slate-400 mt-1 font-medium'>
//                         Pastikan foto terlihat jelas dan tidak blur.
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Input Catatan Estetik */}
//               <div>
//                 <label className='text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 block'>
//                   Catatan Pengiriman (Opsional)
//                 </label>
//                 <textarea
//                   rows={2}
//                   placeholder='Cth: Diterima oleh istrinya di teras rumah...'
//                   value={catatanKurir}
//                   onChange={(e) => setCatatanKurir(e.target.value)}
//                   disabled={isSubmitting}
//                   className='w-full border-2 border-slate-200 rounded-2xl p-4 text-[15px] font-medium outline-none focus:border-teal-500 focus:bg-white bg-slate-50 transition-all resize-none placeholder:text-slate-400'
//                 />
//               </div>

//               <div className='flex gap-3 pt-3'>
//                 <button
//                   onClick={() => {
//                     setSelectedKirim(null);
//                     setFotoBukti(null);
//                     setCatatanKurir('');
//                   }}
//                   disabled={isSubmitting}
//                   className='w-1/3 py-4 rounded-2xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all disabled:opacity-50'>
//                   Batal
//                 </button>
//                 <button
//                   onClick={handleSelesaikanPengiriman}
//                   disabled={isSubmitting || !fotoBukti}
//                   className='w-2/3 py-4 rounded-2xl font-bold text-white bg-teal-600 hover:bg-teal-700 hover:shadow-lg hover:shadow-teal-600/30 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2'>
//                   {isSubmitting ? (
//                     <>
//                       <Loader2 className='w-5 h-5 animate-spin' /> Mengunggah...
//                     </>
//                   ) : (
//                     <>
//                       <CheckCircle2 className='w-5 h-5' /> Konfirmasi Tuntas
//                     </>
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
//
//
//
'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import imageCompression from 'browser-image-compression';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Loader2,
  MapPin,
  PackageOpen,
  Camera,
  CheckCircle2,
  Phone,
  Copy,
  CheckSquare,
  Clock,
  Filter,
  Navigation,
  MessageCircle,
  Beef,
  X,
  Maximize2,
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

  const [selectedKirim, setSelectedKirim] = useState<any>(null);
  const [catatanKurir, setCatatanKurir] = useState('');
  const [fotoBukti, setFotoBukti] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lightbox View Image
  const [viewImage, setViewImage] = useState<string | null>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const searchInputMobileRef = useRef<HTMLInputElement>(null);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const fetchSiapKirim = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('pesanan')
      .select('*, hewan(jenis, tipe)')
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

  useEffect(() => {
    if (!fotoBukti) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(fotoBukti);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [fotoBukti]);

  const handleCopyWa = async (
    e: React.MouseEvent,
    pesananId: string,
    wa: string,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (!wa) return;
    const success = await copyToClipboard(wa);
    if (success) {
      setCopiedId(pesananId);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleOpenWa = (e: React.MouseEvent, nama: string, wa: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!wa) return;
    let cleanWa = wa.replace(/\D/g, '');
    if (cleanWa.startsWith('0')) cleanWa = '62' + cleanWa.substring(1);
    const msg = `Assalamu'alaikum Bpk/Ibu ${nama}, kami dari Panitia Kurban. Saat ini kurir kami sedang menuju lokasi untuk mengantarkan hak daging kurban Anda. Mohon kesediaannya menunggu. Terima kasih.`;
    window.open(
      `https://wa.me/${cleanWa}?text=${encodeURIComponent(msg)}`,
      '_blank',
    );
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
  }, [pesananList, search, activeFilter]);

  const totalPaket = pesananList.length;
  const totalTerkirim = pesananList.filter(
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

  const containerStagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  return (
    <div className='min-h-screen bg-[#f8fafc] pb-36 pt-4 md:pt-8 px-4 md:px-10 font-sans relative'>
      {/* ==================================================== */}
      {/* HEADER STICKY TRANSPRAN KACA */}
      {/* ==================================================== */}
      <div
        className={`sticky top-0 z-[40] ${isScrolled ? 'bg-white/85 backdrop-blur-xl border-b border-slate-200/60 shadow-sm' : 'bg-transparent'} py-1 md:py-4 -mx-4 px-4 md:mx-0 md:px-6 flex justify-between items-center gap-3 lg:gap-6 transition-all duration-300`}>
        <div
          className={`flex items-start justify-start relative select-none transition-all duration-500 overflow-hidden ${isMobileSearchOpen ? 'max-w-0 opacity-0 -translate-x-10' : 'flex-1 lg:flex-none opacity-100 translate-x-0'}`}>
          <div
            className={`mt-2 md:mt-2.5 mr-2 md:mr-3 w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-teal-600 shrink-0`}
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

        {/* Search Area */}
        <div
          className={`flex items-center gap-2 relative z-[70] transition-all duration-500 ${isMobileSearchOpen ? 'w-full' : 'w-auto'}`}>
          <div className='hidden md:block w-[320px] relative'>
            <Search className='w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400' />
            <input
              type='text'
              placeholder='Cari nama atau no WA...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm font-medium shadow-sm transition-all'
            />
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
                    placeholder='Cari data...'
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className='w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-teal-500 text-sm font-medium shadow-sm'
                  />
                </div>
                <button
                  onClick={() => {
                    setIsMobileSearchOpen(false);
                    setSearch('');
                  }}
                  className='shrink-0 p-2 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-xl shadow-sm'>
                  <X className='w-5 h-5' />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {!isMobileSearchOpen && (
            <button
              onClick={() => setIsMobileSearchOpen(true)}
              className='md:hidden flex items-center justify-center bg-white border border-slate-200 w-10 h-10 rounded-xl shadow-sm text-slate-500 hover:text-teal-600 shrink-0'>
              <Search className='w-4 h-4' />
            </button>
          )}
        </div>
      </div>

      <motion.div
        initial='hidden'
        animate='visible'
        variants={containerStagger}
        className='max-w-3xl mx-auto space-y-3 md:space-y-4 relative mt-4 md:mt-6'>
        {isLoading ? (
          <div className='flex justify-center py-20'>
            <Loader2 className='w-8 h-8 animate-spin text-teal-600' />
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
          <div className='flex flex-col gap-3 md:gap-4'>
            <AnimatePresence>
              {filteredData.map((trx) => {
                const isTerkirim = trx.status_pesanan === 'Terkirim';
                const jenisHewan = trx.hewan?.jenis || 'Hewan';
                const tipeHewan = trx.hewan?.tipe || 'Kurban';
                const isSapi = jenisHewan.toLowerCase().includes('sapi');

                // Tema Warna Berdasarkan Hewan
                const themeClass = isSapi
                  ? 'bg-blue-50/80 text-blue-600 border-blue-200'
                  : 'bg-orange-50/80 text-orange-600 border-orange-200';

                return (
                  <motion.div
                    key={trx.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className={`group relative flex flex-row items-stretch bg-white p-2.5 md:p-3 rounded-2xl md:rounded-3xl border transition-all gap-3 md:gap-4 overflow-hidden ${
                      isTerkirim
                        ? 'border-emerald-100 bg-slate-50/40 shadow-sm'
                        : 'border-slate-200 hover:border-teal-300 hover:shadow-md'
                    }`}>
                    {/* Background Icon (Hover Effect: opacity 5% -> 15%) */}
                    <PackageOpen
                      className={`absolute -right-3 -bottom-3 w-28 h-28 opacity-5 group-hover:opacity-15 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700 pointer-events-none z-0 ${isTerkirim ? 'text-emerald-500' : 'text-slate-500'}`}
                    />

                    {/* KOTAK GAMBAR KIRI (Fixed Size) */}
                    <div
                      onClick={() =>
                        isTerkirim &&
                        trx.bukti_kirim_url &&
                        setViewImage(trx.bukti_kirim_url)
                      }
                      className={`w-[73px] h-[73px] sm:w-[110px] sm:h-[110px] shrink-0 rounded-xl md:rounded-2xl overflow-hidden relative flex flex-col items-center justify-center border z-10 ${
                        isTerkirim
                          ? 'border-emerald-100 bg-emerald-50/50 cursor-pointer'
                          : 'border-slate-100 bg-slate-50'
                      }`}>
                      {isTerkirim && trx.bukti_kirim_url ? (
                        <>
                          <img
                            src={trx.bukti_kirim_url}
                            alt='Bukti'
                            className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
                          />
                          <div className='absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
                            <Maximize2 className='w-5 h-5 text-white drop-shadow-md' />
                          </div>
                        </>
                      ) : (
                        <div className='flex flex-col items-center justify-center opacity-30'>
                          <Camera
                            className={`w-6 h-6 mb-1 ${isTerkirim ? 'text-emerald-600' : 'text-slate-500'}`}
                          />
                          <span className='text-[8px] font-bold uppercase tracking-widest text-slate-500'>
                            No Photo
                          </span>
                        </div>
                      )}

                      {/* Status Badge Mengambang di Gambar */}
                      <div
                        className={`absolute top-1.5 left-1.5 backdrop-blur-md px-1.5 py-0.5 rounded text-[8px] font-bold uppercase shadow-sm z-20 flex items-center ${isTerkirim ? 'bg-emerald-500/90 text-white' : 'bg-slate-500/90 text-white'}`}>
                        {isTerkirim ? (
                          <CheckCircle2 className='w-2 h-2 mr-0.5 shrink-0' />
                        ) : (
                          <Clock className='w-2 h-2 mr-0.5 shrink-0' />
                        )}
                        <span className='leading-none pt-[1px]'>
                          {isTerkirim ? 'Tuntas' : 'Antre'}
                        </span>
                      </div>
                    </div>

                    {/* KANAN: TEKS & TOMBOL (Super Compact Layout) */}
                    <div className='flex-1 w-full relative z-10 flex flex-col min-w-0 py-0.5'>
                      {/* Baris 1: Kode, Jenis, dan Bagian Request Sejajar */}
                      <div className='flex flex-wrap items-center gap-1.5 mb-1.5'>
                        <span className='text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase'>
                          {trx.kode_trx}
                        </span>
                        <span
                          className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border flex items-center ${themeClass}`}>
                          <Beef className='w-2.5 h-2.5 mr-1 opacity-70' />
                          {jenisHewan} {tipeHewan}
                        </span>
                        <span
                          className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border flex items-center ${themeClass}`}>
                          <PackageOpen className='w-2.5 h-2.5 mr-1 opacity-70' />{' '}
                          {trx.bagian_sepertiga || 'Sedekah Semua'}
                        </span>
                      </div>

                      {/* Baris 2: Nama Mudhohi */}
                      <h3
                        className={`text-sm sm:text-base font-bold leading-tight truncate mb-1.5 pr-2 ${isTerkirim ? 'text-slate-600' : 'text-slate-800'}`}>
                        {trx.nama_mudhohi}
                      </h3>

                      {/* Baris 3: Alamat & WA (Dengan Inline Buttons Ikon) */}
                      <div className='p-1.5 border-white/20 backdrop-blur-sm rounded-md flex flex-col mb-1 gap-1.5'>
                        {/* Lokasi Row */}
                        <div className='flex items-center gap-1.5 text-xs text-slate-500 w-full'>
                          <span className='flex-1 truncate font-medium'>
                            {trx.alamat || (
                              <i className='text-slate-400'>Ambil di Masjid</i>
                            )}
                          </span>
                          {trx.alamat && (
                            <button
                              onClick={(e) => handleOpenMaps(e, trx.alamat)}
                              className='p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-md transition-colors shrink-0'
                              title='Maps'>
                              <Navigation className='w-3.5 h-3.5' />
                            </button>
                          )}
                        </div>

                        {/* WA Row */}
                        {trx.whatsapp && (
                          <div className='flex items-center gap-1.5 text-xs text-slate-500 w-full'>
                            <span className='flex-1 font-mono font-medium tracking-tight truncate'>
                              {trx.whatsapp}
                            </span>
                            <div className='flex items-center gap-1 shrink-0'>
                              <button
                                onClick={(e) =>
                                  handleOpenWa(
                                    e,
                                    trx.nama_mudhohi,
                                    trx.whatsapp,
                                  )
                                }
                                className='p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-emerald-600 rounded-md transition-colors'
                                title='Chat WA'>
                                <MessageCircle className='w-3.5 h-3.5' />
                              </button>
                              <button
                                onClick={(e) =>
                                  handleCopyWa(e, trx.id, trx.whatsapp)
                                }
                                className='p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-teal-600 rounded-md transition-colors'
                                title='Copy WA'>
                                {copiedId === trx.id ? (
                                  <CheckCircle2 className='w-3.5 h-3.5 text-teal-500' />
                                ) : (
                                  <Copy className='w-3.5 h-3.5' />
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Baris 4: Tombol Eksekusi Full Width Kanan */}
                      {!isTerkirim && (
                        <button
                          onClick={() => setSelectedKirim(trx)}
                          className='mt-auto w-full bg-slate-800 hover:bg-slate-900 text-white text-[11px] sm:text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-[0.98]'>
                          <Camera className='w-3.5 h-3.5 text-teal-400' />{' '}
                          Eksekusi Pengiriman
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* ==================================================== */}
      {/* FLOATING PILL (Filter + Progress Bar Menyatu) */}
      {/* ==================================================== */}
      <motion.div
        className={`fixed bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 z-[70] w-max max-w-[96%] bg-slate-900/95 backdrop-blur-2xl border border-white/10 shadow-[0_15px_40px_rgba(0,0,0,0.5)] rounded-full p-2 flex items-center transition-all duration-500`}>
        <div className='flex gap-1 overflow-x-auto hide-scrollbar rounded-full pr-3 sm:border-r border-slate-700/50'>
          {(['Semua', 'Siap Antar', 'Selesai'] as const).map((tab) => {
            const count =
              tab === 'Semua'
                ? pesananList.length
                : tab === 'Siap Antar'
                  ? pesananList.filter((p) => p.status_pesanan !== 'Terkirim')
                      .length
                  : pesananList.filter((p) => p.status_pesanan === 'Terkirim')
                      .length;
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

        {/* Kanan: Progress Bar Mini */}
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

      {/* ==================================================== */}
      {/* MODAL LIGHTBOX IMAGE VIEW */}
      {/* ==================================================== */}
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

      {/* MODAL EKSEKUSI KURIR */}
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
                    className='w-1/3 py-3 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 text-xs'>
                    Batal
                  </button>
                  <button
                    onClick={handleSelesaikanPengiriman}
                    disabled={isSubmitting || !fotoBukti}
                    className='w-2/3 py-3 rounded-xl font-bold text-white bg-slate-800 hover:bg-slate-900 disabled:opacity-50 flex items-center justify-center gap-1.5 text-xs shadow-sm'>
                    {isSubmitting ? (
                      <>
                        <Loader2 className='w-3.5 h-3.5 animate-spin' /> Loading
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className='w-3.5 h-3.5 text-teal-400' />{' '}
                        Konfirmasi
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
