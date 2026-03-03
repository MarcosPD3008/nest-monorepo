# ============================================
# React (Vite) Web - Multi-stage Dockerfile
# ============================================

# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx nx build web --configuration=production

# Stage 2: Serve with nginx
FROM nginx:alpine AS runner
COPY --from=builder /app/dist/src/apps/web /usr/share/nginx/html
RUN echo 'server { root /usr/share/nginx/html; index index.html; location / { try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
