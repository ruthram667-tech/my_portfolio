FROM node:22-slim AS build
WORKDIR /app
COPY . .
RUN npm ci && npm run build -w @portfolio/api

FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production PORT=4000 DATABASE_PATH=/data/portfolio.db
COPY --from=build /app/apps/api/dist ./dist
RUN npm i --omit=dev --no-save fastify @fastify/jwt @fastify/cookie @fastify/cors @fastify/helmet @fastify/rate-limit zod
VOLUME /data
EXPOSE 4000
CMD ["node", "dist/server.js"]
