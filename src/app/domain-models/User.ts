export interface User {
    id: string;
    login: string;
    roleName: string;
    roleId: string | null;
    password?: string | null;
}