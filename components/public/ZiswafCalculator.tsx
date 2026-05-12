// 'use client';

// import React, { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//   Calculator,
//   Heart,
//   Wallet,
//   Wheat,
//   Coins,
//   Info,
//   CheckCircle2,
//   AlertCircle,
//   ShoppingBag,
//   Scale,
//   X,
//   Building2,
//   Trees,
//   Users,
//   UploadCloud,
//   User,
//   Phone,
//   Mail,
//   MessageSquare,
//   Loader2,
//   ShieldCheck,
// } from 'lucide-react';
// import { supabase } from '../../lib/supabase'; // Sesuaikan path Supabase Anda

// export default function ZiswafCalculator({
//   data,
//   wakafList,
//   isEditor = false,
// }: any) {
//   const fadeInUp = {
//     hidden: { opacity: 0, y: 30 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       transition: { duration: 0.6, ease: 'easeOut' },
//     },
//   };
//   const staggerContainer = {
//     hidden: { opacity: 0 },
//     visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
//   };

//   const [currentDate, setCurrentDate] = useState('');
//   useEffect(() => {
//     setCurrentDate(
//       new Date().toLocaleDateString('id-ID', {
//         day: 'numeric',
//         month: 'long',
//         year: 'numeric',
//       }),
//     );
//   }, []);

//   // ================= STATE HARGA DINAMIS (DARI CMS) =================
//   const [isFetchingPrices, setIsFetchingPrices] = useState(true);
//   const [harga, setHarga] = useState({
//     emas: 1350000,
//     perak: 15000,
//     berasFitrah: 45000,
//     fidyah: 40000,
//     berasTani: 16500,
//     gabahTani: 7500,
//     hewan: {
//       kambing: 3000000,
//       tabi: 12000000,
//       musinnah: 17000000,
//       bintu_makhad: 25000000,
//       bintu_labun: 35000000,
//       hiqqah: 45000000,
//       jadzah: 55000000,
//     },
//   });

//   // Ketetapan Syariat (Statis)
//   const NISAB_EMAS_GRAM = 77.5;
//   const NISAB_PERAK_GRAM = 543.35;

//   // Nilai Rupiah Dinamis
//   const NISAB_EMAS_RP = NISAB_EMAS_GRAM * harga.emas;
//   const NISAB_PERAK_RP = NISAB_PERAK_GRAM * harga.perak;

//   useEffect(() => {
//     const fetchHargaKatalog = async () => {
//       try {
//         const { data, error } = await supabase
//           .from('ziswaf')
//           .select('*')
//           .eq('id', 1)
//           .single();
//         if (data && !error) {
//           setHarga({
//             emas: data.harga_emas,
//             perak: data.harga_perak,
//             berasFitrah: data.harga_beras_fitrah,
//             fidyah: data.harga_fidyah,
//             berasTani: data.harga_beras_tani,
//             gabahTani: data.harga_gabah_tani,
//             hewan: {
//               kambing: data.harga_kambing,
//               tabi: data.harga_sapi_tabi,
//               musinnah: data.harga_sapi_musinnah,
//               bintu_makhad: data.harga_unta_bintu_makhad,
//               bintu_labun: data.harga_unta_bintu_labun,
//               hiqqah: data.harga_unta_hiqqah,
//               jadzah: data.harga_unta_jadzah,
//             },
//           });
//         }
//       } catch (err) {
//         console.error('Gagal memuat harga ziswaf dari database', err);
//       } finally {
//         setIsFetchingPrices(false);
//       }
//     };
//     fetchHargaKatalog();
//   }, []);

//   const defaultWakafList = [
//     {
//       id: 1,
//       judul: 'Penggantian Atap Masjid',
//       deskripsi:
//         'Peremajaan struktur atap dan kubah masjid yang sudah termakan usia.',
//       target: 250000000,
//       terkumpul: 120000000,
//       gambar_url:
//         'https://images.unsplash.com/photo-1552858725-2758b5fb1286?auto=format&fit=crop&q=80',
//     },
//     {
//       id: 2,
//       judul: 'Pengadaan Kusen & Pintu Jati',
//       deskripsi:
//         'Penggantian kusen dan pintu utama masjid menggunakan kayu jati berkualitas.',
//       target: 85000000,
//       terkumpul: 15000000,
//       gambar_url:
//         'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&q=80',
//     },
//   ];
//   const safeWakafList =
//     Array.isArray(wakafList) && wakafList.length > 0
//       ? wakafList
//       : defaultWakafList;

//   const [activeTab, setActiveTab] = useState('Zakat Fitrah');
//   const malCategories = [
//     'Profesi',
//     'Emas, Perak & Perhiasan',
//     'Perdagangan',
//     'Peternakan',
//     "Zakat An'am",
//     'Tanaman Produktif',
//     'Pertanian',
//     'Perusahaan',
//     'Properti',
//   ];
//   const [activeMalTab, setActiveMalTab] = useState('Profesi');

//   const [jiwa, setJiwa] = useState<string>('');
//   const [showFitrahInfo, setShowFitrahInfo] = useState(false);
//   const [hariFidyah, setHariFidyah] = useState<string>('');

//   const [mal, setMal] = useState({
//     p_in: '',
//     p_out: '',
//     s_emas: '',
//     s_perak: '',
//     s_p_emas: '',
//     s_p_perak: '',
//     d_modal: '',
//     d_laba: '',
//     d_piutang: '',
//     d_utang: '',
//     c_kas: '',
//     c_bank: '',
//     c_piutang: '',
//     c_barang: '',
//     c_utang: '',
//     pr_bangunan: '',
//     pr_tanah: '',
//     pr_material: '',
//     pr_cash: '',
//     pr_piutang: '',
//     pr_utang: '',
//     pt_modal: '',
//     pt_laba: '',
//     pt_piutang: '',
//     pt_utang: '',
//     an_jenis: 'kambing',
//     an_jumlah: '',
//     tp_modal: '',
//     tp_laba: '',
//     tp_piutang: '',
//     tp_utang: '',
//     t_jenis: 'beras',
//     t_satuan: 'kg',
//     t_jumlah: '',
//     t_pengairan: 'tadah',
//   });

//   const [haul, setHaul] = useState<Record<string, boolean>>({});
//   const [showAlasan, setShowAlasan] = useState<string | null>(null);
//   const [activeTooltip, setActiveTooltip] = useState<{
//     title: string;
//     desc: string;
//   } | null>(null);
//   const [infaqNominal, setInfaqNominal] = useState<string>('');
//   const [infaqTujuan, setInfaqTujuan] = useState('Operasional Masjid');

//   // FIX: STATE KHUSUS UNTUK WAKAF (Karena beda cara penanganan UI-nya)
//   const [wakafNominal, setWakafNominal] = useState<string>('');
//   const [wakafTujuan, setWakafTujuan] = useState('');

//   const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
//   const [showNiatModal, setShowNiatModal] = useState(false); // FIX: STATE UNTUK POP-UP NIAT
//   const [pendingFormData, setPendingFormData] = useState<FormData | null>(null); // FIX: Menyimpan sementara form input jamaah
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [checkoutFile, setCheckoutFile] = useState<File | null>(null);
//   const [isAnonim, setIsAnonim] = useState(false);

//   // ================= STATE TRANSAPARANSI =================
//   const [realStats, setRealStats] = useState({
//     fitrahRp: 0,
//     fitrahKg: 0,
//     mal: 0,
//     infaq: 0,
//     wakaf: 0,
//     donaturFitrah: 0,
//     donaturMal: 0,
//     donaturInfaq: 0,
//     donaturWakaf: 0,
//   });
//   const [realDonatur, setRealDonatur] = useState<any[]>([]);
//   const [isLoadingStats, setIsLoadingStats] = useState(true);

//   useEffect(() => {
//     const fetchTransparansi = async () => {
//       try {
//         const { data, error } = await supabase
//           .from('transaksi_ziswaf')
//           .select('nama, is_anonim, kategori, nominal, created_at')
//           .eq('status_pesanan', 'DITERIMA')
//           .order('created_at', { ascending: false });
//         if (data && !error) {
//           let fRp = 0,
//             m = 0,
//             i = 0,
//             w = 0;
//           let df = 0,
//             dm = 0,
//             di = 0,
//             dw = 0;
//           data.forEach((trx) => {
//             const kat = trx.kategori.toLowerCase();
//             if (kat.includes('fitrah') || kat.includes('fidyah')) {
//               fRp += trx.nominal;
//               df++;
//             } else if (kat.includes('infaq')) {
//               i += trx.nominal;
//               di++;
//             } else if (kat.includes('wakaf')) {
//               w += trx.nominal;
//               dw++;
//             } else {
//               m += trx.nominal;
//               dm++;
//             }
//           });
//           const berasEstimasi =
//             fRp > 0 && harga.berasFitrah > 0
//               ? Math.floor((fRp / harga.berasFitrah) * 2.5)
//               : 0;
//           setRealStats({
//             fitrahRp: fRp,
//             fitrahKg: berasEstimasi,
//             mal: m,
//             infaq: i,
//             wakaf: w,
//             donaturFitrah: df,
//             donaturMal: dm,
//             donaturInfaq: di,
//             donaturWakaf: dw,
//           });
//           setRealDonatur(data.slice(0, 5));
//         }
//       } catch (err) {
//         console.error('Gagal memuat transparansi', err);
//       } finally {
//         setIsLoadingStats(false);
//       }
//     };
//     if (!isFetchingPrices) fetchTransparansi();
//   }, [isFetchingPrices, harga.berasFitrah]);

//   useEffect(() => {
//     setHaul({});
//     setShowAlasan(null);
//   }, [activeMalTab, activeTab]);

//   const handleMal = (key: string, value: string) =>
//     setMal((prev) => ({ ...prev, [key]: value }));
//   const handleHaul = (key: string, val: boolean) =>
//     setHaul((prev) => ({ ...prev, [key]: val }));

//   const formatRp = (angka: number) =>
//     new Intl.NumberFormat('id-ID', {
//       style: 'currency',
//       currency: 'IDR',
//       minimumFractionDigits: 0,
//     }).format(angka);
//   const parseNum = (val: any) =>
//     parseFloat(String(val).replace(/[^0-9.]/g, '')) || 0;
//   const valString = (val: string) =>
//     val ? parseInt(val.replace(/[^0-9]/g, ''), 10).toLocaleString('id-ID') : '';

//   const InfoIcon = ({ title, desc }: { title: string; desc: string }) => (
//     <button
//       onClick={(e) => {
//         e.stopPropagation();
//         setActiveTooltip({ title, desc });
//       }}
//       className='ml-1.5 text-slate-400 hover:text-teal-600 transition-colors focus:outline-none shrink-0 inline-flex'>
//       <Info className='w-4 h-4' />
//     </button>
//   );

//   const NisabBox = ({ title1, val1, desc1, title2, val2, desc2 }: any) => (
//     <div className='md:col-span-2 bg-slate-50/70 border border-slate-200 p-4 rounded-2xl mb-2 flex flex-col sm:flex-row gap-4 justify-between'>
//       <div className='flex-1'>
//         <div className='flex justify-between items-center mb-1.5'>
//           <span className='text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center'>
//             {title1}{' '}
//             {desc1 && (
//               <InfoIcon
//                 title={title1}
//                 desc={desc1}
//               />
//             )}
//           </span>
//           {!title2 && (
//             <span className='text-[9px] font-bold text-slate-400 bg-white px-2 py-1 rounded border border-slate-100'>
//               {currentDate}
//             </span>
//           )}
//         </div>
//         <p className='text-sm font-semibold text-slate-800'>{val1}</p>
//       </div>
//       {title2 && (
//         <>
//           <div className='hidden sm:block w-px bg-slate-200 mx-2'></div>
//           <div className='flex-1 border-t sm:border-t-0 border-slate-200 pt-3 sm:pt-0 mt-1 sm:mt-0'>
//             <div className='flex justify-between items-center mb-1.5'>
//               <span className='text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center'>
//                 {title2}{' '}
//                 {desc2 && (
//                   <InfoIcon
//                     title={title2}
//                     desc={desc2}
//                   />
//                 )}
//               </span>
//               <span className='text-[9px] font-bold text-slate-400 bg-white px-2 py-1 rounded border border-slate-100'>
//                 {currentDate}
//               </span>
//             </div>
//             <p className='text-sm font-semibold text-slate-800'>{val2}</p>
//           </div>
//         </>
//       )}
//     </div>
//   );

//   const hitungZakatMal = () => {
//     let result = {
//       totalHarta: 0,
//       wajibZakatRp: 0,
//       wajibZakatTeks: '',
//       statusWajib: true,
//       alasanMatematis: '',
//       alasanHarga: '',
//       hasInput: false,
//       items: [] as any[],
//     };

//     if (activeMalTab === 'Profesi') {
//       let bersih = parseNum(mal.p_in) - parseNum(mal.p_out);
//       result.hasInput = parseNum(mal.p_in) > 0;
//       result.totalHarta = bersih;
//       let proyeksiTahunan = bersih * 12;
//       if (proyeksiTahunan < NISAB_EMAS_RP) {
//         result.statusWajib = false;
//         result.alasanMatematis = `Penghasilan bersih: Rp ${formatRp(bersih)}/bln.\nProyeksi 1 tahun: Rp ${formatRp(proyeksiTahunan)}.\n\nKarena di bawah Nisab Emas (Rp ${formatRp(NISAB_EMAS_RP)}), belum wajib zakat.`;
//       } else {
//         result.wajibZakatRp = bersih * 0.025;
//         result.alasanMatematis = `Proyeksi tahunan (Rp ${formatRp(proyeksiTahunan)}) melebihi Nisab Emas (Rp ${formatRp(NISAB_EMAS_RP)}).\n\nAnda wajib menunaikan zakat profesi sebesar 2.5% dari penghasilan bersih bulanan Anda saat ini.\nZakat profesi dapat dibayarkan tiap bulan tanpa harus menunggu genap satu tahun (Haul).\n\nHitungan: Rp ${formatRp(bersih)} x 2.5% = Rp ${formatRp(result.wajibZakatRp)}`;
//       }
//     } else if (activeMalTab === 'Emas, Perak & Perhiasan') {
//       result.hasInput =
//         parseNum(mal.s_emas) > 0 ||
//         parseNum(mal.s_perak) > 0 ||
//         parseNum(mal.s_p_emas) > 0 ||
//         parseNum(mal.s_p_perak) > 0;
//       const checkItem = (
//         gram: number,
//         hargaVal: number,
//         nisabGram: number,
//         name: string,
//         isHaul: boolean,
//       ) => {
//         if (gram === 0) return null;
//         let rp = gram * hargaVal;
//         let meetsNisab = gram >= nisabGram;
//         let wajib = meetsNisab && isHaul;
//         return {
//           name,
//           rp,
//           gram,
//           zakat: wajib ? rp * 0.025 : 0,
//           wajib,
//           alasan: meetsNisab
//             ? isHaul
//               ? `Mencapai Nisab (${nisabGram}g) & Haul.`
//               : `Mencapai Nisab tapi belum Haul.`
//             : `Kurang dari Nisab (${nisabGram}g).`,
//         };
//       };
//       let items = [
//         checkItem(
//           parseNum(mal.s_emas),
//           harga.emas,
//           NISAB_EMAS_GRAM,
//           'Emas Batangan',
//           !!haul.s_emas,
//         ),
//         checkItem(
//           parseNum(mal.s_perak),
//           harga.perak,
//           NISAB_PERAK_GRAM,
//           'Perak Batangan',
//           !!haul.s_perak,
//         ),
//         checkItem(
//           parseNum(mal.s_p_emas),
//           harga.emas,
//           NISAB_EMAS_GRAM,
//           'Perhiasan Emas',
//           !!haul.s_p_emas,
//         ),
//         checkItem(
//           parseNum(mal.s_p_perak),
//           harga.perak,
//           NISAB_PERAK_GRAM,
//           'Perhiasan Perak',
//           !!haul.s_p_perak,
//         ),
//       ].filter(Boolean);
//       result.items = items;
//       result.wajibZakatRp = items.reduce(
//         (acc, curr: any) => acc + curr.zakat,
//         0,
//       );
//       result.totalHarta = items.reduce((acc, curr: any) => acc + curr.rp, 0);
//       result.statusWajib = items.some((item: any) => item.wajib);
//       if (!result.statusWajib && result.hasInput)
//         result.alasanMatematis =
//           'Tidak ada aset yang memenuhi dua syarat utama (Nisab DAN Haul) secara bersamaan.';
//     } else if (activeMalTab === 'Pertanian') {
//       let totalKg =
//         parseNum(mal.t_jumlah) *
//         (mal.t_satuan === 'ton' ? 1000 : mal.t_satuan === 'kw' ? 100 : 1);
//       let nisabPtn = mal.t_jenis === 'beras' ? 815.758 : 1323.132;
//       result.hasInput = totalKg > 0;
//       if (totalKg >= nisabPtn) {
//         let rate = mal.t_pengairan === 'tadah' ? 0.1 : 0.05;
//         let zKg = totalKg * rate;
//         let hargaPerKg =
//           mal.t_jenis === 'beras' ? harga.berasTani : harga.gabahTani;
//         result.wajibZakatRp = zKg * hargaPerKg;
//         result.wajibZakatTeks = `${zKg.toLocaleString('id-ID', { maximumFractionDigits: 2 })} Kg (${mal.t_jenis === 'beras' ? 'Beras' : 'Gabah'})`;
//         result.alasanMatematis = `Total Panen: ${totalKg.toLocaleString('id-ID')} Kg.\nBatas Nisab telah terpenuhi.\n\nSistem Pengairan: ${mal.t_pengairan === 'tadah' ? 'Tadah Hujan (10%)' : 'Irigasi Berbayar (5%)'}.\nHitungan: ${totalKg.toLocaleString('id-ID')} Kg x ${rate * 100}% = ${zKg.toLocaleString('id-ID', { maximumFractionDigits: 2 })} Kg.`;
//         result.alasanHarga = `Harga pasar per tanggal ${currentDate}:\n1 Kg ${mal.t_jenis === 'beras' ? 'Beras Putih' : 'Gabah Kering'} = Rp ${formatRp(hargaPerKg)}.\n\nKalkulasi Final:\n${zKg.toLocaleString('id-ID', { maximumFractionDigits: 2 })} Kg x Rp ${formatRp(hargaPerKg)} = Rp ${formatRp(result.wajibZakatRp)}`;
//       } else {
//         result.statusWajib = false;
//         result.alasanMatematis = `Total Panen Anda (${totalKg.toLocaleString('id-ID')} Kg) berada di bawah batas minimal Nisab (5 Wasaq), maka belum diwajibkan mengeluarkan zakat pertanian.`;
//       }
//     } else if (activeMalTab === "Zakat An'am") {
//       let ekor = parseNum(mal.an_jumlah);
//       result.hasInput = ekor > 0;
//       let jenis = mal.an_jenis;
//       let isNisab =
//         (jenis === 'kambing' && ekor >= 40) ||
//         (jenis === 'sapi' && ekor >= 30) ||
//         (jenis === 'unta' && ekor >= 5);
//       if (!isNisab) {
//         result.statusWajib = false;
//         let batas = jenis === 'kambing' ? 40 : jenis === 'sapi' ? 30 : 5;
//         result.alasanMatematis = `Jumlah ternak Anda (${ekor} Ekor) kurang dari batas minimal Nisab (${batas} Ekor), maka belum wajib dizakatkan.`;
//       } else if (!haul.anam) {
//         result.statusWajib = false;
//         result.alasanMatematis = `Ternak Anda memenuhi Nisab. Namun syarat mutlak Zakat An'am adalah Haul 1 Tahun. Harap ceklis pernyataan Haul.`;
//       } else {
//         let txt = '',
//           alasanRange = '',
//           calcRp = 0,
//           calcDesc = '';
//         const kambingDesc = 'Kambing (umur 2 th) atau Domba (umur 1 th)';
//         const setDesc = (t: string, r: string, p: number, p_txt: string) => {
//           txt = t;
//           alasanRange = r;
//           calcRp = p;
//           calcDesc = `Harga pasar per ${currentDate}:\n${p_txt}\n\nKalkulasi Final:\nTotal Nilai Konversi = Rp ${formatRp(calcRp)}`;
//         };

