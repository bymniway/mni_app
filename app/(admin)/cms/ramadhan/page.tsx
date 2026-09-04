// 'use client';

// import { useState, useEffect } from 'react';
// import { supabase } from '@/lib/supabase';
// import RamadhanUI from '@/components/public/RamadhanUI';
// import { Save, Loader2, MousePointerClick } from 'lucide-react';
// import { motion } from 'framer-motion';

// export default function EditorHalamanRamadhan() {
//   const [isLoading, setIsLoading] = useState(true);
//   const [isSaving, setIsSaving] = useState(false);

//   const [form, setForm] = useState({
//     ramadhan_hero_judul: '',
//     ramadhan_hero_deskripsi: '',
//   });

//   const [schedules, setSchedules] = useState<any[]>([]);
//   const [finances, setFinances] = useState<any[]>([]);
//   const [activeYear, setActiveYear] = useState('1447'); // Default

//   useEffect(() => {
//     const fetchData = async () => {
//       const [resSchedules, resFinances, resSettings] = await Promise.all([
//         supabase
//           .from('ramadan_schedules')
//           .select('*')
//           .order('tanggal', { ascending: true }),
//         supabase
//           .from('ramadan_finances')
//           .select('*')
//           .order('tanggal', { ascending: true }),
//         supabase.from('pengaturan_web').select('*'),
//       ]);

//       if (resSchedules.data) setSchedules(resSchedules.data);
//       if (resFinances.data) setFinances(resFinances.data);

//       if (resSettings.data) {
//         const getVal = (key: string) =>
//           resSettings.data.find((d: any) => d.kunci === key)?.nilai || '';
//         setForm({
//           ramadhan_hero_judul:
//             getVal('ramadhan_hero_judul') || 'Semarak Ramadhan MNI',
//           ramadhan_hero_deskripsi:
//             getVal('ramadhan_hero_deskripsi') ||
//             'Informasi lengkap jadwal petugas tarawih...',
//         });
//         const savedYear = getVal('ramadhan_tahun_aktif');
//         if (savedYear) setActiveYear(savedYear);
//       }
//       setIsLoading(false);
//     };
//     fetchData();
//   }, []);

//   const handleTextChange = (key: string, value: string) =>
//     setForm((prev) => ({ ...prev, [key]: value }));
//   const handleYearChange = (year: string) => setActiveYear(year);

//   // === FUNGSI PUBLISH & SYNC GSHEET ===
//   const handlePublish = async () => {
//     setIsSaving(true);
//     try {
//       // 1. Simpan Pengaturan Teks ke Supabase
//       const updates = [
//         { kunci: 'ramadhan_hero_judul', nilai: form.ramadhan_hero_judul },
//         {
//           kunci: 'ramadhan_hero_deskripsi',
//           nilai: form.ramadhan_hero_deskripsi,
//         },
//         { kunci: 'ramadhan_tahun_aktif', nilai: activeYear },
//       ];
//       for (const item of updates) {
//         await supabase
//           .from('pengaturan_web')
//           .upsert(item, { onConflict: 'kunci' });
//       }

//       // 2. Auto Input ke Google Sheets (Kas & Jadwal) secara massal
//       const syncResponse = await fetch('/api/sync-ramadhan', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           tahun_hijriyah: activeYear,
//           schedules: activeSchedules,
//           finances: activeFinances,
//         }),
//       });

//       if (!syncResponse.ok) {
//         const errData = await syncResponse.json();
//         throw new Error(errData.error || 'Gagal sinkronisasi ke Google Sheets');
//       }

