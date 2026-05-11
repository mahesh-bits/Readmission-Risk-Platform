
# Angular build & NGINX serve
# FROM node:20-alpine AS build
FROM centraluhg.jfrog.io/glb-docker-vir/uhg-ocm/base-node20-image:latest-chainguard
USER root
WORKDIR /app
COPY package.json angular.json tsconfig.json ./
COPY src ./src
RUN npm install -g @angular/cli@19 && npm install && npm run build

FROM nginx:alpine
COPY --from=build /app/dist/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf


