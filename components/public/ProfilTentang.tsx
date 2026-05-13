'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  BookHeart,
  Users,
  X,
  Image as ImageIcon,
  PlusCircle,
  ShieldCheck,
  UserCheck,
  Landmark,
  FileCheck2,
  CreditCard,
} from 'lucide-react';

export default function ProfilTentang({
  data,
  pengurusList,
  isEditor = false,
  onTextChange,
  onPengurusUpdate,
  onPengurusDelete,
  onPengurusAdd,
  onPengurusImageUpload,
  // Props Tambahan untuk Multi-Select
  selectedIds = [],
  onToggleSelect = () => {},
  isSelectionMode = false,
}: any) {
  // PERBAIKAN: Menambahkan tipe ': any' agar TypeScript tidak komplain
  const fadeInUp: any = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  const staggerContainer: any = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  // 1. CLASS UNTUK BACKGROUND TERANG (PUTIH/ABU MUDA)
  const editableLight = isEditor
    ? 'cursor-text hover:ring-2 hover:ring-mni-primary/50 focus:ring-2 focus:ring-mni-primary focus:bg-slate-50 rounded-lg outline-none transition-all duration-200 inline-block min-w-[50px]'
    : 'whitespace-pre-line';

  // 2. CLASS UNTUK BACKGROUND GELAP (HERO, LEGALITAS, REKENING)
  const editableDark = isEditor
    ? 'cursor-text hover:ring-2 hover:ring-white/40 focus:ring-2 focus:ring-white focus:bg-white/10 rounded-lg outline-none transition-all duration-200 inline-block min-w-[50px]'
    : 'whitespace-pre-line';

  const tampilkanSejarah = data.tampilkan_sejarah !== 'false';
  const tampilkanLegalitas = data.tampilkan_legalitas !== 'false';

  return (
    <div className='pb-24 overflow-hidden'>
      {/* 1. HERO & VISI MISI SECTION */}
      <motion.section
        initial='hidden'
        animate='visible'
        variants={staggerContainer}
        className='max-w-6xl mx-auto px-4 md:px-10 pt-10'>
        {/* Banner Utama (Menggunakan editableDark) */}
        <motion.div
          variants={fadeInUp}
          className='bg-mni-primary rounded-[2.5rem] p-8 md:p-16 text-center relative overflow-hidden shadow-2xl mb-10 group'>
          <div className='absolute -left-10 -top-10 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-1000'>
            <ShieldCheck className='w-[300px] h-[300px] text-white' />
          </div>
          <div className='absolute -right-20 -bottom-20 opacity-[0.05] pointer-events-none group-hover:scale-110 transition-transform duration-1000'>
            <Users className='w-[400px] h-[400px] text-white' />
          </div>

          <div className='relative z-10'>
            <span className='inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-widest mb-6 border border-white/30 shadow-sm'>
              Tentang Kami
            </span>
            <br />
            <motion.h1
              contentEditable={isEditor}
              suppressContentEditableWarning
              onBlur={(e) =>
                isEditor && onTextChange('judul', e.currentTarget.textContent)
              }
              className={`text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight ${editableDark}`}>
              {data.judul || 'Profil Masjid Nurul Iman'}
            </motion.h1>
            <br />
            <motion.p
              contentEditable={isEditor}
              suppressContentEditableWarning
              onBlur={(e) =>
                isEditor &&
                onTextChange('deskripsi', e.currentTarget.textContent)
              }
              className={`text-lg md:text-xl text-green-50/90 leading-relaxed max-w-3xl mx-auto font-medium ${editableDark}`}>
              {data.deskripsi ||
                'Menjadi pusat ibadah dan pemberdayaan umat yang mengedepankan nilai-nilai ukhuwah islamiyah dalam bingkai ahlussunnah wal jamaah.'}
            </motion.p>
          </div>
        </motion.div>

        {/* Bento Visi Misi (Menggunakan editableLight) */}
        <motion.div
          variants={staggerContainer}
          className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <motion.div
            variants={fadeInUp}
            className='bg-white p-8 md:p-10 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300 relative overflow-hidden group'>
            <div className='absolute -right-8 -top-8 opacity-[0.03] group-hover:scale-125 transition-transform duration-700 pointer-events-none'>
              <Target className='w-48 h-48' />
            </div>
            <div className='relative z-10'>
              <div className='w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-blue-100 group-hover:scale-110 transition-transform'>
                <Target className='w-8 h-8' />
              </div>
              <h3 className='text-xl md:text-2xl font-bold text-gray-900 mb-4'>
                Visi MNI
              </h3>
              <div
                contentEditable={isEditor}
                suppressContentEditableWarning
                onBlur={(e) =>
                  isEditor &&
                  onTextChange('visi_teks', e.currentTarget.innerText)
                }
                className={`text-gray-600 text-sm md:text-base leading-relaxed font-medium pl-4 border-l-2 border-blue-200 ${editableLight}`}>
                {data.visi_teks || 'Teks visi kosong...'}
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className='bg-white p-8 md:p-10 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl hover:border-green-200 transition-all duration-300 relative overflow-hidden group'>
            <div className='absolute -right-8 -top-8 opacity-[0.03] group-hover:scale-125 transition-transform duration-700 pointer-events-none'>
              <BookHeart className='w-48 h-48' />
            </div>
            <div className='relative z-10'>
              <div className='w-16 h-16 bg-green-50 text-mni-primary rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-green-100 group-hover:scale-110 transition-transform'>
                <BookHeart className='w-8 h-8' />
              </div>
              <h3 className='text-xl md:text-2xl font-bold text-gray-900 mb-4'>
                Misi MNI
              </h3>
              <div
                contentEditable={isEditor}
                suppressContentEditableWarning
                onBlur={(e) =>
                  isEditor &&
                  onTextChange('misi_teks', e.currentTarget.innerText)
                }
                className={`text-gray-600 text-sm md:text-base leading-relaxed font-medium pl-4 border-l-2 border-green-200 ${editableLight}`}>
                {data.misi_teks || 'Teks misi kosong...'}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* 2. SEJARAH SINGKAT */}
      {tampilkanSejarah && (
        <motion.section
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, margin: '-50px' }}
          variants={fadeInUp}
          className='max-w-6xl mx-auto px-4 md:px-10 mt-16 md:mt-24'>
          <div className='bg-white border border-gray-100 shadow-sm rounded-[2.5rem] p-8 md:p-12 flex flex-col md:flex-row gap-8 items-start relative overflow-hidden group hover:shadow-md transition-shadow'>
            <div className='absolute -left-10 -bottom-10 opacity-[0.02] group-hover:scale-125 transition-transform duration-1000 pointer-events-none'>
              <Landmark className='w-[300px] h-[300px] text-gray-900' />
            </div>

            <div className='md:w-1/3 shrink-0 relative z-10'>
              <div className='w-14 h-14 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center mb-4 border border-gray-100'>
                <Landmark className='w-7 h-7' />
              </div>
              <h2
                contentEditable={isEditor}
                suppressContentEditableWarning
                onBlur={(e) =>
                  isEditor &&
                  onTextChange('sejarah_judul', e.currentTarget.textContent)
                }
                className={`text-2xl font-bold text-gray-900 leading-tight ${editableLight}`}>
                {data.sejarah_judul || 'Sejarah Berdirinya Masjid Nurul Iman'}
              </h2>
            </div>

            <div className='md:w-2/3 relative z-10'>
              <div
                contentEditable={isEditor}
                suppressContentEditableWarning
                onBlur={(e) =>
                  isEditor &&
                  onTextChange('sejarah_teks', e.currentTarget.innerText)
                }
                className={`text-gray-500 text-sm md:text-base leading-relaxed font-medium columns-1 md:columns-2 gap-8 space-y-4 md:space-y-0 ${editableLight}`}>
                {data.sejarah_teks ||
                  'Masjid Nurul Iman didirikan pada tahun 2010 berawal dari musala kecil yang dibangun atas swadaya warga sekitar. Seiring bertambahnya jumlah jamaah dan tingginya antusiasme masyarakat dalam menuntut ilmu agama, musala ini perlahan direnovasi dan diperluas melalui dana infaq, sedekah, dan wakaf.\n\nKini, Masjid Nurul Iman telah berdiri kokoh menjadi pusat ibadah dan kegiatan keumatan. Tidak hanya menyelenggarakan salat lima waktu, tetapi juga menjadi motor penggerak pendidikan, sosial, dan ekonomi warga.'}
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {/* 3. PENGURUS SECTION */}
      <section className='mt-16 md:mt-24 pt-16 border-t border-gray-100 bg-mni-surface/30'>
        <div className='max-w-6xl mx-auto px-4 md:px-10'>
          <motion.div
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true, margin: '-50px' }}
            variants={fadeInUp}
            className='text-center mb-16'>
            <span className='inline-block px-4 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-xs font-bold uppercase tracking-widest mb-4'>
              Struktur Organisasi
            </span>
            <br />
            <motion.h2
              contentEditable={isEditor}
              suppressContentEditableWarning
              onBlur={(e) =>
                isEditor &&
                onTextChange('pengurus_judul', e.currentTarget.textContent)
              }
              className={`text-3xl md:text-4xl font-black text-mni-text mb-4 inline-block ${editableLight}`}>
              {data.pengurus_judul || 'Susunan Pengurus DKM'}
            </motion.h2>
            <br />
            <motion.p
              contentEditable={isEditor}
              suppressContentEditableWarning
              onBlur={(e) =>
                isEditor &&
                onTextChange('pengurus_deskripsi', e.currentTarget.textContent)
              }
              className={`text-gray-500 font-medium max-w-2xl mx-auto inline-block ${editableLight}`}>
              {data.pengurus_deskripsi ||
                'Tim khidmat yang mendedikasikan waktu dan tenaga untuk memakmurkan Masjid Nurul Iman dan melayani jamaah.'}
            </motion.p>
          </motion.div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
            <AnimatePresence>
              {pengurusList?.map((person: any) => {
                const isSelected = selectedIds.includes(person.id);

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -20 }}
                    transition={{ duration: 0.4 }}
                    key={person.id}
                    onClick={() => isSelectionMode && onToggleSelect(person.id)}
                    className={`relative bg-white rounded-3xl border shadow-sm transition-all duration-300 group/card overflow-hidden flex flex-col items-center pt-8 pb-6 px-4
                      ${isSelectionMode ? 'animate-subtle-jiggle cursor-pointer' : 'hover:shadow-xl hover:border-mni-primary/30'}
                      ${isSelected ? 'border-teal-500 ring-2 ring-teal-500/30 scale-[0.98]' : 'border-gray-100'}
                    `}>
                    {/* ==========================================
                        DOT INDIKATOR ELEGANT JIGGLE
                        ========================================== */}
                    {isEditor && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSelect(person.id);
                        }}
                        className={`absolute top-4 left-4 z-[30] w-[22px] h-[22px] rounded-full border-[1.5px] transition-all flex items-center justify-center
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

                    {/* IKON BACKGROUND MENGEMBANG */}
                    <div className='absolute -right-4 -bottom-4 opacity-[0.03] group-hover/card:scale-125 transition-transform duration-700 pointer-events-none z-0'>
                      <UserCheck className='w-40 h-40 text-mni-primary' />
                    </div>

                    <div className='absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-gray-50 to-white border-b border-gray-50 z-0'></div>

                    {isEditor && !isSelectionMode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPengurusDelete(person.id);
                        }}
                        className='absolute top-3 right-3 p-2 bg-red-50 text-red-500 rounded-full opacity-0 group-hover/card:opacity-100 hover:bg-red-500 hover:text-white transition-all z-20 shadow-sm'
                        title='Hapus Pengurus'>
                        <X className='w-4 h-4' />
                      </button>
                    )}

                    <div className='relative w-28 h-28 mb-5 group/image z-10'>
                      {person.gambar_url ? (
                        <img
                          src={person.gambar_url}
                          className='w-full h-full object-cover rounded-full border-4 border-white shadow-md'
                          alt={person.nama}
                        />
                      ) : (
                        <div className='w-full h-full bg-gray-100 rounded-full flex items-center justify-center border-4 border-white shadow-md'>
                          <Users className='w-10 h-10 text-gray-300' />
                        </div>
                      )}

                      {isEditor && !isSelectionMode && (
                        <>
                          <label className='absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover/image:opacity-100 cursor-pointer transition-opacity z-10 backdrop-blur-sm'>
                            <ImageIcon className='w-6 h-6 mb-1' />
                            <span className='text-[10px] font-bold tracking-wider uppercase'>
                              Ubah Foto
                            </span>
                            <input
                              type='file'
                              accept='image/*'
                              className='hidden'
                              onChange={(e) =>
                                onPengurusImageUpload(person.id, e)
                              }
                            />
                          </label>
                          {person.gambar_url && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onPengurusUpdate(person.id, 'gambar_url', '');
                              }}
                              className='absolute -top-1 -right-1 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover/image:opacity-100 hover:bg-red-600 transition-all z-20 shadow-md border-2 border-white'
                              title='Hapus Gambar'>
                              <X className='w-3 h-3' />
                            </button>
                          )}
                        </>
                      )}
                    </div>

                    <div className='relative z-10 text-center w-full'>
                      <h4
                        contentEditable={isEditor && !isSelectionMode}
                        suppressContentEditableWarning
                        onBlur={(e) =>
                          isEditor &&
                          onPengurusUpdate(
                            person.id,
                            'nama',
                            e.currentTarget.textContent,
                          )
                        }
                        className={`font-bold text-base md:text-lg text-gray-900 group-hover/card:text-mni-primary transition-colors ${editableLight} ${isSelectionMode ? 'pointer-events-none' : ''}`}>
                        {person.nama || 'Nama Pengurus'}
                      </h4>
                      <p
                        contentEditable={isEditor && !isSelectionMode}
                        suppressContentEditableWarning
                        onBlur={(e) =>
                          isEditor &&
                          onPengurusUpdate(
                            person.id,
                            'jabatan',
                            e.currentTarget.textContent,
                          )
                        }
                        className={`text-xs font-bold text-mni-primary uppercase tracking-widest mt-1.5 bg-green-50 px-3 py-1 rounded-md inline-block border border-green-100 ${editableLight} ${isSelectionMode ? 'pointer-events-none' : ''}`}>
                        {person.jabatan || 'Jabatan'}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {isEditor && (
              <motion.button
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={onPengurusAdd}
                className='h-full bg-transparent border-2 border-dashed border-gray-300 rounded-3xl flex flex-col items-center justify-center p-6 text-gray-400 hover:text-mni-primary hover:border-mni-primary hover:bg-blue-50/50 transition-all min-h-[250px] group'>
                <div className='w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 group-hover:bg-blue-100 group-hover:scale-110 transition-all'>
                  <PlusCircle className='w-8 h-8 group-hover:text-mni-primary transition-colors' />
                </div>
                <span className='font-bold text-sm tracking-wider uppercase'>
                  Tambah Pengurus
                </span>
              </motion.button>
            )}
          </div>
        </div>
      </section>

      {/* 4. LEGALITAS & REKENING RESMI */}
      {tampilkanLegalitas && (
        <motion.section
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, margin: '-50px' }}
          variants={staggerContainer}
          className='max-w-6xl mx-auto px-4 md:px-10 mt-16 md:mt-24 pt-16 border-t border-gray-100'>
          <div className='bg-gray-900 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row gap-8 items-center shadow-lg'>
            <div className='absolute top-0 right-0 w-64 h-64 bg-green-900/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2'></div>
            <div className='absolute bottom-0 left-0 w-64 h-64 bg-blue-900/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2'></div>

            <motion.div
              variants={fadeInUp}
              className='w-full md:w-1/2 bg-white/5 border border-white/10 backdrop-blur-md rounded-[2rem] p-8 relative z-10 flex items-start gap-5 hover:bg-white/10 transition-colors'>
              <div className='w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/5 text-gray-200'>
                <FileCheck2 className='w-7 h-7' />
              </div>
              <div>
                <h3
                  contentEditable={isEditor}
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    isEditor &&
                    onTextChange('legalitas_judul', e.currentTarget.textContent)
                  }
                  className={`text-lg font-bold text-white mb-2 ${editableDark}`}>
                  {data.legalitas_judul || 'Legalitas Yayasan'}
                </h3>
                <div
                  contentEditable={isEditor}
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    isEditor &&
                    onTextChange('legalitas_teks', e.currentTarget.innerText)
                  }
                  className={`text-sm text-gray-400 font-medium leading-relaxed ${editableDark}`}>
                  {data.legalitas_teks ||
                    'Terdaftar resmi di Kemenag RI.\nSK. Kemenkumham RI No. AHU-123456.AH.01.04.Tahun 2020.'}
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className='w-full md:w-1/2 bg-mni-primary/10 border border-mni-primary/20 backdrop-blur-md rounded-[2rem] p-8 relative z-10 flex items-start gap-5 hover:bg-mni-primary/20 transition-colors'>
              <div className='w-14 h-14 bg-mni-primary/20 rounded-2xl flex items-center justify-center shrink-0 border border-mni-primary/30 text-green-300'>
                <CreditCard className='w-7 h-7' />
              </div>
              <div>
                <h3
                  contentEditable={isEditor}
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    isEditor &&
                    onTextChange('rekening_judul', e.currentTarget.textContent)
                  }
                  className={`text-lg font-bold text-white mb-2 ${editableDark}`}>
                  {data.rekening_judul || 'Rekening Resmi Donasi'}
                </h3>
                <div
                  contentEditable={isEditor}
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    isEditor &&
                    onTextChange('rekening_teks', e.currentTarget.innerText)
                  }
                  className={`text-sm text-gray-300 font-medium leading-relaxed tracking-wide ${editableDark}`}>
                  {data.rekening_teks ||
                    'Bank Syariah Indonesia (BSI)\nNo. Rek: 7123-456-789\nA.N. DKM Nurul Iman'}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>
      )}
    </div>
  );
}
