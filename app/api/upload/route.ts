import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import admin from 'firebase-admin';

// 1. Inisialisasi Alibaba Cloud S3 Client
const s3Client = new S3Client({
  region: 'ap-southeast-5',
  endpoint: process.env.ALIBABA_ENDPOINT,
  credentials: {
    accessKeyId: process.env.ALIBABA_ACCESS_KEY as string,
    secretAccessKey: process.env.ALIBABA_SECRET_KEY as string,
  },
});

// 2. Inisialisasi Firebase Admin (Cegah inisialisasi ulang di Serverless Vercel)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_PRIVATE_KEY as string).replace(
        /\\n/g,
        '\n',
      ),
    }),
    storageBucket: process.env.FIREBASE_BUCKET_NAME,
  });
}
const firebaseBucket = admin.storage().bucket('mni-lan.firebasestorage.app');

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    // Menangkap tujuan penyedia storage dari frontend (default ke ALIBABA jika kosong)
    const provider = (formData.get('provider') as string) || 'ALIBABA';
    // Menangkap folder tujuan untuk manajemen file yang rapi
    const folder = (formData.get('folder') as string) || 'umum';

    if (!file) {
      return NextResponse.json(
        { error: 'File tidak ditemukan' },
        { status: 400 },
      );
    }

    // Ubah berkas ke buffer untuk diproses oleh Sharp
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let finalBuffer: Buffer = buffer;
    let finalFileName = `mni_${Date.now()}.${file.name.split('.').pop()}`;
    let finalContentType = file.type;

    // JALUR PROSES GAMBAR (Hanya kompres jika failnya adalah gambar dan bukan arsip/dokumen)
    if (file.type.startsWith('image/')) {
      finalBuffer = await sharp(buffer)
        .resize({ width: 800, withoutEnlargement: true })
        .avif({ quality: 45, effort: 4 })
        .toBuffer();

      finalFileName = `mni_${Date.now()}.avif`;
      finalContentType = 'image/avif';
    }

    const targetPath = `${folder}/${finalFileName}`;
    let publicUrl = '';

    // ==========================================
    // JALUR CABANG PENYEDIA STORAGE (MULTICLOUD)
    // ==========================================
    switch (provider.toUpperCase()) {
      case 'ALIBABA': {
        // Cocok untuk Galeri Publik & Dokumentasi Kurban
        const command = new PutObjectCommand({
          Bucket: process.env.ALIBABA_BUCKET_NAME,
          Key: targetPath,
          Body: finalBuffer,
          ContentType: finalContentType,
        });
        await s3Client.send(command);
        publicUrl = `https://${process.env.ALIBABA_BUCKET_NAME}.oss-ap-southeast-5.aliyuncs.com/${targetPath}`;
        break;
      }

      case 'FIREBASE': {
        // Cocok untuk Bukti Transfer (Sensitif/Privat)
        const firebaseFile = firebaseBucket.file(targetPath);

        await firebaseFile.save(finalBuffer, {
          metadata: { contentType: finalContentType },
          public: false, // Setel FALSE agar berkas aman dan terkunci di Firebase Security Rules
        });

        // Membuat Signed URL berdurasi agar admin bisa melihat sementara waktu tanpa bocor ke publik
        const [signedUrl] = await firebaseFile.getSignedUrl({
          action: 'read',
          expires: '03-09-2499', // Berlaku jangka panjang khusus dibaca sistem admin internal
        });
        publicUrl = signedUrl;
        break;
      }

      case 'CLOUDINARY': {
        // Cocok untuk Banner / Logo UI Aplikasi
        // Cloudinary lebih mudah ditembak menggunakan representasi Base64 di Serverless
        const base64Data = finalBuffer.toString('base64');
        const fileUri = `data:${finalContentType};base64,${base64Data}`;

        // Panggil endpoint REST API Cloudinary secara native tanpa SDK berat
        const cloudinaryForm = new FormData();
        cloudinaryForm.append('file', fileUri);
        cloudinaryForm.append('upload_preset', 'mni_presets'); // Mas buat preset dulu di dasbor Cloudinary
        cloudinaryForm.append('folder', folder);

        const cloudName = process.env.CLOUDINARY_URL?.split('@')[1];
        const cloudRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: 'POST',
            body: cloudinaryForm,
          },
        );

        const cloudData = await cloudRes.json();
        if (cloudData.secure_url) {
          publicUrl = cloudData.secure_url;
        } else {
          throw new Error('Cloudinary Upload Failed');
        }
        break;
      }

      default:
        return NextResponse.json(
          { error: 'Storage Provider tidak didukung' },
          { status: 400 },
        );
    }

    // Kembalikan satu URL bersih yang siap dimasukkan ke Database Supabase Mas
    return NextResponse.json({ url: publicUrl }, { status: 200 });
  } catch (error) {
    console.error('Multi-Cloud API Upload Error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server saat memproses unggahan' },
      { status: 500 },
    );
  }
}
//
//
// VERSI SEBELUMNYA (Hanya Supabase Storage, Tanpa Multicloud)
//
// import { NextResponse } from 'next/server';
// import { getServiceSupabase } from '@/lib/supabase';
// import sharp from 'sharp';

// export async function POST(request: Request) {
//   try {
//     const formData = await request.formData();
//     const file = formData.get('file') as File;

//     // Menangkap nama bucket dari frontend (default ke mni-assets jika tidak ada)
//     const bucket = (formData.get('bucket') as string) || 'mni-assets';

//     if (!file) {
//       return NextResponse.json(
//         { error: 'File tidak ditemukan' },
//         { status: 400 },
//       );
//     }

//     // Menggunakan pemanggil database yang benar (tanpa auth-helpers)
//     const supabase = getServiceSupabase();

//     // 1. Ubah file menjadi buffer agar bisa dibaca oleh Sharp
//     const arrayBuffer = await file.arrayBuffer();
//     const buffer = Buffer.from(arrayBuffer);

//     // 2. PROSES KOMPRESI AVIF (Super Ringan)
//     const avifBuffer = await sharp(buffer)
//       .resize({ width: 1000, withoutEnlargement: true }) // Cegah gambar kecil jadi pecah
//       .avif({ quality: 60, effort: 4 }) // Kompresi tingkat tinggi
//       .toBuffer();

//     const fileName = `mni_${Date.now()}.avif`;

//     // 3. Upload ke Supabase
//     const { error: uploadError } = await supabase.storage
//       .from(bucket)
//       .upload(fileName, avifBuffer, {
//         contentType: 'image/avif', // Pastikan browser membacanya sebagai AVIF
//         cacheControl: '3600',
//         upsert: false,
//       });

//     if (uploadError) throw uploadError;

//     // 4. Ambil URL Publik
//     const { data: publicUrlData } = supabase.storage
//       .from(bucket)
//       .getPublicUrl(fileName);

//     return NextResponse.json({ url: publicUrlData.publicUrl }, { status: 200 });
//   } catch (error) {
//     console.error('API Upload Error:', error);
//     return NextResponse.json(
//       { error: 'Terjadi kesalahan server saat upload' },
//       { status: 500 },
//     );
//   }
// }

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
