'use client';

import React from 'react';

export default function SkeletonLoading() {
  return (
    <div className='mt-20 min-h-screen bg-white pt-10 pb-12 px-4'>
      <div className='max-w-6xl mx-auto space-y-10'>
        {/* 1. BAGIAN BANNER GEDE (Judul & Deskripsi) */}
        <div className='w-full h-56 md:h-72 bg-slate-100 rounded-[2rem] animate-pulse flex flex-col items-center justify-center p-8 space-y-5 border border-slate-200/50 shadow-sm'>
          <div className='w-1/2 md:w-1/3 h-8 bg-slate-200/70 rounded-full'></div>
          <div className='w-3/4 md:w-1/2 h-4 bg-slate-200/70 rounded-full'></div>
          <div className='w-2/3 md:w-2/5 h-4 bg-slate-200/70 rounded-full'></div>
        </div>

        {/* 2. BAGIAN BOX KECIL HORIZONTAL */}
        <div className='flex gap-3 md:gap-4 overflow-hidden justify-center md:justify-start'>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className='w-28 md:w-40 h-12 md:h-14 bg-slate-100 border border-slate-200/50 rounded-xl animate-pulse shrink-0 shadow-sm'></div>
          ))}
        </div>

        {/* 3. BAGIAN GRID KONTEN BAWAH */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8'>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className='h-80 bg-white border border-slate-100 rounded-[2rem] p-5 shadow-sm flex flex-col'>
              {/* Gambar/Cover Placeholder */}
              <div className='w-full h-36 bg-slate-100 rounded-xl animate-pulse mb-5'></div>
              {/* Judul Placeholder */}
              <div className='w-3/4 h-5 bg-slate-100 rounded-full animate-pulse mb-3'></div>
              {/* Deskripsi/Harga Placeholder */}
              <div className='w-1/2 h-4 bg-slate-100 rounded-full animate-pulse mb-auto'></div>
              {/* Tombol Bawah Placeholder */}
              <div className='w-full h-12 bg-slate-100 rounded-xl animate-pulse mt-4'></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
