/**
 * TODOアプリ メインロジック
 *
 * このファイルでは以下を行う：
 * 1. DBの初期化
 * 2. Drizzleを使ったCRUD操作（追加・一覧取得・完了切替・削除）
 * 3. DOMの操作（UIの描画・イベントハンドリング）
 */

import { eq, desc } from "drizzle-orm";
import { db, initializeDatabase } from "./db.js";
import { todos } from "./schema.js";

// ===================================================
// CRUD操作（Drizzle ORM経由）
// ===================================================

/**
 * TODO一覧を取得する
 *
 * db.select().from(テーブル) で SELECT * FROM テーブル と同等のクエリが発行される。
 * .orderBy() で並び順を指定できる。
 * desc(カラム) で降順（新しい順）になる。
 *
 * 発行されるSQL:
 *   SELECT * FROM todos ORDER BY created_at DESC
 *
 * 戻り値は配列で、各要素はスキーマ定義に対応したオブジェクト。
 * 例: [{ id: 1, title: "買い物", completed: false, created_at: "2024-..." }, ...]
 */
async function getAllTodos() {
  return await db.select().from(todos).orderBy(desc(todos.created_at));
}

/**
 * 新しいTODOを追加する
 *
 * db.insert(テーブル).values(データ) で INSERT文が発行される。
 * .returning() を付けると、挿入されたレコードが戻り値として返される。
 * （PostgreSQL固有の機能。MySQLやSQLiteにはない）
 *
 * 発行されるSQL:
 *   INSERT INTO todos (title) VALUES ('買い物') RETURNING *
 *
 * idやcreated_atはスキーマのdefault設定により自動で入るため、
 * titleだけを指定すればよい。
 *
 * @param {string} title - TODOの内容
 */
async function addTodo(title) {
  await db.insert(todos).values({ title }).returning();
}

/**
 * TODOの完了状態を切り替える
 *
 * db.update(テーブル).set(更新データ).where(条件) で UPDATE文が発行される。
 *
 * eq(カラム, 値) は「カラム = 値」の条件を作る関数。
 * drizzle-ormからインポートして使う。
 *
 * 発行されるSQL:
 *   UPDATE todos SET completed = true WHERE id = 1
 *
 * @param {number} id - TODOのID
 * @param {boolean} currentCompleted - 現在の完了状態
 */
async function toggleTodo(id, currentCompleted) {
  await db
    .update(todos)
    .set({ completed: !currentCompleted })
    .where(eq(todos.id, id));
}

/**
 * TODOを削除する
 *
 * db.delete(テーブル).where(条件) で DELETE文が発行される。
 *
 * 発行されるSQL:
 *   DELETE FROM todos WHERE id = 1
 *
 * @param {number} id - 削除するTODOのID
 */
async function deleteTodo(id) {
  await db.delete(todos).where(eq(todos.id, id));
}

// ===================================================
// UI描画・イベントハンドリング
// ===================================================

/**
 * TODO一覧をHTMLとして描画する
 *
 * DBからデータを取得し、DOMを動的に構築する。
 * 各TODOに対して、完了切替ボタンと削除ボタンを付与する。
 */
async function renderTodos() {
  const todoList = document.getElementById("todo-list");
  const todoItems = await getAllTodos();

  // 一覧をクリアしてから再描画
  todoList.innerHTML = "";

  if (todoItems.length === 0) {
    todoList.innerHTML = '<p class="empty-message">TODOがありません</p>';
    return;
  }

  for (const todo of todoItems) {
    const li = document.createElement("li");
    li.className = `todo-item ${todo.completed ? "completed" : ""}`;

    // チェックボックス: 完了/未完了の切り替え
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.completed;
    checkbox.addEventListener("change", async () => {
      await toggleTodo(todo.id, todo.completed);
      await renderTodos();
    });

    // TODOのタイトル表示
    const titleSpan = document.createElement("span");
    titleSpan.className = "todo-title";
    titleSpan.textContent = todo.title;

    // 作成日時の表示
    const dateSpan = document.createElement("span");
    dateSpan.className = "todo-date";
    dateSpan.textContent = new Date(todo.created_at).toLocaleString("ja-JP");

    // 削除ボタン
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "削除";
    deleteBtn.addEventListener("click", async () => {
      await deleteTodo(todo.id);
      await renderTodos();
    });

    li.appendChild(checkbox);
    li.appendChild(titleSpan);
    li.appendChild(dateSpan);
    li.appendChild(deleteBtn);
    todoList.appendChild(li);
  }
}

/**
 * フォームのイベント設定
 *
 * submitイベントをリッスンし、入力値をDBに保存してから再描画する。
 */
function setupForm() {
  const form = document.getElementById("todo-form");
  const input = document.getElementById("todo-input");

  form.addEventListener("submit", async (e) => {
    // フォームのデフォルト動作（ページリロード）を防止
    e.preventDefault();

    const title = input.value.trim();
    if (!title) return;

    await addTodo(title);
    input.value = "";
    await renderTodos();
  });
}

// ===================================================
// アプリの起動
// ===================================================

/**
 * アプリ全体の初期化処理
 *
 * 1. PGliteのテーブルを作成（初回のみ実行される）
 * 2. フォームのイベントを設定
 * 3. 既存のTODO一覧を描画
 */
async function main() {
  try {
    // ローディング表示
    const todoList = document.getElementById("todo-list");
    todoList.innerHTML = '<p class="loading">データベースを初期化中...</p>';

    // DB初期化: CREATE TABLE IF NOT EXISTS を実行
    await initializeDatabase();

    // UIのセットアップ
    setupForm();

    // 既存データの表示
    await renderTodos();
  } catch (error) {
    console.error("アプリの初期化に失敗しました:", error);
    const todoList = document.getElementById("todo-list");
    todoList.innerHTML = `<p class="error">エラー: ${error.message}</p>`;
  }
}

// DOMの読み込み完了後にアプリを起動
main();
