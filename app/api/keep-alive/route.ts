import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('pengaturan_web')
      .select('kunci')
      .limit(1);

    if (error) throw error;

    return NextResponse.json(
      { status: 'Bangun', message: 'Server dan Database aktif!' },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { status: 'Gagal', message: error.message },
      { status: 500 },
    );
  }
}

// import { NextResponse } from 'next/server';
// import { supabase } from '@/lib/supabase';

// export async function GET() {
//   try {
//     const { data, error } = await supabase
//       .from('pengaturan_web')
//       .select('kunci')
//       .limit(1);

//     if (error) throw error;

//     return NextResponse.json(
//       { status: 'Bangun', message: 'Server dan Database aktif!' },
//       { status: 200 },
//     );
//   } catch (error: any) {
//     return NextResponse.json(
//       { status: 'Gagal', message: error.message },
//       { status: 500 },
//     );
//   }
// }
//
