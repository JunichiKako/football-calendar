import { signInWithGoogle, signOut } from '@/actions/auth';
import { Button } from '../ui/button';
import Link from 'next/link';
import { Calendar, CreditCard } from 'lucide-react';
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
          <Button variant='ghost' className='text-white' asChild>
            <Link href='/?view=calendar' className='flex items-center gap-2'>
              <Calendar className='h-4 w-4' />
              カレンダーを見る
            </Link>
          </Button>

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
        <form action={signInWithGoogle}>
          <Button variant='ghost' className='text-white'>
            Googleでログイン
          </Button>
        </form>
      )}
    </div>
  );
}
