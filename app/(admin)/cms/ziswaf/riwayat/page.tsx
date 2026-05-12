// 'use client';

// import * as XLSX from 'xlsx';
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';

// import React, { useState, useEffect, useMemo, useRef } from 'react';
// import { supabase } from '@/lib/supabase';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//   Search,
//   Loader2,
//   CheckCircle,
//   XCircle,
//   Download,
//   Printer,
//   Clock,
//   Users,
//   Wallet,
//   Activity,
//   Receipt,
//   Calculator,
//   MapPin,
//   MessageSquare,
//   Image as ImageIcon,
//   Tag,
//   X,
//   Settings2,
//   Box,
//   ChevronUp,
// } from 'lucide-react';
// import {
//   ComposedChart,
//   Line,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip as RechartsTooltip,
//   ResponsiveContainer,
//   Legend,
// } from 'recharts';

// export default function RiwayatPesananZiswaf() {
//   const [transactions, setTransactions] = useState<any[]>([]);
//   const [isLoading, setIsLoading] = useState(true);

//   // Filter States
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterStatus, setFilterStatus] = useState('Semua');
//   const [filterKategori, setFilterKategori] = useState('Semua');

//   // Y-Axis Customization States
//   const [chartYMin, setChartYMin] = useState('');
//   const [chartYMax, setChartYMax] = useState('');

//   const [selectedTrx, setSelectedTrx] = useState<any>(null);

//   // SCROLL STATES
//   const scrollContainerRef = useRef<HTMLDivElement>(null);
//   const [showScrollTop, setShowScrollTop] = useState(false);

//   const fetchRiwayat = async () => {
//     setIsLoading(true);
//     const { data, error } = await supabase
//       .from('transaksi_ziswaf')
//       .select('*')
//       .order('created_at', { ascending: false });

//     if (!error && data) setTransactions(data);
//     setIsLoading(false);
//   };

//   useEffect(() => {
//     fetchRiwayat();
//   }, []);

//   const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
//     if (e.currentTarget.scrollTop > 500) {
//       setShowScrollTop(true);
//     } else {
//       setShowScrollTop(false);
//     }
//   };

//   const scrollToTop = () => {
//     scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
//   };

//   const formatRp = (angka: number) =>
//     new Intl.NumberFormat('id-ID', {
//       style: 'currency',
//       currency: 'IDR',
//       minimumFractionDigits: 0,
//     }).format(angka);

//   const formatYAxis = (value: number) => {
//     if (value >= 1000000000) return `Rp${(value / 1000000000).toFixed(1)}M`;
//     if (value >= 1000000) return `Rp${(value / 1000000).toFixed(1)}Jt`;
//     if (value >= 1000) return `Rp${(value / 1000).toFixed(0)}Rb`;
//     return `Rp${value}`;
//   };

//   const formatStatusDisplay = (status: string) => {
//     if (!status) return '';
//     return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
//   };

//   const maskNameStyle = (name: string, isAnon: boolean) => {
//     if (isAnon) {
//       return name
//         .split(' ')
//         .map((word) => {
//           if (word.length <= 2) return word.charAt(0) + '*';
//           return (
//             word.charAt(0) +
//             '*'.repeat(word.length - 2) +
//             word.charAt(word.length - 1)
//           );
//         })
//         .join(' ');
//     }
//     return name;
//   };

//   // 1. Filter Multi-parameter
//   const listFilteredByKategoriAndSearch = useMemo(() => {
//     return transactions.filter((p) => {
//       const matchKategori =
//         filterKategori === 'Semua' ||
//         p.kategori?.toLowerCase().includes(filterKategori.toLowerCase());
//       const matchSearch =
//         p.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         p.kode_trx?.toLowerCase().includes(searchTerm.toLowerCase());
//       return matchKategori && matchSearch;
//     });
//   }, [transactions, filterKategori, searchTerm]);

//   const filteredPesanan = useMemo(() => {
//     return listFilteredByKategoriAndSearch.filter((p) => {
//       const statusDisplay = formatStatusDisplay(p.status_pesanan);
//       return filterStatus === 'Semua' || statusDisplay === filterStatus;
//     });
//   }, [listFilteredByKategoriAndSearch, filterStatus]);

//   const getSortedData = () => {
//     return [...filteredPesanan].sort((a, b) => {
//       return (
//         new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
//       );
//     });
//   };

//   // EXPORT EXCEL
//   const handleExportExcel = () => {
//     const sortedData = getSortedData();
//     if (sortedData.length === 0) return alert('Tidak ada data untuk diexport');
//     const dataToExport = sortedData.map((p) => ({
//       Tanggal: new Date(p.created_at).toLocaleString('id-ID'),
//       'Kode TRX': p.kode_trx,
//       'Nama Donatur': maskNameStyle(p.nama, p.is_anonim),
//       Kategori: p.kategori,
//       Nominal: Number(p.nominal),
//       Status: formatStatusDisplay(p.status_pesanan),
//       'Pesan / Doa': p.pesan || '-',
//     }));
//     const worksheet = XLSX.utils.json_to_sheet(dataToExport);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, 'Data_ZISWAF');
//     XLSX.writeFile(workbook, `Data_ZISWAF_MNI_${new Date().getTime()}.xlsx`);
//   };

//   // CETAK PDF
//   const handlePrintPDF = () => {
//     const sortedData = getSortedData();
//     if (sortedData.length === 0) return alert('Tidak ada data untuk dicetak');
//     const doc = new jsPDF('p', 'pt', 'a4');
//     const pageWidth = doc.internal.pageSize.getWidth();

//     doc.setFont('times', 'bold');
//     doc.setTextColor(0, 0, 0);
//     doc.setFontSize(16);
//     doc.text('Laporan Penerimaan ZISWAF MNI', pageWidth / 2, 40, {
//       align: 'center',
//     });

//     doc.setFont('times', 'normal');
//     doc.setFontSize(10);
//     doc.text(
//       `Dicetak pada: ${new Date().toLocaleString('id-ID')}`,
//       pageWidth / 2,
//       55,
//       { align: 'center' },
//     );

//     const tableBody = sortedData.map((p) => [
//       `${new Date(p.created_at).toLocaleDateString('id-ID')} - ${p.kode_trx}`,
//       maskNameStyle(p.nama, p.is_anonim),
//       p.kategori,
//       formatRp(Number(p.nominal)),
//     ]);

//     autoTable(doc, {
//       startY: 75,
//       head: [['Tanggal & TRX', 'Nama Donatur', 'Kategori', 'Nominal']],
//       body: tableBody,
//       theme: 'grid',
//       headStyles: {
//         font: 'times',
//         fillColor: [15, 118, 110],
//         textColor: [255, 255, 255],
//         fontStyle: 'bold',
//         fontSize: 14,
//       },
//       styles: {
//         font: 'times',
//         textColor: [0, 0, 0],
//         fontSize: 12,
//         cellPadding: 4,
//       },
//       columnStyles: {
//         0: { cellWidth: 120 },
//         1: { cellWidth: 'auto' },
//         2: { cellWidth: 110 },
//         3: { cellWidth: 110, halign: 'right' },
//       },
//     });
//     doc.save(`Laporan_ZISWAF_MNI_${new Date().getTime()}.pdf`);
//   };

//   const counts = useMemo(
//     () => ({
//       Semua: listFilteredByKategoriAndSearch.length,
//       Menunggu: listFilteredByKategoriAndSearch.filter(
//         (t) => formatStatusDisplay(t.status_pesanan) === 'Menunggu',
//       ).length,
//       Diterima: listFilteredByKategoriAndSearch.filter(
//         (t) => formatStatusDisplay(t.status_pesanan) === 'Diterima',
//       ).length,
//       Ditolak: listFilteredByKategoriAndSearch.filter(
//         (t) => formatStatusDisplay(t.status_pesanan) === 'Ditolak',
//       ).length,
//     }),
//     [listFilteredByKategoriAndSearch],
//   );

//   const metrics = useMemo(() => {
//     const diterimaData = listFilteredByKategoriAndSearch.filter(
//       (p) => formatStatusDisplay(p.status_pesanan) === 'Diterima',
//     );
//     const menungguData = listFilteredByKategoriAndSearch.filter(
//       (p) => formatStatusDisplay(p.status_pesanan) === 'Menunggu',
//     );

//     return {
//       totalTransaksi: listFilteredByKategoriAndSearch.length,
//       totalDonatur: new Set(
//         listFilteredByKategoriAndSearch.map((p) => p.whatsapp),
//       ).size,
//       danaDiterima: diterimaData.reduce((sum, p) => sum + Number(p.nominal), 0),
//       danaMenunggu: menungguData.reduce((sum, p) => sum + Number(p.nominal), 0),
//     };
//   }, [listFilteredByKategoriAndSearch]);

//   const chartData = useMemo(() => {
//     const dataMap: Record<string, any> = {};

