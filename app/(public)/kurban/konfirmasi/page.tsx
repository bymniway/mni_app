'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Search,
  UploadCloud,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

export default function KonfirmasiPage() {
  const [kodeTrx, setKodeTrx] = useState('');
  const [pesanan, setPesanan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const cariPesanan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setPesanan(null);
    setFile(null);

    try {
      const { data, error } = await supabase
        .from('pesanan')
        .select('*, hewan(jenis, tipe)')
        .eq('kode_trx', kodeTrx.trim().toUpperCase())
        .single();

      if (error || !data) throw new Error('Pesanan tidak ditemukan.');
      setPesanan(data);
    } catch (error: any) {
      alert(error.message || 'Terjadi kesalahan saat mencari.');
    } finally {
      setIsLoading(false);
    }
  };

  // FUNGSI UPLOAD YANG BARU: Mengirim ke Backend API
  const handleUpload = async () => {
    if (!file || !pesanan)
      return alert('Silakan pilih foto bukti transfer terlebih dahulu!');
    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('pesananId', pesanan.id);

    try {
      const response = await fetch('/api/konfirmasi', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        alert(
          'Alhamdulillah! Bukti transfer berhasil diunggah. Menunggu verifikasi admin.',
        );
        setPesanan({
          ...pesanan,
          status_pesanan: 'Menunggu',
          bukti_transfer_url: result.url,
        });
      } else {
        alert(`Gagal: ${result.error}`);
      }
    } catch (error) {
      console.error(error);
      alert('Gagal menghubungi server untuk mengunggah bukti transfer.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className='max-w-2xl mx-auto p-6 min-h-[70vh] animate-in fade-in'>
      <div className='text-center mb-8'>
        <h1 className='text-3xl font-black text-teal-800'>
          Konfirmasi Pembayaran
        </h1>
        <p className='text-slate-500 mt-2'>
          Unggah bukti transfer untuk pendaftaran yang berstatus Booking.
        </p>
      </div>

      <form
        onSubmit={cariPesanan}
        className='flex gap-2 mb-8'>
        <input
          type='text'
          value={kodeTrx}
          onChange={(e) => setKodeTrx(e.target.value)}
          placeholder='Masukkan Kode Transaksi QRB-MNI (Contoh: QRB-MNI-123456)'
          className='flex-1 p-4 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-600 uppercase'
          required
        />
        <button
          type='submit'
          disabled={isLoading}
          className='bg-teal-700 text-white px-6 rounded-xl font-bold hover:bg-teal-800 transition'>
          {isLoading ? (
            <Loader2 className='w-6 h-6 animate-spin' />
          ) : (
            <Search className='w-6 h-6' />
          )}
        </button>
      </form>

      {pesanan && (
        <div className='bg-white p-6 rounded-2xl shadow-sm border border-slate-200'>
          <div className='flex justify-between items-start mb-6 border-b border-slate-100 pb-4'>
            <div>
              <p className='text-xs font-bold text-slate-400 uppercase tracking-wider'>
                Shohibul Kurban
              </p>
              <p className='text-lg font-bold text-slate-800'>
                {pesanan.nama_mudhohi}
              </p>
              <p className='text-sm text-teal-700 font-semibold'>
                {pesanan.hewan.jenis} - {pesanan.hewan.tipe}
              </p>
            </div>
            <div className='text-right'>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  pesanan.status_pesanan === 'Booking'
                    ? 'bg-indigo-100 text-indigo-700'
                    : pesanan.status_pesanan === 'Menunggu'
                      ? 'bg-amber-100 text-amber-700'
                      : pesanan.status_pesanan === 'Lunas'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-700'
                }`}>
                {pesanan.status_pesanan}
              </span>
              <p className='text-xl font-black text-slate-800 mt-2'>
                Rp {pesanan.total_bayar.toLocaleString('id-ID')}
              </p>
            </div>
          </div>

          {pesanan.status_pesanan === 'Booking' ||
          pesanan.status_pesanan === 'Ditolak' ? (
            <div className='space-y-4'>
              <div className='bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-800 text-sm flex gap-3'>
                <AlertCircle className='w-5 h-5 shrink-0' />
                <p>
                  Silakan unggah bukti transfer Anda untuk memproses pesanan ini
                  menjadi Lunas.
                </p>
              </div>

              <div className='border-2 border-dashed border-slate-300 bg-slate-50 rounded-xl p-6 text-center relative hover:bg-slate-100 transition'>
                <UploadCloud className='w-8 h-8 text-teal-600 mx-auto mb-2' />
                <p className='text-sm font-semibold text-slate-600'>
                  {file ? file.name : 'Pilih Foto Bukti Transfer'}
                </p>
                <input
                  type='file'
                  accept='image/*'
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
                />
              </div>

              <button
                onClick={handleUpload}
                disabled={isUploading || !file}
                className='w-full bg-teal-700 text-white py-3 rounded-xl font-bold hover:bg-teal-800 disabled:opacity-50 flex justify-center items-center gap-2'>
                {isUploading ? (
                  <Loader2 className='w-5 h-5 animate-spin' />
                ) : (
                  <UploadCloud className='w-5 h-5' />
                )}
                Unggah & Konfirmasi
              </button>
            </div>
          ) : (
            <div className='bg-emerald-50 border border-emerald-200 p-6 rounded-xl text-center'>
              <CheckCircle className='w-12 h-12 text-emerald-500 mx-auto mb-2' />
              <p className='font-bold text-emerald-800 text-lg'>
                Konfirmasi Berhasil
              </p>
              <p className='text-sm text-emerald-700 mt-1'>
                Bukti transfer Anda telah masuk. Pesanan saat ini berstatus{' '}
                <strong>{pesanan.status_pesanan}</strong>.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
