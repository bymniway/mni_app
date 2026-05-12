// 'use client';

// import { useState, useEffect, useMemo } from 'react';
// import {
//   Calendar as CalendarIcon,
//   X,
//   Clock,
//   ChevronLeft,
//   ChevronRight,
// } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';

// export default function CountdownHariBesar() {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [timeLeft, setTimeLeft] = useState({
//     hari: 0,
//     jam: 0,
//     menit: 0,
//     detik: 0,
//   });

//   const [viewDate, setViewDate] = useState(new Date());
//   const [selectedDate, setSelectedDate] = useState(new Date());

//   // Kunci layar belakang saat modal terbuka
//   useEffect(() => {
//     if (isModalOpen) {
//       document.body.style.overflow = 'hidden';
//     } else {
//       document.body.style.overflow = 'unset';
//     }
//     return () => {
//       document.body.style.overflow = 'unset';
//     };
//   }, [isModalOpen]);

//   const hariBesarIslam = useMemo(
//     () => [
//       {
//         hMonth: 1,
//         hDay: 1,
//         nama: 'Tahun Baru Islam',
//         deskripsi:
//           '1 Muharram, mari berhijrah menjadi pribadi yang lebih baik.',
//       },
//       {
//         hMonth: 1,
//         hDay: 9,
//         nama: "Puasa Tasu'a",
//         deskripsi: '9 Muharram, puasa sunnah mengiringi puasa Asyura.',
//       },
//       {
//         hMonth: 1,
//         hDay: 10,
//         nama: 'Puasa Asyura',
//         deskripsi: '10 Muharram, puasa sunnah menghapus dosa setahun lalu.',
//       },
//       {
//         hMonth: 3,
//         hDay: 12,
//         nama: 'Maulid Nabi Muhammad SAW',
//         deskripsi: '12 Rabiul Awal, mari perbanyak shalawat atas Rasulullah.',
//       },
//       {
//         hMonth: 7,
//         hDay: 27,
//         nama: "Isra Mi'raj",
//         deskripsi:
//           '27 Rajab, peringatan perjalanan suci dan turunnya perintah shalat.',
//       },
//       {
//         hMonth: 8,
//         hDay: 15,
//         nama: "Nisfu Sya'ban",
//         deskripsi: "15 Sya'ban, malam pertengahan bulan yang penuh ampunan.",
//       },
//       {
//         hMonth: 9,
//         hDay: 1,
//         nama: 'Awal Ramadhan',
//         deskripsi: '1 Ramadhan, Bulan Suci penuh ampunan telah tiba!',
//       },
//       {
//         hMonth: 9,
//         hDay: 17,
//         nama: "Nuzulul Qur'an",
//         deskripsi: "17 Ramadhan, peringatan turunnya wahyu pertama Al-Qur'an.",
//       },
//       {
//         hMonth: 10,
//         hDay: 1,
//         nama: 'Idul Fitri',
//         deskripsi: '1 Syawal, Hari Kemenangan! Mari saling memaafkan.',
//       },
//       {
//         hMonth: 12,
//         hDay: 9,
//         nama: 'Puasa Arafah',
//         deskripsi:
//           '9 Dzulhijjah, puasa sunnah menghapus dosa setahun lalu & yang akan datang.',
//       },
//       {
//         hMonth: 12,
//         hDay: 10,
//         nama: 'Idul Adha',
//         deskripsi:
//           '10 Dzulhijjah, waktunya berkurban. Siapkan hewan terbaik Anda.',
//       },
//       {
//         hMonth: 12,
//         hDay: 11,
//         nama: 'Hari Tasyrik Pertama',
//         deskripsi: '11 Dzulhijjah, diharamkan berpuasa. Perbanyak takbir.',
//       },
//       {
//         hMonth: 12,
//         hDay: 12,
//         nama: 'Hari Tasyrik Kedua',
//         deskripsi: '12 Dzulhijjah, diharamkan berpuasa. Perbanyak takbir.',
//       },
//       {
//         hMonth: 12,
//         hDay: 13,
//         nama: 'Hari Tasyrik Ketiga',
//         deskripsi: '13 Dzulhijjah, diharamkan berpuasa. Perbanyak takbir.',
//       },
//     ],
//     [],
//   );

//   const liburNasional = useMemo(
//     () => [
//       {
//         gMonth: 1,
//         gDay: 1,
//         nama: 'Tahun Baru Masehi',
//         deskripsi: 'Libur Nasional',
//       },
//       {
//         gMonth: 5,
//         gDay: 1,
//         nama: 'Hari Buruh Internasional',
//         deskripsi: 'Libur Nasional',
//       },
//       {
//         gMonth: 6,
//         gDay: 1,
//         nama: 'Hari Lahir Pancasila',
//         deskripsi: 'Peringatan lahirnya dasar negara',
//       },
//       {
//         gMonth: 8,
//         gDay: 17,
//         nama: 'Hari Kemerdekaan RI',
//         deskripsi: 'Dirgahayu Republik Indonesia!',
//       },
//       {
//         gMonth: 12,
//         gDay: 25,
//         nama: 'Hari Raya Natal',
//         deskripsi: 'Libur Nasional',
//       },
//     ],
//     [],
//   );

