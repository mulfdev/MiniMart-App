# Dockerfile at the root of the monorepo.
# Build with: docker build -t minimart-backend -f Dockerfile .

# ---- Base ----
# A common base for subsequent stages.
FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable

# ---- Dependencies ----
# A dedicated stage to build ONLY production dependencies.
FROM base AS deps
# Copy all manifests and lockfile.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/
COPY types/package.json ./types/
COPY frontend/package.json ./frontend/
# Install only the production dependencies for the 'backend' package.
# This creates a lean node_modules folder.
RUN pnpm install --filter backend --prod

# ---- Builder ----
# This stage builds the TypeScript code.
FROM base AS builder
# Copy all manifests and lockfile.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/
COPY types/package.json ./types/
COPY frontend/package.json ./frontend/
# Install ALL dependencies (dev included) for the entire workspace.
RUN pnpm install --frozen-lockfile
# Copy source code.
COPY backend/ ./backend/
COPY types/ ./types/
# Build the backend.
RUN pnpm --filter backend run build

# ---- Production ----
# The final, minimal production image.
FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

# Copy the compiled JavaScript from the builder stage.
COPY --from=builder /app/backend/dist ./dist
# Copy the lean, production-only node_modules from the deps stage.
COPY --from=deps /app/node_modules ./node_modules
# Copy the backend's package.json to the root of the app.
# This provides the correct context for Node.js.
COPY backend/package.json ./package.json

# Run the application.
CMD ["node", "dist/main.js"]