# ==========================================
# STAGE 1: Dependency Installation Cache
# ==========================================
FROM node:20-slim AS deps

# Install OpenSSL for Prisma binary generation
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# ==========================================
# STAGE 2: Builder
# ==========================================
FROM node:20-slim AS builder

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate the Prisma client for the target OS and architecture
RUN npx prisma generate

# Compile TypeScript to production JavaScript
RUN npm run build

# ==========================================
# STAGE 3: Production Runner
# ==========================================
FROM node:20-slim AS runner

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production

# Security hardening — run as a non-root user
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs expressjs

# Copy only production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --legacy-peer-deps

# Copy Prisma schema and generate runtime client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy compiled JavaScript artifacts from the builder stage
COPY --from=builder --chown=expressjs:nodejs /app/dist ./dist

USER expressjs

EXPOSE 8000

CMD ["node", "dist/server.js"]