//     listFilteredByKategoriAndSearch.forEach((p) => {
//       if (formatStatusDisplay(p.status_pesanan) === 'Ditolak') return;

//       const dateObj = new Date(p.created_at);
//       const dateStr = dateObj.toLocaleDateString('id-ID', {
//         day: 'numeric',
//         month: 'short',
//       });

//       if (!dataMap[dateStr]) {
//         dataMap[dateStr] = {
//           tanggal: dateStr,
//           Fitrah: 0,
//           Mal: 0,
//           Infaq: 0,
//           Wakaf: 0,
//           Fidyah: 0,
//           Total: 0,
//         };
//       }

//       const nominal = Number(p.nominal) || 0;
//       const kat = p.kategori?.toLowerCase() || '';

//       if (kat.includes('fitrah')) dataMap[dateStr].Fitrah += nominal;
//       else if (kat.includes('mal')) dataMap[dateStr].Mal += nominal;
//       else if (kat.includes('infaq')) dataMap[dateStr].Infaq += nominal;
//       else if (kat.includes('wakaf')) dataMap[dateStr].Wakaf += nominal;
//       else if (kat.includes('fidyah')) dataMap[dateStr].Fidyah += nominal;

//       dataMap[dateStr].Total += nominal;
//     });

//     return Object.values(dataMap).reverse();
//   }, [listFilteredByKategoriAndSearch]);

//   const yAxisDomain = useMemo(() => {
//     const min = chartYMin !== '' ? Number(chartYMin) : 'auto';
//     const max = chartYMax !== '' ? Number(chartYMax) : 'auto';
//     return [min, max];
//   }, [chartYMin, chartYMax]);

//   return (
//     <>
//       <div
//         ref={scrollContainerRef}
//         onScroll={handleScroll}
//         className='w-full max-w-[1600px] mx-auto animate-in fade-in h-[calc(100vh-4rem)] overflow-y-auto relative bg-[#f8fafc] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400'>
//         <div className='p-4 md:p-8 space-y-8'>
//           {/* HEADER UTAMA & BUTTONS */}
//           <div className='shrink-0 flex flex-col md:flex-row md:items-start justify-between gap-6'>
//             <div>
//               <h1 className='text-2xl font-semibold text-slate-800 tracking-tight'>
//                 Riwayat & Analitik Ziswaf
//               </h1>
//               <p className='text-slate-500 mt-1 font-medium'>
//                 Pantau lalu lintas dana, donatur, dan cetak laporan
//                 rekapitulasi.
//               </p>
//             </div>

//             <div className='flex flex-row gap-4 w-full md:w-auto'>
//               <motion.button
//                 initial={{ opacity: 0, scale: 0.95 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 whileHover={{ scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//                 onClick={handleExportExcel}
//                 className='flex-1 md:flex-none flex items-center justify-center gap-3 bg-emerald-600 text-white border-2 border-emerald-600 px-6 py-3 rounded-2xl font-bold shadow-md hover:bg-white hover:text-emerald-600 transition-all duration-300 relative overflow-hidden group'>
//                 <Download className='w-5 h-5 relative z-10' />
//                 <span className='relative z-10'>Excel</span>
//                 <Download className='absolute -right-2 -bottom-2 w-14 h-14 text-white/10 group-hover:text-emerald-500/10 transition-all duration-700 pointer-events-none' />
//               </motion.button>

//               <motion.button
//                 initial={{ opacity: 0, scale: 0.95 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 whileHover={{ scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//                 onClick={handlePrintPDF}
//                 className='flex-1 md:flex-none flex items-center justify-center gap-3 bg-slate-800 text-white border-2 border-slate-800 px-6 py-3 rounded-2xl font-bold shadow-md hover:bg-white hover:text-slate-800 transition-all duration-300 relative overflow-hidden group'>
//                 <Printer className='w-5 h-5 relative z-10' />
//                 <span className='relative z-10 whitespace-nowrap'>
//                   Cetak PDF
//                 </span>
//                 <Printer className='absolute -right-2 -bottom-2 w-14 h-14 text-white/10 group-hover:text-slate-500/10 transition-all duration-700 pointer-events-none' />
//               </motion.button>
//             </div>
//           </div>

//           {/* KPI CARDS */}
//           <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5'>
//             <div className='bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-teal-300 hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden cursor-default'>
//               <Receipt className='absolute -right-4 -bottom-4 w-24 h-24 text-slate-50 group-hover:scale-110 transition-transform duration-700 pointer-events-none' />
//               <div className='w-12 h-12 bg-slate-50 border border-slate-100 text-teal-700 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-teal-50 transition-colors relative z-10'>
//                 <Receipt className='w-5 h-5' />
//               </div>
//               <div className='relative z-10 w-full'>
//                 <p className='text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5'>
//                   Total Transaksi
//                 </p>
//                 <p className='text-xl font-bold text-slate-800'>
//                   {metrics.totalTransaksi}
//                 </p>
//               </div>
//             </div>

//             <div className='bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-teal-300 hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden cursor-default'>
//               <Users className='absolute -right-4 -bottom-4 w-24 h-24 text-slate-50 group-hover:scale-110 transition-transform duration-700 pointer-events-none' />
//               <div className='w-12 h-12 bg-slate-50 border border-slate-100 text-teal-700 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-teal-50 transition-colors relative z-10'>
//                 <Users className='w-5 h-5' />
//               </div>
//               <div className='relative z-10 w-full'>
//                 <p className='text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5'>
//                   Donatur Unik
//                 </p>
//                 <p className='text-xl font-bold text-slate-800'>
//                   {metrics.totalDonatur}
//                 </p>
//               </div>
//             </div>

//             <div className='bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-teal-300 hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden cursor-default'>
//               <Wallet className='absolute -right-4 -bottom-4 w-24 h-24 text-teal-50/50 group-hover:scale-110 transition-transform duration-700 pointer-events-none' />
//               <div className='w-12 h-12 bg-slate-50 border border-slate-100 text-teal-700 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-teal-50 transition-colors relative z-10'>
//                 <Wallet className='w-5 h-5' />
//               </div>
//               <div className='relative z-10 w-full overflow-hidden'>
//                 <p className='text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5'>
//                   Dana Diterima
//                 </p>
//                 <div
//                   className='w-full overflow-hidden whitespace-nowrap relative'
//                   style={{
//                     maskImage:
//                       'linear-gradient(to right, black 85%, transparent 100%)',
//                     WebkitMaskImage:
//                       'linear-gradient(to right, black 85%, transparent 100%)',
//                   }}>
//                   <motion.div
//                     animate={{ x: ['0%', '-50%'] }}
//                     transition={{
//                       ease: 'linear',
//                       duration: 8,
//                       repeat: Infinity,
//                     }}
//                     className='flex w-max'>
//                     <p className='text-xl font-bold text-teal-700 pr-10'>
//                       {formatRp(metrics.danaDiterima)}
//                     </p>
//                     <p className='text-xl font-bold text-teal-700 pr-10'>
//                       {formatRp(metrics.danaDiterima)}
//                     </p>
//                   </motion.div>
//                 </div>
//               </div>
//             </div>

//             <div className='bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-teal-300 hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden cursor-default'>
//               <Clock className='absolute -right-4 -bottom-4 w-24 h-24 text-slate-50 group-hover:scale-110 transition-transform duration-700 pointer-events-none' />
//               <div className='w-12 h-12 bg-slate-50 border border-slate-100 text-slate-500 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-slate-100 transition-colors relative z-10'>
//                 <Clock className='w-5 h-5' />
//               </div>
//               <div className='relative z-10 w-full overflow-hidden'>
//                 <p className='text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5'>
//                   Menunggu Verifikasi
//                 </p>
//                 <div
//                   className='w-full overflow-hidden whitespace-nowrap relative'
//                   style={{
//                     maskImage:
//                       'linear-gradient(to right, black 85%, transparent 100%)',
//                     WebkitMaskImage:
//                       'linear-gradient(to right, black 85%, transparent 100%)',
//                   }}>
//                   <motion.div
//                     animate={{ x: ['0%', '-50%'] }}
//                     transition={{
//                       ease: 'linear',
//                       duration: 10,
//                       repeat: Infinity,
//                     }}
//                     className='flex w-max'>
//                     <p className='text-xl font-bold text-slate-600 pr-10'>
//                       {formatRp(metrics.danaMenunggu)}
//                     </p>
//                     <p className='text-xl font-bold text-slate-600 pr-10'>
//                       {formatRp(metrics.danaMenunggu)}
//                     </p>
//                   </motion.div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* COMPOSED CHART ANALITIK */}
//           <div className='bg-white p-6 rounded-3xl shadow-sm border border-slate-200 h-[400px] flex flex-col mb-4'>
//             <div className='flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4'>
//               <h3 className='text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center shrink-0'>
//                 <Activity className='w-4 h-4 mr-2 text-teal-600' /> Analitik
//                 Kategori & Omset
//               </h3>
//               <div className='flex items-center gap-3 bg-slate-50/80 p-2 rounded-xl border border-slate-100'>
//                 <Settings2 className='w-4 h-4 text-slate-400 ml-1' />
//                 <div className='flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2.5 py-1 shadow-sm'>
//                   <label className='text-[9px] font-bold text-slate-400 uppercase'>
//                     Min Y:
//                   </label>
//                   <input
//                     type='number'
//                     value={chartYMin}
//                     onChange={(e) => setChartYMin(e.target.value)}
//                     className='w-16 bg-transparent text-xs font-bold text-slate-700 outline-none'
//                     placeholder='Auto'
//                   />
//                 </div>
//                 <div className='flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2.5 py-1 shadow-sm'>
//                   <label className='text-[9px] font-bold text-slate-400 uppercase'>
//                     Max Y:
//                   </label>
//                   <input
//                     type='number'
//                     value={chartYMax}
//                     onChange={(e) => setChartYMax(e.target.value)}
//                     className='w-16 bg-transparent text-xs font-bold text-slate-700 outline-none'
//                     placeholder='Auto'
//                   />
//                 </div>
//               </div>
//             </div>

