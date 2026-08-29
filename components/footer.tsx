import Link from 'next/link';

export default function Footer() {
  return (
    <footer className='mt-16 border-t pt-6 pb-8 text-xs text-muted-foreground space-y-2'>
      {/*
        football-data.org の利用条件で、この帰属表示をアプリまたはサイトの
        見える場所に掲載することが求められている。文言は指定どおりに保つこと。
      */}
      <p>
        Football data provided by the{' '}
        <Link
          href='https://www.football-data.org/'
          target='_blank'
          rel='noopener noreferrer'
          className='underline underline-offset-2 hover:text-foreground'
        >
          Football-Data.org API
        </Link>
      </p>
      <p>
        放送・配信予定は変更される場合があります。視聴前に各サービスの公式情報をご確認ください。
      </p>
    </footer>
  );
}
