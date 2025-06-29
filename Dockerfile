# Use Node.js 20 LTS as base image
FROM node:22-alpine AS base

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy pnpm workspace files
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY pnpm-lock.yaml ./

# Copy all package.json files for workspace dependencies
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/
COPY types/package.json ./types/
COPY subgraph/package.json ./subgraph/

# Install all dependencies (including dev dependencies for build)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build stage
FROM base AS builder

# Build the types package first (dependency)
RUN pnpm --filter types build

# Build the backend
RUN pnpm --filter backend build

# Production stage
FROM node:20-alpine AS production

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY pnpm-lock.yaml ./

# Copy backend and types package.json (types needed for workspace resolution)
COPY --from=builder /app/backend/package.json ./backend/
COPY --from=builder /app/types/package.json ./types/

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy built application and types package (needed for workspace resolution)
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/types ./types

# Set working directory to backend
WORKDIR /app/backend

# Expose port (adjust if your app uses a different port)
EXPOSE 3000

# Start the application
CMD ["pnpm", "start"]