//             {chartData.length === 0 ? (
//               <div className='flex-1 flex items-center justify-center text-slate-400 text-sm font-medium'>
//                 Tidak ada data untuk ditampilkan
//               </div>
//             ) : (
//               <div className='flex-1 min-h-0'>
//                 <ResponsiveContainer
//                   width='100%'
//                   height='100%'>
//                   <ComposedChart
//                     data={chartData}
//                     margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
//                     <CartesianGrid
//                       strokeDasharray='3 3'
//                       vertical={false}
//                       stroke='#e2e8f0'
//                     />
//                     <XAxis
//                       dataKey='tanggal'
//                       axisLine={false}
//                       tickLine={false}
//                       tick={{ fontSize: 11, fill: '#64748b' }}
//                       dy={10}
//                     />
//                     <YAxis
//                       domain={yAxisDomain}
//                       allowDataOverflow={true}
//                       axisLine={false}
//                       tickLine={false}
//                       tick={{ fontSize: 11, fill: '#64748b' }}
//                       tickFormatter={formatYAxis}
//                       width={65}
//                     />
//                     <RechartsTooltip
//                       cursor={{ fill: '#f8fafc' }}
//                       contentStyle={{
//                         borderRadius: '12px',
//                         border: '1px solid #e2e8f0',
//                         boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
//                       }}
//                       formatter={(value: number) => formatRp(value)}
//                     />
//                     <Legend
//                       wrapperStyle={{
//                         paddingTop: '15px',
//                         fontSize: '12px',
//                         fontWeight: '600',
//                         color: '#475569',
//                       }}
//                       iconType='circle'
//                     />

//                     <Bar
//                       dataKey='Fitrah'
//                       name='Zakat Fitrah'
//                       fill='#0f766e'
//                       radius={[4, 4, 0, 0]}
//                       maxBarSize={30}
//                     />
//                     <Bar
//                       dataKey='Mal'
//                       name='Zakat Mal'
//                       fill='#0ea5e9'
//                       radius={[4, 4, 0, 0]}
//                       maxBarSize={30}
//                     />
//                     <Bar
//                       dataKey='Infaq'
//                       name='Infaq'
//                       fill='#6366f1'
//                       radius={[4, 4, 0, 0]}
//                       maxBarSize={30}
//                     />
//                     <Bar
//                       dataKey='Wakaf'
//                       name='Wakaf'
//                       fill='#8b5cf6'
//                       radius={[4, 4, 0, 0]}
//                       maxBarSize={30}
//                     />
//                     <Bar
//                       dataKey='Fidyah'
//                       name='Fidyah'
//                       fill='#64748b'
//                       radius={[4, 4, 0, 0]}
//                       maxBarSize={30}
//                     />

//                     <Line
//                       type='natural'
//                       dataKey='Total'
//                       name='Total Omset Harian'
//                       stroke='#f59e0b'
//                       strokeWidth={3}
//                       dot={{
//                         r: 4,
//                         strokeWidth: 2,
//                         fill: '#fff',
//                         stroke: '#f59e0b',
//                       }}
//                       activeDot={{ r: 7 }}
//                     />
//                   </ComposedChart>
//                 </ResponsiveContainer>
//               </div>
//             )}
//           </div>

//           {/* STICKY WRAPPER FILTER */}
//           <div className='sticky top-0 z-40 -mx-4 px-4 md:-mx-8 md:px-8 py-4 bg-[#f8fafc]/90 backdrop-blur-xl'>
//             <div className='bg-white p-3 md:p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col xl:flex-row gap-3 md:gap-4 justify-between items-center transition-all w-full'>
//               <div className='flex gap-2 overflow-x-auto w-full xl:flex-1 min-w-0 pb-1 xl:pb-0 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300/40 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400/60'>
//                 {['Semua', 'Menunggu', 'Diterima', 'Ditolak'].map((f) => {
//                   const count = counts[f as keyof typeof counts];
//                   return (
//                     <button
//                       key={f}
//                       onClick={() => setFilterStatus(f)}
//                       className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${filterStatus === f ? 'bg-teal-700 text-white border-teal-700 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-teal-700 hover:border-teal-200'}`}>
//                       {f}{' '}
//                       {count > 0 && (
//                         <sup className='ml-0.5 font-black opacity-80'>
//                           {count}
//                         </sup>
//                       )}
//                     </button>
//                   );
//                 })}
//               </div>

//               <div className='flex flex-row gap-3 w-full xl:w-auto shrink-0'>
//                 <div className='relative w-1/3 xl:w-40'>
//                   <Tag className='w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400' />
//                   <select
//                     value={filterKategori}
//                     onChange={(e) => setFilterKategori(e.target.value)}
//                     className='w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-xs font-bold text-slate-600 appearance-none cursor-pointer transition-all hover:bg-slate-100'>
//                     <option value='Semua'>Semua Kategori</option>
//                     <option value='Zakat Fitrah'>Zakat Fitrah</option>
//                     <option value='Zakat Mal'>Zakat Mal</option>
//                     <option value='Infaq'>Infaq</option>
//                     <option value='Wakaf'>Wakaf</option>
//                     <option value='Fidyah'>Fidyah</option>
//                   </select>
//                 </div>
//                 <div className='relative flex-1 xl:w-72'>
//                   <Search className='w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400' />
//                   <input
//                     type='text'
//                     placeholder='Cari Kode TRX / Nama...'
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className='w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-sm font-medium transition-all'
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* TABEL DATA (LEBAR & CLICKABLE) */}
//           <div className='bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden'>
//             <div className='overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
//               <table className='w-full text-left border-collapse min-w-[800px]'>
//                 <thead className='bg-slate-50/80 border-b border-slate-200'>
//                   <tr className='text-slate-500 text-[11px] uppercase tracking-wider'>
//                     <th className='p-4 font-bold'>Tanggal & TRX</th>
//                     <th className='p-4 font-bold'>Donatur</th>
//                     <th className='p-4 font-bold'>Kategori</th>
//                     <th className='p-4 font-bold text-right'>Nominal</th>
//                     <th className='p-4 font-bold text-center'>Status</th>
//                   </tr>
//                 </thead>
//                 <tbody className='divide-y divide-slate-100'>
//                   {isLoading ? (
//                     <tr>
//                       <td
//                         colSpan={5}
//                         className='p-12 text-center'>
//                         <Loader2 className='w-8 h-8 text-teal-600 animate-spin mx-auto' />
//                       </td>
//                     </tr>
//                   ) : filteredPesanan.length === 0 ? (
//                     <tr>
//                       <td
//                         colSpan={5}
//                         className='p-12 text-center text-slate-400 font-medium'>
//                         Tidak ada transaksi yang sesuai filter.
//                       </td>
//                     </tr>
//                   ) : (
//                     filteredPesanan.map((trx) => (
//                       <tr
//                         key={trx.id}
//                         onClick={() => setSelectedTrx(trx)}
//                         className='hover:bg-slate-50/50 transition-colors cursor-pointer group'>
//                         <td className='p-4'>
//                           <p className='font-bold text-teal-800 text-sm'>
//                             {trx.kode_trx}
//                           </p>
//                           <p className='text-[10px] font-medium text-slate-400 mt-1'>
//                             {new Date(trx.created_at).toLocaleString('id-ID', {
//                               day: 'numeric',
//                               month: 'short',
//                               year: 'numeric',
//                               hour: '2-digit',
//                               minute: '2-digit',
//                             })}
//                           </p>
//                         </td>
//                         <td className='p-4'>
//                           <p className='font-bold text-slate-800 text-sm group-hover:text-teal-600 transition-colors'>
//                             {maskNameStyle(trx.nama, trx.is_anonim)}
//                           </p>
//                           {trx.is_anonim && (
//                             <span className='text-[9px] bg-slate-100 text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded font-bold mt-1 inline-block'>
//                               Hamba Allah
//                             </span>
//                           )}
//                         </td>
//                         <td className='p-4'>
//                           <span className='text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200'>
//                             {trx.kategori}
//                           </span>
//                         </td>
//                         <td className='p-4 text-sm font-bold text-slate-800 text-right'>
//                           {formatRp(Number(trx.nominal))}
//                         </td>
//                         <td className='p-4 text-center'>
//                           <span
//                             className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold border
//                             ${
//                               formatStatusDisplay(trx.status_pesanan) ===
//                               'Diterima'
//                                 ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
//                                 : formatStatusDisplay(trx.status_pesanan) ===
//                                     'Ditolak'
//                                   ? 'bg-red-50 text-red-700 border-red-200'
//                                   : 'bg-amber-50 text-amber-700 border-amber-200'
//                             }`}>
//                             {formatStatusDisplay(trx.status_pesanan) ===
//                               'Menunggu' && (
//                               <Clock className='w-3.5 h-3.5 mr-1.5' />
//                             )}
//                             {formatStatusDisplay(trx.status_pesanan) ===
//                               'Diterima' && (
//                               <CheckCircle className='w-3.5 h-3.5 mr-1.5' />
//                             )}
//                             {formatStatusDisplay(trx.status_pesanan) ===
//                               'Ditolak' && (
//                               <XCircle className='w-3.5 h-3.5 mr-1.5' />
//                             )}
//                             {formatStatusDisplay(trx.status_pesanan)}
//                           </span>
//                         </td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* TOMBOL SCROLL TO TOP */}
//       <AnimatePresence>
//         {showScrollTop && (
//           <motion.button
//             initial={{ opacity: 0, scale: 0.8, y: 20 }}
//             animate={{ opacity: 1, scale: 1, y: 0 }}
//             exit={{ opacity: 0, scale: 0.8, y: 20 }}
//             onClick={scrollToTop}
//             className='fixed bottom-8 right-8 z-50 p-3.5 bg-teal-600 text-white rounded-full shadow-[0_10px_20px_rgba(15,118,110,0.3)] hover:bg-teal-700 hover:scale-110 hover:shadow-[0_10px_30px_rgba(15,118,110,0.5)] transition-all duration-300'>
//             <ChevronUp className='w-6 h-6' />
//           </motion.button>
//         )}
//       </AnimatePresence>

