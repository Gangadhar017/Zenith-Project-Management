# ==========================================
# STAGE 1: Builder
# ==========================================
FROM node:20-slim AS builder

# Install OpenSSL for Prisma dependency layers
RUN apt-get update -y && apt-get install -y openssl

# Set working directory inside container
WORKDIR /usr/src/app

# Copy package descriptors
COPY package*.json ./

# Install all packages (including devDependencies)
RUN npm install --legacy-peer-deps

# Copy application source files
COPY . .

# Generate Prisma Client code & Build TypeScript to production JavaScript
RUN npx prisma generate && npm run build

# ==========================================
# STAGE 2: Runner
# ==========================================
FROM node:20-slim AS runner

# Install OpenSSL for Prisma runtime layers
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /usr/src/app

ENV NODE_ENV=production

# Copy package descriptors and prisma models
COPY package*.json ./
COPY prisma ./prisma/
COPY --from=builder /usr/src/app/dist ./dist

# Install production dependencies only & Generate client files inside runner
RUN npm install --only=production --legacy-peer-deps && npx prisma generate

# Expose HTTP Express socket ports
EXPOSE 8000

# Start server listener
CMD ["npm", "start"]
