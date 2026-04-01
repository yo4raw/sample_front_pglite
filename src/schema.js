/**
 * Drizzle ORM スキーマ定義ファイル
 *
 * Drizzleでは、データベースのテーブル構造をJavaScriptのコードとして定義する。
 * これにより、型安全なクエリの構築が可能になる。
 *
 * pgTable関数を使ってPostgreSQL用のテーブルを定義する。
 * PGliteはブラウザ内で動作するPostgreSQLなので、
 * 通常のPostgreSQLと同じスキーマ定義が使える。
 */

import {
  pgTable, // PostgreSQLテーブルを定義するための関数
  serial, // 自動インクリメントの整数型（PostgreSQLのSERIAL型に対応）
  text, // テキスト型（PostgreSQLのTEXT型に対応）
  boolean, // 真偽値型（PostgreSQLのBOOLEAN型に対応）
  timestamp, // タイムスタンプ型（PostgreSQLのTIMESTAMP型に対応）
} from "drizzle-orm/pg-core";

/**
 * todosテーブルの定義
 *
 * pgTable(テーブル名, カラム定義) の形式で定義する。
 * 各カラムは「型関数(DB上のカラム名)」で定義し、
 * メソッドチェーンで制約（NOT NULL, DEFAULT等）を追加する。
 *
 * 例: serial("id").primaryKey()
 *   → PostgreSQLでは「id SERIAL PRIMARY KEY」と同等
 */
export const todos = pgTable("todos", {
  // id: 自動インクリメントの主キー
  // serial型はINSERT時に自動で値が割り振られるため、指定不要
  id: serial("id").primaryKey(),

  // title: TODOの内容（必須）
  // .notNull() を付けることで、NULL値の挿入を禁止する
  title: text("title").notNull(),

  // completed: 完了フラグ
  // .default(false) で、INSERT時に指定しなければfalseが入る
  // .notNull() でNULL値を禁止
  completed: boolean("completed").default(false).notNull(),

  // created_at: 作成日時
  // .defaultNow() で、INSERT時に現在のタイムスタンプが自動設定される
  // .notNull() でNULL値を禁止
  created_at: timestamp("created_at").defaultNow().notNull(),
});
