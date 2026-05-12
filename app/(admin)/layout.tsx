// // 'use client'; // Wajib ditambahkan agar bisa pakai useState

// // import { ReactNode, useState } from 'react';
// // import AdminSidebar from '@/components/layout/AdminSidebar';
// // import { Menu } from 'lucide-react';

// // export default function AdminLayout({ children }: { children: ReactNode }) {
// //   // State untuk mengontrol Sidebar. True = Muncul, False = Sembunyi
// //   const [isSidebarOpen, setIsSidebarOpen] = useState(true);

// //   return (
// //     <div className='min-h-screen bg-gray-50 flex font-sans overflow-hidden'>
// //       {/*
// //         Pembungkus Sidebar dengan Animasi Transisi
// //         Jika isSidebarOpen false, kita geser sidebar ke kiri (-ml-64) agar hilang dengan mulus
// //       */}
// //       <div
// //         className={`transition-all duration-300 ease-in-out shrink-0 ${isSidebarOpen ? 'ml-0' : '-ml-64'}`}>
// //         <AdminSidebar />
// //       </div>

// //       {/* Konten Utama Kanan */}
// //       <main className='flex-1 flex flex-col h-screen overflow-hidden'>
// //         {/* Header Mobile/Top Bar */}
// //         <header className='h-16 bg-mni-surface border-b border-gray-200 flex items-center justify-between px-6 shrink-0'>
// //           <div className='flex items-center space-x-4'>
// //             {/* Tombol Hamburger untuk Toggle Sidebar */}
// //             <button
// //               onClick={() => setIsSidebarOpen(!isSidebarOpen)}
// //               className='p-2 -ml-2 text-mni-muted hover:bg-gray-100 rounded-xl transition-colors focus:outline-none'>
// //               <Menu className='w-6 h-6' />
// //             </button>
// //             <h2 className='text-lg font-bold text-mni-text hidden sm:block'>
// //               Dashboard Control
// //             </h2>
// //           </div>

// //           {/* Profil Admin */}
// //           <div className='flex items-center space-x-3'>
// //             <div className='w-8 h-8 bg-mni-primary rounded-full flex items-center justify-center text-white font-bold text-sm'>
// //               A
// //             </div>
// //           </div>
// //         </header>

// //         {/* Area Scroll Konten */}
// //         <div className='flex-1 overflow-auto p-6'>{children}</div>
// //       </main>
// //     </div>
// //   );
// // }
// //
// //
// //
// 'use client'; // Wajib ditambahkan agar bisa pakai useState

// import { ReactNode, useState } from 'react';
// import AdminSidebar from '@/components/layout/AdminSidebar';
// import { Menu } from 'lucide-react';
// import { usePathname } from 'next/navigation'; // 1. Import usePathname

// export default function AdminLayout({ children }: { children: ReactNode }) {
//   // State untuk mengontrol Sidebar. True = Muncul, False = Sembunyi
//   const [isSidebarOpen, setIsSidebarOpen] = useState(true);

//   // 2. Ambil URL saat ini
//   const pathname = usePathname();

//   // 3. LOGIKA PENYEKATAN: Jika di halaman login/unauthorized, jangan render Sidebar!
//   if (pathname === '/cms/login' || pathname === '/cms/unauthorized') {
//     return <main className='min-h-screen bg-gray-50'>{children}</main>;
//   }

//   // 4. Jika bukan halaman login (berarti halaman dalam CMS), render full layout
//   return (
//     <div className='min-h-screen bg-gray-50 flex font-sans overflow-hidden'>
//       {/* Pembungkus Sidebar dengan Animasi Transisi
//         Jika isSidebarOpen false, kita geser sidebar ke kiri (-ml-64) agar hilang dengan mulus
//       */}
//       <div
//         className={`transition-all duration-300 ease-in-out shrink-0 ${isSidebarOpen ? 'ml-0' : '-ml-64'}`}>
//         <AdminSidebar />
//       </div>

//       {/* Konten Utama Kanan */}
//       <main className='flex-1 flex flex-col h-screen overflow-hidden'>
//         {/* Header Mobile/Top Bar */}
//         <header className='h-16 bg-mni-surface border-b border-gray-200 flex items-center justify-between px-6 shrink-0'>
//           <div className='flex items-center space-x-4'>
//             {/* Tombol Hamburger untuk Toggle Sidebar */}
//             <button
//               onClick={() => setIsSidebarOpen(!isSidebarOpen)}
//               className='p-2 -ml-2 text-mni-muted hover:bg-gray-100 rounded-xl transition-colors focus:outline-none'>
//               <Menu className='w-6 h-6' />
//             </button>
//             <h2 className='text-lg font-bold text-mni-text hidden sm:block'>
//               Dashboard Control
//             </h2>
//           </div>

//           {/* Profil Admin */}
//           <div className='flex items-center space-x-3'>
//             <div className='w-8 h-8 bg-mni-primary rounded-full flex items-center justify-center text-white font-bold text-sm'>
//               RA
//             </div>
//           </div>
//         </header>

//         {/* Area Scroll Konten */}
//         <div className='flex-1 overflow-auto p-6'>{children}</div>
//       </main>
//     </div>
//   );
// }
//
//
//
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
