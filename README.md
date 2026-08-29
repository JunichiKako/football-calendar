# Football Calendar ⚽️

海外サッカーの試合スケジュールを日本語で確認し、Googleカレンダーに追加できるアプリです。

複数の配信サービス（DAZN、U-NEXT、WOWOW）にまたがる試合情報を、ひと目で把握できるようにすることで、
「見逃した」「どこで見れるかわからない」といった課題を解決します。

https://football-match-calendar.vercel.app/

---

## 背景

配信サービスが複数ある中で、効率的に各国のサッカーを観戦したいと思い、自分自身が使いたくなるようなサービスを目指して開発しました。
サッカー好きが快適に週末の観戦スケジュールを立てられるようにサポートします。

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
- 配信サービス（DAZN / U-NEXT / WOWOW）をリーグ単位・試合単位で表示

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
- 配信予定は `data/streaming-data.json` で手動管理しています
  - `byLeague`: リーグ単位のデフォルト
  - `byMatchId`: 試合単位の上書き（デフォルトと異なる場合のみ記載）
- チーム名の日本語表記は `data/translations.ts` で管理しています。昇格チームは毎シーズン追加が必要です
