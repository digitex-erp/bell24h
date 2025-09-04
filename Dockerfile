# ---------- deps ----------
FROM node:20-alpine AS deps
WORKDIR /app
# Needed for many Node native modules on Alpine & Next/sharp
RUN apk add --no-cache libc6-compat python3 make g++ 
COPY package*.json ./
# Faster, quieter, and avoids audit/fund network calls
ENV NPM_CONFIG_FUND=false \
    NPM_CONFIG_AUDIT=false
RUN npm ci --omit=dev --no-audit --no-fund

# ---------- builder ----------
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Generate Prisma client (no DB connection needed)
RUN npx prisma generate
# Build Next.js
ENV NODE_OPTIONS=--max_old_space_size=512
RUN npm run build

# ---------- runner ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
# Non-root user for safety
RUN addgroup -S app && adduser -S app -G app
# Copy only what we need to run
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
USER app
# Your package.json should have: "start": "next start -p $PORT"
CMD ["npm","run","start"]
