// I18n API Service
// Based on backend/contracts/login-i18n-api.contract.json

import { API_BASE } from './config';

export interface I18nResources {
    app: Record<string, any>;
    auth: Record<string, any>;
}

export interface I18nResponse {
    status: 'success' | 'error';
    data?: I18nResources;
    meta?: {
        version: string;
        lang: string;
    };
    error_code?: string;
    message?: string;
}

class I18nService {
    private cachedVersion: string | null = null;
    private cachedLang: string | null = null;

    // Fetch i18n resources
    // Returns null if cached version is still valid (304)
    async getResources(lang?: string): Promise<{ data: I18nResources; meta: { version: string; lang: string } } | null> {
        const url = new URL(`${API_BASE}/i18n/resources`, window.location.origin);
        if (lang) {
            url.searchParams.set('lang', lang);
        }

        const headers: HeadersInit = {};
        if (this.cachedVersion && this.cachedLang === lang) {
            headers['If-None-Match'] = this.cachedVersion;
        }

        const res = await fetch(url.toString(), { headers });

        // 304 Not Modified - cache is still valid
        if (res.status === 304) {
            return null;
        }

        const data: I18nResponse = await res.json();

        if (!res.ok || data.status === 'error') {
            throw new Error(data.error_code || 'I18N_FETCH_FAILED');
        }

        if (!data.data || !data.meta) {
            throw new Error('INVALID_RESPONSE');
        }

        // Cache version for next request
        this.cachedVersion = data.meta.version;
        this.cachedLang = data.meta.lang;

        return {
            data: data.data,
            meta: data.meta
        };
    }

    // Clear cache
    clearCache(): void {
        this.cachedVersion = null;
        this.cachedLang = null;
    }
}

export const i18nService = new I18nService();
