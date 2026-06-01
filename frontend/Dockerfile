# Use official Node.js runtime as parent image
FROM node:20-alpine

# Set working directory inside container
WORKDIR /usr/src/app

# Copy package descriptors
COPY package*.json ./

# Install packages
RUN npm install --legacy-peer-deps

# Copy application source files
COPY . .

# Add build arguments for Next.js build-time environment variables
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SOCKET_URL

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SOCKET_URL=$NEXT_PUBLIC_SOCKET_URL

# Build Next.js application
RUN npm run build

# Expose Next.js port
EXPOSE 3000

# Start server listener
CMD ["npm", "start"]
