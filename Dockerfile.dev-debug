# Используем официальный образ Node.js (совместимую с Angular 19)
FROM node:22-slim
EXPOSE 4200
# Устанавливаем глобально Angular CLI
RUN npm install -g @angular/cli@latest

# Рабочая директория
WORKDIR /app

# Копируем package.json и package-lock.json (или yarn.lock)
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем все файлы проекта
COPY . .

# Запускаем приложение в режиме разработки
CMD ["ng", "serve", "--host", "0.0.0.0", "--port", "4200", "--disable-host-check"]