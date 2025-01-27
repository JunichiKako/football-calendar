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
        <main className='py-8 px-4 lg:px-10 flex-1 overflow-auto'>
          {children}
          <Footer />
        </main>
      </div>
    </>
  );
}
