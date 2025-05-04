FROM node:20-alpine AS builder

# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Remove development dependencies
RUN npm prune --production

# Production image
FROM node:20-alpine

# Set environment variables
ENV NODE_ENV=production

# Create app directory
WORKDIR /app

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Copy required files only
COPY --from=builder /app/client/index.html ./client/
COPY --from=builder /app/client/dist ./client/dist

# Copy other necessary files
COPY --from=builder /app/.env.example ./.env.example

# Expose the port the app runs on
EXPOSE 5000

# Start the application
CMD ["node", "dist/index.js"]

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 CMD wget -qO- http://localhost:5000/api/health-check || exit 1