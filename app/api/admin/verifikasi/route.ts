import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const {
      idPesanan,
      emailUser,
      namaMudhohi,
      kodeTrx,
      totalBayar,
      statusTujuan,
      detailHewan,
      bagianSepertiga,
      alasanTolak,
    } = data;

    const supabase = getServiceSupabase();

    const isLunas = statusTujuan === 'Lunas';

    await supabase
      .from('pesanan')
      .update({ status_pesanan: statusTujuan })
      .eq('id', idPesanan);

    // Dapatkan tanggal pendaftaran untuk email Lunas
    const { data: pesananUtuh } = await supabase
      .from('pesanan')
      .select('created_at')
      .eq('id', idPesanan)
      .single();
    const tglDaftar = pesananUtuh
      ? new Date(pesananUtuh.created_at).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : '-';

    const { data: settings } = await supabase
      .from('pengaturan_web')
      .select('*');
    const getVal = (key: string, def = '') =>
      settings?.find((s) => s.kunci === key)?.nilai || def;

    const statusKey = statusTujuan.toUpperCase();
    const logoUrl = getVal('email_kurban_logo_url');
    const stempelUrl = getVal('email_kurban_stempel_url');
    const judul = getVal(
      `email_kurban_judul_${statusKey}`,
      isLunas ? 'Kwitansi Pembayaran Kurban' : 'Pendaftaran Tertunda',
    );
    const intro = getVal(
      `email_kurban_intro_${statusKey}`,
      isLunas
        ? 'Pendaftaran kurban Anda telah LUNAS dan terverifikasi dengan rincian hewan sebagai berikut:'
        : 'Pendaftaran Kurban Anda tidak dapat dilanjutkan saat ini karena kendala pada verifikasi dana.',
    );
    const msgUtama = getVal(`email_kurban_msg_utama_${statusKey}`, '-');
    const msgHubungi = getVal(
      `email_kurban_msg_hubungi_DITOLAK`,
      'Silahkan hubungi admin melalui WhatsApp untuk konfirmasi.',
    );
    const ttd = getVal('email_kurban_ttd', 'PANITIA KURBAN MNI');

    const btnTextDitolak = getVal(
      'email_kurban_btn_text_DITOLAK',
      'Konfirmasi via WhatsApp',
    );
    const btnLinkDitolak = getVal(
      'email_kurban_btn_link_DITOLAK',
      'https://wa.me/6281234567890',
    );

    const formatRp = `Rp ${Number(totalBayar).toLocaleString('id-ID')}`;

    let htmlBody = '';

    if (isLunas) {
      // DESAIN LUNAS (ELEGAN TANPA GRID KOTAK)
      htmlBody = `
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <tr>
            <td style="padding: 30px 40px; border-bottom: 4px solid #059669; background-color: #ffffff;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="left" style="width: 50%;">
                    ${logoUrl ? `<img src="${logoUrl}" height="45" style="display:block; max-width: 150px; object-fit: contain;" />` : `<b style="color:#059669; font-size:24px;">MNI</b>`}
                  </td>
                  <td align="right" style="width: 50%;">
                    <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 900; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Sertifikat Kurban</p>
                    <p style="margin: 0; font-size: 10px; font-weight: bold; color: #94a3b8;">Masjid Nurul Iman LAN</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px; position: relative;">
              <h2 style="font-size: 24px; font-weight: 900; margin: 0 0 20px 0; color: #1e293b; position: relative; z-index: 2;">${judul}</h2>
              <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 35px 0; position: relative; z-index: 2;">Alhamdulillah Bpk/Ibu/Sdr/i <strong>${namaMudhohi}</strong>. <br/>${intro}</p>
              
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 40px; font-size: 14px; position: relative; z-index: 2;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Tgl Daftar</td>
                  <td align="right" style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-weight: 900; color: #1e293b;">${tglDaftar}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Nama Pekurban</td>
                  <td align="right" style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-weight: 900; color: #1e293b;">${namaMudhohi}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">ID Pesanan</td>
                  <td align="right" style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-weight: 900; color: #1e293b;">${kodeTrx}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Hewan Kurban</td>
                  <td align="right" style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-weight: 900; color: #059669;">${detailHewan}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Hak 1/3 Daging</td>
                  <td align="right" style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-weight: 900; color: #1e293b;">${bagianSepertiga || '-'}</td>
                </tr>
                <tr>
                  <td style="padding: 20px 15px; background-color: #ecfdf5; border-radius: 12px 0 0 12px; font-weight: 900; color: #1e293b; font-size: 14px;">TOTAL LUNAS</td>
                  <td align="right" style="padding: 20px 15px; background-color: #ecfdf5; border-radius: 0 12px 12px 0; font-weight: 900; font-size: 18px; color: #059669;">${formatRp}</td>
                </tr>
              </table>

              <div style="padding: 25px; border-radius: 16px; border: 2px dashed #10b981; text-align: center; background-color: #ecfdf5; position: relative; z-index: 2;">
                <p style="margin: 0; font-size: 14px; font-weight: bold; color: #064e3b; line-height: 1.6;">${msgUtama}</p>
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
                    ${stempelUrl ? `<img src="${stempelUrl}" height="80" style="margin-top: 10px; mix-blend-mode: multiply; opacity: 0.8;" />` : ''}
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
      // DITOLAK KURBAN
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
              <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 30px 0; position: relative; z-index: 2;">Mohon maaf <strong>${namaMudhohi}</strong>.<br/>${intro}</p>
              
              <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; border-radius: 0 12px 12px 0; text-align: left; margin-bottom: 30px; position: relative; z-index: 2;">
                <p style="font-size: 10px; font-weight: bold; color: #991b1b; text-transform: uppercase; margin: 0 0 6px 0; letter-spacing: 1px;">Catatan Panitia:</p>
                <p style="font-size: 14px; color: #dc2626; font-style: italic; margin: 0; font-weight: 500;">"${alasanTolak || 'Bukti transfer tidak valid.'}"</p>
              </div>
              
              <div style="padding: 15px 20px; background-color: #f0fdfa; color: #0f766e; border-radius: 8px; font-size: 12px; font-weight: bold; border: 1px solid #ccfbf1; text-align: center; position: relative; z-index: 2;">
                ${msgHubungi}
              </div>

              <div style="margin-top: 30px; text-align: center; position: relative; z-index: 2;">
                <a href="${btnLinkDitolak}" style="display: inline-block; background-color: #b91c1c; color: #ffffff; font-weight: bold; text-decoration: none; padding: 16px 30px; border-radius: 12px; font-size: 15px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                  ${btnTextDitolak}
                </a>
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
      from: `"Panitia Kurban MNI" <${process.env.EMAIL_USER}>`,
      to: emailUser,
      subject: isLunas ? `✅ LUNAS: ${kodeTrx}` : `❌ DITOLAK: ${kodeTrx}`,
      html: `<div style="background-color: #f8fafc; padding: 40px 10px;">${htmlBody}</div>`,
    });

    return NextResponse.json({ message: 'Success' });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
