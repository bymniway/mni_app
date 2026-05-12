'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import { usePathname } from 'next/navigation';
import {
  ChevronDown,
  Home,
  Box,
  HeartHandshake,
  Image as ImageIcon,
  LogOut,
  FileText,
  BookOpen,
  LibraryBig,
  Sparkles,
  SlidersHorizontal,
  Menu,
  X,
  Mail,
  Lock, // Tambahkan impor Lock
} from 'lucide-react';

// MENERIMA PROP isCollapsed DARI LAYOUT
export default function AdminSidebar({
  isCollapsed = false,
}: {
  isCollapsed?: boolean;
}) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // State untuk menyimpan profil admin yang sedang login
  const [profile, setProfile] = useState<{
    is_root: boolean;
    akses_halaman: string[];
  } | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('admin_profiles')
          .select('is_root, akses_halaman')
          .eq('id', user.id)
          .single();
        setProfile(data);
      }
    };
    fetchProfile();
    setIsMobileOpen(false);
  }, [pathname, supabase]);

  // Fungsi pengecekan akses (Gembok Dua Arah)
  const isLocked = (path: string) => {
    if (!profile) return true; // Default terkunci sebelum data dimuat
    if (profile.is_root) return false; // Root tidak pernah terkunci

    // LOGIKA DUA ARAH:
    // 1. path.startsWith(p) -> Membuka URL spesifik sesuai KTP (KTP: /cms/ziswaf/riwayat -> Buka: /cms/ziswaf/riwayat)
    // 2. p.startsWith(path) -> Membuka FOLDER INDUK. (KTP: /cms/ziswaf/riwayat -> Buka Folder: /cms/ziswaf)
    return !profile.akses_halaman.some(
      (p) => path.startsWith(p) || p.startsWith(path),
    );
  };
  // State untuk Dropdown Menu Utama
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    beranda: false,
    kurban: false,
    ziswaf: false,
    tentang: false,
  });

  // AUTOMATISASI 1: Tutup sidebar HP otomatis saat pindah halaman
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  //  AUTOMATISASI 2: Buka otomatis accordion parent yang sedang aktif
  useEffect(() => {
    if (pathname?.includes('/cms/kurban'))
      setOpenMenus((p) => ({ ...p, kurban: true }));
    if (pathname?.includes('/cms/ziswaf'))
      setOpenMenus((p) => ({ ...p, ziswaf: true }));
    if (pathname?.includes('/cms/tentang'))
      setOpenMenus((p) => ({ ...p, tentang: true }));
    if (pathname?.includes('/cms/beranda'))
      setOpenMenus((p) => ({ ...p, beranda: true }));
  }, [pathname]);

  const toggleMenu = (menu: string) => {
    // Jika sedang dalam mode ikon (collapsed), jangan buka accordion
    if (isCollapsed) return;
    setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  const isActive = (path: string) => pathname === path;
  const isGroupActive = (keyword: string) => pathname?.includes(keyword);

  // ==========================================
  // STYLING DINAMIS BUKAN MAIN 🔥
  // ==========================================
  const menuLuarStyle = (active: boolean, locked: boolean) =>
    ` shadow-lg group relative flex items-center w-full py-3 rounded-2xl font-semibold transition-all duration-300 overflow-hidden ${
      active
        ? 'text-white bg-teal-600 hover:bg-teal-700 shadow-teal-600/20'
        : locked
          ? 'text-zinc-300 cursor-not-allowed opacity-60' // Gaya Teaser: Agak transparan
          : 'text-zinc-500 hover:bg-zinc-100 hover:text-teal-600'
    } ${isCollapsed ? 'justify-center px-0 aspect-square' : 'justify-between px-3.5'}`;

  const subMenuStyle = (href: string, locked: boolean) =>
    `relative flex items-center pl-10 pr-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 w-full ${
      isActive(href)
        ? 'text-teal-600 bg-zinc-100/80 translate-x-1'
        : locked
          ? 'text-zinc-300 cursor-not-allowed' // Submenu yang terkunci
          : 'text-zinc-400 hover:text-zinc-800 hover:bg-zinc-50 hover:translate-x-1'
    }`;

  const handleLogout = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    await supabase.auth.signOut();
    window.location.href = '/cms/login';
  };

  return (
    <>
      {/* HAMBURGER MOBILE */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className='md:hidden fixed top-5 left-5 z-40 p-2.5 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-zinc-200 text-zinc-900'>
        <Menu className='w-5 h-5' />
      </button>

      {/* OVERLAY MOBILE GLASSMORPHISM */}
      {isMobileOpen && (
        <div
          className='md:hidden fixed inset-0 bg-zinc-900/40 z-[80] backdrop-blur-sm transition-opacity'
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* SIDEBAR CONTAINER */}
      <aside
        className={`fixed inset-y-0 left-0 z-[90] bg-white flex flex-col transform transition-transform duration-500 ease-out w-[280px]
        ${isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'} 
        md:translate-x-0 md:static md:h-screen md:w-full`}>
        {/* HEADER SIDEBAR */}
        <div className='h-20 flex items-center justify-between px-6 border-b border-zinc-100 shrink-0'>
          <div className='flex items-center space-x-3 overflow-hidden'>
            <div className='w-8 h-8 rounded-xl bg-teal-600 shadow-teal-600/20 shadow-lg flex items-center justify-center shrink-0 shadow-md'>
              <Sparkles className='w-4 h-4 text-white' />
            </div>
            {/* Hilangkan teks jika disusutkan */}
            <span
              className={`text-lg font-black text-teal-600 tracking-tight transition-all duration-300 whitespace-nowrap ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>
              MNI App
            </span>
          </div>
          <button
            onClick={() => setIsMobileOpen(false)}
            className='md:hidden p-1.5 text-zinc-400 hover:text-red-500 bg-zinc-50 hover:bg-red-50 rounded-full transition-colors'>
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* AREA NAVIGASI SCROLL */}
        <nav className='flex-1 py-6 px-4 space-y-1.5 overflow-y-auto no-scrollbar overflow-x-hidden'>
          {/* FUNGSI RENDER MENU FOLDER (Dropdown) */}
          {(
            [
              {
                id: 'beranda',
                label: 'Beranda',
                icon: Home,
                keyword: '/cms/beranda',
                children: [
                  { path: '/cms/beranda', label: 'Live Visual Editor' },
                ],
              },
              {
                id: 'kurban',
                label: 'Kurban',
                icon: Box,
                keyword: '/cms/kurban',
                children: [
                  { path: '/cms/kurban/verifikasi', label: 'Verifikasi' },
                  { path: '/cms/kurban/riwayat', label: 'Semua Pesanan' },
                  { path: '/cms/kurban/katalog', label: 'Katalog Hewan' },
                  { path: '/cms/kurban/panitia', label: 'Panitia' },
                ],
              },
              {
                id: 'ziswaf',
                label: 'Ziswaf',
                icon: HeartHandshake,
                keyword: '/cms/ziswaf',
                children: [
                  { path: '/cms/ziswaf/katalog', label: 'Katalog Program' },
                  { path: '/cms/ziswaf/riwayat', label: 'Riwayat Donasi' },
                  { path: '/cms/ziswaf/verifikasi', label: 'Verifikasi' },
                ],
              },
            ] as const
          ).map((menu) => {
            const locked = isLocked(menu.keyword);
            const isActiveGroup = isGroupActive(menu.keyword);
            return (
              <div
                key={menu.id}
                className='relative'>
                <button
                  onClick={() => !locked && toggleMenu(menu.id)} // Hanya bisa buka jika tidak locked
                  className={menuLuarStyle(isActiveGroup, locked)}>
                  {/* Gunakan 'gap' dinamis, jangan 'space-x' agar margin gaib hilang */}
                  <div
                    className={`flex items-center transition-all duration-300 ${isCollapsed ? 'gap-0' : 'gap-3.5'}`}>
                    <menu.icon
                      className={`w-5 h-5 shrink-0 transition-transform duration-300 ${isActiveGroup ? 'scale-110' : 'group-hover:scale-110'}`}
                    />
                    <span
                      className={`whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>
                      {menu.label}
                    </span>
                  </div>
                  {!isCollapsed &&
                    (locked ? (
                      <Lock className='w-3 h-3 text-zinc-300' />
                    ) : (
                      <ChevronDown
                        className={`w-4 h-4 shrink-0 transition-transform ${openMenus[menu.id] ? 'rotate-180' : ''}`}
                      />
                    ))}

                  {isCollapsed && (
                    <div className='absolute left-14 bg-zinc-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap shadow-xl'>
                      {menu.label}
                    </div>
                  )}
                </button>

                {/* Render Anak Menu dengan Garis Struktur (Tree View) */}
                {openMenus[menu.id] && !isCollapsed && !locked && (
                  <div className='mt-1 mb-3 relative animate-in slide-in-from-top-2 fade-in duration-300'>
                    <div className='absolute left-[25px] top-0 bottom-3 w-[2px] bg-zinc-100 rounded-full' />
                    <div className='space-y-1 relative z-10 pl-2'>
                      {menu.children.map((child) => {
                        // Pengecekan ekstra untuk anak menu, jaga-jaga jika parent diizinkan tapi ada sub-path spesifik yang tidak.
                        const childLocked = isLocked(child.path);
                        const isChildActive = isActive(child.path);
                        const ChildComponent = (
                          childLocked ? 'div' : Link
                        ) as any;

                        return (
                          <div
                            key={child.path}
                            className='relative'>
                            {isChildActive && (
                              <div className='absolute left-[13px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-teal-600 text-teal-600 z-20' />
                            )}
                            <ChildComponent
                              {...(childLocked
                                ? {}
                                : { href: child.path, prefetch: false })}
                              className={subMenuStyle(child.path, childLocked)}>
                              {child.label}
                              {childLocked && (
                                <Lock className='w-3 h-3 text-zinc-300 absolute right-4' />
                              )}
                            </ChildComponent>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          <div className='my-4 border-t border-zinc-100 mx-4' />{' '}
          {/* Separator */}
          {/* FUNGSI RENDER MENU SATUAN (Single Link) */}
          {[
            { path: '/cms/tentang', label: 'Tentang', icon: FileText },
            { path: '/cms/galeri', label: 'Galeri', icon: ImageIcon },
            { path: '/cms/email', label: 'Pesan Email', icon: Mail },
            { path: '/cms/kajian', label: 'Kajian', icon: BookOpen },
            { path: '/cms/media', label: 'Media Editor', icon: LibraryBig },
            { path: '/cms/komentar', label: 'Komentar', icon: Sparkles },
            {
              path: '/cms/manajemen-admin',
              label: 'Manajemen Admin',
              icon: SlidersHorizontal,
            },
          ].map((item) => {
            const locked = isLocked(item.path);
            const active = isActive(item.path);
            const Component = (locked ? 'div' : Link) as any;
            return (
              <Component
                key={item.path}
                {...(locked ? {} : { href: item.path, prefetch: false })}
                className={`mt-1 ${menuLuarStyle(active, locked)}`}>
                {/* Gunakan 'gap' dinamis di sini juga */}
                <div
                  className={`flex items-center transition-all duration-300 ${isCollapsed ? 'gap-0' : 'gap-3.5'}`}>
                  <item.icon
                    className={`w-5 h-5 shrink-0 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}
                  />
                  <span
                    className={`whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>
                    {item.label}
                  </span>
                </div>
                {!isCollapsed && locked && (
                  <Lock className='w-3 h-3 text-zinc-300 shrink-0' />
                )}

                {isCollapsed && (
                  <div className='absolute left-14 bg-zinc-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap shadow-xl'>
                    {item.label}
                  </div>
                )}
              </Component>
            );
          })}
        </nav>

        {/* TOMBOL KELUAR PREMIUM */}
        <div
          className={`p-4 border-t border-zinc-100 bg-zinc-50/50 shrink-0 transition-all duration-300 ${isCollapsed ? 'items-center flex justify-center' : ''}`}>
          <button
            onClick={handleLogout}
            className={`group flex items-center justify-center p-3 text-red-600 bg-red-50 border border-red-100 hover:bg-red-600 hover:text-white rounded-2xl font-bold transition-all duration-300 w-full relative overflow-hidden ${isCollapsed ? 'w-12 h-12' : ''}`}>
            <LogOut
              className={`w-5 h-5 shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 ${isCollapsed ? '' : 'mr-3'}`}
            />
            <span
              className={`whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto'}`}>
              Keluar Sistem
            </span>

            {/* Tooltip Logout Collapsed */}
            {isCollapsed && (
              <div className='absolute left-16 bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap shadow-xl'>
                Keluar
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
