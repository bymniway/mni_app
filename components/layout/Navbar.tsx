'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, HeartHandshake } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Daftar menu utama MNI App
  const navLinks = [
    { name: 'Beranda', href: '/' },
    { name: 'Kurban', href: '/kurban' }, // Nanti halaman kurban kita pindah ke sini
    { name: 'ZISWAF', href: '/ziswaf' },
    { name: 'Tentang Kami', href: '/tentang' },
    { name: 'Galeri', href: '/galeri' },
  ];

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className='bg-mni-surface border-b border-gray-100 sticky top-0 z-50 shadow-sm'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-20'>
          {/* Logo / Brand */}
          <Link
            href='/'
            className='flex items-center space-x-2'>
            <div className='w-10 h-10 bg-mni-primary rounded-xl flex items-center justify-center text-white'>
              <HeartHandshake className='w-6 h-6' />
            </div>
            <span className='font-bold text-xl text-mni-primary tracking-tight'>
              MNI App
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className='hidden md:flex items-center space-x-8'>
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`font-medium transition-colors duration-200 hover:text-mni-primary ${
                    isActive
                      ? 'text-mni-primary border-b-2 border-mni-primary pb-1'
                      : 'text-mni-muted'
                  }`}>
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Tombol Aksi Desktop */}
          <div className='hidden md:flex items-center'>
            <Link href='/ziswaf'>
              <button className='bg-mni-accent text-white px-6 py-2.5 rounded-xl font-bold hover:bg-opacity-90 transition shadow-md'>
                Donasi Sekarang
              </button>
            </Link>
          </div>

          {/* Mobile Menu Button (Hamburger) */}
          <div className='md:hidden flex items-center'>
            <button
              onClick={toggleMenu}
              className='text-mni-text hover:text-mni-primary focus:outline-none p-2'
              aria-label='Toggle menu'>
              {isOpen ? (
                <X className='w-7 h-7' />
              ) : (
                <Menu className='w-7 h-7' />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu (Dropdown) */}
      <div
        className={`md:hidden absolute w-full bg-mni-surface border-b border-gray-100 shadow-lg transition-all duration-300 ease-in-out ${
          isOpen
            ? 'opacity-100 translate-y-0 visible'
            : 'opacity-0 -translate-y-4 invisible'
        }`}>
        <div className='px-4 pt-2 pb-6 space-y-2'>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)} // Tutup menu saat diklik
                className={`block px-4 py-3 rounded-xl font-medium transition-colors ${
                  isActive
                    ? 'bg-mni-primary/10 text-mni-primary'
                    : 'text-mni-muted hover:bg-gray-50'
                }`}>
                {link.name}
              </Link>
            );
          })}
          <div className='pt-4 border-t border-gray-100'>
            <Link
              href='/ziswaf'
              onClick={() => setIsOpen(false)}>
              <button className='w-full bg-mni-accent text-white px-4 py-3 rounded-xl font-bold hover:bg-opacity-90 transition shadow-md'>
                Donasi Sekarang
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
