import Link from 'next/link';

export default function Footer() {
  return (
    <footer
      className='text-sm flex space-x-4 text-muted-foreground cursor-pointer'
      data-calendar-hide
    >
      <Link href='privacy-policy'>プライバシーポリシー</Link>
      <Link href='terms'>利用規約</Link>
      <Link href='legal-information'>特定商取引法に基づく表記</Link>
    </footer>
  );
}
