import Footer from '@/components/footer';
import ViewController from '@/components/main/view-controller';
import Sidebar from '@/components/sidebar/sidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ViewController />
      <div className='flex h-full'>
        <div className='max-xl:hidden'>
          <Sidebar />
        </div>
        <main className='pt-8 pb-4 px-4 md:px-4 lg:px-10 flex-1 overflow-auto'>
          {children}
        </main>
      </div>
    </>
  );
}
