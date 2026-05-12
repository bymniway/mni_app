// 'use client';

// import React from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//   BookOpen,
//   Calendar,
//   Clock,
//   User,
//   X,
//   Image as ImageIcon,
//   PlusCircle,
// } from 'lucide-react';

// export default function JadwalKajian({
//   data,
//   kajianList,
//   isEditor = false,
//   onTextChange,
//   onItemAdd,
//   onItemDelete,
//   onItemUpdate,
//   onImageUpload,
// }: any) {
//   const fadeInUp = {
//     hidden: { opacity: 0, y: 30 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       transition: { duration: 0.6, ease: 'easeOut' },
//     },
//   };
//   const containerStagger = {
//     hidden: { opacity: 0 },
//     visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
//   };

//   const editableClass = isEditor
//     ? 'cursor-text hover:ring-2 hover:ring-mni-primary/50 focus:ring-2 focus:ring-mni-primary focus:bg-mni-primary/5 rounded-md px-1.5 py-0.5 outline-none transition-all block w-full'
//     : '';

//   return (
//     <div className='space-y-12 pb-20 overflow-hidden'>
//       {/* 1. HEADER KAJIAN */}
//       <motion.section
//         initial='hidden'
//         animate='visible'
//         variants={containerStagger}
//         className='text-center max-w-3xl mx-auto px-4 pt-10'>
//         <motion.div
//           variants={fadeInUp}
//           className='inline-flex items-center justify-center p-4 bg-blue-50 rounded-full mb-6 text-blue-600 shadow-sm'>
//           <BookOpen className='w-8 h-8' />
//         </motion.div>

//         <motion.h1
//           variants={fadeInUp}
//           contentEditable={isEditor}
//           suppressContentEditableWarning
//           onBlur={(e) =>
//             isEditor && onTextChange('judul', e.currentTarget.textContent)
//           }
//           className={`text-4xl md:text-5xl font-extrabold text-mni-primary mb-4 ${editableClass}`}>
//           {data?.judul || 'Jadwal Majelis Ilmu'}
//         </motion.h1>

//         <motion.p
//           variants={fadeInUp}
//           contentEditable={isEditor}
//           suppressContentEditableWarning
//           onBlur={(e) =>
//             isEditor && onTextChange('deskripsi', e.currentTarget.textContent)
//           }
//           className={`text-lg text-mni-muted leading-relaxed ${editableClass}`}>
//           {data?.deskripsi ||
//             "Mari makmurkan masjid dan segarkan iman dengan menuntut ilmu syar'i."}
//         </motion.p>
//       </motion.section>

//       {/* 2. GRID JADWAL KAJIAN */}
//       <motion.section
//         initial='hidden'
//         animate='visible'
//         variants={containerStagger}
//         className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
//         {(!kajianList || kajianList.length === 0) && !isEditor ? (
//           <div className='text-center py-20 text-gray-400 bg-white rounded-3xl border border-gray-100 shadow-sm'>
//             Belum ada jadwal kajian yang dijadwalkan.
//           </div>
//         ) : (
//           <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
//             <AnimatePresence>
//               {kajianList?.map((item: any) => (
//                 <motion.div
//                   layout
//                   initial={{ opacity: 0, scale: 0.9 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   exit={{ opacity: 0, scale: 0.9 }}
//                   transition={{ duration: 0.3 }}
//                   key={item.id}
//                   // PERBAIKAN: Menambahkan class 'relative' di bawah ini
//                   className='bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col group/card relative'>
//                   {/* Tombol Hapus (Hanya Editor) - Diperbaiki agar SELALU MUNCUL */}
//                   {isEditor && (
//                     <button
//                       onClick={() => onItemDelete(item.id)}
//                       className='absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 hover:scale-110 transition-all z-20 shadow-lg'
//                       title='Hapus Kajian'>
//                       <X className='w-4 h-4' />
//                     </button>
//                   )}

//                   {/* Area Gambar / Flyer Kajian */}
//                   <div className='relative w-full aspect-[4/3] bg-gray-50 border-b border-gray-100 group/image overflow-hidden'>
//                     {item.gambar_url ? (
//                       <img
//                         src={item.gambar_url}
//                         className='w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105'
//                         alt='Flyer Kajian'
//                       />
//                     ) : (
//                       <div className='w-full h-full flex flex-col items-center justify-center text-gray-400'>
//                         <ImageIcon className='w-12 h-12 mb-2 opacity-50' />
//                         <span className='text-xs font-medium'>
//                           Belum ada Flyer
//                         </span>
//                       </div>
//                     )}

