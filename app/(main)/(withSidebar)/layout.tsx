import ViewController from '@/components/main/view-controller';
import Sidebar from '@/components/sidebar/sidebar';
import { Suspense } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense>
        <ViewController />
      </Suspense>
      <div className='flex h-full'>
        <div className='max-xl:hidden'>
          <Sidebar />
        </div>
        <main data-calendar-view  className='pt-8 pb-4 px-4 lg:px-10 flex-1 overflow-auto'>
          {children}
        </main>
      </div>
    </>
  );
}