//         if (jenis === 'kambing') {
//           if (ekor >= 40 && ekor <= 120)
//             setDesc(
//               `1 Ekor Kambing / Domba`,
//               `Rentang 40 - 120 ekor. Wajib zakat: 1 Ekor ${kambingDesc}.`,
//               1 * harga.hewan.kambing,
//               `1 Kambing = Rp ${formatRp(harga.hewan.kambing)}`,
//             );
//           else if (ekor >= 121 && ekor <= 200)
//             setDesc(
//               `2 Ekor Kambing / Domba`,
//               `Rentang 121 - 200 ekor. Wajib zakat: 2 Ekor ${kambingDesc}.`,
//               2 * harga.hewan.kambing,
//               `1 Kambing = Rp ${formatRp(harga.hewan.kambing)}`,
//             );
//           else if (ekor >= 201 && ekor <= 300)
//             setDesc(
//               `3 Ekor Kambing / Domba`,
//               `Rentang 201 - 300 ekor. Wajib zakat: 3 Ekor ${kambingDesc}.`,
//               3 * harga.hewan.kambing,
//               `1 Kambing = Rp ${formatRp(harga.hewan.kambing)}`,
//             );
//           else if (ekor > 300) {
//             let mul = Math.floor(ekor / 100);
//             setDesc(
//               `${mul} Ekor Kambing / Domba`,
//               `Lebih dari 300 ekor, penambahan 1 ekor tiap kelipatan 100. Wajib zakat: ${mul} Ekor ${kambingDesc}.`,
//               mul * harga.hewan.kambing,
//               `1 Kambing = Rp ${formatRp(harga.hewan.kambing)}`,
//             );
//           }
//         } else if (jenis === 'sapi') {
//           if (ekor >= 30 && ekor <= 39)
//             setDesc(
//               "1 Ekor Tabi' (Sapi 1 thn)",
//               "Rentang 30 - 39 ekor. Wajib zakat: 1 Ekor Tabi' (umur 1 thn).",
//               1 * harga.hewan.tabi,
//               `1 Tabi' = Rp ${formatRp(harga.hewan.tabi)}`,
//             );
//           else if (ekor >= 40 && ekor <= 59)
//             setDesc(
//               '1 Ekor Musinnah (Sapi 2 thn)',
//               'Rentang 40 - 59 ekor. Wajib zakat: 1 Ekor Musinnah (umur 2 thn).',
//               1 * harga.hewan.musinnah,
//               `1 Musinnah = Rp ${formatRp(harga.hewan.musinnah)}`,
//             );
//           else if (ekor >= 60 && ekor <= 69)
//             setDesc(
//               "2 Ekor Tabi' (Sapi 1 thn)",
//               "Rentang 60 - 69 ekor. Wajib zakat: 2 Ekor Tabi'.",
//               2 * harga.hewan.tabi,
//               `1 Tabi' = Rp ${formatRp(harga.hewan.tabi)}`,
//             );
//           else if (ekor >= 70 && ekor <= 79)
//             setDesc(
//               "1 Tabi' & 1 Musinnah",
//               "Rentang 70 - 79 ekor. Wajib zakat: 1 Ekor Tabi' & 1 Ekor Musinnah.",
//               harga.hewan.tabi + harga.hewan.musinnah,
//               `1 Tabi' = Rp ${formatRp(harga.hewan.tabi)}\n1 Musinnah = Rp ${formatRp(harga.hewan.musinnah)}`,
//             );
//           else if (ekor >= 80 && ekor <= 89)
//             setDesc(
//               '2 Ekor Musinnah (Sapi 2 thn)',
//               'Rentang 80 - 89 ekor. Wajib zakat: 2 Ekor Musinnah.',
//               2 * harga.hewan.musinnah,
//               `1 Musinnah = Rp ${formatRp(harga.hewan.musinnah)}`,
//             );
//           else if (ekor >= 90) {
//             let base = Math.floor(ekor / 10) * 10;
//             let m = 0,
//               t = 0;
//             for (let y = 0; y <= base / 40; y++) {
//               let rem = base - y * 40;
//               if (rem % 30 === 0) {
//                 m = y;
//                 t = rem / 30;
//                 break;
//               }
//             }
//             if (m > 0 && t > 0)
//               setDesc(
//                 `${t} Tabi' & ${m} Musinnah`,
//                 `Kelipatan kombinasi 30 & 40 penuh. Wajib zakat: ${t} Tabi' dan ${m} Musinnah.`,
//                 t * harga.hewan.tabi + m * harga.hewan.musinnah,
//                 `1 Tabi' = Rp ${formatRp(harga.hewan.tabi)}\n1 Musinnah = Rp ${formatRp(harga.hewan.musinnah)}`,
//               );
//             else if (m > 0)
//               setDesc(
//                 `${m} Ekor Musinnah`,
//                 `Kelipatan 40 penuh. Wajib zakat: ${m} Musinnah.`,
//                 m * harga.hewan.musinnah,
//                 `1 Musinnah = Rp ${formatRp(harga.hewan.musinnah)}`,
//               );
//             else if (t > 0)
//               setDesc(
//                 `${t} Ekor Tabi'`,
//                 `Kelipatan 30 penuh. Wajib zakat: ${t} Tabi'.`,
//                 t * harga.hewan.tabi,
//                 `1 Tabi' = Rp ${formatRp(harga.hewan.tabi)}`,
//               );
//           }
//         } else if (jenis === 'unta') {
//           if (ekor >= 5 && ekor <= 9)
//             setDesc(
//               `1 Ekor Kambing / Domba`,
//               `Rentang 5-9 unta. Zakat dikonversi jadi 1 Ekor ${kambingDesc}.`,
//               1 * harga.hewan.kambing,
//               `1 Kambing = Rp ${formatRp(harga.hewan.kambing)}`,
//             );
//           else if (ekor >= 10 && ekor <= 14)
//             setDesc(
//               `2 Ekor Kambing / Domba`,
//               `Rentang 10-14 unta. Wajib: 2 Ekor ${kambingDesc}.`,
//               2 * harga.hewan.kambing,
//               `1 Kambing = Rp ${formatRp(harga.hewan.kambing)}`,
//             );
//           else if (ekor >= 15 && ekor <= 19)
//             setDesc(
//               `3 Ekor Kambing / Domba`,
//               `Rentang 15-19 unta. Wajib: 3 Ekor ${kambingDesc}.`,
//               3 * harga.hewan.kambing,
//               `1 Kambing = Rp ${formatRp(harga.hewan.kambing)}`,
//             );
//           else if (ekor >= 20 && ekor <= 24)
//             setDesc(
//               `4 Ekor Kambing / Domba`,
//               `Rentang 20-24 unta. Wajib: 4 Ekor ${kambingDesc}.`,
//               4 * harga.hewan.kambing,
//               `1 Kambing = Rp ${formatRp(harga.hewan.kambing)}`,
//             );
//           else if (ekor >= 25 && ekor <= 35)
//             setDesc(
//               '1 Ekor Bintu Makhad (Unta 1th)',
//               `Rentang 25-35 unta. Wajib: 1 Ekor Bintu Makhad.`,
//               1 * harga.hewan.bintu_makhad,
//               `1 Bintu Makhad = Rp ${formatRp(harga.hewan.bintu_makhad)}`,
//             );
//           else if (ekor >= 36 && ekor <= 45)
//             setDesc(
//               '1 Ekor Bintu Labun (Unta 2th)',
//               `Rentang 36-45 unta. Wajib: 1 Ekor Bintu Labun.`,
//               1 * harga.hewan.bintu_labun,
//               `1 Bintu Labun = Rp ${formatRp(harga.hewan.bintu_labun)}`,
//             );
//           else if (ekor >= 46 && ekor <= 60)
//             setDesc(
//               '1 Ekor Hiqqah (Unta 3th)',
//               `Rentang 46-60 unta. Wajib: 1 Ekor Hiqqah.`,
//               1 * harga.hewan.hiqqah,
//               `1 Hiqqah = Rp ${formatRp(harga.hewan.hiqqah)}`,
//             );
//           else if (ekor >= 61 && ekor <= 75)
//             setDesc(
//               "1 Ekor Jadz'ah (Unta 4th)",
//               `Rentang 61-75 unta. Wajib: 1 Ekor Jadz'ah.`,
//               1 * harga.hewan.jadzah,
//               `1 Jadz'ah = Rp ${formatRp(harga.hewan.jadzah)}`,
//             );
//           else if (ekor >= 76 && ekor <= 90)
//             setDesc(
//               '2 Ekor Bintu Labun (Unta 2th)',
//               `Rentang 76-90 unta. Wajib: 2 Ekor Bintu Labun.`,
//               2 * harga.hewan.bintu_labun,
//               `1 Bintu Labun = Rp ${formatRp(harga.hewan.bintu_labun)}`,
//             );
//           else if (ekor >= 91 && ekor <= 120)
//             setDesc(
//               '2 Ekor Hiqqah (Unta 3th)',
//               `Rentang 91-120 unta. Wajib: 2 Ekor Hiqqah.`,
//               2 * harga.hewan.hiqqah,
//               `1 Hiqqah = Rp ${formatRp(harga.hewan.hiqqah)}`,
//             );
//           else if (ekor > 120) {
//             let base = Math.floor(ekor / 10) * 10;
//             let h = 0,
//               bl = 0;
//             for (let y = 0; y <= base / 50; y++) {
//               let rem = base - y * 50;
//               if (rem % 40 === 0) {
//                 h = y;
//                 bl = rem / 40;
//                 break;
//               }
//             }
//             if (h > 0 && bl > 0)
//               setDesc(
//                 `${h} Hiqqah & ${bl} Bintu Labun`,
//                 `Kelipatan kombinasi 40 & 50. Wajib zakat: ${h} Hiqqah dan ${bl} Bintu Labun.`,
//                 h * harga.hewan.hiqqah + bl * harga.hewan.bintu_labun,
//                 `1 Hiqqah = Rp ${formatRp(harga.hewan.hiqqah)}\n1 Bintu Labun = Rp ${formatRp(harga.hewan.bintu_labun)}`,
//               );
//             else if (h > 0)
//               setDesc(
//                 `${h} Ekor Hiqqah`,
//                 `Kelipatan 50 penuh. Wajib zakat: ${h} Hiqqah.`,
//                 h * harga.hewan.hiqqah,
//                 `1 Hiqqah = Rp ${formatRp(harga.hewan.hiqqah)}`,
//               );
//             else if (bl > 0)
//               setDesc(
//                 `${bl} Ekor Bintu Labun`,
//                 `Kelipatan 40 penuh. Wajib zakat: ${bl} Bintu Labun.`,
//                 bl * harga.hewan.bintu_labun,
//                 `1 Bintu Labun = Rp ${formatRp(harga.hewan.bintu_labun)}`,
//               );
//           }
//         }
//         result.wajibZakatRp = calcRp;
//         result.wajibZakatTeks = txt;
//         result.alasanMatematis = alasanRange;
//         result.alasanHarga = calcDesc;
//       }
//     } else {
//       let m = mal;
//       let modal = 0,
//         laba = 0,
//         piutang = 0,
//         utang = 0,
//         persediaan = 0;
//       if (activeMalTab === 'Perdagangan') {
//         modal = parseNum(m.d_modal);
//         laba = parseNum(m.d_laba);
//         piutang = parseNum(m.d_piutang);
//         utang = parseNum(m.d_utang);
//       }
//       if (activeMalTab === 'Peternakan') {
//         modal = parseNum(m.pt_modal);
//         laba = parseNum(m.pt_laba);
//         piutang = parseNum(m.pt_piutang);
//         utang = parseNum(m.pt_utang);
//       }
//       if (activeMalTab === 'Tanaman Produktif') {
//         modal = parseNum(m.tp_modal);
//         laba = parseNum(m.tp_laba);
//         piutang = parseNum(m.tp_piutang);
//         utang = parseNum(m.tp_utang);
//       }
//       if (activeMalTab === 'Perusahaan') {
//         modal = parseNum(m.c_kas) + parseNum(m.c_bank);
//         persediaan = parseNum(m.c_barang);
//         piutang = parseNum(m.c_piutang);
//         utang = parseNum(m.c_utang);
//       }
//       if (activeMalTab === 'Properti') {
//         modal =
//           parseNum(m.pr_bangunan) +
//           parseNum(m.pr_tanah) +
//           parseNum(m.pr_material) +
//           parseNum(m.pr_cash);
//         piutang = parseNum(m.pr_piutang);
//         utang = parseNum(m.pr_utang);
//       }

//       result.totalHarta = modal + laba + persediaan + piutang - utang;
//       result.hasInput = modal + laba + persediaan + piutang > 0;
//       if (result.totalHarta < NISAB_EMAS_RP) {
//         result.statusWajib = false;
//         result.alasanMatematis = `Total akumulasi harta/modal bersih: Rp ${formatRp(result.totalHarta)}.\n\nKarena di bawah Nisab Emas (Rp ${formatRp(NISAB_EMAS_RP)}), belum wajib dizakatkan.`;
//       } else if (!haul.tijarah) {
//         result.statusWajib = false;
//         result.alasanMatematis = `Harta Anda mencapai Nisab.\nNamun, syarat wajib zakat perniagaan/aset produktif adalah telah diputar genap 1 tahun buku (Haul). Harap ceklis pernyataan Haul.`;
//       } else {
//         result.wajibZakatRp = result.totalHarta * 0.025;
//         result.alasanMatematis = `Total aset perniagaan bersih (Rp ${formatRp(result.totalHarta)}) memenuhi syarat Nisab & Haul.\n\nZakat wajib dikeluarkan 2.5%.\nHitungan: Rp ${formatRp(result.totalHarta)} x 2.5% = Rp ${formatRp(result.wajibZakatRp)}.`;
//       }
//     }
//     return result;
//   };

//   const zResult = hitungZakatMal();

//   const getNominalBayar = () => {
//     if (activeTab === 'Zakat Fitrah') return parseNum(jiwa) * harga.berasFitrah;
//     if (activeTab === 'Fidyah') return parseNum(hariFidyah) * harga.fidyah;
//     if (activeTab === 'Infaq') return parseNum(infaqNominal);
//     if (activeTab === 'Wakaf') return parseNum(wakafNominal); // FIX: WAKAF ADA NOMINALNYA SEKARANG
//     if (activeTab === 'Zakat Mal') return zResult.wajibZakatRp;
//     return 0;
//   };

//   const getKategoriCheckout = () => {
//     if (activeTab === 'Zakat Mal') return `Zakat Mal (${activeMalTab})`;
//     if (activeTab === 'Infaq') return `Infaq (${infaqTujuan})`;
//     if (activeTab === 'Wakaf') return `Wakaf (${wakafTujuan})`;
//     return activeTab;
//   };

//   // DATA NIAT ARAB & ARTI (FIX: SEMUA KATEGORI ADA NIATNYA)
//   const getNiatData = () => {
//     if (activeTab === 'Zakat Fitrah')
//       return {
//         arab: 'ﻧَﻮَﻳْﺘُﺄَﻥْﺃُﺧْﺮِﺝَﺯَﻛَﺎﺓَﺍﻟْﻔِﻄْﺮِﻋَﻦْﻧَﻔْﺴِﻲْﻓَﺮْﺿًﺎﻟِﻠﻪِﺗَﻌَﺎﻟَﻰ',
//         arti: "Aku niat mengeluarkan zakat fitrah untuk diriku sendiri fardu karena Allah Ta'ala.",
//       };
//     if (activeTab === 'Zakat Mal')
//       return {
//         arab: 'ﻧَﻮَﻳْﺘُﺄَﻥْﺃُﺧْﺮِﺝَﺯَﻛَﺎﺓَﺍﻟْﻤَﺎﻝِﻓَﺮْﺿًﺎﻟِﻠﻪِﺗَﻌَﺎﻟَﻰ',
//         arti: "Aku niat mengeluarkan zakat mal fardu karena Allah Ta'ala.",
//       };
//     if (activeTab === 'Fidyah')
//       return {
//         arab: 'ﻧَﻮَﻳْﺘُﺄَﻥْﺃُﺧْﺮِﺝَﻫَﺬِﻩِﺍﻟْﻔِﺪْﻳَﺔَﻋَﻦْﺇِﻓْﻄَﺎﺭِﺻَﻮْﻡِﺭَﻣَﻀَﺎﻥَﻓَﺮْﺿًﺎﻟِﻠﻪِﺗَﻌَﺎﻟَﻰ',
//         arti: "Aku niat mengeluarkan fidyah ini dari berbuka puasa Ramadhan fardu karena Allah Ta'ala.",
//       };
//     if (activeTab === 'Wakaf')
//       return {
//         arab: 'ﻧَﻮَﻳْﺘُﺄَﻥْﺃُﻭَﻗِّﻒَﻫَﺬَﺍﺍﻟْﻤَﺎﻝَﻟِﻠﻪِﺗَﻌَﺎﻟَﻰ',
//         arti: "Aku niat mewakafkan harta ini karena Allah Ta'ala.",
//       };
//     return {
//       arab: 'ﻧَﻮَﻳْﺘُﺄَﻥْﺃَﺗَﺼَﺪَّﻕَﺳُﻨَّﺔًﻟِﻠﻪِﺗَﻌَﺎﻟَﻰ',
//       arti: "Aku niat bersedekah sunnah karena Allah Ta'ala.",
//     }; // Infaq
//   };

//   // 1. CEK DULU SAAT TOMBOL FORM DITEKAN -> MUNCULKAN POP UP NIAT
//   const handleCheckoutSubmit = (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     if (!checkoutFile)
//       return alert('Mohon unggah bukti transfer/pembayaran Anda!');
//     if (getNominalBayar() <= 0)
//       return alert('Total pembayaran tidak boleh kosong.');

//     const formData = new FormData(e.currentTarget);
//     setPendingFormData(formData); // Simpan sementara datanya
//     setShowNiatModal(true); // Tampilkan Pop-up Niat
//   };

//   // 2. KETIKA JAMAAH KLIK "KIRIM" DI POP-UP NIAT -> BARU EKSEKUSI API
//   const executeFinalCheckout = async () => {
//     if (!pendingFormData || !checkoutFile) return;
//     setIsSubmitting(true);

//     pendingFormData.append('file', checkoutFile);
//     pendingFormData.append('kategori', getKategoriCheckout());
//     pendingFormData.append('nominal', getNominalBayar().toString());
//     pendingFormData.append('isAnonim', isAnonim.toString());

//     if (activeTab === 'Zakat Mal') {
//       pendingFormData.append(
//         'rincian',
//         ["Zakat An'am", 'Pertanian'].includes(activeMalTab)
//           ? zResult.alasanHarga
//           : zResult.alasanMatematis,
//       );
//     }

//     try {
//       const response = await fetch('/api/ziswaf-checkout', {
//         method: 'POST',
//         body: pendingFormData,
//       });
//       const result = await response.json();
//       if (response.ok) {
//         setShowNiatModal(false);
//         setIsCheckoutOpen(false);
//         alert(
//           `Alhamdulillah! Penyaluran berhasil dicatat.\nKode Transaksi: ${result.kodeTrx}\nKwitansi "Menunggu Verifikasi" telah dikirimkan ke email Anda.`,
//         );
//         window.location.reload();
//       } else {
//         alert(`Gagal: ${result.error}`);
//         setShowNiatModal(false);
//       }
//     } catch (error) {
//       alert('Terjadi kesalahan koneksi.');
//       setShowNiatModal(false);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleShowFinalInfo = () => {
//     if (!zResult.statusWajib) setShowAlasan(zResult.alasanMatematis);
//     else if (["Zakat An'am", 'Pertanian'].includes(activeMalTab))
//       setShowAlasan(zResult.alasanHarga);
//     else setShowAlasan(zResult.alasanMatematis);
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

//   const inputUIClass =
//     'w-full bg-slate-50/70 border border-slate-200 rounded-xl px-4 py-3.5 focus:bg-white focus:ring-2 focus:ring-teal-600/30 focus:border-teal-500 outline-none text-slate-800 font-semibold transition-all placeholder:text-slate-400 placeholder:font-medium';
//   const labelUIClass =
//     'text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider block';