//       {/* MODAL DETAIL */}
//       <AnimatePresence>
//         {selectedTrx && (
//           <div className='fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
//             <motion.div
//               initial={{ opacity: 0, scale: 0.95, y: 20 }}
//               animate={{ opacity: 1, scale: 1, y: 0 }}
//               exit={{ opacity: 0, scale: 0.95, y: 20 }}
//               className='bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col my-8 max-h-[85vh]'>
//               <div className='p-5 border-b border-slate-100 bg-white flex justify-between items-center shrink-0'>
//                 <div>
//                   <h2 className='text-xl font-bold text-slate-800 flex items-center gap-2'>
//                     <Receipt className='w-5 h-5 text-teal-600' />{' '}
//                     {selectedTrx.kode_trx}
//                   </h2>
//                   <p className='text-[11px] font-medium text-slate-400 mt-1'>
//                     Tanggal Masuk:{' '}
//                     {new Date(selectedTrx.created_at).toLocaleString('id-ID', {
//                       dateStyle: 'full',
//                       timeStyle: 'short',
//                     })}
//                   </p>
//                 </div>
//                 <div className='text-right flex items-center gap-4'>
//                   <span
//                     className={`inline-flex items-center px-3 py-1 rounded-lg text-[11px] font-bold border
//                     ${
//                       formatStatusDisplay(selectedTrx.status_pesanan) ===
//                       'Diterima'
//                         ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
//                         : formatStatusDisplay(selectedTrx.status_pesanan) ===
//                             'Ditolak'
//                           ? 'bg-red-50 text-red-700 border-red-200'
//                           : 'bg-amber-50 text-amber-700 border-amber-200'
//                     }`}>
//                     {formatStatusDisplay(selectedTrx.status_pesanan)}
//                   </span>
//                   <button
//                     onClick={() => setSelectedTrx(null)}
//                     className='p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors'>
//                     <X className='w-5 h-5 text-slate-400' />
//                   </button>
//                 </div>
//               </div>

//               <div className='flex-1 overflow-y-auto p-5 md:p-6 space-y-6 bg-slate-50/30 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
//                 <div className='bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group'>
//                   <Wallet className='absolute -left-6 -bottom-6 w-32 h-32 text-slate-50 group-hover:scale-110 transition-transform duration-700 pointer-events-none' />
//                   <div className='relative z-10 space-y-4'>
//                     <div className='grid grid-cols-2 gap-4'>
//                       <div>
//                         <p className='text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1'>
//                           Nama Donatur
//                         </p>
//                         <p className='font-bold text-slate-800 text-sm'>
//                           {maskNameStyle(
//                             selectedTrx.nama,
//                             selectedTrx.is_anonim,
//                           )}
//                           {selectedTrx.is_anonim && (
//                             <span className='ml-2 text-[10px] bg-slate-100 text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded-md font-bold'>
//                               Hamba Allah
//                             </span>
//                           )}
//                         </p>
//                       </div>
//                       <div>
//                         <p className='text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1'>
//                           WhatsApp
//                         </p>
//                         <p className='font-semibold text-slate-700 text-sm'>
//                           {selectedTrx.whatsapp}
//                         </p>
//                       </div>
//                     </div>

//                     <div className='pt-4 border-t border-slate-100'>
//                       <p className='text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1'>
//                         Kategori ZISWAF
//                       </p>
//                       <p className='font-bold text-teal-700 text-sm mb-4'>
//                         {selectedTrx.kategori}
//                       </p>

//                       <div className='pt-4 border-t border-slate-100 flex justify-between items-center'>
//                         <p className='text-xs font-bold text-slate-500 uppercase tracking-wider'>
//                           Nominal Penyaluran
//                         </p>
//                         <p className='text-2xl font-black text-teal-700'>
//                           {formatRp(Number(selectedTrx.nominal))}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {selectedTrx.rincian_kalkulasi && (
//                   <div className='bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden group'>
//                     <Calculator className='absolute -right-4 -bottom-4 w-24 h-24 text-slate-50 group-hover:scale-110 transition-transform duration-700 pointer-events-none' />
//                     <div className='relative z-10'>
//                       <p className='text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center'>
//                         Dasar Kalkulasi Sistem
//                       </p>
//                       <p className='text-xs font-medium text-slate-600 leading-relaxed whitespace-pre-line'>
//                         {selectedTrx.rincian_kalkulasi}
//                       </p>
//                     </div>
//                   </div>
//                 )}

//                 {selectedTrx.pesan && (
//                   <div className='bg-amber-50 border border-amber-100 rounded-2xl p-5 shadow-sm relative overflow-hidden group'>
//                     <MessageSquare className='absolute -right-4 -bottom-4 w-24 h-24 text-amber-100/50 group-hover:scale-110 transition-transform duration-700 pointer-events-none' />
//                     <div className='relative z-10'>
//                       <p className='text-[10px] font-bold text-amber-600/70 uppercase tracking-wider mb-2'>
//                         Titipan Doa / Pesan
//                       </p>
//                       <p className='text-sm font-semibold text-amber-900 italic'>
//                         "{selectedTrx.pesan}"
//                       </p>
//                     </div>
//                   </div>
//                 )}

//                 {selectedTrx.bukti_transfer_url && (
//                   <div className='bg-slate-100/50 rounded-2xl p-4 border border-slate-200 flex flex-col justify-center items-center relative overflow-hidden group min-h-[250px]'>
//                     <ImageIcon className='absolute -right-4 -bottom-4 w-32 h-32 text-slate-200/50 group-hover:scale-110 transition-transform duration-700 pointer-events-none' />
//                     <p className='absolute top-4 left-4 bg-white/90 backdrop-blur text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 py-1 rounded-full shadow-sm z-10 border border-slate-100'>
//                       Bukti Transfer
//                     </p>
//                     <img
//                       src={selectedTrx.bukti_transfer_url}
//                       alt='Bukti Transfer'
//                       className='w-full max-h-[350px] object-contain rounded-xl shadow-sm relative z-10 group-hover:scale-[1.02] transition-transform duration-500'
//                     />
//                   </div>
//                 )}
//               </div>
//               <div className='p-5 border-t border-slate-100 bg-white flex justify-end shrink-0'>
//                 <button
//                   onClick={() => setSelectedTrx(null)}
//                   className='px-8 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors'>
//                   Tutup Detail
//                 </button>
//               </div>
//             </motion.div>
//           </div>
//         )}
//       </AnimatePresence>
//     </>
//   );
// }
//
//
//
'use client';

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Loader2,
  CheckCircle,
  XCircle,
  Download,
  Printer,
  Clock,
  Users,
  Wallet,
  Activity,
  Receipt,
  Calculator,
  MapPin,
  MessageSquare,
  Image as ImageIcon,
  Tag,
  X,
  Settings2,
  Box,
  ChevronUp,
} from 'lucide-react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

