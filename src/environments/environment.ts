export const environment = {
    production: false,
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
    // Настройки безопасности
    security: {
        maxTokenRefreshAttempts: 1
    }
};