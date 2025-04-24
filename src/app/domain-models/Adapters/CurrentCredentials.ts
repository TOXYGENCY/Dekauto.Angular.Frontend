import { User } from "../User";

// AccessTokenDto в бекенде
export interface CurrentCredentials {
    accessToken: string;
    accessTokenExpiry?: Date | null;
    user: User;
}

