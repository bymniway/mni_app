'use client';

import React from 'react';
import Link from 'next/link';
import { Search, CreditCard } from 'lucide-react';

export default function FloatingAction() {
  return (
    <div className='fixed bottom-6 right-6 z-[70] flex flex-col items-end gap-6'>
      {/* Tombol Konfirmasi Pembayaran */}
      <Link
        href='/kurban/konfirmasi'
        className='group flex flex-col items-center gap-2 transition-all'>
        <div className='w-14 h-14 flex items-center justify-center rounded-full bg-teal-700 text-white border border-teal-700 shadow-md group-hover:bg-teal-50/50 group-hover:text-teal-700 group-hover:border-teal-200 group-hover:backdrop-blur-sm group-hover:-translate-y-2 transition-all duration-500 ease-out'>
          <CreditCard className='w-6 h-6 stroke-[1.5]' />
        </div>
        <span className='text-[10px] font-bold text-teal-800 uppercase tracking-widest opacity-80 group-hover:opacity-100 transition-opacity duration-500'>
          Konfirmasi
        </span>
      </Link>

      {/* Tombol Lacak Status */}
      <Link
        href='/kurban/status'
        className='group flex flex-col items-center gap-2 transition-all'>
        <div className='w-14 h-14 flex items-center justify-center rounded-full bg-teal-700 text-white border border-teal-700 shadow-md group-hover:bg-teal-50/50 group-hover:text-teal-700 group-hover:border-teal-200 group-hover:backdrop-blur-sm group-hover:-translate-y-2 transition-all duration-500 ease-out'>
          <Search className='w-6 h-6 stroke-[1.5]' />
        </div>
        <span className='text-[10px] font-bold text-teal-800 uppercase tracking-widest opacity-80 group-hover:opacity-100 transition-opacity duration-500'>
          Lacak Status
        </span>
      </Link>
    </div>
  );
}
