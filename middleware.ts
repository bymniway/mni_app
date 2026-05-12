// import { createServerClient } from '@supabase/ssr';
// import { NextResponse, type NextRequest } from 'next/server';

// export async function middleware(request: NextRequest) {
//   // ==========================================
//   // 1. SETUP RESPONSE & NONCE UNTUK CSP
//   // ==========================================
//   const nonce = btoa(crypto.randomUUID());
//   const requestHeaders = new Headers(request.headers);
//   requestHeaders.set('x-nonce', nonce);

//   let response = NextResponse.next({
//     request: {
//       headers: requestHeaders,
//     },
//   });

//   // ==========================================
//   // 2. MANIPULASI SECURITY HEADERS (Telah Disesuaikan)
//   // ==========================================
//   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

//   // PERBAIKAN CSP: Mengizinkan inline-style, gambar Supabase, dan API Al-Adhan
//   const cspHeader = `
//     default-src 'self';
//     script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval';
//     style-src 'self' 'unsafe-inline';
//     img-src 'self' blob: data: https://images.unsplash.com ${supabaseUrl};
//     font-src 'self';
//     connect-src 'self' ${supabaseUrl} ws://localhost:* http://localhost:* https://api.aladhan.com;
//     object-src 'none';
//     base-uri 'self';
//     form-action 'self';
//     frame-src 'self' https://www.google.com http://googleusercontent.com;
//     frame-ancestors 'none';
//   `
//     .replace(/\s{2,}/g, ' ')
//     .trim();

//   response.headers.set('Content-Security-Policy', cspHeader);
//   response.headers.set('X-Content-Type-Options', 'nosniff');
//   response.headers.set('X-Frame-Options', 'DENY');
//   response.headers.set('X-XSS-Protection', '1; mode=block');
//   response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
//   response.headers.set(
//     'Strict-Transport-Security',
//     'max-age=63072000; includeSubDomains; preload',
//   );

//   // ==========================================
//   // 3. IDENTIFIKASI RUTE
//   // ==========================================
//   const url = request.nextUrl.clone();
//   const isCmsRoute = url.pathname.startsWith('/cms');
//   const isApiAdminRoute = url.pathname.startsWith('/api/admin');
//   const isLoginPage = url.pathname === '/cms/login';
//   const isUnauthorizedPage = url.pathname === '/cms/unauthorized';

//   // ==========================================
//   // 4. RATE LIMITING & BOT DETECTION (Optional)
//   // ==========================================
//   if (isApiAdminRoute || isLoginPage) {
//     response.headers.set('X-RateLimit-Limit', '10');
//     response.headers.set('X-RateLimit-Remaining', '9');
//     const isBot = request.headers.get('x-vercel-ip-is-bot');
//     if (isBot === '1')
//       return new NextResponse('Bot Access Denied', { status: 403 });
//   }

//   // ==========================================
//   // 5. SUPABASE SSR & TOKEN VALIDATION (DIOPTIMALKAN!)
//   // ==========================================
//   // PERBAIKAN PERFORMA: Kita hanya mengecek auth jika user masuk ke rute CMS atau API Admin!
//   // Halaman publik (beranda, artikel, dll) akan dilewati sehingga sangat cepat.
//   if (isCmsRoute || isApiAdminRoute) {
//     const supabase = createServerClient(
//       process.env.NEXT_PUBLIC_SUPABASE_URL!,
//       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//       {
//         cookies: {
//           getAll() {
//             return request.cookies.getAll();
//           },
//           setAll(cookiesToSet) {
//             cookiesToSet.forEach(({ name, value }) =>
//               request.cookies.set(name, value),
//             );
//             response = NextResponse.next({
//               request: { headers: requestHeaders },
//             });
//             cookiesToSet.forEach(({ name, value, options }) =>
//               response.cookies.set(name, value, options),
//             );
//           },
//         },
//       },
//     );

//     const {
//       data: { user },
//     } = await supabase.auth.getUser();

