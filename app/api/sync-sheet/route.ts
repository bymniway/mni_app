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
    } = body;

    // 1. Pengecekan Kunci Keamanan (Mencegah error diam-diam)
    if (
      !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ||
      !process.env.GOOGLE_PRIVATE_KEY
    ) {
      throw new Error(
        'Kunci rahasia Google (Email/Private Key) tidak ditemukan di .env.local',
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

    // Urutan kolom: tanggal, kode, nama, alamat, jenis, tipe, berat, harga, bagian sepertiga
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

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "'kurban mni'!A1", // Pastikan nama sheet ini persis dengan yang di bawah/tab Google Sheets Anda
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
