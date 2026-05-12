import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const galeriId = searchParams.get('id');
  if (!galeriId)
    return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

  const supabase = getServiceSupabase();

  // Ambil Komentar (Batasi 50 terakhir agar tidak berat saat load)
  const { data: comments } = await supabase
    .from('galeri_komentar')
    .select('id, nama, teks, created_at')
    .eq('galeri_id', galeriId)
    .order('created_at', { ascending: false })
    .limit(50);

  // Hitung Total Likes
  const { count: likesCount } = await supabase
    .from('galeri_likes')
    .select('*', { count: 'exact', head: true })
    .eq('galeri_id', galeriId);

  return NextResponse.json({
    // Balik urutan array agar komentar terlama di atas, terbaru di bawah
    comments: comments ? comments.reverse() : [],
    likes: likesCount || 0,
  });
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const supabase = getServiceSupabase();

    if (data.action === 'LIKE') {
      const { error } = await supabase
        .from('galeri_likes')
        .insert([{ galeri_id: data.galeriId, user_id: data.userId }]);

      // Jika error karena sudah pernah like (Unique Violation) -> Lakukan Unlike
      if (error && error.code === '23505') {
        const { error: deleteError } = await supabase
          .from('galeri_likes')
          .delete()
          .match({ galeri_id: data.galeriId, user_id: data.userId });

        if (deleteError) throw deleteError;
        return NextResponse.json({ message: 'Unliked' });
      }

      // Jika error karena sebab lain (misal tabel belum benar), lemparkan errornya!
      if (error) {
        console.error('Error insert like:', error);
        throw error;
      }

      return NextResponse.json({ message: 'Liked' });
    }

    if (data.action === 'COMMENT') {
      // 🛡️ ANTI-SPAM: Cek kapan terakhir kali device ini komentar
      const { data: lastComment } = await supabase
        .from('galeri_komentar')
        .select('created_at')
        .eq('device_id', data.deviceId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (lastComment) {
        const lastTime = new Date(lastComment.created_at).getTime();
        const now = new Date().getTime();
        const diffInSeconds = (now - lastTime) / 1000;

        if (diffInSeconds < 30) {
          return NextResponse.json(
            {
              error:
                'Terlalu cepat! Tunggu 30 detik sebelum mengirim komentar lagi.',
            },
            { status: 429 },
          );
        }
      }

      // Simpan ke database jika lolos Anti-Spam
      const { error } = await supabase.from('galeri_komentar').insert([
        {
          galeri_id: data.galeriId,
          nama: data.nama,
          teks: data.teks,
          device_id: data.deviceId,
        },
      ]);

      if (error) throw error;
      return NextResponse.json({ message: 'Comment added' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
