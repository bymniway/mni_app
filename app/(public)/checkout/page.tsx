// 'use client';

// import { useState, useEffect, Suspense } from 'react';
// import { useSearchParams, useRouter } from 'next/navigation';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//   UploadCloud,
//   Loader2,
//   CheckSquare,
//   Plus,
//   Trash2,
//   Copy,
//   ShieldCheck,
//   MapPin,
//   User,
//   Phone,
//   Mail,
//   PackageOpen,
//   Heart,
//   QrCode,
// } from 'lucide-react';
// import { supabase } from '../../../lib/supabase';

// function CheckoutForm() {
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const hewanId = searchParams.get('hewanId');

//   const [isLoading, setIsLoading] = useState(false);
//   const [file, setFile] = useState<File | null>(null);

//   const [hewan, setHewan] = useState<any>(null);
//   const [kodeUnik, setKodeUnik] = useState(0);
//   const [isFetchingData, setIsFetchingData] = useState(true);

//   const [isUrunan, setIsUrunan] = useState(false);
//   const [metode, setMetode] = useState<'Lunas' | 'Booking'>('Lunas');

//   // STATE: Pengaturan Rekening & QRIS dari database
//   const [rekeningTujuan, setRekeningTujuan] = useState(
//     'Bank BSI 712 345 6789 a.n Masjid MNI',
//   );
//   const [qrisUrl, setQrisUrl] = useState('');

//   const [mudhohiList, setMudhohiList] = useState([
//     {
//       nama: '',
//       ambilSepertiga: false,
//       bagianSepertiga: '',
//       whatsapp: '',
//       email: '',
//       alamat: '',
//     },
//   ]);

//   // STATE UNTUK POP-UP NIAT
//   const [showNiatModal, setShowNiatModal] = useState(false);
//   const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);

//   useEffect(() => {
//     if (!hewanId) return;
//     const fetchDetailHewan = async () => {
//       try {
//         const { data } = await supabase
//           .from('hewan')
//           .select('*')
//           .eq('id', hewanId)
//           .single();
//         if (data) {
//           setHewan(data);
//           setKodeUnik(Math.floor(Math.random() * 99) + 1);
//           const isTipeUrunan =
//             String(data.tipe).toLowerCase().includes('urunan') ||
//             String(data.jenis).toLowerCase().includes('urunan');
//           setIsUrunan(isTipeUrunan);
//           if (isTipeUrunan) setMetode('Booking');
//         }

//         // AMBIL PENGATURAN PEMBAYARAN DARI DATABASE
//         const { data: webData } = await supabase
//           .from('pengaturan_web')
//           .select('*');
//         if (webData) {
//           const rek = webData.find((s) => s.kunci === 'kurban_rekening')?.nilai;
//           const qris = webData.find(
//             (s) => s.kunci === 'kurban_qris_url',
//           )?.nilai;
//           if (rek) setRekeningTujuan(rek);
//           if (qris) setQrisUrl(qris);
//         }
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setIsFetchingData(false);
//       }
//     };
//     fetchDetailHewan();
//   }, [hewanId]);

//   const addMudhohi = () =>
//     setMudhohiList([
//       ...mudhohiList,
//       {
//         nama: '',
//         ambilSepertiga: false,
//         bagianSepertiga: '',
//         whatsapp: '',
//         email: '',
//         alamat: '',
//       },
//     ]);

//   const removeMudhohi = (index: number) =>
//     setMudhohiList(mudhohiList.filter((_, i) => i !== index));

//   const updateMudhohi = (index: number, field: string, value: any) => {
//     const newList = [...mudhohiList];
//     newList[index] = { ...newList[index], [field]: value };
//     setMudhohiList(newList);
//   };

//   const copyFromFirst = (index: number) => {
//     const first = mudhohiList[0];
//     const newList = [...mudhohiList];
//     newList[index] = {
//       ...newList[index],
//       whatsapp: first.whatsapp,
//       email: first.email,
//       alamat: first.alamat,
//     };
//     setMudhohiList(newList);
//   };

//   const totalHargaHewan = hewan ? hewan.harga * mudhohiList.length : 0;
//   const totalBayar = totalHargaHewan + kodeUnik;
//   const satuanKuantitas = isUrunan ? 'Slot' : 'Ekor';

//   const formatRupiah = (angka: number) =>
//     new Intl.NumberFormat('id-ID', {
//       style: 'currency',
//       currency: 'IDR',
//       minimumFractionDigits: 0,
//     }).format(angka);

//   // FUNGSI SUBMIT KE-1: Validasi data dan buka Pop-up Niat
//   const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     if (metode === 'Lunas' && !file)
//       return alert('Mohon unggah bukti transfer pembayaran.');

//     for (const m of mudhohiList) {
//       if (
//         !m.nama.trim() ||
//         !m.whatsapp.trim() ||
//         !m.email.trim() ||
//         !m.alamat.trim()
//       ) {
//         return alert(
//           'Mohon lengkapi data Nama, WA, Email, dan Alamat untuk setiap pengkurban.',
//         );
//       }
//     }

//     const formData = new FormData();
//     if (file) formData.append('file', file);
//     formData.append('hewanId', hewanId || '');
//     formData.append('totalBayar', totalBayar.toString());
//     formData.append('metode', metode);
//     formData.append('mudhohiList', JSON.stringify(mudhohiList));

//     setPendingFormData(formData);
//     setShowNiatModal(true); // Membuka Modal Niat
//   };

//   // FUNGSI SUBMIT KE-2: Eksekusi pengiriman data ke server setelah baca Niat
//   const executeFinalCheckout = async () => {
//     if (!pendingFormData) return;
//     setIsLoading(true);

