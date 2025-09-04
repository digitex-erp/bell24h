FROM node:20-alpine
WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm ci

# Copy source & build
COPY . .
RUN npm run build

# Runtime
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["npm","run","start"]