//     if (user) {
//       requestHeaders.set('x-user-id', user.id);
//     }

//     // Blokir akses jika belum login
//     if (!user && !isLoginPage) {
//       if (isApiAdminRoute)
//         return new NextResponse('Unauthorized API Access', { status: 401 });
//       url.pathname = '/cms/login';
//       return NextResponse.redirect(url);
//     }

//     // ==========================================
//     // 6. ROUTING LOGIC & DYNAMIC ACL (KHUSUS ADMIN)
//     // ==========================================
//     if (user && isCmsRoute) {
//       if (isLoginPage) {
//         url.pathname = '/cms/beranda';
//         return NextResponse.redirect(url);
//       }

//       const { data: profile } = await supabase
//         .from('admin_profiles')
//         .select('is_root, akses_halaman, is_active')
//         .eq('id', user.id)
//         .single();

//       // Jika tidak punya profil atau tidak aktif
//       if (!profile || !profile.is_active) {
//         if (!isUnauthorizedPage) {
//           url.pathname = '/cms/unauthorized';
//           return NextResponse.redirect(url);
//         }
//         return response;
//       }

//       requestHeaders.set('x-user-tier', profile.is_root ? 'ROOT' : 'ADMIN');

//       // Cek hak akses untuk Admin biasa (Root otomatis lolos)
//       if (!profile.is_root && !isUnauthorizedPage) {
//         const allowedPaths: string[] = profile.akses_halaman || [];
//         const hasAccess = allowedPaths.some((path) =>
//           url.pathname.startsWith(path),
//         );

//         if (!hasAccess) {
//           url.pathname = '/cms/unauthorized';
//           return NextResponse.redirect(url);
//         }
//       }
//     }
//   }

//   // ==========================================
//   // 7. CONTEXT INJECTION (GEO) - MULTI PLATFORM
//   // ==========================================
//   // 1. Cek Header Cloudflare (Jika di-hosting di VPS + Cloudflare)
//   const cfCountry = request.headers.get('cf-ipcountry');
//   const cfCity = request.headers.get('cf-ipcity');

//   // 2. Cek Header Vercel (Jika di-hosting di Vercel)
//   const vercelCountry = request.headers.get('x-vercel-ip-country');
//   const vercelCity = request.headers.get('x-vercel-ip-city');

//   // 3. Tentukan nilai akhir (Prioritas: Cloudflare -> Vercel -> Default ID)
//   const country = cfCountry || vercelCountry || 'ID';
//   const city = cfCity || vercelCity || 'Jakarta';

//   requestHeaders.set('x-geo-country', country);
//   requestHeaders.set('x-geo-city', city);
//   requestHeaders.set('x-geo-country', country);
//   requestHeaders.set('x-geo-city', city);

//   return response;
// }

