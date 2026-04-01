import { defineConfig } from "vite";

export default defineConfig({
  // PGliteはWebAssembly（WASM）を使用するため、
  // Viteの開発サーバーで正しいヘッダーを設定する必要がある
  server: {
    // Dockerコンテナ内から外部アクセスできるように0.0.0.0でリッスン
    host: "0.0.0.0",
    port: 5173,
    // SharedArrayBufferを使用するためにCOOP/COEPヘッダーが必要
    // PGliteのWASMはマルチスレッドで動作するため、これらのヘッダーが必須
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },

  // WASMファイルの最適化設定
  optimizeDeps: {
    // PGliteの依存関係を事前バンドルから除外
    // WASMファイルは通常のJSバンドルとは異なる処理が必要なため
    exclude: ["@electric-sql/pglite"],
  },
});