//   const toArabic = (num: number) =>
//     num.toString().replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d as any]);
//   const hijriFormatterParts = useMemo(
//     () =>
//       new Intl.DateTimeFormat('en-US-u-ca-islamic', {
//         month: 'numeric',
//         day: 'numeric',
//       }),
//     [],
//   );

//   const nextIslamicEvent = useMemo(() => {
//     let checkDate = new Date();
//     checkDate.setHours(0, 0, 0, 0);

//     for (let i = 0; i < 365; i++) {
//       const parts = hijriFormatterParts.formatToParts(checkDate);
//       const hMonth = parseInt(
//         parts.find((p) => p.type === 'month')?.value || '0',
//       );
//       const hDay = parseInt(parts.find((p) => p.type === 'day')?.value || '0');

//       const event = hariBesarIslam.find(
//         (h) => h.hMonth === hMonth && h.hDay === hDay,
//       );
//       if (event) {
//         return { ...event, dateObj: new Date(checkDate) };
//       }
//       checkDate.setDate(checkDate.getDate() + 1);
//     }
//     return null;
//   }, [hariBesarIslam, hijriFormatterParts]);

//   useEffect(() => {
//     if (!nextIslamicEvent) return;
//     const target = nextIslamicEvent.dateObj.getTime();

//     const interval = setInterval(() => {
//       const sekarang = new Date().getTime();
//       const selisih = target - sekarang;

//       if (selisih > 0) {
//         setTimeLeft({
//           hari: Math.floor(selisih / (1000 * 60 * 60 * 24)),
//           jam: Math.floor((selisih % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
//           menit: Math.floor((selisih % (1000 * 60 * 60)) / (1000 * 60)),
//           detik: Math.floor((selisih % (1000 * 60)) / 1000),
//         });
//       }
//     }, 1000);
//     return () => clearInterval(interval);
//   }, [nextIslamicEvent]);

//   const year = viewDate.getFullYear();
//   const month = viewDate.getMonth();

//   const getDaysInMonth = (y: number, m: number) =>
//     new Date(y, m + 1, 0).getDate();
//   const getFirstDayOfMonth = (y: number, m: number) =>
//     new Date(y, m, 1).getDay();

//   const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
//   const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

//   const daysInMonth = getDaysInMonth(year, month);
//   const firstDay = getFirstDayOfMonth(year, month);

//   const calendarCells = [];
//   for (let i = 0; i < firstDay; i++) {
//     calendarCells.push(
//       <div
//         key={`empty-${i}`}
//         className='p-2 md:p-3 opacity-0 pointer-events-none'></div>,
//     );
//   }

//   for (let d = 1; d <= daysInMonth; d++) {
//     const dateObj = new Date(year, month, d);
//     const isToday = new Date().toDateString() === dateObj.toDateString();
//     const isSelected = selectedDate.toDateString() === dateObj.toDateString();

//     const parts = hijriFormatterParts.formatToParts(dateObj);
//     const hMonth = parseInt(
//       parts.find((p) => p.type === 'month')?.value || '0',
//     );
//     const hDay = parseInt(parts.find((p) => p.type === 'day')?.value || '0');

//     const isIslamic = hariBesarIslam.some(
//       (h) => h.hMonth === hMonth && h.hDay === hDay,
//     );
//     const isNational = liburNasional.some(
//       (n) => n.gMonth === month + 1 && n.gDay === d,
//     );

//     calendarCells.push(
//       <div
//         key={d}
//         onClick={() => setSelectedDate(dateObj)}
//         className={`relative p-2 md:p-3 border rounded-xl flex flex-col items-center justify-center min-h-[60px] md:min-h-[70px] transition-all cursor-pointer group
//         ${isSelected ? 'ring-2 ring-mni-primary bg-mni-primary/10 border-transparent shadow-md transform scale-105 z-10' : 'border-gray-100 bg-white hover:border-mni-primary/30'}
//         ${isToday && !isSelected ? 'bg-blue-50/50' : ''}
//       `}>
//         <div className='absolute top-1.5 right-1.5 flex gap-1'>
//           {isNational && (
//             <span className='w-1.5 h-1.5 rounded-full bg-red-500 shadow-sm'></span>
//           )}
//           {isIslamic && (
//             <span className='w-1.5 h-1.5 rounded-full bg-mni-primary shadow-sm animate-pulse'></span>
//           )}
//         </div>
//         <span
//           className={`text-sm md:text-lg font-extrabold transition-colors ${isSelected ? 'text-mni-primary' : isIslamic ? 'text-mni-primary' : isNational ? 'text-red-600' : 'text-gray-700'}`}>
//           {d}
//         </span>
//         <span
//           className={`text-[10px] md:text-xs font-semibold mt-0.5 ${isSelected ? 'text-mni-primary' : 'text-gray-400'}`}>
//           {toArabic(hDay)}
//         </span>
//       </div>,
//     );
//   }

//   const masehiText = selectedDate.toLocaleDateString('id-ID', {
//     day: 'numeric',
//     month: 'long',
//     year: 'numeric',
//   });
//   const rawHijri = new Intl.DateTimeFormat('id-ID-u-ca-islamic', {
//     day: 'numeric',
//     month: 'long',
//     year: 'numeric',
//   }).format(selectedDate);
//   const hijriText = rawHijri.replace(/ AH| H/gi, '') + ' H';

//   const agendaHariIni = useMemo(() => {
//     const y = selectedDate.getFullYear();
//     const m = selectedDate.getMonth();
//     const d = selectedDate.getDate();

