export const environment = {
    production: true,
    app: {
        name: "dekauto-angular-frontend",
        name2: "angular"
    },
    // Базовые настройки API
    api: {
        baseUrl: '/api',
        authUrl: '/api/auth'
    },
    // Экспорт
    export: {
        student: {
            url: '/api/export/student',
            defaultName: 'Карточка студента'
        },
        group: {
            url: '/api/export/group',
            defaultName: 'Карточки студентов группы'
        }
    },
    // Импорт
    import: {
        url: '/api/import'
    },
    logs: {
        logAppName: 'dekauto_frontend',
        url: '/api/logs'
    },
    // Настройки безопасности
    security: {
        maxTokenRefreshAttempts: 1
    }
};