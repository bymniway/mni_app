'use client';

import { useState } from 'react';
import { tambahAdminAction } from './actions';
import { UserPlus, X } from 'lucide-react';

export default function TombolTambahAdmin() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const formData = new FormData(e.currentTarget);
    const result = await tambahAdminAction(formData);

    if (result.error) {
      setErrorMsg(result.error);
    } else {
      setIsOpen(false); // Tutup modal jika sukses
    }
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className='bg-mni-primary hover:bg-mni-primary/90 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center space-x-2'>
        <UserPlus className='w-5 h-5' />
        <span>Tambah Admin</span>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className='fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-center p-4'>
          <div className='bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200'>
            <div className='flex justify-between items-center p-5 border-b border-gray-100'>
              <h3 className='text-lg font-bold text-gray-900'>
                Tambah Admin Baru
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className='text-gray-400 hover:text-gray-600'>
                <X className='w-5 h-5' />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className='p-5 space-y-4'>
              {errorMsg && (
                <div className='bg-red-50 text-red-600 p-3 rounded-lg text-sm'>
                  {errorMsg}
                </div>
              )}

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Nama Lengkap
                </label>
                <input
                  type='text'
                  name='nama'
                  required
                  className='w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-mni-primary focus:border-mni-primary outline-none transition-all'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Email
                </label>
                <input
                  type='email'
                  name='email'
                  required
                  className='w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-mni-primary focus:border-mni-primary outline-none transition-all'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Password Sementara
                </label>
                <input
                  type='text'
                  name='password'
                  required
                  minLength={6}
                  className='w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-mni-primary focus:border-mni-primary outline-none transition-all'
                />
                <p className='text-xs text-gray-500 mt-1'>
                  Minimal 6 karakter.
                </p>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Role / Kasta
                </label>
                <select
                  name='is_root'
                  className='w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-mni-primary outline-none bg-white'>
                  <option value='false'>Admin Biasa</option>
                  <option value='true'>Root (Super Admin)</option>
                </select>
              </div>

              <div className='pt-4 flex space-x-3'>
                <button
                  type='button'
                  onClick={() => setIsOpen(false)}
                  className='flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-medium hover:bg-gray-200 transition-colors'>
                  Batal
                </button>
                <button
                  type='submit'
                  disabled={loading}
                  className='flex-1 bg-mni-primary text-white py-2.5 rounded-xl font-medium hover:bg-mni-primary/90 transition-colors disabled:opacity-70'>
                  {loading ? 'Menyimpan...' : 'Simpan Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