//   const renderZakatMalForm = () => {
//     return (
//       <div className='space-y-6 animate-in fade-in relative z-10'>
//         <style
//           dangerouslySetInnerHTML={{
//             __html: `@keyframes marquee-btn { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } } .animate-btn-marquee { display: inline-block; white-space: nowrap; animation: marquee-btn 6s linear infinite; } .animate-btn-marquee:hover { animation-play-state: paused; }`,
//           }}
//         />
//         <div className='flex overflow-x-auto hide-scrollbar gap-2 pb-2'>
//           {malCategories.map((cat) => (
//             <button
//               key={cat}
//               onClick={() => setActiveMalTab(cat)}
//               className={`shrink-0 overflow-hidden w-auto px-5 py-2.5 rounded-full text-xs font-bold transition-all border ${activeMalTab === cat ? 'bg-teal-700 text-white border-teal-700 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-teal-700 hover:border-teal-200'}`}>
//               {cat === 'Emas, Perak & Perhiasan' ? (
//                 <div className='w-48 relative overflow-hidden group'>
//                   <div className='animate-btn-marquee'>
//                     {cat} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{' '}
//                     {cat}
//                   </div>
//                 </div>
//               ) : (
//                 cat
//               )}
//             </button>
//           ))}
//         </div>
//         <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
//           {activeMalTab === 'Profesi' && (
//             <>
//               <NisabBox
//                 title1='Nisab Zakat Profesi'
//                 val1={`77.5 Gram = ${formatRp(NISAB_EMAS_RP)}`}
//                 desc1='Nisab zakat profesi disamakan dengan emas 20 Dinar.'
//               />
//               <div>
//                 <div className='flex items-center mb-1.5'>
//                   <label className={labelUIClass}>Penghasilan Bulanan</label>
//                   <InfoIcon
//                     title='Penghasilan Bulanan'
//                     desc='Penghasilan rutin & bonus.'
//                   />
//                 </div>
//                 <input
//                   type='text'
//                   value={valString(mal.p_in)}
//                   onChange={(e) =>
//                     handleMal('p_in', e.target.value.replace(/[^0-9]/g, ''))
//                   }
//                   className={inputUIClass}
//                   placeholder='Rp 0'
//                 />
//               </div>
//               <div>
//                 <div className='flex items-center mb-1.5'>
//                   <label className={labelUIClass}>Pengeluaran Pokok</label>
//                   <InfoIcon
//                     title='Pengeluaran Pokok'
//                     desc='Kebutuhan asasi pokok bulanan keluarga yang wajib dipenuhi.'
//                   />
//                 </div>
//                 <input
//                   type='text'
//                   value={valString(mal.p_out)}
//                   onChange={(e) =>
//                     handleMal('p_out', e.target.value.replace(/[^0-9]/g, ''))
//                   }
//                   className={inputUIClass}
//                   placeholder='Rp 0'
//                 />
//               </div>
//             </>
//           )}
//           {activeMalTab === 'Emas, Perak & Perhiasan' && (
//             <>
//               <NisabBox
//                 isDouble={true}
//                 title1='Nisab Emas (77.5g)'
//                 val1={`${formatRp(harga.emas)}/g = ${formatRp(NISAB_EMAS_RP)}`}
//                 title2='Nisab Perak (543.35g)'
//                 val2={`${formatRp(harga.perak)}/g = ${formatRp(NISAB_PERAK_RP)}`}
//               />
//               <div className='bg-white border border-slate-100 p-4 rounded-2xl shadow-sm'>
//                 <div className='flex items-center mb-1.5'>
//                   <label className={labelUIClass}>Emas Batangan</label>
//                   <InfoIcon
//                     title='Emas Batangan'
//                     desc='Emas murni disimpan.'
//                   />
//                 </div>
//                 <input
//                   type='text'
//                   value={mal.s_emas}
//                   onChange={(e) =>
//                     handleMal('s_emas', e.target.value.replace(/[^0-9.]/g, ''))
//                   }
//                   className={inputUIClass}
//                   placeholder='0 gram'
//                 />
//                 <label className='flex items-center mt-3 cursor-pointer'>
//                   <input
//                     type='checkbox'
//                     checked={!!haul.s_emas}
//                     onChange={(e) => handleHaul('s_emas', e.target.checked)}
//                     className='w-4 h-4 mr-2 accent-teal-600'
//                   />
//                   <span className='text-[10px] font-bold text-slate-500'>
//                     Haul 1 Thn Hijriyah
//                   </span>
//                 </label>
//               </div>
//               <div className='bg-white border border-slate-100 p-4 rounded-2xl shadow-sm'>
//                 <div className='flex items-center mb-1.5'>
//                   <label className={labelUIClass}>Perak Batangan</label>
//                   <InfoIcon
//                     title='Perak Batangan'
//                     desc='Perak murni disimpan.'
//                   />
//                 </div>
//                 <input
//                   type='text'
//                   value={mal.s_perak}
//                   onChange={(e) =>
//                     handleMal('s_perak', e.target.value.replace(/[^0-9.]/g, ''))
//                   }
//                   className={inputUIClass}
//                   placeholder='0 gram'
//                 />
//                 <label className='flex items-center mt-3 cursor-pointer'>
//                   <input
//                     type='checkbox'
//                     checked={!!haul.s_perak}
//                     onChange={(e) => handleHaul('s_perak', e.target.checked)}
//                     className='w-4 h-4 mr-2 accent-teal-600'
//                   />
//                   <span className='text-[10px] font-bold text-slate-500'>
//                     Haul 1 Thn Hijriyah
//                   </span>
//                 </label>
//               </div>
//               <div className='bg-white border border-slate-100 p-4 rounded-2xl shadow-sm'>
//                 <div className='flex items-center mb-1.5'>
//                   <label className={labelUIClass}>Perhiasan Emas</label>
//                   <InfoIcon
//                     title='Perhiasan Emas (Kanzin)'
//                     desc='Perhiasan HANYA DISIMPAN (kanzin) tidak dipakai.'
//                   />
//                 </div>
//                 <input
//                   type='text'
//                   value={mal.s_p_emas}
//                   onChange={(e) =>
//                     handleMal(
//                       's_p_emas',
//                       e.target.value.replace(/[^0-9.]/g, ''),
//                     )
//                   }
//                   className={inputUIClass}
//                   placeholder='0 gram'
//                 />
//                 <label className='flex items-center mt-3 cursor-pointer'>
//                   <input
//                     type='checkbox'
//                     checked={!!haul.s_p_emas}
//                     onChange={(e) => handleHaul('s_p_emas', e.target.checked)}
//                     className='w-4 h-4 mr-2 accent-teal-600'
//                   />
//                   <span className='text-[10px] font-bold text-slate-500'>
//                     Haul 1 Thn Hijriyah
//                   </span>
//                 </label>
//               </div>
//               <div className='bg-white border border-slate-100 p-4 rounded-2xl shadow-sm'>
//                 <div className='flex items-center mb-1.5'>
//                   <label className={labelUIClass}>Perhiasan Perak</label>
//                   <InfoIcon
//                     title='Perhiasan Perak (Kanzin)'
//                     desc='Perhiasan perak niat disimpan.'
//                   />
//                 </div>
//                 <input
//                   type='text'
//                   value={mal.s_p_perak}
//                   onChange={(e) =>
//                     handleMal(
//                       's_p_perak',
//                       e.target.value.replace(/[^0-9.]/g, ''),
//                     )
//                   }
//                   className={inputUIClass}
//                   placeholder='0 gram'
//                 />
//                 <label className='flex items-center mt-3 cursor-pointer'>
//                   <input
//                     type='checkbox'
//                     checked={!!haul.s_p_perak}
//                     onChange={(e) => handleHaul('s_p_perak', e.target.checked)}
//                     className='w-4 h-4 mr-2 accent-teal-600'
//                   />
//                   <span className='text-[10px] font-bold text-slate-500'>
//                     Haul 1 Thn Hijriyah
//                   </span>
//                 </label>
//               </div>
//             </>
//           )}
//           {activeMalTab === 'Perdagangan' && (
//             <>
//               <NisabBox
//                 title1='Nisab Perdagangan'
//                 val1={`77.5 Gram Emas = ${formatRp(NISAB_EMAS_RP)}`}
//               />
//               <div>
//                 <div className='flex items-center mb-1.5'>
//                   <label className={labelUIClass}>Modal Yang Diputar</label>
//                   <InfoIcon
//                     title="Modal ('Urudh al-tijarah)"
//                     desc="Mencakup semua harta yang mempengaruhi 'urudh al-tijarah."
//                   />
//                 </div>
//                 <input
//                   type='text'
//                   value={valString(mal.d_modal)}
//                   onChange={(e) =>
//                     handleMal('d_modal', e.target.value.replace(/[^0-9]/g, ''))
//                   }
//                   className={inputUIClass}
//                   placeholder='Rp 0'
//                 />
//               </div>
//               <div>
//                 <div className='flex items-center mb-1.5'>
//                   <label className={labelUIClass}>Simpanan / Laba</label>
//                 </div>
//                 <input
//                   type='text'
//                   value={valString(mal.d_laba)}
//                   onChange={(e) =>
//                     handleMal('d_laba', e.target.value.replace(/[^0-9]/g, ''))
//                   }
//                   className={inputUIClass}
//                   placeholder='Rp 0'
//                 />
//               </div>
//               <div>
//                 <div className='flex items-center mb-1.5'>
//                   <label className={labelUIClass}>Piutang</label>
//                 </div>
//                 <input
//                   type='text'
//                   value={valString(mal.d_piutang)}
//                   onChange={(e) =>
//                     handleMal(
//                       'd_piutang',
//                       e.target.value.replace(/[^0-9]/g, ''),
//                     )
//                   }
//                   className={inputUIClass}
//                   placeholder='Rp 0'
//                 />
//               </div>
//               <div>
//                 <div className='flex items-center mb-1.5'>
//                   <label className={labelUIClass}>Utang Niaga</label>
//                 </div>
//                 <input
//                   type='text'
//                   value={valString(mal.d_utang)}
//                   onChange={(e) =>
//                     handleMal('d_utang', e.target.value.replace(/[^0-9]/g, ''))
//                   }
//                   className={inputUIClass}
//                   placeholder='Rp 0'
//                 />
//               </div>
//             </>
//           )}
//           {activeMalTab === 'Peternakan' && (
//             <>
//               <NisabBox
//                 title1='Nisab Peternakan Niaga'
//                 val1={`77.5 Gram Emas = ${formatRp(NISAB_EMAS_RP)}`}
//                 desc1='Untuk hewan ternak murni diniagakan (ayam potong, lele).'
//               />
//               <div>
//                 <div className='flex items-center mb-1.5'>
//                   <label className={labelUIClass}>Modal Peternakan Niaga</label>
//                 </div>
//                 <input
//                   type='text'
//                   value={valString(mal.pt_modal)}
//                   onChange={(e) =>
//                     handleMal('pt_modal', e.target.value.replace(/[^0-9]/g, ''))
//                   }
//                   className={inputUIClass}
//                   placeholder='Rp 0'
//                 />
//               </div>
//               <div>
//                 <div className='flex items-center mb-1.5'>
//                   <label className={labelUIClass}>Simpanan / Laba</label>
//                 </div>
//                 <input
//                   type='text'
//                   value={valString(mal.pt_laba)}
//                   onChange={(e) =>
//                     handleMal('pt_laba', e.target.value.replace(/[^0-9]/g, ''))
//                   }
//                   className={inputUIClass}
//                   placeholder='Rp 0'
//                 />
//               </div>
//               <div>
//                 <div className='flex items-center mb-1.5'>
//                   <label className={labelUIClass}>Piutang</label>
//                 </div>
//                 <input
//                   type='text'
//                   value={valString(mal.pt_piutang)}
//                   onChange={(e) =>
//                     handleMal(
//                       'pt_piutang',
//                       e.target.value.replace(/[^0-9]/g, ''),
//                     )
//                   }
//                   className={inputUIClass}
//                   placeholder='Rp 0'
//                 />
//               </div>
//               <div>
//                 <div className='flex items-center mb-1.5'>
//                   <label className={labelUIClass}>Utang</label>
//                 </div>
//                 <input
//                   type='text'
//                   value={valString(mal.pt_utang)}
//                   onChange={(e) =>
//                     handleMal('pt_utang', e.target.value.replace(/[^0-9]/g, ''))
//                   }
//                   className={inputUIClass}
//                   placeholder='Rp 0'
//                 />
//               </div>
//             </>
//           )}
//           {activeMalTab === 'Tanaman Produktif' && (
//             <>
//               <NisabBox
//                 title1='Nisab Tanaman Agribisnis'
//                 val1={`77.5 Gram Emas = ${formatRp(NISAB_EMAS_RP)}`}
//                 desc1='Tanaman murni diniagakan. Biaya pupuk tidak dihitung urudh.'
//               />
//               <div>
//                 <div className='flex items-center mb-1.5'>
//                   <label className={labelUIClass}>Modal Tanaman Niaga</label>
//                 </div>
//                 <input
//                   type='text'
//                   value={valString(mal.tp_modal)}
//                   onChange={(e) =>
//                     handleMal('tp_modal', e.target.value.replace(/[^0-9]/g, ''))
//                   }
//                   className={inputUIClass}
//                   placeholder='Rp 0'
//                 />
//               </div>
//               <div>
//                 <div className='flex items-center mb-1.5'>
//                   <label className={labelUIClass}>Simpanan / Laba</label>
//                 </div>
//                 <input
//                   type='text'
//                   value={valString(mal.tp_laba)}
//                   onChange={(e) =>
//                     handleMal('tp_laba', e.target.value.replace(/[^0-9]/g, ''))
//                   }
//                   className={inputUIClass}
//                   placeholder='Rp 0'
//                 />
//               </div>
//               <div>
//                 <div className='flex items-center mb-1.5'>
//                   <label className={labelUIClass}>Piutang</label>
//                 </div>
//                 <input
//                   type='text'
//                   value={valString(mal.tp_piutang)}
//                   onChange={(e) =>
//                     handleMal(
//                       'tp_piutang',
//                       e.target.value.replace(/[^0-9]/g, ''),
//                     )
//                   }
//                   className={inputUIClass}
//                   placeholder='Rp 0'
//                 />
//               </div>
//               <div>
//                 <div className='flex items-center mb-1.5'>
//                   <label className={labelUIClass}>Utang</label>
//                 </div>
//                 <input
//                   type='text'
//                   value={valString(mal.tp_utang)}
//                   onChange={(e) =>
//                     handleMal('tp_utang', e.target.value.replace(/[^0-9]/g, ''))
//                   }
//                   className={inputUIClass}
//                   placeholder='Rp 0'
//                 />
//               </div>
//             </>
//           )}
//           {activeMalTab === "Zakat An'am" && (
//             <>
//               <NisabBox
//                 isDouble={true}
//                 title1='Nisab Kambing / Sapi'
//                 val1='40 Ekor / 30 Ekor'
//                 title2='Nisab Unta'
//                 val2='5 Ekor'
//               />
//               <div>
//                 <label className={labelUIClass}>Jenis Hewan Ternak</label>
//                 <select
//                   value={mal.an_jenis}
//                   onChange={(e) => handleMal('an_jenis', e.target.value)}
//                   className={`${inputUIClass} cursor-pointer`}>
//                   <option value='kambing'>Kambing / Domba</option>
//                   <option value='sapi'>Sapi / Kerbau</option>
//                   <option value='unta'>Unta</option>
//                 </select>
//               </div>
//               <div>
//                 <label className={labelUIClass}>Jumlah Total Ekor</label>
//                 <input
//                   type='text'
//                   value={valString(mal.an_jumlah)}
//                   onChange={(e) =>
//                     handleMal(
//                       'an_jumlah',
//                       e.target.value.replace(/[^0-9]/g, ''),
//                     )
//                   }
//                   className={inputUIClass}
//                   placeholder='0 Ekor'
//                 />
//               </div>
//             </>
//           )}
//           {activeMalTab === 'Pertanian' && (
//             <>
//               <NisabBox
//                 isDouble={true}
//                 title1='Nisab Beras Putih'
//                 val1='815,758 Kg'
//                 desc1="Nisab zuru' 5 wasaq = 60 sha'."
//                 title2='Nisab Gabah Kering'
//                 val2='1.323,132 Kg'
//                 desc2='Setara 5 Wasaq Gabah Kering'
//               />
//               <div>
//                 <label className={labelUIClass}>Jenis Hasil Panen</label>
//                 <select
//                   value={mal.t_jenis}
//                   onChange={(e) => handleMal('t_jenis', e.target.value)}
//                   className={`${inputUIClass} cursor-pointer`}>
//                   <option value='beras'>Beras Putih</option>
//                   <option value='gabah'>Padi Gabah Kering</option>
//                 </select>
//               </div>
//               <div className='flex gap-2'>
//                 <div className='flex-1'>
//                   <label className={labelUIClass}>Satuan</label>
//                   <select
//                     value={mal.t_satuan}
//                     onChange={(e) => handleMal('t_satuan', e.target.value)}
//                     className={`${inputUIClass} cursor-pointer`}>
//                     <option value='kg'>Kg</option>
//                     <option value='kw'>Kwintal</option>
//                     <option value='ton'>Ton</option>
//                   </select>
//                 </div>
//                 <div className='flex-[2]'>
//                   <label className={labelUIClass}>Jumlah Panen</label>
//                   <input
//                     type='text'
//                     value={valString(mal.t_jumlah)}
//                     onChange={(e) =>
//                       handleMal(
//                         't_jumlah',
//                         e.target.value.replace(/[^0-9]/g, ''),
//                       )
//                     }
//                     className={inputUIClass}
//                     placeholder='0'
//                   />
//                 </div>
//               </div>
//               <div className='md:col-span-2'>
//                 <div className='flex items-center mb-1.5'>
//                   <label className={labelUIClass}>Jenis Sistem Pengairan</label>
//                 </div>
//                 <select
//                   value={mal.t_pengairan}
//                   onChange={(e) => handleMal('t_pengairan', e.target.value)}
//                   className={`${inputUIClass} cursor-pointer`}>
//                   <option value='tadah'>
//                     Irigasi Tadah Hujan / Alami (Zakat 10%)
//                   </option>
//                   <option value='berbayar'>Irigasi Berbayar (Zakat 5%)</option>
//                 </select>
//               </div>
//             </>
//           )}
//           {activeMalTab === 'Perusahaan' && (
//             <>
//               <NisabBox
//                 title1='Nisab Kas & Aset Perusahaan'
//                 val1={`77.5 Gram Emas = ${formatRp(NISAB_EMAS_RP)}`}
//               />
//               <div>
//                 <label className={labelUIClass}>Uang Tunai (Kas)</label>
//                 <input
//                   type='text'
//                   value={valString(mal.c_kas)}
//                   onChange={(e) =>
//                     handleMal('c_kas', e.target.value.replace(/[^0-9]/g, ''))
//                   }
//                   className={inputUIClass}
//                   placeholder='Rp 0'
//                 />
//               </div>
//               <div>
//                 <label className={labelUIClass}>Saldo Bank</label>
//                 <input
//                   type='text'
//                   value={valString(mal.c_bank)}
//                   onChange={(e) =>
//                     handleMal('c_bank', e.target.value.replace(/[^0-9]/g, ''))
//                   }
//                   className={inputUIClass}
//                   placeholder='Rp 0'
//                 />
//               </div>
//               <div>
//                 <label className={labelUIClass}>Piutang</label>
//                 <input
//                   type='text'
//                   value={valString(mal.c_piutang)}
//                   onChange={(e) =>
//                     handleMal(
//                       'c_piutang',
//                       e.target.value.replace(/[^0-9]/g, ''),
//                     )
//                   }
//                   className={inputUIClass}
//                   placeholder='Rp 0'
//                 />
//               </div>
//               <div>
//                 <label className={labelUIClass}>Persediaan Barang</label>
//                 <input
//                   type='text'
//                   value={valString(mal.c_barang)}
//                   onChange={(e) =>
//                     handleMal('c_barang', e.target.value.replace(/[^0-9]/g, ''))
//                   }
//                   className={inputUIClass}
//                   placeholder='Rp 0'
//                 />
//               </div>
//               <div className='md:col-span-2'>
//                 <label className={labelUIClass}>
//                   Utang Usaha Jangka Pendek
//                 </label>
//                 <input
//                   type='text'
//                   value={valString(mal.c_utang)}
//                   onChange={(e) =>
//                     handleMal('c_utang', e.target.value.replace(/[^0-9]/g, ''))
//                   }
//                   className={inputUIClass}
//                   placeholder='Rp 0'
//                 />
//               </div>
//             </>
//           )}
//           {activeMalTab === 'Properti' && (
//             <>
//               <NisabBox
//                 title1='Nisab Aset Properti Niaga'
//                 val1={`77.5 Gram Emas = ${formatRp(NISAB_EMAS_RP)}`}
//               />
//               <div>
//                 <label className={labelUIClass}>Tanah & Bangunan (Unit)</label>
//                 <input
//                   type='text'
//                   value={valString(mal.pr_bangunan)}
//                   onChange={(e) =>
//                     handleMal(
//                       'pr_bangunan',
//                       e.target.value.replace(/[^0-9]/g, ''),
//                     )
//                   }
//                   className={inputUIClass}
//                   placeholder='Rp 0'
//                 />
//               </div>
//               <div>
//                 <label className={labelUIClass}>Tanah Kavling Kosong</label>
//                 <input
//                   type='text'
//                   value={valString(mal.pr_tanah)}
//                   onChange={(e) =>
//                     handleMal('pr_tanah', e.target.value.replace(/[^0-9]/g, ''))
//                   }
//                   className={inputUIClass}
//                   placeholder='Rp 0'
//                 />
//               </div>
//               <div>
//                 <label className={labelUIClass}>Material Bangunan</label>
//                 <input
//                   type='text'
//                   value={valString(mal.pr_material)}
//                   onChange={(e) =>
//                     handleMal(
//                       'pr_material',
//                       e.target.value.replace(/[^0-9]/g, ''),
//                     )
//                   }
//                   className={inputUIClass}
//                   placeholder='Rp 0'
//                 />
//               </div>
//               <div>
//                 <label className={labelUIClass}>Uang Cash (Simpanan)</label>
//                 <input
//                   type='text'
//                   value={valString(mal.pr_cash)}
//                   onChange={(e) =>
//                     handleMal('pr_cash', e.target.value.replace(/[^0-9]/g, ''))
//                   }
//                   className={inputUIClass}
//                   placeholder='Rp 0'
//                 />
//               </div>
//               <div>
//                 <label className={labelUIClass}>Piutang Kredit</label>
//                 <input
//                   type='text'
//                   value={valString(mal.pr_piutang)}
//                   onChange={(e) =>
//                     handleMal(
//                       'pr_piutang',
//                       e.target.value.replace(/[^0-9]/g, ''),
//                     )
//                   }
//                   className={inputUIClass}
//                   placeholder='Rp 0'
//                 />
//               </div>
//               <div>
//                 <label className={labelUIClass}>Utang</label>
//                 <input
//                   type='text'
//                   value={valString(mal.pr_utang)}
//                   onChange={(e) =>
//                     handleMal('pr_utang', e.target.value.replace(/[^0-9]/g, ''))
//                   }
//                   className={inputUIClass}
//                   placeholder='Rp 0'
//                 />
//               </div>
//             </>
//           )}
//         </div>

//         {[
//           'Perdagangan',
//           'Peternakan',
//           'Tanaman Produktif',
//           'Perusahaan',
//           'Properti',
//         ].includes(activeMalTab) &&
//           zResult.hasInput && (
//             <div className='bg-slate-50 border border-slate-200 p-4 rounded-xl mt-4'>
//               <label className='flex items-start gap-3 cursor-pointer group'>
//                 <div className='relative flex items-center justify-center w-5 h-5 mt-0.5 shrink-0'>
//                   <input
//                     type='checkbox'
//                     checked={!!haul.tijarah}
//                     onChange={(e) => handleHaul('tijarah', e.target.checked)}
//                     className='peer appearance-none w-5 h-5 border-2 border-slate-300 rounded hover:border-teal-500 checked:bg-teal-600 checked:border-teal-600 transition-all cursor-pointer'
//                   />
//                   <CheckCircle2 className='w-3.5 h-3.5 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none' />
//                 </div>
//                 <span className='text-sm text-slate-700 font-semibold group-hover:text-teal-800 transition-colors leading-snug'>
//                   Harta ini telah diputar penuh selama 1 tahun buku (Syarat{' '}
//                   <strong className='text-teal-700'>Haul Hijriyah</strong>).
//                 </span>
//               </label>
//             </div>
//           )}
//         {activeMalTab === "Zakat An'am" && zResult.hasInput && (
//           <div className='bg-slate-50 border border-slate-200 p-4 rounded-xl mt-4'>
//             <label className='flex items-start gap-3 cursor-pointer group'>
//               <div className='relative flex items-center justify-center w-5 h-5 mt-0.5 shrink-0'>
//                 <input
//                   type='checkbox'
//                   checked={!!haul.anam}
//                   onChange={(e) => handleHaul('anam', e.target.checked)}
//                   className='peer appearance-none w-5 h-5 border-2 border-slate-300 rounded hover:border-teal-500 checked:bg-teal-600 checked:border-teal-600 transition-all cursor-pointer'
//                 />
//                 <CheckCircle2 className='w-3.5 h-3.5 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none' />
//               </div>
//               <span className='text-sm text-slate-700 font-semibold group-hover:text-teal-800 transition-colors leading-snug'>
//                 Hewan ternak (An'am) ini telah saya miliki secara penuh selama 1
//                 tahun (Syarat{' '}
//                 <strong className='text-teal-700'>Haul Hijriyah</strong>).
//               </span>
//             </label>
//           </div>
//         )}
//       </div>
//     );
//   };

//   // FULL PAGE LOADER KETIKA MENGAMBIL HARGA
//   if (isFetchingPrices) {
//     return (
//       <div className='min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4'>
//         <Loader2 className='w-12 h-12 text-teal-600 animate-spin' />
//         <p className='text-teal-800 font-bold animate-pulse'>
//           Menyiapkan Kalkulator Cerdas...
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className='pb-24 bg-slate-50 min-h-screen'>
//       <style
//         dangerouslySetInnerHTML={{
//           __html: `@keyframes marquee-text { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } } .animate-text-marquee { display: inline-block; white-space: nowrap; animation: marquee-text 15s linear infinite; } .animate-text-marquee:hover { animation-play-state: paused; }`,
//         }}
//       />

//       {/* HEADER HERO */}
//       <motion.div
//         initial='hidden'
//         whileInView='visible'
//         viewport={{ once: true, margin: '-50px' }}
//         variants={fadeInUp}
//         className='max-w-6xl mx-auto px-4 md:px-8 pt-8 relative z-10'>
//         <div className='bg-gradient-to-br from-teal-800 to-slate-800 rounded-[2.5rem] p-8 md:p-16 text-center relative overflow-hidden shadow-xl mb-8 group/header'>
//           <div className='absolute -left-10 -top-10 opacity-[0.05] group-hover/header:scale-125 transition-transform duration-1000 pointer-events-none'>
//             <Scale className='w-[300px] h-[300px] text-white' />
//           </div>
//           <div className='absolute -right-20 -bottom-20 opacity-[0.06] group-hover/header:scale-125 transition-transform duration-1000 pointer-events-none'>
//             <Calculator className='w-[400px] h-[400px] text-white' />
//           </div>
//           <div className='relative z-10 max-w-3xl mx-auto'>
//             <span className='inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-teal-100 text-[10px] font-bold uppercase tracking-widest mb-6 border border-white/10 shadow-sm'>
//               Kalkulator Cerdas
//             </span>
//             <h1 className='text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight'>
//               {data.judul || 'Layanan ZISWAF MNI'}
//             </h1>
//             <p className='text-base md:text-lg text-teal-50/80 font-medium leading-relaxed max-w-2xl mx-auto'>
//               {data.deskripsi ||
//                 'Kalkulasi akurat, pembayaran mudah, dan penyaluran transparan sesuai ketentuan mazhab terpercaya.'}
//             </p>
//           </div>
//         </div>
//       </motion.div>

//       <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20'>
//         <motion.div
//           initial='hidden'
//           whileInView='visible'
//           viewport={{ once: true }}
//           variants={fadeInUp}
//           className='bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex overflow-x-auto hide-scrollbar gap-2 mb-8'>
//           {['Zakat Fitrah', 'Zakat Mal', 'Fidyah', 'Infaq', 'Wakaf'].map(
//             (tab) => (
//               <button
//                 key={tab}
//                 onClick={() => setActiveTab(tab)}
//                 className={`shrink-0 flex-1 py-3 px-6 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${activeTab === tab ? 'bg-teal-700 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-teal-700'}`}>
//                 {tab}
//               </button>
//             ),
//           )}
//         </motion.div>

//         {activeTab !== 'Wakaf' ? (
//           <motion.div
//             initial='hidden'
//             whileInView='visible'
//             viewport={{ once: true }}
//             variants={fadeInUp}
//             className='grid grid-cols-1 lg:grid-cols-3 gap-8 items-start'>
//             <div className='lg:col-span-2 bg-white rounded-[2rem] p-6 md:p-10 shadow-sm border border-slate-100 relative overflow-hidden group/calc'>
//               <div className='absolute -right-10 -bottom-10 opacity-[0.02] group-hover/calc:scale-110 transition-transform duration-1000 pointer-events-none'>
//                 {activeTab === 'Zakat Fitrah' && (
//                   <Heart className='w-64 h-64 text-slate-800' />
//                 )}
//                 {activeTab === 'Zakat Mal' && (
//                   <Wallet className='w-64 h-64 text-slate-800' />
//                 )}
//                 {activeTab === 'Fidyah' && (
//                   <Wheat className='w-64 h-64 text-slate-800' />
//                 )}
//                 {activeTab === 'Infaq' && (
//                   <Coins className='w-64 h-64 text-slate-800' />
//                 )}
//               </div>
//               <h2 className='text-xl md:text-2xl font-semibold text-slate-800 mb-8 flex items-center relative z-10 tracking-tight'>
//                 {activeTab === 'Zakat Fitrah' && (
//                   <>
//                     <Heart className='w-6 h-6 mr-3 text-teal-600' /> Zakat
//                     Fitrah
//                   </>
//                 )}
//                 {activeTab === 'Zakat Mal' && (
//                   <>
//                     <Wallet className='w-6 h-6 mr-3 text-teal-600' /> Kalkulator
//                     Zakat Mal
//                   </>
//                 )}
//                 {activeTab === 'Fidyah' && (
//                   <>
//                     <Wheat className='w-6 h-6 mr-3 text-teal-600' /> Fidyah
//                     Puasa
//                   </>
//                 )}
//                 {activeTab === 'Infaq' && (
//                   <>
//                     <Coins className='w-6 h-6 mr-3 text-teal-600' /> Infaq &
//                     Shadaqoh
//                   </>
//                 )}
//               </h2>

//               <AnimatePresence mode='wait'>
//                 {activeTab === 'Zakat Fitrah' && (
//                   <motion.div
//                     key='fitrah'
//                     initial={{ opacity: 0, x: -10 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     exit={{ opacity: 0 }}
//                     className='space-y-6 relative z-10'>
//                     <div className='bg-slate-50 border border-slate-100 p-5 rounded-2xl relative overflow-hidden'>
//                       <div className='flex justify-between items-center relative z-10'>
//                         <div className='flex items-center'>
//                           <div className='w-10 h-10 bg-white shadow-sm text-teal-700 rounded-full flex items-center justify-center mr-4'>
//                             <Calculator className='w-5 h-5' />
//                           </div>
//                           <div>
//                             <p className='text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-0.5'>
//                               Rumus Ketetapan
//                             </p>
//                             <p className='text-slate-800 font-semibold text-sm md:text-base'>
//                               1 Jiwa = Rp{' '}
//                               {formatRp(harga.berasFitrah).replace('Rp', '')}
//                             </p>
//                           </div>
//                         </div>
//                         <button
//                           onClick={() => setShowFitrahInfo(!showFitrahInfo)}
//                           className={`w-9 h-9 flex items-center justify-center rounded-full border transition-all ${showFitrahInfo ? 'bg-teal-700 text-white border-teal-700' : 'bg-white border-slate-200 text-slate-400 hover:text-teal-700'}`}>
//                           <Info className='w-4 h-4' />
//                         </button>
//                       </div>
//                       <AnimatePresence>
//                         {showFitrahInfo && (
//                           <motion.div
//                             initial={{ height: 0, opacity: 0 }}
//                             animate={{ height: 'auto', opacity: 1 }}
//                             exit={{ height: 0, opacity: 0 }}
//                             className='relative z-10 overflow-hidden'>
//                             <div className='pt-4 mt-4 border-t border-slate-200/60 text-xs text-slate-500 leading-relaxed'>
//                               Secara syariat, zakat fitrah dibayarkan dalam
//                               bentuk makanan pokok sebesar{' '}
//                               <strong className='text-teal-700'>1 Sha'</strong>.
//                               Di Indonesia, takaran ini setara dengan{' '}
//                               <strong className='text-teal-700'>2,5 kg</strong>{' '}
//                               atau{' '}
//                               <strong className='text-teal-700'>
//                                 3,5 liter
//                               </strong>{' '}
//                               beras. Nilainya disetarakan dengan{' '}
//                               <strong className='text-teal-700'>
//                                 Rp{' '}
//                                 {formatRp(harga.berasFitrah).replace('Rp', '')}{' '}
//                                 per jiwa
//                               </strong>
//                               .
//                             </div>
//                           </motion.div>
//                         )}
//                       </AnimatePresence>
//                     </div>
//                     <div className='relative pt-2'>
//                       <label className='text-[11px] font-bold text-slate-500 mb-2 block uppercase tracking-wider'>
//                         Jumlah Tanggungan Keluarga
//                       </label>
//                       <div className='relative group/input'>
//                         <input
//                           type='text'
//                           value={valString(jiwa)}
//                           onChange={(e) =>
//                             setJiwa(e.target.value.replace(/[^0-9]/g, ''))
//                           }
//                           className={`${inputUIClass} text-lg pl-6 pr-16`}
//                           placeholder='0'
//                         />
//                         <span className='absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm'>
//                           Jiwa
//                         </span>
//                       </div>
//                     </div>
//                   </motion.div>
//                 )}
//                 {activeTab === 'Zakat Mal' && (
//                   <motion.div
//                     key='mal'
//                     initial={{ opacity: 0, x: -10 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     exit={{ opacity: 0 }}>
//                     {renderZakatMalForm()}
//                   </motion.div>
//                 )}
//                 {activeTab === 'Fidyah' && (
//                   <motion.div
//                     key='fidyah'
//                     initial={{ opacity: 0, x: -10 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     exit={{ opacity: 0 }}
//                     className='space-y-6'>
//                     <p className='text-sm text-slate-500 mb-2 leading-relaxed'>
//                       Fidyah diperuntukkan bagi yang uzur berpuasa. Ketetapan
//                       fidyah 1 hari puasa adalah 1 porsi makan mengenyangkan
//                       setara{' '}
//                       <strong className='text-teal-700'>
//                         {formatRp(harga.fidyah)}
//                       </strong>
//                       .
//                     </p>
//                     <div className='relative'>
//                       <label className='text-[11px] font-bold text-slate-500 mb-2 block uppercase tracking-wider'>
//                         Hutang Puasa
//                       </label>
//                       <div className='relative group/input'>
//                         <input
//                           type='text'
//                           value={valString(hariFidyah)}
//                           onChange={(e) =>
//                             setHariFidyah(e.target.value.replace(/[^0-9]/g, ''))
//                           }
//                           className={`${inputUIClass} text-lg pl-6 pr-16`}
//                           placeholder='0'
//                         />
//                         <span className='absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm'>
//                           Hari
//                         </span>
//                       </div>
//                     </div>
//                   </motion.div>
//                 )}
//                 {activeTab === 'Infaq' && (
//                   <motion.div
//                     key='infaq'
//                     initial={{ opacity: 0, x: -10 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     exit={{ opacity: 0 }}
//                     className='space-y-6'>
//                     <div>
//                       <label className='text-[11px] font-bold text-slate-500 mb-2 block uppercase tracking-wider'>
//                         Nominal Infaq / Sedekah
//                       </label>
//                       <div className='grid grid-cols-2 md:grid-cols-4 gap-3 mb-4'>
//                         {[50000, 100000, 250000, 500000].map((nom) => (
//                           <button
//                             key={nom}
//                             onClick={() => setInfaqNominal(nom.toString())}
//                             className={`py-3 rounded-xl font-semibold text-xs transition-all border ${parseNum(infaqNominal) === nom ? 'bg-teal-700 text-white border-teal-700 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-teal-500 hover:text-teal-700'}`}>
//                             {formatRp(nom).replace('Rp', '')}
//                           </button>
//                         ))}
//                       </div>
//                       <input
//                         type='text'
//                         value={valString(infaqNominal)}
//                         onChange={(e) =>
//                           setInfaqNominal(e.target.value.replace(/[^0-9]/g, ''))
//                         }
//                         className={inputUIClass}
//                         placeholder='Ketik nominal lain...'
//                       />
//                     </div>
//                     <div>
//                       <label className='text-[11px] font-bold text-slate-500 mb-2 block uppercase tracking-wider'>
//                         Tujuan Penyaluran
//                       </label>
//                       <select
//                         value={infaqTujuan}
//                         onChange={(e) => setInfaqTujuan(e.target.value)}
//                         className={`${inputUIClass} cursor-pointer`}>
//                         <option value='Operasional Masjid'>
//                           Operasional & Kemakmuran Masjid
//                         </option>
//                         <option value='Santunan Anak Yatim'>
//                           Santunan Anak Yatim & Dhuafa
//                         </option>
//                         <option value='Pembangunan Masjid'>
//                           Pembangunan Masjid
//                         </option>
//                       </select>
//                     </div>
//                   </motion.div>
//                 )}
//               </AnimatePresence>
//             </div>

