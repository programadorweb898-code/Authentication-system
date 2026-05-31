# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm ci

# Copy the rest of the application code
COPY . .

# Stage 2: Production
FROM node:20-alpine AS runner

WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Copy only the necessary files from the builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/config ./config
COPY --from=builder /app/infrastructure ./infrastructure

# Expose the application port
EXPOSE 5000

# Start the application
CMD ["node", "./src/server.js"]
