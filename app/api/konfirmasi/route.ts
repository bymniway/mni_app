import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import sharp from 'sharp';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const pesananId = formData.get('pesananId') as string;

    if (!file || !pesananId) {
      return NextResponse.json(
        { error: 'Data file atau ID Pesanan tidak ditemukan' },
        { status: 400 },
      );
    }

    const supabase = getServiceSupabase();

    // 1. CEK APAKAH INI TF AWAL ATAU TF TAMBAHAN (KEKURANGAN DANA)
    const { data: currentPesanan } = await supabase
      .from('pesanan')
      .select('bukti_transfer_url')
      .eq('id', pesananId)
      .single();

    // Jika bukti awal sudah ada, berarti ini adalah upload tambahan
    const isTambahan = !!currentPesanan?.bukti_transfer_url;

    // 2. KOMPRES FOTO DENGAN SHARP
    const arrayBuffer = await file.arrayBuffer();
    const avifBuffer = await sharp(Buffer.from(arrayBuffer))
      .avif({ quality: 50, effort: 4 })
      .toBuffer();

    // Beri nama file yang berbeda agar mudah dilacak di Storage
    const prefix = isTambahan ? 'tf_tambahan' : 'tf_awal';
    const fileName = `${prefix}_${Date.now()}_${Math.random().toString(36).substring(7)}.avif`;

    // 3. UPLOAD KE SUPABASE
    const { error: uploadError } = await supabase.storage
      .from('bukti_transfer')
      .upload(fileName, avifBuffer, { contentType: 'image/avif' });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from('bukti_transfer')
      .getPublicUrl(fileName);

    // 4. UPDATE DATABASE (JANGAN TIMPA DATA LAMA!)
    const updatePayload = isTambahan
      ? {
          bukti_tf_tambahan_url: publicUrlData.publicUrl,
          status_pesanan: 'Menunggu',
        }
      : {
          bukti_transfer_url: publicUrlData.publicUrl,
          status_pesanan: 'Menunggu',
        };

    const { error: updateError } = await supabase
      .from('pesanan')
      .update(updatePayload)
      .eq('id', pesananId);

    if (updateError) throw updateError;

    return NextResponse.json(
      { message: 'Upload berhasil', url: publicUrlData.publicUrl },
      { status: 200 },
    );
  } catch (error: any) {
    console.error('API Konfirmasi Error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server saat mengunggah' },
      { status: 500 },
    );
  }
}
//
//
// barangkali kita akan pindah ke Cloudflare R2 untuk penyimpanan file yang lebih murah dan cepat, tapi untuk sementara ini kita tetap pakai Supabase Storage dulu sambil menyiapkan infrastruktur R2-nya. Jadi kode di atas masih menggunakan Supabase Storage, tapi sudah dioptimasi dengan Sharp untuk mengurangi ukuran file sebelum diupload. Nantinya kalau sudah siap migrasi ke R2, kita tinggal ganti bagian upload-nya saja tanpa perlu ubah logika lainnya.
// import { NextResponse } from 'next/server';
// import { getServiceSupabase } from '@/lib/supabase';
// import sharp from 'sharp';
// import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'; //  Impor alat komunikasi R2

// //  Inisialisasi S3 Client khusus untuk Cloudflare R2 di luar handler
// const s3Client = new S3Client({
//   region: 'auto',
//   endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
//   credentials: {
//     accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
//     secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
//   },
// });

// export async function POST(request: Request) {
//   try {
//     const formData = await request.formData();
//     const file = formData.get('file') as File | null;
//     const pesananId = formData.get('pesananId') as string;

//     if (!file || !pesananId) {
//       return NextResponse.json(
//         { error: 'Data file atau ID Pesanan tidak ditemukan' },
//         { status: 400 },
//       );
//     }

//     // Supabase tetap kita panggil, tapi HANYA untuk update database SQL saja
//     const supabase = getServiceSupabase();

//     // 1. KOMPRES FOTO DENGAN SHARP (Menghemat Kuota R2 & Bandwidth)
//     const arrayBuffer = await file.arrayBuffer();
//     const avifBuffer = await sharp(Buffer.from(arrayBuffer))
//       .avif({ quality: 50, effort: 4 })
//       .toBuffer();

//     // 📁 Tambahkan awalan 'bukti_transfer/' agar rapi masuk folder khusus di R2
//     const fileName = `bukti_transfer/tf_susulan_${Date.now()}_${Math.random().toString(36).substring(7)}.avif`;
//     const bucketName = process.env.R2_BUCKET_NAME || 'mni-assets';
//     const publicUrlPrefix = process.env.R2_PUBLIC_URL || '';

//     // 2. UPLOAD KE CLOUDFLARE R2
//     await s3Client.send(
//       new PutObjectCommand({
//         Bucket: bucketName,
//         Key: fileName,
//         Body: avifBuffer,
//         ContentType: 'image/avif',
//         CacheControl: 'private, max-age=31536000', // Set private karena ini bukti bayar
//       }),
//     );

//     // Susun URL final dari Cloudflare
//     const finalUrl = `${publicUrlPrefix}/${fileName}`;

//     // 3. UPDATE STATUS DI DATABASE (Buku Catatan) MENJADI "Menunggu"
//     const { error: updateError } = await supabase
//       .from('pesanan')
//       .update({
//         bukti_transfer_url: finalUrl, // <-- Simpan URL R2 ke database
//         status_pesanan: 'Menunggu',
//       })
//       .eq('id', pesananId);

//     if (updateError) throw updateError;

//     return NextResponse.json(
//       {
//         message: 'Upload berhasil',
//         url: finalUrl,
//       },
//       { status: 200 },
//     );
//   } catch (error: any) {
//     console.error('API Konfirmasi Error:', error);
//     return NextResponse.json(
//       { error: error.message || 'Terjadi kesalahan server saat mengunggah' },
//       { status: 500 },
//     );
//   }
// }