//     try {
//       const response = await fetch('/api/checkout', {
//         method: 'POST',
//         body: pendingFormData,
//       });
//       const result = await response.json();
//       if (response.ok) {
//         setShowNiatModal(false);
//         router.push('/kurban/status');
//       } else {
//         alert(`Pendaftaran Gagal: ${result.error}`);
//         setShowNiatModal(false);
//       }
//     } catch (error) {
//       alert('Terjadi kesalahan koneksi server.');
//       setShowNiatModal(false);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (isFetchingData)
//     return (
//       <div className='min-h-[60vh] flex flex-col items-center justify-center space-y-4'>
//         <Loader2 className='w-10 h-10 text-mni-primary animate-spin' />
//         <p className='font-bold text-mni-primary animate-pulse'>
//           Menyiapkan Formulir Anda...
//         </p>
//       </div>
//     );

//   return (
//     <div className='max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 py-10 px-4'>
//       <div className='mb-8 text-center md:text-left'>
//         <h1 className='text-2xl md:text-3xl font-bold text-mni-primary mb-2'>
//           Formulir Pendaftaran Kurban
//         </h1>
//         <p className='text-mni-muted'>
//           Silakan lengkapi data shohibul kurban di bawah ini.
//         </p>
//       </div>

//       <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10'>
//         <div className='lg:col-span-2 space-y-5'>
//           <form
//             id='checkout-form'
//             onSubmit={handleSubmit}
//             className='space-y-5'>
//             <div className='bg-white p-6 rounded-2xl border border-gray-100 shadow-sm'>
//               <div className='flex justify-between items-center mb-5'>
//                 <h2 className='text-base font-semibold text-mni-text'>
//                   Data Pendaftar & Mudhohi
//                 </h2>

//                 {/* Tombol Tambah Slot/Ekor untuk semua jenis kurban */}
//                 <button
//                   type='button'
//                   onClick={addMudhohi}
//                   className='flex items-center text-xs font-medium text-mni-primary bg-green-50 px-3 py-1.5 rounded-lg hover:bg-green-100 transition shadow-sm border border-green-100'>
//                   <Plus className='w-4 h-4 mr-1' /> Tambah {satuanKuantitas}
//                 </button>
//               </div>

//               <div className='space-y-6'>
//                 {mudhohiList.map((mudhohi, index) => (
//                   <div
//                     key={index}
//                     className='p-5 bg-white border border-gray-100 rounded-xl relative shadow-sm hover:shadow-md transition-all'>
//                     <div className='flex justify-between items-center mb-4 pb-3 border-b border-gray-50'>
//                       <h3 className='text-sm font-semibold text-gray-500 uppercase tracking-widest'>
//                         Data {satuanKuantitas} Ke-{index + 1}
//                       </h3>
//                       <div className='flex gap-2 items-center'>
//                         {/* Tombol Copy Kontak dari Mudhohi 1 */}
//                         {index > 0 && (
//                           <button
//                             type='button'
//                             onClick={() => copyFromFirst(index)}
//                             className='flex items-center text-[10px] font-bold text-mni-primary bg-green-50 px-2.5 py-1.5 rounded-lg hover:bg-green-100 border border-green-100 uppercase tracking-wide transition'>
//                             <Copy className='w-3 h-3 mr-1.5' /> Samakan Kontak 1
//                           </button>
//                         )}
//                         {/* Tombol Hapus */}
//                         {mudhohiList.length > 1 && (
//                           <button
//                             type='button'
//                             onClick={() => removeMudhohi(index)}
//                             className='text-gray-300 hover:text-red-500 ml-1 transition bg-gray-50 hover:bg-red-50 p-1.5 rounded-md border border-gray-100 hover:border-red-100'>
//                             <Trash2 className='w-4 h-4' />
//                           </button>
//                         )}
//                       </div>
//                     </div>

//                     <div className='space-y-4'>
//                       <div>
//                         <label className='block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide'>
//                           Nama Niat Kurban (Bin/Binti) *
//                         </label>
//                         <div className='relative'>
//                           <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
//                             <User className='h-4 w-4 text-gray-400' />
//                           </div>
//                           <input
//                             type='text'
//                             required
//                             value={mudhohi.nama}
//                             onChange={(e) =>
//                               updateMudhohi(index, 'nama', e.target.value)
//                             }
//                             placeholder='Contoh: Ahmad bin Fulan'
//                             className='w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-mni-primary/20 focus:border-mni-primary outline-none transition-all text-sm font-medium'
//                           />
//                         </div>
//                       </div>

//                       {isUrunan ? (
//                         <div
//                           className='flex items-center bg-gray-50 border border-gray-200 p-3.5 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors'
//                           onClick={() =>
//                             updateMudhohi(
//                               index,
//                               'ambilSepertiga',
//                               !mudhohi.ambilSepertiga,
//                             )
//                           }>
//                           <div
//                             className={`w-5 h-5 rounded flex items-center justify-center mr-3 border ${mudhohi.ambilSepertiga ? 'bg-mni-primary border-mni-primary' : 'bg-white border-gray-300'}`}>
//                             {mudhohi.ambilSepertiga && (
//                               <CheckSquare className='w-4 h-4 text-white' />
//                             )}
//                           </div>
//                           <div className='select-none'>
//                             <p className='text-sm font-bold text-gray-700'>
//                               Ambil Hak 1/3 Daging
//                             </p>
//                             <p className='text-[11px] text-gray-500 mt-0.5 font-medium'>
//                               Kosongkan jika ingin disedekahkan sepenuhnya.
//                             </p>
//                           </div>
//                         </div>
//                       ) : (
//                         <div>
//                           <label className='block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide'>
//                             Request 1/3 Bagian Daging (Opsional)
//                           </label>
//                           <div className='relative'>
//                             <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
//                               <PackageOpen className='h-4 w-4 text-gray-400' />
//                             </div>
//                             <input
//                               type='text'
//                               value={mudhohi.bagianSepertiga}
//                               onChange={(e) =>
//                                 updateMudhohi(
//                                   index,
//                                   'bagianSepertiga',
//                                   e.target.value,
//                                 )
//                               }
//                               placeholder='Contoh: Paha belakang / Iga / Kosongkan'
//                               className='w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-mni-primary/20 focus:border-mni-primary outline-none transition-all text-sm font-medium'
//                             />
//                           </div>
//                         </div>
//                       )}

