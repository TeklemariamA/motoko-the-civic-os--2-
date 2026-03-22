FROM node:22-bullseye AS builder

WORKDIR /app

COPY package*.json ./
COPY frontend/package*.json ./frontend/
RUN npm install

COPY . .

RUN npm run build --workspace frontend

FROM nginx:alpine

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/frontend/dist /usr/share/nginx/html
COPY scripts/generate-runtime-config.sh /docker-entrypoint.d/99-generate-runtime-config.sh

RUN chmod +x /docker-entrypoint.d/99-generate-runtime-config.sh
# Ensure nginx can write pid/cache/runtime config when running as non-root
RUN mkdir -p /run/nginx \
	&& chown -R nginx:nginx /usr/share/nginx/html /docker-entrypoint.d /var/cache/nginx /var/run /run /etc/nginx/conf.d

# Drop root privileges for runtime
USER nginx

EXPOSE 80
# Basic liveness probe to ensure Nginx serves the app index
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget --no-verbose --spider http://127.0.0.1/ || exit 1