// ==========================================
// KOMPONEN: BLOK JENIS DRAGGABLE (ZISWAF VER.)
// ==========================================
const DraggableCategory = ({
  jenis,
  tipeData,
}: {
  jenis: string;
  tipeData: Record<string, { donatur: number; total: number }>;
}) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [dragWidth, setDragWidth] = useState(0);

  useEffect(() => {
    const updateWidth = () => {
      if (carouselRef.current) {
        setDragWidth(
          carouselRef.current.scrollWidth - carouselRef.current.offsetWidth,
        );
      }
    };
    updateWidth();
    setTimeout(updateWidth, 100);
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [tipeData]);

  const typeCount = Object.keys(tipeData).length;

  const formatRp = (angka: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(angka);

  return (
    <div
      className='bg-white p-4 md:p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col w-full xl:w-auto xl:flex-1 transition-all duration-500 overflow-hidden min-w-0'
      style={{ flexGrow: Math.max(1, typeCount) }}>
      <h3 className='text-xs font-bold text-slate-700 mb-4 flex items-center gap-2 uppercase tracking-wider shrink-0'>
        <Box className='w-4 h-4 text-teal-600' /> Kategori {jenis}
      </h3>

      <motion.div
        ref={carouselRef}
        className={`overflow-hidden pb-1 ${dragWidth > 0 ? 'cursor-grab active:cursor-grabbing' : ''}`}>
        <motion.div
          drag={dragWidth > 0 ? 'x' : false}
          dragConstraints={{ right: 0, left: dragWidth > 0 ? -dragWidth : 0 }}
          dragElastic={0.15}
          className='flex gap-3 min-w-full w-max'>
          {Object.entries(tipeData).map(([tipe, { donatur, total }]) => (
            <div
              key={tipe}
              className='flex-1 bg-slate-50 border border-slate-200 p-3.5 rounded-2xl min-w-[200px] relative overflow-hidden group hover:bg-teal-50/50 hover:border-teal-300 hover:shadow-md transition-all duration-300'>
              <Tag className='absolute -right-3 -bottom-3 w-16 h-16 text-slate-200/50 group-hover:scale-110 group-hover:text-teal-100 transition-transform duration-700 pointer-events-none' />
              <div className='relative z-10 flex items-start justify-between gap-3 pointer-events-none h-full flex-col'>
                <div className='flex items-start justify-between w-full'>
                  <div className='flex-1 min-w-0'>
                    <p
                      className='text-[10px] font-bold text-slate-400 uppercase tracking-wide truncate'
                      title={tipe}>
                      {tipe}
                    </p>
                    <p className='text-xs font-bold text-slate-600 mt-0.5'>
                      {donatur} Donatur
                    </p>
                  </div>
                  <div className='w-8 h-8 bg-white border border-slate-100 text-teal-600 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-teal-50 transition-colors'>
                    <Box className='w-4 h-4' />
                  </div>
                </div>
                <div className='mt-2'>
                  <p className='text-[10px] font-bold text-slate-400 uppercase tracking-wide'>
                    Terkumpul
                  </p>
                  <p
                    className='text-lg font-bold text-teal-700 truncate'
                    title={formatRp(total)}>
                    {formatRp(total)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

// ==========================================
// MAIN DASHBOARD COMPONENT
// ==========================================
export default function RiwayatPesananZiswaf() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [filterKategori, setFilterKategori] = useState('Semua');

  // Y-Axis Customization States
  const [chartYMin, setChartYMin] = useState('');
  const [chartYMax, setChartYMax] = useState('');

  const [selectedTrx, setSelectedTrx] = useState<any>(null);

  // SCROLL STATES
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const fetchRiwayat = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('transaksi_ziswaf')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) setTransactions(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchRiwayat();
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (e.currentTarget.scrollTop > 500) {
      setShowScrollTop(true);
    } else {
      setShowScrollTop(false);
    }
  };

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatRp = (angka: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(angka);

  const formatYAxis = (value: number) => {
    if (value >= 1000000000) return `Rp${(value / 1000000000).toFixed(1)}M`;
    if (value >= 1000000) return `Rp${(value / 1000000).toFixed(1)}Jt`;
    if (value >= 1000) return `Rp${(value / 1000).toFixed(0)}Rb`;
    return `Rp${value}`;
  };

  const formatStatusDisplay = (status: string) => {
    if (!status) return '';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  const maskNameStyle = (name: string, isAnon: boolean) => {
    if (isAnon) {
      return name
        .split(' ')
        .map((word) => {
          if (word.length <= 2) return word.charAt(0) + '*';
          return (
            word.charAt(0) +
            '*'.repeat(word.length - 2) +
            word.charAt(word.length - 1)
          );
        })
        .join(' ');
    }
    return name;
  };

  // 1. Filter Multi-parameter
  const listFilteredByKategoriAndSearch = useMemo(() => {
    return transactions.filter((p) => {
      const matchKategori =
        filterKategori === 'Semua' ||
        p.kategori?.toLowerCase().includes(filterKategori.toLowerCase());
      const matchSearch =
        p.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.kode_trx?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchKategori && matchSearch;
    });
  }, [transactions, filterKategori, searchTerm]);

  const filteredPesanan = useMemo(() => {
    return listFilteredByKategoriAndSearch.filter((p) => {
      const statusDisplay = formatStatusDisplay(p.status_pesanan);
      return filterStatus === 'Semua' || statusDisplay === filterStatus;
    });
  }, [listFilteredByKategoriAndSearch, filterStatus]);

  const getSortedData = () => {
    return [...filteredPesanan].sort((a, b) => {
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
  };

  // EXPORT EXCEL
  const handleExportExcel = () => {
    const sortedData = getSortedData();
    if (sortedData.length === 0) return alert('Tidak ada data untuk diexport');
    const dataToExport = sortedData.map((p) => ({
      Tanggal: new Date(p.created_at).toLocaleString('id-ID'),
      'Kode TRX': p.kode_trx,
      'Nama Donatur': maskNameStyle(p.nama, p.is_anonim),
      Kategori: p.kategori,
      Nominal: Number(p.nominal),
      Status: formatStatusDisplay(p.status_pesanan),
      'Pesan / Doa': p.pesan || '-',
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data_ZISWAF');
    XLSX.writeFile(workbook, `Data_ZISWAF_MNI_${new Date().getTime()}.xlsx`);
  };

  // CETAK PDF
  const handlePrintPDF = () => {
    const sortedData = getSortedData();
    if (sortedData.length === 0) return alert('Tidak ada data untuk dicetak');
    const doc = new jsPDF('p', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFont('times', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text('Laporan Penerimaan ZISWAF MNI', pageWidth / 2, 40, {
      align: 'center',
    });

    doc.setFont('times', 'normal');
    doc.setFontSize(10);
    doc.text(
      `Dicetak pada: ${new Date().toLocaleString('id-ID')}`,
      pageWidth / 2,
      55,
      { align: 'center' },
    );

    const tableBody = sortedData.map((p) => [
      `${new Date(p.created_at).toLocaleDateString('id-ID')} - ${p.kode_trx}`,
      maskNameStyle(p.nama, p.is_anonim),
      p.kategori,
      formatRp(Number(p.nominal)),
    ]);

    autoTable(doc, {
      startY: 75,
      head: [['Tanggal & TRX', 'Nama Donatur', 'Kategori', 'Nominal']],
      body: tableBody,
      theme: 'grid',
      headStyles: {
        font: 'times',
        fillColor: [15, 118, 110],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 14,
      },
      styles: {
        font: 'times',
        textColor: [0, 0, 0],
        fontSize: 12,
        cellPadding: 4,
      },
      columnStyles: {
        0: { cellWidth: 120 },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 110 },
        3: { cellWidth: 110, halign: 'right' },
      },
    });
    doc.save(`Laporan_ZISWAF_MNI_${new Date().getTime()}.pdf`);
  };

  const counts = useMemo(
    () => ({
      Semua: listFilteredByKategoriAndSearch.length,
      Menunggu: listFilteredByKategoriAndSearch.filter(
        (t) => formatStatusDisplay(t.status_pesanan) === 'Menunggu',
      ).length,
      Diterima: listFilteredByKategoriAndSearch.filter(
        (t) => formatStatusDisplay(t.status_pesanan) === 'Diterima',
      ).length,
      Ditolak: listFilteredByKategoriAndSearch.filter(
        (t) => formatStatusDisplay(t.status_pesanan) === 'Ditolak',
      ).length,
    }),
    [listFilteredByKategoriAndSearch],
  );

  const metrics = useMemo(() => {
    const diterimaData = listFilteredByKategoriAndSearch.filter(
      (p) => formatStatusDisplay(p.status_pesanan) === 'Diterima',
    );
    const menungguData = listFilteredByKategoriAndSearch.filter(
      (p) => formatStatusDisplay(p.status_pesanan) === 'Menunggu',
    );

    return {
      totalTransaksi: listFilteredByKategoriAndSearch.length,
      totalDonatur: new Set(
        listFilteredByKategoriAndSearch.map((p) => p.whatsapp),
      ).size,
      danaDiterima: diterimaData.reduce((sum, p) => sum + Number(p.nominal), 0),
      danaMenunggu: menungguData.reduce((sum, p) => sum + Number(p.nominal), 0),
    };
  }, [listFilteredByKategoriAndSearch]);

  // PENGUMPULAN DATA STATISTIK KATEGORI ZISWAF UNTUK BLOK DRAGGABLE
  const kategoriStats = useMemo(() => {
    const stats: Record<
      string,
      Record<string, { donatur: number; total: number }>
    > = {};

    listFilteredByKategoriAndSearch.forEach((p) => {
      if (formatStatusDisplay(p.status_pesanan) === 'Ditolak') return;

      const nominal = Number(p.nominal) || 0;
      let jenis = 'Lainnya';
      let tipe = p.kategori || 'Tidak Diketahui';

      const katLow = p.kategori?.toLowerCase() || '';

      // Tentukan Induk Jenis Ziswaf
      if (katLow.includes('fitrah')) jenis = 'Zakat Fitrah';
      else if (katLow.includes('mal') || katLow.includes('maal'))
        jenis = 'Zakat Mal';
      else if (katLow.includes('infaq')) jenis = 'Infaq';
      else if (katLow.includes('wakaf')) jenis = 'Wakaf';
      else if (katLow.includes('fidyah')) jenis = 'Fidyah';
      else jenis = 'Lainnya';

      if (!stats[jenis]) stats[jenis] = {};
      if (!stats[jenis][tipe]) stats[jenis][tipe] = { donatur: 0, total: 0 };

      stats[jenis][tipe].donatur += 1;
      stats[jenis][tipe].total += nominal;
    });

    return stats;
  }, [listFilteredByKategoriAndSearch]);

  const chartData = useMemo(() => {
    const dataMap: Record<string, any> = {};

    listFilteredByKategoriAndSearch.forEach((p) => {
      if (formatStatusDisplay(p.status_pesanan) === 'Ditolak') return;

      const dateObj = new Date(p.created_at);
      const dateStr = dateObj.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
      });

      if (!dataMap[dateStr]) {
        dataMap[dateStr] = {
          tanggal: dateStr,
          Fitrah: 0,
          Mal: 0,
          Infaq: 0,
          Wakaf: 0,
          Fidyah: 0,
          Total: 0,
        };
      }

      const nominal = Number(p.nominal) || 0;
      const kat = p.kategori?.toLowerCase() || '';

      if (kat.includes('fitrah')) dataMap[dateStr].Fitrah += nominal;
      else if (kat.includes('mal')) dataMap[dateStr].Mal += nominal;
      else if (kat.includes('infaq')) dataMap[dateStr].Infaq += nominal;
      else if (kat.includes('wakaf')) dataMap[dateStr].Wakaf += nominal;
      else if (kat.includes('fidyah')) dataMap[dateStr].Fidyah += nominal;

      dataMap[dateStr].Total += nominal;
    });

    return Object.values(dataMap).reverse();
  }, [listFilteredByKategoriAndSearch]);

  const yAxisDomain = useMemo(() => {
    const min = chartYMin !== '' ? Number(chartYMin) : 'auto';
    const max = chartYMax !== '' ? Number(chartYMax) : 'auto';
    return [min, max];
  }, [chartYMin, chartYMax]);

  // Ekstraksi untuk Layout Row 1 & Row 2
  const row1Keys = ['Zakat Mal', 'Zakat Fitrah'];
  const row1Entries = Object.entries(kategoriStats)
    .filter(([jenis]) => row1Keys.includes(jenis))
    .sort(([a], [b]) => a.localeCompare(b)); // Biar Mal & Fitrah terurut rapi

  const row2Entries = Object.entries(kategoriStats).filter(
    ([jenis]) => !row1Keys.includes(jenis),
  );

  return (
    <>
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className='w-full max-w-[1600px] mx-auto animate-in fade-in h-[calc(100vh-4rem)] overflow-y-auto relative bg-[#f8fafc] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400'>
        <div className='p-4 md:p-8 space-y-8'>
          {/* HEADER UTAMA & BUTTONS */}
          <div className='shrink-0 flex flex-col md:flex-row md:items-start justify-between gap-6'>
            <div>
              <h1 className='text-2xl font-semibold text-slate-800 tracking-tight'>
                Riwayat & Analitik Ziswaf
              </h1>
              <p className='text-slate-500 mt-1 font-medium'>
                Pantau lalu lintas dana, donatur, dan cetak laporan
                rekapitulasi.
              </p>
            </div>

            <div className='flex flex-row gap-4 w-full md:w-auto'>
              <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExportExcel}
                className='flex-1 md:flex-none flex items-center justify-center gap-3 bg-emerald-600 text-white border-2 border-emerald-600 px-6 py-3 rounded-2xl font-bold shadow-md hover:bg-white hover:text-emerald-600 transition-all duration-300 relative overflow-hidden group'>
                <Download className='w-5 h-5 relative z-10' />
                <span className='relative z-10'>Excel</span>
                <Download className='absolute -right-2 -bottom-2 w-14 h-14 text-white/10 group-hover:text-emerald-500/10 transition-transform duration-700 pointer-events-none' />
              </motion.button>

              <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePrintPDF}
                className='flex-1 md:flex-none flex items-center justify-center gap-3 bg-slate-800 text-white border-2 border-slate-800 px-6 py-3 rounded-2xl font-bold shadow-md hover:bg-white hover:text-slate-800 transition-all duration-300 relative overflow-hidden group'>
                <Printer className='w-5 h-5 relative z-10' />
                <span className='relative z-10 whitespace-nowrap'>
                  Cetak PDF
                </span>
                <Printer className='absolute -right-2 -bottom-2 w-14 h-14 text-white/10 group-hover:text-slate-500/10 transition-transform duration-700 pointer-events-none' />
              </motion.button>
            </div>
          </div>

          {/* KPI CARDS */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5'>
            <div className='bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-teal-300 hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden cursor-default'>
              <Receipt className='absolute -right-4 -bottom-4 w-24 h-24 text-slate-50 group-hover:scale-110 transition-transform duration-700 pointer-events-none' />
              <div className='w-12 h-12 bg-slate-50 border border-slate-100 text-teal-700 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-teal-50 transition-colors relative z-10'>
                <Receipt className='w-5 h-5' />
              </div>
              <div className='relative z-10 w-full'>
                <p className='text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5'>
                  Total Transaksi
                </p>
                <p className='text-xl font-bold text-slate-800'>
                  {metrics.totalTransaksi}
                </p>
              </div>
            </div>

            <div className='bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-teal-300 hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden cursor-default'>
              <Users className='absolute -right-4 -bottom-4 w-24 h-24 text-slate-50 group-hover:scale-110 transition-transform duration-700 pointer-events-none' />
              <div className='w-12 h-12 bg-slate-50 border border-slate-100 text-teal-700 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-teal-50 transition-colors relative z-10'>
                <Users className='w-5 h-5' />
              </div>
              <div className='relative z-10 w-full'>
                <p className='text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5'>
                  Donatur Unik
                </p>
                <p className='text-xl font-bold text-slate-800'>
                  {metrics.totalDonatur}
                </p>
              </div>
            </div>

            <div className='bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-teal-300 hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden cursor-default'>
              <Wallet className='absolute -right-4 -bottom-4 w-24 h-24 text-teal-50/50 group-hover:scale-110 transition-transform duration-700 pointer-events-none' />
              <div className='w-12 h-12 bg-slate-50 border border-slate-100 text-teal-700 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-teal-50 transition-colors relative z-10'>
                <Wallet className='w-5 h-5' />
              </div>
              <div className='relative z-10 w-full overflow-hidden'>
                <p className='text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5'>
                  Dana Diterima
                </p>
                <div
                  className='w-full overflow-hidden whitespace-nowrap relative'
                  style={{
                    maskImage:
                      'linear-gradient(to right, black 85%, transparent 100%)',
                    WebkitMaskImage:
                      'linear-gradient(to right, black 85%, transparent 100%)',
                  }}>
                  <motion.div
                    animate={{ x: ['0%', '-50%'] }}
                    transition={{
                      ease: 'linear',
                      duration: 8,
                      repeat: Infinity,
                    }}
                    className='flex w-max'>
                    <p className='text-xl font-bold text-teal-700 pr-10'>
                      {formatRp(metrics.danaDiterima)}
                    </p>
                    <p className='text-xl font-bold text-teal-700 pr-10'>
                      {formatRp(metrics.danaDiterima)}
                    </p>
                  </motion.div>
                </div>
              </div>
            </div>

            <div className='bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-teal-300 hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden cursor-default'>
              <Clock className='absolute -right-4 -bottom-4 w-24 h-24 text-slate-50 group-hover:scale-110 transition-transform duration-700 pointer-events-none' />
              <div className='w-12 h-12 bg-slate-50 border border-slate-100 text-slate-500 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-slate-100 transition-colors relative z-10'>
                <Clock className='w-5 h-5' />
              </div>
              <div className='relative z-10 w-full overflow-hidden'>
                <p className='text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5'>
                  Menunggu Verifikasi
                </p>
                <div
                  className='w-full overflow-hidden whitespace-nowrap relative'
                  style={{
                    maskImage:
                      'linear-gradient(to right, black 85%, transparent 100%)',
                    WebkitMaskImage:
                      'linear-gradient(to right, black 85%, transparent 100%)',
                  }}>
                  <motion.div
                    animate={{ x: ['0%', '-50%'] }}
                    transition={{
                      ease: 'linear',
                      duration: 10,
                      repeat: Infinity,
                    }}
                    className='flex w-max'>
                    <p className='text-xl font-bold text-slate-600 pr-10'>
                      {formatRp(metrics.danaMenunggu)}
                    </p>
                    <p className='text-xl font-bold text-slate-600 pr-10'>
                      {formatRp(metrics.danaMenunggu)}
                    </p>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>

          {/* METRIK CARD KATEGORI ZISWAF (MULTI-ROW LAYOUT) */}
          {Object.keys(kategoriStats).length > 0 && (
            <div className='flex flex-col gap-5'>
              {/* Baris 1: Zakat Mal & Zakat Fitrah */}
              {row1Entries.length > 0 && (
                <div className='flex flex-col xl:flex-row gap-5 w-full'>
                  {row1Entries.map(([jenis, tipeData]) => (
                    <DraggableCategory
                      key={jenis}
                      jenis={jenis}
                      tipeData={tipeData}
                    />
                  ))}
                </div>
              )}

              {/* Baris 2: Sisanya (Infaq, Wakaf, Fidyah, dll) */}
              {row2Entries.length > 0 && (
                <div className='flex flex-col xl:flex-row flex-wrap gap-5 w-full'>
                  {row2Entries.map(([jenis, tipeData]) => (
                    <DraggableCategory
                      key={jenis}
                      jenis={jenis}
                      tipeData={tipeData}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* COMPOSED CHART ANALITIK */}
          <div className='bg-white p-6 rounded-3xl shadow-sm border border-slate-200 h-[400px] flex flex-col mb-4'>
            <div className='flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4'>
              <h3 className='text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center shrink-0'>
                <Activity className='w-4 h-4 mr-2 text-teal-600' /> Analitik
                Kategori & Omset
              </h3>
              <div className='flex items-center gap-3 bg-slate-50/80 p-2 rounded-xl border border-slate-100'>
                <Settings2 className='w-4 h-4 text-slate-400 ml-1' />
                <div className='flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2.5 py-1 shadow-sm'>
                  <label className='text-[9px] font-bold text-slate-400 uppercase'>
                    Min Y:
                  </label>
                  <input
                    type='number'
                    value={chartYMin}
                    onChange={(e) => setChartYMin(e.target.value)}
                    className='w-16 bg-transparent text-xs font-bold text-slate-700 outline-none'
                    placeholder='Auto'
                  />
                </div>
                <div className='flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2.5 py-1 shadow-sm'>
                  <label className='text-[9px] font-bold text-slate-400 uppercase'>
                    Max Y:
                  </label>
                  <input
                    type='number'
                    value={chartYMax}
                    onChange={(e) => setChartYMax(e.target.value)}
                    className='w-16 bg-transparent text-xs font-bold text-slate-700 outline-none'
                    placeholder='Auto'
                  />
                </div>
              </div>
            </div>

            {chartData.length === 0 ? (
              <div className='flex-1 flex items-center justify-center text-slate-400 text-sm font-medium'>
                Tidak ada data untuk ditampilkan
              </div>
            ) : (
              <div className='flex-1 min-h-0'>
                <ResponsiveContainer
                  width='100%'
                  height='100%'>
                  <ComposedChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid
                      strokeDasharray='3 3'
                      vertical={false}
                      stroke='#e2e8f0'
                    />
                    <XAxis
                      dataKey='tanggal'
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      dy={10}
                    />
                    <YAxis
                      domain={yAxisDomain}
                      allowDataOverflow={true}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      tickFormatter={formatYAxis}
                      width={65}
                    />
                    <RechartsTooltip
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                      formatter={(value: number) => formatRp(value)}
                    />
                    <Legend
                      wrapperStyle={{
                        paddingTop: '15px',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#475569',
                      }}
                      iconType='circle'
                    />

                    <Bar
                      dataKey='Fitrah'
                      name='Zakat Fitrah'
                      fill='#0f766e'
                      radius={[4, 4, 0, 0]}
                      maxBarSize={30}
                    />
                    <Bar
                      dataKey='Mal'
                      name='Zakat Mal'
                      fill='#0ea5e9'
                      radius={[4, 4, 0, 0]}
                      maxBarSize={30}
                    />
                    <Bar
                      dataKey='Infaq'
                      name='Infaq'
                      fill='#6366f1'
                      radius={[4, 4, 0, 0]}
                      maxBarSize={30}
                    />
                    <Bar
                      dataKey='Wakaf'
                      name='Wakaf'
                      fill='#8b5cf6'
                      radius={[4, 4, 0, 0]}
                      maxBarSize={30}
                    />
                    <Bar
                      dataKey='Fidyah'
                      name='Fidyah'
                      fill='#64748b'
                      radius={[4, 4, 0, 0]}
                      maxBarSize={30}
                    />

                    <Line
                      type='natural'
                      dataKey='Total'
                      name='Total Omset Harian'
                      stroke='#f59e0b'
                      strokeWidth={3}
                      dot={{
                        r: 4,
                        strokeWidth: 2,
                        fill: '#fff',
                        stroke: '#f59e0b',
                      }}
                      activeDot={{ r: 7 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* STICKY WRAPPER FILTER */}
          <div className='sticky top-0 z-40 -mx-4 px-4 md:-mx-8 md:px-8 py-4 bg-[#f8fafc]/90 backdrop-blur-xl'>
            <div className='bg-white p-3 md:p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col xl:flex-row gap-3 md:gap-4 justify-between items-center transition-all w-full'>
              <div className='flex gap-2 overflow-x-auto w-full xl:flex-1 min-w-0 pb-1 xl:pb-0 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300/40 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400/60'>
                {['Semua', 'Menunggu', 'Diterima', 'Ditolak'].map((f) => {
                  const count = counts[f as keyof typeof counts];
                  return (
                    <button
                      key={f}
                      onClick={() => setFilterStatus(f)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${filterStatus === f ? 'bg-teal-700 text-white border-teal-700 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-teal-700 hover:border-teal-200'}`}>
                      {f}{' '}
                      {count > 0 && (
                        <sup className='ml-0.5 font-black opacity-80'>
                          {count}
                        </sup>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className='flex flex-row gap-3 w-full xl:w-auto shrink-0'>
                <div className='relative w-1/3 xl:w-40'>
                  <Tag className='w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400' />
                  <select
                    value={filterKategori}
                    onChange={(e) => setFilterKategori(e.target.value)}
                    className='w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-xs font-bold text-slate-600 appearance-none cursor-pointer transition-all hover:bg-slate-100'>
                    <option value='Semua'>Semua Kategori</option>
                    <option value='Zakat Fitrah'>Zakat Fitrah</option>
                    <option value='Zakat Mal'>Zakat Mal</option>
                    <option value='Infaq'>Infaq</option>
                    <option value='Wakaf'>Wakaf</option>
                    <option value='Fidyah'>Fidyah</option>
                  </select>
                </div>
                <div className='relative flex-1 xl:w-72'>
                  <Search className='w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400' />
                  <input
                    type='text'
                    placeholder='Cari Kode TRX / Nama...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-sm font-medium transition-all'
                  />
                </div>
              </div>
            </div>
          </div>

          {/* TABEL DATA */}
          <div className='bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden'>
            <div className='overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
              <table className='w-full text-left border-collapse min-w-[800px]'>
                <thead className='bg-slate-50/80 border-b border-slate-200'>
                  <tr className='text-slate-500 text-[11px] uppercase tracking-wider'>
                    <th className='p-4 font-bold'>Tanggal & TRX</th>
                    <th className='p-4 font-bold'>Donatur</th>
                    <th className='p-4 font-bold'>Kategori</th>
                    <th className='p-4 font-bold text-right'>Nominal</th>
                    <th className='p-4 font-bold text-center'>Status</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-slate-100'>
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={5}
                        className='p-12 text-center'>
                        <Loader2 className='w-8 h-8 text-teal-600 animate-spin mx-auto' />
                      </td>
                    </tr>
                  ) : filteredPesanan.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className='p-12 text-center text-slate-400 font-medium'>
                        Tidak ada transaksi yang sesuai filter.
                      </td>
                    </tr>
                  ) : (
                    filteredPesanan.map((trx) => (
                      <tr
                        key={trx.id}
                        onClick={() => setSelectedTrx(trx)}
                        className='hover:bg-slate-50/50 transition-colors cursor-pointer group'>
                        <td className='p-4'>
                          <p className='font-bold text-teal-800 text-sm'>
                            {trx.kode_trx}
                          </p>
                          <p className='text-[10px] font-medium text-slate-400 mt-1'>
                            {new Date(trx.created_at).toLocaleString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </td>
                        <td className='p-4'>
                          <p className='font-bold text-slate-800 text-sm group-hover:text-teal-600 transition-colors'>
                            {maskNameStyle(trx.nama, trx.is_anonim)}
                          </p>
                          {trx.is_anonim && (
                            <span className='text-[9px] bg-slate-100 text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded font-bold mt-1 inline-block'>
                              Hamba Allah
                            </span>
                          )}
                        </td>
                        <td className='p-4'>
                          <span className='text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200'>
                            {trx.kategori}
                          </span>
                        </td>
                        <td className='p-4 text-sm font-bold text-slate-800 text-right'>
                          {formatRp(Number(trx.nominal))}
                        </td>
                        <td className='p-4 text-center'>
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold border 
                            ${
                              formatStatusDisplay(trx.status_pesanan) ===
                              'Diterima'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : formatStatusDisplay(trx.status_pesanan) ===
                                    'Ditolak'
                                  ? 'bg-red-50 text-red-700 border-red-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                            {formatStatusDisplay(trx.status_pesanan) ===
                              'Menunggu' && (
                              <Clock className='w-3.5 h-3.5 mr-1.5' />
                            )}
                            {formatStatusDisplay(trx.status_pesanan) ===
                              'Diterima' && (
                              <CheckCircle className='w-3.5 h-3.5 mr-1.5' />
                            )}
                            {formatStatusDisplay(trx.status_pesanan) ===
                              'Ditolak' && (
                              <XCircle className='w-3.5 h-3.5 mr-1.5' />
                            )}
                            {formatStatusDisplay(trx.status_pesanan)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* TOMBOL SCROLL TO TOP */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={scrollToTop}
            className='fixed bottom-8 right-8 z-50 p-3.5 bg-teal-600 text-white rounded-full shadow-[0_10px_20px_rgba(15,118,110,0.3)] hover:bg-teal-700 hover:scale-110 hover:shadow-[0_10px_30px_rgba(15,118,110,0.5)] transition-all duration-300'>
            <ChevronUp className='w-6 h-6' />
          </motion.button>
        )}
      </AnimatePresence>

      {/* MODAL DETAIL */}
      <AnimatePresence>
        {selectedTrx && (
          <div className='fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className='bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col my-8 max-h-[85vh]'>
              <div className='p-5 border-b border-slate-100 bg-white flex justify-between items-center shrink-0'>
                <div>
                  <h2 className='text-xl font-bold text-slate-800 flex items-center gap-2'>
                    <Receipt className='w-5 h-5 text-teal-600' />{' '}
                    {selectedTrx.kode_trx}
                  </h2>
                  <p className='text-[11px] font-medium text-slate-400 mt-1'>
                    Tanggal Masuk:{' '}
                    {new Date(selectedTrx.created_at).toLocaleString('id-ID', {
                      dateStyle: 'full',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
                <div className='text-right flex items-center gap-4'>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-lg text-[11px] font-bold border 
                    ${
                      formatStatusDisplay(selectedTrx.status_pesanan) ===
                      'Diterima'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : formatStatusDisplay(selectedTrx.status_pesanan) ===
                            'Ditolak'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                    {formatStatusDisplay(selectedTrx.status_pesanan)}
                  </span>
                  <button
                    onClick={() => setSelectedTrx(null)}
                    className='p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors'>
                    <X className='w-5 h-5 text-slate-400' />
                  </button>
                </div>
              </div>

              <div className='flex-1 overflow-y-auto p-5 md:p-6 space-y-6 bg-slate-50/30 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
                <div className='bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group'>
                  <Wallet className='absolute -left-6 -bottom-6 w-32 h-32 text-slate-50 group-hover:scale-110 transition-transform duration-700 pointer-events-none' />
                  <div className='relative z-10 space-y-4'>
                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <p className='text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1'>
                          Nama Donatur
                        </p>
                        <p className='font-bold text-slate-800 text-sm'>
                          {maskNameStyle(
                            selectedTrx.nama,
                            selectedTrx.is_anonim,
                          )}
                          {selectedTrx.is_anonim && (
                            <span className='ml-2 text-[10px] bg-slate-100 text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded-md font-bold'>
                              Hamba Allah
                            </span>
                          )}
                        </p>
                      </div>
                      <div>
                        <p className='text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1'>
                          WhatsApp
                        </p>
                        <p className='font-semibold text-slate-700 text-sm'>
                          {selectedTrx.whatsapp}
                        </p>
                      </div>
                    </div>

                    <div className='pt-4 border-t border-slate-100'>
                      <p className='text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1'>
                        Kategori ZISWAF
                      </p>
                      <p className='font-bold text-teal-700 text-sm mb-4'>
                        {selectedTrx.kategori}
                      </p>

                      <div className='pt-4 border-t border-slate-100 flex justify-between items-center'>
                        <p className='text-xs font-bold text-slate-500 uppercase tracking-wider'>
                          Nominal Penyaluran
                        </p>
                        <p className='text-2xl font-black text-teal-700'>
                          {formatRp(Number(selectedTrx.nominal))}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedTrx.rincian_kalkulasi && (
                  <div className='bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden group'>
                    <Calculator className='absolute -right-4 -bottom-4 w-24 h-24 text-slate-50 group-hover:scale-110 transition-transform duration-700 pointer-events-none' />
                    <div className='relative z-10'>
                      <p className='text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center'>
                        Dasar Kalkulasi Sistem
                      </p>
                      <p className='text-xs font-medium text-slate-600 leading-relaxed whitespace-pre-line'>
                        {selectedTrx.rincian_kalkulasi}
                      </p>
                    </div>
                  </div>
                )}

                {selectedTrx.pesan && (
                  <div className='bg-amber-50 border border-amber-100 rounded-2xl p-5 shadow-sm relative overflow-hidden group'>
                    <MessageSquare className='absolute -right-4 -bottom-4 w-24 h-24 text-amber-100/50 group-hover:scale-110 transition-transform duration-700 pointer-events-none' />
                    <div className='relative z-10'>
                      <p className='text-[10px] font-bold text-amber-600/70 uppercase tracking-wider mb-2'>
                        Titipan Doa / Pesan
                      </p>
                      <p className='text-sm font-semibold text-amber-900 italic'>
                        "{selectedTrx.pesan}"
                      </p>
                    </div>
                  </div>
                )}

                {selectedTrx.bukti_transfer_url && (
                  <div className='bg-slate-100/50 rounded-2xl p-4 border border-slate-200 flex flex-col justify-center items-center relative overflow-hidden group min-h-[250px]'>
                    <ImageIcon className='absolute -right-4 -bottom-4 w-32 h-32 text-slate-200/50 group-hover:scale-110 transition-transform duration-700 pointer-events-none' />
                    <p className='absolute top-4 left-4 bg-white/90 backdrop-blur text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 py-1 rounded-full shadow-sm z-10 border border-slate-100'>
                      Bukti Transfer
                    </p>
                    <img
                      src={selectedTrx.bukti_transfer_url}
                      alt='Bukti Transfer'
                      className='w-full max-h-[350px] object-contain rounded-xl shadow-sm relative z-10 group-hover:scale-[1.02] transition-transform duration-500'
                    />
                  </div>
                )}
              </div>
              <div className='p-5 border-t border-slate-100 bg-white flex justify-end shrink-0'>
                <button
                  onClick={() => setSelectedTrx(null)}
                  className='px-8 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors'>
                  Tutup Detail
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
