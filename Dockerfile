# Multi-stage Dockerfile for DevOps AI Interview Coach
# Stage 1: Build Frontend Assets
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build frontend
COPY . .
RUN npm run build

# Stage 2: Production Runtime
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built frontend assets and server
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/src ./src

# Install tsx globally in runner for seamless TypeScript server execution
RUN npm install -g tsx

EXPOSE 3000

# Run server with non-root user
USER node

CMD ["tsx", "server.ts"]
