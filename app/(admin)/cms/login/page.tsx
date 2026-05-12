'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr'; // <-- Ini yang benar sekarang
import { Lock, Mail, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';

export default function LoginAdmin() {
  const router = useRouter();

  // Inisialisasi Supabase menggunakan SSR Client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      // Berhasil login
      window.location.href = '/cms';
    } catch (err: any) {
      setError('Email atau password salah, atau akun Anda tidak aktif.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4'>
      <div className='max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden'>
        <div className='bg-gray-900 p-8 text-center'>
          <ShieldCheck className='w-16 h-16 text-green-400 mx-auto mb-4' />
          <h2 className='text-2xl font-bold text-white'>Portal Admin MNI</h2>
          <p className='text-gray-400 text-sm mt-2'>
            Masukkan kredensial untuk mengakses sistem
          </p>
        </div>

        <div className='p-8'>
          {error && (
            <div className='mb-6 bg-red-50 border border-red-200 text-red-600 text-sm p-4 rounded-xl flex items-start'>
              <AlertCircle className='w-5 h-5 mr-2 shrink-0 mt-0.5' />
              <span>{error}</span>
            </div>
          )}

          <form
            onSubmit={handleLogin}
            className='space-y-5'>
            <div>
              <label className='block text-sm font-bold text-gray-700 mb-1.5'>
                Email Alias
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Mail className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='pl-10 w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all outline-none'
                  placeholder='admin@mni.internal'
                  required
                />
              </div>
            </div>

            <div>
              <label className='block text-sm font-bold text-gray-700 mb-1.5'>
                Password
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Lock className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  type='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='pl-10 w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all outline-none'
                  placeholder='••••••••'
                  required
                />
              </div>
            </div>

            <button
              type='submit'
              disabled={isLoading}
              className='w-full bg-gray-900 text-white rounded-xl px-4 py-3.5 text-sm font-bold hover:bg-gray-800 transition-colors flex items-center justify-center disabled:opacity-70'>
              {isLoading ? (
                <>
                  <Loader2 className='w-5 h-5 animate-spin mr-2' />{' '}
                  Memverifikasi...
                </>
              ) : (
                'Masuk ke Sistem'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
