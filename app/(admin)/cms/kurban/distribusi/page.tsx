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
//   User,
// } from 'lucide-react';

// export default function DistribusiDashboard() {
//   const [pesananList, setPesananList] = useState<any[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [search, setSearch] = useState('');

//   const [selectedKirim, setSelectedKirim] = useState<any>(null);
//   const [catatanKurir, setCatatanKurir] = useState('');
//   const [fotoBukti, setFotoBukti] = useState<File | null>(null);
//   const [previewUrl, setPreviewUrl] = useState<string | null>(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);

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

//   const filteredData = pesananList.filter(
//     (p) =>
//       p.nama_mudhohi.toLowerCase().includes(search.toLowerCase()) ||
//       p.kode_trx.toLowerCase().includes(search.toLowerCase()),
//   );

//   const handleSelesaikanPengiriman = async () => {
//     if (!fotoBukti) return alert('Wajib melampirkan foto serah terima daging!');
//     setIsSubmitting(true);

//     try {
//       const formData = new FormData();
//       formData.append('file', fotoBukti);
//       formData.append('provider', 'ALIBABA');
//       // Mengelompokkan gambar ke dalam folder khusus agar rapi di dasbor Alibaba
//       formData.append('folder', 'bukti-distribusi-assets');
//       const resUpload = await fetch('/api/upload', {
//         method: 'POST',
//         body: formData,
//       });
//       const { url } = await resUpload.json();
//       if (!url) throw new Error('Gagal upload foto');

//       // 2. Tarik Log Lama untuk Audit Trail
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

//       // 3. Update Database (Kita asumsikan Mas punya kolom 'bukti_kirim_url' dan 'catatan_kurir')
//       const { error } = await supabase
//         .from('pesanan')
//         .update({
//           status_pesanan: 'Terkirim',
//           logs: [...currentLogs, newLog],
//           // Opsional jika Mas mau tambah kolom ini di Supabase:
//           bukti_kirim_url: url,
//           catatan_kurir: catatanKurir,
//         })
//         .eq('id', selectedKirim.id);

//       if (error) throw error;

//       alert('Distribusi berhasil dicatat!');
//       setSelectedKirim(null);
//       setFotoBukti(null);
//       setCatatanKurir('');
//       fetchSiapKirim();
//     } catch (err: any) {
//       alert(err.message);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className='min-h-screen bg-slate-50 pb-20'>
//       {/* HEADER MOBILE-FIRST */}
//       <div className='bg-teal-600 text-white p-5 rounded-2xl shadow-md sticky top-0 z-40'>
//         <h1 className='text-xl font-bold tracking-tight'>Distribusi Daging</h1>
//         <p className='text-teal-100 text-xs mt-1'>
//           Panel khusus panitia Distribusi untuk mengelola pengiriman daging
//           kurban ke penerima.
//         </p>

//         <div className='relative mt-4'>
//           <Search className='absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400' />
//           <input
//             type='text'
//             placeholder='Cari nama / kode...'
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className='w-full bg-white text-slate-800 rounded-full py-3 pl-11 pr-4 text-sm font-medium outline-none shadow-sm focus:ring-2 focus:ring-teal-400'
//           />
//         </div>
//       </div>

//       {/* DAFTAR TUGAS KIRIM */}
//       <div className='p-4 space-y-4'>
//         {isLoading ? (
//           <div className='flex justify-center py-10'>
//             <Loader2 className='w-6 h-6 animate-spin text-teal-600' />
//           </div>
//         ) : filteredData.length === 0 ? (
//           <p className='text-center text-slate-400 py-10 text-sm'>
//             Belum ada paket daging yang siap kirim.
//           </p>
//         ) : (
//           filteredData.map((trx) => (
//             <div
//               key={trx.id}
//               className={`bg-white p-4 rounded-2xl shadow-sm border ${trx.status_pesanan === 'Terkirim' ? 'border-emerald-200 opacity-70' : 'border-slate-200'}`}>
//               <div className='flex justify-between items-start mb-3'>
//                 <div>
//                   <p className='text-xs font-bold text-slate-400'>
//                     {trx.kode_trx}
//                   </p>
//                   <p className='font-bold text-slate-800 text-lg leading-tight'>
//                     {trx.nama_mudhohi}
//                   </p>
//                 </div>
//                 {trx.status_pesanan === 'Terkirim' ? (
//                   <span className='bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1'>
//                     <CheckCircle2 className='w-3 h-3' /> Selesai
//                   </span>
//                 ) : (
//                   <span className='bg-orange-100 text-orange-700 px-2 py-1 rounded text-[10px] font-bold'>
//                     Siap Antar
//                   </span>
//                 )}
//               </div>

