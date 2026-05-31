import './globals.css';
import PublicPreloader from '../components/public/PublicPreloader';

export const metadata = {
  title: 'Masjid Nurul Iman LAN',
  description: 'Website Masjid Nurul Iman LAN',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='id'>
      <body className='[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
        <PublicPreloader />

        {children}
      </body>
    </html>
  );
}
