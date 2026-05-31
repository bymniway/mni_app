'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion';
import {
  Lock,
  Mail,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowRight,
  Fingerprint,
  Clock,
} from 'lucide-react';

const ScrambleText = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = useState('');
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+<>{}[]~';

  useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText((prev) =>
        text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (index < iteration) return text[index];
            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join(''),
      );
      if (iteration >= text.length) clearInterval(interval);
      iteration += 1 / 3;
    }, 40);
    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayText}</span>;
};

const SmartMascot = ({
  focusedField,
  inputLength,
  isClosed,
}: {
  focusedField: 'email' | 'password' | 'none';
  inputLength: number;
  isClosed: boolean;
}) => {
  const mascotRef = useRef<HTMLDivElement>(null);
  const [pupil, setPupil] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (focusedField !== 'none') {
      const startX = -10;
      let calcX = startX + inputLength * 0.7;
      calcX = Math.min(Math.max(calcX, -10), 10);

      const calcY = focusedField === 'email' ? 6 : 10;

      setPupil({ x: calcX, y: calcY });
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!mascotRef.current) return;

      const rect = mascotRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;

      const angle = Math.atan2(deltaY, deltaX);
      const distance = Math.min(Math.hypot(deltaX, deltaY) / 15, 10);

      setPupil({
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [focusedField, inputLength]);

  return (
    <div
      ref={mascotRef}
      className='w-24 h-12 mx-auto bg-slate-900 rounded-full flex items-center justify-center gap-2.5 shadow-[inset_0_4px_10px_rgba(0,0,0,0.6)] mb-8 border border-slate-700/50 relative'>
      <EyeBall
        isClosed={isClosed}
        x={pupil.x}
        y={pupil.y}
      />
      <EyeBall
        isClosed={isClosed}
        x={pupil.x}
        y={pupil.y}
      />
    </div>
  );
};

const EyeBall = ({
  isClosed,
  x,
  y,
}: {
  isClosed: boolean;
  x: number;
  y: number;
}) => {
  return (
    <div className='w-[26px] h-[26px] bg-white rounded-full relative overflow-hidden flex items-center justify-center shadow-sm'>
      <motion.div
        animate={{ x, y }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className='w-3.5 h-3.5 bg-slate-900 rounded-full flex items-center justify-center relative'>
        <div className='w-1 h-1 bg-white rounded-full absolute top-0.5 right-0.5 opacity-80' />
      </motion.div>

      <motion.div
        initial={false}
        animate={{ top: isClosed ? '0%' : '-100%' }}
        transition={{ type: 'spring', stiffness: 250, damping: 25 }}
        className='absolute left-0 right-0 h-full bg-teal-500 shadow-[0_2px_5px_rgba(0,0,0,0.3)]'
      />
    </div>
  );
};

export default function LoginAdmin() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<
    'email' | 'password' | 'none'
  >('none');

  const [time, setTime] = useState<Date | null>(null);
  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    if (!time) return 'Selamat Datang';
    const hour = time.getHours();
    if (hour < 11) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 40, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 40, damping: 20 });
  const bgX1 = useTransform(springX, [0, 2000], [60, -60]);
  const bgY1 = useTransform(springY, [0, 1000], [60, -60]);
  const bgX2 = useTransform(springX, [0, 2000], [-80, 80]);
  const bgY2 = useTransform(springY, [0, 1000], [-80, 80]);

  const rightPanelRef = useRef<HTMLDivElement>(null);
  const [spotlightPos, setSpotlightPos] = useState({ x: -1000, y: -1000 });

  const handleGlobalMouseMove = (e: React.MouseEvent) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
    if (rightPanelRef.current) {
      const rect = rightPanelRef.current.getBoundingClientRect();
      setSpotlightPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

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

      setIsSuccess(true);
      setTimeout(() => {
        window.location.href = '/cms';
      }, 900);
    } catch (err: any) {
      setError('Akses Ditolak. Kredensial tidak diizinkan oleh sistem.');
      setIsLoading(false);
    }
  };

  const isClosed = focusedField === 'password' && !showPassword;
  const currentLength =
    focusedField === 'password' ? password.length : email.length;

  return (
    <div
      onMouseMove={handleGlobalMouseMove}
      className='h-[100dvh] w-full flex flex-col lg:flex-row overflow-hidden bg-slate-950 font-sans selection:bg-teal-500/30 selection:text-teal-200'>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 0 #02061700 inset !important;
          -webkit-text-fill-color: #f8fafc !important;
          transition: background-color 5000s ease-in-out 0s;
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `,
        }}
      />

      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ clipPath: 'circle(0% at 50% 50%)' }}
            animate={{ clipPath: 'circle(150% at 50% 50%)' }}
            transition={{ duration: 1, ease: [0.7, 0, 0.3, 1] }}
            className='fixed inset-0 bg-teal-900 z-[999] flex flex-col items-center justify-center'>
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className='flex flex-col items-center'>
              <Fingerprint
                className='w-24 h-24 text-teal-400 mb-6 animate-pulse'
                strokeWidth={1}
              />
              <h2 className='text-xl font-semibold text-white tracking-[0.2em] uppercase'>
                Akses Diberikan
              </h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className='group relative w-full lg:w-[45%] h-[40vh] lg:h-full overflow-hidden flex flex-col justify-center lg:justify-end p-6 sm:p-8 lg:p-16 border-b lg:border-r lg:border-b-0 border-slate-800/50 bg-slate-950'>
        {/* HOVERABLE BACKGROUND ICON (SHIELD) */}
        <ShieldCheck
          className='absolute -top-32 -right-32 lg:-top-48 lg:-right-48 w-[20rem] lg:w-[30rem] h-[20rem] lg:h-[30rem] text-teal-500 opacity-[0.02] group-hover:opacity-[0.06] group-hover:scale-105 group-hover:-rotate-12 transition-all duration-1000 ease-out pointer-events-none z-0'
          strokeWidth={0.5}
        />

        <motion.div
          style={{ x: bgX1, y: bgY1 }}
          className='absolute -top-32 -left-32 w-[40rem] h-[40rem] bg-teal-500/40 rounded-full mix-blend-screen filter blur-[90px]'
        />
        <motion.div
          style={{ x: bgX2, y: bgY2 }}
          className='absolute top-1/2 -right-32 w-[30rem] h-[30rem] bg-emerald-500/30 rounded-full mix-blend-screen filter blur-[90px]'
        />
        <div
          className='absolute inset-0 opacity-[0.05]'
          style={{
            backgroundImage:
              'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className='relative z-10 p-6 lg:p-10 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] lg:rounded-[2.5rem] shadow-2xl mx-auto lg:mx-0 max-w-lg lg:max-w-none w-full'>
          {time && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className='flex items-center gap-2 mb-6'>
              <div className='px-3 py-1.5 bg-teal-500/20 border border-teal-500/30 rounded-full flex items-center gap-2'>
                <Clock className='w-3.5 h-3.5 text-teal-400' />
                <span className='text-xs font-bold text-teal-200'>
                  {time.toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}{' '}
                  WIB
                </span>
              </div>
              <span className='text-xs font-bold text-slate-400'>
                {getGreeting()}
              </span>
            </motion.div>
          )}

          <h1 className='text-[26px] sm:text-3xl lg:text-5xl font-black text-white leading-[1.1] tracking-tight mb-3 lg:mb-4'>
            <ScrambleText text='Pusat Kendali' /> <br />
            <span className='text-teal-400'>
              <ScrambleText text='Operasional.' />
            </span>
          </h1>
          <p className='text-teal-100/60 text-xs sm:text-sm lg:text-[15px] font-medium leading-relaxed max-w-sm'>
            Ruang otorisasi eksklusif tempat teknologi dan ketulusan niat
            berpadu untuk melayani umat.
          </p>
        </div>
      </div>

      <div
        ref={rightPanelRef}
        className='w-full lg:w-[55%] h-[60vh] lg:h-full relative bg-slate-950 flex flex-col justify-center px-6 sm:px-16 lg:px-32 overflow-y-auto overflow-x-hidden hide-scrollbar'>
        <div
          className='absolute inset-0 pointer-events-none transition-opacity duration-200 hidden lg:block'
          style={{
            background: `radial-gradient(800px circle at ${spotlightPos.x}px ${spotlightPos.y}px, rgba(20, 184, 166, 0.25), transparent 45%)`,
          }}
        />

        <div className='w-full max-w-[400px] mx-auto relative z-10 py-8 lg:py-0'>
          <SmartMascot
            focusedField={focusedField}
            inputLength={currentLength}
            isClosed={isClosed}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className='mb-8 lg:mb-10 text-center'>
            <h2 className='text-2xl lg:text-3xl font-extrabold text-white tracking-tight mb-2'>
              Otentikasi Identitas
            </h2>
            <p className='text-slate-400 text-xs lg:text-sm font-medium'>
              Sistem dilindungi enkripsi end-to-end.
            </p>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className='mb-6 lg:mb-8 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs lg:text-sm font-medium p-4 rounded-2xl flex items-start backdrop-blur-md'>
              <AlertCircle className='w-5 h-5 mr-3 shrink-0 mt-0.5' />
              <span className='leading-relaxed'>{error}</span>
            </motion.div>
          )}

          <form
            onSubmit={handleLogin}
            className='space-y-5 lg:space-y-6'>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className='relative group'>
              <div className='absolute inset-y-0 left-0 flex items-center pointer-events-none transition-colors group-focus-within:text-teal-400 text-slate-500'>
                <Mail className='h-5 w-5' />
              </div>
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField('none')}
                className='w-full bg-transparent border-b-2 border-slate-800 pl-10 pr-4 py-3 text-[14px] font-normal text-white focus:border-teal-500 transition-all outline-none placeholder:text-slate-600'
                placeholder='admin@mni.internal'
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className='relative group pt-2'>
              <div className='absolute inset-y-0 left-0 flex items-center pointer-events-none transition-colors group-focus-within:text-teal-400 text-slate-500'>
                <Lock className='h-5 w-5' />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField('none')}
                className='w-full bg-transparent border-b-2 border-slate-800 pl-10 pr-12 py-3 text-[14px] font-normal text-white focus:border-teal-500 transition-all outline-none placeholder:text-slate-600'
                placeholder='••••••••'
                required
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute inset-y-0 right-0 pr-2 flex items-center text-slate-500 hover:text-teal-400 transition-colors focus:outline-none'>
                {showPassword ? (
                  <Eye className='h-5 w-5' />
                ) : (
                  <EyeOff className='h-5 w-5' />
                )}
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className='pt-6 lg:pt-8'>
              <button
                type='submit'
                disabled={isLoading}
                className='w-full relative overflow-hidden bg-teal-600 text-white rounded-2xl px-6 py-4 text-[15px] font-bold transition-all duration-500 transform hover:bg-teal-500 hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(13,148,136,0.4)] active:scale-[0.98] flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed'>
                <span className='relative z-10'>
                  {isLoading ? 'Memverifikasi...' : 'Akses Sistem Utama'}
                </span>

                <div className='relative z-10 w-8 h-8 bg-black/20 rounded-full flex items-center justify-center group-hover:bg-white transition-colors duration-500'>
                  {isLoading ? (
                    <Loader2 className='w-4 h-4 animate-spin text-white group-hover:text-teal-600' />
                  ) : (
                    <ArrowRight className='w-4 h-4 text-white group-hover:text-teal-600 transform group-hover:translate-x-1 transition-all duration-300' />
                  )}
                </div>
              </button>
            </motion.div>
          </form>
        </div>
      </div>
    </div>
  );
}
