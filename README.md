# PGlite + Drizzle TODO アプリ

ブラウザ内PostgreSQL（PGlite）とDrizzle ORMで動くシンプルなTODOアプリ。
サーバサイドの処理は一切なく、全てフロントエンドで完結する。

## 技術スタック

| 項目 | 選定 |
| --- | --- |
| フレームワーク | Vanilla JS |
| DB | PGlite（ブラウザ内WASM PostgreSQL） |
| ORM | Drizzle ORM |
| ビルドツール | Vite |
| 実行環境 | Docker Compose |

## 機能

- TODO の追加
- TODO 一覧の表示（作成日時の降順）
- 完了 / 未完了の切り替え
- TODO の削除

## ファイル構成

```
├── index.html          # エントリーポイント
├── style.css           # スタイル
├── src/
│   ├── schema.js       # Drizzle スキーマ定義（todosテーブル）
│   ├── db.js           # PGlite 初期化 + Drizzle 接続
│   └── app.js          # CRUD 操作 + DOM 操作
├── vite.config.js      # Vite 設定（COOP/COEP ヘッダー等）
├── Dockerfile
├── docker-compose.yml
└── spec.md             # 仕様書
```

## 起動方法

```bash
docker compose up -d
```

http://localhost:5173 にアクセス。

## 学習ポイント

各ソースファイルにコメントで解説を記載している。

- **src/schema.js** - `pgTable` によるテーブル定義、カラム型と制約の指定方法
- **src/db.js** - PGlite の初期化（IndexedDB 永続化）、Drizzle との接続方法
- **src/app.js** - Drizzle の CRUD 操作（`select`, `insert`, `update`, `delete`）
- **vite.config.js** - PGlite の WASM 実行に必要な COOP/COEP ヘッダー設定
