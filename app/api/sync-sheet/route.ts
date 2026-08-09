// import { google } from 'googleapis';
// import { NextResponse } from 'next/server';

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     const {
//       tanggal,
//       kode,
//       nama,
//       alamat,
//       jenis,
//       tipe,
//       berat,
//       harga,
//       bagian_sepertiga,
//     } = body;

//     // 1. Pengecekan Kunci Keamanan (Mencegah error diam-diam)
//     if (
//       !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ||
//       !process.env.GOOGLE_PRIVATE_KEY
//     ) {
//       throw new Error(
//         'Kunci rahasia Google (Email/Private Key) tidak ditemukan di .env.local',
//       );
//     }

//     // 2. Format ulang Private Key (Memperbaiki masalah baris baru \n yang sering rusak)
//     const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(
//       /\\n/g,
//       '\n',
//     ).replace(/"/g, '');

//     // 3. Setup Autentikasi yang lebih modern & kuat
//     const auth = new google.auth.GoogleAuth({
//       credentials: {
//         client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
//         private_key: privateKey,
//       },
//       scopes: ['https://www.googleapis.com/auth/spreadsheets'],
//     });

//     const sheets = google.sheets({ version: 'v4', auth });

//     // Urutan kolom: tanggal, kode, nama, alamat, jenis, tipe, berat, harga, bagian sepertiga
//     const values = [
//       [
//         tanggal,
//         kode,
//         nama,
//         alamat,
//         jenis,
//         tipe,
//         berat,
//         harga,
//         bagian_sepertiga,
//       ],
//     ];

//     const response = await sheets.spreadsheets.values.append({
//       spreadsheetId: process.env.GOOGLE_SHEET_ID,
//       range: "'kurban mni'!A1", // Pastikan nama sheet ini persis dengan yang di bawah/tab Google Sheets
//       valueInputOption: 'USER_ENTERED',
//       requestBody: {
//         values,
//       },
//     });

//     return NextResponse.json({ success: true, data: response.data });
//   } catch (error: any) {
//     console.error('Google Sheet Error:', error);
//     return NextResponse.json(
//       { success: false, error: error.message },
//       { status: 500 },
//     );
//   }
// }
//
//
import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      tanggal,
      kode,
      nama,
      alamat,
      jenis,
      tipe,
      berat,
      harga,
      bagian_sepertiga,
      periode, // Menangkap periode dari frontend
    } = body;

    // 1. Pengecekan Kunci Keamanan (Mencegah error diam-diam)
    if (
      !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ||
      !process.env.GOOGLE_PRIVATE_KEY ||
      !process.env.GOOGLE_SHEET_ID
    ) {
      throw new Error(
        'Kunci rahasia Google (Email/Private Key/Sheet ID) tidak ditemukan di .env.local',
      );
    }

    // 2. Format ulang Private Key (Memperbaiki masalah baris baru \n yang sering rusak)
    const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(
      /\\n/g,
      '\n',
    ).replace(/"/g, '');

    // 3. Setup Autentikasi yang lebih modern & kuat
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    // Tentukan nama Sheet berdasarkan periode (Default jika kosong: "Tanpa Periode")
    const sheetName = periode || 'Tanpa Periode';

    // 4. Cek apakah tab/sheet dengan nama periode tersebut sudah ada
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: spreadsheetId,
    });

    const existingSheets =
      spreadsheet.data.sheets?.map((s) => s.properties?.title) || [];

    // 5. Jika tab belum ada, buat tab baru dan tambahkan Header
    if (!existingSheets.includes(sheetName)) {
      // Buat tab baru
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: sheetName,
                },
              },
            },
          ],
        },
      });

      // Tambahkan Header (Judul Kolom) di tab baru tersebut
      const headers = [
        [
          'Tanggal',
          'Kode TRX',
          'Nama Mudhohi',
          'Alamat',
          'Jenis',
          'Tipe',
          'Berat',
          'Harga (Rp)',
          'Bagian 1/3',
        ],
      ];

      await sheets.spreadsheets.values.append({
        spreadsheetId: spreadsheetId,
        range: `'${sheetName}'!A1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: headers,
        },
      });
    }

    // 6. Siapkan data yang akan dimasukkan
    const values = [
      [
        tanggal,
        kode,
        nama,
        alamat,
        jenis,
        tipe,
        berat,
        harga,
        bagian_sepertiga,
      ],
    ];

    // 7. Masukkan data ke tab yang sesuai dengan periode
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: spreadsheetId,
      range: `'${sheetName}'!A1`, // Menggunakan sheetName dinamis
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });

    return NextResponse.json({ success: true, data: response.data });
  } catch (error: any) {
    console.error('Google Sheet Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
