'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Search,
  Loader2,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';

export default function LacakStatusPage() {
  const [keyword, setKeyword] = useState('');
  const [hasil, setHasil] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sudahCari, setSudahCari] = useState(false);

  const cariStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword) return;

    setIsLoading(true);
    setSudahCari(true);

    try {
      // Cari berdasarkan Kode TRX ATAU Nomor WhatsApp
      const { data, error } = await supabase
        .from('pesanan')
        .select('*, hewan(jenis, tipe)')
        .or(`kode_trx.ilike.%${keyword}%,whatsapp.ilike.%${keyword}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHasil(data || []);
    } catch (error) {
      console.error(error);
      alert('Gagal mencari data.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusUI = (status: string) => {
    switch (status) {
      case 'Lunas':
        return {
          icon: <CheckCircle2 className='w-5 h-5 text-emerald-600' />,
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          text: 'text-emerald-700',
        };
      case 'Booking':
        return {
          icon: <FileText className='w-5 h-5 text-indigo-600' />,
          bg: 'bg-indigo-50',
          border: 'border-indigo-200',
          text: 'text-indigo-700',
        };
      case 'Menunggu':
        return {
          icon: <Clock className='w-5 h-5 text-amber-600' />,
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-700',
        };
      default:
        return {
          icon: <AlertCircle className='w-5 h-5 text-red-600' />,
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-700',
        };
    }
  };

  return (
    <div className='max-w-3xl mx-auto p-6 min-h-[70vh] animate-in fade-in'>
      <div className='text-center mb-8'>
        <h1 className='text-3xl font-black text-teal-800'>
          Lacak Status Kurban
        </h1>
        <p className='text-slate-500 mt-2'>
          Pantau status pendaftaran kurban Anda secara mandiri.
        </p>
      </div>

      <form
        onSubmit={cariStatus}
        className='relative mb-10'>
        <Search className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6' />
        <input
          type='text'
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder='Masukkan Kode QRB-MNI atau No. WhatsApp...'
          className='w-full pl-14 pr-32 py-4 border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-teal-600 text-lg'
          required
        />
        <button
          type='submit'
          disabled={isLoading}
          className='absolute right-2 top-2 bottom-2 bg-teal-700 text-white px-6 rounded-xl font-bold hover:bg-teal-800 transition'>
          {isLoading ? (
            <Loader2 className='w-6 h-6 animate-spin mx-auto' />
          ) : (
            'Lacak'
          )}
        </button>
      </form>

      <div className='space-y-4'>
        {isLoading && (
          <p className='text-center text-slate-400'>Mencari data...</p>
        )}

        {!isLoading && sudahCari && hasil.length === 0 && (
          <div className='text-center p-10 bg-slate-50 rounded-2xl border border-slate-200'>
            <AlertCircle className='w-10 h-10 text-slate-400 mx-auto mb-3' />
            <p className='text-slate-600 font-medium'>
              Pesanan tidak ditemukan.
            </p>
            <p className='text-sm text-slate-400 mt-1'>
              Pastikan Kode TRX atau No WhatsApp sudah benar.
            </p>
          </div>
        )}

        {hasil.map((pesanan) => {
          const ui = getStatusUI(pesanan.status_pesanan);
          return (
            <div
              key={pesanan.id}
              className={`p-5 rounded-2xl border ${ui.border} bg-white shadow-sm flex flex-col md:flex-row gap-4 justify-between items-start md:items-center`}>
              <div>
                <p className='text-xs font-black text-slate-400 uppercase tracking-widest'>
                  {pesanan.kode_trx}
                </p>
                <h3 className='text-lg font-bold text-slate-800 mt-1'>
                  {pesanan.nama_mudhohi}
                </h3>
                <p className='text-sm font-semibold text-teal-700'>
                  {pesanan.hewan.jenis} - {pesanan.hewan.tipe}
                </p>
                <p className='text-xs text-slate-500 mt-2'>
                  Terdaftar:{' '}
                  {new Date(pesanan.created_at).toLocaleDateString('id-ID', {
                    dateStyle: 'medium',
                  })}
                </p>
              </div>

              <div className='flex flex-col items-end w-full md:w-auto'>
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-full ${ui.bg} ${ui.text} border ${ui.border}`}>
                  {ui.icon}
                  <span className='font-bold text-sm uppercase tracking-wider'>
                    {pesanan.status_pesanan}
                  </span>
                </div>

                {pesanan.status_pesanan === 'Booking' && (
                  <a
                    href={`/kurban/konfirmasi`}
                    className='mt-3 text-xs font-bold text-indigo-600 hover:text-indigo-800 underline'>
                    Upload Bukti Transfer &rarr;
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
