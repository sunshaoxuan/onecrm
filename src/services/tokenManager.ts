// Token Management Utility
// Handles localStorage persistence for access/refresh tokens

const ACCESS_TOKEN_KEY = 'onecrm_access_token';
const REFRESH_TOKEN_KEY = 'onecrm_refresh_token';
const USER_KEY = 'onecrm_user';

export interface StoredUser {
    id: string;
    username: string;
    displayName: string;
    roles: string[];
}

class TokenManager {
    // Save tokens and user info
    save(accessToken: string, refreshToken: string, user: StoredUser): void {
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    // Get access token
    getAccessToken(): string | null {
        return localStorage.getItem(ACCESS_TOKEN_KEY);
    }

    // Get refresh token
    getRefreshToken(): string | null {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    }

    // Get stored user
    getUser(): StoredUser | null {
        const userStr = localStorage.getItem(USER_KEY);
        if (!userStr) return null;
        try {
            return JSON.parse(userStr);
        } catch {
            return null;
        }
    }

    // Update access token (after refresh)
    updateAccessToken(accessToken: string): void {
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    }

    // Clear all tokens
    clear(): void {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    }

    // Check if tokens exist
    hasTokens(): boolean {
        return !!this.getAccessToken() && !!this.getRefreshToken();
    }
}

export const tokenManager = new TokenManager();
