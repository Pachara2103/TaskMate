FROM oven/bun:1.1.10

WORKDIR /app

COPY bun.lock package.json tsconfig.json ./

RUN bun install

COPY . .

EXPOSE 3000 4000

CMD ["bun", "src/index.ts"]
