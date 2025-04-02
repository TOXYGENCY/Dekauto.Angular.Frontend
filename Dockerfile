# Фаза сборки Angular
FROM node:22-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build -- --configuration production

# Фаза запуска (Nginx + Angular)
FROM nginx:alpine
COPY --from=build /app/dist/dekauto.angular.frontend /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf