import { cn } from '@/lib/utils';
import { getURL } from '@/utils/getURL';
import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { Noto_Sans_JP } from 'next/font/google';
import { ThemeProvider } from '../components/theme-provider';
import './globals.css';
import { APP_NAME } from '@/config';

const notoSansJP = Noto_Sans_JP({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(getURL()),
  title: {
    default: APP_NAME,
    template: '%s | Football Table',
  },
  description:
    '各国のサッカーリーグのスケジュールを一括で確認できるサイトです。',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang='ja' suppressHydrationWarning>
        <body className={cn(notoSansJP.className)}>
          <ThemeProvider
            attribute='class'
            defaultTheme='system'
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
