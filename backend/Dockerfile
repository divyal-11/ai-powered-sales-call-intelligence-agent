# ==========================================
# Stage 1: Build & Prisma Client Generation
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install OpenSSL required by Prisma CLI on Alpine
RUN apk add --no-cache openssl

# Install all dependencies (including devDependencies like typescript)
COPY package*.json ./
RUN npm ci

# Copy Prisma schema and generate type-safe Prisma client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy source code and configuration
COPY tsconfig.json ./
COPY src ./src/

# Compile TypeScript to JavaScript in /app/dist
RUN npm run build

# ==========================================
# Stage 2: Production Lean Runner Image
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

# Install OpenSSL for Prisma engine runtime
RUN apk add --no-cache openssl

ENV NODE_ENV=production
ENV PORT=3001

# Install only production dependencies to minimize image size and attack surface
COPY package*.json ./
RUN npm ci --omit=dev

# Copy generated Prisma client from builder stage
COPY --from=builder /app/src/generated /app/src/generated
COPY --from=builder /app/prisma /app/prisma

# Copy compiled JavaScript from builder stage
COPY --from=builder /app/dist /app/dist

# Create uploads directory and set permissions to standard non-root node user
RUN mkdir -p /app/uploads && chown -R node:node /app

USER node

EXPOSE 3001

CMD ["node", "dist/index.js"]
