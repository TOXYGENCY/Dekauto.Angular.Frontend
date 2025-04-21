export interface Role {
    id?: string | null;
    name?: string | null;
}

export enum RoleKeys {
    ADMIN = 'Администратор',
    STUDENT = 'Студент',
    GUEST = 'Гость'
}
