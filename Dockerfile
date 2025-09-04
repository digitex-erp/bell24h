# -------- deps --------
FROM node:20-alpine AS deps
WORKDIR /app
# Native toolchain + glibc compat + openssl for Prisma
RUN apk add --no-cache libc6-compat python3 make g++ openssl
COPY package*.json ./
# Skip scripts (pre/postinstall) during ci to avoid prisma at this step
ENV NPM_CONFIG_FUND=false \
    NPM_CONFIG_AUDIT=false \
    npm_config_ignore_scripts=true
RUN npm ci --omit=dev

# -------- builder --------
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Run prisma generate explicitly at build-time (no DB needed)
RUN npx prisma generate || true
# Build Next
RUN npm run build

# -------- runner --------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
# Non-root
RUN addgroup -S app && adduser -S app -G app
# Runtime files only
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
EXPOSE 3000
USER app
# package.json must have: "start": "next start -p $PORT"
CMD ["npm","run","start"]
