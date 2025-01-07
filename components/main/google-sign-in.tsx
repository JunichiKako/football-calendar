import { signInWithGoogle, signOut } from '@/actions/auth';
import { Button } from '../ui/button';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Calendar } from 'lucide-react';

export default async function GoogleSignIn() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

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
          <form action={signOut}>
            <Button variant='ghost' className='text-white'>
              ログアウト
            </Button>
          </form>
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
