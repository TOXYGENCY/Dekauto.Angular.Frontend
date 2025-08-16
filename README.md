# Dekauto: 🟠 Web-приложение на Angular (Dekauto.Angular.Frontend)
### Приложение с пользовательским web-интерфейсом (панелью управления), предоставляющее возможность удобного взаимодействия с системой Dekauto. Содержит конфигурацию шлюза NGINX (контейнер состоит из статических файлов Angular + работающего NGINX).

### 🔸 Функции
- Предоставление понятного пользовательского интерфейса
- Взаимодействие с серверной частью системы Dekauto
- Отображение всей необходимой информации для полноценной работы с Dekauto
- Хранение и управление токенами доступа и обновления для предоставления при запросах на сервер

### 🛠 Технологии
- Git
- [Angular CLI](https://github.com/angular/angular-cli) version 19.1.4
- NGINX
- Grafana Loki + Promtail (логирование и метрики)
- Docker
- CI (GitHub Actions)

## ❇ [Конфигурация NGINX](https://github.com/TOXYGENCY/Dekauto.Angular.Frontend/blob/master/nginx.conf) (обратное проксирование применяется в указанном порядке)
- Прослушивающийся порт: `80`
- Имя хоста: `localhost`
- `/api` -> `http://dekauto.students:5501`
- `/api/auth` -> `http://dekauto.auth:5507`
- `/api/logs` -> `http://loki:3100/loki/api/v1/push`

---
># ℹ О Dekauto
>### Что такое Dekauto?
>Dekauto - это web-сервис, направленный на автоматизацию некоторых процессов работы деканата высшего учебного заведения. На данный момент система специализирована для работы в определенном ВУЗе и исполняет функции хранения, агрегации и вывода данных студентов. Ввод осуществляется через Excel-файлы определенного формата. Выводом является Excel-файл карточки студента с заполненными данными. 
>
>### Общая структура Dekauto
>* ⚪ [Dekauto.Auth.Service](https://github.com/TOXYGENCY/Dekauto.Auth.Service) - Сервис управления аккаунтами и входом. _(Вы здесь)_
>    * DockerHub-образ: `toxygency/dekauto_auth_service:release`
>* 🔵 [Dekauto.Students.Service](https://github.com/TOXYGENCY/Dekauto.Students.Service) - Сервис управления Студентами.
>    * DockerHub-образ: `toxygency/dekauto_students_service:release`
>* 🟣 [Dekauto.Import.Service](https://github.com/TOXYGENCY/Dekauto.Import.Service) - Сервис парсинга файлов Excel для импорта.
>    * DockerHub-образ: `toxygency/dekauto_import_service:release`
>* 🟢 [Dekauto.Export.Service](https://github.com/TOXYGENCY/Dekauto.Export.Service) - Сервис формирования выходного Excel-файла.
>    * DockerHub-образ: `toxygency/dekauto_export_service:release`
>* 🟠 [Dekauto.Angular.Frontend](https://github.com/TOXYGENCY/Dekauto.Angular.Frontend) - Фронтенд: Web-приложение на Angular v19 + NGINX.
>    * DockerHub-образ: `toxygency/dekauto_frontend_nginx:release`
---

### Дополнительная документация Angular v19, которая может быть полезной

# DekautoAngularFrontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.1.4.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
