'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function ViewController() {
  const searchParams = useSearchParams();
  const view = searchParams.get('view');

  useEffect(() => {
    const root = document.documentElement;
    if (view === 'calendar') {
      root.style.setProperty('--sidebar-display', 'none');
    } else {
      root.style.setProperty('--sidebar-display', 'block');
    }
  }, [view]);

  return null;
}
