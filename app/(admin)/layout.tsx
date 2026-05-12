'use client';

import { ReactNode, useState } from 'react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { Menu, ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: ReactNode }) {
  // State untuk mengontrol Sidebar (True = Lebar Penuh 280px, False = Mode Ikon 80px)
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const pathname = usePathname();

  // LOGIKA PENYEKATAN: Halaman Polos tanpa Layout
  if (pathname === '/cms/login' || pathname === '/cms/unauthorized') {
    return <main className='min-h-screen bg-zinc-50'>{children}</main>;
  }

  // AUTOMATISASI BREADCRUMB: Mengubah '/cms/kurban/katalog' menjadi ['Kurban', 'Katalog']
  const pathNames = pathname?.split('/').filter((p) => p && p !== 'cms') || [];

  return (
    <div className='min-h-screen bg-zinc-50 flex font-sans overflow-hidden selection:bg-zinc-900 selection:text-white'>
      {/* PEMBUNGKUS SIDEBAR (DESKTOP)
        Menggunakan transisi lebar (width) dari 280px ke 80px (Rail Mode)
      */}
      <div
        className={`hidden md:block transition-all duration-500 ease-out shrink-0 bg-white border-r border-zinc-200 z-60 
        ${isSidebarExpanded ? 'w-[280px]' : 'w-[80px]'}`}>
        <AdminSidebar isCollapsed={!isSidebarExpanded} />
      </div>

      {/* PEMBUNGKUS SIDEBAR (MOBILE)
        Hanya dipanggil untuk merender overlay mobile, tidak mempengaruhi lebar desktop
      */}
      <div className='md:hidden'>
        <AdminSidebar isCollapsed={false} />
      </div>

      {/* KONTEN UTAMA KANAN */}
      <main className='flex-1 flex flex-col h-screen overflow-hidden relative'>
        {/* HEADER GLASSMORPHISM */}
        <header className='h-20 bg-white/70 backdrop-blur-xl border-b border-zinc-200/50 flex items-center justify-between px-6 sm:px-10 shrink-0 sticky top-0 z-10'>
          <div className='flex items-center space-x-4'>
            {/* Tombol Hamburger Desktop */}
            <button
              onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
              className='hidden md:flex p-2.5 -ml-3 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-all focus:outline-none active:scale-95'>
              <Menu className='w-5 h-5' />
            </button>

            {/* Dynamic Breadcrumbs (Otomatis membaca URL) */}
            <div className='hidden sm:flex items-center space-x-2'>
              <span className='text-sm font-bold text-teal-700'>CMS</span>
              {pathNames.map((path, index) => (
                <div
                  key={path}
                  className='flex items-center space-x-2'>
                  <ChevronRight className='w-4 h-4 text-zinc-300' />
                  <span
                    className={`text-sm capitalize font-semibold tracking-wide ${index === pathNames.length - 1 ? 'text-teal-900' : 'text-zinc-400'}`}>
                    {path.replace('-', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Profil Admin Modern */}
          <div className='flex items-center space-x-4'>
            <div className='text-right hidden sm:block'>
              <p className='text-xs font-bold text-teal-900 leading-tight'>
                Admin MNI
              </p>
              <p className='text-[10px] font-semibold text-zink-400 uppercase tracking-widest'>
                Super User
              </p>
            </div>
            <div className='w-10 h-10 bg-teal-900 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-teal-900/20 ring-4 ring-zinc-50 border border-teal-700/50 transform hover:rotate-12 transition-transform cursor-pointer'>
              MNI
            </div>
          </div>
        </header>

        {/* AREA SCROLL KONTEN DENGAN ANIMASI TRANSISI HALAMAN */}
        <div className='flex-1 overflow-auto bg-zinc-50/50'>
          {/* Key=pathname membuat animasi re-trigger setiap ganti URL */}
          <div
            key={pathname}
            className='p-6 sm:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out max-w-7xl mx-auto'>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
