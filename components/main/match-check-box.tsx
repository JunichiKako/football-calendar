'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    // 現状のparamsを渡して、新しいparamsを作成
    const params = new URLSearchParams(searchParams);
    
    // 現在選択されているものを取得 filter(Boolean)で空文字を除外
    const currentSelected =
      params.get('selectedMatches')?.split(',').filter(Boolean) || [];

    // チェックボックスがチェックされている場合、選択されたマッチのIDをSearchParamsに追加
    if (e.target.checked) {
      if (!currentSelected.includes(matchId.toString())) {
        currentSelected.push(matchId.toString());
      }
    } else {
      // チェックボックスがチェックされていない場合、選択されたマッチのIDをSearchParamsから削除
      const index = currentSelected.indexOf(matchId.toString());
      if (index > -1) {
        currentSelected.splice(index, 1);
      }
    }

    // 元々のSearchParamsにselectedMatchesがあれば、新しいselectedMatchesを追加
    if (currentSelected.length > 0) {
      params.set('selectedMatches', currentSelected.join(','));
    } else {
      params.delete('selectedMatches');
    }

    // スクロール位置を維持するオプションを追加 
    // router.replace(`${pathname}?${params.toString()}`, {
    //   scroll: false,
    // });
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