//                       <div className='grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 mt-3 border-t border-gray-50'>
//                         <div>
//                           <label className='block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide'>
//                             No. WhatsApp *
//                           </label>
//                           <div className='relative'>
//                             <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
//                               <Phone className='h-4 w-4 text-gray-400' />
//                             </div>
//                             <input
//                               type='tel'
//                               required
//                               value={mudhohi.whatsapp}
//                               onChange={(e) =>
//                                 updateMudhohi(index, 'whatsapp', e.target.value)
//                               }
//                               placeholder='0812xxxxxx'
//                               className='w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-mni-primary/20 focus:border-mni-primary outline-none transition-all text-sm font-medium'
//                             />
//                           </div>
//                         </div>
//                         <div>
//                           <label className='block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide'>
//                             Email Invoice *
//                           </label>
//                           <div className='relative'>
//                             <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
//                               <Mail className='h-4 w-4 text-gray-400' />
//                             </div>
//                             <input
//                               type='email'
//                               required
//                               value={mudhohi.email}
//                               onChange={(e) =>
//                                 updateMudhohi(index, 'email', e.target.value)
//                               }
//                               placeholder='email@anda.com'
//                               className='w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-mni-primary/20 focus:border-mni-primary outline-none transition-all text-sm font-medium'
//                             />
//                           </div>
//                         </div>
//                         <div className='md:col-span-2'>
//                           <label className='block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide'>
//                             Alamat Domisili *
//                           </label>
//                           <div className='relative'>
//                             <div className='absolute top-3 left-3 pointer-events-none'>
//                               <MapPin className='h-4 w-4 text-gray-400' />
//                             </div>
//                             <textarea
//                               required
//                               value={mudhohi.alamat}
//                               onChange={(e) =>
//                                 updateMudhohi(index, 'alamat', e.target.value)
//                               }
//                               rows={2}
//                               placeholder='Jalan, Kelurahan, Kecamatan'
//                               className='w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-mni-primary/20 focus:border-mni-primary outline-none transition-all text-sm font-medium resize-none'
//                             />
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             <div className='bg-white p-6 rounded-2xl border border-gray-100 shadow-sm'>
//               <h2 className='text-base font-semibold text-slate-800 mb-5 flex items-center'>
//                 <ShieldCheck className='w-5 h-5 mr-2 text-mni-primary' /> Metode
//                 Pembayaran
//               </h2>

//               {isUrunan && (
//                 <div className='grid grid-cols-1 md:grid-cols-2 gap-3 mb-6'>
//                   <label
//                     className={`cursor-pointer border-2 p-4 rounded-xl flex flex-col items-center justify-center text-center transition-all ${metode === 'Lunas' ? 'border-mni-primary bg-green-50/50 shadow-sm' : 'border-gray-100 hover:border-green-200 bg-white hover:bg-gray-50'}`}>
//                     <input
//                       type='radio'
//                       name='metode'
//                       value='Lunas'
//                       checked={metode === 'Lunas'}
//                       onChange={() => setMetode('Lunas')}
//                       className='hidden'
//                     />
//                     <span
//                       className={`text-sm font-bold ${metode === 'Lunas' ? 'text-mni-primary' : 'text-gray-500'}`}>
//                       Bayar Lunas
//                     </span>
//                   </label>
//                   <label
//                     className={`cursor-pointer border-2 p-4 rounded-xl flex flex-col items-center justify-center text-center transition-all ${metode === 'Booking' ? 'border-mni-primary bg-green-50/50 shadow-sm' : 'border-gray-100 hover:border-green-200 bg-white hover:bg-gray-50'}`}>
//                     <input
//                       type='radio'
//                       name='metode'
//                       value='Booking'
//                       checked={metode === 'Booking'}
//                       onChange={() => setMetode('Booking')}
//                       className='hidden'
//                     />
//                     <span
//                       className={`text-sm font-bold ${metode === 'Booking' ? 'text-mni-primary' : 'text-gray-500'}`}>
//                       Booking Slot (Bayar Nanti)
//                     </span>
//                   </label>
//                 </div>
//               )}

//               {metode === 'Lunas' ? (
//                 <div>
//                   <div className='bg-gray-50 p-4 rounded-xl border border-gray-100 mb-4 text-center'>
//                     <p className='text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1'>
//                       Transfer Pembayaran Kurban
//                     </p>
//                     <p className='font-mono  text-l font-semibold text-slate-800 mb-1'>
//                       {rekeningTujuan}
//                     </p>
//                   </div>

