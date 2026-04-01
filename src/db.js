/**
 * PGlite + Drizzle ORM データベース初期化ファイル
 *
 * ===== PGliteとは =====
 * PGliteは、PostgreSQLをWebAssembly（WASM）にコンパイルしたもの。
 * ブラウザのJavaScriptから直接PostgreSQLを操作できる。
 *
 * 通常のPostgreSQLはサーバー上で動作するが、PGliteは以下が異なる：
 * - ブラウザ内のWASMとして動作（サーバー不要）
 * - データはIndexedDBに永続化できる（ページリロードしても保持される）
 * - 単一ユーザー向け（同時接続の概念がない）
 * - SQLの互換性が高い（ほぼ完全なPostgreSQL）
 *
 * ===== Drizzle ORMとは =====
 * Drizzle ORMは、TypeScript/JavaScript向けの軽量ORMライブラリ。
 * SQLに近い直感的なAPIでデータベース操作ができる。
 *
 * Drizzleの特徴：
 * - スキーマをJSコードで定義（schema.jsを参照）
 * - SQLライクなクエリビルダー（db.select().from(table)のような書き方）
 * - 複数のDBドライバに対応（PostgreSQL, MySQL, SQLite, PGlite等）
 * - 軽量で高速（バンドルサイズが小さい）
 */

import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { count } from "drizzle-orm";
import { todos } from "./schema.js";
import initData from "../init.json";

/**
 * PGliteクライアントの作成
 *
 * "idb://todo-app" はIndexedDBのデータベース名を指定している。
 * - "idb://" プレフィックス: IndexedDBを永続化先として使うことを示す
 * - "todo-app": IndexedDB内のデータベース名
 *
 * これにより、ブラウザをリロードしてもデータが保持される。
 * もし "idb://" を付けない場合（例: new PGlite()）、
 * データはメモリ上にのみ存在し、リロードで消える。
 */
const client = new PGlite("idb://todo-app");

/**
 * Drizzle ORMインスタンスの作成
 *
 * drizzle関数にPGliteクライアントを渡すことで、
 * Drizzleのクエリビルダーを通じてPGliteを操作できるようになる。
 *
 * この `db` オブジェクトを使って、以下のようなCRUD操作を行う：
 * - db.select().from(todos)         → SELECT * FROM todos
 * - db.insert(todos).values({...})  → INSERT INTO todos VALUES (...)
 * - db.update(todos).set({...})     → UPDATE todos SET ...
 * - db.delete(todos).where(...)     → DELETE FROM todos WHERE ...
 */
export const db = drizzle(client);

/**
 * データベースの初期化（テーブル作成）
 *
 * PGliteはブラウザ内で動くため、通常のDBマイグレーションツール
 * （drizzle-kit push等）は使えない。
 * 代わりに、アプリ起動時にSQLを直接実行してテーブルを作成する。
 *
 * CREATE TABLE IF NOT EXISTS を使うことで、
 * テーブルが既に存在する場合（2回目以降のアクセス）はスキップされる。
 *
 * ※ client.exec() はPGliteの低レベルAPI。
 *    Drizzle経由ではなく、直接SQLを実行する。
 *    テーブル作成のような DDL（Data Definition Language）は
 *    Drizzleのクエリビルダーでは実行できないため、
 *    PGliteのexec()を直接使う。
 */
export async function initializeDatabase() {
  await client.exec(`
    CREATE TABLE IF NOT EXISTS todos (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      completed BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMP NOT NULL DEFAULT now()
    );
  `);

  // ===== 初期データの投入 =====
  // テーブルが空の場合のみ、init.jsonから初期データを投入する。
  // 2回目以降のアクセスでは既にデータがあるためスキップされる。
  //
  // count() はDrizzleの集計関数で、レコード数を返す。
  // db.select({ count: count() }).from(todos) は
  //   SELECT count(*) AS count FROM todos
  // と同等のSQLを発行する。
  const [{ count: rowCount }] = await db
    .select({ count: count() })
    .from(todos);

  if (Number(rowCount) === 0) {
    // init.jsonの内容をDBに一括挿入する。
    // Drizzleのinsert().values()には配列を渡すことで
    // 複数レコードを一度にINSERTできる。
    //
    // 発行されるSQL:
    //   INSERT INTO todos (title, completed) VALUES
    //     ('PGliteのドキュメントを読む', false),
    //     ('Drizzle ORMのCRUD操作を試す', false),
    //     ...
    await db.insert(todos).values(initData);
    console.log(`init.jsonから${initData.length}件の初期データを投入しました`);
  }
}
