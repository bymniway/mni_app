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

    // 1. KOMPRES FOTO DENGAN SHARP (Menghemat Storage Masjid)
    const arrayBuffer = await file.arrayBuffer();
    const avifBuffer = await sharp(Buffer.from(arrayBuffer))
      .avif({ quality: 50, effort: 4 })
      .toBuffer();

    const fileName = `tf_susulan_${Date.now()}_${Math.random().toString(36).substring(7)}.avif`;

    // 2. UPLOAD KE SUPABASE MENGGUNAKAN SERVICE ROLE KEY
    const { error: uploadError } = await supabase.storage
      .from('bukti_transfer')
      .upload(fileName, avifBuffer, { contentType: 'image/avif' });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from('bukti_transfer')
      .getPublicUrl(fileName);

    // 3. UPDATE STATUS DI DATABASE MENJADI "Menunggu"
    const { error: updateError } = await supabase
      .from('pesanan')
      .update({
        bukti_transfer_url: publicUrlData.publicUrl,
        status_pesanan: 'Menunggu',
      })
      .eq('id', pesananId);

    if (updateError) throw updateError;

    return NextResponse.json(
      {
        message: 'Upload berhasil',
        url: publicUrlData.publicUrl,
      },
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