//               <div className='bg-slate-50 p-3 rounded-xl space-y-2 mb-4'>
//                 <div className='flex items-start gap-2 text-sm'>
//                   <MapPin className='w-4 h-4 text-red-500 shrink-0 mt-0.5' />
//                   <p className='text-slate-600 font-medium leading-snug'>
//                     {trx.alamat || 'Diambil di Masjid'}
//                   </p>
//                 </div>
//                 <div className='flex items-start gap-2 text-sm'>
//                   <PackageOpen className='w-4 h-4 text-blue-500 shrink-0 mt-0.5' />
//                   <p className='text-slate-600 font-medium leading-snug'>
//                     Request 1/3:{' '}
//                     <b>{trx.bagian_sepertiga || 'Sedekah Semua'}</b>
//                   </p>
//                 </div>
//               </div>

//               {trx.status_pesanan !== 'Terkirim' && (
//                 <button
//                   onClick={() => setSelectedKirim(trx)}
//                   className='w-full bg-teal-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-800 active:scale-95 transition-all'>
//                   Eksekusi Pengiriman
//                 </button>
//               )}
//             </div>
//           ))
//         )}
//       </div>

//       {/* MODAL EKSEKUSI KURIR (BOTTOM SHEET STYLE) */}
//       {selectedKirim && (
//         <div className='fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center animate-in fade-in'>
//           <div className='bg-white w-full sm:max-w-md rounded-t-[2rem] sm:rounded-[2rem] p-5 pb-8 animate-in slide-in-from-bottom-10'>
//             <div className='w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-5 sm:hidden'></div>

//             <h2 className='text-xl font-black text-slate-800 mb-1'>
//               Laporan Serah Terima
//             </h2>
//             <p className='text-sm text-slate-500 mb-5'>
//               Kurban milik <b>{selectedKirim.nama_mudhohi}</b>
//             </p>

//             <div className='space-y-4'>
//               {/* Upload Foto (Camera Mode) */}
//               <div>
//                 <label className='text-xs font-bold text-slate-500 uppercase mb-2 block'>
//                   Foto Bukti / Penerima
//                 </label>
//                 <div className='relative w-full h-40 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center overflow-hidden'>
//                   <input
//                     type='file'
//                     accept='image/*,capture=camera'
//                     onChange={(e) => setFotoBukti(e.target.files?.[0] || null)}
//                     className='absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20'
//                   />
//                   {previewUrl ? (
//                     <img
//                       src={previewUrl}
//                       className='w-full h-full object-cover opacity-90'
//                     />
//                   ) : (
//                     <>
//                       <Camera className='w-8 h-8 text-slate-400 mb-2' />
//                       <span className='text-xs font-bold text-slate-500'>
//                         Buka Kamera / Galeri
//                       </span>
//                     </>
//                   )}
//                 </div>
//               </div>

//               {/* Catatan Kurir */}
//               <div>
//                 <label className='text-xs font-bold text-slate-500 uppercase mb-2 block'>
//                   Catatan Pengirim (Opsional)
//                 </label>
//                 <textarea
//                   rows={2}
//                   placeholder='Misal: Diterima oleh istrinya / Ditaruh di teras...'
//                   value={catatanKurir}
//                   onChange={(e) => setCatatanKurir(e.target.value)}
//                   className='w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-slate-50'
//                 />
//               </div>

//               <div className='flex gap-3 pt-2'>
//                 <button
//                   onClick={() => {
//                     setSelectedKirim(null);
//                     setFotoBukti(null);
//                   }}
//                   className='w-1/3 py-3.5 rounded-xl font-bold text-slate-600 bg-slate-100'>
//                   Batal
//                 </button>
//                 <button
//                   onClick={handleSelesaikanPengiriman}
//                   disabled={isSubmitting || !fotoBukti}
//                   className='w-2/3 py-3.5 rounded-xl font-bold text-white bg-teal-600 disabled:opacity-50 flex items-center justify-center gap-2'>
//                   {isSubmitting ? (
//                     <Loader2 className='w-4 h-4 animate-spin' />
//                   ) : (
//                     <CheckCircle2 className='w-4 h-4' />
//                   )}
//                   Selesaikan
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

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
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
} from 'lucide-react';