//             {/* KANAN: SUMMARY */}
//             <div className='lg:col-span-1'>
//               <div className='bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 sticky top-8 relative overflow-hidden group/summary'>
//                 <div className='absolute -right-6 -bottom-6 opacity-[0.02] group-hover/summary:scale-125 transition-transform duration-1000 pointer-events-none'>
//                   <ShoppingBag className='w-48 h-48 text-slate-900' />
//                 </div>
//                 <h3 className='text-lg font-semibold text-slate-800 mb-6 flex items-center border-b border-slate-100 pb-4 relative z-10'>
//                   <div className='w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center mr-3 border border-slate-100'>
//                     <ShoppingBag className='w-4 h-4 text-teal-600' />
//                   </div>
//                   Ringkasan
//                 </h3>
//                 <div className='space-y-4 mb-6 relative z-10'>
//                   {activeTab === 'Zakat Fitrah' && (
//                     <div className='flex flex-col gap-3'>
//                       <div className='flex justify-between items-center text-sm'>
//                         <span className='text-slate-500'>Tanggungan</span>
//                         <span className='text-slate-800 font-semibold bg-slate-50 px-3 py-1 rounded-md border border-slate-100'>
//                           {parseNum(jiwa)} Jiwa
//                         </span>
//                       </div>
//                       <div className='flex justify-between items-center text-sm pb-3 border-b border-slate-100'>
//                         <span className='text-slate-500'>
//                           Beras (Ekuivalen)
//                         </span>
//                         <div className='text-right'>
//                           <span className='text-slate-800 font-semibold block'>
//                             {parseNum(jiwa) > 0
//                               ? (parseNum(jiwa) * 2.5).toFixed(1)
//                               : 0}{' '}
//                             Kg
//                           </span>
//                           <span className='text-slate-400 text-[10px] uppercase'>
//                             {parseNum(jiwa) > 0
//                               ? (parseNum(jiwa) * 3.5).toFixed(1)
//                               : 0}{' '}
//                             Liter
//                           </span>
//                         </div>
//                       </div>
//                       <div className='flex justify-between items-center text-sm pt-1'>
//                         <span className='text-slate-500'>Total Rupiah</span>
//                         <span className='text-slate-800 font-semibold'>
//                           {formatRp(parseNum(jiwa) * harga.berasFitrah)}
//                         </span>
//                       </div>
//                     </div>
//                   )}

//                   {activeTab === 'Fidyah' && (
//                     <div className='flex justify-between items-center text-sm font-medium'>
//                       <span className='text-slate-500'>
//                         Fidyah ({parseNum(hariFidyah)} Hari)
//                       </span>
//                       <span className='text-slate-800'>
//                         {formatRp(parseNum(hariFidyah) * harga.fidyah)}
//                       </span>
//                     </div>
//                   )}

//                   {activeTab === 'Infaq' && (
//                     <>
//                       <div className='flex justify-between items-center text-sm pb-2 mb-2 border-b border-slate-100'>
//                         <span className='text-slate-500'>Kategori</span>
//                         <span className='text-slate-800 font-semibold text-right max-w-[150px] truncate'>
//                           {infaqTujuan}
//                         </span>
//                       </div>
//                       <div className='flex justify-between items-center text-sm'>
//                         <span className='text-slate-500'>Nominal Infaq</span>
//                         <span className='text-slate-800 font-semibold'>
//                           {formatRp(parseNum(infaqNominal))}
//                         </span>
//                       </div>
//                     </>
//                   )}

//                   {activeTab === 'Zakat Mal' && zResult.hasInput && (
//                     <>
//                       {activeMalTab === 'Emas, Perak & Perhiasan' ? (
//                         <div className='space-y-3 border-b border-slate-100 pb-3 mb-2'>
//                           <p className='text-xs font-bold text-slate-400 uppercase tracking-widest mb-2'>
//                             Rincian Zakat
//                           </p>
//                           {zResult.items.map((item: any, i: number) => (
//                             <div
//                               key={i}
//                               className='flex justify-between items-center text-sm'>
//                               <span
//                                 className={`text-slate-500 ${!item.wajib && 'line-through opacity-50'}`}>
//                                 {item.name}
//                               </span>
//                               <span
//                                 className={`font-semibold ${item.wajib ? 'text-slate-800' : 'text-slate-400'}`}>
//                                 {formatRp(item.zakat)}
//                               </span>
//                             </div>
//                           ))}
//                         </div>
//                       ) : activeMalTab === 'Pertanian' ||
//                         activeMalTab === "Zakat An'am" ? (
//                         <div className='flex flex-col gap-2 border-b border-slate-100 pb-3 mb-2 overflow-hidden'>
//                           <div className='flex justify-between items-center text-sm'>
//                             <span className='text-slate-500 shrink-0'>
//                               Objek Zakat Wajib
//                             </span>
//                             <span
//                               className={`font-semibold text-right ${zResult.statusWajib ? 'text-slate-800' : 'text-slate-400'}`}>
//                               {activeMalTab === 'Pertanian'
//                                 ? `${parseNum(mal.t_jumlah).toLocaleString('id-ID')} ${mal.t_satuan.toUpperCase()}`
//                                 : `${parseNum(mal.an_jumlah).toLocaleString('id-ID')} Ekor`}
//                             </span>
//                           </div>
//                           {zResult.statusWajib && (
//                             <div className='flex justify-between items-center text-sm pt-2 border-t border-slate-50'>
//                               <span className='text-slate-500 mt-1 shrink-0'>
//                                 Wajib Zakat
//                               </span>
//                               <div className='flex items-center text-right justify-end max-w-[65%] overflow-hidden relative group/mq'>
//                                 <div className='animate-text-marquee font-bold text-teal-700 leading-snug cursor-default'>
//                                   {zResult.wajibZakatTeks}{' '}
//                                   &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{' '}
//                                   {zResult.wajibZakatTeks}
//                                 </div>
//                                 <InfoIcon
//                                   title='Dasar Perhitungan Zakat'
//                                   desc={zResult.alasanMatematis}
//                                 />
//                               </div>
//                             </div>
//                           )}
//                         </div>
//                       ) : (
//                         <div className='flex justify-between items-center text-sm pb-3 mb-2 border-b border-slate-100'>
//                           <span className='text-slate-500'>
//                             Estimasi Bersih
//                           </span>
//                           <span className='text-slate-800 font-semibold'>
//                             {formatRp(zResult.totalHarta)}
//                           </span>
//                         </div>
//                       )}

//                       {!['Pertanian', "Zakat An'am"].includes(activeMalTab) && (
//                         <div className='flex justify-between items-center text-sm font-semibold mt-2'>
//                           <span className='text-slate-500'>
//                             Zakat Wajib (2.5%)
//                           </span>
//                           <span className='text-slate-800'>
//                             {zResult.statusWajib
//                               ? formatRp(zResult.wajibZakatRp)
//                               : 'Rp 0'}
//                           </span>
//                         </div>
//                       )}
//                     </>
//                   )}
//                 </div>

//                 <div className='border-t border-slate-200 pt-5 mb-6 relative z-10'>
//                   <span className='text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1'>
//                     Kalkulasi Final Tunai
//                   </span>
//                   {activeTab === 'Zakat Mal' && zResult.hasInput ? (
//                     <div className='flex items-center justify-between mt-1'>
//                       <span
//                         className={`text-xl md:text-2xl font-semibold tracking-tight block leading-tight ${!zResult.statusWajib ? 'text-orange-600' : 'text-teal-800'}`}>
//                         {!zResult.statusWajib
//                           ? 'Belum Wajib'
//                           : formatRp(zResult.wajibZakatRp)}
//                       </span>
//                       <button
//                         onClick={handleShowFinalInfo}
//                         className={`p-1.5 rounded-full transition-colors shrink-0 ${!zResult.statusWajib ? 'hover:bg-orange-50' : 'hover:bg-teal-50'}`}
//                         title='Lihat Penjelasan'>
//                         <Info
//                           className={`w-6 h-6 ${!zResult.statusWajib ? 'text-orange-500' : 'text-teal-600'}`}
//                         />
//                       </button>
//                     </div>
//                   ) : (
//                     <span className='text-xl md:text-2xl font-semibold text-teal-800 tracking-tight block mt-1'>
//                       {formatRp(getNominalBayar())}
//                     </span>
//                   )}
//                 </div>

//                 <button
//                   onClick={() => setIsCheckoutOpen(true)}
//                   disabled={
//                     (activeTab === 'Zakat Fitrah' && parseNum(jiwa) === 0) ||
//                     (activeTab === 'Fidyah' && parseNum(hariFidyah) === 0) ||
//                     (activeTab === 'Infaq' && parseNum(infaqNominal) === 0) ||
//                     (activeTab === 'Zakat Mal' &&
//                       (!zResult.statusWajib ||
//                         (!zResult.wajibZakatRp && !zResult.wajibZakatTeks)))
//                   }
//                   className='relative z-10 w-full bg-teal-700 hover:bg-teal-800 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-teal-700 shadow-md shadow-teal-900/10'>
//                   Selesaikan Pembayaran
//                 </button>
//               </div>
//             </div>
//           </motion.div>
//         ) : (
//           /* ======================================= */
//           /* WAKAF (DIJAMIN MUNCUL KARNA FALLBACK)   */
//           /* ======================================= */
//           <motion.div
//             initial='visible'
//             animate='visible'
//             variants={staggerContainer}
//             className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
//             {safeWakafList.map((wakaf: any) => {
//               const persentase = Math.min(
//                 (wakaf.terkumpul / wakaf.target) * 100,
//                 100,
//               );
//               return (
//                 <motion.div
//                   variants={fadeInUp}
//                   key={wakaf.id}
//                   className='bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all group flex flex-col h-full relative'>
//                   <div className='absolute -right-8 -bottom-8 opacity-[0.03] group-hover:scale-125 transition-transform duration-700 pointer-events-none z-0'>
//                     {wakaf.judul.toLowerCase().includes('atap') ? (
//                       <Building2 className='w-48 h-48 text-teal-900' />
//                     ) : (
//                       <Trees className='w-48 h-48 text-teal-900' />
//                     )}
//                   </div>
//                   <div className='h-48 relative overflow-hidden shrink-0 z-10'>
//                     <img
//                       src={wakaf.gambar_url}
//                       alt={wakaf.judul}
//                       className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-700'
//                     />
//                     <div className='absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent'></div>
//                     <span className='absolute top-4 left-4 bg-white/20 backdrop-blur-md text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-white/20'>
//                       Peluang Jariyah
//                     </span>
//                     <h3 className='absolute bottom-4 left-4 right-4 text-white font-bold text-xl leading-snug'>
//                       {wakaf.judul}
//                     </h3>
//                   </div>
//                   <div className='p-6 flex flex-col flex-1 relative z-10'>
//                     <p className='text-sm text-slate-500 mb-6 flex-1 leading-relaxed'>
//                       {wakaf.deskripsi}
//                     </p>
//                     <div className='mt-auto shrink-0'>
//                       <div className='flex justify-between items-end mb-2'>
//                         <span className='text-[10px] font-semibold text-slate-400 uppercase tracking-widest'>
//                           Terkumpul
//                         </span>
//                         <span className='text-sm font-semibold text-slate-800'>
//                           {formatRp(wakaf.terkumpul)}
//                         </span>
//                       </div>
//                       <div className='w-full bg-slate-100 rounded-full h-1.5 mb-2 overflow-hidden flex'>
//                         <motion.div
//                           initial={{ width: 0 }}
//                           whileInView={{ width: `${persentase}%` }}
//                           transition={{ duration: 1, delay: 0.5 }}
//                           className='bg-teal-600 h-full rounded-full'></motion.div>
//                       </div>
//                       <div className='flex justify-between items-center mb-6'>
//                         <span className='text-xs font-bold text-teal-700'>
//                           {persentase.toFixed(1)}%
//                         </span>
//                         <span className='text-[10px] font-medium text-slate-400'>
//                           Target: {formatRp(wakaf.target)}
//                         </span>
//                       </div>
//                       <button
//                         onClick={() => {
//                           setWakafTujuan(wakaf.judul);
//                           setWakafNominal(''); // Reset nominal ketika membuka form wakaf baru
//                           setIsCheckoutOpen(true);
//                         }}
//                         className='w-full bg-teal-700 text-white hover:bg-teal-800 font-semibold py-3.5 rounded-xl transition-all text-sm shadow-md shadow-teal-900/10'>
//                         Wakaf Sekarang
//                       </button>
//                     </div>
//                   </div>
//                 </motion.div>
//               );
//             })}
//           </motion.div>
//         )}
//       </div>

//       {/* SEKSI TRANSAPARANSI ZISWAF */}
//       <motion.div
//         initial='hidden'
//         whileInView='visible'
//         viewport={{ once: true }}
//         variants={fadeInUp}
//         className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 relative z-20'>
//         <div className='text-center mb-10'>
//           <span className='inline-flex items-center justify-center p-3 bg-white border border-slate-100 rounded-2xl mb-4 shadow-sm text-teal-600'>
//             <Users className='w-6 h-6' />
//           </span>
//           <h2 className='text-2xl md:text-3xl font-bold text-slate-800 mb-3'>
//             Transparansi Penyaluran ZISWAF
//           </h2>
//           <p className='text-sm text-slate-500 max-w-2xl mx-auto'>
//             Kami berkomitmen menjaga amanah jamaah dengan melaporkan penerimaan
//             dana secara real-time dan terbuka.
//           </p>
//         </div>

//         {isLoadingStats ? (
//           <div className='flex justify-center items-center h-32'>
//             <Loader2 className='w-8 h-8 text-teal-600 animate-spin' />
//           </div>
//         ) : (
//           <>
//             <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-8'>
//               {[
//                 {
//                   title: 'Zakat Fitrah',
//                   val: formatRp(realStats.fitrahRp),
//                   sub: `+ ${realStats.fitrahKg} Kg Beras`,
//                   don: realStats.donaturFitrah,
//                   icon: <Heart className='w-24 h-24 text-slate-800' />,
//                 },
//                 {
//                   title: 'Zakat Mal',
//                   val: formatRp(realStats.mal),
//                   don: realStats.donaturMal,
//                   icon: <Wallet className='w-24 h-24 text-slate-800' />,
//                 },
//                 {
//                   title: 'Total Infaq',
//                   val: formatRp(realStats.infaq),
//                   don: realStats.donaturInfaq,
//                   icon: <Coins className='w-24 h-24 text-slate-800' />,
//                 },
//                 {
//                   title: 'Total Wakaf',
//                   val: formatRp(realStats.wakaf),
//                   don: realStats.donaturWakaf,
//                   icon: <Building2 className='w-24 h-24 text-slate-800' />,
//                 },
//               ].map((stat, idx) => (
//                 <div
//                   key={idx}
//                   className='bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center relative overflow-hidden group'>
//                   <div className='absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-700 pointer-events-none'>
//                     {stat.icon}
//                   </div>
//                   <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 relative z-10'>
//                     {stat.title}
//                   </p>
//                   <p className='text-lg md:text-xl font-bold text-teal-700 leading-tight relative z-10'>
//                     {stat.val}
//                   </p>
//                   {stat.sub && (
//                     <p className='text-xs font-semibold text-slate-500 mt-1 relative z-10'>
//                       {stat.sub}
//                     </p>
//                   )}
//                   <p className='text-[10px] text-slate-400 mt-3 pt-3 border-t border-slate-50 relative z-10'>
//                     {stat.don} Donatur Tersalurkan
//                   </p>
//                 </div>
//               ))}
//             </div>

//             <div className='bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden'>
//               <div className='p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center'>
//                 <h3 className='font-bold text-slate-800'>Donatur Terkini</h3>
//                 <span className='text-xs font-semibold text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-100 flex items-center'>
//                   <span className='w-2 h-2 bg-teal-500 rounded-full mr-2 animate-pulse'></span>{' '}
//                   Live Update
//                 </span>
//               </div>
//               <div className='divide-y divide-slate-100'>
//                 {realDonatur.length === 0 ? (
//                   <p className='p-6 text-center text-sm text-slate-400'>
//                     Belum ada data penyaluran disahkan.
//                   </p>
//                 ) : (
//                   realDonatur.map((don, idx) => (
//                     <div
//                       key={idx}
//                       className='p-4 md:p-6 flex items-center justify-between hover:bg-slate-50 transition-colors'>
//                       <div className='flex items-center gap-4'>
//                         <div className='w-10 h-10 rounded-full bg-gradient-to-br from-teal-50 to-slate-100 border border-slate-200 flex items-center justify-center text-teal-700 font-bold text-sm shrink-0'>
//                           {maskNameStyle(don.nama, don.is_anonim).charAt(0)}
//                         </div>
//                         <div>
//                           <p className='font-semibold text-slate-800 text-sm'>
//                             {maskNameStyle(don.nama, don.is_anonim)}
//                           </p>
//                           <p className='text-xs text-slate-500 mt-0.5'>
//                             {don.kategori}
//                           </p>
//                         </div>
//                       </div>
//                       <div className='text-right'>
//                         <p className='text-[10px] md:text-xs font-semibold text-slate-400'>
//                           {new Date(don.created_at).toLocaleDateString(
//                             'id-ID',
//                             { day: 'numeric', month: 'short' },
//                           )}
//                         </p>
//                       </div>
//                     </div>
//                   ))
//                 )}
//               </div>
//             </div>
//           </>
//         )}
//       </motion.div>

//       {/* ================= MODAL CHECKOUT ZISWAF ================= */}
//       <AnimatePresence>
//         {isCheckoutOpen && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className='fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto'>
//             <motion.div
//               initial={{ scale: 0.95, opacity: 0, y: 20 }}
//               animate={{ scale: 1, opacity: 1, y: 0 }}
//               exit={{ scale: 0.95, opacity: 0, y: 20 }}
//               className='bg-white rounded-[2rem] w-full max-w-3xl my-8 relative shadow-2xl overflow-hidden flex flex-col'>
//               <div className='bg-teal-800 p-6 flex justify-between items-center text-white shrink-0'>
//                 <div>
//                   <h2 className='text-xl font-bold'>Formulir Penyaluran</h2>
//                   <p className='text-teal-100 text-sm mt-1'>
//                     {getKategoriCheckout()}
//                   </p>
//                 </div>
//                 <button
//                   onClick={() => setIsCheckoutOpen(false)}
//                   className='p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors'>
//                   <X className='w-6 h-6' />
//                 </button>
//               </div>

//               <div className='p-6 md:p-8 overflow-y-auto max-h-[75vh]'>
//                 <form
//                   onSubmit={handleCheckoutSubmit}
//                   className='space-y-6'>
//                   {/* FIX: INPUT NOMINAL WAKAF JIKA TAB WAKAF DIPILIH */}
//                   {activeTab === 'Wakaf' ? (
//                     <div className='bg-slate-50 border border-slate-200 p-5 rounded-2xl'>
//                       <label className={labelUIClass}>Nominal Wakaf Anda</label>
//                       <input
//                         type='text'
//                         required
//                         value={valString(wakafNominal)}
//                         onChange={(e) =>
//                           setWakafNominal(e.target.value.replace(/[^0-9]/g, ''))
//                         }
//                         className={inputUIClass}
//                         placeholder='Rp 0'
//                       />
//                     </div>
//                   ) : (
//                     <div className='bg-slate-50 border border-slate-200 p-5 rounded-2xl flex justify-between items-center'>
//                       <span className='font-semibold text-slate-600'>
//                         Total Pembayaran:
//                       </span>
//                       <span className='text-2xl font-bold text-teal-700'>
//                         {formatRp(getNominalBayar())}
//                       </span>
//                     </div>
//                   )}

//                   <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
//                     <div className='md:col-span-2'>
//                       <label className='block text-sm font-bold text-slate-700 mb-2'>
//                         Nama Lengkap Donatur *
//                       </label>
//                       <div className='relative'>
//                         <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
//                           <User className='h-5 w-5 text-slate-400' />
//                         </div>
//                         <input
//                           name='nama'
//                           type='text'
//                           required
//                           placeholder='Contoh: Budi Santoso'
//                           className='w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600/30 focus:border-teal-500 outline-none transition-all font-semibold'
//                         />
//                       </div>
//                       <label className='flex items-center mt-3 cursor-pointer group w-max'>
//                         <input
//                           type='checkbox'
//                           checked={isAnonim}
//                           onChange={(e) => setIsAnonim(e.target.checked)}
//                           className='w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer'
//                         />
//                         <span className='ml-2 text-sm text-slate-600 font-medium group-hover:text-teal-700 transition-colors'>
//                           Samarkan nama saya (misal: B**i S*****o) di daftar
//                           donatur publik.
//                         </span>
//                       </label>
//                     </div>

//                     <div>
//                       <label className='block text-sm font-bold text-slate-700 mb-2'>
//                         Nomor WhatsApp *
//                       </label>
//                       <div className='relative'>
//                         <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
//                           <Phone className='h-5 w-5 text-slate-400' />
//                         </div>
//                         <input
//                           name='whatsapp'
//                           type='tel'
//                           required
//                           placeholder='0812xxxxxx'
//                           className='w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600/30 focus:border-teal-500 outline-none transition-all font-semibold'
//                         />
//                       </div>
//                     </div>
//                     <div>
//                       <label className='block text-sm font-bold text-slate-700 mb-2'>
//                         Alamat Email *
//                       </label>
//                       <div className='relative'>
//                         <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
//                           <Mail className='h-5 w-5 text-slate-400' />
//                         </div>
//                         <input
//                           name='email'
//                           type='email'
//                           required
//                           placeholder='email@anda.com'
//                           className='w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600/30 focus:border-teal-500 outline-none transition-all font-semibold'
//                         />
//                       </div>
//                     </div>

//                     <div className='md:col-span-2'>
//                       <label className='block text-sm font-bold text-slate-700 mb-2'>
//                         Pesan / Titipan Doa (Opsional)
//                       </label>
//                       <div className='relative'>
//                         <div className='absolute top-4 left-4 pointer-events-none'>
//                           <MessageSquare className='h-5 w-5 text-slate-400' />
//                         </div>
//                         <textarea
//                           name='pesan'
//                           rows={3}
//                           placeholder='Tuliskan doa atau niat penyaluran Anda di sini...'
//                           className='w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600/30 focus:border-teal-500 outline-none transition-all font-medium resize-none'
//                         />
//                       </div>
//                     </div>

//                     <div className='md:col-span-2 bg-teal-50/50 border border-teal-100 rounded-2xl p-6'>
//                       <div className='flex items-center space-x-2 text-teal-800 font-bold mb-3'>
//                         <ShieldCheck className='w-5 h-5' />
//                         <h4>Instruksi Pembayaran</h4>
//                       </div>
//                       <p className='text-sm text-slate-600 mb-4 leading-relaxed'>
//                         Silakan transfer nominal{' '}
//                         <strong className='text-teal-700'>
//                           {formatRp(getNominalBayar())}
//                         </strong>{' '}
//                         ke rekening resmi{' '}
//                         <strong>
//                           Bank Syariah Indonesia (BSI) 712 345 6789 a.n Masjid
//                           Nurul Iman
//                         </strong>
//                         . Setelah itu, unggah bukti transfer Anda di bawah ini:
//                       </p>

//                       <div className='relative border-2 border-dashed border-teal-200 bg-white rounded-xl p-8 text-center hover:bg-teal-50/50 transition-colors cursor-pointer overflow-hidden'>
//                         <UploadCloud className='w-10 h-10 text-teal-600 mx-auto mb-3' />
//                         <p className='text-sm text-slate-700 font-semibold'>
//                           {checkoutFile ? (
//                             <span className='text-teal-700'>
//                               {checkoutFile.name}
//                             </span>
//                           ) : (
//                             'Klik untuk memilih foto / screenshot bukti transfer'
//                           )}
//                         </p>
//                         <input
//                           type='file'
//                           accept='image/*'
//                           onChange={(e) =>
//                             setCheckoutFile(e.target.files?.[0] || null)
//                           }
//                           className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
//                           required
//                         />
//                       </div>
//                     </div>
//                   </div>

