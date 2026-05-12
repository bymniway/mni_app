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
  Info,
} from 'lucide-react';

export default function LiveEmailEditorZiswaf({
  form,
  isEditor = false,
  onTextChange,
  onImageUpload,
}: any) {
  const [activeTab, setActiveTab] = useState('DITERIMA');

  const editableClass = isEditor
    ? 'cursor-text hover:ring-2 hover:ring-teal-500/30 focus:ring-2 focus:ring-teal-500 focus:bg-white/90 rounded px-2 py-1 outline-none transition-all duration-200 block w-full'
    : 'block w-full';

  // DESAIN 1: DITERIMA (Kwitansi Formal)
  const renderDiterima = () => (
    <div className='bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 font-sans max-w-[600px] mx-auto'>
      <div className='p-8 flex items-center justify-between border-b-4 border-teal-600'>
        <div className='relative group/logo w-32 h-12 flex items-center justify-center bg-slate-50 rounded-lg border border-dashed border-gray-200 overflow-hidden'>
          {form.email_ziswaf_logo_url ? (
            <img
              src={form.email_ziswaf_logo_url}
              alt='Logo'
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
                onChange={(e) => onImageUpload('LOGO', e)}
              />
              <ImageIcon className='w-5 h-5 text-white' />
            </label>
          )}
        </div>
        <div className='text-right'>
          {/* Teks OFFICIAL INVOICE lebih gelap */}
          <h3 className='text-[11px] font-black tracking-widest text-slate-500 uppercase mb-0.5'>
            Official Invoice
          </h3>
          <p className='text-[10px] font-bold text-slate-400'>
            Masjid Nurul Iman LAN
          </p>
        </div>
      </div>
      <div className='p-8 md:p-10'>
        <h2 className='text-2xl font-black text-slate-800 mb-6'>
          <span
            contentEditable={isEditor}
            suppressContentEditableWarning
            onBlur={(e) =>
              isEditor &&
              onTextChange(
                'email_ziswaf_judul_DITERIMA',
                e.currentTarget.textContent,
              )
            }
            className={editableClass}>
            {form['email_ziswaf_judul_DITERIMA'] ||
              'Kwitansi Penyaluran ZISWAF'}
          </span>
        </h2>
        <p className='text-sm text-slate-600 mb-8'>
          Jazakumullah Khairan Katsiran, <strong>[Nama Donatur]</strong>.
          <span
            contentEditable={isEditor}
            suppressContentEditableWarning
            onBlur={(e) =>
              isEditor &&
              onTextChange(
                'email_ziswaf_intro_DITERIMA',
                e.currentTarget.textContent,
              )
            }
            className={`mt-2 ${editableClass}`}>
            {form['email_ziswaf_intro_DITERIMA'] ||
              'Kami telah menerima dan mengesahkan titipan dana Anda dengan rincian sebagai berikut:'}
          </span>
        </p>
        <table className='w-full text-sm mb-10 border-collapse'>
          <tbody>
            <tr className='border-b border-slate-100'>
              <td className='py-3 text-slate-400 uppercase text-[10px] font-bold'>
                Tgl Transaksi
              </td>
              <td className='py-3 font-black text-right text-slate-800'>
                12 Ramadhan 1445 H
              </td>
            </tr>
            <tr className='border-b border-slate-100'>
              <td className='py-3 text-slate-400 uppercase text-[10px] font-bold'>
                Nama Donatur
              </td>
              <td className='py-3 font-black text-right text-slate-800'>
                Budi Santoso
              </td>
            </tr>
            <tr className='border-b border-slate-100'>
              <td className='py-3 text-slate-400 uppercase text-[10px] font-bold'>
                Reference
              </td>
              <td className='py-3 font-black text-right text-slate-800'>
                ZIS-123456
              </td>
            </tr>
            <tr className='border-b border-slate-100'>
              <td className='py-3 text-slate-400 uppercase text-[10px] font-bold'>
                Kategori
              </td>
              <td className='py-3 font-black text-right text-teal-600'>
                Zakat Maal
              </td>
            </tr>
            <tr className='bg-emerald-50'>
              <td className='py-5 px-4 font-black text-slate-800 rounded-l-xl'>
                Nominal
              </td>
              <td className='py-5 px-4 font-black text-right text-lg text-teal-600 rounded-r-xl'>
                Rp 1.000.000
              </td>
            </tr>
          </tbody>
        </table>
        <div className='p-6 rounded-2xl border-2 border-dashed border-emerald-500 bg-emerald-50 text-center'>
          {/* Teks Arab Diperkecil menjadi text-xl agar lebih kalem */}
          <div
            contentEditable={isEditor}
            suppressContentEditableWarning
            dir='rtl'
            onBlur={(e) =>
              isEditor &&
              onTextChange(
                'email_ziswaf_msg_utama_DITERIMA',
                e.currentTarget.textContent,
              )
            }
            className={`text-xl font-bold text-teal-800 leading-relaxed font-arabic ${editableClass}`}>
            {form['email_ziswaf_msg_utama_DITERIMA'] ||
              'آجَرَكَ اللَّهُ فِيمَا أَعْطَيْتَ...'}
          </div>
          <div
            contentEditable={isEditor}
            suppressContentEditableWarning
            onBlur={(e) =>
              isEditor &&
              onTextChange(
                'email_ziswaf_msg_sub_DITERIMA',
                e.currentTarget.textContent,
              )
            }
            className={`text-xs font-medium text-teal-700 mt-2 ${editableClass}`}>
            {form['email_ziswaf_msg_sub_DITERIMA'] ||
              '"Semoga Allah memberikan pahala kepadamu pada apa yang engkau berikan..."'}
          </div>
        </div>
      </div>

      {/* FOOTER BARU: Tanda Tangan di atas, Garis Putus, Teks E-Invoice Centered */}
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
                onTextChange('email_ziswaf_ttd', e.currentTarget.textContent)
              }
              className={`font-black text-slate-800 text-sm ${editableClass}`}>
              {form.email_ziswaf_ttd || 'PANITIA ZISWAF MNI'}
            </span>
            <div className='relative w-24 h-24 mt-2 group/stempel'>
              {form.email_ziswaf_stempel_url ? (
                <img
                  src={form.email_ziswaf_stempel_url}
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
                    onChange={(e) => onImageUpload('STEMPEL', e)}
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

  // DESAIN 2: MENUNGGU
  const renderMenunggu = () => (
    <div className='bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 font-sans max-w-[500px] mx-auto'>
      <div className='bg-amber-400 p-8 text-center text-amber-900'>
        <Clock className='w-16 h-16 mx-auto mb-4 opacity-80' />
        <h2 className='text-2xl font-black'>
          <span
            contentEditable={isEditor}
            suppressContentEditableWarning
            onBlur={(e) =>
              isEditor &&
              onTextChange(
                'email_ziswaf_judul_MENUNGGU',
                e.currentTarget.textContent,
              )
            }
            className={editableClass}>
            {form['email_ziswaf_judul_MENUNGGU'] || 'Menunggu Verifikasi'}
          </span>
        </h2>
      </div>
      <div className='p-8 text-center'>
        <p className='text-sm text-slate-600 mb-6'>
          Assalamu'alaikum <strong>[Nama Donatur]</strong>.
          <span
            contentEditable={isEditor}
            suppressContentEditableWarning
            onBlur={(e) =>
              isEditor &&
              onTextChange(
                'email_ziswaf_intro_MENUNGGU',
                e.currentTarget.textContent,
              )
            }
            className={`mt-2 ${editableClass}`}>
            {form['email_ziswaf_intro_MENUNGGU'] ||
              'Data penyaluran ZISWAF Anda telah masuk ke sistem kami dan saat ini sedang menunggu antrean verifikasi manual oleh admin.'}
          </span>
        </p>
        <div className='bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6'>
          <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1'>
            Nominal Transaksi
          </p>
          <p className='text-xl font-black text-slate-800'>Rp 1.000.000</p>
          <p className='text-xs text-slate-500 mt-1'>ZIS-123456</p>
        </div>
        <div className='flex items-start gap-3 bg-blue-50 text-blue-800 p-4 rounded-xl text-left'>
          <Info className='w-5 h-5 shrink-0 mt-0.5' />
          <span
            contentEditable={isEditor}
            suppressContentEditableWarning
            onBlur={(e) =>
              isEditor &&
              onTextChange(
                'email_ziswaf_msg_utama_MENUNGGU',
                e.currentTarget.textContent,
              )
            }
            className={`text-xs ${editableClass}`}>
            {form['email_ziswaf_msg_utama_MENUNGGU'] ||
              'Mohon kesediaannya menunggu maksimal 1x24 jam. Kwitansi resmi akan otomatis dikirimkan ke email ini setelah dana terkonfirmasi masuk ke mutasi rekening masjid.'}
          </span>
        </div>
      </div>
    </div>
  );

  // DESAIN 3: DITOLAK
  const renderDitolak = () => (
    <div className='bg-white rounded-2xl shadow-2xl overflow-hidden border border-red-200 font-sans max-w-[500px] mx-auto'>
      <div className='bg-red-50 p-8 text-center border-b border-red-100'>
        <AlertTriangle className='w-16 h-16 text-red-500 mx-auto mb-4' />
        <h2 className='text-2xl font-black text-red-700'>
          <span
            contentEditable={isEditor}
            suppressContentEditableWarning
            onBlur={(e) =>
              isEditor &&
              onTextChange(
                'email_ziswaf_judul_DITOLAK',
                e.currentTarget.textContent,
              )
            }
            className={editableClass}>
            {form['email_ziswaf_judul_DITOLAK'] || 'Verifikasi Tertunda'}
          </span>
        </h2>
      </div>
      <div className='p-8'>
        <p className='text-sm text-slate-600 mb-6 text-center'>
          Mohon maaf <strong>[Nama Donatur]</strong>.
          <span
            contentEditable={isEditor}
            suppressContentEditableWarning
            onBlur={(e) =>
              isEditor &&
              onTextChange(
                'email_ziswaf_intro_DITOLAK',
                e.currentTarget.textContent,
              )
            }
            className={`mt-2 ${editableClass}`}>
            {form['email_ziswaf_intro_DITOLAK'] ||
              'Kami mengalami kendala saat memverifikasi transaksi Anda.'}
          </span>
        </p>
        <div className='bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl mb-6'>
          <p className='text-xs font-bold text-red-800 mb-1'>Catatan Admin:</p>
          <p className='text-sm text-red-600 italic'>
            [Alasan tolak akan muncul di sini...]
          </p>
        </div>
        <div className='text-center'>
          <span
            contentEditable={isEditor}
            suppressContentEditableWarning
            onBlur={(e) =>
              isEditor &&
              onTextChange(
                'email_ziswaf_msg_hubungi_DITOLAK',
                e.currentTarget.textContent,
              )
            }
            className={`text-xs font-bold text-teal-700 bg-teal-50 px-3 py-2 rounded-lg border border-teal-100 ${editableClass}`}>
            {form['email_ziswaf_msg_hubungi_DITOLAK'] ||
              'Silahkan hubungi admin melalui WhatsApp di 0812-xxx-xxx untuk konfirmasi.'}
          </span>
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
              id: 'DITERIMA',
              label: 'Kwitansi Sah',
              icon: CheckCircle,
              color: 'text-emerald-600',
            },
            {
              id: 'MENUNGGU',
              label: 'Pemberitahuan',
              icon: Clock,
              color: 'text-amber-500',
            },
            {
              id: 'DITOLAK',
              label: 'Peringatan',
              icon: XCircle,
              color: 'text-red-500',
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
            {activeTab === 'DITERIMA' && renderDiterima()}
            {activeTab === 'MENUNGGU' && renderMenunggu()}
            {activeTab === 'DITOLAK' && renderDitolak()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
