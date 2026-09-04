'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const pathDictionary: Record<string, string> = {
  '/': 'Beranda Utama Masjid Nurul Iman',
  '/kurban': 'Kurban Masjid Nurul Iman',
  '/kurban/status': 'Lacak Status Kurban',
  '/kurban/konfirmasi': 'Konfirmasi Pembayaran Kurban',
  '/ziswaf': 'Ziswaf',
  '/galeri': 'Galeri Kegiatan Masjid Nurul Iman',
  '/tentang': 'Tentang Masjid Nurul Iman',
  '/ramadhan': 'Informasi Ramadhan Masjid Nurul Iman',
};

const excludedPaths = ['/login', '/cms', '/admin'];

export default function PublicPreloader() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const [isEntranceDone, setIsEntranceDone] = useState(false);

  const isExcluded = excludedPaths.some((path) => pathname.startsWith(path));
  const targetName = pathDictionary[pathname] || 'Aplikasi MNI';

  const slotItems = [
    'Menyiapkan Halaman...',
    'Kurban Masjid Nurul Iman',
    'Konfirmasi Pembayaran Kurban',
    'Lacak Status',
    'Beranda Utama Masjid Nurul Iman',
    'Ziswaf',
    'Galeri Masjid Nurul Iman',
    'Tentang Masjid Nurul Iman',
    'Sinkronisasi Data...',
    targetName,
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || isExcluded) return;

    document.body.style.overflow = 'hidden';

    const maskTimer = setTimeout(() => {
      setIsEntranceDone(true);
    }, 800);

    const exitTimer = setTimeout(() => {
      setIsLoading(false);
      document.body.style.overflow = '';
    }, 3200);

    return () => {
      clearTimeout(maskTimer);
      clearTimeout(exitTimer);
      document.body.style.overflow = '';
    };
  }, [mounted, isExcluded]);

  if (!mounted || isExcluded) return null;

  return (
    <>
      {!isEntranceDone && isLoading && (
        <div className='fixed inset-0 z-[9998] bg-slate-50' />
      )}

      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ clipPath: 'circle(0% at 50% 50%)' }}
            animate={{ clipPath: 'circle(150% at 50% 50%)' }}
            exit={{ clipPath: 'circle(0% at 50% 50%)' }}
            transition={{ duration: 0.8, ease: [0.7, 0, 0.3, 1] }}
            className='fixed inset-0 z-[9999] bg-slate-950 flex flex-col items-center justify-center'>
            <div className='absolute top-[-20%] left-[-10%] w-[50rem] h-[50rem] bg-teal-900/30 rounded-full mix-blend-screen filter blur-[100px] animate-pulse' />

            <div className='relative z-10 flex flex-col items-center'>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className='text-teal-400 font-bold tracking-[0.2em] text-[10px] md:text-xs uppercase mb-3'>
                Selamat Datang Di Halaman
              </motion.p>

              <div className='h-[50px] md:h-[70px] overflow-hidden relative w-[300px] md:w-[500px] flex justify-center'>
                <motion.div
                  animate={{ y: `-${(slotItems.length - 1) * 100}%` }}
                  transition={{
                    duration: 2.2,
                    delay: 0.8,
                    ease: [0.15, 0.85, 0.2, 1],
                  }}
                  className='flex flex-col items-center w-full'>
                  {slotItems.map((item, index) => (
                    <div
                      key={index}
                      className='h-[50px] md:h-[70px] w-full flex items-center justify-center text-white text-xl md:text-3xl font-bold text-center tracking-tight shrink-0'>
                      {item}
                    </div>
                  ))}
                </motion.div>
              </div>

              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100px' }}
                transition={{ delay: 1, duration: 1 }}
                className='h-0.5 bg-teal-600 mt-6'
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