//                     {/* Overlay Upload Gambar */}
//                     {isEditor && (
//                       <label className='absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white opacity-0 group-hover/image:opacity-100 cursor-pointer transition-opacity z-10'>
//                         <ImageIcon className='w-6 h-6 mb-2' />
//                         <span className='text-xs font-bold'>
//                           Upload Flyer Kajian
//                         </span>
//                         <input
//                           type='file'
//                           accept='image/*'
//                           className='hidden'
//                           onChange={(e) => onImageUpload(item.id, e)}
//                         />
//                       </label>
//                     )}
//                   </div>

//                   {/* Area Informasi Kajian */}
//                   <div className='p-6 flex flex-col flex-1 relative'>
//                     {/* Badge Hari & Waktu melayang separuh di atas gambar */}
//                     <div className='absolute -top-5 left-6 right-6 flex gap-2 z-20'>
//                       <div className='flex items-center bg-mni-primary text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md border-2 border-white'>
//                         <Calendar className='w-3.5 h-3.5 mr-1.5' />
//                         <span
//                           contentEditable={isEditor}
//                           suppressContentEditableWarning
//                           onBlur={(e) =>
//                             isEditor &&
//                             onItemUpdate(
//                               item.id,
//                               'hari',
//                               e.currentTarget.textContent,
//                             )
//                           }
//                           className={`${isEditor ? 'outline-none border-b border-dashed border-white/50 min-w-[50px]' : ''}`}>
//                           {item.hari || 'Hari'}
//                         </span>
//                       </div>
//                       <div className='flex items-center bg-white text-mni-primary text-xs font-bold px-3 py-1.5 rounded-lg shadow-md border-2 border-gray-100'>
//                         <Clock className='w-3.5 h-3.5 mr-1.5' />
//                         <span
//                           contentEditable={isEditor}
//                           suppressContentEditableWarning
//                           onBlur={(e) =>
//                             isEditor &&
//                             onItemUpdate(
//                               item.id,
//                               'waktu',
//                               e.currentTarget.textContent,
//                             )
//                           }
//                           className={`${isEditor ? 'outline-none border-b border-dashed border-mni-primary/50 min-w-[50px]' : ''}`}>
//                           {item.waktu || 'Waktu'}
//                         </span>
//                       </div>
//                     </div>

//                     <div className='mt-4'>
//                       {/* Nama Ustadz */}
//                       <div className='flex items-start mb-3 group/edit'>
//                         <User className='w-5 h-5 text-mni-accent mr-3 mt-1 shrink-0' />
//                         <h3
//                           contentEditable={isEditor}
//                           suppressContentEditableWarning
//                           onBlur={(e) =>
//                             isEditor &&
//                             onItemUpdate(
//                               item.id,
//                               'ustadz',
//                               e.currentTarget.textContent,
//                             )
//                           }
//                           className={`text-xl font-bold text-mni-text leading-tight ${editableClass}`}>
//                           {item.ustadz || 'Nama Ustadz / Pemateri'}
//                         </h3>
//                       </div>

//                       {/* Tema Kajian */}
//                       <div className='flex items-start'>
//                         <BookOpen className='w-5 h-5 text-gray-400 mr-3 mt-1 shrink-0' />
//                         <div className='w-full'>
//                           <span className='text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block'>
//                             Tema Pembahasan:
//                           </span>
//                           <p
//                             contentEditable={isEditor}
//                             suppressContentEditableWarning
//                             onBlur={(e) =>
//                               isEditor &&
//                               onItemUpdate(
//                                 item.id,
//                                 'tema',
//                                 e.currentTarget.textContent,
//                               )
//                             }
//                             className={`text-sm text-mni-muted font-medium leading-relaxed ${editableClass}`}>
//                             {item.tema ||
//                               'Tuliskan tema atau kitab yang dibahas di sini...'}
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </motion.div>
//               ))}
//             </AnimatePresence>

//             {/* Tombol Tambah Jadwal (Hanya Editor) */}
//             {isEditor && (
//               <motion.button
//                 layout
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 onClick={onItemAdd}
//                 className='bg-blue-50/50 border-2 border-dashed border-blue-200 rounded-3xl flex flex-col items-center justify-center p-6 text-blue-500 hover:text-white hover:bg-blue-500 hover:border-blue-500 transition-all min-h-[300px]'>
//                 <PlusCircle className='w-12 h-12 mb-3' />
//                 <span className='font-bold text-sm'>Tambah Jadwal Kajian</span>
//               </motion.button>
//             )}
//           </div>
//         )}
//       </motion.section>
//     </div>
//   );
// }
//
//
//
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Calendar,
  Clock,
  User,
  X,
  Image as ImageIcon,
  PlusCircle,
} from 'lucide-react';

