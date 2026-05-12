import './globals.css';

export const metadata = {
  title: 'Masjid Nurul Iman',
  description: 'Aplikasi Penjualan Hewan Kurban Masjid Nurul Iman',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='id'>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