//                   {/* KOTAK QRIS (NON-DOWNLOADABLE) */}
//                   {qrisUrl && (
//                     <div className='mb-6 text-center'>
//                       <p className='text-[10px] font-bold text-mni-primary uppercase mb-2 flex items-center justify-center gap-1'>
//                         <QrCode className='w-3 h-3' /> Atau Scan QRIS
//                       </p>
//                       {/* Kontainer pelindung anti-download */}
//                       <div
//                         onContextMenu={(e) => e.preventDefault()}
//                         onDragStart={(e) => e.preventDefault()}
//                         className='relative inline-block border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white p-2 select-none'
//                         style={{
//                           WebkitTouchCallout: 'none',
//                           userSelect: 'none',
//                           WebkitUserSelect: 'none',
//                         }}>
//                         {/* Lapisan Pelindung Atas (Mencegah Long-Press/Drag) */}
//                         <div
//                           className='absolute inset-0 z-10 bg-transparent'
//                           onPointerDown={(e) => e.preventDefault()}></div>
//                         <img
//                           src={qrisUrl}
//                           alt='QRIS Kurban'
//                           draggable='false'
//                           style={{ pointerEvents: 'none' }}
//                           className='w-full max-w-[200px] object-contain select-none [-webkit-user-drag:none]'
//                         />
//                       </div>
//                     </div>
//                   )}

//                   <label className='block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide'>
//                     Unggah Bukti Transfer *
//                   </label>
//                   <div className='border-2 border-dashed border-gray-300 bg-gray-50 rounded-xl p-8 text-center hover:bg-green-50 hover:border-mni-primary/50 transition-colors cursor-pointer relative'>
//                     <UploadCloud className='w-8 h-8 text-mni-primary mx-auto mb-3' />
//                     <p className='text-sm font-semibold text-gray-700'>
//                       {file ? (
//                         <span className='text-mni-primary'>{file.name}</span>
//                       ) : (
//                         'Klik untuk pilih foto / screenshot'
//                       )}
//                     </p>
//                     <input
//                       type='file'
//                       accept='image/*'
//                       onChange={(e) => setFile(e.target.files?.[0] || null)}
//                       className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
//                       required
//                     />
//                   </div>
//                 </div>
//               ) : (
//                 <div className='bg-gray-50 p-5 rounded-xl border border-gray-200 text-gray-600 text-sm text-center font-medium'>
//                   Bukti transfer tidak diperlukan saat ini. Tagihan pembayaran
//                   akan dikirimkan ke Email & WhatsApp Anda.
//                 </div>
//               )}
//             </div>
//           </form>
//         </div>

//         <div className='lg:col-span-1'>
//           <div className='bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm sticky top-6'>
//             <h3 className='font-bold text-lg text-slate-800 mb-6 flex items-center border-b border-gray-100 pb-4'>
//               Ringkasan Pesanan
//             </h3>
//             <div className='space-y-4 text-sm text-gray-600'>
//               <div className='flex justify-between items-center'>
//                 <span className='font-medium'>Kuantitas:</span>
//                 <span className='font-bold text-slate-800 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100'>
//                   {mudhohiList.length} {satuanKuantitas}
//                 </span>
//               </div>
//               <div className='flex justify-between items-center'>
//                 <span className='font-medium'>Subtotal:</span>
//                 <span className='font-bold text-slate-800'>
//                   {formatRupiah(totalHargaHewan)}
//                 </span>
//               </div>
//               <div className='flex justify-between items-center'>
//                 <span className='font-medium'>Kode Unik:</span>
//                 <span className='font-bold text-mni-primary'>
//                   + Rp {kodeUnik}
//                 </span>
//               </div>
//               <div className='border-t border-gray-100 pt-5 mt-5'>
//                 <span className='block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1'>
//                   Total Bayar
//                 </span>
//                 <span className='block text-3xl font-bold text-mni-primary tracking-tight'>
//                   {formatRupiah(totalBayar)}
//                 </span>
//               </div>
//             </div>

//             {/* Tombol memicu Popup Niat */}
//             <button
//               type='submit'
//               form='checkout-form'
//               className='w-full mt-8 bg-mni-primary text-white py-4 rounded-xl text-base font-bold hover:bg-mni-primaryHover transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex justify-center shadow-md shadow-mni-primary/10'>
//               {metode === 'Lunas' ? 'Kirim Konfirmasi' : 'Amankan Slot'}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* POP-UP KONFIRMASI & NIAT KURBAN */}
//       <AnimatePresence>
//         {showNiatModal && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className='fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md'>
//             <div className='bg-white rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl relative overflow-hidden'>
//               <div className='w-16 h-16 bg-green-50 text-mni-primary rounded-full flex items-center justify-center mx-auto mb-4 border border-green-100'>
//                 <Heart className='w-8 h-8 fill-current' />
//               </div>
//               <h3 className='text-2xl font-bold text-slate-800 mb-2'>
//                 Konfirmasi & Niat Kurban
//               </h3>
//               <p className='text-sm text-slate-500 mb-6 leading-relaxed'>
//                 Pastikan data dan bukti transfer Anda sudah benar. Mari
//                 sempurnakan ibadah kurban Anda dengan membaca niat berikut:
//               </p>

//               <div className='bg-green-50/50 border border-green-100 rounded-2xl p-6 mb-8 mt-4 relative'>
//                 <p
//                   className='text-2xl font-bold text-mni-primary leading-relaxed mb-4 font-arabic'
//                   style={{ fontFamily: "'Amiri', 'Traditional Arabic', serif" }}
//                   dir='rtl'>
//                   نَوَيْتُ أَنْ أُضَحِّيَ سُنَّةً لِلَّهِ تَعَالَى
//                 </p>
//                 <p className='text-sm font-medium text-green-700 italic'>
//                   "Saya niat berkurban sunnah karena Allah Ta'ala."
//                 </p>
//               </div>

