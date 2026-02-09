/**
 * Password Reset Service
 * Handles forgot password API calls per PROD-07 contract
 */

import { API_BASE } from './config';

export interface PasswordResetResponse {
    status: 'success' | 'error';
    data: null;
    error_code?: string;
    message?: string;
    retryAfterSeconds?: number;
}

export interface PasswordResetError {
    code: string;
    retryAfterSeconds?: number;
}

class PasswordResetService {
    /**
     * Request password reset link
     * @param email - User's email address
     * @returns Promise resolving to success or error with details
     */
    async requestResetLink(email: string): Promise<{ success: true } | { success: false; error: PasswordResetError }> {
        try {
            const res = await fetch(`${API_BASE}/auth/password/reset-link`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim().toLowerCase() })
            });

            const data: PasswordResetResponse = await res.json();

            if (res.ok && data.status === 'success') {
                return { success: true };
            }

            // Handle specific error cases
            const errorCode = data.error_code || 'UNKNOWN_ERROR';

            // 429 Rate Limited - include retryAfterSeconds
            if (res.status === 429 && data.retryAfterSeconds) {
                return {
                    success: false,
                    error: {
                        code: errorCode,
                        retryAfterSeconds: data.retryAfterSeconds
                    }
                };
            }

            return {
                success: false,
                error: { code: errorCode }
            };
        } catch (err) {
            console.error('[PasswordReset] Network error:', err);
            return {
                success: false,
                error: { code: 'NETWORK_ERROR' }
            };
        }
    }
}

export const passwordResetService = new PasswordResetService();
