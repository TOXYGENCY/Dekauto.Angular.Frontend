export const environment = {
    production: false,
    app: {
        name: "dekauto-angular-frontend",
        name2: "angular"
    },
    // Базовые настройки API
    api: {
        baseUrl: 'http://localhost:5501/api',
        authUrl: 'http://localhost:5507/api/auth'
    },
    // Экспорт
    export: {
        student: {
            url: 'http://localhost:5501/api/export/student',
            defaultName: 'Карточка студента'
        },
        group: {
            url: 'http://localhost:5501/api/export/group',
            defaultName: 'Карточки студентов группы'
        }
    },
    // Импорт
    import: {
        url: 'http://localhost:5501/api/import'
    },
    logs: {
        logAppName: 'dekauto_frontend',
        // Будет перенаправлено через angular dev proxy на http://localhost:3100 (из proxy.conf.json)
        url: '/loki/api/v1/push',
        batchInterval: 1000
    },
    // Настройки безопасности
    security: {
        maxTokenRefreshAttempts: 1
    }
};