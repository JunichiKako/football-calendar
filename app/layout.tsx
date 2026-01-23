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
    default: 'サッカー試合日程・放送予定 | Football Calendar',
    template: '%s | Football Calendar',
  },
  description:
    'プレミアリーグ、ラ・リーガ、セリエA、ブンデスリーガ、リーグ・アン、チャンピオンズリーグの試合日程と放送予定を一覧で確認。今日・今週の試合がすぐわかる。',
  keywords: ['サッカー', '試合日程', 'プレミアリーグ', 'ラリーガ', 'セリエA', 'ブンデスリーガ', 'リーグアン', 'チャンピオンズリーグ', '放送予定', 'DAZN', 'U-NEXT', 'WOWOW'],
  openGraph: {
    title: 'サッカー試合日程・放送予定 | Football Calendar',
    description: '欧州サッカーの試合日程と放送予定を一覧で確認',
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'サッカー試合日程・放送予定',
    description: '欧州サッカーの試合日程と放送予定を一覧で確認',
  },
  verification: {
    google: process.env.GOOGLE_SEARCH_CONSOLE_ID,
  },
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
