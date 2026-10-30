import type {Metadata, Viewport} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { BottomNav } from '@/components/BottomNav';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Generator Treningów SW',
  description: 'Nowoczesny generator treningu obwodowego dla grup.',
};

export const viewport: Viewport = {
  viewportFit: 'cover',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" suppressHydrationWarning className={inter.variable}>
      <body className="font-body antialiased selection:bg-primary/30 overflow-x-hidden pb-20">
        {/* Global Top Shield - ochrona przed wycięciem aparatu (notch/camera hole) we wszystkich widokach */}
        <div 
          className="fixed top-0 left-0 right-0 h-[calc(max(env(safe-area-inset-top,0px),48px)+24px)] z-40 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, hsl(var(--background) / 0.95) 0%, hsl(var(--background) / 0) 100%)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)'
          }}
          aria-hidden="true"
        />
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
