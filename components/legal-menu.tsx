import Link from 'next/link';
import { MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function LegalMenu() {
  return (
    <div className='text-white'>
      <DropdownMenu>
        <DropdownMenuTrigger className='inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9'>
          <MoreVertical className='h-4 w-4' />
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem asChild>
            <Link href='privacy-policy'>プライバシーポリシー</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href='terms'>利用規約</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href='legal-information'>特定商取引法に基づく表記</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
