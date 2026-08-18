# ============================================================================
# Stage 1: Builder — Compile Next.js application
# ============================================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies (cached layer)
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Copy source code
COPY . .

# Build Next.js (standalone output for minimal runtime)
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ============================================================================
# Stage 2: Production — Minimal runtime image (target: production)
# ============================================================================
FROM node:22-alpine AS production

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S appgroup \
    && adduser -u 1001 -S appuser -G appgroup

# Copy only standalone output and static files from builder
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Runtime environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

EXPOSE 3000

# Non-root user for security
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]

# ============================================================================
# Stage 3: Development — Hot reload (target: development, docker-compose dev)
# ============================================================================
FROM node:22-alpine AS development

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

EXPOSE 3000

# En desarrollo con bind mount, node_modules local sobrescribe al de la imagen.
# Este entrypoint reinstala dependencias y luego inicia dev.
# Se ubica fuera de /app para no ser sobrescrito por el bind mount.
RUN echo '#!/bin/sh' > /entrypoint.sh && \
    echo 'cd /app && npm install --no-audit --no-fund 2>&1' >> /entrypoint.sh && \
    echo 'exec npm run dev' >> /entrypoint.sh && \
    chmod +x /entrypoint.sh

CMD ["sh", "/entrypoint.sh"]
