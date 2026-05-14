import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import sharp from 'sharp';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const hewanId = formData.get('hewanId') as string;
    const totalBayar = parseFloat(formData.get('totalBayar') as string);
    const metode = formData.get('metode') as string;

    const mudhohiListString = formData.get('mudhohiList') as string;
    const mudhohiList = JSON.parse(mudhohiListString || '[]');

    if (!hewanId || mudhohiList.length === 0) {
      return NextResponse.json(
        { error: 'Data tidak lengkap' },
        { status: 400 },
      );
    }

    const supabase = getServiceSupabase();

    const { data: hewanData } = await supabase
      .from('hewan')
      .select('jenis, tipe, status, mekanisme')
      .eq('id', hewanId)
      .single();
    if (!hewanData)
      return NextResponse.json(
        { error: 'Hewan tidak ditemukan' },
        { status: 404 },
      );
    if (hewanData.status === 'Terjual')
      return NextResponse.json(
        { error: 'Mohon maaf, hewan ini sudah terjual.' },
        { status: 400 },
      );

    const isJasaPotong = hewanData.jenis.toLowerCase() === 'jasa potong';
    const isUrunan =
      hewanData.tipe.toLowerCase().includes('urunan') ||
      hewanData.jenis.toLowerCase().includes('urunan');
    const mekanisme = hewanData.mekanisme || 'Otomatis';
    const detailHewan = `${hewanData.jenis} - ${hewanData.tipe}`;
    const qtyDibeli = mudhohiList.length;

    let isHabis = false;

    if (!isJasaPotong) {
      if (isUrunan) {
        const { count } = await supabase
          .from('pesanan')
          .select('*', { count: 'exact', head: true })
          .eq('hewan_id', hewanId)
          .in('status_pesanan', ['Menunggu', 'Lunas', 'Diterima', 'Booking']);
        const terisiSekarang = count || 0;
        if (terisiSekarang + qtyDibeli > 7)
          return NextResponse.json(
            {
              error: `Sapi Urunan ini hanya tersisa ${7 - terisiSekarang} slot lagi.`,
            },
            { status: 400 },
          );
        if (mekanisme === 'Otomatis' && terisiSekarang + qtyDibeli === 7)
          isHabis = true;
      } else {
        if (mekanisme === 'Otomatis') isHabis = true;
      }
    }

    let publicUrl = '';
    if (metode === 'Lunas' && file) {
      const arrayBuffer = await file.arrayBuffer();
      const avifBuffer = await sharp(Buffer.from(arrayBuffer))
        .avif({ quality: 50, effort: 4 })
        .toBuffer();
      const fileName = `tf_${Date.now()}_${Math.random().toString(36).substring(7)}.avif`;
      const { error: uploadError } = await supabase.storage
        .from('bukti_transfer')
        .upload(fileName, avifBuffer, { contentType: 'image/avif' });
      if (uploadError) throw uploadError;
      publicUrl = supabase.storage.from('bukti_transfer').getPublicUrl(fileName)
        .data.publicUrl;
    }

    const kodeTrxInduk = `QRB-MNI-${Date.now().toString().slice(-6)}`;
    const targetStatus = metode === 'Booking' ? 'Booking' : 'Menunggu';

    const pesananToInsert = mudhohiList.map((mudhohi: any, index: number) => ({
      kode_trx:
        mudhohiList.length > 1 ? `${kodeTrxInduk}-${index + 1}` : kodeTrxInduk,
      nama_mudhohi: mudhohi.nama,
      bagian_sepertiga: isUrunan
        ? mudhohi.ambilSepertiga
          ? 'Diambil (1/3)'
          : 'Disedekahkan'
        : mudhohi.bagianSepertiga || 'Tidak ada request',
      whatsapp: mudhohi.whatsapp,
      email: mudhohi.email,
      alamat: mudhohi.alamat,
      hewan_id: hewanId,
      total_bayar: totalBayar / qtyDibeli,
      bukti_transfer_url: publicUrl || null,
      status_pesanan: targetStatus,
    }));

    const { error: insertError } = await supabase
      .from('pesanan')
      .insert(pesananToInsert);
    if (insertError)
      return NextResponse.json(
        { error: 'Gagal menyimpan ke database.' },
        { status: 500 },
      );

    if (isHabis)
      await supabase
        .from('hewan')
        .update({ status: 'Terjual' })
        .eq('id', hewanId);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
    const { data: settings } = await supabase
      .from('pengaturan_web')
      .select('*');
    const getVal = (key: string, def = '') =>
      settings?.find((s) => s.kunci === key)?.nilai || def;

    // FUNGSI RENDER EMAIL PINTAR (ELEGAN)
    const generateHtmlEmail = (
      tipeKirim: 'AWAL_LUNAS' | 'AWAL_BOOKING' | 'TAGIHAN_SAPI_PENUH',
      dataHtml: any,
    ) => {
      if (tipeKirim === 'TAGIHAN_SAPI_PENUH') {
        const judul = getVal(
          'email_kurban_judul_TAGIHAN',
          'Segera Lakukan Pelunasan',
        );
        const intro = getVal(
          'email_kurban_intro_TAGIHAN',
          'Status pesanan kurban Anda masih BOOKING. Grup Sapi Urunan Anda telah penuh atau batas waktu pembayaran hampir habis.',
        );
        const msgUtama = getVal(
          'email_kurban_msg_utama_TAGIHAN',
          'Mohon segera lakukan transfer dan konfirmasi ke admin agar hewan kurban Anda dapat kami kunci (lock).',
        );

        const btnText = getVal(
          'email_kurban_btn_text_TAGIHAN',
          'Konfirmasi via WhatsApp',
        );
        const btnLink = getVal(
          'email_kurban_btn_link_TAGIHAN',
          'https://wa.me/6281234567890',
        );

        return `
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #1e3a8a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <tr>
              <td style="background-color: #1e3a8a; padding: 40px; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 16px; line-height: 1;">🔔</div>
                <h2 style="font-size: 24px; font-weight: 900; margin: 0; color: #ffffff;">${judul}</h2>
              </td>
            </tr>
            <tr>
              <td style="padding: 40px; text-align: center; position: relative;">
                <p style="font-size: 14px; color: #334155; margin-bottom: 30px; line-height: 1.6; position: relative; z-index: 2;">Assalamu'alaikum <strong>${dataHtml.nama}</strong>. <br/>${intro}</p>
                
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 25px; margin-bottom: 30px; text-align: left; position: relative; z-index: 2;">
                  <p style="font-size: 10px; font-weight: bold; color: #94a3b8; text-transform: uppercase; margin: 0 0 5px 0; letter-spacing: 1px;">Total Tagihan Pelunasan</p>
                  <p style="font-size: 24px; font-weight: 900; color: #1e3a8a; margin: 0;">${dataHtml.totalRp}</p>
                  <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
                    <p style="font-size: 12px; font-weight: 600; color: #64748b; margin: 0;">${dataHtml.hewanInfo} | ${dataHtml.kodeTrx}</p>
                  </div>
                </div>

                <div style="background-color: #fef2f2; color: #991b1b; padding: 20px; border-radius: 12px; text-align: left; font-size: 12px; line-height: 1.6; border: 1px solid #fecaca; position: relative; z-index: 2;">
                  <strong>⚠️ Perhatian:</strong> ${msgUtama}
                </div>
                <div style="margin-top: 30px; text-align: center; position: relative; z-index: 2;">
                  <a href="${btnLink}" style="display: inline-block; background-color: #1e3a8a; color: #ffffff; font-weight: bold; text-decoration: none; padding: 16px 30px; border-radius: 12px; font-size: 15px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    ${btnText}
                  </a>
                </div>
              </td>
            </tr>
          </table>
        `;
      }

      if (tipeKirim === 'AWAL_BOOKING') {
        const judul = getVal(
          'email_kurban_judul_AWAL_BOOKING',
          'Pemesanan Slot Berhasil',
        );
        const intro = getVal(
          'email_kurban_intro_AWAL_BOOKING',
          'Alhamdulillah Bpk/Ibu/Sdr/i, slot hewan kurban Anda berhasil diamankan. Silakan segera lakukan pembayaran/DP agar pesanan dapat kami verifikasi sepenuhnya.',
        );
        const btnText = getVal('email_ziswaf_btn_text_MENUNGGU', 'Cek Status');
        const btnLink = getVal(
          'email_ziswaf_btn_link_MENUNGGU',
          'https://mni-app.vercel.app/kurban/status',
        );

        return `
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #fde68a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <tr>
              <td style="background-color: #fbbf24; padding: 40px; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 16px; line-height: 1;">🛒</div>
                <h2 style="font-size: 24px; font-weight: 900; margin: 0; color: #78350f;">${judul}</h2>
              </td>
            </tr>
            <tr>
              <td style="padding: 40px; text-align: center; position: relative;">
                <p style="font-size: 14px; color: #334155; margin-bottom: 30px; line-height: 1.6; position: relative; z-index: 2;">Assalamu'alaikum <strong>${dataHtml.nama}</strong>. <br/>${intro}</p>
                
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 25px; margin-bottom: 10px; text-align: left; position: relative; z-index: 2;">
                  <p style="font-size: 10px; font-weight: bold; color: #94a3b8; text-transform: uppercase; margin: 0 0 5px 0; letter-spacing: 1px;">Total Tagihan / DP</p>
                  <p style="font-size: 24px; font-weight: 900; color: #1e293b; margin: 0;">${dataHtml.totalRp}</p>
                  <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
                    <p style="font-size: 12px; font-weight: 600; color: #64748b; margin: 0;">${dataHtml.hewanInfo} | ${dataHtml.kodeTrx}</p>
                  </div>
                </div>
                <div style="margin-top: 30px; text-align: center; position: relative; z-index: 2;">
                  <a href="${btnLink}" style="display: inline-block; background-color: #fbbf24; color: #78350f; font-weight: bold; text-decoration: none; padding: 16px 30px; border-radius: 12px; font-size: 15px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    ${btnText}
                  </a>
                </div>
              </td>
            </tr>
          </table>
        `;
      }

      // Default Lunas Awal -> Menunggu
      const judul = getVal(
        'email_kurban_judul_MENUNGGU',
        'Menunggu Verifikasi',
      );
      const intro = getVal(
        'email_kurban_intro_MENUNGGU',
        'Terima kasih telah mendaftar. Bukti pembayaran/DP Kurban Anda sedang ditinjau oleh panitia.',
      );
      const btnText = getVal('email_ziswaf_btn_text_MENUNGGU', 'Cek Status');
      const btnLink = getVal(
        'email_ziswaf_btn_link_MENUNGGU',
        'https://mni-app.vercel.app/kurban/status',
      );

      return `
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #fde68a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <tr>
            <td style="background-color: #fbbf24; padding: 40px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 16px; line-height: 1;">⏳</div>
              <h2 style="font-size: 24px; font-weight: 900; margin: 0; color: #78350f;">${judul}</h2>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px; text-align: center; position: relative;">
              <p style="font-size: 14px; color: #334155; margin-bottom: 30px; line-height: 1.6; position: relative; z-index: 2;">Assalamu'alaikum <strong>${dataHtml.nama}</strong>. <br/>${intro}</p>
              
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 25px; margin-bottom: 10px; text-align: left; position: relative; z-index: 2;">
                <p style="font-size: 10px; font-weight: bold; color: #94a3b8; text-transform: uppercase; margin: 0 0 5px 0; letter-spacing: 1px;">Total Nominal</p>
                <p style="font-size: 24px; font-weight: 900; color: #1e293b; margin: 0;">${dataHtml.totalRp}</p>
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
                  <p style="font-size: 12px; font-weight: 600; color: #64748b; margin: 0;">${dataHtml.hewanInfo} | ${dataHtml.kodeTrx}</p>
                </div>
              </div>
              <div style="margin-top: 30px; text-align: center; position: relative; z-index: 2;">
                <a href="${btnLink}" style="display: inline-block; background-color: #fbbf24; color: #78350f; font-weight: bold; text-decoration: none; padding: 16px 30px; border-radius: 12px; font-size: 15px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    ${btnText}
                </a>
              </div>
            </td>
          </tr>
        </table>
      `;
    };

    const emailPendaftar = mudhohiList[0].email;
    const namaPendaftar =
      mudhohiList[0].nama +
      (qtyDibeli > 1
        ? ` dkk (${qtyDibeli} ${isUrunan ? 'Slot' : 'Ekor'})`
        : '');
    const tipeTriggerAwal =
      targetStatus === 'Booking' ? 'AWAL_BOOKING' : 'AWAL_LUNAS';

    if (emailPendaftar) {
      await transporter.sendMail({
        from: `"Panitia Kurban MNI" <${process.env.EMAIL_USER}>`,
        to: emailPendaftar,
        subject: `[${kodeTrxInduk}] ${targetStatus === 'Booking' ? 'Slot Kurban Berhasil Diamankan' : 'Menunggu Verifikasi'}`,
        html: `<div style="background-color: #f1f5f9; padding: 40px 10px;">${generateHtmlEmail(
          tipeTriggerAwal,
          {
            nama: namaPendaftar,
            kodeTrx: kodeTrxInduk,
            hewanInfo: detailHewan,
            totalRp: `Rp ${totalBayar.toLocaleString('id-ID')}`,
          },
        )}</div>`,
      });
    }

    if (isUrunan && isHabis) {
      const { data: temanSapi } = await supabase
        .from('pesanan')
        .select('*')
        .eq('hewan_id', hewanId);
      if (temanSapi && temanSapi.length > 0) {
        for (const teman of temanSapi) {
          if (teman.status_pesanan === 'Booking' && teman.email) {
            await transporter.sendMail({
              from: `"Panitia Kurban MNI" <${process.env.EMAIL_USER}>`,
              to: teman.email,
              subject: `[SEGERA LUNASI] Sapi Urunan Telah Penuh!`,
              html: `<div style="background-color: #f1f5f9; padding: 40px 10px;">${generateHtmlEmail(
                'TAGIHAN_SAPI_PENUH',
                {
                  nama: teman.nama_mudhohi,
                  kodeTrx: teman.kode_trx,
                  hewanInfo: detailHewan,
                  totalRp: `Rp ${teman.total_bayar.toLocaleString('id-ID')}`,
                },
              )}</div>`,
            });
          }
        }
      }
    }

    return NextResponse.json(
      { message: 'Pesanan berhasil!', kodeTrx: kodeTrxInduk },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server.' },
      { status: 500 },
    );
  }
}
