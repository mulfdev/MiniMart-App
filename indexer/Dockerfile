FROM node:22-alpine AS base

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy pnpm workspace files from monorepo root
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY pnpm-lock.yaml ./

# Copy only required package.json files
COPY indexer/package.json ./indexer/
COPY types/package.json ./types/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy only indexer and types source code
COPY indexer ./indexer
COPY types ./types

# Build stage
FROM base AS builder

# Build the types package first (dependency)
RUN pnpm --filter types build

# Build the indexer
RUN pnpm --filter indexer build

# Production stage
FROM node:22-alpine AS production

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY pnpm-lock.yaml ./

# Copy package.json files
COPY --from=builder /app/indexer/package.json ./indexer/
COPY --from=builder /app/types/package.json ./types/

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy built application and types package
COPY --from=builder /app/indexer/dist ./indexer/dist
COPY --from=builder /app/types/dist ./types/dist

# Expose port (adjust if indexer uses different port)
EXPOSE 3000

# Start the application
CMD ["pnpm", "--filter", "indexer", "start"]
