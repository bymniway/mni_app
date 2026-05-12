import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const {
      idPesanan,
      emailUser,
      namaMudhohi,
      kodeTrx,
      detailHewan,
      gambarSembelihUrl,
    } = await request.json();
    const supabase = getServiceSupabase();

    // 1. UPDATE STATUS PESANAN MENJADI "Selesai" DI DATABASE
    const { error: dbError } = await supabase
      .from('pesanan')
      .update({
        status_pesanan: 'Selesai',
        bukti_sembelih_url: gambarSembelihUrl,
      })
      .eq('id', idPesanan);

    if (dbError) throw new Error('Gagal update status di database');

    // 2. AMBIL PENGATURAN LOGO DAN STEMPEL DARI WEB
    const { data: settings } = await supabase
      .from('pengaturan_web')
      .select('*');
    const getVal = (key: string, def = '') =>
      settings?.find((s) => s.kunci === key)?.nilai || def;

    const logoUrl = getVal('email_ziswaf_logo_url');
    const stempelUrl = getVal('email_ziswaf_stempel_url');
    const ttd = getVal('email_ziswaf_ttd', 'PANITIA KURBAN MNI');

    const tglSelesai = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const judulSelesai = getVal(
      'email_kurban_judul_SELESAI',
      'Kurban Telah Disembelih',
    );
    const introSelesai = getVal(
      'email_kurban_intro_SELESAI',
      'Alhamdulillah Bpk/Ibu/Sdr/i, kami menginformasikan bahwa hewan kurban Anda telah selesai kami sembelih.',
    );
    const doaSelesai = getVal(
      'email_kurban_doa_SELESAI',
      'Semoga Allah menerima ibadah kurban kita semua. Amin.',
    );

    // 3. DESAIN EMAIL PROFESIONAL (HTML)
    const htmlBody = `
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <tr>
          <td style="padding: 30px 40px; border-bottom: 4px solid #10b981; background-color: #ffffff;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td align="left" style="width: 50%;">
                  ${logoUrl ? `<img src="${logoUrl}" height="45" style="display:block; max-width: 150px; object-fit: contain;" />` : `<b style="color:#047857; font-size:24px;">MNI</b>`}
                </td>
                <td align="right" style="width: 50%;">
                  <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 900; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Laporan Eksekusi</p>
                  <p style="margin: 0; font-size: 10px; font-weight: bold; color: #94a3b8;">Masjid Nurul Iman LAN</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 40px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h2 style="font-size: 24px; font-weight: 900; margin: 10px 0 0 0; color: #1e293b;">${judulSelesai}</h2>
            </div>
            
            <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 25px 0;">
              Alhamdulillah, Bpk/Ibu/Sdr/i <strong>${namaMudhohi}</strong>. Kami menginformasikan bahwa hewan kurban Anda telah selesai kami sembelih dengan tata cara yang sesuai Syariat Islam.
            </p>
            
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 30px; font-size: 14px; background-color: #f8fafc; border-radius: 12px; padding: 20px;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px dashed #cbd5e1; font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase;">Reference</td>
                <td align="right" style="padding: 8px 0; border-bottom: 1px dashed #cbd5e1; font-weight: 900; color: #1e293b;">${kodeTrx}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px dashed #cbd5e1; font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase;">Jenis Hewan</td>
                <td align="right" style="padding: 8px 0; border-bottom: 1px dashed #cbd5e1; font-weight: 900; color: #047857;">${detailHewan}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase;">Tgl Sembelih</td>
                <td align="right" style="padding: 8px 0; font-weight: 900; color: #1e293b;">${tglSelesai}</td>
              </tr>
            </table>

            <p style="font-size: 13px; font-weight: bold; color: #475569; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px;">Dokumentasi Penyembelihan:</p>
            <div style="background-color: #f1f5f9; padding: 10px; border-radius: 12px; text-align: center; border: 1px solid #e2e8f0; margin-bottom: 30px;">
               <img src="${gambarSembelihUrl}" alt="Bukti Sembelih" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);" />
            </div>

            <div style="padding: 24px; border-radius: 16px; border: 2px dashed #10b981; text-align: center; background-color: #ecfdf5;">
              <p style="margin: 0 0 10px 0; font-size: 22px; font-weight: bold; color: #065f46; line-height: 1.8; font-family: 'Amiri', 'Traditional Arabic', serif;" dir="rtl">
                 تَقَبَّلَ اللَّهُ مِنَّا وَمِنْكُمْ
              </p>
              <p style="margin: 0; font-size: 12px; font-weight: 600; color: #047857;">${doaSelesai}</p>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding: 30px 40px; background-color: #f8fafc; border-top: 1px solid #f1f5f9;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td align="right" valign="top" style="padding-bottom: 20px;">
                  <p style="margin: 0 0 5px 0; font-size: 10px; font-weight: bold; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">Authenticated By</p>
                  <p style="margin: 0; font-weight: 900; font-size: 14px; color: #1e293b;">${ttd}</p>
                  ${stempelUrl ? `<img src="${stempelUrl}" height="80" style="margin-top: 10px; mix-blend-mode: multiply; opacity: 0.8;" />` : `<div style="display:inline-block; border: 2px dashed #e2e8f0; border-radius: 50%; width: 80px; height: 80px; text-align: center; line-height: 80px; font-size: 10px; font-weight: 900; color: #cbd5e1; transform: rotate(12deg); margin-top: 10px;">STAMP</div>`}
                </td>
              </tr>
              <tr>
                <td align="center" valign="middle" style="padding-top: 15px; border-top: 1px dashed #cbd5e1; font-size: 10px; color: #94a3b8; line-height: 1.6;">
                  Email laporan ini diterbitkan secara otomatis oleh Sistem Manajemen Kurban Masjid Nurul Iman LAN.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `;

    // 4. KIRIM EMAIL MENGGUNAKAN NODEMAILER
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: `"Panitia Kurban MNI" <${process.env.EMAIL_USER}>`,
      to: emailUser,
      subject: `[${kodeTrx}] Laporan Kurban Telah Disembelih`,
      html: `<div style="background-color: #f8fafc; padding: 40px 10px;">${htmlBody}</div>`,
    });

    return NextResponse.json({ message: 'Success Selesaikan Kurban' });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
