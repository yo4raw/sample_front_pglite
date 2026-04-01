# PGlite + Drizzle TODOアプリ 仕様書

## 目的

- PGlite（ブラウザ内PostgreSQL）とDrizzle ORMの学習
- フロントエンドのみで完結するシンプルなTODOアプリ

## 技術スタック

| 項目 | 選定 |
|---|---|
| フレームワーク | Vanilla JS（フレームワークなし） |
| DB | PGlite（ブラウザ内WASM PostgreSQL） |
| ORM | Drizzle ORM |
| ビルドツール | Vite |
| パッケージマネージャ | npm |
| UI | シンプルなHTML + CSS |
| 実行環境 | Docker Compose（Vite dev server） |

## 機能

- TODOの追加
- TODO一覧の表示
- 完了/未完了の切り替え
- TODOの削除

## データモデル

### todosテーブル

| カラム | 型 | 備考 |
|---|---|---|
| id | serial | 主キー |
| title | text | TODO内容（NOT NULL） |
| completed | boolean | 完了フラグ（デフォルト: false） |
| created_at | timestamp | 作成日時（デフォルト: now()） |

## アーキテクチャ

- サーバサイドの処理は一切なし
- ブラウザ内のPGliteにDrizzle経由でCRUD操作
- Vite dev serverをDockerコンテナ内で起動
- `docker compose up -d` で動作すること

## コメント方針

学習目的のため、以下の箇所に重点的にコメントを記述する：

- PGliteの初期化・接続の仕組み
- Drizzleのスキーマ定義とマイグレーション
- DrizzleのCRUD操作（select, insert, update, delete）
- PGliteがブラウザ内でどう動いているかの概要
