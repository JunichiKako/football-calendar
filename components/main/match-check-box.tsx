'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTransition, useRef } from 'react';

type MatchCheckboxProps = {
  matchId: number;
  isSelected: boolean;
};

export default function MatchCheckbox({
  matchId,
  isSelected,
}: MatchCheckboxProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // 最新の選択状態を追跡
  const pendingStateRef = useRef<boolean | null>(null);

  const updateSearchParams = (isChecked: boolean) => {
    const params = new URLSearchParams(searchParams);
    const currentSelected =
      params.get('selectedMatches')?.split(',').filter(Boolean) || [];

    if (isChecked) {
      if (!currentSelected.includes(matchId.toString())) {
        currentSelected.push(matchId.toString());
      }
    } else {
      const index = currentSelected.indexOf(matchId.toString());
      if (index > -1) {
        currentSelected.splice(index, 1);
      }
    }

    if (currentSelected.length > 0) {
      params.set('selectedMatches', currentSelected.join(','));
    } else {
      params.delete('selectedMatches');
    }

    return params;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;

    // 最新の状態を保存
    pendingStateRef.current = isChecked;

    // URLの更新を非同期で実行
    startTransition(() => {
      // トランジション内で最新の状態を確認
      const finalState = pendingStateRef.current;
      if (finalState !== null) {
        const newParams = updateSearchParams(finalState);
        router.replace(`${pathname}?${newParams.toString()}`, {
          scroll: false,
        });
        // 処理完了後にリセット
        pendingStateRef.current = null;
      }
    });
  };

  return (
    <input
      type='checkbox'
      name='matches'
      value={matchId.toString()}
      id={matchId.toString()}
      className='peer hidden'
      onChange={handleChange}
      disabled={isPending}
    />
  );
}
