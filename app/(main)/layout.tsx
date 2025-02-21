import Header from '@/components/header';
import { Analytics } from '@vercel/analytics/react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <div className='h-[calc(100dvh-56px)]'>{children}</div>
      <Analytics />
    </>
  );
}
