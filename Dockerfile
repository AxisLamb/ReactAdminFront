# ============ 构建阶段 ============
FROM node:20-alpine AS builder

WORKDIR /app

# 先复制依赖清单，利用 Docker 层缓存
COPY package.json package-lock.json ./
RUN npm ci

# 复制源码并构建
COPY . .
RUN npm run build

# ============ 运行阶段 ============
FROM nginx:1.27-alpine

# nginx 配置模板（BACKEND_URL 由环境变量注入，默认指向宿主机后端）
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 后端 API 地址，可用 docker run -e BACKEND_URL=... 覆盖
# 宿主机本地后端（Docker Desktop）默认用 host.docker.internal
ENV BACKEND_URL=http://host.docker.internal:8888

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
