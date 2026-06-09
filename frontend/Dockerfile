# ── Stage 1: Build Vite app ────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy manifests first — layer cached unless deps change
COPY package*.json ./

# Install ALL deps (including devDeps needed for build)
# --ignore-scripts avoids running postinstall on alpine where some binaries fail
RUN npm ci --ignore-scripts && npm cache clean --force

# Build args — injected at docker build time
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL

# Copy source and build
COPY . .
RUN npm run build

# ── Stage 2: Nginx production server ───────────────────────────────────────────
FROM nginx:1.27-alpine AS production

# Remove default content + config
RUN rm /etc/nginx/conf.d/default.conf && rm -rf /usr/share/nginx/html/*

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/app.conf

# Copy Vite build output from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Fix ownership so nginx user can serve
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx      && \
    chown -R nginx:nginx /var/log/nginx        && \
    touch /var/run/nginx.pid                   && \
    chown nginx:nginx /var/run/nginx.pid

USER nginx
EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
