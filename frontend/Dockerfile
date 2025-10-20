# frontend/Dockerfile
# ---- build stage ----
FROM node:18-alpine AS builder
WORKDIR /app

ENV NODE_ENV=development

# 1) copy only the manifests
COPY package.json package-lock.json ./

# 2) install deps
RUN npm ci

# 3) copy rest of the source & build
COPY . .
RUN npm run build

# ---- runtime stage ----
FROM nginx:alpine

# remove default nginx configs
RUN rm /etc/nginx/conf.d/default.conf

# copy your custom config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# clear default nginx html & copy React build
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