//     const national = liburNasional.filter(
//       (n) => n.gMonth === m + 1 && n.gDay === d,
//     );

//     const parts = hijriFormatterParts.formatToParts(selectedDate);
//     const hMonth = parseInt(
//       parts.find((p) => p.type === 'month')?.value || '0',
//     );
//     const hDay = parseInt(parts.find((p) => p.type === 'day')?.value || '0');
//     const islamic = hariBesarIslam.filter(
//       (h) => h.hMonth === hMonth && h.hDay === hDay,
//     );

//     return [
//       ...islamic.map((i) => ({ ...i, tipe: 'islam', tglObj: selectedDate })),
//       ...national.map((n) => ({
//         ...n,
//         tipe: 'nasional',
//         tglObj: selectedDate,
//       })),
//     ];
//   }, [selectedDate, hariBesarIslam, liburNasional, hijriFormatterParts]);

//   const eventsThisMonth = useMemo(() => {
//     const evs: any[] = [];
//     const y = viewDate.getFullYear();
//     const m = viewDate.getMonth();
//     const maxDays = new Date(y, m + 1, 0).getDate();

//     for (let d = 1; d <= maxDays; d++) {
//       const dateObj = new Date(y, m, d);
//       const national = liburNasional.filter(
//         (n) => n.gMonth === m + 1 && n.gDay === d,
//       );

//       const parts = hijriFormatterParts.formatToParts(dateObj);
//       const hMonth = parseInt(
//         parts.find((p) => p.type === 'month')?.value || '0',
//       );
//       const hDay = parseInt(parts.find((p) => p.type === 'day')?.value || '0');
//       const islamic = hariBesarIslam.filter(
//         (h) => h.hMonth === hMonth && h.hDay === hDay,
//       );

//       evs.push(
//         ...islamic.map((i) => ({ ...i, tipe: 'islam', tglObj: dateObj })),
//         ...national.map((n) => ({ ...n, tipe: 'nasional', tglObj: dateObj })),
//       );
//     }
//     return evs;
//   }, [viewDate, hariBesarIslam, liburNasional, hijriFormatterParts]);

//   const isSelectedDateHasEvent = agendaHariIni.length > 0;
//   const displayedAgenda = isSelectedDateHasEvent
//     ? agendaHariIni
//     : eventsThisMonth;
//   const agendaTitleText = isSelectedDateHasEvent
//     ? 'Detail Tanggal Terpilih'
//     : 'Agenda Bulan Ini';

//   const arrayMonths = [
//     'Januari',
//     'Februari',
//     'Maret',
//     'April',
//     'Mei',
//     'Juni',
//     'Juli',
//     'Agustus',
//     'September',
//     'Oktober',
//     'November',
//     'Desember',
//   ];
//   const currentYear = new Date().getFullYear();
//   const arrayYears = Array.from(
//     { length: 100 },
//     (_, i) => currentYear - 50 + i,
//   );

//   return (
//     <>
//       <motion.div
//         whileHover={{ y: -5 }}
//         className='bg-gradient-to-br from-mni-primary to-green-800 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between mt-12 mx-4 md:mx-10 group cursor-pointer'
//         onClick={() => setIsModalOpen(true)}>
//         <div className='absolute -right-10 -top-10 opacity-10 group-hover:scale-125 transition-transform duration-700 pointer-events-none'>
//           <CalendarIcon className='w-64 h-64' />
//         </div>

//         <div className='relative z-10 text-center md:text-left mb-6 md:mb-0'>
//           <div className='inline-flex items-center bg-white/20 px-3 py-1 rounded-full text-xs font-bold mb-3 border border-white/30 backdrop-blur-sm'>
//             <Clock className='w-3.5 h-3.5 mr-1.5' /> Menuju Hari Besar
//           </div>
//           <h3 className='text-2xl md:text-3xl font-bold mb-1'>
//             {nextIslamicEvent?.nama || 'Memuat...'}
//           </h3>
//           <p className='text-green-100 text-sm mb-2'>
//             {nextIslamicEvent
//               ? nextIslamicEvent.dateObj.toLocaleDateString('id-ID', {
//                   weekday: 'long',
//                   day: 'numeric',
//                   month: 'long',
//                   year: 'numeric',
//                 })
//               : '-'}
//           </p>
//           {nextIslamicEvent && (
//             <p className='text-xs bg-black/20 inline-block px-3 py-1.5 rounded-lg border border-white/10'>
//               {nextIslamicEvent.deskripsi}
//             </p>
//           )}
//         </div>

//         <div className='relative z-10 flex gap-3 md:gap-4'>
//           {[
//             { label: 'Hari', val: timeLeft.hari },
//             { label: 'Jam', val: timeLeft.jam },
//             { label: 'Menit', val: timeLeft.menit },
//             { label: 'Detik', val: timeLeft.detik },
//           ].map((item, idx) => (
//             <div
//               key={idx}
//               className='flex flex-col items-center'>
//               <div className='bg-white text-mni-primary w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-xl md:text-2xl font-black shadow-inner'>
//                 {item.val.toString().padStart(2, '0')}
//               </div>
//               <span className='text-[10px] md:text-xs font-semibold mt-2 uppercase tracking-widest text-green-100'>
//                 {item.label}
//               </span>
//             </div>
//           ))}
//         </div>
//       </motion.div>

