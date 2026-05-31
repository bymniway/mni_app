import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const {
      tipe_resolusi,
      id_pesanan,
      id_hewan_lama,
      id_hewan_baru,
      email_jamaah,
      nama_jamaah,
      kode_trx,
      bukti_refund_url,
    } = data;

    const supabase = getServiceSupabase();

    const pulihkanSlotHewanLama = async (hewanId: string) => {
      if (!hewanId) return;
      const { data: pesananAktif } = await supabase
        .from('pesanan')
        .select('*')
        .eq('hewan_id', hewanId)
        .in('status_pesanan', ['Menunggu', 'Booking', 'Lunas', 'Selesai']);

      const { data: hewanInfo } = await supabase
        .from('hewan')
        .select('*')
        .eq('id', hewanId)
        .single();
      if (!hewanInfo) return;

      const isUrunan = String(hewanInfo.tipe).toLowerCase().includes('urunan');
      const ambangBatas = isUrunan ? 7 : 1;

      if ((pesananAktif?.length || 0) < ambangBatas) {
        await supabase
          .from('hewan')
          .update({ status: 'Tersedia' })
          .eq('id', hewanId);
      }
    };

    let selisihDanaHtml = '';
    let gambarRefundAtauTombolHtml = '';

    if (tipe_resolusi === 'batal') {
      // BATAL: Status Dibatalkan, Harga akhir dicatat 0, sisa dana dibersihkan
      const { error: errUpdate } = await supabase
        .from('pesanan')
        .update({
          status_pesanan: 'Dibatalkan',
          total_bayar: 0,
          kekurangan_dana: 0,
          bukti_refund_url: bukti_refund_url || null,
        })
        .eq('id', id_pesanan);

      if (errUpdate)
        throw new Error(
          `Gagal mengubah status di Database: ${errUpdate.message}`,
        );
      await pulihkanSlotHewanLama(id_hewan_lama);

      if (bukti_refund_url) {
        gambarRefundAtauTombolHtml = `
          <div style="margin-top: 25px; padding-top: 20px; border-top: 1px dashed #cbd5e1; text-align: center;">
            <p style="font-size: 12px; color: #475569; font-weight: bold; margin-bottom: 10px;">Bukti Pengembalian Dana (Refund) Sebesar Rp ${(data.dana_terbayar || 0).toLocaleString('id-ID')}:</p>
            <img src="${bukti_refund_url}" alt="Bukti Refund" style="max-width: 100%; border-radius: 8px; border: 1px solid #e2e8f0;" />
          </div>
        `;
      }
    } else if (tipe_resolusi === 'pindah') {
      const { data: hewanBaru } = await supabase
        .from('hewan')
        .select('*')
        .eq('id', id_hewan_baru)
        .single();
      const { data: hewanLama } = await supabase
        .from('hewan')
        .select('*')
        .eq('id', id_hewan_lama)
        .single();

      // Selisih dihitung murni dari harga baru dikurangi dana yang sudah masuk
      const selisih = (hewanBaru?.harga || 0) - (data.dana_terbayar || 0);

      // TENTUKAN STATUS AKHIR BERDASARKAN CASHFLOW
      let statusBaru = 'Lunas';
      let nominalKekurangan = 0;

      if (selisih > 0) {
        statusBaru = 'Booking'; // Turun ke booking jika kurang dana agar tombol upload di user terbuka
        nominalKekurangan = selisih;
      }

      // Tarik log lama
      const { data: psn } = await supabase
        .from('pesanan')
        .select('logs')
        .eq('id', id_pesanan)
        .single();
      const currentLogs = psn?.logs || [];
      const newLog = {
        status: tipe_resolusi === 'batal' ? 'Dibatalkan' : 'Pindah Hewan',
        timestamp: new Date().toISOString(),
        oleh: 'Admin Resolusi',
        catatan:
          tipe_resolusi === 'batal'
            ? 'Pesanan dibatalkan. Menunggu refund.'
            : 'Jamaah dipindahkan ke hewan lain.',
      };

      const { error: errUpdate } = await supabase
        .from('pesanan')
        .update({
          hewan_id: id_hewan_baru,
          status_pesanan: statusBaru,
          total_bayar: Point_Ke_Harga_Baru(hewanBaru?.harga), // Catat harga asli hewan yang baru
          bukti_refund_url: bukti_refund_url || null,
          kekurangan_dana: nominalKekurangan,
          logs: [...currentLogs, newLog],
        })
        .eq('id', id_pesanan);

      if (errUpdate)
        throw new Error(`Gagal update hewan di Database: ${errUpdate.message}`);
      await pulihkanSlotHewanLama(id_hewan_lama);

      // Pembuatan Template Email Matematika Selaras
      const statusSelisih =
        selisih > 0
          ? `<span style="color: #dc2626;">Kekurangan Dana Rp ${selisih.toLocaleString('id-ID')}</span>`
          : selisih < 0
            ? `<span style="color: #059669;">Kelebihan Dana Rp ${Math.abs(selisih).toLocaleString('id-ID')}</span>`
            : '<span style="color: #475569;">Pas (Sesuai)</span>';

      selisihDanaHtml = `
        <div style="background-color: #fff7ed; border: 1px solid #ffedd5; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
           <p style="margin: 0 0 10px 0; font-size: 12px; display: flex; justify-content: space-between;">
             <strong style="color: #9a3412;">Hewan Baru: </strong> 
             <span style="color: #1e293b; font-weight: bold;"> ${hewanBaru?.jenis} ${hewanBaru?.tipe} Rp ${(hewanBaru?.harga || 0).toLocaleString('id-ID')}</span>
           </p>
           <p style="margin: 0 0 15px 0; font-size: 12px; display: flex; justify-content: space-between;">
             <strong style="color: #9a3412;">DanaTerbayar: </strong> 
             <strong style="color: #059669;"> ${hewanLama?.jenis} ${hewanLama?.tipe} Rp ${(data.dana_terbayar || 0).toLocaleString('id-ID')}</strong>
           </p>
           <div style="border-top: 1px dashed #fdba74; padding-top: 15px; text-align: center; font-size: 14px; font-weight: 900;">
             ${statusSelisih}
           </div>
        </div>
      `;

      if (selisih < 0 && bukti_refund_url) {
        gambarRefundAtauTombolHtml = `
          <div style="margin-top: 25px; padding-top: 20px; border-top: 1px dashed #fdba74; text-align: center;">
            <p style="font-size: 12px; color: #9a3412; font-weight: bold; margin-bottom: 10px;">Bukti Pengembalian Kelebihan Dana:</p>
            <img src="${bukti_refund_url}" alt="Bukti Refund Kelebihan" style="max-width: 100%; border-radius: 8px; border: 1px solid #ffedd5;" />
          </div>
        `;
      } else if (selisih > 0) {
        const domainURL =
          process.env.NEXT_PUBLIC_BASE_URL || 'https://mni-app.vercel.app';
        gambarRefundAtauTombolHtml = `
          <div style="margin-top: 25px; padding-top: 20px; border-top: 1px dashed #fdba74; text-align: center;">
            <a href="${domainURL}/kurban/konfirmasi?trx=${kode_trx}" style="display: inline-block; background-color: #f97316; color: #ffffff; font-weight: bold; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 14px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
              Konfirmasi Kekurangan
            </a>
          </div>
        `;
      }
    }

    // Fungsi pembantu pembungkus data untuk jaga-jaga tipe data undefined
    function Point_Ke_Harga_Baru(val: any) {
      return val || 0;
    }

    const { data: settings } = await supabase
      .from('pengaturan_web')
      .select('*');
    const getVal = (key: string, def = '') =>
      settings?.find((s) => s.kunci === key)?.nilai || def;
    const statusKey = tipe_resolusi === 'batal' ? 'DIBATALKAN' : 'PINDAH';

    const formatVariabelEmail = (teksMentah: string) => {
      if (!teksMentah) return '';
      return teksMentah
        .replace(/{kode_trx}/g, kode_trx)
        .replace(/TRX-998877/g, kode_trx)
        .replace(/{nama_jamaah}/g, nama_jamaah)
        .replace(/\[Nama Pekurban\]/g, nama_jamaah)
        .replace(/Ahmad bin Fulan/g, nama_jamaah);
    };

    const judul = formatVariabelEmail(
      getVal(
        `email_kurban_judul_${statusKey}`,
        tipe_resolusi === 'batal'
          ? 'Pesanan Dibatalkan'
          : 'Perubahan Data Hewan',
      ),
    );
    const intro = formatVariabelEmail(
      getVal(
        `email_kurban_intro_${statusKey}`,
        'Terdapat pembaruan pada status pesanan kurban Anda.',
      ),
    );
    const msgUtama = formatVariabelEmail(
      getVal(
        `email_kurban_msg_utama_${statusKey}`,
        'Admin kami akan segera menindaklanjuti proses ini.',
      ),
    );

    let htmlBody = '';
    if (tipe_resolusi === 'batal') {
      htmlBody = `<table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; font-family: sans-serif;"><tr><td style="background-color: #f1f5f9; padding: 40px; text-align: center; border-bottom: 1px solid #e2e8f0;"><h2 style="font-size: 24px; font-weight: 900; margin: 0; color: #334155;">${judul}</h2></td></tr><tr><td style="padding: 40px; text-align: center;"><p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 30px 0;">Mohon maaf <strong>${nama_jamaah}</strong>.<br/>${intro}</p><div style="padding: 20px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 12px; font-weight: bold; color: #475569;">${msgUtama}</div>${gambarRefundAtauTombolHtml}</td></tr></table>`;
    } else {
      htmlBody = `<table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #fed7aa; font-family: sans-serif;"><tr><td style="background-color: #f97316; padding: 40px; text-align: center;"><h2 style="font-size: 24px; font-weight: 900; margin: 0; color: #ffffff;">${judul}</h2></td></tr><tr><td style="padding: 40px; text-align: center;"><p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 25px 0;">Assalamu'alaikum <strong>${nama_jamaah}</strong>.<br/>${intro}</p>${selisihDanaHtml}<div style="padding: 15px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 12px; font-weight: bold; color: #475569;">${msgUtama}</div>${gambarRefundAtauTombolHtml}</td></tr></table>`;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: `"Panitia Kurban MNI" <${process.env.EMAIL_USER}>`,
      to: email_jamaah,
      subject:
        tipe_resolusi === 'batal'
          ? `[BATAL] Pesanan Kurban ${kode_trx}`
          : `[UPDATE] Pembaruan Hewan Kurban ${kode_trx}`,
      html: `<div style="background-color: #f8fafc; padding: 40px 10px;">${htmlBody}</div>`,
    });

    return NextResponse.json({ message: 'Success' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
