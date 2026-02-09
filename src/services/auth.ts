// Authentication API Service
// Based on backend/contracts/login-i18n-api.contract.json

import { API_BASE } from './config';

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        username: string;
        displayName: string;
        roles: string[];
    };
}

export interface ApiResponse<T> {
    status: 'success' | 'error';
    data?: T;
    error_code?: string;
    message?: string;
}

class AuthService {
    // Check if admin setup is complete
    async checkSetup(): Promise<boolean> {
        try {
            const res = await fetch(`${API_BASE}/setup/admin`);
            if (!res.ok) {
                // Fallback to setup mode on error
                if (res.status === 503 || res.status === 500) {
                    throw new Error('SYS_MAINTENANCE');
                }
            }
            const data: ApiResponse<{ exists: boolean }> = await res.json();
            return data.data?.exists ?? false;
        } catch (error) {
            console.error('[Auth] Setup check failed:', error);
            throw error;
        }
    }

    // User login
    async login(req: LoginRequest): Promise<LoginResponse> {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req)
        });

        const data: ApiResponse<LoginResponse> = await res.json();

        if (!res.ok || data.status === 'error') {
            throw new Error(data.error_code || 'AUTH_FAILED');
        }

        if (!data.data) {
            throw new Error('INVALID_RESPONSE');
        }

        return data.data;
    }

    // Get current user info (validate token)
    async me(token: string): Promise<LoginResponse['user']> {
        const res = await fetch(`${API_BASE}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data: ApiResponse<LoginResponse['user']> = await res.json();

        if (!res.ok || data.status === 'error') {
            throw new Error(data.error_code || 'AUTH_TOKEN_INVALID');
        }

        if (!data.data) {
            throw new Error('INVALID_RESPONSE');
        }

        return data.data;
    }

    // Refresh access token
    async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
        const res = await fetch(`${API_BASE}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
        });

        const data: ApiResponse<{ accessToken: string; refreshToken: string }> = await res.json();

        if (!res.ok || data.status === 'error') {
            throw new Error(data.error_code || 'AUTH_REFRESH_FAILED');
        }

        if (!data.data) {
            throw new Error('INVALID_RESPONSE');
        }

        return data.data;
    }

    // Logout
    async logout(accessToken: string, refreshToken: string): Promise<void> {
        const res = await fetch(`${API_BASE}/auth/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refreshToken })
        });

        const data: ApiResponse<null> = await res.json();

        if (!res.ok || data.status === 'error') {
            console.warn('[Auth] Logout failed, clearing local tokens anyway');
        }
    }
}

export const authService = new AuthService();