//       <AnimatePresence>
//         {isModalOpen && (
//           <>
//             {/* PERBAIKAN BACKDROP: Menggunakan 100dvh dan w-screen agar menutupi seluruh layar HP */}
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               onClick={() => setIsModalOpen(false)}
//               className='fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] h-[100dvh] w-screen'
//             />

//             <motion.div
//               initial={{ opacity: 0, scale: 0.9, y: 20 }}
//               animate={{ opacity: 1, scale: 1, y: 0 }}
//               exit={{ opacity: 0, scale: 0.9, y: 20 }}
//               className='fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-[500px] bg-white rounded-[2rem] shadow-2xl z-[101] overflow-hidden flex flex-col max-h-[90dvh]'>
//               <div className='bg-mni-primary p-6 md:p-8 text-white relative shrink-0 group overflow-hidden'>
//                 <button
//                   onClick={() => setIsModalOpen(false)}
//                   className='absolute top-5 right-5 p-2 bg-black/10 hover:bg-black/20 rounded-full transition-colors z-20'>
//                   <X className='w-5 h-5' />
//                 </button>

//                 <div className='absolute -right-10 -top-10 opacity-10 group-hover:scale-125 transition-transform duration-1000 pointer-events-none z-0'>
//                   <CalendarIcon className='w-64 h-64' />
//                 </div>

//                 <div className='relative z-10 flex flex-col items-center mb-2'>
//                   <div className='text-center mb-5 mt-2'>
//                     <h3 className='font-extrabold text-3xl tracking-tight leading-none mb-3'>
//                       {masehiText}
//                     </h3>
//                     <div className='inline-flex items-center justify-center bg-white/20 px-5 py-2 rounded-full border border-white/30 backdrop-blur-md shadow-inner'>
//                       <CalendarIcon className='w-4 h-4 mr-2 text-green-100' />
//                       <p className='text-sm text-white font-bold tracking-wide'>
//                         {hijriText}
//                       </p>
//                     </div>
//                   </div>

//                   <div className='flex items-center gap-2 bg-black/30 p-1.5 rounded-2xl backdrop-blur-sm border border-white/20'>
//                     <button
//                       onClick={prevMonth}
//                       className='p-2 hover:bg-white/20 rounded-xl transition'>
//                       <ChevronLeft className='w-5 h-5' />
//                     </button>

//                     <select
//                       value={month}
//                       onChange={(e) =>
//                         setViewDate(new Date(year, parseInt(e.target.value), 1))
//                       }
//                       className='bg-transparent font-bold text-sm cursor-pointer outline-none appearance-none px-2 text-center text-white [&>option]:text-gray-900'>
//                       {arrayMonths.map((m, i) => (
//                         <option
//                           key={i}
//                           value={i}>
//                           {m}
//                         </option>
//                       ))}
//                     </select>

//                     <select
//                       value={year}
//                       onChange={(e) =>
//                         setViewDate(
//                           new Date(parseInt(e.target.value), month, 1),
//                         )
//                       }
//                       className='bg-transparent font-bold text-sm cursor-pointer outline-none appearance-none px-2 text-center text-white [&>option]:text-gray-900'>
//                       {arrayYears.map((y) => (
//                         <option
//                           key={y}
//                           value={y}>
//                           {y}
//                         </option>
//                       ))}
//                     </select>

//                     <button
//                       onClick={nextMonth}
//                       className='p-2 hover:bg-white/20 rounded-xl transition'>
//                       <ChevronRight className='w-5 h-5' />
//                     </button>
//                   </div>
//                 </div>
//               </div>

//               {/* PERBAIKAN SCROLL: Area ini sekarang dapat discroll mandiri berkat flex-1 & overscroll-contain */}
//               <div className='p-5 md:p-7 overflow-y-auto overscroll-contain flex-1 relative scrollbar-hide'>
//                 <div className='grid grid-cols-7 gap-1 md:gap-2 mb-3 text-center'>
//                   {['Ahad', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(
//                     (hari) => (
//                       <div
//                         key={hari}
//                         className='text-[11px] md:text-xs font-bold text-gray-400 py-1 uppercase tracking-wider'>
//                         {hari}
//                       </div>
//                     ),
//                   )}
//                 </div>

//                 <div className='grid grid-cols-7 gap-1 md:gap-2 mb-6'>
//                   {calendarCells}
//                 </div>

//                 <div className='pt-5 border-t border-gray-100 min-h-[150px]'>
//                   <div className='flex justify-between items-end mb-4'>
//                     <h4 className='font-bold text-gray-800 flex items-center'>
//                       <CalendarIcon className='w-4 h-4 mr-2 text-mni-primary' />{' '}
//                       {agendaTitleText}
//                     </h4>
//                     <div className='flex items-center gap-3 text-[10px] font-bold text-gray-400'>
//                       <span className='flex items-center'>
//                         <span className='w-2 h-2 rounded-full bg-mni-primary mr-1 animate-pulse'></span>{' '}
//                         Islam
//                       </span>
//                       <span className='flex items-center'>
//                         <span className='w-2 h-2 rounded-full bg-red-500 mr-1'></span>{' '}
//                         Nasional
//                       </span>
//                     </div>
//                   </div>

