export interface User {
    id: string;
    login: string;
    roleName: string;
    engRoleName: string;
    roleId: string | null;
    password?: string | null;
}