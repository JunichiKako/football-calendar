import { cn } from '@/lib/utils';
import { getURL } from '@/utils/getURL';
import type { Metadata } from 'next';
import { Noto_Sans_JP } from 'next/font/google';
import { ThemeProvider } from '../components/theme-provider';
import './globals.css';
import { APP_NAME } from '@/config';
import { Toaster } from '@/components/ui/toaster';
import { GoogleAnalytics } from '@next/third-parties/google';

const notoSansJP = Noto_Sans_JP({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(getURL()),
  title: {
    default: APP_NAME,
    template: '%s | Football Calendar',
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

      <html lang='ja' suppressHydrationWarning>
        <body className={cn(notoSansJP.className)}>
          {process.env.NEXT_PUBLIC_GA_ID && (
            <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
          )}
          <ThemeProvider
            attribute='class'
            defaultTheme='system'
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
          <Toaster />
        </body>
      </html>
  );
}
