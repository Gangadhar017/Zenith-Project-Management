# Use official Node.js slim runtime as parent image
FROM node:20-slim

# Install OpenSSL for Prisma dependency layers
RUN apt-get update -y && apt-get install -y openssl

# Set working directory inside container
WORKDIR /usr/src/app

# Copy package descriptors
COPY package*.json ./

# Install packages
RUN npm install --legacy-peer-deps

# Copy application source files
COPY . .

# Generate Prisma Client code
RUN npx prisma generate

# Build TypeScript to production JavaScript
RUN npm run build

# Expose HTTP Express socket ports
EXPOSE 8000

# Start server listener
CMD ["npm", "start"]
