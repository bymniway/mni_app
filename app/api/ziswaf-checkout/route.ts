// import { NextResponse } from 'next/server';
// import { getServiceSupabase } from '@/lib/supabase';
// import sharp from 'sharp';
// import nodemailer from 'nodemailer';

// export async function POST(request: Request) {
//   try {
//     const formData = await request.formData();
//     const file = formData.get('file') as File;
//     const nama = formData.get('nama') as string;
//     const isAnonim = formData.get('isAnonim') === 'true';
//     const whatsapp = formData.get('whatsapp') as string;
//     const email = formData.get('email') as string;
//     const pesan = formData.get('pesan') as string;
//     const kategori = formData.get('kategori') as string;
//     const nominal = formData.get('nominal') as string;
//     const rincian = formData.get('rincian') as string;

//     if (!file || !nama || !kategori || !nominal) {
//       return NextResponse.json(
//         { error: 'Data tidak lengkap' },
//         { status: 400 },
//       );
//     }

//     const supabase = getServiceSupabase();

//     // 1. Proses Gambar
//     const arrayBuffer = await file.arrayBuffer();
//     const buffer = Buffer.from(arrayBuffer);
//     const avifBuffer = await sharp(buffer)
//       .avif({ quality: 50, effort: 4 })
//       .toBuffer();

//     const fileName = `ziswaf_${Date.now()}.avif`;
//     const { error: uploadError } = await supabase.storage
//       .from('bukti_transfer')
//       .upload(fileName, avifBuffer, {
//         contentType: 'image/avif',
//         cacheControl: '3600',
//         upsert: false,
//       });

//     if (uploadError) throw uploadError;
//     const { data: publicUrlData } = supabase.storage
//       .from('bukti_transfer')
//       .getPublicUrl(fileName);

//     const kodeTrx = `ZIS-${Date.now().toString().slice(-6)}`;

//     // 2. Simpan ke Database
//     const { error: insertError } = await supabase
//       .from('transaksi_ziswaf')
//       .insert([
//         {
//           kode_trx: kodeTrx,
//           nama: nama,
//           is_anonim: isAnonim,
//           whatsapp: whatsapp,
//           email: email,
//           pesan: pesan || null,
//           kategori: kategori,
//           nominal: parseFloat(nominal),
//           rincian_kalkulasi: rincian || null,
//           bukti_transfer_url: publicUrlData.publicUrl,
//           status_pesanan: 'Menunggu',
//         },
//       ]);

//     if (insertError) throw insertError;

//     // 3. Kirim Email Notifikasi via Nodemailer tersinkron dengan Live Editor
//     if (email) {
//       const transporter = nodemailer.createTransport({
//         service: 'gmail',
//         auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
//       });

//       // Ambil Pengaturan Web
//       const { data: settings } = await supabase
//         .from('pengaturan_web')
//         .select('*');
//       const getVal = (key: string, def = '') =>
//         settings?.find((s) => s.kunci === key)?.nilai || def;

//       const judul = getVal(
//         'email_ziswaf_judul_MENUNGGU',
//         'Menunggu Verifikasi',
//       );
//       const intro = getVal(
//         'email_ziswaf_intro_MENUNGGU',
//         'Data penyaluran ZISWAF Anda telah masuk ke sistem kami dan saat ini sedang menunggu antrean verifikasi manual oleh admin.',
//       );
//       const msgUtama = getVal(
//         'email_ziswaf_msg_utama_MENUNGGU',
//         'Mohon kesediaannya menunggu maksimal 1x24 jam. Kwitansi resmi akan otomatis dikirimkan ke email ini setelah dana terkonfirmasi masuk ke mutasi rekening masjid.',
//       );

//       const namaDonatur = isAnonim ? 'Hamba Allah' : nama;
//       const formatRp = `Rp ${parseFloat(nominal).toLocaleString('id-ID')}`;

//       // Desain HTML Menunggu (Yellow/Amber Theme seperti di Editor)
//       const htmlZiswafMenunggu = `
//         <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9; padding: 40px 10px;">
//           <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);">
//             <div style="background-color: #fbbf24; padding: 40px; text-align: center; color: #78350f;">
//               <h2 style="font-size: 24px; font-weight: 900; margin: 0;">${judul}</h2>
//             </div>
//             <div style="padding: 40px; text-align: center; color: #334155;">
//               <p style="font-size: 14px; line-height: 1.6; margin-bottom: 25px;">
//                 Assalamu'alaikum <strong>${namaDonatur}</strong>. <br/><br/>
//                 ${intro}
//               </p>

//               <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
//                 <p style="font-size: 10px; font-weight: bold; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 5px 0;">Nominal Transaksi</p>
//                 <p style="font-size: 20px; font-weight: 900; color: #1e293b; margin: 0;">${formatRp}</p>
//                 <p style="font-size: 12px; color: #64748b; margin: 5px 0 0 0;">${kodeTrx}</p>
//               </div>

//               <div style="background-color: #eff6ff; color: #1e40af; padding: 20px; border-radius: 12px; text-align: left; font-size: 12px; line-height: 1.6;">
//                 <strong>ℹ️ Informasi:</strong> ${msgUtama}
//               </div>
//             </div>
//           </div>
//         </div>
//       `;

