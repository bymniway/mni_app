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
