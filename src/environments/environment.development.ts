export const environment = {
    production: true,
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
    // Настройки безопасности
    security: {
        maxTokenRefreshAttempts: 1
    }
};