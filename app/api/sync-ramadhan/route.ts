import { google } from 'googleapis';
import { NextResponse } from 'next/server';

// Helper Auto-Create Tab & Clear/Rewrite
async function syncToSpreadsheet(
  sheets: any,
  spreadsheetId: string,
  sheetName: string,
  headers: string[],
  dataRows: any[][],
) {
  if (!spreadsheetId)
    throw new Error('Spreadsheet ID belum diatur di .env.local');

  // 1. Cek keberadaan Sheet (Tab)
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
  const existingSheets =
    spreadsheet.data.sheets?.map((s: any) => s.properties?.title) || [];

  // 2. Jika Tab belum ada, buat baru & sisipkan Header
  if (!existingSheets.includes(sheetName)) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{ addSheet: { properties: { title: sheetName } } }],
      },
    });

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `'${sheetName}'!A1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [headers] },
    });
  }

  // 3. Bersihkan data lama (Mulai baris ke-2 ke bawah)
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: `'${sheetName}'!A2:Z`,
  });

  // 4. Masukkan data terbaru
  if (dataRows.length > 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `'${sheetName}'!A2`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: dataRows },
    });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tahun_hijriyah, schedules, finances } = body;

    // Autentikasi Google
    if (
      !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ||
      !process.env.GOOGLE_PRIVATE_KEY
    ) {
      throw new Error('Kunci Google Account tidak ditemukan di .env.local');
    }

    const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(
      /\\n/g,
      '\n',
    ).replace(/"/g, '');

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const sheetName = `${tahun_hijriyah} H`; // Penamaan Tab otomatis (Contoh: "1447 H")

    // Mapping Data Jadwal
    const jadwalHeaders = [
      'ID',
      'Tanggal',
      'Tahun Hijriyah',
      'Imam',
      'Bilal',
      'Penceramah',
      'Donatur Takjil',
      'Alamat Takjil',
      'Status Imam',
      'Status Takjil',
      'Dibuat Pada',
      'Diupdate Pada',
    ];

    const jadwalRows = (schedules || []).map((s: any) => [
      s.id,
      s.tanggal,
      s.tahun_hijriyah,
      s.imam,
      s.bilal,
      s.penceramah || '-',
      s.donatur_takjil || '-',
      s.alamat_takjil || '-',
      s.status_imam ? 'Terlaksana' : 'Menunggu',
      s.status_takjil ? 'Tersalurkan' : 'Menunggu',
      s.created_at,
      s.updated_at,
    ]);

    // Mapping Data Kas Keuangan
    const kasHeaders = [
      'ID',
      'Tanggal',
      'Tahun Hijriyah',
      'Pemasukan (Rp)',
      'Pengeluaran (Rp)',
      'Keterangan Pengeluaran',
      'Dibuat Pada',
      'Diupdate Pada',
    ];

    const kasRows = (finances || []).map((f: any) => [
      f.id,
      f.tanggal,
      f.tahun_hijriyah,
      f.pemasukan || 0,
      f.pengeluaran || 0,
      f.keterangan_pengeluaran || '-',
      f.created_at,
      f.updated_at,
    ]);

    // Eksekusi Paralel
    await Promise.all([
      syncToSpreadsheet(
        sheets,
        process.env.GOOGLE_SHEET_ID_RAMADHAN_JADWAL as string,
        sheetName,
        jadwalHeaders,
        jadwalRows,
      ),
      syncToSpreadsheet(
        sheets,
        process.env.GOOGLE_SHEET_ID_RAMADHAN_KAS as string,
        sheetName,
        kasHeaders,
        kasRows,
      ),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Sync GSheet Ramadhan Berhasil',
    });
  } catch (error: any) {
    console.error('Google Sheet Ramadhan Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
