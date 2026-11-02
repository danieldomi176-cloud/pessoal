import type { Metadata, Viewport } from 'next';
import './globals.css';
import { GeistSans } from 'geist/font/sans';
export const metadata: Metadata = {
  title: { default: 'LifeOS — A melhor versão de mim', template: '%s · LifeOS' },
  description: 'O teu espaço privado para viver com intenção. Um dia de cada vez.',
  robots: { index: false, follow: false },
  icons: { icon: '/icon.svg' },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#0B0B13' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-MZ">
      <body className={GeistSans.variable}>{children}</body>
    </html>
  );
}
