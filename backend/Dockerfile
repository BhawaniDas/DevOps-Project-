# ── Stage 1: Install dependencies (cached layer) ─────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
# ci = reproducible, --only=production skips devDeps
RUN npm ci --only=production && npm cache clean --force

# ── Stage 2: Production image ─────────────────────────────────────────────────
FROM node:20-alpine AS production

# dumb-init: correct PID 1 signal handling (SIGTERM → graceful shutdown)
RUN apk add --no-cache dumb-init

# Non-root user — security hardening
RUN addgroup -g 1001 -S appgroup && \
    adduser  -u 1001 -S appuser  -G appgroup

WORKDIR /app

# Copy production node_modules from deps stage
COPY --from=deps --chown=appuser:appgroup /app/node_modules ./node_modules

# Copy application source (respects .dockerignore)
COPY --chown=appuser:appgroup . .

# Drop dev-only files if they slipped through
RUN rm -f .env .env.* *.test.js

USER appuser
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:5000/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
