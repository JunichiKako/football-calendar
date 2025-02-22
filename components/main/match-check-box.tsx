'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useOptimistic } from 'react';

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

  // 楽観的な更新のための状態管理
  const [optimisticChecked, addOptimisticCheck] = useOptimistic(
    isSelected,
    (state, newValue: boolean) => newValue
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 楽観的に更新
    addOptimisticCheck(e.target.checked);

    // URLパラメータの更新
    const params = new URLSearchParams(searchParams);
    const currentSelected =
      params.get('selectedMatches')?.split(',').filter(Boolean) || [];

    if (e.target.checked) {
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

    router.replace(`${pathname}?${params.toString()}`, {
      scroll: false,
    });
  };

  return (
    <input
      type='checkbox'
      name='matches'
      value={matchId.toString()}
      id={matchId.toString()}
      className='peer hidden'
      checked={optimisticChecked}
      onChange={handleChange}
    />
  );
}
