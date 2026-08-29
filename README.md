# Football Calendar ⚽️

海外サッカーの試合スケジュールを日本語で確認し、Googleカレンダーに追加できるアプリです。

欧州主要リーグの試合日程をまとめて確認でき、カレンダーに購読すれば日程変更も自動で反映されます。

https://football-match-calendar.vercel.app/

---

## 背景

深夜キックオフの試合を見逃さないようにしたいと思い、自分自身が使いたくなるサービスを目指して開発しました。
サッカー好きが快適に観戦スケジュールを立てられるようにサポートします。

---

## 技術スタック

- **Next.js (App Router)**
- **TypeScript**
- **Tailwind CSS**
- **football-data.org**（試合データ）

---

## 主な機能

- 海外主要リーグ（プレミア、ラ・リーガ、ブンデス、セリエA、リーグ・アン、CL）の試合スケジュールを表示
- 外部APIの10回/分という制限の中で、Next.jsのキャッシュを使って最適化
- 試合のフィルターや時間順への切り替えはURLに状態を保存
- 試合ごとにGoogleカレンダーへ追加（URLスキーム方式・認証不要）

---

## セットアップ

```bash
npm install
cp .env.local.example .env.local  # FOOTBALL_API_KEY を設定
npm run dev
```

---

## データについて

- 試合データは [football-data.org](https://www.football-data.org/) の無料プランを利用しています
- チーム名の日本語表記は `data/translations.ts` で管理しています。昇格チームは毎シーズン追加が必要です
