FROM node:20-bookworm-slim AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
COPY tsconfig*.json ./
COPY prisma.config.ts ./prisma.config.ts
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-bookworm-slim
WORKDIR /app
# Mantemos as dependências e o tsconfig para o seed funcionar perfeitamente
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json

EXPOSE 3000
CMD ["node", "dist/src/main.js"]