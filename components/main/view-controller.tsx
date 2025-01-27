'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

// view が calendar の場合はサイドバーとFooterを非表示にする
export default function ViewController() {
  const searchParams = useSearchParams();
  const view = searchParams.get('view');

  useEffect(() => {
    // htmlタグのstyleに --sidebar-display というカスタムプロパティをview=calendarの場合、追加
    // データ属性を追加することで、CSSをつけて表示非表示を切り替えてます
    const root = document.documentElement;
    if (view === 'calendar') {
      root.style.setProperty('--sidebar-display', 'none');
    } else {
      root.style.setProperty('--sidebar-display', 'block');
    }
  }, [view]);

  return null;
}