export default function JadwalKajian({
  data,
  kajianList,
  isEditor = false,
  onTextChange,
  onItemAdd,
  onItemDelete,
  onItemUpdate,
  onImageUpload,
  // Props Tambahan untuk Multi-Select
  selectedIds = [],
  onToggleSelect = () => {},
  isSelectionMode = false,
  onBulkDelete,
}: any) {
  // PERBAIKAN: Ditambahkan tipe ': any' agar TypeScript tidak komplain
  const fadeInUp: any = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };
  const containerStagger: any = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const editableClass = isEditor
    ? 'cursor-text hover:ring-2 hover:ring-mni-primary/50 focus:ring-2 focus:ring-mni-primary focus:bg-mni-primary/5 rounded-md px-1.5 py-0.5 outline-none transition-all block w-full'
    : '';

  return (
    <div className='space-y-12 pb-20 overflow-hidden'>
      {/* 1. HEADER KAJIAN */}
      <motion.section
        initial='hidden'
        animate='visible'
        variants={containerStagger}
        className='text-center max-w-3xl mx-auto px-4 pt-10'>
        <motion.div
          variants={fadeInUp}
          className='inline-flex items-center justify-center p-4 bg-blue-50 rounded-full mb-6 text-blue-600 shadow-sm'>
          <BookOpen className='w-8 h-8' />
        </motion.div>

        <motion.h1
          variants={fadeInUp}
          contentEditable={isEditor}
          suppressContentEditableWarning
          onBlur={(e) =>
            isEditor && onTextChange('judul', e.currentTarget.textContent)
          }
          className={`text-4xl md:text-5xl font-extrabold text-mni-primary mb-4 ${editableClass}`}>
          {data?.judul || 'Jadwal Majelis Ilmu'}
        </motion.h1>

        <motion.p
          variants={fadeInUp}
          contentEditable={isEditor}
          suppressContentEditableWarning
          onBlur={(e) =>
            isEditor && onTextChange('deskripsi', e.currentTarget.textContent)
          }
          className={`text-lg text-mni-muted leading-relaxed ${editableClass}`}>
          {data?.deskripsi ||
            "Mari makmurkan masjid dan segarkan iman dengan menuntut ilmu syar'i."}
        </motion.p>
      </motion.section>

      {/* 2. GRID JADWAL KAJIAN */}
      <motion.section
        initial='hidden'
        animate='visible'
        variants={containerStagger}
        className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {(!kajianList || kajianList.length === 0) && !isEditor ? (
          <div className='text-center py-20 text-gray-400 bg-white rounded-3xl border border-gray-100 shadow-sm'>
            Belum ada jadwal kajian yang dijadwalkan.
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            <AnimatePresence>
              {kajianList?.map((item: any) => {
                const isSelected = selectedIds.includes(item.id);

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    key={item.id}
                    onClick={() => isSelectionMode && onToggleSelect(item.id)}
                    className={`bg-white rounded-[1.5rem] shadow-sm transition-all overflow-hidden flex flex-col group/card relative
                      ${isSelectionMode ? 'animate-subtle-jiggle cursor-pointer' : 'hover:shadow-xl'}
                      ${isSelected ? 'border-teal-500 ring-2 ring-teal-500/30 scale-[0.98]' : 'border-gray-100 border'}
                    `}>
                    {/* ==========================================
                        DOT INDIKATOR ELEGANT
                        ========================================== */}
                    {isEditor && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSelect(item.id);
                        }}
                        className={`absolute top-3 left-3 z-[50] w-[22px] h-[22px] rounded-full border-[1.5px] transition-all flex items-center justify-center
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

                    {/* Tombol Hapus Individual (Sembunyikan saat mode multi-select) */}
                    {isEditor && !isSelectionMode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onItemDelete(item.id);
                        }}
                        className='absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 hover:scale-110 transition-all z-20 shadow-lg'
                        title='Hapus Kajian'>
                        <X className='w-4 h-4' />
                      </button>
                    )}

                    {/* Area Gambar / Flyer Kajian */}
                    <div className='relative w-full aspect-[4/3] bg-gray-50 border-b border-gray-100 group/image overflow-hidden shrink-0'>
                      {item.gambar_url ? (
                        <img
                          src={item.gambar_url}
                          className='w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105'
                          alt='Flyer Kajian'
                        />
                      ) : (
                        <div className='w-full h-full flex flex-col items-center justify-center text-gray-400'>
                          <ImageIcon className='w-12 h-12 mb-2 opacity-50' />
                          <span className='text-xs font-medium'>
                            Belum ada Flyer
                          </span>
                        </div>
                      )}

                      {/* Overlay Upload Gambar */}
                      {isEditor && !isSelectionMode && (
                        <label className='absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white opacity-0 group-hover/image:opacity-100 cursor-pointer transition-opacity z-10'>
                          <ImageIcon className='w-6 h-6 mb-2' />
                          <span className='text-xs font-bold'>
                            Upload Flyer Kajian
                          </span>
                          <input
                            type='file'
                            accept='image/*'
                            className='hidden'
                            onChange={(e) => onImageUpload(item.id, e)}
                          />
                        </label>
                      )}
                    </div>

                    {/* Area Informasi Kajian */}
                    <div className='p-6 flex flex-col flex-1 relative'>
                      {/* IKON BACKGROUND MENGEMBANG DI KANAN BAWAH */}
                      <div className='absolute -right-6 -bottom-6 opacity-[0.03] pointer-events-none group-hover/card:scale-125 transition-transform duration-700 z-0'>
                        <BookOpen className='w-40 h-40' />
                      </div>

                      {/* Badge Hari & Waktu melayang separuh di atas gambar */}
                      <div className='absolute -top-5 left-6 right-6 flex gap-2 z-20'>
                        <div className='flex items-center bg-mni-primary text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md border-2 border-white'>
                          <Calendar className='w-3.5 h-3.5 mr-1.5' />
                          <span
                            contentEditable={isEditor && !isSelectionMode}
                            suppressContentEditableWarning
                            onBlur={(e) =>
                              isEditor &&
                              onItemUpdate(
                                item.id,
                                'hari',
                                e.currentTarget.textContent,
                              )
                            }
                            className={`${isEditor && !isSelectionMode ? 'outline-none border-b border-dashed border-white/50 min-w-[50px]' : ''} ${isSelectionMode ? 'pointer-events-none' : ''}`}>
                            {item.hari || 'Hari'}
                          </span>
                        </div>
                        <div className='flex items-center bg-white text-mni-primary text-xs font-bold px-3 py-1.5 rounded-lg shadow-md border-2 border-gray-100'>
                          <Clock className='w-3.5 h-3.5 mr-1.5' />
                          <span
                            contentEditable={isEditor && !isSelectionMode}
                            suppressContentEditableWarning
                            onBlur={(e) =>
                              isEditor &&
                              onItemUpdate(
                                item.id,
                                'waktu',
                                e.currentTarget.textContent,
                              )
                            }
                            className={`${isEditor && !isSelectionMode ? 'outline-none border-b border-dashed border-mni-primary/50 min-w-[50px]' : ''} ${isSelectionMode ? 'pointer-events-none' : ''}`}>
                            {item.waktu || 'Waktu'}
                          </span>
                        </div>
                      </div>

                      <div className='mt-4 relative z-10'>
                        {/* Nama Ustadz */}
                        <div className='flex items-start mb-3 group/edit'>
                          <User className='w-5 h-5 text-mni-accent mr-3 mt-1 shrink-0' />
                          <h3
                            contentEditable={isEditor && !isSelectionMode}
                            suppressContentEditableWarning
                            onBlur={(e) =>
                              isEditor &&
                              onItemUpdate(
                                item.id,
                                'ustadz',
                                e.currentTarget.textContent,
                              )
                            }
                            className={`text-xl font-bold text-mni-text leading-tight ${editableClass} ${isSelectionMode ? 'pointer-events-none' : ''}`}>
                            {item.ustadz || 'Nama Ustadz / Pemateri'}
                          </h3>
                        </div>

                        {/* Tema Kajian */}
                        <div className='flex items-start'>
                          <BookOpen className='w-5 h-5 text-gray-400 mr-3 mt-1 shrink-0' />
                          <div className='w-full'>
                            <span className='text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block'>
                              Tema Pembahasan:
                            </span>
                            <p
                              contentEditable={isEditor && !isSelectionMode}
                              suppressContentEditableWarning
                              onBlur={(e) =>
                                isEditor &&
                                onItemUpdate(
                                  item.id,
                                  'tema',
                                  e.currentTarget.textContent,
                                )
                              }
                              className={`text-sm text-mni-muted font-medium leading-relaxed ${editableClass} ${isSelectionMode ? 'pointer-events-none' : ''}`}>
                              {item.tema ||
                                'Tuliskan tema atau kitab yang dibahas di sini...'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Tombol Tambah Jadwal (Hanya Editor) */}
            {isEditor && (
              <motion.button
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={onItemAdd}
                className='bg-blue-50/50 border-2 border-dashed border-blue-200 rounded-[1.5rem] flex flex-col items-center justify-center p-6 text-blue-500 hover:text-white hover:bg-blue-500 hover:border-blue-500 transition-all min-h-[300px]'>
                <PlusCircle className='w-12 h-12 mb-3' />
                <span className='font-bold text-sm'>Tambah Jadwal Kajian</span>
              </motion.button>
            )}
          </div>
        )}
      </motion.section>
    </div>
  );
}
