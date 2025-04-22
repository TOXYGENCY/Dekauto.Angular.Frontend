import { User } from "../User";

export interface AuthTokensAdapter {
    accessToken: string;
    refreshToken: string;
    user: User;
    accessTokenExpiry?: Date | null;
}

