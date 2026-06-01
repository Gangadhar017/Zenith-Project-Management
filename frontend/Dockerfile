# ==========================================
# STAGE 1: Dependency Installation Cache
# ==========================================
# Dedicated deps stage means this layer only re-runs when package*.json changes.
FROM node:20-alpine AS deps

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# ==========================================
# STAGE 2: Builder
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Inject build-time environment variables
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SOCKET_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SOCKET_URL=$NEXT_PUBLIC_SOCKET_URL

# Disable Next.js telemetry in CI
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ==========================================
# STAGE 3: Production Runner
# ==========================================
# Uses the Next.js standalone output — no node_modules needed in the final image.
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Security hardening — run as a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy only the self-contained standalone bundle and static assets
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# The standalone server.js is emitted by Next.js when output='standalone'
CMD ["node", "server.js"]
