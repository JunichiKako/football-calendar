// ログイン機能を一時的に無効化
// import { signInWithGoogle, signOutWithGoogle } from '@/actions/auth';
// import { Button } from '../ui/button';
// import Link from 'next/link';
// import { Calendar } from 'lucide-react';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';
// import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
// import { currentUser } from '@/data/auth';
// import { ThemeMenu } from '../theme-menu';

export default function UserMenu() {
  return null;

  // --- 以下、ログイン機能復活時に使用 ---
  // const user = await currentUser();
  // return (
  //   <div className='flex items-center gap-4'>
  //     {user ? (
  //       <div className='flex items-center gap-3'>
  //         <div className='hidden lg:block'>
  //           <Button variant='ghost' className='text-white' asChild>
  //             <Link href='/?view=calendar' className='flex items-center gap-2'>
  //               <Calendar className='h-4 w-4' />
  //               カレンダーを見る
  //             </Link>
  //           </Button>
  //         </div>
  //         <DropdownMenu>
  //           <DropdownMenuTrigger>
  //             <Avatar>
  //               <AvatarImage src={user.user_metadata.avatar_url} />
  //               <AvatarFallback>
  //                 {user.user_metadata.full_name?.charAt(0) || 'U'}
  //               </AvatarFallback>
  //             </Avatar>
  //           </DropdownMenuTrigger>
  //           <DropdownMenuContent align='end'>
  //             <div className='lg:hidden'>
  //               <DropdownMenuItem asChild>
  //                 <Link href='/?view=calendar' className='flex items-center gap-2'>
  //                   <Calendar className='h-4 w-4' />
  //                   カレンダーを見る
  //                 </Link>
  //               </DropdownMenuItem>
  //             </div>
  //             <div className='lg:hidden'>
  //               <ThemeMenu />
  //             </div>
  //             <DropdownMenuItem>
  //               <form action={signOutWithGoogle} className='w-full'>
  //                 <button className='w-full text-left'>ログアウト</button>
  //               </form>
  //             </DropdownMenuItem>
  //           </DropdownMenuContent>
  //         </DropdownMenu>
  //       </div>
  //     ) : (
  //       <div className='flex'>
  //         <form action={signInWithGoogle}>
  //           <Button variant='ghost' className='text-white'>
  //             ログイン
  //           </Button>
  //         </form>
  //       </div>
  //     )}
  //   </div>
  // );
}
