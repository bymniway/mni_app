'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, Weight } from 'lucide-react';

// Mendefinisikan tipe data untuk props (karena kita pakai TypeScript)
type HewanProps = {
  hewan: {
    id: string;
    jenis: string; // "Sapi" atau "Kambing"
    tipe: string; // "Tipe A", "Tipe B", dll
    berat: string; // "25 - 30 kg"
    harga: number;
    gambar: string;
    status: 'Tersedia' | 'Terjual';
  };
};

export default function HewanCard({ hewan }: HewanProps) {
  // Fungsi format Rupiah
  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(angka);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -5 }}
      className='bg-mni-surface rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 flex flex-col'>
      {/* Area Gambar (Pakai tag img standar dulu sebagai placeholder) */}
      <div className='relative h-56 bg-gray-200 overflow-hidden'>
        <img
          src={hewan.gambar}
          alt={`${hewan.jenis} ${hewan.tipe}`}
          className='w-full h-full object-cover'
        />
        {/* Badge Status */}
        <div
          className={`absolute top-4 right-4 px-3 py-1 text-xs font-bold rounded-full ${
            hewan.status === 'Tersedia'
              ? 'bg-mni-primary text-white'
              : 'bg-red-500 text-white'
          }`}>
          {hewan.status}
        </div>
      </div>

      {/* Area Detail Data */}
      <div className='p-5 flex-grow flex flex-col justify-between'>
        <div>
          <div className='flex justify-between items-start mb-2'>
            <h3 className='text-xl font-bold text-mni-text'>
              {hewan.jenis} - {hewan.tipe}
            </h3>
          </div>

          <div className='space-y-2 mt-4 text-sm text-mni-muted'>
            <div className='flex items-center space-x-2'>
              <Weight className='w-4 h-4' />
              <span>
                Estimasi Berat: <strong>{hewan.berat}</strong>
              </span>
            </div>
            <div className='flex items-center space-x-2 text-mni-primary'>
              <CheckCircle2 className='w-4 h-4' />
              <span>Sehat & Sesuai Syariat</span>
            </div>
          </div>
        </div>

        {/* Harga & Tombol */}
        <div className='mt-6 pt-4 border-t border-gray-100'>
          <p className='text-sm text-mni-muted mb-1'>Harga Kurban</p>
          <p className='text-2xl font-bold text-mni-accent mb-4'>
            {formatRupiah(hewan.harga)}
          </p>

          {hewan.status === 'Tersedia' ? (
            // Link akan mengarahkan ke halaman checkout dan menempelkan ID hewan di URL
            <Link
              href={`/checkout?hewanId=${hewan.id}`}
              className='block w-full'>
              <button className='w-full py-3 rounded-xl font-semibold transition-colors duration-300 bg-mni-primary text-white hover:bg-mni-primaryHover shadow-md'>
                Kurban Sekarang
              </button>
            </Link>
          ) : (
            <button
              disabled
              className='w-full py-3 rounded-xl font-semibold transition-colors duration-300 bg-gray-200 text-gray-400 cursor-not-allowed'>
              Alhamdulillah Terjual
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
