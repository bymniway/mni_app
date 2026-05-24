import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import sharp from 'sharp';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    // Menangkap nama bucket dari frontend (default ke mni-assets jika tidak ada)
    const bucket = (formData.get('bucket') as string) || 'mni-assets';

    if (!file) {
      return NextResponse.json(
        { error: 'File tidak ditemukan' },
        { status: 400 },
      );
    }

    // Menggunakan pemanggil database yang benar (tanpa auth-helpers)
    const supabase = getServiceSupabase();

    // 1. Ubah file menjadi buffer agar bisa dibaca oleh Sharp
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. PROSES KOMPRESI AVIF (Super Ringan)
    const avifBuffer = await sharp(buffer)
      .resize({ width: 1000, withoutEnlargement: true }) // Cegah gambar kecil jadi pecah
      .avif({ quality: 60, effort: 4 }) // Kompresi tingkat tinggi
      .toBuffer();

    const fileName = `mni_${Date.now()}.avif`;

    // 3. Upload ke Supabase
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, avifBuffer, {
        contentType: 'image/avif', // Pastikan browser membacanya sebagai AVIF
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // 4. Ambil URL Publik
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return NextResponse.json({ url: publicUrlData.publicUrl }, { status: 200 });
  } catch (error) {
    console.error('API Upload Error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server saat upload' },
      { status: 500 },
    );
  }
}

//komponen upload pakai cloudflarre r2
// import { NextResponse } from 'next/server';
// import sharp from 'sharp';
// import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// // 1. Inisialisasi S3 Client khusus untuk Cloudflare R2
// const s3Client = new S3Client({
//   region: 'auto', // R2 selalu menggunakan 'auto'
//   endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
//   credentials: {
//     accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
//     secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
//   },
// });

// export async function POST(request: Request) {
//   try {
//     const formData = await request.formData();
//     const file = formData.get('file') as File;

//     if (!file) {
//       return NextResponse.json(
//         { error: 'File tidak ditemukan' },
//         { status: 400 },
//       );
//     }

//     // Keamanan Ekstra: Kita abaikan bucket dari frontend untuk mencegah injeksi.
//     // Selalu gunakan nama bucket dari environment variable server.
//     const bucketName = process.env.R2_BUCKET_NAME || 'mni-assets';
//     const publicUrlPrefix = process.env.R2_PUBLIC_URL || '';

//     const arrayBuffer = await file.arrayBuffer();
//     const buffer = Buffer.from(arrayBuffer);

//     // 2. PROSES KOMPRESI AVIF (Keamanan Kuota 10GB)
//     const avifBuffer = await sharp(buffer)
//       .resize({ width: 1000, withoutEnlargement: true })
//       .avif({ quality: 60, effort: 4 })
//       .toBuffer();

//     const fileName = `mni_${Date.now()}.avif`;

//     // 3. UPLOAD KE CLOUDFLARE R2
//     await s3Client.send(
//       new PutObjectCommand({
//         Bucket: bucketName,
//         Key: fileName,
//         Body: avifBuffer,
//         ContentType: 'image/avif',
//         CacheControl: 'public, max-age=31536000', // Wajib: Instruksi browser untuk menyimpan cache gambar selama 1 tahun (mengurangi hit read ke R2)
//       }),
//     );

//     // 4. SUSUN URL PUBLIK
//     const finalUrl = `${publicUrlPrefix}/${fileName}`;

//     return NextResponse.json({ url: finalUrl }, { status: 200 });
//   } catch (error) {
//     console.error('API Upload Error R2:', error);
//     return NextResponse.json(
//       { error: 'Terjadi kesalahan server saat upload ke R2' },
//       { status: 500 },
//     );
//   }
// }
