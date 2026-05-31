# Aplikasi Manajemen Kurban Masjid Nurul Iman (MNI)

Sistem informasi manajemen kurban digital berbasis web yang dirancang untuk memudahkan proses pendaftaran, konfirmasi pembayaran, pengelolaan katalog hewan, hingga pelacakan distribusi daging kurban secara _real-time_.

## Arsitektur & Teknologi Utama

Aplikasi ini dibangun menggunakan arsitektur modern (_Modern Web Stack_):

- **Framework Utama:** Next.js (App Router) & React
- **Styling & Animasi:** Tailwind CSS, Framer Motion, Lucide Icons
- **Database & Backend:** Supabase (PostgreSQL, Realtime, API)
- **Cloud Storage:** Alibaba Cloud OSS, Firebase, Cloudinary
- **Optimization:** Browser Image Compression (Kompresi aset otomatis di sisi klien/HP)
- **Deployment & CI/CD:** Vercel & GitHub Actions (Automated Keep-Alive Cron Jobs)

## Fitur Unggulan

### 1. Portal Publik & Jamaah

- **Katalog Kurban Interaktif:** Tampilan _grid_ & _list_ elegan ala _e-commerce_ modern.
- **Pendaftaran & Checkout Mudah:** Alur pengisian form mudhohi dan pilihan sedekah hak daging (1/3 bagian).
- **Konfirmasi Pembayaran Anti-Gagal:** Upload bukti transfer dengan sistem kompresi gambar otomatis (membypass _limit_ Vercel payload).
- **Lacak Status Pesanan:** Jamaah dapat melacak progress kurban mereka secara _real-time_ dengan riwayat _log_ layaknya pengiriman paket.
- **Dan Semua Fasilitas dan Informasi Terpadu yang Terhimpun dalam satu Web-App**

### 2. Dasbor Admin (CMS)

- Manajemen inventaris hewan kurban (Tambah, Edit, Sembunyikan, Buang ke Tong Sampah).
- _Multi-Select Action_ untuk manipulasi data massal.
- Pengaturan dinamis via Supabase (Nomor Rekening, QRIS, No WA Panitia, dll) tanpa perlu menyentuh kode.

Dibuat untuk dedikasi dan kemudahan operasional Kurban di Masjid Nurul Iman.
