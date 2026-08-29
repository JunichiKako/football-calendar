'use client';

import Link, { useLinkStatus } from 'next/link';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * 遷移中であることを示すスピナー。
 * useLinkStatus は Link の子孫でのみ動くため、別コンポーネントに切り出している。
 */
function PendingIndicator() {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return <Loader2 className='size-3.5 animate-spin' aria-hidden />;
}

type RangeLinkProps = {
  href: string;
  active: boolean;
  children: React.ReactNode;
};

export default function RangeLink({ href, active, children }: RangeLinkProps) {
  return (
    <Link
      href={href}
      aria-current={active ? 'true' : undefined}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors border-l first:border-l-0',
        active
          ? 'bg-foreground text-background'
          : 'text-muted-foreground hover:bg-accent'
      )}
    >
      {children}
      <PendingIndicator />
    </Link>
  );
}
