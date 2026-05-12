// import { ReactNode } from 'react';
// import { Tent } from 'lucide-react';

// export default function PublicLayout({ children }: { children: ReactNode }) {
//   return (
//     <div className='min-h-screen flex flex-col font-sans'>
//       {/* Navbar Minimalis */}
//       <nav className='bg-mni-primary text-white shadow-md sticky top-0 z-50'>
//         <div className='container mx-auto px-4 h-16 flex items-center justify-between'>
//           <div className='flex items-center space-x-2 font-bold text-xl'>
//             {/* Ikon Tenda sebagai ilustrasi tempat kurban/masjid */}
//             <Tent className='w-6 h-6 text-mni-accent' />
//             <span>Masjid Nurul Iman</span>
//           </div>
//           <div className='hidden md:flex space-x-6 text-sm font-medium'>
//             <span className='cursor-pointer hover:text-mni-accent transition'>
//               Katalog
//             </span>
//             <span className='cursor-pointer hover:text-mni-accent transition'>
//               Cara Pesan
//             </span>
//           </div>
//         </div>
//       </nav>

//       {/* Konten Utama (Berubah-ubah tergantung halaman) */}
//       <main className='flex-grow container mx-auto px-4 py-8'>{children}</main>

//       {/* Footer */}
//       <footer className='bg-mni-text text-mni-surface py-6 text-center text-sm'>
//         <p>&copy; 2026 Panitia Kurban Masjid Nurul Iman.</p>
//         <p className='text-gray-400 mt-1'>
//           Sistem tanpa biaya admin pihak ketiga. 100% dana masuk ke kas panitia.
//         </p>
//       </footer>
//     </div>
//   );
// }
//
//
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
