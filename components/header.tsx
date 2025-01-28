import { Button } from '@/components/ui/button';
import { getLeagueByGroup } from '@/data/league';
import Link from 'next/link';
import MobileNav from './mobile-nav';
import { ModeToggle } from './mode-toggle';
import UserMenu from './main/user-menu';


export default async function Header() {
  // モバイル用のナビゲーションメニューを表示するために、取得
  const leagueByGroup = await getLeagueByGroup();

  return (
    <header className='sticky gap-4 top-0 z-50 h-14 flex items-center px-4 border-b bg-[#4BCBEE] dark:bg-[#050401]'>
      <MobileNav leagueByGroup={leagueByGroup} />
      <Button variant='ghost' className='-ml-2 text-lg' asChild>
        <Link href='/?view=league' className='ms-2 font-semibold text-white'>
          Football Table
        </Link>
      </Button>
      <span className='flex-1'></span>
      <UserMenu />
      <ModeToggle />
    </header>
  );
}
