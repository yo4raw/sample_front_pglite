FROM node:20-alpine

WORKDIR /app

# 依存関係ファイルを先にコピーしてインストール
# （ソースコード変更時にnpm installのキャッシュが効くようにする）
COPY package.json package-lock.json* ./
RUN npm install

# ソースコードをコピー
COPY . .

# Vite dev serverのポート
EXPOSE 5173

# Vite dev serverを起動
CMD ["npm", "run", "dev"]