//       alert(
//         'Pengaturan berhasil dipublikasikan & Tersinkronisasi ke Google Sheets!',
//       );
//     } catch (error: any) {
//       alert(`Terjadi kesalahan: ${error.message}`);
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const activeSchedules = schedules.filter(
//     (s) => s.tahun_hijriyah === activeYear,
//   );
//   const activeFinances = finances.filter(
//     (f) => f.tahun_hijriyah === activeYear,
//   );

//   const handleScheduleUpdate = async (
//     id: string,
//     field: string,
//     value: any,
//   ) => {
//     try {
//       setSchedules((prev) =>
//         prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
//       );
//       await supabase
//         .from('ramadan_schedules')
//         .update({ [field]: value })
//         .eq('id', id);
//     } catch (err: any) {
//       alert(`Gagal mengupdate: ${err.message}`);
//     }
//   };

//   const handleScheduleAdd = async () => {
//     try {
//       let nextDateObj = new Date();
//       if (activeSchedules.length > 0) {
//         const lastDateStr = activeSchedules[activeSchedules.length - 1].tanggal;
//         nextDateObj = new Date(lastDateStr);
//         nextDateObj.setDate(nextDateObj.getDate() + 1);
//       }
//       const newSchedule = {
//         tanggal: nextDateObj.toISOString().split('T')[0],
//         tahun_hijriyah: activeYear,
//         imam: 'Nama Imam',
//         bilal: 'Nama Bilal',
//         donatur_takjil: 'Hamba Allah',
//         alamat_takjil: 'Masjid Nurul Iman',
//         status_imam: false,
//         status_takjil: false,
//       };
//       const { data } = await supabase
//         .from('ramadan_schedules')
//         .insert(newSchedule)
//         .select()
//         .single();
//       if (data) setSchedules((prev) => [...prev, data]);
//     } catch (err: any) {
//       alert(`Error: ${err.message}`);
//     }
//   };

//   const handleScheduleDelete = async (id: string) => {
//     setSchedules((prev) => prev.filter((s) => s.id !== id));
//     await supabase.from('ramadan_schedules').delete().eq('id', id);
//   };

//   const handleFinanceUpdate = async (
//     id: string,
//     field: string,
//     value: string,
//   ) => {
//     try {
//       const numericValue =
//         field === 'pemasukan' || field === 'pengeluaran'
//           ? Number(value.replace(/[^0-9]/g, ''))
//           : value;
//       setFinances((prev) =>
//         prev.map((f) => (f.id === id ? { ...f, [field]: numericValue } : f)),
//       );
//       await supabase
//         .from('ramadan_finances')
//         .update({ [field]: numericValue })
//         .eq('id', id);
//     } catch (err: any) {
//       alert(`Error: ${err.message}`);
//     }
//   };

//   const handleFinanceAdd = async () => {
//     try {
//       let nextDateObj = new Date();
//       if (activeFinances.length > 0) {
//         const lastDateStr = activeFinances[activeFinances.length - 1].tanggal;
//         nextDateObj = new Date(lastDateStr);
//         nextDateObj.setDate(nextDateObj.getDate() + 1);
//       }
//       const newFinance = {
//         tanggal: nextDateObj.toISOString().split('T')[0],
//         tahun_hijriyah: activeYear,
//         pemasukan: 0,
//         pengeluaran: 0,
//         keterangan_pengeluaran: '',
//       };
//       const { data } = await supabase
//         .from('ramadan_finances')
//         .insert(newFinance)
//         .select()
//         .single();
//       if (data) setFinances((prev) => [...prev, data]);
//     } catch (err: any) {
//       alert(`Error: ${err.message}`);
//     }
//   };

//   const handleFinanceDelete = async (id: string) => {
//     setFinances((prev) => prev.filter((f) => f.id !== id));
//     await supabase.from('ramadan_finances').delete().eq('id', id);
//   };

//   if (isLoading)
//     return (
//       <div className='p-10 flex justify-center mt-20'>
//         <Loader2 className='animate-spin text-emerald-600 w-8 h-8' />
//       </div>
//     );

//   return (
//     <div className='relative'>
//       <motion.div
//         initial={{ y: -50, opacity: 0 }}
//         animate={{ y: 0, opacity: 1 }}
//         className='sticky top-4 z-50 flex justify-between items-center bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-slate-100 max-w-7xl mx-auto mb-8'>
//         <div className='flex items-center'>
//           <div className='w-10 h-10 bg-teal-600 text-white rounded-xl flex items-center justify-center mr-3'>
//             <MousePointerClick className='w-5 h-5' />
//           </div>
//           <div>
//             <h1 className='text-xl font-bold text-slate-800'>
//               Live Visual Editor
//             </h1>
//             <p className='text-xs text-slate-500 font-medium hidden md:block'>
//               Ubah "Tahun Hijriyah" di Badge untuk berganti Database Tahun.
//             </p>
//           </div>
//         </div>
//         <button
//           onClick={handlePublish}
//           disabled={isSaving}
//           className='bg-teal-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center shadow-md hover:bg-emerald-700 transition disabled:opacity-50'>
//           {isSaving ? (
//             <Loader2 className='w-5 h-5 animate-spin mr-2' />
//           ) : (
//             <Save className='w-5 h-5 mr-2' />
//           )}{' '}
//           Publikasikan
//         </button>
//       </motion.div>

//       <div className='bg-slate-50/50 -mx-4 md:-mx-8 py-8 min-h-screen pointer-events-auto'>
//         <RamadhanUI
//           form={form}
//           schedules={activeSchedules}
//           finances={activeFinances}
//           activeYear={activeYear}
//           isEditor={true}
//           onTextChange={handleTextChange}
//           onYearChange={handleYearChange}
//           onScheduleUpdate={handleScheduleUpdate}
//           onScheduleDelete={handleScheduleDelete}
//           onScheduleAdd={handleScheduleAdd}
//           onFinanceUpdate={handleFinanceUpdate}
//           onFinanceDelete={handleFinanceDelete}
//           onFinanceAdd={handleFinanceAdd}
//         />
//       </div>
//     </div>
//   );
// }
//
//
//
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import RamadhanUI from '@/components/public/RamadhanUI';
import { Save, Loader2, MousePointerClick } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EditorHalamanRamadhan() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    ramadhan_hero_judul: '',
    ramadhan_hero_deskripsi: '',
  });

  const [schedules, setSchedules] = useState<any[]>([]);
  const [finances, setFinances] = useState<any[]>([]);
  const [activeYear, setActiveYear] = useState('1447');

  useEffect(() => {
    const fetchData = async () => {
      const [resSchedules, resFinances, resSettings] = await Promise.all([
        supabase
          .from('ramadan_schedules')
          .select('*')
          .order('tanggal', { ascending: true }),
        supabase
          .from('ramadan_finances')
          .select('*')
          .order('tanggal', { ascending: true }),
        supabase.from('pengaturan_web').select('*'),
      ]);

      if (resSchedules.data) setSchedules(resSchedules.data);
      if (resFinances.data) setFinances(resFinances.data);

      if (resSettings.data) {
        const getVal = (key: string) =>
          resSettings.data.find((d: any) => d.kunci === key)?.nilai || '';
        setForm({
          ramadhan_hero_judul:
            getVal('ramadhan_hero_judul') || 'Semarak Ramadhan MNI',
          ramadhan_hero_deskripsi:
            getVal('ramadhan_hero_deskripsi') ||
            'Informasi lengkap jadwal petugas tarawih...',
        });
        const savedYear = getVal('ramadhan_tahun_aktif');
        if (savedYear) setActiveYear(savedYear);
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const handleTextChange = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));
  const handleYearChange = (year: string) => setActiveYear(year);

  const handlePublish = async () => {
    setIsSaving(true);
    try {
      const updates = [
        { kunci: 'ramadhan_hero_judul', nilai: form.ramadhan_hero_judul },
        {
          kunci: 'ramadhan_hero_deskripsi',
          nilai: form.ramadhan_hero_deskripsi,
        },
        { kunci: 'ramadhan_tahun_aktif', nilai: activeYear },
      ];
      for (const item of updates) {
        await supabase
          .from('pengaturan_web')
          .upsert(item, { onConflict: 'kunci' });
      }

      const syncResponse = await fetch('/api/sync-ramadhan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tahun_hijriyah: activeYear,
          schedules: activeSchedules,
          finances: activeFinances,
        }),
      });

      if (!syncResponse.ok) {
        const errData = await syncResponse.json();
        throw new Error(errData.error || 'Gagal sinkronisasi ke Google Sheets');
      }

      alert(
        'Pengaturan berhasil dipublikasikan & Tersinkronisasi ke Google Sheets!',
      );
    } catch (error: any) {
      alert(`Terjadi kesalahan: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const activeSchedules = schedules.filter(
    (s) => s.tahun_hijriyah === activeYear,
  );
  const activeFinances = finances.filter(
    (f) => f.tahun_hijriyah === activeYear,
  );

  const handleScheduleUpdate = async (
    id: string,
    field: string,
    value: any,
  ) => {
    try {
      setSchedules((prev) =>
        prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
      );
      const { error } = await supabase
        .from('ramadan_schedules')
        .update({ [field]: value })
        .eq('id', id);
      if (error) throw error;
    } catch (err: any) {
      alert(`Gagal mengupdate: ${err.message}`);
    }
  };

  // === BUG FIX: Penanganan Tanggal Unik Jadwal ===
  const handleScheduleAdd = async () => {
    try {
      let nextDateStr = '';
      if (activeSchedules.length > 0) {
        // Ambil dari tanggal terakhir di tahun aktif ini
        const lastDateStr = activeSchedules[activeSchedules.length - 1].tanggal;
        const nextDateObj = new Date(lastDateStr);
        nextDateObj.setDate(nextDateObj.getDate() + 1);
        nextDateStr = nextDateObj.toISOString().split('T')[0];
      } else if (schedules.length > 0) {
        // Jika pindah tahun (layar kosong), lacak tanggal absolut terakhir di seluruh DB
        const allDates = schedules.map((s) => new Date(s.tanggal).getTime());
        const maxDate = new Date(Math.max(...allDates));
        maxDate.setDate(maxDate.getDate() + 1);
        nextDateStr = maxDate.toISOString().split('T')[0];
      } else {
        nextDateStr = new Date().toISOString().split('T')[0];
      }

      const newSchedule = {
        tanggal: nextDateStr,
        tahun_hijriyah: activeYear,
        imam: 'Nama Imam',
        bilal: 'Nama Bilal',
        donatur_takjil: 'Hamba Allah',
        alamat_takjil: 'Masjid Nurul Iman',
        status_imam: false,
        status_takjil: false,
      };

      const { data, error } = await supabase
        .from('ramadan_schedules')
        .insert(newSchedule)
        .select()
        .single();

      if (error) throw error; // Menangkap error Unique Supabase
      if (data) setSchedules((prev) => [...prev, data]);
    } catch (err: any) {
      alert(`Gagal menambah jadwal: ${err.message}`);
    }
  };

  const handleScheduleDelete = async (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
    await supabase.from('ramadan_schedules').delete().eq('id', id);
  };

  const handleFinanceUpdate = async (
    id: string,
    field: string,
    value: string,
  ) => {
    try {
      const numericValue =
        field === 'pemasukan' || field === 'pengeluaran'
          ? Number(value.replace(/[^0-9]/g, ''))
          : value;
      setFinances((prev) =>
        prev.map((f) => (f.id === id ? { ...f, [field]: numericValue } : f)),
      );
      const { error } = await supabase
        .from('ramadan_finances')
        .update({ [field]: numericValue })
        .eq('id', id);
      if (error) throw error;
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  // === BUG FIX: Penanganan Tanggal Unik Keuangan ===
  const handleFinanceAdd = async () => {
    try {
      let nextDateStr = '';
      if (activeFinances.length > 0) {
        // Ambil dari tanggal terakhir di tahun aktif ini
        const lastDateStr = activeFinances[activeFinances.length - 1].tanggal;
        const nextDateObj = new Date(lastDateStr);
        nextDateObj.setDate(nextDateObj.getDate() + 1);
        nextDateStr = nextDateObj.toISOString().split('T')[0];
      } else if (finances.length > 0) {
        // Jika pindah tahun (layar kosong), lacak tanggal absolut terakhir di seluruh DB
        const allDates = finances.map((f) => new Date(f.tanggal).getTime());
        const maxDate = new Date(Math.max(...allDates));
        maxDate.setDate(maxDate.getDate() + 1);
        nextDateStr = maxDate.toISOString().split('T')[0];
      } else {
        nextDateStr = new Date().toISOString().split('T')[0];
      }

      const newFinance = {
        tanggal: nextDateStr,
        tahun_hijriyah: activeYear,
        pemasukan: 0,
        pengeluaran: 0,
        keterangan_pengeluaran: '',
      };

      const { data, error } = await supabase
        .from('ramadan_finances')
        .insert(newFinance)
        .select()
        .single();

      if (error) throw error;
      if (data) setFinances((prev) => [...prev, data]);
    } catch (err: any) {
      alert(`Gagal menambah data kas: ${err.message}`);
    }
  };

  const handleFinanceDelete = async (id: string) => {
    setFinances((prev) => prev.filter((f) => f.id !== id));
    await supabase.from('ramadan_finances').delete().eq('id', id);
  };

  if (isLoading)
    return (
      <div className='p-10 flex justify-center mt-20'>
        <Loader2 className='animate-spin text-emerald-600 w-8 h-8' />
      </div>
    );

  return (
    <div className='relative'>
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className='sticky top-4 z-50 flex justify-between items-center bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-slate-100 max-w-7xl mx-auto mb-8'>
        <div className='flex items-center'>
          <div className='w-10 h-10 bg-teal-600 text-white rounded-xl flex items-center justify-center mr-3'>
            <MousePointerClick className='w-5 h-5' />
          </div>
          <div>
            <h1 className='text-xl font-bold text-slate-800'>
              Live Visual Editor
            </h1>
            <p className='text-xs text-slate-500 font-medium hidden md:block'>
              Ubah "Tahun Hijriyah" di Badge untuk berganti Database Tahun.
            </p>
          </div>
        </div>
        <button
          onClick={handlePublish}
          disabled={isSaving}
          className='bg-teal-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center shadow-md hover:bg-emerald-700 transition disabled:opacity-50'>
          {isSaving ? (
            <Loader2 className='w-5 h-5 animate-spin mr-2' />
          ) : (
            <Save className='w-5 h-5 mr-2' />
          )}{' '}
          Publikasikan
        </button>
      </motion.div>

      <div className='bg-slate-50/50 -mx-4 md:-mx-8 py-8 min-h-screen pointer-events-auto'>
        <RamadhanUI
          form={form}
          schedules={activeSchedules}
          finances={activeFinances}
          activeYear={activeYear}
          isEditor={true}
          onTextChange={handleTextChange}
          onYearChange={handleYearChange}
          onScheduleUpdate={handleScheduleUpdate}
          onScheduleDelete={handleScheduleDelete}
          onScheduleAdd={handleScheduleAdd}
          onFinanceUpdate={handleFinanceUpdate}
          onFinanceDelete={handleFinanceDelete}
          onFinanceAdd={handleFinanceAdd}
        />
      </div>
    </div>
  );
}
