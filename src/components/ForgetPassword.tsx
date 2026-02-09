/**
 * ForgetPassword Component
 * Integrates with PROD-07 password reset API and PROD-08 i18n forget namespace
 */

import React, { useState, useEffect, useCallback } from 'react';
import { passwordResetService } from '../services/passwordReset';
import { i18nService, I18nResources } from '../services/i18n';

// Fallback i18n for forget namespace (Japanese default)
const FALLBACK_I18N = {
    page_title: 'パスワードの再設定',
    email: 'メールアドレス',
    submit: '再設定リンクを送信',
    back_login: 'ログインに戻る',
    eyebrow: 'アカウントの復旧',
    form_title: 'パスワードをお忘れですか？',
    form_subtitle: '登録済みのメールアドレスを入力してください。再設定用のリンクをお送りします。',
    link_sent: '再設定リンクを送信しました。メールを確認してください。',
    email_required: '有効なメールアドレスを入力してください',
    email_invalid: 'メールアドレスの形式が正しくありません',
    rate_limited: '送信頻度が高すぎます。{{seconds}} 秒後に再試行してください',
    system_error: 'システムが混雑しています。しばらくしてから再試行してください'
};

// Error code to i18n key mapping
const ERROR_MAP: Record<string, string> = {
    AUTH_EMAIL_REQUIRED: 'email_required',
    AUTH_EMAIL_INVALID: 'email_invalid',
    AUTH_RATE_LIMITED: 'rate_limited',
    SYS_INTERNAL_ERROR: 'system_error',
    NETWORK_ERROR: 'system_error'
};

interface ForgetPasswordProps {
    onBackToLogin?: () => void;
    lang?: string;
}

export const ForgetPassword: React.FC<ForgetPasswordProps> = ({ onBackToLogin, lang = 'ja' }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [countdown, setCountdown] = useState(0);
    const [i18n, setI18n] = useState<Record<string, string>>(FALLBACK_I18N);

    // Load i18n resources
    useEffect(() => {
        const loadI18n = async () => {
            try {
                const result = await i18nService.getResources(lang);
                if (result && result.data.forget) {
                    setI18n({ ...FALLBACK_I18N, ...result.data.forget });
                }
            } catch (err) {
                console.warn('[ForgetPassword] Failed to load i18n, using fallback');
            }
        };
        loadI18n();
    }, [lang]);

    // Countdown timer for rate limiting
    useEffect(() => {
        if (countdown <= 0) return;

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setError(null);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [countdown]);

    // Get translated text with placeholder replacement
    const t = useCallback((key: string, params?: Record<string, string | number>): string => {
        let text = i18n[key] || FALLBACK_I18N[key as keyof typeof FALLBACK_I18N] || key;

        if (params) {
            Object.entries(params).forEach(([k, v]) => {
                text = text.replace(`{{${k}}}`, String(v));
            });
        }

        return text;
    }, [i18n]);

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            setError(t('email_required'));
            return;
        }

        setLoading(true);
        setError(null);

        const result = await passwordResetService.requestResetLink(email);

        setLoading(false);

        if (result.success) {
            setSuccess(true);
        } else {
            const errKey = ERROR_MAP[result.error.code] || 'system_error';

            if (result.error.retryAfterSeconds) {
                setCountdown(result.error.retryAfterSeconds);
                setError(t(errKey, { seconds: result.error.retryAfterSeconds }));
            } else {
                setError(t(errKey));
            }
        }
    };

    // Success state
    if (success) {
        return (
            <div className="auth-panel-body">
                <p className="auth-eyebrow text-center">{t('eyebrow')}</p>
                <div className="auth-form-header">
                    <h2>{t('form_title')}</h2>
                </div>
                <div className="auth-message" style={{
                    background: 'rgba(31, 169, 113, 0.12)',
                    border: '1px solid rgba(31, 169, 113, 0.3)',
                    color: '#1fa971',
                    borderRadius: 'var(--radius-soft)',
                    padding: 'var(--spacing-3)',
                    fontSize: '14px'
                }}>
                    {t('link_sent')}
                </div>
                <div className="auth-promo" style={{ marginTop: '24px' }}>
                    <a href="/" onClick={(e) => { e.preventDefault(); onBackToLogin?.(); }}>
                        {t('back_login')}
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-panel-body">
            <p className="auth-eyebrow text-center">{t('eyebrow')}</p>
            <div className="auth-form-header">
                <h2>{t('form_title')}</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px', lineHeight: '1.5' }}>
                    {t('form_subtitle')}
                </p>
            </div>

            {error && (
                <div className="auth-message error">
                    {error}
                    {countdown > 0 && (
                        <span style={{ marginLeft: '8px', fontWeight: 600 }}>
                            ({countdown}s)
                        </span>
                    )}
                </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
                <div className="auth-field">
                    <label>{t('email')}</label>
                    <input
                        className="field-control"
                        type="email"
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading || countdown > 0}
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading || countdown > 0}
                    style={{ marginTop: '16px' }}
                >
                    {loading ? '送信中...' : t('submit')}
                </button>
            </form>

            <div className="auth-promo">
                パスワードを思い出しましたか？
                <a href="/" onClick={(e) => { e.preventDefault(); onBackToLogin?.(); }}>
                    {t('back_login')}
                </a>
            </div>
        </div>
    );
};

export default ForgetPassword;