//                   {displayedAgenda.length === 0 ? (
//                     <div className='text-center py-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200'>
//                       <p className='text-sm font-medium text-gray-400'>
//                         Tidak ada agenda / peringatan di bulan ini.
//                       </p>
//                     </div>
//                   ) : (
//                     <div className='space-y-3'>
//                       {displayedAgenda.map((ev, idx) => {
//                         const isNasional = ev.tipe === 'nasional';
//                         return (
//                           <motion.div
//                             initial={{ opacity: 0, y: 10 }}
//                             animate={{ opacity: 1, y: 0 }}
//                             key={idx}
//                             className={`flex items-start p-4 rounded-2xl border shadow-sm ${isNasional ? 'bg-red-50/50 border-red-100' : 'bg-green-50/50 border-green-100'}`}>
//                             <div
//                               className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-black text-lg shrink-0 shadow-inner ${isNasional ? 'bg-red-500 text-white' : 'bg-mni-primary text-white'}`}>
//                               <span>{ev.tglObj.getDate()}</span>
//                             </div>
//                             <div className='ml-4 flex flex-col justify-center'>
//                               <h5
//                                 className={`font-extrabold text-base ${isNasional ? 'text-red-700' : 'text-green-800'}`}>
//                                 {ev.nama}
//                               </h5>
//                               <p className='text-xs text-gray-500 mt-1 leading-snug font-medium'>
//                                 {ev.deskripsi}
//                               </p>
//                             </div>
//                           </motion.div>
//                         );
//                       })}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </motion.div>
//           </>
//         )}
//       </AnimatePresence>
//     </>
//   );
// }
//
//
//
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  X,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

