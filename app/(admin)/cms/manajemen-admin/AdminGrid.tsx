'use client';

import { useState } from 'react';
import {
  Shield,
  CheckCircle2,
  XCircle,
  Trash2,
  CheckSquare,
} from 'lucide-react';
import AksiAdmin from './AksiAdmin';
import { hapusBanyakAdminAction } from './actions';

export default function AdminGrid({ admins }: { admins: any[] }) {
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const EMAIL_KEBAL = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleHapusBanyak = async () => {
    if (selectedIds.length === 0) return;
    setIsDeleting(true);
    await hapusBanyakAdminAction(selectedIds);
    setSelectedIds([]);
    setIsSelectMode(false);
    setIsDeleting(false);
  };

  return (
    <div className='space-y-6'>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes jiggle {
          0% { transform: rotate(-0.5deg); }
          50% { transform: rotate(0.5deg) scale(1.01); }
          100% { transform: rotate(-0.5deg); }
        }
        .jiggle-animation { animation: jiggle 0.3s ease-in-out infinite; }
        .jiggle-animation:nth-child(even) { animation-delay: 0.1s; animation-direction: reverse; }
        
        /* Animasi Marquee Pelan */
        @keyframes slow-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-content {
          display: flex;
          gap: 0.5rem;
          min-width: max-content;
          animation: slow-scroll 40s linear infinite;
        }
        .marquee-container:hover .marquee-content, 
        .marquee-container:active .marquee-content {
          animation-play-state: paused;
        }
      `,
        }}
      />

      {/* Toolbar Aksi Massal */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm gap-4 sm:gap-0'>
        <div className='text-sm font-medium text-zinc-600'>
          {isSelectMode ? (
            <span className='text-zinc-900 font-bold'>
              {selectedIds.length} Admin Terpilih
            </span>
          ) : (
            <span>Total: {admins.length} Pengguna</span>
          )}
        </div>
        <div className='flex w-full sm:w-auto space-x-2 sm:space-x-3'>
          {isSelectMode && (
            <button
              onClick={handleHapusBanyak}
              disabled={isDeleting || selectedIds.length === 0}
              className='flex-1 sm:flex-none flex items-center justify-center px-4 py-2.5 sm:py-2 bg-red-50 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors disabled:opacity-50 border border-red-100'>
              <Trash2 className='w-4 h-4 mr-2' />
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </button>
          )}
          <button
            onClick={() => {
              setIsSelectMode(!isSelectMode);
              setSelectedIds([]);
            }}
            className={`flex-1 sm:flex-none flex items-center justify-center px-4 py-2.5 sm:py-2 rounded-xl text-sm font-semibold transition-colors border ${isSelectMode ? 'bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-200' : 'bg-white text-zinc-800 border-zinc-200 hover:bg-zinc-50'}`}>
            <CheckSquare className='w-4 h-4 mr-2' />
            {isSelectMode ? 'Batal' : 'Pilih Banyak'}
          </button>
        </div>
      </div>

      {/* Grid Kartu Admin */}
      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5'>
        {admins.map((admin) => {
          const isSuperAdmin = admin.email === EMAIL_KEBAL;
          const isSelected = selectedIds.includes(admin.id);

          return (
            <div
              key={admin.id}
              onClick={() => {
                if (isSelectMode && !isSuperAdmin) toggleSelection(admin.id);
              }}
              className={`group relative overflow-hidden p-6 rounded-[2rem] border transition-all duration-300 
                ${isSelectMode && !isSuperAdmin ? 'jiggle-animation cursor-pointer' : ''} 
                ${admin.is_root ? 'bg-zinc-900 border-zinc-800 text-white shadow-xl shadow-zinc-900/10' : 'bg-white border-zinc-200 text-zinc-900 hover:border-zinc-300'}
                ${isSelected ? 'ring-2 ring-zinc-900 border-zinc-900' : !isSelectMode && 'hover:shadow-lg hover:shadow-zinc-200/50 hover:-translate-y-1'}
              `}>
              {/* Ikon Background */}
              <div
                className={`absolute -right-8 -bottom-8 opacity-[0.04] group-hover:opacity-10 group-hover:scale-110 transition-all duration-700 pointer-events-none ${admin.is_root ? 'text-white' : 'text-zinc-900'}`}>
                <Shield className='w-48 h-48' />
              </div>

              {/* Checkbox Overlay (Mode Select) */}
              {isSelectMode && !isSuperAdmin && (
                <div className='absolute top-5 left-5 z-20 animate-in zoom-in duration-200'>
                  <div
                    className={`w-[22px] h-[22px] rounded border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-zinc-900 border-zinc-900' : 'bg-white border-zinc-300'}`}>
                    {isSelected && (
                      <CheckSquare className='w-3.5 h-3.5 text-white' />
                    )}
                  </div>
                </div>
              )}

              {/* Header Kartu */}
              <div
                className={`relative z-10 flex justify-between items-start mb-6 transition-all ${isSelectMode && !isSuperAdmin ? 'pl-8' : ''}`}>
                <div className='pr-2'>
                  <h3
                    className={`font-semibold text-base sm:text-lg line-clamp-1 ${admin.is_root ? 'text-white' : 'text-zinc-900'}`}>
                    {admin.nama_lengkap || 'Belum diatur'}
                  </h3>
                  <p
                    className={`text-xs sm:text-sm mt-0.5 ${admin.is_root ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    {admin.email}
                  </p>
                </div>
                {!isSelectMode && (
                  <div
                    className={
                      admin.is_root
                        ? '[&_button]:text-zinc-400 hover:[&_button]:text-white hover:[&_button]:bg-zinc-800'
                        : ''
                    }>
                    <AksiAdmin admin={admin} />
                  </div>
                )}
              </div>

              {/* Badges Status & Role */}
              <div className='relative z-10 flex flex-wrap gap-2 mb-6'>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide border ${admin.is_root ? 'bg-white text-zinc-900 border-white' : 'bg-zinc-100 text-zinc-700 border-zinc-200'}`}>
                  {admin.is_root ? 'ROOT DEWA' : 'ADMIN BIASA'}
                </span>

                {admin.is_active ? (
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide border ${admin.is_root ? 'bg-zinc-800 text-zinc-300 border-zinc-700' : 'bg-green-50 text-green-700 border-green-100'}`}>
                    <CheckCircle2 className='w-3 h-3 mr-1' /> Aktif
                  </span>
                ) : (
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide border ${admin.is_root ? 'bg-red-900/30 text-red-400 border-red-900/50' : 'bg-red-50 text-red-600 border-red-100'}`}>
                    <XCircle className='w-3 h-3 mr-1' /> Nonaktif
                  </span>
                )}
              </div>

              {/* Akses Halaman (Marquee Scrollable) */}
              <div className='relative z-10'>
                <div
                  className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${admin.is_root ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  Akses Halaman
                </div>
                {admin.is_root ? (
                  <span className='text-xs text-zinc-400 italic'>
                    Mendapatkan seluruh akses.
                  </span>
                ) : (
                  <div className='marquee-container overflow-x-auto no-scrollbar pb-2 cursor-grab active:cursor-grabbing'>
                    {admin.akses_halaman?.length > 0 ? (
                      <div className='marquee-content'>
                        {/* Duplicate array 2x for seamless marquee loop */}
                        {[...admin.akses_halaman, ...admin.akses_halaman].map(
                          (path: string, i: number) => (
                            <span
                              key={`${path}-${i}`}
                              className='bg-white border border-zinc-200 text-zinc-600 px-3 py-1.5 rounded-lg shadow-sm text-[11px] font-medium whitespace-nowrap'>
                              {path.replace('/cms/', '')}
                            </span>
                          ),
                        )}
                      </div>
                    ) : (
                      <span className='text-xs text-red-500 italic'>
                        Belum ada akses
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
