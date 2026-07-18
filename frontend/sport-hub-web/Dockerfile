# SportHub Connect - Docker Web

# ============================================================
# Stage 1: Dependencies
# ============================================================
FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --only=production && \
    cp -R node_modules /prod_node_modules && \
    npm ci

# ============================================================
# Stage 2: Build
# ============================================================
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Ensure public/ directory exists (Git doesn't track empty directories)
RUN mkdir -p /app/public

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ============================================================
# Stage 3: Production
# ============================================================
FROM node:22-alpine AS production
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nextjs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]

# ============================================================
# Stage 4: Development
# ============================================================
FROM node:22-alpine AS development
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

EXPOSE 3000

CMD ["npm", "run", "dev"]
