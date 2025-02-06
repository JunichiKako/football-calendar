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
      root.style.setProperty('--main-padding', '0.25rem');
      root.style.setProperty('--main-padding-md', '0.25rem');
      // data属性に値を設定
      document
        .querySelector('main[data-calendar-view]')
        ?.setAttribute('data-calendar-view', 'true');
    } else {
      root.style.setProperty('--sidebar-display', 'block');
      // data属性を削除または空に
      document
        .querySelector('main[data-calendar-view]')
        ?.setAttribute('data-calendar-view', '');
    }
  }, [view]);

  return null;
}
