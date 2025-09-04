# ---------- deps ----------
FROM node:20-bullseye-slim AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
ENV NPM_CONFIG_FUND=false NPM_CONFIG_AUDIT=false npm_config_ignore_scripts=true
RUN npm ci --omit=dev --no-audit --no-fund

# ---------- builder ----------
FROM node:20-bullseye-slim AS builder
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_OPTIONS=--max_old_space_size=1536
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate || true
RUN npm run build

# ---------- runner ----------
FROM node:20-bullseye-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    NEXT_TELEMETRY_DISABLED=1
RUN useradd -m appuser
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
EXPOSE 3000
USER appuser
CMD ["npm","run","start"]
