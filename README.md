# 現場アサイン・カレンダー (MVP)

現場ごとのアサインを週表示・日表示で確認できる社内向けPWAです。

## 構成
- Next.js (App Router, TypeScript)
- TailwindCSS
- Supabase (PostgreSQL)

## セットアップ

### 1. 環境変数
`.env.local` を作成して以下を設定してください。

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
COMPANY_CODE=your-company-code
AUTH_SECRET=long-random-secret
```

### 2. Supabase SQL
SupabaseのSQLエディタで以下を実行してください。

- `supabase/schema.sql` (テーブル、RLS、トリガー)
- `supabase/seed.sql` (初期データ)

### 3. 開発起動

```
npm install
npm run dev
```

ブラウザで `http://localhost:3000` を開きます。

## 使い方
- `/login` で会社コード + PIN でログイン
- 週表示で予定を作成・編集・削除
- 詳細画面で履歴を確認
- 管理者は `/admin` でユーザー・現場を管理

## デプロイ
- Vercelにプロジェクトを接続
- 環境変数を設定してデプロイ

## 補足
- 監査ログと通知は `assignments` のトリガーで自動生成されます。
- PWA用の `manifest` は `app/manifest.ts` にあります。
