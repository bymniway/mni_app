'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  Clock,
  Layout,
  AlertTriangle,
  BellRing,
  ShoppingCart,
  CheckSquare,
} from 'lucide-react';

export default function LiveEmailEditorKurban({
  form,
  isEditor = false,
  onTextChange,
  onImageUpload,
}: any) {
  const [activeTab, setActiveTab] = useState('LUNAS');

  const editableClass = isEditor
    ? 'cursor-text hover:ring-2 hover:ring-blue-500/30 focus:ring-2 focus:ring-blue-500 focus:bg-white/90 rounded px-2 py-1 outline-none transition-all duration-200 block w-full'
    : 'block w-full';

  // DESAIN 1: LUNAS (Sertifikat Emerald)
  const renderLunas = () => (
    <div className='bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 font-sans max-w-[600px] mx-auto relative'>
      <div className='p-8 flex items-center justify-between border-b-4 border-emerald-600 bg-white relative z-10'>
        <div className='relative group/logo w-32 h-12 flex items-center justify-center bg-slate-50 rounded-lg border border-dashed border-gray-200 overflow-hidden'>
          {form.email_kurban_logo_url ? (
            <img
              src={form.email_kurban_logo_url}
              className='max-h-full max-w-full object-contain'
            />
          ) : (
            <Layout className='w-6 h-6 text-slate-300' />
          )}
          {isEditor && (
            <label className='absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/logo:opacity-100 cursor-pointer transition-opacity backdrop-blur-sm'>
              <input
                type='file'
                className='hidden'
                onChange={(e) => onImageUpload('LOGO_KURBAN', e)}
              />
              <ImageIcon className='w-5 h-5 text-white' />
            </label>
          )}
        </div>
        <div className='text-right'>
          <h3 className='text-[11px] font-black tracking-widest text-slate-500 uppercase mb-0.5'>
            Sertifikat Kurban
          </h3>
          <p className='text-[10px] font-bold text-slate-400'>
            Masjid Nurul Iman LAN
          </p>
        </div>
      </div>

      <div className='p-8 md:p-10 relative'>
        <div className='relative z-10'>
          <h2 className='text-2xl font-black text-slate-800 mb-6'>
            <span
              contentEditable={isEditor}
              suppressContentEditableWarning
              onBlur={(e) =>
                isEditor &&
                onTextChange(
                  'email_kurban_judul_LUNAS',
                  e.currentTarget.textContent,
                )
              }
              className={editableClass}>
              {form['email_kurban_judul_LUNAS'] || 'Kwitansi Pembayaran Kurban'}
            </span>
          </h2>
          <p className='text-sm text-slate-600 mb-8 leading-relaxed'>
            Alhamdulillah <strong>[Nama Pekurban]</strong>.<br />
            <span
              contentEditable={isEditor}
              suppressContentEditableWarning
              onBlur={(e) =>
                isEditor &&
                onTextChange(
                  'email_kurban_intro_LUNAS',
                  e.currentTarget.textContent,
                )
              }
              className={`mt-2 ${editableClass}`}>
              {form['email_kurban_intro_LUNAS'] ||
                'Pendaftaran kurban Anda telah LUNAS dan terverifikasi dengan rincian hewan sebagai berikut:'}
            </span>
          </p>

          <table className='w-full text-sm mb-10 border-collapse'>
            <tbody>
              <tr className='border-b border-slate-100'>
                <td className='py-3 text-slate-400 uppercase text-[10px] font-bold tracking-wider'>
                  Tgl Daftar
                </td>
                <td className='py-3 font-black text-right text-slate-800'>
                  10 Dzulhijjah 1445 H
                </td>
              </tr>
              <tr className='border-b border-slate-100'>
                <td className='py-3 text-slate-400 uppercase text-[10px] font-bold tracking-wider'>
                  Nama Pekurban
                </td>
                <td className='py-3 font-black text-right text-slate-800'>
                  Ahmad bin Fulan
                </td>
              </tr>
              <tr className='border-b border-slate-100'>
                <td className='py-3 text-slate-400 uppercase text-[10px] font-bold tracking-wider'>
                  ID Pesanan
                </td>
                <td className='py-3 font-black text-right text-slate-800'>
                  TRX-998877
                </td>
              </tr>
              <tr className='border-b border-slate-100'>
                <td className='py-3 text-slate-400 uppercase text-[10px] font-bold tracking-wider'>
                  Hewan Kurban
                </td>
                <td className='py-3 font-black text-right text-emerald-600'>
                  Sapi Urunan Premium
                </td>
              </tr>
              <tr className='border-b border-slate-100'>
                <td className='py-3 text-slate-400 uppercase text-[10px] font-bold tracking-wider'>
                  Hak 1/3 Daging
                </td>
                <td className='py-3 font-black text-right text-slate-800'>
                  Diambil (1/3)
                </td>
              </tr>
              <tr className='bg-emerald-50'>
                <td className='py-5 px-4 font-black text-slate-800 text-sm rounded-l-xl'>
                  TOTAL LUNAS
                </td>
                <td className='py-5 px-4 font-black text-right text-lg text-emerald-600 rounded-r-xl'>
                  Rp 3.500.000
                </td>
              </tr>
            </tbody>
          </table>

          <div className='p-6 rounded-2xl border-2 border-dashed border-emerald-500 bg-emerald-50 text-center'>
            <div
              contentEditable={isEditor}
              suppressContentEditableWarning
              onBlur={(e) =>
                isEditor &&
                onTextChange(
                  'email_kurban_msg_utama_LUNAS',
                  e.currentTarget.textContent,
                )
              }
              className={`text-sm font-bold text-emerald-800 leading-relaxed ${editableClass}`}>
              {form['email_kurban_msg_utama_LUNAS'] ||
                '"Tidak ada amalan anak cucu Adam pada hari raya kurban yang lebih disukai Allah melebihi mengalirkan darah (menyembelih hewan kurban)...." (HR. Tirmidzi)'}
            </div>
          </div>
        </div>
      </div>
      {/* FOOTER */}
      <div className='bg-slate-50 p-8 flex flex-col border-t border-slate-200'>
        <div className='flex justify-end mb-6'>
          <div className='flex flex-col items-end'>
            <span className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1'>
              Authenticated By
            </span>
            <span
              contentEditable={isEditor}
              suppressContentEditableWarning
              onBlur={(e) =>
                isEditor &&
                onTextChange('email_kurban_ttd', e.currentTarget.textContent)
              }
              className={`font-black text-slate-800 text-sm ${editableClass}`}>
              {form.email_kurban_ttd || 'PANITIA KURBAN MNI'}
            </span>
            <div className='relative w-24 h-24 mt-2 group/stempel'>
              {form.email_kurban_stempel_url ? (
                <img
                  src={form.email_kurban_stempel_url}
                  className='w-full h-full object-contain mix-blend-multiply opacity-80'
                />
              ) : (
                <div className='w-full h-full border-2 border-dashed border-slate-300 rounded-full flex items-center justify-center text-[10px] font-black text-slate-400 rotate-12'>
                  STAMP
                </div>
              )}
              {isEditor && (
                <label className='absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover/stempel:opacity-100 cursor-pointer transition-opacity'>
                  <input
                    type='file'
                    className='hidden'
                    onChange={(e) => onImageUpload('STEMPEL_KURBAN', e)}
                  />
                  <ImageIcon className='w-4 h-4 text-white' />
                </label>
              )}
            </div>
          </div>
        </div>
        <div className='border-t border-slate-300 border-dashed pt-5 text-center'>
          <p className='text-[10px] text-slate-400 leading-relaxed font-medium'>
            E-Invoice ini diterbitkan secara otomatis oleh Sistem Informasi
            Masjid Nurul Iman LAN.
          </p>
        </div>
      </div>
    </div>
  );

  // DESAIN 2: AWAL BOOKING (Kuning Elegan)
  const renderAwalBooking = () => (
    <div className='bg-white rounded-2xl shadow-2xl overflow-hidden border border-amber-200 font-sans max-w-[500px] mx-auto relative'>
      <div className='bg-amber-400 p-8 text-center text-amber-900 relative z-10'>
        <ShoppingCart className='w-16 h-16 mx-auto mb-4 opacity-80' />
        <h2 className='text-2xl font-black'>
          <span
            contentEditable={isEditor}
            suppressContentEditableWarning
            onBlur={(e) =>
              isEditor &&
              onTextChange(
                'email_kurban_judul_AWAL_BOOKING',
                e.currentTarget.textContent,
              )
            }
            className={editableClass}>
            {form['email_kurban_judul_AWAL_BOOKING'] ||
              'Pemesanan Slot Berhasil'}
          </span>
        </h2>
      </div>
      <div className='p-8 text-center relative'>
        <p className='text-sm text-slate-600 mb-8 relative z-10'>
          Assalamu'alaikum <strong>[Nama Pekurban]</strong>.
          <span
            contentEditable={isEditor}
            suppressContentEditableWarning
            onBlur={(e) =>
              isEditor &&
              onTextChange(
                'email_kurban_intro_AWAL_BOOKING',
                e.currentTarget.textContent,
              )
            }
            className={`mt-2 ${editableClass}`}>
            {form['email_kurban_intro_AWAL_BOOKING'] ||
              'Alhamdulillah, slot hewan kurban Anda berhasil diamankan. Silakan segera lakukan pembayaran/DP agar pesanan dapat kami verifikasi sepenuhnya.'}
          </span>
        </p>

        <div className='bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-8 relative z-10 text-left'>
          <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1'>
            Total Tagihan / DP
          </p>
          <p className='text-2xl font-black text-slate-800 mb-2'>
            Rp 3.500.000
          </p>
          <p className='text-xs font-semibold text-slate-500 border-t border-slate-200 pt-2'>
            Sapi Urunan Premium | TRX-998877
          </p>
        </div>

        {/* --- TOMBOL KONFIRMASI (NEW) --- */}
        <div className='relative z-10'>
          {isEditor ? (
            <div className='flex flex-col gap-3 p-4 bg-red-50/50 border border-dashed border-red-300 rounded-2xl text-left'>
              <div>
                <label className='text-[10px] font-bold text-red-800 uppercase tracking-widest mb-1.5 block'>
                  Teks Tombol
                </label>
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    onTextChange(
                      'email_kurban_btn_text_MENUNGGU',
                      e.currentTarget.textContent,
                    )
                  }
                  className={`block w-full bg-white border border-red-200 rounded-xl p-3 text-sm font-bold text-red-700 outline-none focus:ring-2 focus:ring-red-500 transition-all cursor-text`}>
                  {form['email_kurban_btn_text_MENUNGGU'] || 'Konfirmasi'}
                </span>
              </div>
              <div>
                <label className='text-[10px] font-bold text-red-800 uppercase tracking-widest mb-1.5 block'>
                  Link Tujuan (URL)
                </label>
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    onTextChange(
                      'email_kurban_btn_link_MENUNGGU',
                      e.currentTarget.textContent,
                    )
                  }
                  className={`block w-full bg-white border border-red-200 rounded-xl p-3 text-xs font-mono text-slate-600 outline-none focus:ring-2 focus:ring-red-500 transition-all cursor-text break-all`}>
                  {form['email_kurban_btn_link_MENUNGGU'] ||
                    'https://wa.me/6281234567890'}
                </span>
              </div>
            </div>
          ) : (
            <a
              href={
                form['email_kurban_btn_link_MENUNGGU'] ||
                'https://wa.me/6281234567890'
              }
              target='_blank'
              rel='noopener noreferrer'
              className='block w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 text-sm text-center'>
              {form['email_kurban_btn_text_MENUNGGU'] ||
                'Konfirmasi via WhatsApp'}
            </a>
          )}
        </div>
      </div>
    </div>
  );

  // DESAIN 3: TAGIHAN PENUH BOOKING (Navy Blue) + BUTTON CTA
  const renderTagihan = () => (
    <div className='bg-white rounded-2xl shadow-2xl overflow-hidden border border-blue-800 font-sans max-w-[500px] mx-auto relative'>
      <div className='bg-blue-900 p-8 text-center text-white relative z-10'>
        <BellRing className='w-16 h-16 mx-auto mb-4 text-blue-300 animate-pulse' />
        <h2 className='text-2xl font-black'>
          <span
            contentEditable={isEditor}
            suppressContentEditableWarning
            onBlur={(e) =>
              isEditor &&
              onTextChange(
                'email_kurban_judul_TAGIHAN',
                e.currentTarget.textContent,
              )
            }
            className={editableClass}>
            {form['email_kurban_judul_TAGIHAN'] || 'Segera Lakukan Pelunasan'}
          </span>
        </h2>
      </div>
      <div className='p-8 text-center relative'>
        <p className='text-sm text-slate-600 mb-8 relative z-10'>
          Assalamu'alaikum <strong>[Nama Pekurban]</strong>.
          <span
            contentEditable={isEditor}
            suppressContentEditableWarning
            onBlur={(e) =>
              isEditor &&
              onTextChange(
                'email_kurban_intro_TAGIHAN',
                e.currentTarget.textContent,
              )
            }
            className={`mt-2 ${editableClass}`}>
            {form['email_kurban_intro_TAGIHAN'] ||
              'Status pesanan kurban Anda masih BOOKING. Grup Sapi Urunan Anda telah penuh atau batas waktu pembayaran hampir habis.'}
          </span>
        </p>

        <div className='bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-8 relative z-10 text-left'>
          <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1'>
            Total Tagihan Pelunasan
          </p>
          <p className='text-2xl font-black text-blue-900 mb-2'>Rp 3.500.000</p>
          <p className='text-xs font-semibold text-slate-500 border-t border-slate-200 pt-2'>
            Sapi Urunan Premium | TRX-998877
          </p>
        </div>

        <div className='flex items-start gap-3 bg-red-50 text-red-800 p-5 rounded-2xl text-left relative z-10 mb-8'>
          <AlertTriangle className='w-5 h-5 shrink-0 mt-0.5' />
          <span
            contentEditable={isEditor}
            suppressContentEditableWarning
            onBlur={(e) =>
              isEditor &&
              onTextChange(
                'email_kurban_msg_utama_TAGIHAN',
                e.currentTarget.textContent,
              )
            }
            className={`text-xs font-bold leading-relaxed ${editableClass}`}>
            {form['email_kurban_msg_utama_TAGIHAN'] ||
              'Mohon segera lakukan transfer dan konfirmasi ke admin agar hewan kurban Anda dapat kami kunci (lock).'}
          </span>
        </div>

        {/* --- TOMBOL KONFIRMASI (NEW) --- */}
        <div className='relative z-10'>
          {isEditor ? (
            <div className='flex flex-col gap-3 p-4 bg-blue-50/50 border border-dashed border-blue-300 rounded-2xl text-left'>
              <div>
                <label className='text-[10px] font-bold text-blue-800 uppercase tracking-widest mb-1.5 block'>
                  Teks Tombol
                </label>
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    onTextChange(
                      'email_kurban_btn_text_TAGIHAN',
                      e.currentTarget.textContent,
                    )
                  }
                  className={`block w-full bg-white border border-blue-200 rounded-xl p-3 text-sm font-bold text-blue-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-text`}>
                  {form['email_kurban_btn_text_TAGIHAN'] ||
                    'Konfirmasi via WhatsApp'}
                </span>
              </div>
              <div>
                <label className='text-[10px] font-bold text-blue-800 uppercase tracking-widest mb-1.5 block'>
                  Link Tujuan (URL)
                </label>
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    onTextChange(
                      'email_kurban_btn_link_TAGIHAN',
                      e.currentTarget.textContent,
                    )
                  }
                  className={`block w-full bg-white border border-blue-200 rounded-xl p-3 text-xs font-mono text-slate-600 outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-text break-all`}>
                  {form['email_kurban_btn_link_TAGIHAN'] ||
                    'https://wa.me/6281234567890'}
                </span>
              </div>
            </div>
          ) : (
            <a
              href={
                form['email_kurban_btn_link_TAGIHAN'] ||
                'https://wa.me/6281234567890'
              }
              target='_blank'
              rel='noopener noreferrer'
              className='block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 text-sm text-center'>
              {form['email_kurban_btn_text_TAGIHAN'] ||
                'Konfirmasi via WhatsApp'}
            </a>
          )}
        </div>
      </div>
    </div>
  );

  // DESAIN 4: MENUNGGU LUNAS AWAL (Yellow)
  const renderMenunggu = () => (
    <div className='bg-white rounded-2xl shadow-2xl overflow-hidden border border-amber-200 font-sans max-w-[500px] mx-auto relative'>
      <div className='bg-amber-400 p-8 text-center text-amber-900 relative z-10'>
        <Clock className='w-16 h-16 mx-auto mb-4 opacity-80' />
        <h2 className='text-2xl font-black'>
          <span
            contentEditable={isEditor}
            suppressContentEditableWarning
            onBlur={(e) =>
              isEditor &&
              onTextChange(
                'email_kurban_judul_MENUNGGU',
                e.currentTarget.textContent,
              )
            }
            className={editableClass}>
            {form['email_kurban_judul_MENUNGGU'] || 'Menunggu Verifikasi'}
          </span>
        </h2>
      </div>
      <div className='p-8 text-center relative'>
        <p className='text-sm text-slate-600 mb-8 relative z-10'>
          Assalamu'alaikum <strong>[Nama Pekurban]</strong>.
          <span
            contentEditable={isEditor}
            suppressContentEditableWarning
            onBlur={(e) =>
              isEditor &&
              onTextChange(
                'email_kurban_intro_MENUNGGU',
                e.currentTarget.textContent,
              )
            }
            className={`mt-2 ${editableClass}`}>
            {form['email_kurban_intro_MENUNGGU'] ||
              'Terima kasih telah mendaftar. Bukti pembayaran/DP Kurban Anda sedang ditinjau oleh panitia.'}
          </span>
        </p>

        <div className='bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-8 relative z-10 text-left'>
          <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1'>
            Total Nominal
          </p>
          <p className='text-2xl font-black text-slate-800 mb-2'>
            Rp 3.500.000
          </p>
          <p className='text-xs font-semibold text-slate-500 border-t border-slate-200 pt-2'>
            Sapi Urunan Premium | TRX-998877
          </p>
        </div>

        {/* --- TOMBOL KONFIRMASI (NEW) --- */}
        <div className='relative z-10'>
          {isEditor ? (
            <div className='flex flex-col gap-3 p-4 bg-red-50/50 border border-dashed border-red-300 rounded-2xl text-left'>
              <div>
                <label className='text-[10px] font-bold text-red-800 uppercase tracking-widest mb-1.5 block'>
                  Teks Tombol
                </label>
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    onTextChange(
                      'email_kurban_btn_text_MENUNGGU',
                      e.currentTarget.textContent,
                    )
                  }
                  className={`block w-full bg-white border border-red-200 rounded-xl p-3 text-sm font-bold text-red-700 outline-none focus:ring-2 focus:ring-red-500 transition-all cursor-text`}>
                  {form['email_kurban_btn_text_MENUNGGU'] || 'Konfirmasi'}
                </span>
              </div>
              <div>
                <label className='text-[10px] font-bold text-red-800 uppercase tracking-widest mb-1.5 block'>
                  Link Tujuan (URL)
                </label>
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    onTextChange(
                      'email_kurban_btn_link_MENUNGGU',
                      e.currentTarget.textContent,
                    )
                  }
                  className={`block w-full bg-white border border-red-200 rounded-xl p-3 text-xs font-mono text-slate-600 outline-none focus:ring-2 focus:ring-red-500 transition-all cursor-text break-all`}>
                  {form['email_kurban_btn_link_MENUNGGU'] ||
                    'https://wa.me/6281234567890'}
                </span>
              </div>
            </div>
          ) : (
            <a
              href={
                form['email_kurban_btn_link_MENUNGGU'] ||
                'https://wa.me/6281234567890'
              }
              target='_blank'
              rel='noopener noreferrer'
              className='block w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 text-sm text-center'>
              {form['email_kurban_btn_text_MENUNGGU'] ||
                'Konfirmasi via WhatsApp'}
            </a>
          )}
        </div>
      </div>
    </div>
  );

  // DESAIN 5: DITOLAK (Red) + BUTTON CTA
  const renderDitolak = () => (
    <div className='bg-white rounded-2xl shadow-2xl overflow-hidden border border-red-200 font-sans max-w-[500px] mx-auto relative'>
      <div className='bg-red-50 p-8 text-center border-b border-red-100 relative z-10'>
        <AlertTriangle className='w-16 h-16 text-red-500 mx-auto mb-4' />
        <h2 className='text-2xl font-black text-red-700'>
          <span
            contentEditable={isEditor}
            suppressContentEditableWarning
            onBlur={(e) =>
              isEditor &&
              onTextChange(
                'email_kurban_judul_DITOLAK',
                e.currentTarget.textContent,
              )
            }
            className={editableClass}>
            {form['email_kurban_judul_DITOLAK'] || 'Pendaftaran Tertunda'}
          </span>
        </h2>
      </div>
      <div className='p-8 text-center relative'>
        <p className='text-sm text-slate-600 mb-8 relative z-10'>
          Mohon maaf <strong>[Nama Pekurban]</strong>.
          <span
            contentEditable={isEditor}
            suppressContentEditableWarning
            onBlur={(e) =>
              isEditor &&
              onTextChange(
                'email_kurban_intro_DITOLAK',
                e.currentTarget.textContent,
              )
            }
            className={`mt-2 ${editableClass}`}>
            {form['email_kurban_intro_DITOLAK'] ||
              'Pendaftaran Kurban Anda tidak dapat dilanjutkan saat ini karena kendala pada verifikasi dana.'}
          </span>
        </p>

        <div className='bg-red-50 border-l-4 border-red-500 p-5 rounded-r-2xl mb-8 text-left relative z-10'>
          <p className='text-[10px] font-bold text-red-800 uppercase tracking-widest mb-1.5'>
            Catatan Panitia:
          </p>
          <p className='text-sm text-red-600 italic font-medium'>
            [Alasan tolak dari admin muncul di sini...]
          </p>
        </div>

        <div className='bg-teal-50 border border-teal-100 p-5 rounded-2xl text-center relative z-10 mb-8'>
          <span
            contentEditable={isEditor}
            suppressContentEditableWarning
            onBlur={(e) =>
              isEditor &&
              onTextChange(
                'email_kurban_msg_hubungi_DITOLAK',
                e.currentTarget.textContent,
              )
            }
            className={`text-xs font-bold text-teal-800 leading-relaxed inline-block ${editableClass}`}>
            {form['email_kurban_msg_hubungi_DITOLAK'] ||
              'Silahkan hubungi admin melalui WhatsApp untuk mengirimkan ulang bukti transfer atau konfirmasi manual.'}
          </span>
        </div>

        {/* --- TOMBOL KONFIRMASI (NEW) --- */}
        <div className='relative z-10'>
          {isEditor ? (
            <div className='flex flex-col gap-3 p-4 bg-red-50/50 border border-dashed border-red-300 rounded-2xl text-left'>
              <div>
                <label className='text-[10px] font-bold text-red-800 uppercase tracking-widest mb-1.5 block'>
                  Teks Tombol
                </label>
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    onTextChange(
                      'email_kurban_btn_text_DITOLAK',
                      e.currentTarget.textContent,
                    )
                  }
                  className={`block w-full bg-white border border-red-200 rounded-xl p-3 text-sm font-bold text-red-700 outline-none focus:ring-2 focus:ring-red-500 transition-all cursor-text`}>
                  {form['email_kurban_btn_text_DITOLAK'] ||
                    'Konfirmasi via WhatsApp'}
                </span>
              </div>
              <div>
                <label className='text-[10px] font-bold text-red-800 uppercase tracking-widest mb-1.5 block'>
                  Link Tujuan (URL)
                </label>
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    onTextChange(
                      'email_kurban_btn_link_DITOLAK',
                      e.currentTarget.textContent,
                    )
                  }
                  className={`block w-full bg-white border border-red-200 rounded-xl p-3 text-xs font-mono text-slate-600 outline-none focus:ring-2 focus:ring-red-500 transition-all cursor-text break-all`}>
                  {form['email_kurban_btn_link_DITOLAK'] ||
                    'https://wa.me/6281234567890'}
                </span>
              </div>
            </div>
          ) : (
            <a
              href={
                form['email_kurban_btn_link_DITOLAK'] ||
                'https://wa.me/6281234567890'
              }
              target='_blank'
              rel='noopener noreferrer'
              className='block w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 text-sm text-center'>
              {form['email_kurban_btn_text_DITOLAK'] ||
                'Konfirmasi via WhatsApp'}
            </a>
          )}
        </div>
      </div>
    </div>
  );

  // DESAIN BARU 6: LAPORAN SELESAI PENYEMBELIHAN (Emerald & Clean)
  const renderSelesai = () => (
    <div className='bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 font-sans max-w-[600px] mx-auto relative'>
      <div className='p-8 flex items-center justify-between border-b-4 border-emerald-500 bg-white relative z-10'>
        <div className='relative group/logo w-32 h-12 flex items-center justify-center bg-slate-50 rounded-lg border border-dashed border-gray-200 overflow-hidden'>
          {form.email_kurban_logo_url ? (
            <img
              src={form.email_kurban_logo_url}
              className='max-h-full max-w-full object-contain'
            />
          ) : (
            <b className='text-emerald-700 text-2xl'>MNI</b>
          )}
        </div>
        <div className='text-right'>
          <h3 className='text-[11px] font-black tracking-widest text-slate-500 uppercase mb-0.5'>
            Laporan Eksekusi
          </h3>
          <p className='text-[10px] font-bold text-slate-400'>
            Masjid Nurul Iman
          </p>
        </div>
      </div>

      <div className='p-8 md:p-10 relative'>
        <div className='text-center mb-8'>
          <h2 className='text-2xl font-black text-slate-800'>
            <span
              contentEditable={isEditor}
              suppressContentEditableWarning
              onBlur={(e) =>
                isEditor &&
                onTextChange(
                  'email_kurban_judul_SELESAI',
                  e.currentTarget.textContent,
                )
              }
              className={editableClass}>
              {form['email_kurban_judul_SELESAI'] || 'Kurban Telah Disembelih'}
            </span>
          </h2>
        </div>

        <p className='text-sm text-slate-600 mb-8 leading-relaxed'>
          Alhamdulillah, <strong>[Nama Pekurban]</strong>. <br />
          <span
            contentEditable={isEditor}
            suppressContentEditableWarning
            onBlur={(e) =>
              isEditor &&
              onTextChange(
                'email_kurban_intro_SELESAI',
                e.currentTarget.textContent,
              )
            }
            className={`mt-2 ${editableClass}`}>
            {form['email_kurban_intro_SELESAI'] ||
              'Kami menginformasikan bahwa hewan kurban Anda telah selesai kami sembelih dengan tata cara yang sesuai Syariat Islam.'}
          </span>
        </p>

        <div className='bg-slate-50 rounded-xl p-5 mb-8 border border-slate-100'>
          <table className='w-full text-sm border-collapse'>
            <tbody>
              <tr>
                <td className='py-2 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-dashed border-slate-300'>
                  Reference
                </td>
                <td className='py-2 font-black text-right text-slate-800 border-b border-dashed border-slate-300'>
                  TRX-998877
                </td>
              </tr>
              <tr>
                <td className='py-2 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-dashed border-slate-300'>
                  Jenis Hewan
                </td>
                <td className='py-2 font-black text-right text-emerald-700 border-b border-dashed border-slate-300'>
                  Sapi Urunan Premium
                </td>
              </tr>
              <tr>
                <td className='py-2 text-slate-500 uppercase text-[10px] font-bold tracking-wider'>
                  Tgl Sembelih
                </td>
                <td className='py-2 font-black text-right text-slate-800'>
                  10 Dzulhijjah 1445 H
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className='text-[11px] font-bold text-slate-500 mb-3 uppercase tracking-wider'>
          Dokumentasi Penyembelihan:
        </p>
        <div className='bg-slate-100 p-3 rounded-xl text-center border border-slate-200 mb-8 h-40 flex items-center justify-center'>
          <ImageIcon className='w-10 h-10 text-slate-300' />
          <span className='text-xs font-bold text-slate-400 ml-2'>
            [Gambar Bukti Sembelih Muncul Disini]
          </span>
        </div>

        <div className='p-6 rounded-2xl border-2 border-dashed border-emerald-500 bg-emerald-50 text-center'>
          <p
            className='text-2xl font-bold text-emerald-800 leading-relaxed mb-3'
            dir='rtl'
            style={{ fontFamily: "'Amiri', 'Traditional Arabic', serif" }}>
            تَقَبَّلَ اللَّهُ مِنَّا وَمِنْكُمْ
          </p>
          <div
            contentEditable={isEditor}
            suppressContentEditableWarning
            onBlur={(e) =>
              isEditor &&
              onTextChange(
                'email_kurban_doa_SELESAI',
                e.currentTarget.textContent,
              )
            }
            className={`text-xs font-bold text-emerald-700 leading-relaxed ${editableClass}`}>
            {form['email_kurban_doa_SELESAI'] ||
              "Semoga Allah menerima ibadah kurban kita semua. Amin ya Rabbal 'Alamin."}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className='bg-slate-50 p-8 flex flex-col border-t border-slate-200'>
        <div className='flex justify-end mb-6'>
          <div className='flex flex-col items-end'>
            <span className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1'>
              Authenticated By
            </span>
            <span className='font-black text-slate-800 text-sm'>
              {form.email_kurban_ttd || 'PANITIA KURBAN MNI'}
            </span>
            <div className='relative w-20 h-20 mt-2'>
              {form.email_kurban_stempel_url ? (
                <img
                  src={form.email_kurban_stempel_url}
                  className='w-full h-full object-contain mix-blend-multiply opacity-80'
                />
              ) : (
                <div className='w-full h-full border-2 border-dashed border-slate-300 rounded-full flex items-center justify-center text-[10px] font-black text-slate-400 rotate-12'>
                  STAMP
                </div>
              )}
            </div>
          </div>
        </div>
        <div className='border-t border-slate-300 border-dashed pt-5 text-center'>
          <p className='text-[10px] text-slate-400 leading-relaxed font-medium'>
            Email laporan ini diterbitkan secara otomatis oleh Sistem Manajemen
            Kurban Masjid Nurul Iman LAN.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className='max-w-4xl mx-auto space-y-6'>
      {isEditor && (
        <div className='flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 gap-2 overflow-x-auto'>
          {[
            {
              id: 'LUNAS',
              label: 'Sertifikat',
              icon: CheckCircle,
              color: 'text-emerald-600',
            },
            {
              id: 'AWAL_BOOKING',
              label: 'Awal Booking',
              icon: ShoppingCart,
              color: 'text-amber-500',
            },
            {
              id: 'TAGIHAN',
              label: 'Tagihan Penuh',
              icon: BellRing,
              color: 'text-blue-600',
            },
            {
              id: 'MENUNGGU',
              label: 'Verifikasi Lunas',
              icon: Clock,
              color: 'text-amber-500',
            },
            {
              id: 'DITOLAK',
              label: 'Dibatalkan',
              icon: XCircle,
              color: 'text-red-500',
            },
            {
              id: 'SELESAI',
              label: 'Laporan Selesai',
              icon: CheckSquare,
              color: 'text-emerald-500',
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-slate-100 shadow-inner text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>
              <tab.icon className={`w-4 h-4 ${tab.color}`} /> {tab.label}
            </button>
          ))}
        </div>
      )}
      <div className='bg-slate-200 p-4 md:p-12 rounded-[3rem] shadow-inner'>
        <AnimatePresence mode='wait'>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}>
            {activeTab === 'LUNAS' && renderLunas()}
            {activeTab === 'AWAL_BOOKING' && renderAwalBooking()}
            {activeTab === 'TAGIHAN' && renderTagihan()}
            {activeTab === 'MENUNGGU' && renderMenunggu()}
            {activeTab === 'DITOLAK' && renderDitolak()}
            {activeTab === 'SELESAI' && renderSelesai()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