//               <div className='flex gap-4 relative z-10'>
//                 <button
//                   onClick={() => setShowNiatModal(false)}
//                   className='flex-1 py-3.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition'>
//                   Cek Kembali
//                 </button>
//                 <button
//                   onClick={executeFinalCheckout}
//                   disabled={isLoading}
//                   className='flex-1 py-3.5 rounded-xl font-bold text-white bg-mni-primary hover:bg-mni-primaryHover flex items-center justify-center transition shadow-md disabled:bg-gray-400'>
//                   {isLoading ? (
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
//     </div>
//   );
// }

// export default function CheckoutPage() {
//   return (
//     <Suspense
//       fallback={
//         <div className='min-h-screen flex items-center justify-center'>
//           <Loader2 className='w-8 h-8 text-mni-primary animate-spin' />
//         </div>
//       }>
//       <CheckoutForm />
//     </Suspense>
//   );
// }
//
//
//
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  Loader2,
  CheckSquare,
  Plus,
  Trash2,
  Copy,
  ShieldCheck,
  MapPin,
  User,
  Phone,
  Mail,
  PackageOpen,
  Heart,
  QrCode,
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

function CheckoutForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const hewanId = searchParams.get('hewanId');

  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const [hewan, setHewan] = useState<any>(null);
  const [kodeUnik, setKodeUnik] = useState(0);
  const [isFetchingData, setIsFetchingData] = useState(true);

  const [isUrunan, setIsUrunan] = useState(false);
  const [metode, setMetode] = useState<'Lunas' | 'Booking'>('Lunas');

  // STATE: Pengaturan Rekening & QRIS dari database
  const [rekeningTujuan, setRekeningTujuan] = useState(
    'Bank BSI 712 345 6789 a.n Masjid MNI',
  );
  const [qrisUrl, setQrisUrl] = useState('');

  // STATE BARU UNTUK ANIMASI COPY REKENING
  const [isCopied, setIsCopied] = useState(false);

  const [mudhohiList, setMudhohiList] = useState([
    {
      nama: '',
      ambilSepertiga: false,
      bagianSepertiga: '',
      whatsapp: '',
      email: '',
      alamat: '',
    },
  ]);

  // STATE UNTUK POP-UP NIAT
  const [showNiatModal, setShowNiatModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);

  useEffect(() => {
    if (!hewanId) return;
    const fetchDetailHewan = async () => {
      try {
        const { data } = await supabase
          .from('hewan')
          .select('*')
          .eq('id', hewanId)
          .single();
        if (data) {
          setHewan(data);
          setKodeUnik(Math.floor(Math.random() * 99) + 1);
          const isTipeUrunan =
            String(data.tipe).toLowerCase().includes('urunan') ||
            String(data.jenis).toLowerCase().includes('urunan');
          setIsUrunan(isTipeUrunan);
          if (isTipeUrunan) setMetode('Booking');
        }

        // AMBIL PENGATURAN PEMBAYARAN DARI DATABASE
        const { data: webData } = await supabase
          .from('pengaturan_web')
          .select('*');
        if (webData) {
          const rek = webData.find((s) => s.kunci === 'kurban_rekening')?.nilai;
          const qris = webData.find(
            (s) => s.kunci === 'kurban_qris_url',
          )?.nilai;
          if (rek) setRekeningTujuan(rek);
          if (qris) setQrisUrl(qris);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsFetchingData(false);
      }
    };
    fetchDetailHewan();
  }, [hewanId]);

  const addMudhohi = () =>
    setMudhohiList([
      ...mudhohiList,
      {
        nama: '',
        ambilSepertiga: false,
        bagianSepertiga: '',
        whatsapp: '',
        email: '',
        alamat: '',
      },
    ]);

  const removeMudhohi = (index: number) =>
    setMudhohiList(mudhohiList.filter((_, i) => i !== index));

  const updateMudhohi = (index: number, field: string, value: any) => {
    const newList = [...mudhohiList];
    newList[index] = { ...newList[index], [field]: value };
    setMudhohiList(newList);
  };

  const copyFromFirst = (index: number) => {
    const first = mudhohiList[0];
    const newList = [...mudhohiList];
    newList[index] = {
      ...newList[index],
      whatsapp: first.whatsapp,
      email: first.email,
      alamat: first.alamat,
    };
    setMudhohiList(newList);
  };

  const totalHargaHewan = hewan ? hewan.harga * mudhohiList.length : 0;
  const totalBayar = totalHargaHewan + kodeUnik;
  const satuanKuantitas = isUrunan ? 'Slot' : 'Ekor';

  const formatRupiah = (angka: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(angka);

  // FUNGSI SUBMIT KE-1: Validasi data dan buka Pop-up Niat
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (metode === 'Lunas' && !file)
      return alert('Mohon unggah bukti transfer pembayaran.');

    for (const m of mudhohiList) {
      if (
        !m.nama.trim() ||
        !m.whatsapp.trim() ||
        !m.email.trim() ||
        !m.alamat.trim()
      ) {
        return alert(
          'Mohon lengkapi data Nama, WA, Email, dan Alamat untuk setiap pengkurban.',
        );
      }
    }

    const formData = new FormData();
    if (file) formData.append('file', file);
    formData.append('hewanId', hewanId || '');
    formData.append('totalBayar', totalBayar.toString());
    formData.append('metode', metode);
    formData.append('mudhohiList', JSON.stringify(mudhohiList));

    setPendingFormData(formData);
    setShowNiatModal(true); // Membuka Modal Niat
  };

  // FUNGSI SUBMIT KE-2: Eksekusi pengiriman data ke server setelah baca Niat
  const executeFinalCheckout = async () => {
    if (!pendingFormData) return;
    setIsLoading(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        body: pendingFormData,
      });
      const result = await response.json();
      if (response.ok) {
        setShowNiatModal(false);
        router.push('/kurban/status');
      } else {
        alert(`Pendaftaran Gagal: ${result.error}`);
        setShowNiatModal(false);
      }
    } catch (error) {
      alert('Terjadi kesalahan koneksi server.');
      setShowNiatModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetchingData)
    return (
      <div className='min-h-[60vh] flex flex-col items-center justify-center space-y-4'>
        <Loader2 className='w-10 h-10 text-mni-primary animate-spin' />
        <p className='font-bold text-mni-primary animate-pulse'>
          Menyiapkan Formulir Anda...
        </p>
      </div>
    );

  return (
    <div className='max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 py-10 px-4'>
      <div className='mb-8 text-center md:text-left'>
        <h1 className='text-2xl md:text-3xl font-bold text-mni-primary mb-2'>
          Formulir Pendaftaran Kurban
        </h1>
        <p className='text-mni-muted'>
          Silakan lengkapi data shohibul kurban di bawah ini.
        </p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10'>
        <div className='lg:col-span-2 space-y-5'>
          <form
            id='checkout-form'
            onSubmit={handleSubmit}
            className='space-y-5'>
            <div className='bg-white p-6 rounded-2xl border border-gray-100 shadow-sm'>
              <div className='flex justify-between items-center mb-5'>
                <h2 className='text-base font-semibold text-mni-text'>
                  Data Pendaftar & Mudhohi
                </h2>

                {/* Tombol Tambah Slot/Ekor untuk semua jenis kurban */}
                <button
                  type='button'
                  onClick={addMudhohi}
                  className='flex items-center text-xs font-medium text-mni-primary bg-green-50 px-3 py-1.5 rounded-lg hover:bg-green-100 transition shadow-sm border border-green-100'>
                  <Plus className='w-4 h-4 mr-1' /> Tambah {satuanKuantitas}
                </button>
              </div>

              <div className='space-y-6'>
                {mudhohiList.map((mudhohi, index) => (
                  <div
                    key={index}
                    className='p-5 bg-white border border-gray-100 rounded-xl relative shadow-sm hover:shadow-md transition-all'>
                    <div className='flex justify-between items-center mb-4 pb-3 border-b border-gray-50'>
                      <h3 className='text-sm font-semibold text-gray-500 uppercase tracking-widest'>
                        Data {satuanKuantitas} Ke-{index + 1}
                      </h3>
                      <div className='flex gap-2 items-center'>
                        {/* Tombol Copy Kontak dari Mudhohi 1 */}
                        {index > 0 && (
                          <button
                            type='button'
                            onClick={() => copyFromFirst(index)}
                            className='flex items-center text-[10px] font-bold text-mni-primary bg-green-50 px-2.5 py-1.5 rounded-lg hover:bg-green-100 border border-green-100 uppercase tracking-wide transition'>
                            <Copy className='w-3 h-3 mr-1.5' /> Samakan Kontak 1
                          </button>
                        )}
                        {/* Tombol Hapus */}
                        {mudhohiList.length > 1 && (
                          <button
                            type='button'
                            onClick={() => removeMudhohi(index)}
                            className='text-gray-300 hover:text-red-500 ml-1 transition bg-gray-50 hover:bg-red-50 p-1.5 rounded-md border border-gray-100 hover:border-red-100'>
                            <Trash2 className='w-4 h-4' />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className='space-y-4'>
                      <div>
                        <label className='block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide'>
                          Nama Niat Kurban (Bin/Binti) *
                        </label>
                        <div className='relative'>
                          <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                            <User className='h-4 w-4 text-gray-400' />
                          </div>
                          <input
                            type='text'
                            required
                            value={mudhohi.nama}
                            onChange={(e) =>
                              updateMudhohi(index, 'nama', e.target.value)
                            }
                            placeholder='Contoh: Ahmad bin Fulan'
                            className='w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-mni-primary/20 focus:border-mni-primary outline-none transition-all text-sm font-medium'
                          />
                        </div>
                        <p className='text-[10px] font-medium text-gray-400 mt-1.5 leading-snug'>
                          * Jika sapi utuh, pisahkan antar nama dengan tanda
                          koma (Contoh: Fulan, Budi, Siti).
                        </p>
                      </div>

                      {isUrunan ? (
                        <div
                          className='flex items-center bg-gray-50 border border-gray-200 p-3.5 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors'
                          onClick={() =>
                            updateMudhohi(
                              index,
                              'ambilSepertiga',
                              !mudhohi.ambilSepertiga,
                            )
                          }>
                          <div
                            className={`w-5 h-5 rounded flex items-center justify-center mr-3 border ${mudhohi.ambilSepertiga ? 'bg-mni-primary border-mni-primary' : 'bg-white border-gray-300'}`}>
                            {mudhohi.ambilSepertiga && (
                              <CheckSquare className='w-4 h-4 text-white' />
                            )}
                          </div>
                          <div className='select-none'>
                            <p className='text-sm font-bold text-gray-700'>
                              Ambil Hak 1/3 Daging
                            </p>
                            <p className='text-[11px] text-gray-500 mt-0.5 font-medium'>
                              Kosongkan jika ingin disedekahkan sepenuhnya.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label className='block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide'>
                            1/3 Bagian Daging (Kurban Sunah)
                          </label>
                          <div className='relative'>
                            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                              <PackageOpen className='h-4 w-4 text-gray-400' />
                            </div>
                            <input
                              type='text'
                              value={mudhohi.bagianSepertiga}
                              onChange={(e) =>
                                updateMudhohi(
                                  index,
                                  'bagianSepertiga',
                                  e.target.value,
                                )
                              }
                              placeholder='Contoh: Paha belakang / Iga. Kosongkan jika kurban wajib'
                              className='w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-mni-primary/20 focus:border-mni-primary outline-none transition-all text-sm font-medium'
                            />
                          </div>
                        </div>
                      )}

                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 mt-3 border-t border-gray-50'>
                        <div>
                          <label className='block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide'>
                            No. WhatsApp *
                          </label>
                          <div className='relative'>
                            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                              <Phone className='h-4 w-4 text-gray-400' />
                            </div>
                            <input
                              type='tel'
                              required
                              value={mudhohi.whatsapp}
                              onChange={(e) =>
                                updateMudhohi(index, 'whatsapp', e.target.value)
                              }
                              placeholder='0812xxxxxx'
                              className='w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-mni-primary/20 focus:border-mni-primary outline-none transition-all text-sm font-medium'
                            />
                          </div>
                        </div>
                        <div>
                          <label className='block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide'>
                            Email Invoice *
                          </label>
                          <div className='relative'>
                            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                              <Mail className='h-4 w-4 text-gray-400' />
                            </div>
                            <input
                              type='email'
                              required
                              value={mudhohi.email}
                              onChange={(e) =>
                                updateMudhohi(index, 'email', e.target.value)
                              }
                              placeholder='email@anda.com'
                              className='w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-mni-primary/20 focus:border-mni-primary outline-none transition-all text-sm font-medium'
                            />
                          </div>
                        </div>
                        <div className='md:col-span-2'>
                          <label className='block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide'>
                            Alamat Domisili *
                          </label>
                          <div className='relative'>
                            <div className='absolute top-3 left-3 pointer-events-none'>
                              <MapPin className='h-4 w-4 text-gray-400' />
                            </div>
                            <textarea
                              required
                              value={mudhohi.alamat}
                              onChange={(e) =>
                                updateMudhohi(index, 'alamat', e.target.value)
                              }
                              rows={2}
                              placeholder='Jalan, Kelurahan, Kecamatan'
                              className='w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-mni-primary/20 focus:border-mni-primary outline-none transition-all text-sm font-medium resize-none'
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className='bg-white p-6 rounded-2xl border border-gray-100 shadow-sm'>
              <h2 className='text-base font-semibold text-slate-800 mb-5 flex items-center'>
                <ShieldCheck className='w-5 h-5 mr-2 text-mni-primary' /> Metode
                Pembayaran
              </h2>

              {isUrunan && (
                <div className='grid grid-cols-1 md:grid-cols-2 gap-3 mb-6'>
                  <label
                    className={`cursor-pointer border-2 p-4 rounded-xl flex flex-col items-center justify-center text-center transition-all ${metode === 'Lunas' ? 'border-mni-primary bg-green-50/50 shadow-sm' : 'border-gray-100 hover:border-green-200 bg-white hover:bg-gray-50'}`}>
                    <input
                      type='radio'
                      name='metode'
                      value='Lunas'
                      checked={metode === 'Lunas'}
                      onChange={() => setMetode('Lunas')}
                      className='hidden'
                    />
                    <span
                      className={`text-sm font-bold ${metode === 'Lunas' ? 'text-mni-primary' : 'text-gray-500'}`}>
                      Bayar Lunas
                    </span>
                  </label>
                  <label
                    className={`cursor-pointer border-2 p-4 rounded-xl flex flex-col items-center justify-center text-center transition-all ${metode === 'Booking' ? 'border-mni-primary bg-green-50/50 shadow-sm' : 'border-gray-100 hover:border-green-200 bg-white hover:bg-gray-50'}`}>
                    <input
                      type='radio'
                      name='metode'
                      value='Booking'
                      checked={metode === 'Booking'}
                      onChange={() => setMetode('Booking')}
                      className='hidden'
                    />
                    <span
                      className={`text-sm font-bold ${metode === 'Booking' ? 'text-mni-primary' : 'text-gray-500'}`}>
                      Booking Slot (Bayar Nanti)
                    </span>
                  </label>
                </div>
              )}

              {metode === 'Lunas' ? (
                <div>
                  <div className='bg-gray-50 p-4 rounded-xl border border-gray-100 mb-4 text-center'>
                    <p className='text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1'>
                      Transfer Pembayaran Kurban
                    </p>

                    {/* BAGIAN COPY REKENING OTOMATIS */}
                    <div className='flex items-center justify-center gap-2 mb-1'>
                      <p className='font-mono text-lg font-semibold text-slate-800'>
                        {rekeningTujuan}
                      </p>
                      <button
                        type='button'
                        onClick={() => {
                          const angkaSaja = rekeningTujuan.replace(/\D/g, '');
                          if (angkaSaja) {
                            navigator.clipboard.writeText(angkaSaja);
                            setIsCopied(true);
                            setTimeout(() => setIsCopied(false), 2000);
                          }
                        }}
                        className='flex items-center p-1.5 bg-white border border-gray-200 rounded-md hover:bg-gray-100 transition-colors text-mni-primary shadow-sm focus:outline-none'
                        title='Salin Angka Rekening'>
                        {isCopied ? (
                          <span className='text-[10px] font-bold text-green-600 px-1'>
                            Tersalin!
                          </span>
                        ) : (
                          <Copy className='w-4 h-4' />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* KOTAK QRIS (NON-DOWNLOADABLE) */}
                  {qrisUrl && (
                    <div className='mb-6 text-center'>
                      <p className='text-[10px] font-bold text-mni-primary uppercase mb-2 flex items-center justify-center gap-1'>
                        <QrCode className='w-3 h-3' /> Atau Scan QRIS
                      </p>
                      {/* Kontainer pelindung anti-download */}
                      <div
                        onContextMenu={(e) => e.preventDefault()}
                        onDragStart={(e) => e.preventDefault()}
                        className='relative inline-block border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white p-2 select-none'
                        style={{
                          WebkitTouchCallout: 'none',
                          userSelect: 'none',
                          WebkitUserSelect: 'none',
                        }}>
                        {/* Lapisan Pelindung Atas (Mencegah Long-Press/Drag) */}
                        <div
                          className='absolute inset-0 z-10 bg-transparent'
                          onPointerDown={(e) => e.preventDefault()}></div>
                        <img
                          src={qrisUrl}
                          alt='QRIS Kurban'
                          draggable='false'
                          style={{ pointerEvents: 'none' }}
                          className='w-full max-w-[200px] object-contain select-none [-webkit-user-drag:none]'
                        />
                      </div>
                    </div>
                  )}

                  <label className='block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide'>
                    Unggah Bukti Transfer *
                  </label>
                  <div className='border-2 border-dashed border-gray-300 bg-gray-50 rounded-xl p-8 text-center hover:bg-green-50 hover:border-mni-primary/50 transition-colors cursor-pointer relative'>
                    <UploadCloud className='w-8 h-8 text-mni-primary mx-auto mb-3' />
                    <p className='text-sm font-semibold text-gray-700'>
                      {file ? (
                        <span className='text-mni-primary'>{file.name}</span>
                      ) : (
                        'Klik untuk pilih foto / screenshot'
                      )}
                    </p>
                    <input
                      type='file'
                      accept='image/*'
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
                      required
                    />
                  </div>
                </div>
              ) : (
                <div className='bg-gray-50 p-5 rounded-xl border border-gray-200 text-gray-600 text-sm text-center font-medium'>
                  Bukti transfer tidak diperlukan saat ini. Tagihan pembayaran
                  akan dikirimkan ke Email anda setelah slot urunan penuh.
                </div>
              )}
            </div>
          </form>
        </div>

        <div className='lg:col-span-1'>
          <div className='bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm sticky top-6'>
            <h3 className='font-bold text-lg text-slate-800 mb-6 flex items-center border-b border-gray-100 pb-4'>
              Ringkasan Pesanan
            </h3>
            <div className='space-y-4 text-sm text-gray-600'>
              <div className='flex justify-between items-center'>
                <span className='font-medium'>Kuantitas:</span>
                <span className='font-bold text-slate-800 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100'>
                  {mudhohiList.length} {satuanKuantitas}
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='font-medium'>Subtotal:</span>
                <span className='font-bold text-slate-800'>
                  {formatRupiah(totalHargaHewan)}
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='font-medium'>Kode Unik:</span>
                <span className='font-bold text-mni-primary'>
                  + Rp {kodeUnik}
                </span>
              </div>
              <div className='border-t border-gray-100 pt-5 mt-5'>
                <span className='block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1'>
                  Total Bayar
                </span>
                <span className='block text-3xl font-bold text-mni-primary tracking-tight'>
                  {formatRupiah(totalBayar)}
                </span>
              </div>
            </div>

            {/* Tombol memicu Popup Niat */}
            <button
              type='submit'
              form='checkout-form'
              className='w-full mt-8 bg-mni-primary text-white py-4 rounded-xl text-base font-bold hover:bg-mni-primaryHover transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex justify-center shadow-md shadow-mni-primary/10'>
              {metode === 'Lunas' ? 'Kirim Konfirmasi' : 'Amankan Slot'}
            </button>
          </div>
        </div>
      </div>

      {/* POP-UP KONFIRMASI & NIAT KURBAN */}
      <AnimatePresence>
        {showNiatModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md'>
            <div className='bg-white rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl relative overflow-hidden'>
              <div className='w-16 h-16 bg-green-50 text-mni-primary rounded-full flex items-center justify-center mx-auto mb-4 border border-green-100'>
                <Heart className='w-8 h-8 fill-current' />
              </div>
              <h3 className='text-2xl font-bold text-slate-800 mb-2'>
                Konfirmasi & Niat Kurban
              </h3>
              <p className='text-sm text-slate-500 mb-6 leading-relaxed'>
                Pastikan data dan bukti transfer Anda sudah benar. Mari
                sempurnakan ibadah kurban Anda dengan membaca niat berikut:
              </p>

              <div className='bg-green-50/50 border border-green-100 rounded-2xl p-6 mb-8 mt-4 relative'>
                <p
                  className='text-2xl font-bold text-mni-primary leading-relaxed mb-4 font-arabic'
                  style={{ fontFamily: "'Amiri', 'Traditional Arabic', serif" }}
                  dir='rtl'>
                  نَوَيْتُ أَنْ أُضَحِّيَ سُنَّةً لِلَّهِ تَعَالَى
                </p>
                <p className='text-sm font-medium text-green-700 italic'>
                  "Saya niat berkurban sunnah karena Allah Ta'ala."
                </p>
              </div>

              <div className='flex gap-4 relative z-10'>
                <button
                  onClick={() => setShowNiatModal(false)}
                  className='flex-1 py-3.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition'>
                  Cek Kembali
                </button>
                <button
                  onClick={executeFinalCheckout}
                  disabled={isLoading}
                  className='flex-1 py-3.5 rounded-xl font-bold text-white bg-mni-primary hover:bg-mni-primaryHover flex items-center justify-center transition shadow-md disabled:bg-gray-400'>
                  {isLoading ? (
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
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen flex items-center justify-center'>
          <Loader2 className='w-8 h-8 text-mni-primary animate-spin' />
        </div>
      }>
      <CheckoutForm />
    </Suspense>
  );
}
