import { ModeToggle } from '@/components/mode-toggle';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Calendar,
  Clock,
  Trophy,
  CheckCircle,
  Star,
  Globe2,
} from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className='min-h-screen bg-background text-foreground'>

      <header className='px-4 py-4 text-right'>
      <ModeToggle />
      </header>

      {/* Hero Section */}
      <section className='relative min-h-screen flex items-center justify-center overflow-hidden'>
        {/* Background Pattern */}
        <div className='absolute inset-0 bg-grid-pattern opacity-[0.03] dark:opacity-[0.05]' />

        {/* Floating Elements */}
        <div className='absolute inset-0'>
          <div className='absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl animate-pulse' />
          <div className='absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000' />
        </div>

        {/* Content */}
        <div className='relative max-w-5xl mx-auto px-4 py-10 text-center'>
          <div className='inline-block mb-8 px-6 py-2 bg-blue-500/10 dark:bg-blue-500/20 rounded-full'>
            <span className='text-blue-700 dark:text-blue-300 font-semibold'>
              サッカーファン向けの新しい体験
            </span>
          </div>

          <h1 className='text-5xl md:text-7xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400'>
            海外サッカー全試合を
            <br />
            あなたのカレンダーに。
          </h1>

          <p className='text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto'>
            もう日程検索は不要。見たい試合を選んで、ワンクリックで手元に。
            <br />
            月3回まで無料で使えます。
          </p>

          <div className='flex flex-col sm:flex-row gap-4 justify-center items-center mb-16'>
            <Button
              size='lg'
              className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-8 py-6'
            >
              <Link href='/'>無料で試してみる</Link>
              <Calendar className='ml-2 h-5 w-5' />
            </Button>
            {/* <Button size='lg' variant='outline' className='text-lg px-8 py-6'>
              <Link href='/plan'>詳しく見る</Link>
            </Button> */}
          </div>

          {/* Leagues */}
          <div className='max-w-4xl mx-auto'>
            <h2 className='text-2xl font-semibold mb-8 text-center'>
              対応リーグ
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto'>
              <Card className='p-6'>
                <ul className='space-y-3'>
                  <li className='flex items-center text-muted-foreground'>
                    <CheckCircle className='h-4 w-4 mr-2 text-green-500' />
                    プレミアリーグ
                  </li>
                </ul>
              </Card>
              <Card className='p-6'>
                <ul className='space-y-3'>
                  <li className='flex items-center text-muted-foreground'>
                    <CheckCircle className='h-4 w-4 mr-2 text-green-500' />
                    ラ・リーガ
                  </li>
                </ul>
              </Card>
              <Card className='p-6'>
                <ul className='space-y-3'>
                  <li className='flex items-center text-muted-foreground'>
                    <CheckCircle className='h-4 w-4 mr-2 text-green-500' />
                    セリエA
                  </li>
                </ul>
              </Card>
              <Card className='p-6'>
                <ul className='space-y-3'>
                  <li className='flex items-center text-muted-foreground'>
                    <CheckCircle className='h-4 w-4 mr-2 text-green-500' />
                    ブンデスリーガ
                  </li>
                </ul>
              </Card>
              <Card className='p-6'>
                <ul className='space-y-3'>
                  <li className='flex items-center text-muted-foreground'>
                    <CheckCircle className='h-4 w-4 mr-2 text-green-500' />
                    リーグ1
                  </li>
                </ul>
              </Card>
              <Card className='p-6'>
                <ul className='space-y-3'>
                  <li className='flex items-center text-muted-foreground'>
                    <CheckCircle className='h-4 w-4 mr-2 text-green-500' />
                    チャンピオンズリーグ
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Point Section */}
      <section className='py-20'>
        <div className='max-w-4xl mx-auto px-4'>
          <h2 className='text-3xl font-bold text-center mb-12'>
            試合日程、毎週検索してませんか？
          </h2>
          <div className='grid md:grid-cols-2 gap-8'>
            <Card className='p-6'>
              <h3 className='text-xl font-semibold mb-4'>面倒な現状</h3>
              <ul className='space-y-4'>
                <li className='flex items-center text-muted-foreground'>
                  <Clock className='h-5 w-5 mr-2 text-red-500' />
                  プレミア、ラ・リーガ、セリエA、CLの日程チェック
                </li>
                <li className='flex items-center text-muted-foreground'>
                  <Clock className='h-5 w-5 mr-2 text-red-500' />
                  複数サイトの確認が必要
                </li>
                <li className='flex items-center text-muted-foreground'>
                  <Clock className='h-5 w-5 mr-2 text-red-500' />
                  時間がかかる手動での予定管理
                </li>
              </ul>
            </Card>
            <Card className='p-6 bg-blue-50/50 dark:bg-blue-950/50'>
              <h3 className='text-xl font-semibold mb-4'>私たちの解決策</h3>
              <ul className='space-y-4'>
                <li className='flex items-center text-muted-foreground'>
                  <CheckCircle className='h-5 w-5 mr-2 text-green-500' />
                  最新スケジュールを自動取得
                </li>
                <li className='flex items-center text-muted-foreground'>
                  <CheckCircle className='h-5 w-5 mr-2 text-green-500' />
                  ワンクリックでカレンダー追加
                </li>
                <li className='flex items-center text-muted-foreground'>
                  <CheckCircle className='h-5 w-5 mr-2 text-green-500' />
                  すべての試合予定を一元管理
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className='py-20 bg-muted/50'>
        <div className='max-w-4xl mx-auto px-4'>
          <h2 className='text-3xl font-bold text-center mb-12'>
            使い方は簡単 3ステップ
          </h2>
          <div className='grid md:grid-cols-3 gap-8'>
            {[
              {
                step: 'Step 1',
                title: 'リーグを選択',
                icon: Trophy,
              },
              {
                step: 'Step 2',
                title: '試合をクリック',
                icon: Calendar,
              },
              {
                step: 'Step 3',
                title: 'カレンダーに追加',
                icon: CheckCircle,
              },
            ].map((item, index) => (
              <Card
                key={index}
                className='p-6 text-center hover:shadow-xl transition-shadow'
              >
                <div className='flex justify-center mb-4'>
                  <item.icon className='h-12 w-12 text-blue-600 dark:text-blue-400' />
                </div>
                <h3 className='text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2'>
                  {item.step}
                </h3>
                <p className='text-muted-foreground'>{item.title}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className='py-20'>
        <div className='max-w-4xl mx-auto px-4'>
          <h2 className='text-3xl font-bold text-center mb-12'>料金プラン</h2>
          <div className='grid md:grid-cols-2 gap-8 max-w-3xl mx-auto'>
            <Card className='p-8 relative overflow-hidden'>
              <h3 className='text-2xl font-bold mb-4'>無料プラン</h3>
              <p className='text-4xl font-bold mb-6'>
                ¥0 <span className='text-lg text-muted-foreground'>/ 月</span>
              </p>
              <ul className='space-y-4 mb-8'>
                <li className='flex items-center'>
                  <CheckCircle className='h-5 w-5 mr-2 text-green-500' />
                  月3回まで試合追加可能
                </li>
                <li className='flex items-center'>
                  <CheckCircle className='h-5 w-5 mr-2 text-green-500' />
                  全リーグ対応
                </li>
              </ul>
              <Button className='w-full' variant='outline'>
                無料で始める
              </Button>
            </Card>
            <Card className='p-8 relative overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800'>
              <div className='absolute top-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium'>
                人気
              </div>
              <h3 className='text-2xl font-bold mb-4'>有料プラン</h3>
              <p className='text-4xl font-bold mb-6'>
                ¥350 <span className='text-lg text-muted-foreground'>/ 月</span>
              </p>
              <ul className='space-y-4 mb-8'>
                <li className='flex items-center'>
                  <CheckCircle className='h-5 w-5 mr-2 text-green-500' />
                  無制限の試合追加
                </li>
                <li className='flex items-center'>
                  <CheckCircle className='h-5 w-5 mr-2 text-green-500' />
                  全リーグ対応
                </li>
                <li className='flex items-center'>
                  <CheckCircle className='h-5 w-5 mr-2 text-green-500' />
                  優先サポート
                </li>
              </ul>
              <Button className='w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'>
                アップグレード
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className='py-20 relative overflow-hidden'>
        <div className='absolute inset-0 bg-gradient-to-b from-transparent via-muted/50 to-transparent' />
        <div className='relative max-w-4xl mx-auto px-4 text-center'>
          <h2 className='text-3xl font-bold mb-6'>
            海外サッカーをもっとラクに、もっと楽しく。
          </h2>
          <p className='text-xl text-muted-foreground mb-8'>
            面倒だった試合予定管理を、一瞬で。
            <br />
            まずは月3回まで、無料で体験してみてください。
          </p>
          <Button
            size='lg'
            className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6'
          >
            <Link href='/'>無料で始める</Link>
            <Calendar className='ml-2 h-5 w-5' />
          </Button>
        </div>
      </section>
    </main>
  );
}
