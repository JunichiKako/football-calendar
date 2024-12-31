import ViewController from '@/components/main/view-contriller';
import Sidebar from '@/components/sidebar/sidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ViewController />
      <div className='flex'>
        <Sidebar />
        <main className='py-8 px-10 flex-1'>{children}</main>
      </div>
    </>
  );
}