//                   <div className='pt-4'>
//                     <button
//                       type='submit'
//                       disabled={isSubmitting}
//                       className='w-full flex items-center justify-center space-x-2 bg-teal-700 text-white py-4 rounded-xl font-bold text-lg hover:bg-teal-800 transition-colors shadow-md disabled:bg-slate-400 disabled:cursor-not-allowed'>
//                       <span>Selanjutnya</span>
//                     </button>
//                   </div>
//                 </form>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* POP-UP KONFIRMASI NIAT SEBELUM KIRIM API */}
//       <AnimatePresence>
//         {showNiatModal && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className='fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md'>
//             <div className='bg-white rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl relative'>
//               <div className='w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4'>
//                 <Heart className='w-8 h-8' />
//               </div>
//               <h3 className='text-2xl font-bold text-slate-800 mb-2'>
//                 Konfirmasi & Niat
//               </h3>
//               <p className='text-sm text-slate-500 mb-6'>
//                 Pastikan data dan bukti transfer Anda sudah benar. Mari
//                 sempurnakan amal ibadah Anda dengan membaca niat berikut:
//               </p>

//               <div className='bg-teal-50 border border-teal-100 rounded-2xl p-6 mb-8'>
//                 <p
//                   className='text-2xl font-bold text-teal-900 leading-relaxed mb-4'
//                   dir='rtl'>
//                   {getNiatData().arab}
//                 </p>
//                 <p className='text-sm font-medium text-teal-700 italic'>
//                   "{getNiatData().arti}"
//                 </p>
//               </div>

//               <div className='flex gap-4'>
//                 <button
//                   onClick={() => setShowNiatModal(false)}
//                   className='flex-1 py-3.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200'>
//                   Cek Kembali
//                 </button>
//                 <button
//                   onClick={executeFinalCheckout}
//                   disabled={isSubmitting}
//                   className='flex-1 py-3.5 rounded-xl font-bold text-white bg-teal-700 hover:bg-teal-800 flex items-center justify-center'>
//                   {isSubmitting ? (
//                     <Loader2 className='w-5 h-5 animate-spin' />
//                   ) : (
//                     'Bismillah, Kirim'
//                   )}
//                 </button>
//               </div>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* MODALS ALASAN & TOOLTIPS */}
//       <AnimatePresence>
//         {activeTooltip && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className='fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm'
//             onClick={() => setActiveTooltip(null)}>
//             <motion.div
//               initial={{ scale: 0.95, opacity: 0, y: 20 }}
//               animate={{ scale: 1, opacity: 1, y: 0 }}
//               exit={{ scale: 0.95, opacity: 0, y: 20 }}
//               onClick={(e) => e.stopPropagation()}
//               className='bg-white rounded-[2rem] p-6 max-w-sm w-full shadow-2xl relative'>
//               <button
//                 onClick={() => setActiveTooltip(null)}
//                 className='absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors'>
//                 <X className='w-5 h-5' />
//               </button>
//               <h3 className='text-base font-bold text-slate-800 mb-3 pr-6'>
//                 {activeTooltip.title}
//               </h3>
//               <p className='text-sm text-slate-600 leading-relaxed font-medium whitespace-pre-line'>
//                 {activeTooltip.desc}
//               </p>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       <AnimatePresence>
//         {showAlasan && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className='fixed inset-0 z-[55] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm'
//             onClick={() => setShowAlasan(null)}>
//             <motion.div
//               initial={{ scale: 0.95, opacity: 0, y: 20 }}
//               animate={{ scale: 1, opacity: 1, y: 0 }}
//               exit={{ scale: 0.95, opacity: 0, y: 20 }}
//               onClick={(e) => e.stopPropagation()}
//               className='bg-white rounded-[2rem] p-6 md:p-8 max-w-md w-full shadow-2xl relative'>
//               <button
//                 onClick={() => setShowAlasan(null)}
//                 className='absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors'>
//                 <X className='w-5 h-5' />
//               </button>
//               <div
//                 className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 border ${showAlasan.includes('Belum') || showAlasan.includes('belum') || showAlasan.includes('kurang') ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-teal-50 text-teal-600 border-teal-100'}`}>
//                 <AlertCircle className='w-6 h-6' />
//               </div>
//               <h3 className='text-lg font-bold text-slate-800 mb-3'>
//                 Penjelasan Sistem Matematis
//               </h3>
//               <p className='text-sm text-slate-600 leading-relaxed font-medium whitespace-pre-line'>
//                 {showAlasan}
//               </p>
//               <button
//                 onClick={() => setShowAlasan(null)}
//                 className='w-full mt-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-xl transition-colors'>
//                 Saya Mengerti
//               </button>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }
//
//
//
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator,
  Heart,
  Wallet,
  Wheat,
  Coins,
  Info,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  Scale,
  X,
  Building2,
  Trees,
  Users,
  UploadCloud,
  User,
  Phone,
  Mail,
  MessageSquare,
  Loader2,
  ShieldCheck,
  QrCode,
} from 'lucide-react';
import { supabase } from '../../lib/supabase'; // Sesuaikan path Supabase Anda