// Fungsi Helper untuk menyalin teks (No WA)
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

  // State untuk Fitur Tab Filter
  const [activeFilter, setActiveFilter] = useState<
    'Semua' | 'Siap Antar' | 'Selesai'
  >('Semua');

  const [selectedKirim, setSelectedKirim] = useState<any>(null);
  const [catatanKurir, setCatatanKurir] = useState('');
  const [fotoBukti, setFotoBukti] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchSiapKirim = async () => {
    setIsLoading(true);

    const { data } = await supabase
      .from('pesanan')
      .select('*, hewan(jenis, tipe)')
      .in('status_pesanan', ['Selesai', 'Terkirim'])
      .order('status_pesanan', { ascending: false }); // 'Selesai' di atas, 'Terkirim' di bawah

    if (data) setPesananList(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSiapKirim();
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

  // Fungsi Copy No WA
  const handleCopyWa = async (pesananId: string, wa: string) => {
    if (!wa) return;
    const success = await copyToClipboard(wa);
    if (success) {
      setCopiedId(pesananId);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Logika Filter Ganda (Search Box + Tab Filter)
  const filteredData = pesananList.filter((p) => {
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

  // Kalkulasi Statistik Distribusi
  const totalPaket = pesananList.length;
  const totalTerkirim = pesananList.filter(
    (p) => p.status_pesanan === 'Terkirim',
  ).length;
  const persenProgres =
    totalPaket === 0 ? 0 : Math.round((totalTerkirim / totalPaket) * 100);

  const handleSelesaikanPengiriman = async () => {
    if (!fotoBukti) return alert('Wajib melampirkan foto serah terima daging!');
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('file', fotoBukti);
      formData.append('provider', 'ALIBABA');
      formData.append('folder', 'bukti-distribusi-assets');
      const resUpload = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const { url } = await resUpload.json();
      if (!url) throw new Error('Gagal upload foto');

      const { data: psn } = await supabase
        .from('pesanan')
        .select('logs')
        .eq('id', selectedKirim.id)
        .single();
      const currentLogs = psn?.logs || [];
      const newLog = {
        status: 'Hak Daging Diterima',
        timestamp: new Date().toISOString(),
        oleh: 'Panitia Bagian Distribusi',
        catatan:
          catatanKurir ||
          'Daging kurban telah diserahkan kepada mudhohi/penerima.',
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
      fetchSiapKirim(); // Refresh data untuk meng-update progress bar
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='min-h-screen bg-[#F8FAFC] pb-24 font-sans'>
      {/* HEADER STICKY PREMIUM */}
      <div className='sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm'>
        <div className='bg-gradient-to-r from-teal-700 to-emerald-600 px-5 py-6 rounded-b-[32px] shadow-lg shadow-teal-900/10'>
          <h1 className='text-2xl font-extrabold text-white tracking-tight mb-1'>
            Distribusi Daging
          </h1>

          {/* Progress Bar Indikator */}
          <div className='mt-4 bg-white/10 rounded-xl p-3 border border-white/20 backdrop-blur-sm'>
            <div className='flex justify-between items-center mb-2'>
              <span className='text-[11px] font-bold text-teal-100 uppercase tracking-wider'>
                Progres Hari Ini
              </span>
              <span className='text-xs font-bold text-white bg-white/20 px-2 py-0.5 rounded'>
                {totalTerkirim} / {totalPaket} Paket
              </span>
            </div>
            <div className='w-full bg-black/20 rounded-full h-1.5 overflow-hidden'>
              <div
                className='bg-emerald-400 h-1.5 rounded-full transition-all duration-1000 ease-out'
                style={{ width: `${persenProgres}%` }}></div>
            </div>
          </div>

          <div className='relative mt-5'>
            <Search className='absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400' />
            <input
              type='text'
              placeholder='Cari nama / kode trx / no WA...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='w-full bg-white text-slate-800 rounded-full py-3.5 pl-11 pr-4 text-sm font-semibold outline-none shadow-sm focus:ring-4 focus:ring-teal-400/30 transition-all placeholder:font-medium placeholder:text-slate-400'
            />
          </div>
        </div>

        {/* TAB FILTER (Siap Antar / Selesai) */}
        <div className='flex gap-2 px-4 py-3 overflow-x-auto hide-scrollbar'>
          {(['Semua', 'Siap Antar', 'Selesai'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-1.5 ${
                activeFilter === tab
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20 ring-2 ring-teal-600/20'
                  : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
              }`}>
              {tab === 'Semua' && <Filter className='w-3 h-3' />}
              {tab === 'Siap Antar' && <Clock className='w-3 h-3' />}
              {tab === 'Selesai' && <CheckSquare className='w-3 h-3' />}
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* DAFTAR TUGAS KIRIM (PREMIUM CARDS) */}
      <div className='p-4 sm:p-6 space-y-4 max-w-3xl mx-auto'>
        {isLoading ? (
          <div className='flex flex-col items-center justify-center py-12 space-y-3'>
            <Loader2 className='w-8 h-8 animate-spin text-teal-600' />
            <p className='text-sm font-semibold text-slate-400'>
              Memuat data distribusi...
            </p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className='text-center py-16 bg-white rounded-[28px] border border-dashed border-slate-300'>
            <PackageOpen className='w-12 h-12 text-slate-300 mx-auto mb-3' />
            <h3 className='text-lg font-bold text-slate-700'>
              Tidak ada paket
            </h3>
            <p className='text-slate-500 text-sm mt-1'>
              Data untuk filter "{activeFilter}" tidak ditemukan.
            </p>
          </div>
        ) : (
          filteredData.map((trx) => {
            const isTerkirim = trx.status_pesanan === 'Terkirim';
            return (
              <div
                key={trx.id}
                className={`relative bg-white p-5 rounded-[24px] transition-all duration-300 ${
                  isTerkirim
                    ? 'border border-emerald-100 shadow-sm opacity-80 bg-gradient-to-b from-emerald-50/30 to-transparent'
                    : 'border border-slate-200/80 shadow-lg shadow-slate-200/40 hover:-translate-y-0.5'
                }`}>
                {/* Header Card */}
                <div className='flex justify-between items-start mb-4'>
                  <div>
                    <p className='text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-0.5'>
                      {trx.kode_trx}
                    </p>
                    <h3 className='font-extrabold text-slate-800 text-lg leading-tight'>
                      {trx.nama_mudhohi}
                    </h3>
                  </div>
                  {isTerkirim ? (
                    <span className='bg-emerald-100/80 text-emerald-700 px-2.5 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 border border-emerald-200'>
                      <CheckCircle2 className='w-3.5 h-3.5' /> Tuntas
                    </span>
                  ) : (
                    <span className='bg-orange-100/80 text-orange-700 px-2.5 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 border border-orange-200 animate-pulse'>
                      <Clock className='w-3.5 h-3.5' /> Siap Antar
                    </span>
                  )}
                </div>

                {/* Info Container */}
                <div className='bg-[#F8FAFC] p-4 rounded-2xl space-y-3 mb-5 border border-slate-100'>
                  {/* Alamat */}
                  <div className='flex items-start gap-2.5 text-sm'>
                    <div className='bg-red-100 text-red-600 p-1.5 rounded-lg shrink-0 mt-0.5'>
                      <MapPin className='w-4 h-4' />
                    </div>
                    <p className='text-slate-600 font-medium leading-snug pt-1'>
                      {trx.alamat || (
                        <span className='italic text-slate-400'>
                          Diambil di Masjid
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Request Bagian */}
                  <div className='flex items-start gap-2.5 text-sm'>
                    <div className='bg-blue-100 text-blue-600 p-1.5 rounded-lg shrink-0 mt-0.5'>
                      <PackageOpen className='w-4 h-4' />
                    </div>
                    <p className='text-slate-600 font-medium leading-snug pt-1'>
                      Request Hak 1/3: <br />
                      <b className='text-slate-800'>
                        {trx.bagian_sepertiga || 'Sedekah Semua'}
                      </b>
                    </p>
                  </div>

                  {/* Nomor WhatsApp Copy Feature */}
                  {trx.whatsapp && (
                    <div className='flex items-center justify-between gap-2.5 text-sm pt-2 border-t border-slate-200/60 mt-1'>
                      <div className='flex items-center gap-2.5'>
                        <div className='bg-emerald-100 text-emerald-600 p-1.5 rounded-lg shrink-0'>
                          <Phone className='w-4 h-4' />
                        </div>
                        <p className='text-slate-700 font-bold font-mono tracking-wide'>
                          {trx.whatsapp}
                        </p>
                      </div>
                      <button
                        onClick={() => handleCopyWa(trx.id, trx.whatsapp)}
                        className='p-2 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold text-slate-500'>
                        {copiedId === trx.id ? (
                          <span className='text-teal-600 flex items-center gap-1'>
                            <CheckCircle2 className='w-3.5 h-3.5' /> Disalin
                          </span>
                        ) : (
                          <>
                            <Copy className='w-3.5 h-3.5' /> Salin
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                {!isTerkirim && (
                  <button
                    onClick={() => setSelectedKirim(trx)}
                    className='w-full bg-teal-600 text-white py-3.5 rounded-2xl font-bold text-sm sm:text-[15px] hover:bg-teal-700 hover:shadow-lg hover:shadow-teal-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2'>
                    <Camera className='w-4 h-4' /> Ambil Foto Serah Terima
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* MODAL EKSEKUSI KURIR (PREMIUM BOTTOM SHEET) */}
      {selectedKirim && (
        <div className='fixed inset-0 z-50 flex items-end sm:items-center justify-center'>
          {/* Backdrop (Klik luar untuk menutup) */}
          <div
            className='absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300'
            onClick={() => {
              if (!isSubmitting) {
                setSelectedKirim(null);
                setFotoBukti(null);
              }
            }}
          />

          <div className='relative bg-white w-full sm:max-w-md rounded-t-[32px] sm:rounded-[32px] p-6 sm:p-8 pb-8 animate-in slide-in-from-bottom-full duration-400 ease-out shadow-2xl'>
            {/* Grabber untuk indikator swipe di mobile */}
            <div className='w-14 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 sm:hidden'></div>

            <div className='mb-6'>
              <h2 className='text-2xl font-black text-slate-800 tracking-tight'>
                Verifikasi Daging
              </h2>
              <p className='text-[15px] text-slate-500 font-medium mt-1 leading-snug'>
                Penerima:{' '}
                <b className='text-teal-700'>{selectedKirim.nama_mudhohi}</b>
              </p>
            </div>

            <div className='space-y-5'>
              {/* Premium Upload Box */}
              <div>
                <div className='flex justify-between items-end mb-2'>
                  <label className='text-[11px] font-bold text-slate-500 uppercase tracking-widest'>
                    Bukti Foto (Wajib)
                  </label>
                </div>
                <div
                  className={`relative w-full h-48 sm:h-56 rounded-2xl border-2 flex flex-col items-center justify-center overflow-hidden transition-all ${
                    previewUrl
                      ? 'border-teal-500 shadow-lg shadow-teal-500/20'
                      : 'border-dashed border-slate-300 bg-gradient-to-b from-slate-50 to-slate-100 hover:border-teal-400 hover:bg-teal-50/50'
                  }`}>
                  <input
                    type='file'
                    accept='image/*,capture=camera'
                    onChange={(e) => setFotoBukti(e.target.files?.[0] || null)}
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
                        <Camera className='w-8 h-8 text-white mb-1' />
                        <span className='text-white text-xs font-bold'>
                          Ketuk untuk mengganti
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className='text-center p-4'>
                      <div className='w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-100'>
                        <Camera className='w-7 h-7 text-teal-600' />
                      </div>
                      <p className='text-sm font-bold text-slate-700'>
                        Buka Kamera / Galeri
                      </p>
                      <p className='text-xs text-slate-400 mt-1 font-medium'>
                        Pastikan foto terlihat jelas dan tidak blur.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Input Catatan Estetik */}
              <div>
                <label className='text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 block'>
                  Catatan Pengiriman (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder='Cth: Diterima oleh istrinya di teras rumah...'
                  value={catatanKurir}
                  onChange={(e) => setCatatanKurir(e.target.value)}
                  disabled={isSubmitting}
                  className='w-full border-2 border-slate-200 rounded-2xl p-4 text-[15px] font-medium outline-none focus:border-teal-500 focus:bg-white bg-slate-50 transition-all resize-none placeholder:text-slate-400'
                />
              </div>

              <div className='flex gap-3 pt-3'>
                <button
                  onClick={() => {
                    setSelectedKirim(null);
                    setFotoBukti(null);
                    setCatatanKurir('');
                  }}
                  disabled={isSubmitting}
                  className='w-1/3 py-4 rounded-2xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all disabled:opacity-50'>
                  Batal
                </button>
                <button
                  onClick={handleSelesaikanPengiriman}
                  disabled={isSubmitting || !fotoBukti}
                  className='w-2/3 py-4 rounded-2xl font-bold text-white bg-teal-600 hover:bg-teal-700 hover:shadow-lg hover:shadow-teal-600/30 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2'>
                  {isSubmitting ? (
                    <>
                      <Loader2 className='w-5 h-5 animate-spin' /> Mengunggah...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className='w-5 h-5' /> Konfirmasi Tuntas
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
