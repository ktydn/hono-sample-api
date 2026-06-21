# Hono Sample API

Hono + TypeScript で構築したサンプルAPIと、React + Vite + TypeScript で構築したフロントエンドのフルスタックアプリケーションです。

- **バックエンド**: Cloudflare Workers 上で動作する RESTful API
- **フロントエンド**: Cloudflare Pages でホストされた SPA

---

## アーキテクチャ

```
┌──────────────────────────┐     ┌──────────────────────────────┐
│   Cloudflare Pages       │     │   Cloudflare Workers         │
│   (SPA - React + Vite)   │────▶│   (REST API - Hono)         │
│                          │     │                              │
│   hono-sample-api-       │     │   hono-sample-api.           │
│   frontend.pages.dev     │     │   bashi-sample-api.          │
│                          │     │   workers.dev                │
└──────────────────────────┘     └──────────────────────────────┘
```

## 技術スタック

### 共通

| 項目 | 使用技術 |
|------|----------|
| 言語 | TypeScript |
| ランタイム | Node.js |
| パッケージマネージャ | npm |
| クラウドプラットフォーム | Cloudflare |

### バックエンド (hono-sample-api/)

| 項目 | 使用技術 |
|------|----------|
| フレームワーク | [Hono](https://honojs.dev/) v4 |
| 実行環境 | Cloudflare Workers |
| 開発ツール | Wrangler CLI, tsx |
| デプロイ先 | https://hono-sample-api.bashi-sample-api.workers.dev |

### フロントエンド (hono-sample-api/frontend/)

| 項目 | 使用技術 |
|------|----------|
| フレームワーク | React 19 |
| ビルドツール | Vite 6 |
| 言語 | TypeScript |
| スタイリング | CSS（カスタム） |
| ホスティング | Cloudflare Pages |
| デプロイ先 | https://4515fa54.hono-sample-api-frontend.pages.dev |

---

## バックエンド API 仕様

ベースURL: `https://hono-sample-api.bashi-sample-api.workers.dev`

### エンドポイント一覧

| メソッド | パス | 説明 |
|----------|------|------|
| `GET` | `/` | API情報を取得 |
| `GET` | `/items` | 全アイテムを取得 |
| `GET` | `/items/:id` | 特定のアイテムを取得 |
| `POST` | `/items` | 新規アイテムを作成 |
| `PUT` | `/items/:id` | アイテムを更新 |
| `DELETE` | `/items/:id` | アイテムを削除 |

### データモデル

```typescript
interface Item {
  id: number
  name: string
  description: string
  createdAt: string // ISO 8601
}
```

### 使用例

```bash
# 全アイテム取得
curl https://hono-sample-api.bashi-sample-api.workers.dev/items

# 新規アイテム作成
curl -X POST https://hono-sample-api.bashi-sample-api.workers.dev/items \
  -H "Content-Type: application/json" \
  -d '{"name": "新しいアイテム", "description": "説明文"}'

# アイテム更新
curl -X PUT https://hono-sample-api.bashi-sample-api.workers.dev/items/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "更新後の名前"}'

# アイテム削除
curl -X DELETE https://hono-sample-api.bashi-sample-api.workers.dev/items/1
```

---

## フロントエンド 画面構成

- **アイテム追加フォーム**: Name（必須）と Description（任意）を入力して追加
- **アイテム一覧テーブル**: ID、Name、Description を表示
- **編集機能**: テーブル内でインライン編集（Save / Cancel）
- **削除機能**: 各アイテムに削除ボタン
- **エラーハンドリング**: エラーメッセージ表示（クリックで閉じる）
- **レスポンシブ**: モバイル対応（600px以下で縦方向レイアウト）

---

## 開発環境セットアップ

### 前提条件

- Node.js 18+
- npm
- Cloudflare アカウント

### バックエンド

```bash
cd hono-sample-api

# 依存関係インストール
npm install

# ローカル開発サーバー起動
npm run dev

# Cloudflare Workers にデプロイ
npm run deploy
```

### フロントエンド

```bash
cd hono-sample-api/frontend

# 依存関係インストール
npm install --no-bin-links  # Windows WSL環境の場合

# 開発サーバー起動（http://localhost:5173）
npm run dev

# プロダクションビルド
npm run build

# Cloudflare Pages にデプロイ
npm run deploy
```

---

## ディレクトリ構造

```
hono-sample-api/
├── README.md
├── package.json              # バックエンド設定
├── tsconfig.json             # バックエンド TypeScript設定
├── wrangler.toml             # Workers デプロイ設定
├── src/
│   └── index.ts              # APIエントリーポイント（Honoルーター）
└── frontend/
    ├── README.md
    ├── package.json          # フロントエンド設定
    ├── tsconfig.json         # フロントエンド TypeScript設定
    ├── vite.config.ts        # Vite ビルド設定
    ├── wrangler.toml         # Pages デプロイ設定
    ├── index.html            # HTMLエントリーポイント
    └── src/
        ├── main.tsx          # React エントリーポイント
        ├── App.tsx           # メインコンポーネント
        ├── App.css           # スタイル
        └── vite-env.d.ts     # Vite 型定義