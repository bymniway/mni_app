import { ReactNode } from 'react';
import Navbar from '../../components/layout/Navbar'; // Sesuaikan path jika pakai @/components/...

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className='min-h-screen bg-gray-50 font-sans'>
      {/* Navbar Global MNI disisipkan di sini */}
      <Navbar />

      {/* Area Konten Dinamis */}
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12'>
        {children}
      </main>

      {/* Footer Sederhana (Opsional, bisa dipisah ke komponen sendiri nanti) */}
      <footer className='bg-mni-surface border-t border-gray-200 mt-auto py-8'>
        <div className='max-w-7xl mx-auto px-4 text-center text-mni-muted text-sm'>
          &copy; {new Date().getFullYear()} Masjid Nurul Iman. Semua hak cipta
          dilindungi.
        </div>
      </footer>
    </div>
  );
}
