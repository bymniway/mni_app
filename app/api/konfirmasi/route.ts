import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import sharp from 'sharp';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';

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

    const { data: currentPesanan } = await supabase
      .from('pesanan')
      .select('bukti_transfer_url')
      .eq('id', pesananId)
      .single();

    const isTambahan = !!currentPesanan?.bukti_transfer_url;

    const arrayBuffer = await file.arrayBuffer();
    const avifBuffer = await sharp(Buffer.from(arrayBuffer))
      .avif({ quality: 45, effort: 4 })
      .toBuffer();

    const prefix = isTambahan ? 'tf_tambahan' : 'tf_awal';
    const fileName = `${prefix}_${Date.now()}_${Math.random().toString(36).substring(7)}.avif`;

    if (!getApps().length) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(
            /\\n/g,
            '\n',
          ),
        }),
      });
    }

    const bucket = getStorage().bucket('mni-lan.firebasestorage.app');
    const targetPath = `bukti-transfer/${fileName}`;
    const firebaseFile = bucket.file(targetPath);

    await firebaseFile.save(avifBuffer, {
      metadata: { contentType: 'image/avif' },
    });

    const [signedUrl] = await firebaseFile.getSignedUrl({
      action: 'read',
      expires: '03-09-2499',
    });

    const updatePayload = isTambahan
      ? {
          bukti_tf_tambahan_url: signedUrl,
          status_pesanan: 'Menunggu',
        }
      : {
          bukti_transfer_url: signedUrl,
          status_pesanan: 'Menunggu',
        };

    const { error: updateError } = await supabase
      .from('pesanan')
      .update(updatePayload)
      .eq('id', pesananId);

    if (updateError) throw updateError;

    return NextResponse.json(
      { message: 'Upload berhasil', url: signedUrl },
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
