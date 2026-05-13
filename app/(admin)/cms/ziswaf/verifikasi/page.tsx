'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Loader2,
  Clock,
  AlertCircle,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  Calculator,
  Wallet,
  Receipt,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ZiswafVerifikasiPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('Semua');
  const [search, setSearch] = useState('');

  const [selectedTrx, setSelectedTrx] = useState<any | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [alasanTolak, setAlasanTolak] = useState('');

  const syncToGoogleSheetZiswaf = async (trx: any) => {
    try {
      await fetch('/api/sync-sheet-ziswaf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tanggal: new Date().toLocaleString('id-ID', {
            dateStyle: 'medium',
            timeStyle: 'short',
          }),
          kode_trx: trx.kode_trx,
          nama: trx.is_anonim ? 'Hamba Allah' : trx.nama,
          kategori: trx.kategori,
          nominal: Number(trx.nominal),
          status: 'Diterima',
          pesan: trx.pesan || '-',
        }),
      });
    } catch (err) {
      console.error('Gagal sinkronisasi ZISWAF ke Sheets:', err);
    }
  };

  const fetchTransactions = async (preserveSelectedId?: number) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('transaksi_ziswaf')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        setTransactions(data);
        if (preserveSelectedId) {
          const updatedSelected = data.find((t) => t.id === preserveSelectedId);
          if (updatedSelected) setSelectedTrx(updatedSelected);
        }
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const formatRp = (angka: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(angka);

  const formatStatusDisplay = (status: string) => {
    if (!status) return '';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  const filteredData = transactions.filter((trx) => {
    const statusDisplay = formatStatusDisplay(trx.status_pesanan);
    const matchFilter = filter === 'Semua' || statusDisplay === filter;
    const matchSearch =
      trx.nama.toLowerCase().includes(search.toLowerCase()) ||
      trx.kode_trx.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts = {
    Semua: transactions.length,
    Menunggu: transactions.filter(
      (t) => formatStatusDisplay(t.status_pesanan) === 'Menunggu',
    ).length,
    Diterima: transactions.filter(
      (t) => formatStatusDisplay(t.status_pesanan) === 'Diterima',
    ).length,
    Ditolak: transactions.filter(
      (t) => formatStatusDisplay(t.status_pesanan) === 'Ditolak',
    ).length,
  };

  const handleAction = async (action: 'terima' | 'tolak') => {
    if (action === 'tolak' && !alasanTolak) {
      return alert('Mohon isi alasan penolakan pada kolom yang tersedia.');
    }

    setIsProcessing(true);
    try {
      const response = await fetch('/api/admin/ziswaf-verifikasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedTrx.id,
          action: action,
          alasanTolak: alasanTolak,
        }),
      });

      if (response.ok) {
        if (action === 'terima') {
          await syncToGoogleSheetZiswaf(selectedTrx);
        }
        setAlasanTolak('');
        fetchTransactions(selectedTrx.id);
      } else {
        const res = await response.json();
        alert(`Gagal: ${res.error}`);
      }
    } catch (error) {
      alert('Terjadi kesalahan koneksi jaringan.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className='p-4 md:p-6 w-full max-w-[1600px] mx-auto animate-in fade-in h-[calc(100vh-4rem)] flex flex-col'>
      <div className='mb-5 shrink-0'>
        <h1 className='text-2xl md:text-xl font-semibold text-slate-700 tracking-tight'>
          Verifikasi ZISWAF
        </h1>
        <p className='text-sm text-slate-500 mt-1 font-medium'>
          Cek bukti transfer dan sahkan penyaluran dana dari jamaah.
        </p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0'>
        <div className='lg:col-span-5 bg-white border border-slate-200 rounded-[1.5rem] shadow-sm flex flex-col h-[500px] lg:h-full overflow-hidden relative group/left'>
          <div className='p-4 border-b border-slate-100 bg-slate-50/80 space-y-3 shrink-0 relative z-10'>
            <div className='relative w-full'>
              <Search className='w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400' />
              <input
                type='text'
                placeholder='Cari Kode / Nama...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className='w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-sm font-medium transition-all shadow-sm'
              />
            </div>

            <div className='flex gap-2 overflow-x-auto hide-scrollbar pb-1'>
              {['Semua', 'Menunggu', 'Diterima', 'Ditolak'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-lg text-[11px] md:text-xs font-bold transition-all whitespace-nowrap border 
                    ${
                      filter === f
                        ? 'bg-teal-600 text-white border-teal-700 shadow-sm'
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-teal-700 hover:border-teal-200'
                    }`}>
                  {f}{' '}
                  <sup className='ml-0.5 font-black opacity-80'>
                    {counts[f as keyof typeof counts]}
                  </sup>
                </button>
              ))}
            </div>
          </div>

          <div className='flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50/50 relative z-10'>
            {isLoading ? (
              <div className='py-12 flex justify-center'>
                <Loader2 className='w-6 h-6 text-teal-600 animate-spin' />
              </div>
            ) : filteredData.length === 0 ? (
              <div className='py-12 text-center text-slate-400 text-sm font-medium'>
                Tidak ada transaksi ditemukan.
              </div>
            ) : (
              filteredData.map((trx) => {
                const isSelected = selectedTrx?.id === trx.id;
                const statusDisp = formatStatusDisplay(trx.status_pesanan);

                return (
                  <div
                    key={trx.id}
                    onClick={() => setSelectedTrx(trx)}
                    className={`p-4 rounded-xl cursor-pointer transition-all border 
                      ${isSelected ? 'bg-teal-50 border-teal-300 shadow-sm ring-1 ring-teal-300/50' : 'bg-white border-slate-200 hover:border-teal-300 hover:shadow-sm'}`}>
                    <div className='flex justify-between items-start mb-2'>
                      <div className='pr-2'>
                        <p className='font-bold text-slate-800 text-sm leading-tight line-clamp-1'>
                          {trx.nama}
                        </p>
                        <p className='text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5'>
                          {trx.kode_trx}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wide border
                        ${
                          statusDisp === 'Diterima'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : statusDisp === 'Ditolak'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                        {statusDisp === 'Menunggu' && (
                          <Clock className='w-3 h-3 mr-1' />
                        )}
                        {statusDisp}
                      </span>
                    </div>
                    <div className='flex justify-between items-end mt-2'>
                      <p className='text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-md line-clamp-1 max-w-[50%]'>
                        {trx.kategori}
                      </p>
                      <p className='text-sm font-black text-teal-700'>
                        {formatRp(trx.nominal)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className='lg:col-span-7 bg-white border border-slate-200 rounded-[1.5rem] shadow-sm h-[600px] lg:h-full flex flex-col overflow-hidden relative'>
          {!selectedTrx ? (
            <div className='flex flex-col items-center justify-center h-full text-slate-400 space-y-4'>
              <div className='w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100'>
                <ImageIcon className='w-6 h-6 text-slate-300' />
              </div>
              <p className='font-medium text-sm text-center px-6'>
                Pilih transaksi dari antrean untuk memverifikasi.
              </p>
            </div>
          ) : (
            <>
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
                <div className='text-right'>
                  <p className='text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1'>
                    Status
                  </p>
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
                </div>
              </div>

              <div className='flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50/30'>
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

                <div className='bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group'>
                  <Wallet className='absolute -left-6 -bottom-6 w-32 h-32 text-slate-50 group-hover:scale-110 transition-transform duration-700 pointer-events-none' />

                  <div className='relative z-10 space-y-4'>
                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <p className='text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1'>
                          Nama Donatur
                        </p>
                        <p className='font-bold text-slate-800 text-sm'>
                          {selectedTrx.nama}
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
                      <p className='font-bold text-teal-700 text-sm'>
                        {selectedTrx.kategori}
                      </p>
                    </div>

                    <div className='pt-4 border-t border-slate-100 flex justify-between items-center'>
                      <p className='text-xs font-bold text-slate-500 uppercase tracking-wider'>
                        Nominal Bayar
                      </p>
                      <p className='text-2xl font-black text-teal-700'>
                        {formatRp(selectedTrx.nominal)}
                      </p>
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
                  <div className='bg-amber-50 border border-amber-100 rounded-2xl p-5 shadow-sm'>
                    <p className='text-[10px] font-bold text-amber-600/70 uppercase tracking-wider mb-2'>
                      Titipan Doa / Pesan
                    </p>
                    <p className='text-sm font-semibold text-amber-900 italic'>
                      "{selectedTrx.pesan}"
                    </p>
                  </div>
                )}

                {formatStatusDisplay(selectedTrx.status_pesanan) ===
                  'Menunggu' && (
                  <div className='bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4'>
                    <p className='text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center'>
                      Eksekusi Verifikasi
                    </p>

                    <button
                      onClick={() => handleAction('terima')}
                      disabled={isProcessing}
                      className='w-full bg-teal-700 hover:bg-teal-800 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2.5 transition-all shadow-md shadow-teal-900/10 disabled:opacity-50 text-sm'>
                      {isProcessing ? (
                        <Loader2 className='w-5 h-5 animate-spin' />
                      ) : (
                        <>
                          <CheckCircle className='w-5 h-5' /> Sahkan Transaksi &
                          Kirim Kwitansi
                        </>
                      )}
                    </button>

                    <div className='relative flex items-center py-2'>
                      <div className='flex-grow border-t border-slate-100'></div>
                      <span className='flex-shrink-0 mx-4 text-slate-300 text-[10px] font-bold uppercase'>
                        Atau
                      </span>
                      <div className='flex-grow border-t border-slate-100'></div>
                    </div>

                    <div className='bg-red-50 p-4 rounded-xl border border-red-100 space-y-3'>
                      <p className='text-[10px] font-bold text-red-800 uppercase flex items-center'>
                        <AlertCircle className='w-3 h-3 mr-1.5' /> Opsi
                        Penolakan
                      </p>
                      <input
                        type='text'
                        placeholder='Ketik alasan (misal: Bukti buram/nominal tidak pas)'
                        value={alasanTolak}
                        onChange={(e) => setAlasanTolak(e.target.value)}
                        className='w-full bg-white border border-red-200 rounded-lg px-4 py-2.5 text-sm font-medium outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/20 transition-all placeholder:text-slate-400'
                      />
                      <button
                        onClick={() => handleAction('tolak')}
                        disabled={isProcessing}
                        className='w-full bg-white text-red-600 border border-red-200 hover:bg-red-600 hover:text-white hover:border-red-600 py-2.5 rounded-lg font-bold text-sm flex justify-center items-center gap-2 transition-all disabled:opacity-50'>
                        <XCircle className='w-4 h-4' /> Tolak Transaksi
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