// export const config = {
//   matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
// };
//
//
//
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // ==========================================
  // 1. SETUP RESPONSE & NONCE UNTUK CSP
  // ==========================================
  const nonce = btoa(crypto.randomUUID());
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  let response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // ==========================================
  // 2. MANIPULASI SECURITY HEADERS
  // ==========================================
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval';
    style-src 'self' 'unsafe-inline'; 
    img-src 'self' blob: data: https://images.unsplash.com ${supabaseUrl};
    font-src 'self';
    connect-src 'self' ${supabaseUrl} ws://localhost:* http://localhost:* https://api.aladhan.com; 
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-src 'self' https://www.google.com http://googleusercontent.com;
    frame-ancestors 'none';
  `
    .replace(/\s{2,}/g, ' ')
    .trim();

  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload',
  );

  // ==========================================
  // 3. IDENTIFIKASI RUTE
  // ==========================================
  const url = request.nextUrl.clone();
  const isCmsRoute = url.pathname.startsWith('/cms');
  const isApiAdminRoute = url.pathname.startsWith('/api/admin');
  const isLoginPage = url.pathname === '/cms/login';
  const isUnauthorizedPage = url.pathname === '/cms/unauthorized';

  // ==========================================
  // 4. RATE LIMITING (Optional)
  // ==========================================
  if (isApiAdminRoute || isLoginPage) {
    response.headers.set('X-RateLimit-Limit', '10');
    response.headers.set('X-RateLimit-Remaining', '9');
    const isBot = request.headers.get('x-vercel-ip-is-bot');
    if (isBot === '1')
      return new NextResponse('Bot Access Denied', { status: 403 });
  }

  // ==========================================
  // 5. SUPABASE SSR & TOKEN VALIDATION
  // ==========================================
  if (isCmsRoute || isApiAdminRoute) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            );
            response = NextResponse.next({
              request: { headers: requestHeaders },
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      requestHeaders.set('x-user-id', user.id);
    }

    if (!user && !isLoginPage) {
      if (isApiAdminRoute)
        return new NextResponse('Unauthorized API Access', { status: 401 });
      url.pathname = '/cms/login';
      return NextResponse.redirect(url);
    }
    // ==========================================
    // 6. ROUTING LOGIC & DYNAMIC ACL (KHUSUS ADMIN)
    // ==========================================
    if (user && isCmsRoute) {
      // 1. Ambil Profil pakai jalur VIP
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
      );

      const { data: profile, error } = await supabaseAdmin
        .from('admin_profiles')
        .select('is_root, akses_halaman, is_active')
        .eq('id', user.id)
        .single();

      if (error) console.log('🔴 ERROR BACA PROFIL:', error.message);

      if (!profile || !profile.is_active) {
        if (!isUnauthorizedPage) {
          url.pathname = '/cms/unauthorized';
          return NextResponse.redirect(url);
        }
        return response;
      }

      requestHeaders.set('x-user-tier', profile.is_root ? 'ROOT' : 'ADMIN');

      const allowedPaths: string[] = profile.akses_halaman || [];

      // ==========================================
      // 2. JIKA DIA ROOT (DEWA BEBAS MASUK)
      // ==========================================
      if (profile.is_root) {
        if (
          isLoginPage ||
          url.pathname === '/cms' ||
          url.pathname === '/cms/'
        ) {
          url.pathname = '/cms/beranda';
          return NextResponse.redirect(url);
        }
        return response;
      }

      // ==========================================
      // 3. JIKA DIA ADMIN BIASA
      // ==========================================
      if (!isUnauthorizedPage) {
        const hasAccess = allowedPaths.some((path) =>
          url.pathname.startsWith(path),
        );

        // SKENARIO PENDARATAN: Dia baru login, atau diarahkan paksa ke beranda tapi nggak punya izin
        const isLandingAttempt =
          isLoginPage ||
          url.pathname === '/cms' ||
          url.pathname === '/cms/' ||
          (url.pathname === '/cms/beranda' && !hasAccess);

        if (isLandingAttempt) {
          if (allowedPaths.length > 0) {
            // Belokkan langsung ke menu PERTAMA yang dia punya
            url.pathname = allowedPaths[0];
            return NextResponse.redirect(url);
          } else {
            // Kasihan, dia nggak punya KTP / belum diatur hak aksesnya sama sekali
            url.pathname = '/cms/unauthorized';
            return NextResponse.redirect(url);
          }
        }

        // SKENARIO HACKING: Dia mencoba mengetik URL menu terlarang
        if (!hasAccess) {
          url.pathname = '/cms/unauthorized';
          return NextResponse.redirect(url);
        }
      }
    }
  }
  // ==========================================
  // 7. CONTEXT INJECTION (GEO) - Hapus duplikat
  // ==========================================
  const cfCountry = request.headers.get('cf-ipcountry');
  const cfCity = request.headers.get('cf-ipcity');
  const vercelCountry = request.headers.get('x-vercel-ip-country');
  const vercelCity = request.headers.get('x-vercel-ip-city');

  const country = cfCountry || vercelCountry || 'ID';
  const city = cfCity || vercelCity || 'Jakarta';

  requestHeaders.set('x-geo-country', country);
  requestHeaders.set('x-geo-city', city);

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
