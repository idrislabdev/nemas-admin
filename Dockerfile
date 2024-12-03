# Use Node.js 18 Alpine as the base image
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Next.js and compile TypeScript
RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Install ts-node and typescript globally for easier access
RUN yarn global add typescript ts-node @types/node

# Generate self-signed certificate and key
RUN apk add --no-cache openssl && \
  mkdir -p /app/certs && \
  openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /app/certs/server.key \
  -out /app/certs/server.crt -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

# Production image, copy all the files and run Next.js with HTTPS
FROM base AS runner
WORKDIR /app

# Set environment variables for production
ENV NODE_ENV=production
ENV SSL_CERT_FILE=/app/certs/server.crt
ENV SSL_KEY_FILE=/app/certs/server.key
ENV HTTPS=true
ENV PORT=5005
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy Next.js build output, public assets, and certs
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/certs /app/certs
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
# COPY --from=builder /app/node_modules ./node_modules

# Set permissions for the app
RUN chown -R nextjs:nodejs /app

# Ensure ts-node is available globally
ENV PATH="/root/.yarn/bin:/app/node_modules/.bin:$PATH"

USER nextjs

# Expose the HTTPS port
EXPOSE 5005

# Run the TypeScript server with HTTPS
CMD ["npx", "ts-node", "server.ts"]
