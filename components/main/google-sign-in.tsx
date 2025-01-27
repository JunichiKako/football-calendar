import { signInWithGoogle, signOut } from '@/actions/auth';
import { Button } from '../ui/button';
import Link from 'next/link';
import { Calendar, CreditCard, Sun, Moon } from 'lucide-react';
import { createPortalSession } from '@/actions/stripe';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { currentUser } from '@/data/auth';

export default async function GoogleSignIn() {
  const user = await currentUser();

  return (
    <div className='flex items-center gap-4'>
      {user ? (
        <div className='flex items-center gap-4'>
          {/* lg以上の画面幅でプランとカレンダーリンクを表示 */}
          <div className='hidden lg:block'>
            <Button variant='ghost' className='text-white' asChild>
              <Link href='/plan' className='flex items-center gap-2'>
                プラン
              </Link>
            </Button>
            <Button variant='ghost' className='text-white' asChild>
              <Link href='/?view=calendar' className='flex items-center gap-2'>
                <Calendar className='h-4 w-4' />
                カレンダーを見る
              </Link>
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar>
                <AvatarImage
                  src={user.user_metadata.avatar_url}
                  alt={user.user_metadata.full_name}
                />
                <AvatarFallback>
                  {user.user_metadata.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              {/* lg未満の画面幅でプランとカレンダーリンクをドロップダウンに表示 */}
              <div className='lg:hidden'>
                <DropdownMenuItem asChild>
                  <Link href='/plan'>プラン</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href='/?view=calendar'
                    className='flex items-center gap-2'
                  >
                    <Calendar className='h-4 w-4' />
                    カレンダーを見る
                  </Link>
                </DropdownMenuItem>
              </div>
              <DropdownMenuItem>
                <form action={createPortalSession} className='w-full'>
                  <button className='w-full text-left flex items-center gap-2'>
                    <CreditCard className='h-4 w-4' />
                    サブスクリプション管理
                  </button>
                </form>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <form action={signOut} className='w-full'>
                  <button className='w-full text-left'>ログアウト</button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        <div className='flex'>
          <form action={signInWithGoogle}>
            <Button variant='ghost' className='text-white'>
              Googleでログイン
            </Button>
          </form>
          <Link href='plan'>
            <Button variant='ghost' className='text-white' asChild>
              プラン
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
