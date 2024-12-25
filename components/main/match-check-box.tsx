'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type MatchCheckboxProps = {
  matchId: string | number;
  isSelected: boolean;
};

export default function MatchCheckbox({
  matchId,
  isSelected,
}: MatchCheckboxProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // スクロール位置を維持するオプションを追加
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
      checked={isSelected}
      onChange={handleChange}
    />
  );
}
