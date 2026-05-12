'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCheck,
  Shield,
  Users,
  X,
  Image as ImageIcon,
  PlusCircle,
  Trash2,
} from 'lucide-react';

export default function PanitiaKurban({
  data,
  panitiaList,
  periode,
  isEditor = false,
  onTextChange,
  onPanitiaUpdate,
  onPanitiaDelete,
  onPanitiaAdd,
  onImageUpload,
}: any) {
  // PERBAIKAN: TypeScript Error (garis merah) dihilangkan dengan ': any'
  const containerStagger: any = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const fadeInUp: any = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  // STATE BARU: MULTI-SELECT PANITIA KURBAN
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const isSelectionMode = selectedIds.length > 0;

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleBulkDelete = () => {
    if (confirm(`Hapus ${selectedIds.length} panitia terpilih?`)) {
      // Trik Cerdas: Mengeksekusi delete individu tanpa konfirmasi ulang karena sudah dihandle di parent
      selectedIds.forEach((id) => onPanitiaDelete(id));
      setSelectedIds([]);
    }
  };

  const editableClass = isEditor
    ? 'cursor-text hover:ring-2 hover:ring-mni-primary/50 focus:ring-2 focus:ring-mni-primary focus:bg-white rounded-lg px-2 py-1 outline-none transition-all duration-200 inline-block min-w-[50px] bg-white/50 backdrop-blur-sm'
    : 'whitespace-pre-line';

  return (
    <div className='max-w-5xl mx-auto space-y-8 relative'>
      {/* ==========================================
          INJECT ANIMASI JIGGLE ELEGANT
          ========================================== */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes subtle-jiggle {
          0% { transform: rotate(-0.5deg) scale(0.99); }
          50% { transform: rotate(0.5deg) scale(0.99); }
          100% { transform: rotate(-0.5deg) scale(0.99); }
        }
        .animate-subtle-jiggle {
          animation: subtle-jiggle 0.4s ease-in-out infinite;
          transform-origin: center center;
          cursor: pointer !important;
        }
        .animate-subtle-jiggle:nth-child(even) {
          animation-direction: reverse;
          animation-duration: 0.45s;
        }
      `,
        }}
      />

      {/* ==========================================
          FLOATING ACTION BAR (PILL) ALA MACOS
          ========================================== */}
      <AnimatePresence>
        {isSelectionMode && isEditor && (
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', bounce: 0.3 }}
            className='fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 text-white px-3 py-3 rounded-full shadow-2xl flex items-center gap-3 w-max'>
            <div className='flex items-center gap-3 pl-2 pr-4 border-r border-zinc-700'>
              <span className='flex h-3 w-3 relative'>
                <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75'></span>
                <span className='relative inline-flex rounded-full h-3 w-3 bg-teal-500'></span>
              </span>
              <span className='text-sm font-bold tracking-wide'>
                {selectedIds.length}{' '}
                <span className='text-zinc-400 font-medium hidden sm:inline'>
                  Terpilih
                </span>
              </span>
            </div>

            <button
              onClick={() => setSelectedIds(panitiaList.map((p: any) => p.id))}
              className='text-xs font-bold text-zinc-400 hover:text-white transition-colors px-2'>
              Pilih Semua
            </button>

            <button
              onClick={handleBulkDelete}
              className='flex items-center text-xs font-bold bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white px-4 py-2 rounded-full transition-colors ml-2 shadow-inner'>
              <Trash2 className='w-3.5 h-3.5 mr-1.5' /> Hapus
            </button>

            <button
              onClick={() => setSelectedIds([])}
              className='ml-2 p-2 bg-zinc-800 text-zinc-400 rounded-full hover:bg-zinc-700 hover:text-white transition-colors'>
              <X className='w-4 h-4' />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Info Panitia */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='bg-green-50 border border-green-100 rounded-[2rem] p-6 md:p-8 text-center md:text-left flex flex-col md:flex-row items-center justify-between shadow-sm'>
        <div className='mb-4 md:mb-0 md:w-2/3'>
          <h2 className='text-2xl font-black text-green-900 mb-2 flex items-center justify-center md:justify-start'>
            <Shield className='w-6 h-6 mr-2 text-mni-primary shrink-0' />{' '}
            <span
              contentEditable={isEditor}
              suppressContentEditableWarning
              onBlur={(e) =>
                isEditor &&
                onTextChange &&
                onTextChange('judul', e.currentTarget.textContent)
              }
              className={editableClass}>
              {data.judul || 'Susunan Panitia Kurban'}
            </span>
          </h2>
          <p
            contentEditable={isEditor}
            suppressContentEditableWarning
            onBlur={(e) =>
              isEditor &&
              onTextChange &&
              onTextChange('deskripsi', e.currentTarget.textContent)
            }
            className={`text-sm text-green-800 leading-relaxed mt-2 ${editableClass}`}>
            {data.deskripsi ||
              `Berikut adalah susunan panitia yang bertugas untuk memastikan kelancaran ibadah kurban MNI periode ${periode} H.`}
          </p>
        </div>
        <div className='w-16 h-16 bg-green-200 text-green-700 rounded-full flex items-center justify-center font-black text-xl shrink-0 shadow-inner'>
          {periode}
        </div>
      </motion.div>

      {/* Pembungkus untuk mencegah teks terhighlight secara tidak sengaja saat Multi-select */}
      <div className={isSelectionMode ? 'select-none' : ''}>
        {panitiaList.length === 0 ? (
          <div className='text-center py-16 text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200 flex flex-col items-center'>
            <Users className='w-12 h-12 mb-3 opacity-20' />
            <p className='font-medium'>
              Belum ada susunan panitia yang dipublikasikan.
            </p>
            {isEditor && (
              <button
                onClick={onPanitiaAdd}
                className='mt-4 bg-mni-primary text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm'>
                + Tambah Panitia Pertama
              </button>
            )}
          </div>
        ) : (
          <motion.div
            variants={containerStagger}
            initial='hidden'
            animate='visible'
            className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
            {panitiaList.map((panitia: any, idx: number) => {
              const isSelected = selectedIds.includes(panitia.id);

              return (
                <motion.div
                  variants={fadeInUp}
                  key={panitia.id}
                  onClick={() => isSelectionMode && toggleSelect(panitia.id)}
                  className={`bg-white p-5 rounded-3xl border shadow-sm transition-all group relative overflow-hidden flex items-center gap-4
                    ${isSelectionMode ? 'animate-subtle-jiggle cursor-pointer' : 'hover:shadow-md hover:border-green-200'}
                    ${isSelected ? 'border-teal-500 ring-2 ring-teal-500/30 scale-[0.98]' : 'border-gray-100'}
                  `}>
                  {/* ==========================================
                      DOT INDIKATOR ELEGANT JIGGLE
                      ========================================== */}
                  {isEditor && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelect(panitia.id);
                      }}
                      className={`absolute top-4 left-4 z-[50] w-[22px] h-[22px] rounded-full border-[1.5px] transition-all flex items-center justify-center
                        ${
                          isSelected
                            ? 'border-teal-500 bg-teal-500 shadow-[0_0_12px_rgba(20,184,166,0.6)]'
                            : 'border-white/80 bg-black/20 backdrop-blur-sm hover:border-white'
                        }
                      `}>
                      {isSelected && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            type: 'spring',
                            stiffness: 400,
                            damping: 20,
                          }}
                          className='w-2.5 h-2.5 rounded-full bg-white'
                        />
                      )}
                    </button>
                  )}

                  {/* EFEK HOVER IKON RAKSASA MENGEMBANG LEMBUT */}
                  <div className='absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-150 transition-transform duration-1000 pointer-events-none z-0'>
                    <UserCheck className='w-40 h-40 text-mni-primary' />
                  </div>

                  {/* Hapus Panitia Individual (Disembunyikan saat mode multi-select) */}
                  {isEditor && !isSelectionMode && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Konfirmasi manual di sini
                        if (confirm('Yakin ingin menghapus panitia ini?'))
                          onPanitiaDelete(panitia.id);
                      }}
                      className='absolute top-3 right-3 p-1.5 bg-red-50 text-red-500 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all z-20 shadow-sm'
                      title='Hapus Panitia'>
                      <X className='w-4 h-4' />
                    </button>
                  )}

                  {/* Foto Profil / Avatar */}
                  <div className='w-16 h-16 rounded-2xl bg-green-50 overflow-hidden relative z-10 shrink-0 border border-green-100 shadow-inner flex items-center justify-center group/image'>
                    {panitia.foto_url ? (
                      <img
                        src={panitia.foto_url}
                        alt={panitia.nama}
                        className='w-full h-full object-cover'
                      />
                    ) : (
                      <UserCheck className='w-8 h-8 text-green-500/50' />
                    )}

                    {/* Upload Image Overlay */}
                    {isEditor && !isSelectionMode && (
                      <label className='absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white opacity-0 group-hover/image:opacity-100 cursor-pointer transition-opacity z-10 backdrop-blur-sm'>
                        <ImageIcon className='w-5 h-5 mb-0.5' />
                        <span className='text-[8px] font-bold tracking-wider uppercase'>
                          Ubah
                        </span>
                        <input
                          type='file'
                          accept='image/*'
                          className='hidden'
                          onChange={(e) =>
                            onImageUpload && onImageUpload(panitia.id, e)
                          }
                        />
                      </label>
                    )}
                  </div>

                  {/* Teks Info Editable */}
                  <div className='relative z-10 flex-1 min-w-0 pr-4'>
                    <h4
                      contentEditable={isEditor && !isSelectionMode}
                      suppressContentEditableWarning
                      onBlur={(e) =>
                        isEditor &&
                        onPanitiaUpdate &&
                        onPanitiaUpdate(
                          panitia.id,
                          'nama',
                          e.currentTarget.textContent,
                        )
                      }
                      className={`font-bold text-gray-900 text-base truncate transition-colors ${editableClass} ${isSelectionMode ? 'pointer-events-none' : 'group-hover:text-mni-primary'}`}>
                      {panitia.nama || 'Nama Pengurus'}
                    </h4>
                    <p
                      contentEditable={isEditor && !isSelectionMode}
                      suppressContentEditableWarning
                      onBlur={(e) =>
                        isEditor &&
                        onPanitiaUpdate &&
                        onPanitiaUpdate(
                          panitia.id,
                          'jabatan',
                          e.currentTarget.textContent,
                        )
                      }
                      className={`text-[10px] font-bold text-mni-primary uppercase tracking-wider bg-green-50 border border-green-100 px-2 py-1 rounded-lg inline-block mt-1.5 truncate max-w-full ${editableClass} ${isSelectionMode ? 'pointer-events-none' : ''}`}>
                      {panitia.jabatan || 'Jabatan'}
                    </p>
                  </div>
                </motion.div>
              );
            })}

            {/* Tombol Tambah Card Panitia Baru */}
            {isEditor && (
              <motion.button
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={onPanitiaAdd}
                className='h-full w-full bg-transparent border-2 border-dashed border-gray-300 rounded-3xl flex items-center justify-center p-5 text-gray-400 hover:text-mni-primary hover:border-mni-primary hover:bg-green-50/50 transition-all min-h-[100px] group'>
                <PlusCircle className='w-6 h-6 mr-2 group-hover:scale-110 transition-transform' />
                <span className='font-bold text-sm tracking-wider uppercase'>
                  Tambah
                </span>
              </motion.button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
