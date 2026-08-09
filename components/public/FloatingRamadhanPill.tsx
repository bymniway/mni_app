'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Share2,
  HeartHandshake,
  Clock,
  Moon,
  Sun,
  ChevronUp,
  Timer,
} from 'lucide-react';

interface Schedule {
  hari_ke: number;
  tanggal: string;
  imam: string;
  penceramah: string;
  bilal: string;
  donatur_takjil: string;
}

export default function FloatingRamadhanPill({
  schedules,
}: {
  schedules: Schedule[];
}) {
  const router = useRouter();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isManuallyExpanded, setIsManuallyExpanded] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  const [apiWaktuSholat, setApiWaktuSholat] = useState<any>(null);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 100 && currentScrollY > lastScrollY) {
        setIsScrolled(true);
        setIsManuallyExpanded(false);
      } else if (currentScrollY <= 100) {
        setIsScrolled(false);
      }
      lastScrollY = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchApiSholat = async () => {
      try {
        const kota = 'Jakarta';
        const negara = 'Indonesia';

        const res = await fetch(
          `https://api.aladhan.com/v1/timingsByCity?city=${kota}&country=${negara}`,
        );
        const json = await res.json();

        if (json.code === 200) {
          const timings = json.data.timings;
          setApiWaktuSholat({
            imsak: timings.Imsak,
            subuh: timings.Fajr,
            dzuhur: timings.Dhuhr,
            ashar: timings.Asr,
            maghrib: timings.Maghrib,
            isya: timings.Isha,
          });
        }
      } catch (error) {
        console.error('Gagal menarik data API Aladhan:', error);
      }
    };
    fetchApiSholat();
  }, []);

  const todaySchedule = useMemo(() => {
    if (!currentTime) return schedules[0];
    const y = currentTime.getFullYear();
    const m = String(currentTime.getMonth() + 1).padStart(2, '0');
    const d = String(currentTime.getDate()).padStart(2, '0');
    const localTodayStr = `${y}-${m}-${d}`;
    return schedules.find((s) => s.tanggal === localTodayStr) || schedules[0];
  }, [currentTime, schedules]);

  const getGreetingAndNextPrayer = () => {
    if (!currentTime || !apiWaktuSholat)
      return {
        pesan: 'Memuat Jadwal...',
        ikon: (
          <Clock className='w-4 h-4 text-emerald-100 animate-spin shrink-0' />
        ),
      };

    const currentTotalMinutes =
      currentTime.getHours() * 60 + currentTime.getMinutes();

    const parseTime = (timeStr: string) => {
      if (!timeStr) return 0;
      const [h, m] = timeStr.split(':').map(Number);
      return (h || 0) * 60 + (m || 0);
    };

    const maghribMins = parseTime(apiWaktuSholat.maghrib);
    const subuhMins = parseTime(apiWaktuSholat.subuh);

    if (
      currentTotalMinutes >= maghribMins &&
      currentTotalMinutes <= maghribMins + 15
    ) {
      return {
        pesan: 'Selamat Berbuka Puasa 🍽️',
        ikon: <Moon className='w-4 h-4 text-amber-300 shrink-0' />,
        isHighlight: true,
      };
    }

    if (currentTotalMinutes >= subuhMins && currentTotalMinutes <= 360) {
      return {
        pesan: 'Selamat Melaksanakan Ibadah Puasa 🕌',
        ikon: <Sun className='w-4 h-4 text-amber-300 shrink-0' />,
        isHighlight: true,
      };
    }

    const allPrayers = [
      {
        name: 'Imsak',
        time: parseTime(apiWaktuSholat.imsak),
        icon: <Moon className='w-4 h-4 text-emerald-100 shrink-0' />,
      },
      {
        name: 'Subuh',
        time: subuhMins,
        icon: <Sun className='w-4 h-4 text-emerald-100 shrink-0' />,
      },
      {
        name: 'Dzuhur',
        time: parseTime(apiWaktuSholat.dzuhur),
        icon: <Sun className='w-4 h-4 text-emerald-100 shrink-0' />,
      },
      {
        name: 'Ashar',
        time: parseTime(apiWaktuSholat.ashar),
        icon: <Sun className='w-4 h-4 text-emerald-100 shrink-0' />,
      },
      {
        name: 'Buka Puasa',
        time: maghribMins,
        icon: <Moon className='w-4 h-4 text-emerald-100 shrink-0' />,
      },
      {
        name: 'Isya',
        time: parseTime(apiWaktuSholat.isya),
        icon: <Moon className='w-4 h-4 text-emerald-100 shrink-0' />,
      },
    ].filter((p) => p.time > 0);

    if (allPrayers.length === 0) {
      return {
        pesan: `Ramadhan ke-${todaySchedule?.hari_ke || '-'}`,
        ikon: <Moon className='w-4 h-4 text-emerald-100 shrink-0' />,
        isHighlight: false,
      };
    }

    let nextPrayer = allPrayers.find((p) => p.time >= currentTotalMinutes);
    let sisaMenit = 0;

    if (!nextPrayer) {
      nextPrayer = allPrayers[0];
      sisaMenit = 24 * 60 - currentTotalMinutes + nextPrayer.time;
    } else {
      sisaMenit = nextPrayer.time - currentTotalMinutes;
    }

    const jam = Math.floor(sisaMenit / 60);
    const menit = sisaMenit % 60;
    const formatWaktu = jam > 0 ? `${jam}j ${menit}m` : `${menit}m`;

    return {
      pesan: `${formatWaktu} ke ${nextPrayer.name}`,
      ikon: nextPrayer.icon,
      isHighlight: false,
    };
  };

  const statusWaktu = getGreetingAndNextPrayer();
  const showFullText = !isScrolled || isManuallyExpanded;

  const handleShareWA = () => {
    if (!todaySchedule || !apiWaktuSholat) return;

    const currentTotalMinutes =
      currentTime!.getHours() * 60 + currentTime!.getMinutes();
    const parseTime = (timeStr: string) => {
      if (!timeStr) return 0;
      const [h, m] = timeStr.split(':').map(Number);
      return (h || 0) * 60 + (m || 0);
    };
    const maghribMins = parseTime(apiWaktuSholat.maghrib);
    const isPastMaghrib = currentTotalMinutes > maghribMins;

    let takjilText = todaySchedule.donatur_takjil || '-';

    if (isPastMaghrib) {
      const tomorrow = new Date(currentTime!);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const y = tomorrow.getFullYear();
      const m = String(tomorrow.getMonth() + 1).padStart(2, '0');
      const d = String(tomorrow.getDate()).padStart(2, '0');
      const tomorrowStr = `${y}-${m}-${d}`;

      const tomorrowSchedule = schedules.find((s) => s.tanggal === tomorrowStr);

      if (tomorrowSchedule && tomorrowSchedule.donatur_takjil) {
        takjilText = `${tomorrowSchedule.donatur_takjil} (Untuk Besok)`;
      } else {
        takjilText = '- (Belum ada donatur untuk besok)';
      }
    }

    const tglFormat = new Date(todaySchedule.tanggal).toLocaleDateString(
      'id-ID',
      {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      },
    );

    const textWA =
      `*🌙 JADWAL RAMADHAN HARI INI (Hari ke-${todaySchedule.hari_ke || '-'})*\n📅 ${tglFormat}\n\n` +
      `⏰ *Imsak:* ${apiWaktuSholat.imsak || '-'}\n` +
      `⏰ *Subuh:* ${apiWaktuSholat.subuh || '-'}\n` +
      `⏰ *Dzuhur:* ${apiWaktuSholat.dzuhur || '-'}\n` +
      `⏰ *Ashar:* ${apiWaktuSholat.ashar || '-'}\n` +
      `⏰ *Buka Puasa:* ${apiWaktuSholat.maghrib || '-'}\n` +
      `⏰ *Isya:* ${apiWaktuSholat.isya || '-'}\n\n` +
      `🕌 *PETUGAS TARAWIH*\n` +
      `• Imam: ${todaySchedule.imam || '-'}\n` +
      `• Penceramah: ${todaySchedule.penceramah || '-'}\n` +
      `• Bilal: ${todaySchedule.bilal || '-'}\n\n` +
      `🍱 *Donatur Takjil:* ${takjilText}\n\n` +
      `_Mari makmurkan masjid kita!_ ✨`;

    window.open(`https://wa.me/?text=${encodeURIComponent(textWA)}`, '_blank');
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const goToInfaq = () => {
    router.push('/ziswaf?tab=Infaq');
  };

  if (!apiWaktuSholat) return null;

  return (
    <>
      <style>{`
        @keyframes marquee-pill-anim {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .pill-marquee-content {
          display: inline-block;
          white-space: nowrap;
          animation: marquee-pill-anim 10s linear infinite;
        }
      `}</style>

      <div className='fixed bottom-6 left-0 w-full z-50 pointer-events-none'>
        <div className='max-w-6xl mx-auto px-4 relative flex justify-center items-end h-full'>
          <div className='pointer-events-auto bg-emerald-600 border border-emerald-500 shadow-2xl shadow-emerald-900/40 rounded-full p-1.5 flex items-center transition-all duration-500 overflow-hidden'>
            <div
              className={`flex items-center transition-all duration-500 ease-in-out ${showFullText ? 'w-auto opacity-100 px-1' : 'w-0 opacity-0 px-0'}`}>
              <div className='flex items-center gap-2 bg-emerald-700/60 py-1.5 px-3 rounded-full border border-emerald-500/50 shadow-inner whitespace-nowrap overflow-hidden max-w-[180px] sm:max-w-[250px]'>
                {statusWaktu.ikon}

                {statusWaktu.isHighlight ? (
                  <div className='overflow-hidden relative flex-1'>
                    <div className='pill-marquee-content text-[11px] sm:text-xs text-amber-300 font-bold tracking-wide'>
                      {statusWaktu.pesan} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{' '}
                      {statusWaktu.pesan}
                    </div>
                  </div>
                ) : (
                  <span className='text-[11px] sm:text-xs tracking-wide text-emerald-50 font-semibold'>
                    {statusWaktu.pesan}
                  </span>
                )}
              </div>
            </div>

            {/* ANIMASI 1: Reveal Zoom Out untuk Tombol Expand Timer */}
            {!showFullText && (
              <button
                onClick={() => setIsManuallyExpanded(true)}
                className='group relative overflow-hidden flex items-center justify-center bg-emerald-700 text-emerald-100 border border-emerald-500/50 p-2.5 rounded-full hover:scale-[1.03] active:scale-95 transition-all duration-300'
                title='Bagikan Jadwal ke WA'>
                <span className='absolute inset-0 bg-white rounded-full scale-x-0 origin-right group-hover:scale-x-100 group-hover:origin-left transition-transform duration-500 ease-in-out'></span>
                <Timer className='w-4 h-4 animate-pulse relative z-10 group-hover:text-emerald-700 transition-colors' />
              </button>
            )}

            <div className='flex items-center gap-1.5 pl-1.5'>
              {/* ANIMASI 2: Reveal Menyapu dari Bawah untuk Tombol Infaq */}
              <button
                onClick={goToInfaq}
                className='group relative overflow-hidden flex items-center justify-center bg-white text-amber-600 border border-emerald-500/50 p-2.5 rounded-full hover:scale-[1.03] active:scale-95 transition-all duration-300'
                title='Bagikan Jadwal ke WA'>
                <span className='absolute inset-0 bg-amber-600 rounded-full scale-x-0 origin-right group-hover:scale-x-100 group-hover:origin-left transition-transform duration-500 ease-in-out'></span>
                <HeartHandshake className='w-4 h-4 relative z-10 group-hover:text-white transition-colors' />
              </button>

              {/* ANIMASI 3: Reveal Menyapu dari Kiri untuk Tombol Share */}
              <button
                onClick={handleShareWA}
                className='group relative overflow-hidden flex items-center justify-center bg-emerald-700 text-emerald-100 border border-emerald-500/50 p-2.5 rounded-full hover:scale-[1.03] active:scale-95 transition-all duration-300'
                title='Bagikan Jadwal ke WA'>
                <span className='absolute inset-0 bg-white rounded-full scale-x-0 origin-right group-hover:scale-x-100 group-hover:origin-left transition-transform duration-500 ease-in-out'></span>
                <Share2 className='w-4 h-4 relative z-10 group-hover:text-emerald-700 transition-colors' />
              </button>
            </div>
          </div>

          {/* ANIMASI 4: Reveal Menyapu dari Bawah untuk Tombol Scroll To Top */}
          <button
            onClick={scrollToTop}
            className={`group relative overflow-hidden pointer-events-auto absolute left-2 bg-white border border-emerald-100 text-emerald-600 p-3 rounded-full shadow-xl shadow-emerald-900/10 transition-all duration-300 transform ${isScrolled ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-50'}`}
            title='Kembali ke Atas'>
            {/* Background yang menyapu dari bawah ke atas */}
            <span className='absolute inset-0 bg-emerald-700 rounded-full scale-y-0 origin-top group-hover:scale-y-100 group-hover:origin-bottom transition-transform duration-500 ease-in-out'></span>
            <ChevronUp className='w-5 h-5 font-bold relative z-10 group-hover:text-white transition-colors' />
          </button>
        </div>
      </div>
    </>
  );
}