//       await transporter.sendMail({
//         from: `"Panitia ZISWAF MNI" <${process.env.EMAIL_USER}>`,
//         to: email,
//         subject: `[${kodeTrx}] Penyaluran ${kategori} Diterima (Menunggu Verifikasi)`,
//         html: htmlZiswafMenunggu,
//       });
//     }

//     return NextResponse.json(
//       { message: 'Penyaluran berhasil!', kodeTrx },
//       { status: 200 },
//     );
//   } catch (error) {
//     console.error('API Ziswaf Error:', error);
//     return NextResponse.json(
//       { error: 'Terjadi kesalahan server' },
//       { status: 500 },
//     );
//   }
// }
//
//
//
import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import sharp from 'sharp';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const nama = formData.get('nama') as string;
    const isAnonim = formData.get('isAnonim') === 'true';
    const whatsapp = formData.get('whatsapp') as string;
    const email = formData.get('email') as string;
    const pesan = formData.get('pesan') as string;
    const kategori = formData.get('kategori') as string;
    const nominal = formData.get('nominal') as string;
    const rincian = formData.get('rincian') as string;

    const supabase = getServiceSupabase();

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const avifBuffer = await sharp(buffer)
      .avif({ quality: 50, effort: 4 })
      .toBuffer();
    const fileName = `ziswaf_${Date.now()}.avif`;
    await supabase.storage
      .from('bukti_transfer')
      .upload(fileName, avifBuffer, { contentType: 'image/avif' });
    const { data: publicUrlData } = supabase.storage
      .from('bukti_transfer')
      .getPublicUrl(fileName);

    const kodeTrx = `ZIS-${Date.now().toString().slice(-6)}`;
    await supabase
      .from('transaksi_ziswaf')
      .insert([
        {
          kode_trx: kodeTrx,
          nama: nama,
          is_anonim: isAnonim,
          whatsapp: whatsapp,
          email: email,
          pesan: pesan || null,
          kategori: kategori,
          nominal: parseFloat(nominal),
          rincian_kalkulasi: rincian || null,
          bukti_transfer_url: publicUrlData.publicUrl,
          status_pesanan: 'Menunggu',
        },
      ]);

    if (email) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      });
      const { data: settings } = await supabase
        .from('pengaturan_web')
        .select('*');
      const getVal = (key: string, def = '') =>
        settings?.find((s) => s.kunci === key)?.nilai || def;

      const judul = getVal(
        'email_ziswaf_judul_MENUNGGU',
        'Menunggu Verifikasi',
      );
      const intro = getVal(
        'email_ziswaf_intro_MENUNGGU',
        'Data penyaluran ZISWAF Anda telah masuk ke sistem kami dan saat ini sedang menunggu antrean verifikasi manual oleh admin.',
      );
      const msgUtama = getVal(
        'email_ziswaf_msg_utama_MENUNGGU',
        'Mohon kesediaannya menunggu maksimal 1x24 jam. Kwitansi resmi akan otomatis dikirimkan ke email ini setelah dana terkonfirmasi masuk ke mutasi rekening masjid.',
      );
      const namaDonatur = isAnonim ? 'Hamba Allah' : nama;
      const formatRp = `Rp ${parseFloat(nominal).toLocaleString('id-ID')}`;

      const htmlZiswafMenunggu = `
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #fde68a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <tr>
            <td style="background-color: #fbbf24; padding: 40px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 16px; line-height: 1;">⏳</div>
              <h2 style="font-size: 24px; font-weight: 900; margin: 0; color: #78350f;">${judul}</h2>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px; text-align: center;">
              <p style="font-size: 14px; color: #334155; margin-bottom: 30px; line-height: 1.6;">
                Assalamu'alaikum <strong>${namaDonatur}</strong>.<br/>${intro}
              </p>
              
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 30px; text-align: left;">
                <p style="font-size: 10px; font-weight: bold; color: #94a3b8; text-transform: uppercase; margin: 0 0 5px 0; letter-spacing: 1px;">Nominal Transaksi</p>
                <p style="font-size: 24px; font-weight: 900; color: #1e293b; margin: 0;">${formatRp}</p>
                <p style="font-size: 12px; font-weight: 600; color: #64748b; margin: 10px 0 0 0; padding-top: 10px; border-top: 1px solid #e2e8f0;">${kategori} | ${kodeTrx}</p>
              </div>

              <div style="background-color: #eff6ff; color: #1e40af; padding: 15px 20px; border-radius: 12px; font-size: 12px; border: 1px solid #bfdbfe; line-height: 1.6; text-align: left;">
                <strong>ℹ️ Informasi:</strong> ${msgUtama}
              </div>
            </td>
          </tr>
        </table>
      `;
      await transporter.sendMail({
        from: `"Panitia ZISWAF MNI" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `[${kodeTrx}] Menunggu Verifikasi`,
        html: `<div style="background-color: #f8fafc; padding: 40px 10px;">${htmlZiswafMenunggu}</div>`,
      });
    }

    return NextResponse.json({ message: 'Success', kodeTrx }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
