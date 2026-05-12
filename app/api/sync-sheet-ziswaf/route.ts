import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tanggal, kode_trx, nama, kategori, nominal, status, pesan } = body;

    // 1. Pengecekan Kunci Keamanan
    if (
      !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ||
      !process.env.GOOGLE_PRIVATE_KEY
    ) {
      throw new Error('Kunci rahasia Google tidak ditemukan di .env.local');
    }

    const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(
      /\\n/g,
      '\n',
    ).replace(/"/g, '');

    // 2. Setup Autentikasi
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // 3. Urutan Data Sesuai Header ZISWAF
    const values = [
      [tanggal, kode_trx, nama, kategori, nominal, status, pesan || '-'],
    ];

    // 4. Kirim ke tab "Ziswaf"
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID_ZISWAF,
      range: 'Ziswaf!A1', // <-- Membidik tab Ziswaf secara presisi
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });

    return NextResponse.json({ success: true, data: response.data });
  } catch (error: any) {
    console.error('Google Sheet ZISWAF Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