export default function CountdownHariBesar({ isEditor }: any = {}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    hari: 0,
    jam: 0,
    menit: 0,
    detik: 0,
  });

  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // STATE BARU: Menampung nilai penyesuaian Hijriah dari Supabase
  const [hijriAdj, setHijriAdj] = useState(0);

  useEffect(() => {
    const fetchAdj = async () => {
      const { data } = await supabase
        .from('pengaturan_web')
        .select('nilai')
        .eq('kunci', 'hijri_adjustment')
        .single();
      if (data && data.nilai) {
        setHijriAdj(parseInt(data.nilai) || 0);
      }
    };
    fetchAdj();
  }, []);

  // Kunci layar belakang saat modal terbuka
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  const hariBesarIslam = useMemo(
    () => [
      {
        hMonth: 1,
        hDay: 1,
        nama: 'Tahun Baru Islam',
        deskripsi:
          '1 Muharram, mari berhijrah menjadi pribadi yang lebih baik.',
      },
      {
        hMonth: 1,
        hDay: 9,
        nama: "Puasa Tasu'a",
        deskripsi: '9 Muharram, puasa sunnah mengiringi puasa Asyura.',
      },
      {
        hMonth: 1,
        hDay: 10,
        nama: 'Puasa Asyura',
        deskripsi: '10 Muharram, puasa sunnah menghapus dosa setahun lalu.',
      },
      {
        hMonth: 3,
        hDay: 12,
        nama: 'Maulid Nabi Muhammad SAW',
        deskripsi: '12 Rabiul Awal, mari perbanyak shalawat atas Rasulullah.',
      },
      {
        hMonth: 7,
        hDay: 27,
        nama: "Isra Mi'raj",
        deskripsi:
          '27 Rajab, peringatan perjalanan suci dan turunnya perintah shalat.',
      },
      {
        hMonth: 8,
        hDay: 15,
        nama: "Nisfu Sya'ban",
        deskripsi: "15 Sya'ban, malam pertengahan bulan yang penuh ampunan.",
      },
      {
        hMonth: 9,
        hDay: 1,
        nama: 'Awal Ramadhan',
        deskripsi: '1 Ramadhan, Bulan Suci penuh ampunan telah tiba!',
      },
      {
        hMonth: 9,
        hDay: 17,
        nama: "Nuzulul Qur'an",
        deskripsi: "17 Ramadhan, peringatan turunnya wahyu pertama Al-Qur'an.",
      },
      {
        hMonth: 10,
        hDay: 1,
        nama: 'Idul Fitri',
        deskripsi: '1 Syawal, Hari Kemenangan! Mari saling memaafkan.',
      },
      {
        hMonth: 12,
        hDay: 9,
        nama: 'Puasa Arafah',
        deskripsi:
          '9 Dzulhijjah, puasa sunnah menghapus dosa setahun lalu & yang akan datang.',
      },
      {
        hMonth: 12,
        hDay: 10,
        nama: 'Idul Adha',
        deskripsi:
          '10 Dzulhijjah, waktunya berkurban. Siapkan hewan terbaik Anda.',
      },
      {
        hMonth: 12,
        hDay: 11,
        nama: 'Hari Tasyrik Pertama',
        deskripsi: '11 Dzulhijjah, diharamkan berpuasa. Perbanyak takbir.',
      },
      {
        hMonth: 12,
        hDay: 12,
        nama: 'Hari Tasyrik Kedua',
        deskripsi: '12 Dzulhijjah, diharamkan berpuasa. Perbanyak takbir.',
      },
      {
        hMonth: 12,
        hDay: 13,
        nama: 'Hari Tasyrik Ketiga',
        deskripsi: '13 Dzulhijjah, diharamkan berpuasa. Perbanyak takbir.',
      },
    ],
    [],
  );

  const liburNasional = useMemo(
    () => [
      {
        gMonth: 1,
        gDay: 1,
        nama: 'Tahun Baru Masehi',
        deskripsi: 'Libur Nasional',
      },
      {
        gMonth: 5,
        gDay: 1,
        nama: 'Hari Buruh Internasional',
        deskripsi: 'Libur Nasional',
      },
      {
        gMonth: 6,
        gDay: 1,
        nama: 'Hari Lahir Pancasila',
        deskripsi: 'Peringatan lahirnya dasar negara',
      },
      {
        gMonth: 8,
        gDay: 17,
        nama: 'Hari Kemerdekaan RI',
        deskripsi: 'Dirgahayu Republik Indonesia!',
      },
      {
        gMonth: 12,
        gDay: 25,
        nama: 'Hari Raya Natal',
        deskripsi: 'Libur Nasional',
      },
    ],
    [],
  );

  const toArabic = (num: number) =>
    num.toString().replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d as any]);
  const hijriFormatterParts = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US-u-ca-islamic', {
        month: 'numeric',
        day: 'numeric',
      }),
    [],
  );

  const nextIslamicEvent = useMemo(() => {
    let checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      // PENERAPAN KOREKSI: Tambah/Kurang Hari (* 86400000 ms) sebelum diformat
      const adjustedDate = new Date(checkDate.getTime() + hijriAdj * 86400000);
      const parts = hijriFormatterParts.formatToParts(adjustedDate);
      const hMonth = parseInt(
        parts.find((p) => p.type === 'month')?.value || '0',
      );
      const hDay = parseInt(parts.find((p) => p.type === 'day')?.value || '0');

      const event = hariBesarIslam.find(
        (h) => h.hMonth === hMonth && h.hDay === hDay,
      );
      if (event) {
        return { ...event, dateObj: new Date(checkDate) };
      }
      checkDate.setDate(checkDate.getDate() + 1);
    }
    return null;
  }, [hariBesarIslam, hijriFormatterParts, hijriAdj]);

  useEffect(() => {
    if (!nextIslamicEvent) return;
    const target = nextIslamicEvent.dateObj.getTime();

    const interval = setInterval(() => {
      const sekarang = new Date().getTime();
      const selisih = target - sekarang;

      if (selisih > 0) {
        setTimeLeft({
          hari: Math.floor(selisih / (1000 * 60 * 60 * 24)),
          jam: Math.floor((selisih % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          menit: Math.floor((selisih % (1000 * 60 * 60)) / (1000 * 60)),
          detik: Math.floor((selisih % (1000 * 60)) / 1000),
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [nextIslamicEvent]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const getDaysInMonth = (y: number, m: number) =>
    new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) =>
    new Date(y, m, 1).getDay();

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const calendarCells = [];
  for (let i = 0; i < firstDay; i++) {
    calendarCells.push(
      <div
        key={`empty-${i}`}
        className='p-2 md:p-3 opacity-0 pointer-events-none'></div>,
    );
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    const isToday = new Date().toDateString() === dateObj.toDateString();
    const isSelected = selectedDate.toDateString() === dateObj.toDateString();

    // PENERAPAN KOREKSI: Tambah/Kurang Hari (* 86400000 ms) sebelum diformat
    const adjustedDateObj = new Date(dateObj.getTime() + hijriAdj * 86400000);
    const parts = hijriFormatterParts.formatToParts(adjustedDateObj);
    const hMonth = parseInt(
      parts.find((p) => p.type === 'month')?.value || '0',
    );
    const hDay = parseInt(parts.find((p) => p.type === 'day')?.value || '0');

    const isIslamic = hariBesarIslam.some(
      (h) => h.hMonth === hMonth && h.hDay === hDay,
    );
    const isNational = liburNasional.some(
      (n) => n.gMonth === month + 1 && n.gDay === d,
    );

    calendarCells.push(
      <div
        key={d}
        onClick={() => setSelectedDate(dateObj)}
        className={`relative p-2 md:p-3 border rounded-xl flex flex-col items-center justify-center min-h-[60px] md:min-h-[70px] transition-all cursor-pointer group
        ${isSelected ? 'ring-2 ring-mni-primary bg-mni-primary/10 border-transparent shadow-md transform scale-105 z-10' : 'border-gray-100 bg-white hover:border-mni-primary/30'}
        ${isToday && !isSelected ? 'bg-blue-50/50' : ''}
      `}>
        <div className='absolute top-1.5 right-1.5 flex gap-1'>
          {isNational && (
            <span className='w-1.5 h-1.5 rounded-full bg-red-500 shadow-sm'></span>
          )}
          {isIslamic && (
            <span className='w-1.5 h-1.5 rounded-full bg-mni-primary shadow-sm animate-pulse'></span>
          )}
        </div>
        <span
          className={`text-sm md:text-lg font-extrabold transition-colors ${isSelected ? 'text-mni-primary' : isIslamic ? 'text-mni-primary' : isNational ? 'text-red-600' : 'text-gray-700'}`}>
          {d}
        </span>
        <span
          className={`text-[10px] md:text-xs font-semibold mt-0.5 ${isSelected ? 'text-mni-primary' : 'text-gray-400'}`}>
          {toArabic(hDay)}
        </span>
      </div>,
    );
  }

  const masehiText = selectedDate.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // PENERAPAN KOREKSI UNTUK TEKS JUDUL KALENDER BESAR
  const adjustedSelectedDate = new Date(
    selectedDate.getTime() + hijriAdj * 86400000,
  );
  const rawHijri = new Intl.DateTimeFormat('id-ID-u-ca-islamic', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(adjustedSelectedDate);
  const hijriText = rawHijri.replace(/ AH| H/gi, '') + ' H';

  const agendaHariIni = useMemo(() => {
    const y = selectedDate.getFullYear();
    const m = selectedDate.getMonth();
    const d = selectedDate.getDate();

    const national = liburNasional.filter(
      (n) => n.gMonth === m + 1 && n.gDay === d,
    );

    // PENERAPAN KOREKSI
    const adjustedDate = new Date(selectedDate.getTime() + hijriAdj * 86400000);
    const parts = hijriFormatterParts.formatToParts(adjustedDate);
    const hMonth = parseInt(
      parts.find((p) => p.type === 'month')?.value || '0',
    );
    const hDay = parseInt(parts.find((p) => p.type === 'day')?.value || '0');
    const islamic = hariBesarIslam.filter(
      (h) => h.hMonth === hMonth && h.hDay === hDay,
    );

    return [
      ...islamic.map((i) => ({ ...i, tipe: 'islam', tglObj: selectedDate })),
      ...national.map((n) => ({
        ...n,
        tipe: 'nasional',
        tglObj: selectedDate,
      })),
    ];
  }, [
    selectedDate,
    hariBesarIslam,
    liburNasional,
    hijriFormatterParts,
    hijriAdj,
  ]);

  const eventsThisMonth = useMemo(() => {
    const evs: any[] = [];
    const y = viewDate.getFullYear();
    const m = viewDate.getMonth();
    const maxDays = new Date(y, m + 1, 0).getDate();

    for (let d = 1; d <= maxDays; d++) {
      const dateObj = new Date(y, m, d);
      const national = liburNasional.filter(
        (n) => n.gMonth === m + 1 && n.gDay === d,
      );

      // PENERAPAN KOREKSI
      const adjustedDateObj = new Date(dateObj.getTime() + hijriAdj * 86400000);
      const parts = hijriFormatterParts.formatToParts(adjustedDateObj);
      const hMonth = parseInt(
        parts.find((p) => p.type === 'month')?.value || '0',
      );
      const hDay = parseInt(parts.find((p) => p.type === 'day')?.value || '0');
      const islamic = hariBesarIslam.filter(
        (h) => h.hMonth === hMonth && h.hDay === hDay,
      );

      evs.push(
        ...islamic.map((i) => ({ ...i, tipe: 'islam', tglObj: dateObj })),
        ...national.map((n) => ({ ...n, tipe: 'nasional', tglObj: dateObj })),
      );
    }
    return evs;
  }, [viewDate, hariBesarIslam, liburNasional, hijriFormatterParts, hijriAdj]);

  const isSelectedDateHasEvent = agendaHariIni.length > 0;
  const displayedAgenda = isSelectedDateHasEvent
    ? agendaHariIni
    : eventsThisMonth;
  const agendaTitleText = isSelectedDateHasEvent
    ? 'Detail Tanggal Terpilih'
    : 'Agenda Bulan Ini';

  const arrayMonths = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];
  const currentYear = new Date().getFullYear();
  const arrayYears = Array.from(
    { length: 100 },
    (_, i) => currentYear - 50 + i,
  );

  return (
    <>
      <motion.div
        whileHover={{ y: -5 }}
        className='bg-gradient-to-br from-mni-primary to-green-800 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between mt-12 mx-4 md:mx-10 group cursor-pointer'
        onClick={() => setIsModalOpen(true)}>
        <div className='absolute -right-10 -top-10 opacity-10 group-hover:scale-125 transition-transform duration-700 pointer-events-none'>
          <CalendarIcon className='w-64 h-64' />
        </div>

        <div className='relative z-10 text-center md:text-left mb-6 md:mb-0'>
          <div className='inline-flex items-center bg-white/20 px-3 py-1 rounded-full text-xs font-bold mb-3 border border-white/30 backdrop-blur-sm'>
            <Clock className='w-3.5 h-3.5 mr-1.5' /> Menuju Hari Besar
          </div>
          <h3 className='text-2xl md:text-3xl font-bold mb-1'>
            {nextIslamicEvent?.nama || 'Memuat...'}
          </h3>
          <p className='text-green-100 text-sm mb-2'>
            {nextIslamicEvent
              ? nextIslamicEvent.dateObj.toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              : '-'}
          </p>
          {nextIslamicEvent && (
            <p className='text-xs bg-black/20 inline-block px-3 py-1.5 rounded-lg border border-white/10'>
              {nextIslamicEvent.deskripsi}
            </p>
          )}
        </div>

        <div className='relative z-10 flex gap-3 md:gap-4'>
          {[
            { label: 'Hari', val: timeLeft.hari },
            { label: 'Jam', val: timeLeft.jam },
            { label: 'Menit', val: timeLeft.menit },
            { label: 'Detik', val: timeLeft.detik },
          ].map((item, idx) => (
            <div
              key={idx}
              className='flex flex-col items-center'>
              <div className='bg-white text-mni-primary w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-xl md:text-2xl font-black shadow-inner'>
                {item.val.toString().padStart(2, '0')}
              </div>
              <span className='text-[10px] md:text-xs font-semibold mt-2 uppercase tracking-widest text-green-100'>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className='fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] h-[100dvh] w-screen'
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className='fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-[500px] bg-white rounded-[2rem] shadow-2xl z-[101] overflow-hidden flex flex-col max-h-[90dvh]'>
              <div className='bg-mni-primary p-6 md:p-8 text-white relative shrink-0 group overflow-hidden'>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className='absolute top-5 right-5 p-2 bg-black/10 hover:bg-black/20 rounded-full transition-colors z-20'>
                  <X className='w-5 h-5' />
                </button>

                <div className='absolute -right-10 -top-10 opacity-10 group-hover:scale-125 transition-transform duration-1000 pointer-events-none z-0'>
                  <CalendarIcon className='w-64 h-64' />
                </div>

                <div className='relative z-10 flex flex-col items-center mb-2'>
                  <div className='text-center mb-5 mt-2'>
                    <h3 className='font-extrabold text-3xl tracking-tight leading-none mb-3'>
                      {masehiText}
                    </h3>
                    <div className='inline-flex items-center justify-center bg-white/20 px-5 py-2 rounded-full border border-white/30 backdrop-blur-md shadow-inner'>
                      <CalendarIcon className='w-4 h-4 mr-2 text-green-100' />
                      <p className='text-sm text-white font-bold tracking-wide'>
                        {hijriText}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center gap-2 bg-black/30 p-1.5 rounded-2xl backdrop-blur-sm border border-white/20'>
                    <button
                      onClick={prevMonth}
                      className='p-2 hover:bg-white/20 rounded-xl transition'>
                      <ChevronLeft className='w-5 h-5' />
                    </button>

                    <select
                      value={month}
                      onChange={(e) =>
                        setViewDate(new Date(year, parseInt(e.target.value), 1))
                      }
                      className='bg-transparent font-bold text-sm cursor-pointer outline-none appearance-none px-2 text-center text-white [&>option]:text-gray-900'>
                      {arrayMonths.map((m, i) => (
                        <option
                          key={i}
                          value={i}>
                          {m}
                        </option>
                      ))}
                    </select>

                    <select
                      value={year}
                      onChange={(e) =>
                        setViewDate(
                          new Date(parseInt(e.target.value), month, 1),
                        )
                      }
                      className='bg-transparent font-bold text-sm cursor-pointer outline-none appearance-none px-2 text-center text-white [&>option]:text-gray-900'>
                      {arrayYears.map((y) => (
                        <option
                          key={y}
                          value={y}>
                          {y}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={nextMonth}
                      className='p-2 hover:bg-white/20 rounded-xl transition'>
                      <ChevronRight className='w-5 h-5' />
                    </button>
                  </div>
                </div>
              </div>

              <div className='p-5 md:p-7 overflow-y-auto overscroll-contain flex-1 relative scrollbar-hide'>
                <div className='grid grid-cols-7 gap-1 md:gap-2 mb-3 text-center'>
                  {['Ahad', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(
                    (hari) => (
                      <div
                        key={hari}
                        className='text-[11px] md:text-xs font-bold text-gray-400 py-1 uppercase tracking-wider'>
                        {hari}
                      </div>
                    ),
                  )}
                </div>

                <div className='grid grid-cols-7 gap-1 md:gap-2 mb-6'>
                  {calendarCells}
                </div>

                <div className='pt-5 border-t border-gray-100 min-h-[150px]'>
                  <div className='flex justify-between items-end mb-4'>
                    <h4 className='font-bold text-gray-800 flex items-center'>
                      <CalendarIcon className='w-4 h-4 mr-2 text-mni-primary' />{' '}
                      {agendaTitleText}
                    </h4>
                    <div className='flex items-center gap-3 text-[10px] font-bold text-gray-400'>
                      <span className='flex items-center'>
                        <span className='w-2 h-2 rounded-full bg-mni-primary mr-1 animate-pulse'></span>{' '}
                        Islam
                      </span>
                      <span className='flex items-center'>
                        <span className='w-2 h-2 rounded-full bg-red-500 mr-1'></span>{' '}
                        Nasional
                      </span>
                    </div>
                  </div>

                  {displayedAgenda.length === 0 ? (
                    <div className='text-center py-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200'>
                      <p className='text-sm font-medium text-gray-400'>
                        Tidak ada agenda / peringatan di bulan ini.
                      </p>
                    </div>
                  ) : (
                    <div className='space-y-3'>
                      {displayedAgenda.map((ev, idx) => {
                        const isNasional = ev.tipe === 'nasional';
                        return (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={idx}
                            className={`flex items-start p-4 rounded-2xl border shadow-sm ${isNasional ? 'bg-red-50/50 border-red-100' : 'bg-green-50/50 border-green-100'}`}>
                            <div
                              className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-black text-lg shrink-0 shadow-inner ${isNasional ? 'bg-red-500 text-white' : 'bg-mni-primary text-white'}`}>
                              <span>{ev.tglObj.getDate()}</span>
                            </div>
                            <div className='ml-4 flex flex-col justify-center'>
                              <h5
                                className={`font-extrabold text-base ${isNasional ? 'text-red-700' : 'text-green-800'}`}>
                                {ev.nama}
                              </h5>
                              <p className='text-xs text-gray-500 mt-1 leading-snug font-medium'>
                                {ev.deskripsi}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
