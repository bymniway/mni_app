'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  updateAdminAction,
  hapusAdminAction,
  resetPasswordAdminAction,
} from './actions';
import {
  Pencil,
  Trash2,
  X,
  Lock,
  AlertTriangle,
  Key,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { DAFTAR_HALAMAN_CMS } from './config';

export default function AksiAdmin({ admin }: { admin: any }) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<{
    error?: string;
    success?: string;
  }>({});

  const [selectedPaths, setSelectedPaths] = useState<string[]>(
    admin.akses_halaman || [],
  );
  const [isRootSelected, setIsRootSelected] = useState<boolean>(admin.is_root);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const EMAIL_KEBAL = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
  const isSuperAdmin = admin.email === EMAIL_KEBAL;

  const togglePath = (path: string) => {
    setSelectedPaths((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path],
    );
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.append('akses_halaman', JSON.stringify(selectedPaths));
    await updateAdminAction(admin.id, formData);
    setIsEditOpen(false);
    setLoading(false);
  };

  const handleHapus = async () => {
    setLoading(true);
    await hapusAdminAction(admin.id);
    setIsDeleteOpen(false);
    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordStatus({});
    const formData = new FormData(e.currentTarget);
    const result = await resetPasswordAdminAction(admin.id, formData);

    if (result.error) {
      setPasswordStatus({ error: result.error });
    } else {
      setPasswordStatus({ success: 'Sandi berhasil diperbarui.' });
      setTimeout(() => {
        setIsPasswordOpen(false);
        setPasswordStatus({});
      }, 1500);
    }
    setPasswordLoading(false);
  };

  // ==========================================
  // MODAL HAPUS SATUAN (Desain Baru + Detail Lengkap)
  // ==========================================
  const ModalHapus = () => (
    <div className='fixed inset-0 z-[100] bg-zinc-950/40 backdrop-blur-sm flex justify-center items-center p-4 text-left'>
      <div className='bg-white rounded-[2rem] w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200'>
        <div className='p-6 sm:p-8 text-center'>
          <div className='w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-5'>
            <AlertTriangle className='w-6 h-6' />
          </div>

          <h3 className='text-lg sm:text-xl font-semibold text-zinc-900 mb-2'>
            Musnahkan Admin?
          </h3>
          <p className='text-sm text-zinc-500 mb-5 leading-relaxed'>
            Tindakan ini tidak dapat dibatalkan. Berikut adalah detail KTP admin
            yang akan dihapus:
          </p>

          {/* Kotak Rincian Data Admin */}
          <div className='bg-zinc-50 text-left p-4 rounded-2xl border border-zinc-100 mb-6 space-y-3'>
            <div>
              <div className='text-[10px] font-bold text-zinc-400 uppercase tracking-widest'>
                Email
              </div>
              <div className='text-sm font-semibold text-zinc-900 break-all'>
                {admin.email}
              </div>
            </div>
            <div>
              <div className='text-[10px] font-bold text-zinc-400 uppercase tracking-widest'>
                Role
              </div>
              <div
                className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[11px] font-bold tracking-wide border ${admin.is_root ? 'bg-zinc-800 text-zinc-300 border-zinc-700' : 'bg-white text-zinc-700 border-zinc-200'}`}>
                {admin.is_root ? 'ROOT DEWA' : 'ADMIN BIASA'}
              </div>
            </div>
            <div>
              <div className='text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5'>
                Akses Halaman
              </div>
              <div className='flex flex-wrap gap-1.5'>
                {admin.is_root ? (
                  <span className='text-xs text-zinc-500 italic font-medium'>
                    ✨ Seluruh Fitur CMS
                  </span>
                ) : admin.akses_halaman?.length > 0 ? (
                  admin.akses_halaman.map((path: string) => (
                    <span
                      key={path}
                      className='bg-white border border-zinc-200 text-zinc-600 px-2 py-1 rounded shadow-sm text-[10px] font-medium'>
                      {path.replace('/cms/', '')}
                    </span>
                  ))
                ) : (
                  <span className='text-[10px] text-red-500 italic font-medium'>
                    Tidak ada akses
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className='flex space-x-3'>
            <button
              onClick={() => setIsDeleteOpen(false)}
              disabled={loading}
              className='flex-1 bg-white border border-zinc-200 text-zinc-700 py-2.5 sm:py-3 rounded-xl text-sm font-semibold hover:bg-zinc-50 transition-colors disabled:opacity-50'>
              Batal
            </button>
            <button
              onClick={handleHapus}
              disabled={loading}
              className='flex-1 bg-red-600 text-white py-2.5 sm:py-3 rounded-xl text-sm font-semibold hover:bg-red-700 transition-all disabled:opacity-50 shadow-sm shadow-red-600/20'>
              {loading ? 'Menghapus...' : 'Hapus Permanen'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const ModalPassword = () => (
    <div className='fixed inset-0 z-[100] bg-zinc-950/40 backdrop-blur-sm flex justify-center items-center p-4 text-left'>
      <div className='bg-white rounded-[2rem] w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200'>
        <div className='flex justify-between items-center px-6 py-5 border-b border-zinc-100'>
          <div className='flex items-center space-x-2'>
            <Key className='w-5 h-5 text-zinc-800' />
            <h3 className='text-base font-semibold text-zinc-900'>
              Ubah Sandi
            </h3>
          </div>
          <button
            onClick={() => setIsPasswordOpen(false)}
            className='p-1.5 hover:bg-zinc-100 rounded-full transition-colors'>
            <X className='w-5 h-5 text-zinc-400' />
          </button>
        </div>
        <form
          onSubmit={handleResetPassword}
          className='p-6'>
          <p className='text-sm text-zinc-500 mb-5 leading-relaxed'>
            Sandi baru untuk{' '}
            <span className='font-medium text-zinc-800'>{admin.email}</span>{' '}
            (Min. 6 karakter).
          </p>
          {passwordStatus.error && (
            <div className='mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg font-medium'>
              {passwordStatus.error}
            </div>
          )}
          {passwordStatus.success && (
            <div className='mb-4 p-3 bg-green-50 text-green-700 text-xs rounded-lg font-medium flex items-center'>
              <CheckCircle2 className='w-4 h-4 mr-1.5' />{' '}
              {passwordStatus.success}
            </div>
          )}
          <div className='mb-6'>
            <input
              type='password'
              name='password'
              required
              minLength={6}
              placeholder='••••••••'
              className='w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all'
            />
          </div>
          <button
            type='submit'
            disabled={passwordLoading}
            className='w-full bg-zinc-900 text-white py-3 rounded-xl text-sm font-semibold hover:bg-zinc-800 transition-all disabled:opacity-50'>
            {passwordLoading ? 'Menyimpan...' : 'Simpan Sandi'}
          </button>
        </form>
      </div>
    </div>
  );

  const ModalEdit = () => (
    <div className='fixed inset-0 z-[100] bg-zinc-950/40 backdrop-blur-sm flex justify-center items-center p-4 text-left'>
      <div className='bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200'>
        <div className='flex justify-between items-center px-6 py-5 border-b border-zinc-100'>
          <h3 className='text-base font-semibold text-zinc-900'>
            Edit Akses Admin
          </h3>
          <button
            onClick={() => setIsEditOpen(false)}
            className='p-1.5 hover:bg-zinc-100 rounded-full transition-colors'>
            <X className='w-5 h-5 text-zinc-400' />
          </button>
        </div>
        <form
          onSubmit={handleUpdate}
          className='p-6 space-y-5'>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div>
              <label className='text-[11px] font-semibold text-zinc-500 uppercase tracking-wider'>
                Nama Lengkap
              </label>
              <input
                type='text'
                name='nama'
                defaultValue={admin.nama_lengkap}
                required
                className='w-full mt-1 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm text-zinc-900 outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all'
              />
            </div>
            <div>
              <label className='text-[11px] font-semibold text-zinc-500 uppercase tracking-wider'>
                Role
              </label>
              {isSuperAdmin && (
                <input
                  type='hidden'
                  name='is_root'
                  value='true'
                />
              )}
              <select
                name='is_root'
                value={isRootSelected.toString()}
                onChange={(e) => setIsRootSelected(e.target.value === 'true')}
                disabled={isSuperAdmin}
                className={`w-full mt-1 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all ${isSuperAdmin ? 'bg-zinc-50 text-zinc-400 cursor-not-allowed' : 'bg-white text-zinc-900'}`}>
                <option value='false'>Admin Biasa</option>
                <option value='true'>Root (Dewa)</option>
              </select>
            </div>
          </div>

          {isRootSelected ? (
            <div className='bg-zinc-900 p-5 rounded-2xl flex items-center space-x-4'>
              <div className='bg-zinc-800 p-3 rounded-xl border border-zinc-700'>
                <ShieldCheck className='w-6 h-6 text-zinc-100' />
              </div>
              <div>
                <h4 className='text-sm font-semibold text-white'>
                  Akses Tak Terbatas
                </h4>
                <p className='text-xs text-zinc-400 mt-1 leading-relaxed'>
                  Akun ini memiliki kunci master untuk seluruh sistem.
                </p>
              </div>
            </div>
          ) : (
            <div className='bg-zinc-50 p-5 rounded-2xl border border-zinc-100'>
              <div className='flex items-center space-x-2 mb-3'>
                <Lock className='w-4 h-4 text-zinc-700' />
                <label className='text-xs font-semibold text-zinc-800'>
                  Hak Akses Halaman
                </label>
              </div>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2 no-scrollbar'>
                {DAFTAR_HALAMAN_CMS.map((item) => (
                  <label
                    key={item.path}
                    className={`flex items-center p-3 rounded-xl border transition-all cursor-pointer ${selectedPaths.includes(item.path) ? 'bg-white border-zinc-900 shadow-sm' : 'bg-transparent border-zinc-200 opacity-70 hover:opacity-100'}`}>
                    <input
                      type='checkbox'
                      checked={selectedPaths.includes(item.path)}
                      onChange={() => togglePath(item.path)}
                      className='w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900'
                    />
                    <span className='ml-3 text-xs font-medium text-zinc-800'>
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className='flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-3 pt-2'>
            <div className='w-full sm:flex-1'>
              <label className='text-[11px] font-semibold text-zinc-500 uppercase tracking-wider'>
                Status
              </label>
              {isSuperAdmin && (
                <input
                  type='hidden'
                  name='is_active'
                  value='true'
                />
              )}
              <select
                name='is_active'
                defaultValue={admin.is_active.toString()}
                disabled={isSuperAdmin}
                className={`w-full mt-1 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all ${isSuperAdmin ? 'bg-zinc-50 text-zinc-400 cursor-not-allowed' : 'bg-white text-zinc-900'}`}>
                <option value='true'>Aktif</option>
                <option value='false'>Nonaktif</option>
              </select>
            </div>
            <div className='w-full sm:flex-[1.5] sm:pt-6'>
              <button
                type='submit'
                disabled={loading}
                className='w-full bg-zinc-900 text-white py-3 rounded-xl text-sm font-semibold hover:bg-zinc-800 transition-all disabled:opacity-50'>
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className='flex justify-end space-x-1 sm:space-x-2'>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsPasswordOpen(true);
        }}
        className='p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors'
        title='Ubah Password'>
        <Key className='w-[18px] h-[18px]' />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsEditOpen(true);
        }}
        className='p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors'
        title='Edit Admin'>
        <Pencil className='w-[18px] h-[18px]' />
      </button>
      {!isSuperAdmin && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsDeleteOpen(true);
          }}
          className='p-2 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors'
          title='Hapus Admin'>
          <Trash2 className='w-[18px] h-[18px]' />
        </button>
      )}

      {mounted && isDeleteOpen && createPortal(<ModalHapus />, document.body)}
      {mounted &&
        isPasswordOpen &&
        createPortal(<ModalPassword />, document.body)}
      {mounted && isEditOpen && createPortal(<ModalEdit />, document.body)}
    </div>
  );
}