export default function ZiswafCalculator({
  data,
  wakafList,
  isEditor = false,
}: any) {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const [currentDate, setCurrentDate] = useState('');
  useEffect(() => {
    setCurrentDate(
      new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    );
  }, []);

  // ================= STATE HARGA DINAMIS (DARI CMS) =================
  const [isFetchingPrices, setIsFetchingPrices] = useState(true);

  // SUNTIKAN 1: STATE METODE BAYAR & WAKAF DINAMIS DARI CMS
  const [metodeBayar, setMetodeBayar] = useState({
    rekening: 'Bank BSI 712 345 6789 a.n Masjid MNI',
    qrisUrl: '',
  });
  const [dynamicWakafList, setDynamicWakafList] = useState<any[]>([]);

  const [harga, setHarga] = useState({
    emas: 1350000,
    perak: 15000,
    berasFitrah: 45000,
    fidyah: 40000,
    berasTani: 16500,
    gabahTani: 7500,
    hewan: {
      kambing: 3000000,
      tabi: 12000000,
      musinnah: 17000000,
      bintu_makhad: 25000000,
      bintu_labun: 35000000,
      hiqqah: 45000000,
      jadzah: 55000000,
    },
  });

  // Ketetapan Syariat (Statis)
  const NISAB_EMAS_GRAM = 77.5;
  const NISAB_PERAK_GRAM = 543.35;

  // Nilai Rupiah Dinamis
  const NISAB_EMAS_RP = NISAB_EMAS_GRAM * harga.emas;
  const NISAB_PERAK_RP = NISAB_PERAK_GRAM * harga.perak;

  useEffect(() => {
    const fetchHargaKatalog = async () => {
      try {
        const { data, error } = await supabase
          .from('ziswaf')
          .select('*')
          .eq('id', 1)
          .single();
        if (data && !error) {
          setHarga({
            emas: data.harga_emas,
            perak: data.harga_perak,
            berasFitrah: data.harga_beras_fitrah,
            fidyah: data.harga_fidyah,
            berasTani: data.harga_beras_tani,
            gabahTani: data.harga_gabah_tani,
            hewan: {
              kambing: data.harga_kambing,
              tabi: data.harga_sapi_tabi,
              musinnah: data.harga_sapi_musinnah,
              bintu_makhad: data.harga_unta_bintu_makhad,
              bintu_labun: data.harga_unta_bintu_labun,
              hiqqah: data.harga_unta_hiqqah,
              jadzah: data.harga_unta_jadzah,
            },
          });
        }

        // SUNTIKAN 2: AMBIL PENGATURAN REKENING, QRIS, & JSON WAKAF DARI WEB
        const { data: webData } = await supabase
          .from('pengaturan_web')
          .select('*');
        if (webData) {
          const rek = webData.find((s) => s.kunci === 'rekening_ziswaf')?.nilai;
          const qris = webData.find(
            (s) => s.kunci === 'qris_ziswaf_url',
          )?.nilai;
          if (rek || qris)
            setMetodeBayar({
              rekening: rek || 'Bank BSI 712 345 6789 a.n Masjid MNI',
              qrisUrl: qris || '',
            });

          const wakafDataStr = webData.find(
            (s) => s.kunci === 'wakaf_programs_data',
          )?.nilai;
          if (wakafDataStr) {
            try {
              setDynamicWakafList(JSON.parse(wakafDataStr));
            } catch (e) {
              console.error('Error parse JSON wakaf', e);
            }
          }
        }
      } catch (err) {
        console.error('Gagal memuat harga ziswaf dari database', err);
      } finally {
        setIsFetchingPrices(false);
      }
    };
    fetchHargaKatalog();
  }, []);

  const defaultWakafList = [
    {
      id: 1,
      judul: 'Penggantian Atap Masjid',
      deskripsi:
        'Peremajaan struktur atap dan kubah masjid yang sudah termakan usia.',
      target: 250000000,
      terkumpul: 120000000,
      gambar_url:
        'https://images.unsplash.com/photo-1552858725-2758b5fb1286?auto=format&fit=crop&q=80',
    },
    {
      id: 2,
      judul: 'Pengadaan Kusen & Pintu Jati',
      deskripsi:
        'Penggantian kusen dan pintu utama masjid menggunakan kayu jati berkualitas.',
      target: 85000000,
      terkumpul: 15000000,
      gambar_url:
        'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&q=80',
    },
  ];

  const safeWakafList =
    Array.isArray(wakafList) && wakafList.length > 0
      ? wakafList
      : defaultWakafList;

  // SUNTIKAN 3: Gunakan list wakaf dinamis jika ada, kalau tidak fallback ke atas
  const safeWakafListToRender =
    dynamicWakafList.length > 0 ? dynamicWakafList : safeWakafList;

  const [activeTab, setActiveTab] = useState('Zakat Fitrah');
  const malCategories = [
    'Profesi',
    'Emas, Perak & Perhiasan',
    'Perdagangan',
    'Peternakan',
    "Zakat An'am",
    'Tanaman Produktif',
    'Pertanian',
    'Perusahaan',
    'Properti',
  ];
  const [activeMalTab, setActiveMalTab] = useState('Profesi');

  const [jiwa, setJiwa] = useState<string>('');
  const [showFitrahInfo, setShowFitrahInfo] = useState(false);
  const [hariFidyah, setHariFidyah] = useState<string>('');

  const [mal, setMal] = useState({
    p_in: '',
    p_out: '',
    s_emas: '',
    s_perak: '',
    s_p_emas: '',
    s_p_perak: '',
    d_modal: '',
    d_laba: '',
    d_piutang: '',
    d_utang: '',
    c_kas: '',
    c_bank: '',
    c_piutang: '',
    c_barang: '',
    c_utang: '',
    pr_bangunan: '',
    pr_tanah: '',
    pr_material: '',
    pr_cash: '',
    pr_piutang: '',
    pr_utang: '',
    pt_modal: '',
    pt_laba: '',
    pt_piutang: '',
    pt_utang: '',
    an_jenis: 'kambing',
    an_jumlah: '',
    tp_modal: '',
    tp_laba: '',
    tp_piutang: '',
    tp_utang: '',
    t_jenis: 'beras',
    t_satuan: 'kg',
    t_jumlah: '',
    t_pengairan: 'tadah',
  });

  const [haul, setHaul] = useState<Record<string, boolean>>({});
  const [showAlasan, setShowAlasan] = useState<string | null>(null);
  const [activeTooltip, setActiveTooltip] = useState<{
    title: string;
    desc: string;
  } | null>(null);
  const [infaqNominal, setInfaqNominal] = useState<string>('');
  const [infaqTujuan, setInfaqTujuan] = useState('Operasional Masjid');

  // STATE KHUSUS UNTUK WAKAF
  const [wakafNominal, setWakafNominal] = useState<string>('');
  const [wakafTujuan, setWakafTujuan] = useState('');

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [showNiatModal, setShowNiatModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutFile, setCheckoutFile] = useState<File | null>(null);
  const [isAnonim, setIsAnonim] = useState(false);

  // ================= STATE TRANSAPARANSI =================
  const [realStats, setRealStats] = useState({
    fitrahRp: 0,
    fitrahKg: 0,
    mal: 0,
    infaq: 0,
    wakaf: 0,
    donaturFitrah: 0,
    donaturMal: 0,
    donaturInfaq: 0,
    donaturWakaf: 0,
  });
  const [realDonatur, setRealDonatur] = useState<any[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    const fetchTransparansi = async () => {
      try {
        const { data, error } = await supabase
          .from('transaksi_ziswaf')
          .select('nama, is_anonim, kategori, nominal, created_at')
          .eq('status_pesanan', 'DITERIMA')
          .order('created_at', { ascending: false });
        if (data && !error) {
          let fRp = 0,
            m = 0,
            i = 0,
            w = 0;
          let df = 0,
            dm = 0,
            di = 0,
            dw = 0;
          data.forEach((trx) => {
            const kat = trx.kategori.toLowerCase();
            if (kat.includes('fitrah') || kat.includes('fidyah')) {
              fRp += trx.nominal;
              df++;
            } else if (kat.includes('infaq')) {
              i += trx.nominal;
              di++;
            } else if (kat.includes('wakaf')) {
              w += trx.nominal;
              dw++;
            } else {
              m += trx.nominal;
              dm++;
            }
          });
          const berasEstimasi =
            fRp > 0 && harga.berasFitrah > 0
              ? Math.floor((fRp / harga.berasFitrah) * 2.5)
              : 0;
          setRealStats({
            fitrahRp: fRp,
            fitrahKg: berasEstimasi,
            mal: m,
            infaq: i,
            wakaf: w,
            donaturFitrah: df,
            donaturMal: dm,
            donaturInfaq: di,
            donaturWakaf: dw,
          });
          setRealDonatur(data.slice(0, 5));
        }
      } catch (err) {
        console.error('Gagal memuat transparansi', err);
      } finally {
        setIsLoadingStats(false);
      }
    };
    if (!isFetchingPrices) fetchTransparansi();
  }, [isFetchingPrices, harga.berasFitrah]);

  useEffect(() => {
    setHaul({});
    setShowAlasan(null);
  }, [activeMalTab, activeTab]);

  const handleMal = (key: string, value: string) =>
    setMal((prev) => ({ ...prev, [key]: value }));
  const handleHaul = (key: string, val: boolean) =>
    setHaul((prev) => ({ ...prev, [key]: val }));

  const formatRp = (angka: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(angka);
  const parseNum = (val: any) =>
    parseFloat(String(val).replace(/[^0-9.]/g, '')) || 0;
  const valString = (val: string) =>
    val ? parseInt(val.replace(/[^0-9]/g, ''), 10).toLocaleString('id-ID') : '';

  const InfoIcon = ({ title, desc }: { title: string; desc: string }) => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        setActiveTooltip({ title, desc });
      }}
      className='ml-1.5 text-slate-400 hover:text-teal-600 transition-colors focus:outline-none shrink-0 inline-flex'>
      <Info className='w-4 h-4' />
    </button>
  );

  const NisabBox = ({ title1, val1, desc1, title2, val2, desc2 }: any) => (
    <div className='md:col-span-2 bg-slate-50/70 border border-slate-200 p-4 rounded-2xl mb-2 flex flex-col sm:flex-row gap-4 justify-between'>
      <div className='flex-1'>
        <div className='flex justify-between items-center mb-1.5'>
          <span className='text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center'>
            {title1}{' '}
            {desc1 && (
              <InfoIcon
                title={title1}
                desc={desc1}
              />
            )}
          </span>
          {!title2 && (
            <span className='text-[9px] font-bold text-slate-400 bg-white px-2 py-1 rounded border border-slate-100'>
              {currentDate}
            </span>
          )}
        </div>
        <p className='text-sm font-semibold text-slate-800'>{val1}</p>
      </div>
      {title2 && (
        <>
          <div className='hidden sm:block w-px bg-slate-200 mx-2'></div>
          <div className='flex-1 border-t sm:border-t-0 border-slate-200 pt-3 sm:pt-0 mt-1 sm:mt-0'>
            <div className='flex justify-between items-center mb-1.5'>
              <span className='text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center'>
                {title2}{' '}
                {desc2 && (
                  <InfoIcon
                    title={title2}
                    desc={desc2}
                  />
                )}
              </span>
              <span className='text-[9px] font-bold text-slate-400 bg-white px-2 py-1 rounded border border-slate-100'>
                {currentDate}
              </span>
            </div>
            <p className='text-sm font-semibold text-slate-800'>{val2}</p>
          </div>
        </>
      )}
    </div>
  );

  const hitungZakatMal = () => {
    let result = {
      totalHarta: 0,
      wajibZakatRp: 0,
      wajibZakatTeks: '',
      statusWajib: true,
      alasanMatematis: '',
      alasanHarga: '',
      hasInput: false,
      items: [] as any[],
    };

    if (activeMalTab === 'Profesi') {
      let bersih = parseNum(mal.p_in) - parseNum(mal.p_out);
      result.hasInput = parseNum(mal.p_in) > 0;
      result.totalHarta = bersih;
      let proyeksiTahunan = bersih * 12;
      if (proyeksiTahunan < NISAB_EMAS_RP) {
        result.statusWajib = false;
        result.alasanMatematis = `Penghasilan bersih: Rp ${formatRp(bersih)}/bln.\nProyeksi 1 tahun: Rp ${formatRp(proyeksiTahunan)}.\n\nKarena di bawah Nisab Emas (Rp ${formatRp(NISAB_EMAS_RP)}), belum wajib zakat.`;
      } else {
        result.wajibZakatRp = bersih * 0.025;
        result.alasanMatematis = `Proyeksi tahunan (Rp ${formatRp(proyeksiTahunan)}) melebihi Nisab Emas (Rp ${formatRp(NISAB_EMAS_RP)}).\n\nAnda wajib menunaikan zakat profesi sebesar 2.5% dari penghasilan bersih bulanan Anda saat ini.\nZakat profesi dapat dibayarkan tiap bulan tanpa harus menunggu genap satu tahun (Haul).\n\nHitungan: Rp ${formatRp(bersih)} x 2.5% = Rp ${formatRp(result.wajibZakatRp)}`;
      }
    } else if (activeMalTab === 'Emas, Perak & Perhiasan') {
      result.hasInput =
        parseNum(mal.s_emas) > 0 ||
        parseNum(mal.s_perak) > 0 ||
        parseNum(mal.s_p_emas) > 0 ||
        parseNum(mal.s_p_perak) > 0;
      const checkItem = (
        gram: number,
        hargaVal: number,
        nisabGram: number,
        name: string,
        isHaul: boolean,
      ) => {
        if (gram === 0) return null;
        let rp = gram * hargaVal;
        let meetsNisab = gram >= nisabGram;
        let wajib = meetsNisab && isHaul;
        return {
          name,
          rp,
          gram,
          zakat: wajib ? rp * 0.025 : 0,
          wajib,
          alasan: meetsNisab
            ? isHaul
              ? `Mencapai Nisab (${nisabGram}g) & Haul.`
              : `Mencapai Nisab tapi belum Haul.`
            : `Kurang dari Nisab (${nisabGram}g).`,
        };
      };
      let items = [
        checkItem(
          parseNum(mal.s_emas),
          harga.emas,
          NISAB_EMAS_GRAM,
          'Emas Batangan',
          !!haul.s_emas,
        ),
        checkItem(
          parseNum(mal.s_perak),
          harga.perak,
          NISAB_PERAK_GRAM,
          'Perak Batangan',
          !!haul.s_perak,
        ),
        checkItem(
          parseNum(mal.s_p_emas),
          harga.emas,
          NISAB_EMAS_GRAM,
          'Perhiasan Emas',
          !!haul.s_p_emas,
        ),
        checkItem(
          parseNum(mal.s_p_perak),
          harga.perak,
          NISAB_PERAK_GRAM,
          'Perhiasan Perak',
          !!haul.s_p_perak,
        ),
      ].filter(Boolean);
      result.items = items;
      result.wajibZakatRp = items.reduce(
        (acc, curr: any) => acc + curr.zakat,
        0,
      );
      result.totalHarta = items.reduce((acc, curr: any) => acc + curr.rp, 0);
      result.statusWajib = items.some((item: any) => item.wajib);
      if (!result.statusWajib && result.hasInput)
        result.alasanMatematis =
          'Tidak ada aset yang memenuhi dua syarat utama (Nisab DAN Haul) secara bersamaan.';
    } else if (activeMalTab === 'Pertanian') {
      let totalKg =
        parseNum(mal.t_jumlah) *
        (mal.t_satuan === 'ton' ? 1000 : mal.t_satuan === 'kw' ? 100 : 1);
      let nisabPtn = mal.t_jenis === 'beras' ? 815.758 : 1323.132;
      result.hasInput = totalKg > 0;
      if (totalKg >= nisabPtn) {
        let rate = mal.t_pengairan === 'tadah' ? 0.1 : 0.05;
        let zKg = totalKg * rate;
        let hargaPerKg =
          mal.t_jenis === 'beras' ? harga.berasTani : harga.gabahTani;
        result.wajibZakatRp = zKg * hargaPerKg;
        result.wajibZakatTeks = `${zKg.toLocaleString('id-ID', { maximumFractionDigits: 2 })} Kg (${mal.t_jenis === 'beras' ? 'Beras' : 'Gabah'})`;
        result.alasanMatematis = `Total Panen: ${totalKg.toLocaleString('id-ID')} Kg.\nBatas Nisab telah terpenuhi.\n\nSistem Pengairan: ${mal.t_pengairan === 'tadah' ? 'Tadah Hujan (10%)' : 'Irigasi Berbayar (5%)'}.\nHitungan: ${totalKg.toLocaleString('id-ID')} Kg x ${rate * 100}% = ${zKg.toLocaleString('id-ID', { maximumFractionDigits: 2 })} Kg.`;
        result.alasanHarga = `Harga pasar per tanggal ${currentDate}:\n1 Kg ${mal.t_jenis === 'beras' ? 'Beras Putih' : 'Gabah Kering'} = Rp ${formatRp(hargaPerKg)}.\n\nKalkulasi Final:\n${zKg.toLocaleString('id-ID', { maximumFractionDigits: 2 })} Kg x Rp ${formatRp(hargaPerKg)} = Rp ${formatRp(result.wajibZakatRp)}`;
      } else {
        result.statusWajib = false;
        result.alasanMatematis = `Total Panen Anda (${totalKg.toLocaleString('id-ID')} Kg) berada di bawah batas minimal Nisab (5 Wasaq), maka belum diwajibkan mengeluarkan zakat pertanian.`;
      }
    } else if (activeMalTab === "Zakat An'am") {
      let ekor = parseNum(mal.an_jumlah);
      result.hasInput = ekor > 0;
      let jenis = mal.an_jenis;
      let isNisab =
        (jenis === 'kambing' && ekor >= 40) ||
        (jenis === 'sapi' && ekor >= 30) ||
        (jenis === 'unta' && ekor >= 5);
      if (!isNisab) {
        result.statusWajib = false;
        let batas = jenis === 'kambing' ? 40 : jenis === 'sapi' ? 30 : 5;
        result.alasanMatematis = `Jumlah ternak Anda (${ekor} Ekor) kurang dari batas minimal Nisab (${batas} Ekor), maka belum wajib dizakatkan.`;
      } else if (!haul.anam) {
        result.statusWajib = false;
        result.alasanMatematis = `Ternak Anda memenuhi Nisab. Namun syarat mutlak Zakat An'am adalah Haul 1 Tahun. Harap ceklis pernyataan Haul.`;
      } else {
        let txt = '',
          alasanRange = '',
          calcRp = 0,
          calcDesc = '';
        const kambingDesc = 'Kambing (umur 2 th) atau Domba (umur 1 th)';
        const setDesc = (t: string, r: string, p: number, p_txt: string) => {
          txt = t;
          alasanRange = r;
          calcRp = p;
          calcDesc = `Harga pasar per ${currentDate}:\n${p_txt}\n\nKalkulasi Final:\nTotal Nilai Konversi = Rp ${formatRp(calcRp)}`;
        };

        if (jenis === 'kambing') {
          if (ekor >= 40 && ekor <= 120)
            setDesc(
              `1 Ekor Kambing / Domba`,
              `Rentang 40 - 120 ekor. Wajib zakat: 1 Ekor ${kambingDesc}.`,
              1 * harga.hewan.kambing,
              `1 Kambing = Rp ${formatRp(harga.hewan.kambing)}`,
            );
          else if (ekor >= 121 && ekor <= 200)
            setDesc(
              `2 Ekor Kambing / Domba`,
              `Rentang 121 - 200 ekor. Wajib zakat: 2 Ekor ${kambingDesc}.`,
              2 * harga.hewan.kambing,
              `1 Kambing = Rp ${formatRp(harga.hewan.kambing)}`,
            );
          else if (ekor >= 201 && ekor <= 300)
            setDesc(
              `3 Ekor Kambing / Domba`,
              `Rentang 201 - 300 ekor. Wajib zakat: 3 Ekor ${kambingDesc}.`,
              3 * harga.hewan.kambing,
              `1 Kambing = Rp ${formatRp(harga.hewan.kambing)}`,
            );
          else if (ekor > 300) {
            let mul = Math.floor(ekor / 100);
            setDesc(
              `${mul} Ekor Kambing / Domba`,
              `Lebih dari 300 ekor, penambahan 1 ekor tiap kelipatan 100. Wajib zakat: ${mul} Ekor ${kambingDesc}.`,
              mul * harga.hewan.kambing,
              `1 Kambing = Rp ${formatRp(harga.hewan.kambing)}`,
            );
          }
        } else if (jenis === 'sapi') {
          if (ekor >= 30 && ekor <= 39)
            setDesc(
              "1 Ekor Tabi' (Sapi 1 thn)",
              "Rentang 30 - 39 ekor. Wajib zakat: 1 Ekor Tabi' (umur 1 thn).",
              1 * harga.hewan.tabi,
              `1 Tabi' = Rp ${formatRp(harga.hewan.tabi)}`,
            );
          else if (ekor >= 40 && ekor <= 59)
            setDesc(
              '1 Ekor Musinnah (Sapi 2 thn)',
              'Rentang 40 - 59 ekor. Wajib zakat: 1 Ekor Musinnah (umur 2 thn).',
              1 * harga.hewan.musinnah,
              `1 Musinnah = Rp ${formatRp(harga.hewan.musinnah)}`,
            );
          else if (ekor >= 60 && ekor <= 69)
            setDesc(
              "2 Ekor Tabi' (Sapi 1 thn)",
              "Rentang 60 - 69 ekor. Wajib zakat: 2 Ekor Tabi'.",
              2 * harga.hewan.tabi,
              `1 Tabi' = Rp ${formatRp(harga.hewan.tabi)}`,
            );
          else if (ekor >= 70 && ekor <= 79)
            setDesc(
              "1 Tabi' & 1 Musinnah",
              "Rentang 70 - 79 ekor. Wajib zakat: 1 Ekor Tabi' & 1 Ekor Musinnah.",
              harga.hewan.tabi + harga.hewan.musinnah,
              `1 Tabi' = Rp ${formatRp(harga.hewan.tabi)}\n1 Musinnah = Rp ${formatRp(harga.hewan.musinnah)}`,
            );
          else if (ekor >= 80 && ekor <= 89)
            setDesc(
              '2 Ekor Musinnah (Sapi 2 thn)',
              'Rentang 80 - 89 ekor. Wajib zakat: 2 Ekor Musinnah.',
              2 * harga.hewan.musinnah,
              `1 Musinnah = Rp ${formatRp(harga.hewan.musinnah)}`,
            );
          else if (ekor >= 90) {
            let base = Math.floor(ekor / 10) * 10;
            let m = 0,
              t = 0;
            for (let y = 0; y <= base / 40; y++) {
              let rem = base - y * 40;
              if (rem % 30 === 0) {
                m = y;
                t = rem / 30;
                break;
              }
            }
            if (m > 0 && t > 0)
              setDesc(
                `${t} Tabi' & ${m} Musinnah`,
                `Kelipatan kombinasi 30 & 40 penuh. Wajib zakat: ${t} Tabi' dan ${m} Musinnah.`,
                t * harga.hewan.tabi + m * harga.hewan.musinnah,
                `1 Tabi' = Rp ${formatRp(harga.hewan.tabi)}\n1 Musinnah = Rp ${formatRp(harga.hewan.musinnah)}`,
              );
            else if (m > 0)
              setDesc(
                `${m} Ekor Musinnah`,
                `Kelipatan 40 penuh. Wajib zakat: ${m} Musinnah.`,
                m * harga.hewan.musinnah,
                `1 Musinnah = Rp ${formatRp(harga.hewan.musinnah)}`,
              );
            else if (t > 0)
              setDesc(
                `${t} Ekor Tabi'`,
                `Kelipatan 30 penuh. Wajib zakat: ${t} Tabi'.`,
                t * harga.hewan.tabi,
                `1 Tabi' = Rp ${formatRp(harga.hewan.tabi)}`,
              );
          }
        } else if (jenis === 'unta') {
          if (ekor >= 5 && ekor <= 9)
            setDesc(
              `1 Ekor Kambing / Domba`,
              `Rentang 5-9 unta. Zakat dikonversi jadi 1 Ekor ${kambingDesc}.`,
              1 * harga.hewan.kambing,
              `1 Kambing = Rp ${formatRp(harga.hewan.kambing)}`,
            );
          else if (ekor >= 10 && ekor <= 14)
            setDesc(
              `2 Ekor Kambing / Domba`,
              `Rentang 10-14 unta. Wajib: 2 Ekor ${kambingDesc}.`,
              2 * harga.hewan.kambing,
              `1 Kambing = Rp ${formatRp(harga.hewan.kambing)}`,
            );
          else if (ekor >= 15 && ekor <= 19)
            setDesc(
              `3 Ekor Kambing / Domba`,
              `Rentang 15-19 unta. Wajib: 3 Ekor ${kambingDesc}.`,
              3 * harga.hewan.kambing,
              `1 Kambing = Rp ${formatRp(harga.hewan.kambing)}`,
            );
          else if (ekor >= 20 && ekor <= 24)
            setDesc(
              `4 Ekor Kambing / Domba`,
              `Rentang 20-24 unta. Wajib: 4 Ekor ${kambingDesc}.`,
              4 * harga.hewan.kambing,
              `1 Kambing = Rp ${formatRp(harga.hewan.kambing)}`,
            );
          else if (ekor >= 25 && ekor <= 35)
            setDesc(
              '1 Ekor Bintu Makhad (Unta 1th)',
              `Rentang 25-35 unta. Wajib: 1 Ekor Bintu Makhad.`,
              1 * harga.hewan.bintu_makhad,
              `1 Bintu Makhad = Rp ${formatRp(harga.hewan.bintu_makhad)}`,
            );
          else if (ekor >= 36 && ekor <= 45)
            setDesc(
              '1 Ekor Bintu Labun (Unta 2th)',
              `Rentang 36-45 unta. Wajib: 1 Ekor Bintu Labun.`,
              1 * harga.hewan.bintu_labun,
              `1 Bintu Labun = Rp ${formatRp(harga.hewan.bintu_labun)}`,
            );
          else if (ekor >= 46 && ekor <= 60)
            setDesc(
              '1 Ekor Hiqqah (Unta 3th)',
              `Rentang 46-60 unta. Wajib: 1 Ekor Hiqqah.`,
              1 * harga.hewan.hiqqah,
              `1 Hiqqah = Rp ${formatRp(harga.hewan.hiqqah)}`,
            );
          else if (ekor >= 61 && ekor <= 75)
            setDesc(
              "1 Ekor Jadz'ah (Unta 4th)",
              `Rentang 61-75 unta. Wajib: 1 Ekor Jadz'ah.`,
              1 * harga.hewan.jadzah,
              `1 Jadz'ah = Rp ${formatRp(harga.hewan.jadzah)}`,
            );
          else if (ekor >= 76 && ekor <= 90)
            setDesc(
              '2 Ekor Bintu Labun (Unta 2th)',
              `Rentang 76-90 unta. Wajib: 2 Ekor Bintu Labun.`,
              2 * harga.hewan.bintu_labun,
              `1 Bintu Labun = Rp ${formatRp(harga.hewan.bintu_labun)}`,
            );
          else if (ekor >= 91 && ekor <= 120)
            setDesc(
              '2 Ekor Hiqqah (Unta 3th)',
              `Rentang 91-120 unta. Wajib: 2 Ekor Hiqqah.`,
              2 * harga.hewan.hiqqah,
              `1 Hiqqah = Rp ${formatRp(harga.hewan.hiqqah)}`,
            );
          else if (ekor > 120) {
            let base = Math.floor(ekor / 10) * 10;
            let h = 0,
              bl = 0;
            for (let y = 0; y <= base / 50; y++) {
              let rem = base - y * 50;
              if (rem % 40 === 0) {
                h = y;
                bl = rem / 40;
                break;
              }
            }
            if (h > 0 && bl > 0)
              setDesc(
                `${h} Hiqqah & ${bl} Bintu Labun`,
                `Kelipatan kombinasi 40 & 50. Wajib zakat: ${h} Hiqqah dan ${bl} Bintu Labun.`,
                h * harga.hewan.hiqqah + bl * harga.hewan.bintu_labun,
                `1 Hiqqah = Rp ${formatRp(harga.hewan.hiqqah)}\n1 Bintu Labun = Rp ${formatRp(harga.hewan.bintu_labun)}`,
              );
            else if (h > 0)
              setDesc(
                `${h} Ekor Hiqqah`,
                `Kelipatan 50 penuh. Wajib zakat: ${h} Hiqqah.`,
                h * harga.hewan.hiqqah,
                `1 Hiqqah = Rp ${formatRp(harga.hewan.hiqqah)}`,
              );
            else if (bl > 0)
              setDesc(
                `${bl} Ekor Bintu Labun`,
                `Kelipatan 40 penuh. Wajib zakat: ${bl} Bintu Labun.`,
                bl * harga.hewan.bintu_labun,
                `1 Bintu Labun = Rp ${formatRp(harga.hewan.bintu_labun)}`,
              );
          }
        }
        result.wajibZakatRp = calcRp;
        result.wajibZakatTeks = txt;
        result.alasanMatematis = alasanRange;
        result.alasanHarga = calcDesc;
      }
    } else {
      let m = mal;
      let modal = 0,
        laba = 0,
        piutang = 0,
        utang = 0,
        persediaan = 0;
      if (activeMalTab === 'Perdagangan') {
        modal = parseNum(m.d_modal);
        laba = parseNum(m.d_laba);
        piutang = parseNum(m.d_piutang);
        utang = parseNum(m.d_utang);
      }
      if (activeMalTab === 'Peternakan') {
        modal = parseNum(m.pt_modal);
        laba = parseNum(m.pt_laba);
        piutang = parseNum(m.pt_piutang);
        utang = parseNum(m.pt_utang);
      }
      if (activeMalTab === 'Tanaman Produktif') {
        modal = parseNum(m.tp_modal);
        laba = parseNum(m.tp_laba);
        piutang = parseNum(m.tp_piutang);
        utang = parseNum(m.tp_utang);
      }
      if (activeMalTab === 'Perusahaan') {
        modal = parseNum(m.c_kas) + parseNum(m.c_bank);
        persediaan = parseNum(m.c_barang);
        piutang = parseNum(m.c_piutang);
        utang = parseNum(m.c_utang);
      }
      if (activeMalTab === 'Properti') {
        modal =
          parseNum(m.pr_bangunan) +
          parseNum(m.pr_tanah) +
          parseNum(m.pr_material) +
          parseNum(m.pr_cash);
        piutang = parseNum(m.pr_piutang);
        utang = parseNum(m.pr_utang);
      }

      result.totalHarta = modal + laba + persediaan + piutang - utang;
      result.hasInput = modal + laba + persediaan + piutang > 0;
      if (result.totalHarta < NISAB_EMAS_RP) {
        result.statusWajib = false;
        result.alasanMatematis = `Total akumulasi harta/modal bersih: Rp ${formatRp(result.totalHarta)}.\n\nKarena di bawah Nisab Emas (Rp ${formatRp(NISAB_EMAS_RP)}), belum wajib dizakatkan.`;
      } else if (!haul.tijarah) {
        result.statusWajib = false;
        result.alasanMatematis = `Harta Anda mencapai Nisab.\nNamun, syarat wajib zakat perniagaan/aset produktif adalah telah diputar genap 1 tahun buku (Haul). Harap ceklis pernyataan Haul.`;
      } else {
        result.wajibZakatRp = result.totalHarta * 0.025;
        result.alasanMatematis = `Total aset perniagaan bersih (Rp ${formatRp(result.totalHarta)}) memenuhi syarat Nisab & Haul.\n\nZakat wajib dikeluarkan 2.5%.\nHitungan: Rp ${formatRp(result.totalHarta)} x 2.5% = Rp ${formatRp(result.wajibZakatRp)}.`;
      }
    }
    return result;
  };

  const zResult = hitungZakatMal();

  const getNominalBayar = () => {
    if (activeTab === 'Zakat Fitrah') return parseNum(jiwa) * harga.berasFitrah;
    if (activeTab === 'Fidyah') return parseNum(hariFidyah) * harga.fidyah;
    if (activeTab === 'Infaq') return parseNum(infaqNominal);
    if (activeTab === 'Wakaf') return parseNum(wakafNominal);
    if (activeTab === 'Zakat Mal') return zResult.wajibZakatRp;
    return 0;
  };

  const getKategoriCheckout = () => {
    if (activeTab === 'Zakat Mal') return `Zakat Mal (${activeMalTab})`;
    if (activeTab === 'Infaq') return `Infaq (${infaqTujuan})`;
    if (activeTab === 'Wakaf') return `Wakaf (${wakafTujuan})`;
    return activeTab;
  };

  const getNiatData = () => {
    if (activeTab === 'Zakat Fitrah')
      return {
        arab: 'ﻧَﻮَﻳْﺖُ ﺃَﻥْ ﺃُﺧْﺮِﺝَ ﺯَﻛَﺎﺓَ ﺍﻟْﻔِﻄْﺮِ ﻋَﻦْ ﻧَﻔْﺴِﻲْ ﻓَﺮْﺿًﺎ ﻟﻠﻪِ ﺗَﻌَﺎﻟَﻰ',
        arti: "Aku niat mengeluarkan zakat fitrah untuk diriku sendiri fardu karena Allah Ta'ala.",
      };
    if (activeTab === 'Zakat Mal')
      return {
        arab: 'نَوَيْتُ أَنْ أُخْرِجَ زَكاَةَ اْلمَالِ فَرْضًا لِلهِ تَعَالَى',
        arti: "Aku niat mengeluarkan zakat mal fardu karena Allah Ta'ala.",
      };
    if (activeTab === 'Fidyah')
      return {
        arab: 'نَوَيْتُ أَنْ أُخْرِجَ هٰذِهِ الْفِدْيَةَ فَرْضًا لِلهِ تَعَالَى',
        arti: "Aku niat mengeluarkan fidyah fardu karena Allah Ta'ala.",
      };
    if (activeTab === 'Wakaf')
      return {
        arab: 'وَقَفْتُ هَذَا (اسم البضاعة) وَقْفًا صَحِيْحًا شَرْعِيًّا لِلهِ تَعَالَى',
        arti: "Saya wakafkan (nama barang) ini dengan wakaf yang sah secara syariat karena Allah Ta'ala",
      };
    return {
      arab: 'رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنْتَ السَّمِيعُ الْعَلِيمُ ',
      arti: 'Ya Tuhan kami, terimalah persembahan dari kami. Sungguh Engkau maha mendengar lagi maha mengetahui.',
    }; // Infaq
  };

  const handleShowFinalInfo = () => {
    if (!zResult.statusWajib) setShowAlasan(zResult.alasanMatematis);
    else if (["Zakat An'am", 'Pertanian'].includes(activeMalTab))
      setShowAlasan(zResult.alasanHarga);
    else setShowAlasan(zResult.alasanMatematis);
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

  const handleCheckoutSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!checkoutFile)
      return alert('Mohon unggah bukti transfer/pembayaran Anda!');
    if (getNominalBayar() <= 0)
      return alert('Total pembayaran tidak boleh kosong.');

    const formData = new FormData(e.currentTarget);
    setPendingFormData(formData); // Simpan sementara datanya
    setShowNiatModal(true); // Tampilkan Pop-up Niat
  };

  const executeFinalCheckout = async () => {
    if (!pendingFormData || !checkoutFile) return;
    setIsSubmitting(true);

    pendingFormData.append('file', checkoutFile);
    pendingFormData.append('kategori', getKategoriCheckout());
    pendingFormData.append('nominal', getNominalBayar().toString());
    pendingFormData.append('isAnonim', isAnonim.toString());

    if (activeTab === 'Zakat Mal') {
      pendingFormData.append(
        'rincian',
        ["Zakat An'am", 'Pertanian'].includes(activeMalTab)
          ? zResult.alasanHarga
          : zResult.alasanMatematis,
      );
    }

    try {
      const response = await fetch('/api/ziswaf-checkout', {
        method: 'POST',
        body: pendingFormData,
      });
      const result = await response.json();
      if (response.ok) {
        setShowNiatModal(false);
        setIsCheckoutOpen(false);
        alert(
          `Alhamdulillah! Penyaluran berhasil dicatat.\nKode Transaksi: ${result.kodeTrx}\nKwitansi "Menunggu Verifikasi" telah dikirimkan ke email Anda.`,
        );
        window.location.reload();
      } else {
        alert(`Gagal: ${result.error}`);
        setShowNiatModal(false);
      }
    } catch (error) {
      alert('Terjadi kesalahan koneksi.');
      setShowNiatModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputUIClass =
    'w-full bg-slate-50/70 border border-slate-200 rounded-xl px-4 py-3.5 focus:bg-white focus:ring-2 focus:ring-teal-600/30 focus:border-teal-500 outline-none text-slate-800 font-semibold transition-all placeholder:text-slate-400 placeholder:font-medium';
  const labelUIClass =
    'text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider block';

  const renderZakatMalForm = () => {
    return (
      <div className='space-y-6 animate-in fade-in relative z-10'>
        <style
          dangerouslySetInnerHTML={{
            __html: `@keyframes marquee-btn { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } } .animate-btn-marquee { display: inline-block; white-space: nowrap; animation: marquee-btn 6s linear infinite; } .animate-btn-marquee:hover { animation-play-state: paused; }`,
          }}
        />
        <div className='flex overflow-x-auto hide-scrollbar gap-2 pb-2'>
          {malCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveMalTab(cat)}
              className={`shrink-0 overflow-hidden w-auto px-5 py-2.5 rounded-full text-xs font-bold transition-all border ${activeMalTab === cat ? 'bg-teal-700 text-white border-teal-700 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-teal-700 hover:border-teal-200'}`}>
              {cat === 'Emas, Perak & Perhiasan' ? (
                <div className='w-48 relative overflow-hidden group'>
                  <div className='animate-btn-marquee'>
                    {cat} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{' '}
                    {cat}
                  </div>
                </div>
              ) : (
                cat
              )}
            </button>
          ))}
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {activeMalTab === 'Profesi' && (
            <>
              <NisabBox
                title1='Nisab Zakat Profesi'
                val1={`77.5 Gram = ${formatRp(NISAB_EMAS_RP)}`}
                desc1='Nisab zakat profesi disamakan dengan emas 20 Dinar.'
              />
              <div>
                <div className='flex items-center mb-1.5'>
                  <label className={labelUIClass}>Penghasilan Bulanan</label>
                  <InfoIcon
                    title='Penghasilan Bulanan'
                    desc='Penghasilan rutin & bonus.'
                  />
                </div>
                <input
                  type='text'
                  value={valString(mal.p_in)}
                  onChange={(e) =>
                    handleMal('p_in', e.target.value.replace(/[^0-9]/g, ''))
                  }
                  className={inputUIClass}
                  placeholder='Rp 0'
                />
              </div>
              <div>
                <div className='flex items-center mb-1.5'>
                  <label className={labelUIClass}>Pengeluaran Pokok</label>
                  <InfoIcon
                    title='Pengeluaran Pokok'
                    desc='Kebutuhan asasi pokok bulanan keluarga yang wajib dipenuhi.'
                  />
                </div>
                <input
                  type='text'
                  value={valString(mal.p_out)}
                  onChange={(e) =>
                    handleMal('p_out', e.target.value.replace(/[^0-9]/g, ''))
                  }
                  className={inputUIClass}
                  placeholder='Rp 0'
                />
              </div>
            </>
          )}
          {activeMalTab === 'Emas, Perak & Perhiasan' && (
            <>
              <NisabBox
                isDouble={true}
                title1='Nisab Emas (77.5g)'
                val1={`${formatRp(harga.emas)}/g = ${formatRp(NISAB_EMAS_RP)}`}
                title2='Nisab Perak (543.35g)'
                val2={`${formatRp(harga.perak)}/g = ${formatRp(NISAB_PERAK_RP)}`}
              />
              <div className='bg-white border border-slate-100 p-4 rounded-2xl shadow-sm'>
                <div className='flex items-center mb-1.5'>
                  <label className={labelUIClass}>Emas Batangan</label>
                  <InfoIcon
                    title='Emas Batangan'
                    desc='Emas murni disimpan.'
                  />
                </div>
                <input
                  type='text'
                  value={mal.s_emas}
                  onChange={(e) =>
                    handleMal('s_emas', e.target.value.replace(/[^0-9.]/g, ''))
                  }
                  className={inputUIClass}
                  placeholder='0 gram'
                />
                <label className='flex items-center mt-3 cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={!!haul.s_emas}
                    onChange={(e) => handleHaul('s_emas', e.target.checked)}
                    className='w-4 h-4 mr-2 accent-teal-600'
                  />
                  <span className='text-[10px] font-bold text-slate-500'>
                    Haul 1 Thn Hijriyah
                  </span>
                </label>
              </div>
              <div className='bg-white border border-slate-100 p-4 rounded-2xl shadow-sm'>
                <div className='flex items-center mb-1.5'>
                  <label className={labelUIClass}>Perak Batangan</label>
                  <InfoIcon
                    title='Perak Batangan'
                    desc='Perak murni disimpan.'
                  />
                </div>
                <input
                  type='text'
                  value={mal.s_perak}
                  onChange={(e) =>
                    handleMal('s_perak', e.target.value.replace(/[^0-9.]/g, ''))
                  }
                  className={inputUIClass}
                  placeholder='0 gram'
                />
                <label className='flex items-center mt-3 cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={!!haul.s_perak}
                    onChange={(e) => handleHaul('s_perak', e.target.checked)}
                    className='w-4 h-4 mr-2 accent-teal-600'
                  />
                  <span className='text-[10px] font-bold text-slate-500'>
                    Haul 1 Thn Hijriyah
                  </span>
                </label>
              </div>
              <div className='bg-white border border-slate-100 p-4 rounded-2xl shadow-sm'>
                <div className='flex items-center mb-1.5'>
                  <label className={labelUIClass}>Perhiasan Emas</label>
                  <InfoIcon
                    title='Perhiasan Emas (Kanzin)'
                    desc='Perhiasan HANYA DISIMPAN (kanzin) tidak dipakai.'
                  />
                </div>
                <input
                  type='text'
                  value={mal.s_p_emas}
                  onChange={(e) =>
                    handleMal(
                      's_p_emas',
                      e.target.value.replace(/[^0-9.]/g, ''),
                    )
                  }
                  className={inputUIClass}
                  placeholder='0 gram'
                />
                <label className='flex items-center mt-3 cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={!!haul.s_p_emas}
                    onChange={(e) => handleHaul('s_p_emas', e.target.checked)}
                    className='w-4 h-4 mr-2 accent-teal-600'
                  />
                  <span className='text-[10px] font-bold text-slate-500'>
                    Haul 1 Thn Hijriyah
                  </span>
                </label>
              </div>
              <div className='bg-white border border-slate-100 p-4 rounded-2xl shadow-sm'>
                <div className='flex items-center mb-1.5'>
                  <label className={labelUIClass}>Perhiasan Perak</label>
                  <InfoIcon
                    title='Perhiasan Perak (Kanzin)'
                    desc='Perhiasan perak niat disimpan.'
                  />
                </div>
                <input
                  type='text'
                  value={mal.s_p_perak}
                  onChange={(e) =>
                    handleMal(
                      's_p_perak',
                      e.target.value.replace(/[^0-9.]/g, ''),
                    )
                  }
                  className={inputUIClass}
                  placeholder='0 gram'
                />
                <label className='flex items-center mt-3 cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={!!haul.s_p_perak}
                    onChange={(e) => handleHaul('s_p_perak', e.target.checked)}
                    className='w-4 h-4 mr-2 accent-teal-600'
                  />
                  <span className='text-[10px] font-bold text-slate-500'>
                    Haul 1 Thn Hijriyah
                  </span>
                </label>
              </div>
            </>
          )}
          {activeMalTab === 'Perdagangan' && (
            <>
              <NisabBox
                title1='Nisab Perdagangan'
                val1={`77.5 Gram Emas = ${formatRp(NISAB_EMAS_RP)}`}
              />
              <div>
                <div className='flex items-center mb-1.5'>
                  <label className={labelUIClass}>Modal Yang Diputar</label>
                  <InfoIcon
                    title="Modal ('Urudh al-tijarah)"
                    desc="Mencakup semua harta yang mempengaruhi 'urudh al-tijarah."
                  />
                </div>
                <input
                  type='text'
                  value={valString(mal.d_modal)}
                  onChange={(e) =>
                    handleMal('d_modal', e.target.value.replace(/[^0-9]/g, ''))
                  }
                  className={inputUIClass}
                  placeholder='Rp 0'
                />
              </div>
              <div>
                <div className='flex items-center mb-1.5'>
                  <label className={labelUIClass}>Simpanan / Laba</label>
                </div>
                <input
                  type='text'
                  value={valString(mal.d_laba)}
                  onChange={(e) =>
                    handleMal('d_laba', e.target.value.replace(/[^0-9]/g, ''))
                  }
                  className={inputUIClass}
                  placeholder='Rp 0'
                />
              </div>
              <div>
                <div className='flex items-center mb-1.5'>
                  <label className={labelUIClass}>Piutang</label>
                </div>
                <input
                  type='text'
                  value={valString(mal.d_piutang)}
                  onChange={(e) =>
                    handleMal(
                      'd_piutang',
                      e.target.value.replace(/[^0-9]/g, ''),
                    )
                  }
                  className={inputUIClass}
                  placeholder='Rp 0'
                />
              </div>
              <div>
                <div className='flex items-center mb-1.5'>
                  <label className={labelUIClass}>Utang Niaga</label>
                </div>
                <input
                  type='text'
                  value={valString(mal.d_utang)}
                  onChange={(e) =>
                    handleMal('d_utang', e.target.value.replace(/[^0-9]/g, ''))
                  }
                  className={inputUIClass}
                  placeholder='Rp 0'
                />
              </div>
            </>
          )}
          {activeMalTab === 'Peternakan' && (
            <>
              <NisabBox
                title1='Nisab Peternakan Niaga'
                val1={`77.5 Gram Emas = ${formatRp(NISAB_EMAS_RP)}`}
                desc1='Untuk hewan ternak murni diniagakan (ayam potong, lele).'
              />
              <div>
                <div className='flex items-center mb-1.5'>
                  <label className={labelUIClass}>Modal Peternakan Niaga</label>
                </div>
                <input
                  type='text'
                  value={valString(mal.pt_modal)}
                  onChange={(e) =>
                    handleMal('pt_modal', e.target.value.replace(/[^0-9]/g, ''))
                  }
                  className={inputUIClass}
                  placeholder='Rp 0'
                />
              </div>
              <div>
                <div className='flex items-center mb-1.5'>
                  <label className={labelUIClass}>Simpanan / Laba</label>
                </div>
                <input
                  type='text'
                  value={valString(mal.pt_laba)}
                  onChange={(e) =>
                    handleMal('pt_laba', e.target.value.replace(/[^0-9]/g, ''))
                  }
                  className={inputUIClass}
                  placeholder='Rp 0'
                />
              </div>
              <div>
                <div className='flex items-center mb-1.5'>
                  <label className={labelUIClass}>Piutang</label>
                </div>
                <input
                  type='text'
                  value={valString(mal.pt_piutang)}
                  onChange={(e) =>
                    handleMal(
                      'pt_piutang',
                      e.target.value.replace(/[^0-9]/g, ''),
                    )
                  }
                  className={inputUIClass}
                  placeholder='Rp 0'
                />
              </div>
              <div>
                <div className='flex items-center mb-1.5'>
                  <label className={labelUIClass}>Utang</label>
                </div>
                <input
                  type='text'
                  value={valString(mal.pt_utang)}
                  onChange={(e) =>
                    handleMal('pt_utang', e.target.value.replace(/[^0-9]/g, ''))
                  }
                  className={inputUIClass}
                  placeholder='Rp 0'
                />
              </div>
            </>
          )}
          {activeMalTab === 'Tanaman Produktif' && (
            <>
              <NisabBox
                title1='Nisab Tanaman Agribisnis'
                val1={`77.5 Gram Emas = ${formatRp(NISAB_EMAS_RP)}`}
                desc1='Tanaman murni diniagakan. Biaya pupuk tidak dihitung urudh.'
              />
              <div>
                <div className='flex items-center mb-1.5'>
                  <label className={labelUIClass}>Modal Tanaman Niaga</label>
                </div>
                <input
                  type='text'
                  value={valString(mal.tp_modal)}
                  onChange={(e) =>
                    handleMal('tp_modal', e.target.value.replace(/[^0-9]/g, ''))
                  }
                  className={inputUIClass}
                  placeholder='Rp 0'
                />
              </div>
              <div>
                <div className='flex items-center mb-1.5'>
                  <label className={labelUIClass}>Simpanan / Laba</label>
                </div>
                <input
                  type='text'
                  value={valString(mal.tp_laba)}
                  onChange={(e) =>
                    handleMal('tp_laba', e.target.value.replace(/[^0-9]/g, ''))
                  }
                  className={inputUIClass}
                  placeholder='Rp 0'
                />
              </div>
              <div>
                <div className='flex items-center mb-1.5'>
                  <label className={labelUIClass}>Piutang</label>
                </div>
                <input
                  type='text'
                  value={valString(mal.tp_piutang)}
                  onChange={(e) =>
                    handleMal(
                      'tp_piutang',
                      e.target.value.replace(/[^0-9]/g, ''),
                    )
                  }
                  className={inputUIClass}
                  placeholder='Rp 0'
                />
              </div>
              <div>
                <div className='flex items-center mb-1.5'>
                  <label className={labelUIClass}>Utang</label>
                </div>
                <input
                  type='text'
                  value={valString(mal.tp_utang)}
                  onChange={(e) =>
                    handleMal('tp_utang', e.target.value.replace(/[^0-9]/g, ''))
                  }
                  className={inputUIClass}
                  placeholder='Rp 0'
                />
              </div>
            </>
          )}
          {activeMalTab === "Zakat An'am" && (
            <>
              <NisabBox
                isDouble={true}
                title1='Nisab Kambing / Sapi'
                val1='40 Ekor / 30 Ekor'
                title2='Nisab Unta'
                val2='5 Ekor'
              />
              <div>
                <label className={labelUIClass}>Jenis Hewan Ternak</label>
                <select
                  value={mal.an_jenis}
                  onChange={(e) => handleMal('an_jenis', e.target.value)}
                  className={`${inputUIClass} cursor-pointer`}>
                  <option value='kambing'>Kambing / Domba</option>
                  <option value='sapi'>Sapi / Kerbau</option>
                  <option value='unta'>Unta</option>
                </select>
              </div>
              <div>
                <label className={labelUIClass}>Jumlah Total Ekor</label>
                <input
                  type='text'
                  value={valString(mal.an_jumlah)}
                  onChange={(e) =>
                    handleMal(
                      'an_jumlah',
                      e.target.value.replace(/[^0-9]/g, ''),
                    )
                  }
                  className={inputUIClass}
                  placeholder='0 Ekor'
                />
              </div>
            </>
          )}
          {activeMalTab === 'Pertanian' && (
            <>
              <NisabBox
                isDouble={true}
                title1='Nisab Beras Putih'
                val1='815,758 Kg'
                desc1="Nisab zuru' 5 wasaq = 60 sha'."
                title2='Nisab Gabah Kering'
                val2='1.323,132 Kg'
                desc2='Setara 5 Wasaq Gabah Kering'
              />
              <div>
                <label className={labelUIClass}>Jenis Hasil Panen</label>
                <select
                  value={mal.t_jenis}
                  onChange={(e) => handleMal('t_jenis', e.target.value)}
                  className={`${inputUIClass} cursor-pointer`}>
                  <option value='beras'>Beras Putih</option>
                  <option value='gabah'>Padi Gabah Kering</option>
                </select>
              </div>
              <div className='flex gap-2'>
                <div className='flex-1'>
                  <label className={labelUIClass}>Satuan</label>
                  <select
                    value={mal.t_satuan}
                    onChange={(e) => handleMal('t_satuan', e.target.value)}
                    className={`${inputUIClass} cursor-pointer`}>
                    <option value='kg'>Kg</option>
                    <option value='kw'>Kwintal</option>
                    <option value='ton'>Ton</option>
                  </select>
                </div>
                <div className='flex-[2]'>
                  <label className={labelUIClass}>Jumlah Panen</label>
                  <input
                    type='text'
                    value={valString(mal.t_jumlah)}
                    onChange={(e) =>
                      handleMal(
                        't_jumlah',
                        e.target.value.replace(/[^0-9]/g, ''),
                      )
                    }
                    className={inputUIClass}
                    placeholder='0'
                  />
                </div>
              </div>
              <div className='md:col-span-2'>
                <div className='flex items-center mb-1.5'>
                  <label className={labelUIClass}>Jenis Sistem Pengairan</label>
                </div>
                <select
                  value={mal.t_pengairan}
                  onChange={(e) => handleMal('t_pengairan', e.target.value)}
                  className={`${inputUIClass} cursor-pointer`}>
                  <option value='tadah'>
                    Irigasi Tadah Hujan / Alami (Zakat 10%)
                  </option>
                  <option value='berbayar'>Irigasi Berbayar (Zakat 5%)</option>
                </select>
              </div>
            </>
          )}
          {activeMalTab === 'Perusahaan' && (
            <>
              <NisabBox
                title1='Nisab Kas & Aset Perusahaan'
                val1={`77.5 Gram Emas = ${formatRp(NISAB_EMAS_RP)}`}
              />
              <div>
                <label className={labelUIClass}>Uang Tunai (Kas)</label>
                <input
                  type='text'
                  value={valString(mal.c_kas)}
                  onChange={(e) =>
                    handleMal('c_kas', e.target.value.replace(/[^0-9]/g, ''))
                  }
                  className={inputUIClass}
                  placeholder='Rp 0'
                />
              </div>
              <div>
                <label className={labelUIClass}>Saldo Bank</label>
                <input
                  type='text'
                  value={valString(mal.c_bank)}
                  onChange={(e) =>
                    handleMal('c_bank', e.target.value.replace(/[^0-9]/g, ''))
                  }
                  className={inputUIClass}
                  placeholder='Rp 0'
                />
              </div>
              <div>
                <label className={labelUIClass}>Piutang</label>
                <input
                  type='text'
                  value={valString(mal.c_piutang)}
                  onChange={(e) =>
                    handleMal(
                      'c_piutang',
                      e.target.value.replace(/[^0-9]/g, ''),
                    )
                  }
                  className={inputUIClass}
                  placeholder='Rp 0'
                />
              </div>
              <div>
                <label className={labelUIClass}>Persediaan Barang</label>
                <input
                  type='text'
                  value={valString(mal.c_barang)}
                  onChange={(e) =>
                    handleMal('c_barang', e.target.value.replace(/[^0-9]/g, ''))
                  }
                  className={inputUIClass}
                  placeholder='Rp 0'
                />
              </div>
              <div className='md:col-span-2'>
                <label className={labelUIClass}>
                  Utang Usaha Jangka Pendek
                </label>
                <input
                  type='text'
                  value={valString(mal.c_utang)}
                  onChange={(e) =>
                    handleMal('c_utang', e.target.value.replace(/[^0-9]/g, ''))
                  }
                  className={inputUIClass}
                  placeholder='Rp 0'
                />
              </div>
            </>
          )}
          {activeMalTab === 'Properti' && (
            <>
              <NisabBox
                title1='Nisab Aset Properti Niaga'
                val1={`77.5 Gram Emas = ${formatRp(NISAB_EMAS_RP)}`}
              />
              <div>
                <label className={labelUIClass}>Tanah & Bangunan (Unit)</label>
                <input
                  type='text'
                  value={valString(mal.pr_bangunan)}
                  onChange={(e) =>
                    handleMal(
                      'pr_bangunan',
                      e.target.value.replace(/[^0-9]/g, ''),
                    )
                  }
                  className={inputUIClass}
                  placeholder='Rp 0'
                />
              </div>
              <div>
                <label className={labelUIClass}>Tanah Kavling Kosong</label>
                <input
                  type='text'
                  value={valString(mal.pr_tanah)}
                  onChange={(e) =>
                    handleMal('pr_tanah', e.target.value.replace(/[^0-9]/g, ''))
                  }
                  className={inputUIClass}
                  placeholder='Rp 0'
                />
              </div>
              <div>
                <label className={labelUIClass}>Material Bangunan</label>
                <input
                  type='text'
                  value={valString(mal.pr_material)}
                  onChange={(e) =>
                    handleMal(
                      'pr_material',
                      e.target.value.replace(/[^0-9]/g, ''),
                    )
                  }
                  className={inputUIClass}
                  placeholder='Rp 0'
                />
              </div>
              <div>
                <label className={labelUIClass}>Uang Cash (Simpanan)</label>
                <input
                  type='text'
                  value={valString(mal.pr_cash)}
                  onChange={(e) =>
                    handleMal('pr_cash', e.target.value.replace(/[^0-9]/g, ''))
                  }
                  className={inputUIClass}
                  placeholder='Rp 0'
                />
              </div>
              <div>
                <label className={labelUIClass}>Piutang Kredit</label>
                <input
                  type='text'
                  value={valString(mal.pr_piutang)}
                  onChange={(e) =>
                    handleMal(
                      'pr_piutang',
                      e.target.value.replace(/[^0-9]/g, ''),
                    )
                  }
                  className={inputUIClass}
                  placeholder='Rp 0'
                />
              </div>
              <div>
                <label className={labelUIClass}>Utang</label>
                <input
                  type='text'
                  value={valString(mal.pr_utang)}
                  onChange={(e) =>
                    handleMal('pr_utang', e.target.value.replace(/[^0-9]/g, ''))
                  }
                  className={inputUIClass}
                  placeholder='Rp 0'
                />
              </div>
            </>
          )}
        </div>

        {[
          'Perdagangan',
          'Peternakan',
          'Tanaman Produktif',
          'Perusahaan',
          'Properti',
        ].includes(activeMalTab) &&
          zResult.hasInput && (
            <div className='bg-slate-50 border border-slate-200 p-4 rounded-xl mt-4'>
              <label className='flex items-start gap-3 cursor-pointer group'>
                <div className='relative flex items-center justify-center w-5 h-5 mt-0.5 shrink-0'>
                  <input
                    type='checkbox'
                    checked={!!haul.tijarah}
                    onChange={(e) => handleHaul('tijarah', e.target.checked)}
                    className='peer appearance-none w-5 h-5 border-2 border-slate-300 rounded hover:border-teal-500 checked:bg-teal-600 checked:border-teal-600 transition-all cursor-pointer'
                  />
                  <CheckCircle2 className='w-3.5 h-3.5 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none' />
                </div>
                <span className='text-sm text-slate-700 font-semibold group-hover:text-teal-800 transition-colors leading-snug'>
                  Harta ini telah diputar penuh selama 1 tahun buku (Syarat{' '}
                  <strong className='text-teal-700'>Haul Hijriyah</strong>).
                </span>
              </label>
            </div>
          )}
        {activeMalTab === "Zakat An'am" && zResult.hasInput && (
          <div className='bg-slate-50 border border-slate-200 p-4 rounded-xl mt-4'>
            <label className='flex items-start gap-3 cursor-pointer group'>
              <div className='relative flex items-center justify-center w-5 h-5 mt-0.5 shrink-0'>
                <input
                  type='checkbox'
                  checked={!!haul.anam}
                  onChange={(e) => handleHaul('anam', e.target.checked)}
                  className='peer appearance-none w-5 h-5 border-2 border-slate-300 rounded hover:border-teal-500 checked:bg-teal-600 checked:border-teal-600 transition-all cursor-pointer'
                />
                <CheckCircle2 className='w-3.5 h-3.5 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none' />
              </div>
              <span className='text-sm text-slate-700 font-semibold group-hover:text-teal-800 transition-colors leading-snug'>
                Hewan ternak (An'am) ini telah saya miliki secara penuh selama 1
                tahun (Syarat{' '}
                <strong className='text-teal-700'>Haul Hijriyah</strong>).
              </span>
            </label>
          </div>
        )}
      </div>
    );
  };

  if (isFetchingPrices) {
    return (
      <div className='min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4'>
        <Loader2 className='w-12 h-12 text-teal-600 animate-spin' />
        <p className='text-teal-800 font-bold animate-pulse'>
          Menyiapkan Kalkulator Ziswaf...
        </p>
      </div>
    );
  }

  return (
    <div className='pb-24 bg-slate-50 min-h-screen'>
      <style
        dangerouslySetInnerHTML={{
          __html: `@keyframes marquee-text { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } } .animate-text-marquee { display: inline-block; white-space: nowrap; animation: marquee-text 15s linear infinite; } .animate-text-marquee:hover { animation-play-state: paused; }`,
        }}
      />

      <motion.div
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, margin: '-50px' }}
        variants={fadeInUp}
        className='max-w-6xl mx-auto px-4 md:px-8 pt-8 relative z-10'>
        <div className='bg-gradient-to-br from-teal-800 to-slate-800 rounded-[2.5rem] p-8 md:p-16 text-center relative overflow-hidden shadow-xl mb-8 group/header'>
          <div className='absolute -left-10 -top-10 opacity-[0.05] group-hover/header:scale-125 transition-transform duration-1000 pointer-events-none'>
            <Scale className='w-[300px] h-[300px] text-white' />
          </div>
          <div className='absolute -right-20 -bottom-20 opacity-[0.06] group-hover/header:scale-125 transition-transform duration-1000 pointer-events-none'>
            <Calculator className='w-[400px] h-[400px] text-white' />
          </div>
          <div className='relative z-10 max-w-3xl mx-auto'>
            <span className='inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-teal-100 text-[10px] font-bold uppercase tracking-widest mb-6 border border-white/10 shadow-sm'>
              Kalkulator Cerdas
            </span>
            <h1 className='text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight'>
              {data?.judul || 'Layanan ZISWAF MNI'}
            </h1>
            <p className='text-base md:text-lg text-teal-50/80 font-medium leading-relaxed max-w-2xl mx-auto'>
              {data?.deskripsi ||
                'Kalkulasi akurat, pembayaran mudah, dan penyaluran transparan sesuai ketentuan mazhab terpercaya.'}
            </p>
          </div>
        </div>
      </motion.div>

      <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20'>
        <motion.div
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true }}
          variants={fadeInUp}
          className='bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex overflow-x-auto hide-scrollbar gap-2 mb-8'>
          {['Zakat Fitrah', 'Zakat Mal', 'Fidyah', 'Infaq', 'Wakaf'].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`shrink-0 flex-1 py-3 px-6 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${activeTab === tab ? 'bg-teal-700 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-teal-700'}`}>
                {tab}
              </button>
            ),
          )}
        </motion.div>

        {activeTab !== 'Wakaf' ? (
          <motion.div
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true }}
            variants={fadeInUp}
            className='grid grid-cols-1 lg:grid-cols-3 gap-8 items-start'>
            <div className='lg:col-span-2 bg-white rounded-[2rem] p-6 md:p-10 shadow-sm border border-slate-100 relative overflow-hidden group/calc'>
              <div className='absolute -right-10 -bottom-10 opacity-[0.02] group-hover/calc:scale-110 transition-transform duration-1000 pointer-events-none'>
                {activeTab === 'Zakat Fitrah' && (
                  <Heart className='w-64 h-64 text-slate-800' />
                )}
                {activeTab === 'Zakat Mal' && (
                  <Wallet className='w-64 h-64 text-slate-800' />
                )}
                {activeTab === 'Fidyah' && (
                  <Wheat className='w-64 h-64 text-slate-800' />
                )}
                {activeTab === 'Infaq' && (
                  <Coins className='w-64 h-64 text-slate-800' />
                )}
              </div>
              <h2 className='text-xl md:text-2xl font-semibold text-slate-800 mb-8 flex items-center relative z-10 tracking-tight'>
                {activeTab === 'Zakat Fitrah' && (
                  <>
                    <Heart className='w-6 h-6 mr-3 text-teal-600' /> Zakat
                    Fitrah
                  </>
                )}
                {activeTab === 'Zakat Mal' && (
                  <>
                    <Wallet className='w-6 h-6 mr-3 text-teal-600' /> Kalkulator
                    Zakat Mal
                  </>
                )}
                {activeTab === 'Fidyah' && (
                  <>
                    <Wheat className='w-6 h-6 mr-3 text-teal-600' /> Fidyah
                    Puasa
                  </>
                )}
                {activeTab === 'Infaq' && (
                  <>
                    <Coins className='w-6 h-6 mr-3 text-teal-600' /> Infaq &
                    Shadaqoh
                  </>
                )}
              </h2>

              <AnimatePresence mode='wait'>
                {activeTab === 'Zakat Fitrah' && (
                  <motion.div
                    key='fitrah'
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className='space-y-6 relative z-10'>
                    <div className='bg-slate-50 border border-slate-100 p-5 rounded-2xl relative overflow-hidden'>
                      <div className='flex justify-between items-center relative z-10'>
                        <div className='flex items-center'>
                          <div className='w-10 h-10 bg-white shadow-sm text-teal-700 rounded-full flex items-center justify-center mr-4'>
                            <Calculator className='w-5 h-5' />
                          </div>
                          <div>
                            <p className='text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-0.5'>
                              Rumus Ketetapan
                            </p>
                            <p className='text-slate-800 font-semibold text-sm md:text-base'>
                              1 Jiwa = Rp{' '}
                              {formatRp(harga.berasFitrah).replace('Rp', '')}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowFitrahInfo(!showFitrahInfo)}
                          className={`w-9 h-9 flex items-center justify-center rounded-full border transition-all ${showFitrahInfo ? 'bg-teal-700 text-white border-teal-700' : 'bg-white border-slate-200 text-slate-400 hover:text-teal-700'}`}>
                          <Info className='w-4 h-4' />
                        </button>
                      </div>
                      <AnimatePresence>
                        {showFitrahInfo && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className='relative z-10 overflow-hidden'>
                            <div className='pt-4 mt-4 border-t border-slate-200/60 text-xs text-slate-500 leading-relaxed'>
                              Secara syariat, zakat fitrah dibayarkan dalam
                              bentuk makanan pokok sebesar{' '}
                              <strong className='text-teal-700'>1 Sha'</strong>.
                              Di Indonesia, takaran ini setara dengan{' '}
                              <strong className='text-teal-700'>2,5 kg</strong>{' '}
                              atau{' '}
                              <strong className='text-teal-700'>
                                3,5 liter
                              </strong>{' '}
                              beras. Nilainya disetarakan dengan{' '}
                              <strong className='text-teal-700'>
                                Rp{' '}
                                {formatRp(harga.berasFitrah).replace('Rp', '')}{' '}
                                per jiwa
                              </strong>
                              .
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className='relative pt-2'>
                      <label className='text-[11px] font-bold text-slate-500 mb-2 block uppercase tracking-wider'>
                        Jumlah Tanggungan Keluarga
                      </label>
                      <div className='relative group/input'>
                        <input
                          type='text'
                          value={valString(jiwa)}
                          onChange={(e) =>
                            setJiwa(e.target.value.replace(/[^0-9]/g, ''))
                          }
                          className={`${inputUIClass} text-lg pl-6 pr-16`}
                          placeholder='0'
                        />
                        <span className='absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm'>
                          Jiwa
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
                {activeTab === 'Zakat Mal' && (
                  <motion.div
                    key='mal'
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}>
                    {renderZakatMalForm()}
                  </motion.div>
                )}
                {activeTab === 'Fidyah' && (
                  <motion.div
                    key='fidyah'
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className='space-y-6'>
                    <p className='text-sm text-slate-500 mb-2 leading-relaxed'>
                      Fidyah diperuntukkan bagi yang uzur berpuasa. Ketetapan
                      fidyah 1 hari puasa adalah 1 porsi makan mengenyangkan
                      setara{' '}
                      <strong className='text-teal-700'>
                        {formatRp(harga.fidyah)}
                      </strong>
                      .
                    </p>
                    <div className='relative'>
                      <label className='text-[11px] font-bold text-slate-500 mb-2 block uppercase tracking-wider'>
                        Hutang Puasa
                      </label>
                      <div className='relative group/input'>
                        <input
                          type='text'
                          value={valString(hariFidyah)}
                          onChange={(e) =>
                            setHariFidyah(e.target.value.replace(/[^0-9]/g, ''))
                          }
                          className={`${inputUIClass} text-lg pl-6 pr-16`}
                          placeholder='0'
                        />
                        <span className='absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm'>
                          Hari
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
                {activeTab === 'Infaq' && (
                  <motion.div
                    key='infaq'
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className='space-y-6'>
                    <div>
                      <label className='text-[11px] font-bold text-slate-500 mb-2 block uppercase tracking-wider'>
                        Nominal Infaq / Sedekah
                      </label>
                      <div className='grid grid-cols-2 md:grid-cols-4 gap-3 mb-4'>
                        {[50000, 100000, 250000, 500000].map((nom) => (
                          <button
                            key={nom}
                            onClick={() => setInfaqNominal(nom.toString())}
                            className={`py-3 rounded-xl font-semibold text-xs transition-all border ${parseNum(infaqNominal) === nom ? 'bg-teal-700 text-white border-teal-700 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-teal-500 hover:text-teal-700'}`}>
                            {formatRp(nom).replace('Rp', '')}
                          </button>
                        ))}
                      </div>
                      <input
                        type='text'
                        value={valString(infaqNominal)}
                        onChange={(e) =>
                          setInfaqNominal(e.target.value.replace(/[^0-9]/g, ''))
                        }
                        className={inputUIClass}
                        placeholder='Ketik nominal lain...'
                      />
                    </div>
                    <div>
                      <label className='text-[11px] font-bold text-slate-500 mb-2 block uppercase tracking-wider'>
                        Tujuan Penyaluran
                      </label>
                      <select
                        value={infaqTujuan}
                        onChange={(e) => setInfaqTujuan(e.target.value)}
                        className={`${inputUIClass} cursor-pointer`}>
                        <option value='Operasional Masjid'>
                          Operasional & Kemakmuran Masjid
                        </option>
                        <option value='Santunan Anak Yatim'>
                          Santunan Anak Yatim & Dhuafa
                        </option>
                        <option value='Pembangunan Masjid'>
                          Pembangunan Masjid
                        </option>
                      </select>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* KANAN: SUMMARY */}
            <div className='lg:col-span-1'>
              <div className='bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 sticky top-8 relative overflow-hidden group/summary'>
                <div className='absolute -right-6 -bottom-6 opacity-[0.02] group-hover/summary:scale-125 transition-transform duration-1000 pointer-events-none'>
                  <ShoppingBag className='w-48 h-48 text-slate-900' />
                </div>
                <h3 className='text-lg font-semibold text-slate-800 mb-6 flex items-center border-b border-slate-100 pb-4 relative z-10'>
                  <div className='w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center mr-3 border border-slate-100'>
                    <ShoppingBag className='w-4 h-4 text-teal-600' />
                  </div>
                  Ringkasan
                </h3>
                <div className='space-y-4 mb-6 relative z-10'>
                  {activeTab === 'Zakat Fitrah' && (
                    <div className='flex flex-col gap-3'>
                      <div className='flex justify-between items-center text-sm'>
                        <span className='text-slate-500'>Tanggungan</span>
                        <span className='text-slate-800 font-semibold bg-slate-50 px-3 py-1 rounded-md border border-slate-100'>
                          {parseNum(jiwa)} Jiwa
                        </span>
                      </div>
                      <div className='flex justify-between items-center text-sm pb-3 border-b border-slate-100'>
                        <span className='text-slate-500'>
                          Beras (Ekuivalen)
                        </span>
                        <div className='text-right'>
                          <span className='text-slate-800 font-semibold block'>
                            {parseNum(jiwa) > 0
                              ? (parseNum(jiwa) * 2.5).toFixed(1)
                              : 0}{' '}
                            Kg
                          </span>
                          <span className='text-slate-400 text-[10px] uppercase'>
                            {parseNum(jiwa) > 0
                              ? (parseNum(jiwa) * 3.5).toFixed(1)
                              : 0}{' '}
                            Liter
                          </span>
                        </div>
                      </div>
                      <div className='flex justify-between items-center text-sm pt-1'>
                        <span className='text-slate-500'>Total Rupiah</span>
                        <span className='text-slate-800 font-semibold'>
                          {formatRp(parseNum(jiwa) * harga.berasFitrah)}
                        </span>
                      </div>
                    </div>
                  )}

                  {activeTab === 'Fidyah' && (
                    <div className='flex justify-between items-center text-sm font-medium'>
                      <span className='text-slate-500'>
                        Fidyah ({parseNum(hariFidyah)} Hari)
                      </span>
                      <span className='text-slate-800'>
                        {formatRp(parseNum(hariFidyah) * harga.fidyah)}
                      </span>
                    </div>
                  )}

                  {activeTab === 'Infaq' && (
                    <>
                      <div className='flex justify-between items-center text-sm pb-2 mb-2 border-b border-slate-100'>
                        <span className='text-slate-500'>Kategori</span>
                        <span className='text-slate-800 font-semibold text-right max-w-[150px] truncate'>
                          {infaqTujuan}
                        </span>
                      </div>
                      <div className='flex justify-between items-center text-sm'>
                        <span className='text-slate-500'>Nominal Infaq</span>
                        <span className='text-slate-800 font-semibold'>
                          {formatRp(parseNum(infaqNominal))}
                        </span>
                      </div>
                    </>
                  )}

                  {activeTab === 'Zakat Mal' && zResult.hasInput && (
                    <>
                      {activeMalTab === 'Emas, Perak & Perhiasan' ? (
                        <div className='space-y-3 border-b border-slate-100 pb-3 mb-2'>
                          <p className='text-xs font-bold text-slate-400 uppercase tracking-widest mb-2'>
                            Rincian Zakat
                          </p>
                          {zResult.items.map((item: any, i: number) => (
                            <div
                              key={i}
                              className='flex justify-between items-center text-sm'>
                              <span
                                className={`text-slate-500 ${!item.wajib && 'line-through opacity-50'}`}>
                                {item.name}
                              </span>
                              <span
                                className={`font-semibold ${item.wajib ? 'text-slate-800' : 'text-slate-400'}`}>
                                {formatRp(item.zakat)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : activeMalTab === 'Pertanian' ||
                        activeMalTab === "Zakat An'am" ? (
                        <div className='flex flex-col gap-2 border-b border-slate-100 pb-3 mb-2 overflow-hidden'>
                          <div className='flex justify-between items-center text-sm'>
                            <span className='text-slate-500 shrink-0'>
                              Objek Zakat Wajib
                            </span>
                            <span
                              className={`font-semibold text-right ${zResult.statusWajib ? 'text-slate-800' : 'text-slate-400'}`}>
                              {activeMalTab === 'Pertanian'
                                ? `${parseNum(mal.t_jumlah).toLocaleString('id-ID')} ${mal.t_satuan.toUpperCase()}`
                                : `${parseNum(mal.an_jumlah).toLocaleString('id-ID')} Ekor`}
                            </span>
                          </div>
                          {zResult.statusWajib && (
                            <div className='flex justify-between items-center text-sm pt-2 border-t border-slate-50'>
                              <span className='text-slate-500 mt-1 shrink-0'>
                                Wajib Zakat
                              </span>
                              <div className='flex items-center text-right justify-end max-w-[65%] overflow-hidden relative group/mq'>
                                <div className='animate-text-marquee font-bold text-teal-700 leading-snug cursor-default'>
                                  {zResult.wajibZakatTeks}{' '}
                                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{' '}
                                  {zResult.wajibZakatTeks}
                                </div>
                                <InfoIcon
                                  title='Dasar Perhitungan Zakat'
                                  desc={zResult.alasanMatematis}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className='flex justify-between items-center text-sm pb-3 mb-2 border-b border-slate-100'>
                          <span className='text-slate-500'>
                            Estimasi Bersih
                          </span>
                          <span className='text-slate-800 font-semibold'>
                            {formatRp(zResult.totalHarta)}
                          </span>
                        </div>
                      )}

                      {!['Pertanian', "Zakat An'am"].includes(activeMalTab) && (
                        <div className='flex justify-between items-center text-sm font-semibold mt-2'>
                          <span className='text-slate-500'>
                            Zakat Wajib (2.5%)
                          </span>
                          <span className='text-slate-800'>
                            {zResult.statusWajib
                              ? formatRp(zResult.wajibZakatRp)
                              : 'Rp 0'}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className='border-t border-slate-200 pt-5 mb-6 relative z-10'>
                  <span className='text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1'>
                    Kalkulasi Final Tunai
                  </span>
                  {activeTab === 'Zakat Mal' && zResult.hasInput ? (
                    <div className='flex items-center justify-between mt-1'>
                      <span
                        className={`text-xl md:text-2xl font-semibold tracking-tight block leading-tight ${!zResult.statusWajib ? 'text-orange-600' : 'text-teal-800'}`}>
                        {!zResult.statusWajib
                          ? 'Belum Wajib'
                          : formatRp(zResult.wajibZakatRp)}
                      </span>
                      <button
                        onClick={handleShowFinalInfo}
                        className={`p-1.5 rounded-full transition-colors shrink-0 ${!zResult.statusWajib ? 'hover:bg-orange-50' : 'hover:bg-teal-50'}`}
                        title='Lihat Penjelasan'>
                        <Info
                          className={`w-6 h-6 ${!zResult.statusWajib ? 'text-orange-500' : 'text-teal-600'}`}
                        />
                      </button>
                    </div>
                  ) : (
                    <span className='text-xl md:text-2xl font-semibold text-teal-800 tracking-tight block mt-1'>
                      {formatRp(getNominalBayar())}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  disabled={
                    (activeTab === 'Zakat Fitrah' && parseNum(jiwa) === 0) ||
                    (activeTab === 'Fidyah' && parseNum(hariFidyah) === 0) ||
                    (activeTab === 'Infaq' && parseNum(infaqNominal) === 0) ||
                    (activeTab === 'Zakat Mal' &&
                      (!zResult.statusWajib ||
                        (!zResult.wajibZakatRp && !zResult.wajibZakatTeks)))
                  }
                  className='relative z-10 w-full bg-teal-700 hover:bg-teal-800 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-teal-700 shadow-md shadow-teal-900/10'>
                  Selesaikan Pembayaran
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* ======================================= */
          /* WAKAF (SUDAH DINAMIS + PROGRESS BAR FIX)*/
          /* ======================================= */
          <motion.div
            initial='visible'
            animate='visible'
            variants={staggerContainer}
            className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {safeWakafListToRender.map((wakaf: any) => {
              const persentase =
                Math.min(
                  (parseNum(String(wakaf.terkumpul)) /
                    parseNum(String(wakaf.target))) *
                    100,
                  100,
                ) || 0;
              const isPenuh = persentase >= 100;

              return (
                <motion.div
                  variants={fadeInUp}
                  key={wakaf.id}
                  className='bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all group flex flex-col h-full relative'>
                  <div className='absolute -right-8 -bottom-8 opacity-[0.03] group-hover:scale-125 transition-transform duration-700 pointer-events-none z-0'>
                    {wakaf.judul.toLowerCase().includes('atap') ? (
                      <Building2 className='w-48 h-48 text-teal-900' />
                    ) : (
                      <Trees className='w-48 h-48 text-teal-900' />
                    )}
                  </div>
                  <div className='h-48 relative overflow-hidden shrink-0 z-10'>
                    <img
                      src={
                        wakaf.gambar_url ||
                        'https://images.unsplash.com/photo-1552858725-2758b5fb1286?auto=format&fit=crop&q=80'
                      }
                      alt={wakaf.judul}
                      className={`w-full h-full object-cover transition-transform duration-700 ${isPenuh ? 'grayscale' : 'group-hover:scale-105'}`}
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent'></div>
                    <span
                      className={`absolute top-4 left-4 backdrop-blur-md text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border ${isPenuh ? 'bg-emerald-500/80 border-emerald-400' : 'bg-white/20 border-white/20'}`}>
                      {isPenuh ? 'Alhamdulillah Terpenuhi' : 'Peluang Jariyah'}
                    </span>
                    <h3 className='absolute bottom-4 left-4 right-4 text-white font-bold text-xl leading-snug'>
                      {wakaf.judul}
                    </h3>
                  </div>
                  <div className='p-6 flex flex-col flex-1 relative z-10'>
                    <p className='text-sm text-slate-500 mb-6 flex-1 leading-relaxed'>
                      {wakaf.deskripsi}
                    </p>
                    <div className='mt-auto shrink-0'>
                      <div className='flex justify-between items-end mb-2'>
                        <span className='text-[10px] font-semibold text-slate-400 uppercase tracking-widest'>
                          Terkumpul
                        </span>
                        <span className='text-sm font-semibold text-slate-800'>
                          {formatRp(wakaf.terkumpul)}
                        </span>
                      </div>
                      <div className='w-full bg-slate-100 rounded-full h-1.5 mb-2 overflow-hidden flex'>
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${persentase}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className={`${isPenuh ? 'bg-emerald-500' : 'bg-teal-600'} h-full rounded-full`}></motion.div>
                      </div>
                      <div className='flex justify-between items-center mb-6'>
                        <span
                          className={`text-xs font-bold ${isPenuh ? 'text-emerald-600' : 'text-teal-700'}`}>
                          {persentase.toFixed(1)}%
                        </span>
                        <span className='text-[10px] font-medium text-slate-400'>
                          Target: {formatRp(wakaf.target)}
                        </span>
                      </div>
                      <button
                        disabled={isPenuh}
                        onClick={() => {
                          setWakafTujuan(wakaf.judul);
                          setWakafNominal(''); // Reset nominal ketika membuka form wakaf baru
                          setIsCheckoutOpen(true);
                        }}
                        className={`w-full text-white font-semibold py-3.5 rounded-xl transition-all text-sm shadow-md ${isPenuh ? 'bg-slate-300 cursor-not-allowed text-slate-500' : 'bg-teal-700 hover:bg-teal-800 shadow-teal-900/10'}`}>
                        {isPenuh ? 'Target Terpenuhi' : 'Wakaf Sekarang'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* SEKSI TRANSAPARANSI ZISWAF */}
      <motion.div
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true }}
        variants={fadeInUp}
        className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 relative z-20'>
        <div className='text-center mb-10'>
          <span className='inline-flex items-center justify-center p-3 bg-white border border-slate-100 rounded-2xl mb-4 shadow-sm text-teal-600'>
            <Users className='w-6 h-6' />
          </span>
          <h2 className='text-2xl md:text-3xl font-bold text-slate-800 mb-3'>
            Transparansi Penyaluran ZISWAF
          </h2>
          <p className='text-sm text-slate-500 max-w-2xl mx-auto'>
            Kami berkomitmen menjaga amanah jamaah dengan melaporkan penerimaan
            dana secara real-time dan terbuka.
          </p>
        </div>

        {isLoadingStats ? (
          <div className='flex justify-center items-center h-32'>
            <Loader2 className='w-8 h-8 text-teal-600 animate-spin' />
          </div>
        ) : (
          <>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-8'>
              {[
                {
                  title: 'Zakat Fitrah',
                  val: formatRp(realStats.fitrahRp),
                  sub: `+ ${realStats.fitrahKg} Kg Beras`,
                  don: realStats.donaturFitrah,
                  icon: <Heart className='w-24 h-24 text-slate-800' />,
                },
                {
                  title: 'Zakat Mal',
                  val: formatRp(realStats.mal),
                  don: realStats.donaturMal,
                  icon: <Wallet className='w-24 h-24 text-slate-800' />,
                },
                {
                  title: 'Total Infaq',
                  val: formatRp(realStats.infaq),
                  don: realStats.donaturInfaq,
                  icon: <Coins className='w-24 h-24 text-slate-800' />,
                },
                {
                  title: 'Total Wakaf',
                  val: formatRp(realStats.wakaf),
                  don: realStats.donaturWakaf,
                  icon: <Building2 className='w-24 h-24 text-slate-800' />,
                },
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className='bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center relative overflow-hidden group'>
                  <div className='absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-700 pointer-events-none'>
                    {stat.icon}
                  </div>
                  <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 relative z-10'>
                    {stat.title}
                  </p>
                  <p className='text-lg md:text-xl font-bold text-teal-700 leading-tight relative z-10'>
                    {stat.val}
                  </p>
                  {stat.sub && (
                    <p className='text-xs font-semibold text-slate-500 mt-1 relative z-10'>
                      {stat.sub}
                    </p>
                  )}
                  <p className='text-[10px] text-slate-400 mt-3 pt-3 border-t border-slate-50 relative z-10'>
                    {stat.don} Donatur Tersalurkan
                  </p>
                </div>
              ))}
            </div>

            <div className='bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden'>
              <div className='p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center'>
                <h3 className='font-bold text-slate-800'>Donatur Terkini</h3>
                <span className='text-xs font-semibold text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-100 flex items-center'>
                  <span className='w-2 h-2 bg-teal-500 rounded-full mr-2 animate-pulse'></span>{' '}
                  Live Update
                </span>
              </div>
              <div className='divide-y divide-slate-100'>
                {realDonatur.length === 0 ? (
                  <p className='p-6 text-center text-sm text-slate-400'>
                    Belum ada data penyaluran disahkan.
                  </p>
                ) : (
                  realDonatur.map((don, idx) => (
                    <div
                      key={idx}
                      className='p-4 md:p-6 flex items-center justify-between hover:bg-slate-50 transition-colors'>
                      <div className='flex items-center gap-4'>
                        <div className='w-10 h-10 rounded-full bg-gradient-to-br from-teal-50 to-slate-100 border border-slate-200 flex items-center justify-center text-teal-700 font-bold text-sm shrink-0'>
                          {maskNameStyle(don.nama, don.is_anonim).charAt(0)}
                        </div>
                        <div>
                          <p className='font-semibold text-slate-800 text-sm'>
                            {maskNameStyle(don.nama, don.is_anonim)}
                          </p>
                          <p className='text-xs text-slate-500 mt-0.5'>
                            {don.kategori}
                          </p>
                        </div>
                      </div>
                      <div className='text-right'>
                        <p className='text-[10px] md:text-xs font-semibold text-slate-400'>
                          {new Date(don.created_at).toLocaleDateString(
                            'id-ID',
                            { day: 'numeric', month: 'short' },
                          )}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </motion.div>

      {/* ================= MODAL CHECKOUT ZISWAF ================= */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto'>
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className='bg-white rounded-[2rem] w-full max-w-3xl my-8 relative shadow-2xl overflow-hidden flex flex-col'>
              <div className='bg-teal-800 p-6 flex justify-between items-center text-white shrink-0'>
                <div>
                  <h2 className='text-xl font-bold'>Formulir Penyaluran</h2>
                  <p className='text-teal-100 text-sm mt-1'>
                    {getKategoriCheckout()}
                  </p>
                </div>
                <button
                  onClick={() => setIsCheckoutOpen(false)}
                  className='p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors'>
                  <X className='w-6 h-6' />
                </button>
              </div>

              <div className='p-6 md:p-8 overflow-y-auto max-h-[75vh]'>
                <form
                  onSubmit={handleCheckoutSubmit}
                  className='space-y-6'>
                  {activeTab === 'Wakaf' ? (
                    <div className='bg-slate-50 border border-slate-200 p-5 rounded-2xl'>
                      <label className={labelUIClass}>Nominal Wakaf Anda</label>
                      <input
                        type='text'
                        required
                        value={valString(wakafNominal)}
                        onChange={(e) =>
                          setWakafNominal(e.target.value.replace(/[^0-9]/g, ''))
                        }
                        className={inputUIClass}
                        placeholder='Rp 0'
                      />
                    </div>
                  ) : (
                    <div className='bg-slate-50 border border-slate-200 p-5 rounded-2xl flex justify-between items-center'>
                      <span className='font-semibold text-slate-600'>
                        Total Pembayaran:
                      </span>
                      <span className='text-2xl font-bold text-teal-700'>
                        {formatRp(getNominalBayar())}
                      </span>
                    </div>
                  )}

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='md:col-span-2'>
                      <label className='block text-sm font-bold text-slate-700 mb-2'>
                        Nama Lengkap Donatur *
                      </label>
                      <div className='relative'>
                        <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                          <User className='h-5 w-5 text-slate-400' />
                        </div>
                        <input
                          name='nama'
                          type='text'
                          required
                          placeholder='Contoh: Budi Santoso'
                          className='w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600/30 focus:border-teal-500 outline-none transition-all font-semibold'
                        />
                      </div>
                      <label className='flex items-center mt-3 cursor-pointer group w-max'>
                        <input
                          type='checkbox'
                          checked={isAnonim}
                          onChange={(e) => setIsAnonim(e.target.checked)}
                          className='w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer'
                        />
                        <span className='ml-2 text-sm text-slate-600 font-medium group-hover:text-teal-700 transition-colors'>
                          Samarkan nama saya (misal: B**i S*****o) di daftar
                          donatur publik.
                        </span>
                      </label>
                    </div>

                    <div>
                      <label className='block text-sm font-bold text-slate-700 mb-2'>
                        Nomor WhatsApp *
                      </label>
                      <div className='relative'>
                        <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                          <Phone className='h-5 w-5 text-slate-400' />
                        </div>
                        <input
                          name='whatsapp'
                          type='tel'
                          required
                          placeholder='0812xxxxxx'
                          className='w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600/30 focus:border-teal-500 outline-none transition-all font-semibold'
                        />
                      </div>
                    </div>
                    <div>
                      <label className='block text-sm font-bold text-slate-700 mb-2'>
                        Alamat Email *
                      </label>
                      <div className='relative'>
                        <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                          <Mail className='h-5 w-5 text-slate-400' />
                        </div>
                        <input
                          name='email'
                          type='email'
                          required
                          placeholder='email@anda.com'
                          className='w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600/30 focus:border-teal-500 outline-none transition-all font-semibold'
                        />
                      </div>
                    </div>

                    <div className='md:col-span-2'>
                      <label className='block text-sm font-bold text-slate-700 mb-2'>
                        Pesan / Titipan Doa (Opsional)
                      </label>
                      <div className='relative'>
                        <div className='absolute top-4 left-4 pointer-events-none'>
                          <MessageSquare className='h-5 w-5 text-slate-400' />
                        </div>
                        <textarea
                          name='pesan'
                          rows={3}
                          placeholder='Tuliskan doa atau niat penyaluran Anda di sini...'
                          className='w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600/30 focus:border-teal-500 outline-none transition-all font-medium resize-none'
                        />
                      </div>
                    </div>

                    {/* SUNTIKAN 5: BLOK INSTRUKSI PEMBAYARAN DINAMIS */}
                    <div className='md:col-span-2 bg-teal-50/50 border border-teal-100 rounded-2xl p-6'>
                      <div className='flex items-center space-x-2 text-teal-800 font-bold mb-4'>
                        <ShieldCheck className='w-5 h-5' />
                        <h4>Instruksi Pembayaran</h4>
                      </div>

                      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 items-start'>
                        <div>
                          <p className='text-sm text-slate-600 mb-3'>
                            Silakan transfer nominal{' '}
                            <strong className='text-teal-700'>
                              {formatRp(getNominalBayar())}
                            </strong>{' '}
                            ke rekening berikut:
                          </p>
                          <div className='bg-white p-4 rounded-xl border border-teal-200 mb-4 shadow-sm'>
                            <p className='text-[10px] font-bold text-teal-600 uppercase mb-1'>
                              Transfer Bank Resmi
                            </p>
                            <p className='font-bold text-slate-800 text-sm leading-relaxed'>
                              {metodeBayar.rekening}
                            </p>
                          </div>
                          {metodeBayar.qrisUrl && (
                            <div
                              onContextMenu={(e) => e.preventDefault()}
                              onDragStart={(e) => e.preventDefault()}
                              className='bg-white p-4 rounded-xl border border-teal-200 shadow-sm text-center'
                              style={{
                                WebkitTouchCallout: 'none',
                                userSelect: 'none',
                                WebkitUserSelect: 'none',
                              }}>
                              <p className='text-[10px] font-bold text-teal-600 uppercase mb-2 flex items-center justify-center gap-1'>
                                <QrCode className='w-3 h-3' /> Atau Scan QRIS
                              </p>
                              <img
                                src={metodeBayar.qrisUrl}
                                alt='QRIS Ziswaf'
                                draggable='false'
                                style={{ pointerEvents: 'none' }}
                                className='w-full max-w-[200px] mx-auto rounded-lg border border-slate-100 [-webkit-user-drag:none]'
                              />
                            </div>
                          )}
                        </div>

                        <div>
                          <p className='text-sm text-slate-600 mb-3 font-semibold'>
                            Unggah Bukti Pembayaran:
                          </p>
                          <div className='relative border-2 border-dashed border-teal-300 bg-white rounded-xl p-8 text-center hover:bg-teal-50 transition-colors'>
                            <UploadCloud className='w-10 h-10 text-teal-600 mx-auto mb-3' />
                            <p className='text-sm text-slate-700 font-semibold'>
                              {checkoutFile ? (
                                <span className='text-teal-700'>
                                  {checkoutFile.name}
                                </span>
                              ) : (
                                'Pilih foto bukti transfer'
                              )}
                            </p>
                            <input
                              type='file'
                              accept='image/*'
                              onChange={(e) =>
                                setCheckoutFile(e.target.files?.[0] || null)
                              }
                              className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='pt-4'>
                    <button
                      type='submit'
                      disabled={isSubmitting}
                      className='w-full flex items-center justify-center space-x-2 bg-teal-700 text-white py-4 rounded-xl font-bold text-lg hover:bg-teal-800 transition-colors shadow-md disabled:bg-slate-400 disabled:cursor-not-allowed'>
                      <span>Selanjutnya</span>
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* POP-UP KONFIRMASI NIAT */}
      <AnimatePresence>
        {showNiatModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md'>
            <div className='bg-white rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl relative'>
              <div className='w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4'>
                <Heart className='w-8 h-8' />
              </div>
              <h3 className='text-2xl font-bold text-slate-800 mb-2'>
                Konfirmasi & Niat
              </h3>
              <p className='text-sm text-slate-500 mb-6'>
                Pastikan data dan bukti transfer Anda sudah benar. Mari
                sempurnakan amal ibadah Anda dengan membaca niat berikut:
              </p>

              <div className='bg-teal-50 border border-teal-100 rounded-2xl p-6 mb-8 mt-4'>
                <p
                  className='text-2xl font-bold text-teal-900 leading-relaxed mb-4'
                  style={{ fontFamily: "'Amiri', 'Traditional Arabic', serif" }}
                  dir='rtl'>
                  {getNiatData().arab}
                </p>
                <p className='text-sm font-medium text-teal-700 italic'>
                  "{getNiatData().arti}"
                </p>
              </div>

              <div className='flex gap-4'>
                <button
                  onClick={() => setShowNiatModal(false)}
                  className='flex-1 py-3.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200'>
                  Cek Kembali
                </button>
                <button
                  onClick={executeFinalCheckout}
                  disabled={isSubmitting}
                  className='flex-1 py-3.5 rounded-xl font-bold text-white bg-teal-700 hover:bg-teal-800 flex items-center justify-center'>
                  {isSubmitting ? (
                    <Loader2 className='w-5 h-5 animate-spin' />
                  ) : (
                    'Bismillah, Kirim'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODALS ALASAN & TOOLTIPS */}
      <AnimatePresence>
        {activeTooltip && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm'
            onClick={() => setActiveTooltip(null)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className='bg-white rounded-[2rem] p-6 max-w-sm w-full shadow-2xl relative'>
              <button
                onClick={() => setActiveTooltip(null)}
                className='absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors'>
                <X className='w-5 h-5' />
              </button>
              <h3 className='text-base font-bold text-slate-800 mb-3 pr-6'>
                {activeTooltip.title}
              </h3>
              <p className='text-sm text-slate-600 leading-relaxed font-medium whitespace-pre-line'>
                {activeTooltip.desc}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAlasan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-[55] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm'
            onClick={() => setShowAlasan(null)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className='bg-white rounded-[2rem] p-6 md:p-8 max-w-md w-full shadow-2xl relative'>
              <button
                onClick={() => setShowAlasan(null)}
                className='absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors'>
                <X className='w-5 h-5' />
              </button>
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 border ${showAlasan.includes('Belum') || showAlasan.includes('belum') || showAlasan.includes('kurang') ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-teal-50 text-teal-600 border-teal-100'}`}>
                <AlertCircle className='w-6 h-6' />
              </div>
              <h3 className='text-lg font-bold text-slate-800 mb-3'>
                Penjelasan Sistem Matematis
              </h3>
              <p className='text-sm text-slate-600 leading-relaxed font-medium whitespace-pre-line'>
                {showAlasan}
              </p>
              <button
                onClick={() => setShowAlasan(null)}
                className='w-full mt-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-xl transition-colors'>
                Saya Mengerti
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
