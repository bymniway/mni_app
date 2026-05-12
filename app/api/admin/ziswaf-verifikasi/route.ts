import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const { id, action, alasanTolak } = await request.json();
    const supabase = getServiceSupabase();

    const newStatus = action === 'terima' ? 'DITERIMA' : 'DITOLAK';
    const isDiterima = newStatus === 'DITERIMA';

    // 1. UPDATE STATUS DI TABEL TRANSAKSI
    const { data: trxData } = await supabase
      .from('transaksi_ziswaf')
      .update({ status_pesanan: newStatus })
      .eq('id', id)
      .select()
      .single();
    if (!trxData) throw new Error('Transaksi tidak ditemukan');

    // =========================================================================
    // FITUR BARU: AUTO-INCREMENT BAR PROGRESS WAKAF
    // Jika transaksi Diterima dan kategorinya adalah Wakaf, otomatis tambah dana
    // =========================================================================
    if (
      isDiterima &&
      trxData.kategori &&
      trxData.kategori.startsWith('Wakaf')
    ) {
      // Ekstrak Judul Wakaf dari format "Wakaf (Nama Program)" -> "Nama Program"
      const match = trxData.kategori.match(/Wakaf \((.*?)\)/);
      if (match && match[1]) {
        const wakafTargetTitle = match[1];

        // Ambil JSON data Wakaf dari pengaturan_web
        const { data: webDataWakaf } = await supabase
          .from('pengaturan_web')
          .select('nilai')
          .eq('kunci', 'wakaf_programs_data')
          .single();

        if (webDataWakaf && webDataWakaf.nilai) {
          try {
            let wakafArray = JSON.parse(webDataWakaf.nilai);
            let isUpdated = false;

            // Cari Card Wakaf yang judulnya cocok, lalu tambahkan nominalnya
            wakafArray = wakafArray.map((w: any) => {
              if (w.judul === wakafTargetTitle) {
                isUpdated = true;
                return {
                  ...w,
                  terkumpul: Number(w.terkumpul) + Number(trxData.nominal),
                };
              }
              return w;
            });

            // Simpan kembali JSON yang sudah diupdate ke database
            if (isUpdated) {
              await supabase
                .from('pengaturan_web')
                .update({ nilai: JSON.stringify(wakafArray) })
                .eq('kunci', 'wakaf_programs_data');
            }
          } catch (e) {
            console.error('Gagal auto-update Wakaf JSON', e);
          }
        }
      }
    }
    // =========================================================================

    // 2. SIAPKAN EMAIL NOTIFIKASI
    const { data: settings } = await supabase
      .from('pengaturan_web')
      .select('*');
    const getVal = (key: string, def = '') =>
      settings?.find((s) => s.kunci === key)?.nilai || def;

    const statusKey = newStatus.toUpperCase();
    const logoUrl = getVal('email_ziswaf_logo_url');
    const stempelUrl = getVal('email_ziswaf_stempel_url');
    const judul = getVal(
      `email_ziswaf_judul_${statusKey}`,
      isDiterima ? 'Kwitansi Penyaluran ZISWAF' : 'Verifikasi Tertunda',
    );
    const intro = getVal(
      `email_ziswaf_intro_${statusKey}`,
      isDiterima
        ? 'Kami telah menerima dan mengesahkan titipan dana Anda dengan rincian sebagai berikut:'
        : 'Kami mengalami kendala saat memverifikasi transaksi Anda.',
    );
    const msgUtama = getVal(`email_ziswaf_msg_utama_${statusKey}`, '-');
    const msgSub = getVal(`email_ziswaf_msg_sub_${statusKey}`, '-');
    const msgHubungi = getVal(
      `email_ziswaf_msg_hubungi_DITOLAK`,
      'Silahkan hubungi admin melalui WhatsApp di 0812-xxx-xxx untuk konfirmasi.',
    );
    const ttd = getVal('email_ziswaf_ttd', 'PANITIA ZISWAF MNI');

    const formatRp = `Rp ${parseFloat(trxData.nominal).toLocaleString('id-ID')}`;
    const namaDonatur = trxData.is_anonim ? 'Hamba Allah' : trxData.nama;
    const tglTransaksi = new Date(trxData.created_at).toLocaleDateString(
      'id-ID',
      { day: 'numeric', month: 'long', year: 'numeric' },
    );

    let htmlBody = '';

    if (isDiterima) {
      htmlBody = `
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <tr>
            <td style="padding: 30px 40px; border-bottom: 4px solid #0d9488; background-color: #ffffff;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="left" style="width: 50%;">
                    ${logoUrl ? `<img src="${logoUrl}" height="45" style="display:block; max-width: 150px; object-fit: contain;" />` : `<b style="color:#0f766e; font-size:24px;">MNI</b>`}
                  </td>
                  <td align="right" style="width: 50%;">
                    <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 900; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Official Invoice</p>
                    <p style="margin: 0; font-size: 10px; font-weight: bold; color: #94a3b8;">Masjid Nurul Iman LAN</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="font-size: 24px; font-weight: 900; margin: 0 0 20px 0; color: #1e293b;">${judul}</h2>
              <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 35px 0;">Jazakumullah Khairan Katsiran, Bpk/Ibu/Sdr/i <strong>${namaDonatur}</strong>. <br/>${intro}</p>
              
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 40px; font-size: 14px;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Tgl Transaksi</td>
                  <td align="right" style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-weight: 900; color: #1e293b;">${tglTransaksi}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Nama Donatur</td>
                  <td align="right" style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-weight: 900; color: #1e293b;">${namaDonatur}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Reference</td>
                  <td align="right" style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-weight: 900; color: #1e293b;">${trxData.kode_trx}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Kategori</td>
                  <td align="right" style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-weight: 900; color: #0d9488;">${trxData.kategori}</td>
                </tr>
                <tr>
                  <td style="padding: 20px 15px; background-color: #ecfdf5; border-radius: 12px 0 0 12px; font-weight: 900; color: #1e293b; font-size: 14px;">NOMINAL</td>
                  <td align="right" style="padding: 20px 15px; background-color: #ecfdf5; border-radius: 0 12px 12px 0; font-weight: 900; font-size: 18px; color: #0d9488;">${formatRp}</td>
                </tr>
              </table>

              <div style="padding: 24px; border-radius: 16px; border: 2px dashed #10b981; text-align: center; background-color: #ecfdf5;">
                <p style="margin: 0 0 10px 0; font-size: 24px; font-weight: bold; color: #065f46; line-height: 1.8; font-family: 'Amiri', 'Traditional Arabic', serif;" dir="rtl">${msgUtama}</p>
                <p style="margin: 0; font-size: 12px; font-weight: 600; color: #047857;">${msgSub}</p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px; background-color: #f8fafc; border-top: 1px solid #f1f5f9;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="right" valign="top" style="padding-bottom: 30px;">
                    <p style="margin: 0 0 5px 0; font-size: 10px; font-weight: bold; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">Authenticated By</p>
                    <p style="margin: 0; font-weight: 900; font-size: 14px; color: #1e293b;">${ttd}</p>
                    ${stempelUrl ? `<img src="${stempelUrl}" height="80" style="margin-top: 10px; mix-blend-mode: multiply; opacity: 0.8;" />` : `<div style="display:inline-block; border: 2px dashed #e2e8f0; border-radius: 50%; width: 80px; height: 80px; text-align: center; line-height: 80px; font-size: 10px; font-weight: 900; color: #cbd5e1; transform: rotate(12deg); margin-top: 10px;">STAMP</div>`}
                  </td>
                </tr>
                <tr>
                  <td align="center" valign="middle" style="padding-top: 20px; border-top: 1px dashed #cbd5e1; font-size: 10px; color: #94a3b8; line-height: 1.6;">
                    E-Invoice ini diterbitkan secara otomatis oleh Sistem Informasi Masjid Nurul Iman LAN.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      `;
    } else {
      // DITOLAK ZISWAF
      htmlBody = `
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #fecaca; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <tr>
            <td style="background-color: #fbf1f1; padding: 40px; text-align: center; border-bottom: 1px solid #fee2e2;">
              <div style="font-size: 48px; margin-bottom: 15px; line-height: 1;">⚠️</div>
              <h2 style="font-size: 24px; font-weight: 900; margin: 0; color: #b91c1c;">${judul}</h2>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px; text-align: center; position: relative;">
              <div style="position: absolute; top: 20px; right: 30px; font-size: 80px; opacity: 0.03; line-height: 1;">🕌</div>
              <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 30px 0; position: relative; z-index: 2;">Mohon maaf <strong>${namaDonatur}</strong>.<br/>${intro}</p>
              
              <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; border-radius: 0 12px 12px 0; text-align: left; margin-bottom: 30px; position: relative; z-index: 2;">
                <p style="font-size: 10px; font-weight: bold; color: #991b1b; text-transform: uppercase; margin: 0 0 6px 0; letter-spacing: 1px;">Catatan Admin:</p>
                <p style="font-size: 14px; color: #dc2626; font-style: italic; margin: 0; font-weight: 500;">"${alasanTolak || 'Bukti transfer tidak terbaca atau nominal tidak sesuai.'}"</p>
              </div>
              
              <div style="display: inline-block; padding: 12px 20px; background-color: #f0fdfa; color: #0f766e; border-radius: 8px; font-size: 12px; font-weight: bold; border: 1px solid #ccfbf1; text-align: center; position: relative; z-index: 2;">
                ${msgHubungi}
              </div>
            </td>
          </tr>
        </table>
      `;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
    await transporter.sendMail({
      from: `"Panitia ZISWAF MNI" <${process.env.EMAIL_USER}>`,
      to: trxData.email,
      subject: `[${trxData.kode_trx}] Status Penyaluran: ${newStatus}`,
      html: `<div style="background-color: #f8fafc; padding: 40px 10px;">${htmlBody}</div>`,
    });

    return NextResponse.json({ message: 'Success' });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
