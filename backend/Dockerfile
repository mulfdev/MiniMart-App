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
COPY backend/package.json ./backend/
COPY types/package.json ./types/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy only backend and types source code
COPY backend ./backend
COPY types ./types

# Build stage
FROM base AS builder

# Build the types package first (dependency)
RUN pnpm --filter types build

# Build the backend
RUN pnpm --filter backend build

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
COPY --from=builder /app/backend/package.json ./backend/
COPY --from=builder /app/types/package.json ./types/

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy built application and types package
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/types/dist ./types/dist

# Expose port
EXPOSE 3000

# Start the application
CMD ["pnpm", "--filter", "backend", "start"]
