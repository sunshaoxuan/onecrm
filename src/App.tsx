import React, { useState, useEffect } from 'react';
import { ConfigProvider, message } from 'antd';
import CustomerPortal from './pages/CustomerPortal';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { Customer } from './types';
import { authService, LoginResponse } from './services/auth';
import { i18nService, I18nResources } from './services/i18n';
import { tokenManager, StoredUser } from './services/tokenManager';
import ForgetPassword from './components/ForgetPassword';
import './styles/bob-theme.css';
import './styles/bob-auth.css';

// Fallback i18n resources (used while loading)
const fallbackResources: I18nResources = {
    app: {
        title: "OneCRM",
        copyright: "© 2026 OneCRM Inc. All Rights Reserved."
    },
    auth: {
        eyebrow: "セキュアアクセス",
        slogan: {
            main: "チームをつなぎ、\n成长を加速する",
            sub: "最新のビジネス管理とコラボレーションのためのプラットフォーム"
        },
        panel: {
            brand: "ワークスペースへログイン",
            welcome: "おかえりなさい",
            title: "ログイン",
            username_label: "ユーザー名またはメール",
            username_hint: "有効なアカウントを入力してください",
            password_label: "パスワード",
            login_button: "ログイン",
            divider: "または",
            footer_promo: "関係をもっとスマートに、协働をもっと自然に。",
            no_account: "アカウントがありませんか？",
            register: "登録"
        },
        languages: {
            zh: "中文",
            ja: "日本語",
            en: "EN"
        }
    },
    forget: {
        page_title: "パスワードの再設定",
        email: "メールアドレス",
        submit: "再設定リンクを送信",
        back_login: "ログインに戻る",
        eyebrow: "アカウントの復旧",
        form_title: "パスワードをお忘れですか？",
        form_subtitle: "登録済みのメールアドレスを入力してください。再設定用のリンクをお送りします。",
        link_sent: "再設定リンクを送信しました。メールを確認してください。",
        email_required: "有効なメールアドレスを入力してください",
        email_invalid: "メールアドレスの形式が正しくありません",
        rate_limited: "送信頻度が高すぎます。{{seconds}} 秒後に再試行してください",
        system_error: "システムが混雑しています。しばらくしてから再試行してください"
    }
};

const App: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    // TODO: Wire up currentUser in Header component for user display/logout
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_currentUser, setCurrentUser] = useState<StoredUser | null>(null);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [heroImageIndex, setHeroImageIndex] = useState(0);
    const [resources, setResources] = useState<I18nResources>(fallbackResources);
    const [isLoading, setIsLoading] = useState(false);
    const [currentLang, setCurrentLang] = useState('ja');
    const [authMode, setAuthMode] = useState<'login' | 'forgot'>('login');

    const heroImages = [
        "/images/slider/tokyo01.jpg",
        "/images/slider/fujisann01.jpg"
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setHeroImageIndex(prev => (prev + 1) % heroImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Load i18n resources on mount or language change
    useEffect(() => {
        const loadResources = async () => {
            try {
                const result = await i18nService.getResources(currentLang);
                if (result) {
                    setResources(result.data);
                }
            } catch (error) {
                console.error('[App] Failed to load i18n:', error);
                message.error('多言語リソースの読み込みに失敗しました');
            }
        };
        loadResources();
    }, [currentLang]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result: LoginResponse = await authService.login({ username, password });

            // Save tokens and user
            tokenManager.save(result.accessToken, result.refreshToken, result.user);
            setCurrentUser(result.user);
            setIsLoggedIn(true);
            message.success('ログイン成功');
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
            console.error('[App] Login failed:', error);

            // Map error codes to user-friendly messages
            const errorMessages: Record<string, string> = {
                'AUTH_MISSING_FIELD': '必須項目を入力してください',
                'AUTH_INVALID_CREDENTIALS': 'ユーザー名またはパスワードが間違っています',
                'AUTH_LOCKED': 'アカウントがロックされています',
                'AUTH_RATE_LIMITED': '試行回数が多すぎます。しばらくしてから再度お試しください',
            };

            message.error(errorMessages[errorMessage] || 'ログインに失敗しました');
        } finally {
            setIsLoading(false);
        }
    };

    // TODO: Wire up handleLogout in Header component
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _handleLogout = async () => {
        const accessToken = tokenManager.getAccessToken();
        const refreshToken = tokenManager.getRefreshToken();

        if (accessToken && refreshToken) {
            try {
                await authService.logout(accessToken, refreshToken);
            } catch (error) {
                console.error('[App] Logout failed:', error);
            }
        }

        tokenManager.clear();
        setIsLoggedIn(false);
        setCurrentUser(null);
        setSelectedCustomer(null);
    };

    // TODO: Wire up handleLanguageChange to language toggle buttons
    const handleLanguageChange = (lang: string) => {
        setCurrentLang(lang);
    };

    if (!isLoggedIn) {
        return (
            <ConfigProvider theme={{ token: { colorPrimary: '#3f7cff', borderRadius: 8 } }}>
                <div className="auth-shell has-hero-image">
                    <div className="auth-hero-brand-floating">{resources.app.title}</div>

                    <section className="auth-hero">
                        {heroImages.map((src, index) => (
                            <img
                                key={src}
                                className={`auth-hero-bg ${index === heroImageIndex ? 'show' : ''}`}
                                src={src}
                                alt="Hero background"
                            />
                        ))}
                        <div className="auth-hero-overlay"></div>

                        <p className="auth-eyebrow">{resources.auth.eyebrow}</p>
                        <h1 className="whitespace-pre-line">{resources.auth.slogan.main}</h1>
                        <p className="auth-hero-subtitle">{resources.auth.slogan.sub}</p>
                    </section>

                    <section className="auth-panel-container">
                        <header className="auth-panel-header">
                            <div className="auth-brand">{resources.auth.panel.brand}</div>
                            <div className="auth-lang-toggle">
                                <button
                                    className={currentLang === 'zh' ? 'active' : ''}
                                    onClick={() => handleLanguageChange('zh')}
                                >
                                    {resources.auth.languages.zh}
                                </button>
                                <button
                                    className={currentLang === 'ja' ? 'active' : ''}
                                    onClick={() => handleLanguageChange('ja')}
                                >
                                    {resources.auth.languages.ja}
                                </button>
                                <button
                                    className={currentLang === 'en' ? 'active' : ''}
                                    onClick={() => handleLanguageChange('en')}
                                >
                                    {resources.auth.languages.en}
                                </button>
                            </div>
                        </header>

                        <div className="auth-panel">
                            {authMode === 'login' ? (
                                <div className="auth-panel-body">
                                    <p className="auth-eyebrow text-center">{resources.auth.eyebrow}</p>
                                    <div className="auth-form-header">
                                        <div className="auth-brand">{resources.auth.panel.brand}</div>
                                        <h2>{resources.auth.panel.welcome}</h2>
                                    </div>

                                    <form className="auth-form" onSubmit={handleLogin}>
                                        <div className="auth-field">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <label>{resources.auth.panel.username_label}</label>
                                                <a
                                                    href="#"
                                                    style={{ fontSize: '12px', color: 'var(--primary)' }}
                                                    onClick={(e) => { e.preventDefault(); setAuthMode('forgot'); }}
                                                >
                                                    {resources.forget.form_title}
                                                </a>
                                            </div>
                                            <input
                                                className="field-control"
                                                type="email"
                                                placeholder="admin"
                                                value={username}
                                                onChange={e => setUsername(e.target.value)}
                                                disabled={isLoading}
                                            />
                                        </div>
                                        <div className="auth-field">
                                            <label>{resources.auth.panel.password_label}</label>
                                            <input
                                                className="field-control"
                                                type="password"
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={e => setPassword(e.target.value)}
                                                disabled={isLoading}
                                            />
                                        </div>
                                        <button type="submit" disabled={isLoading}>{isLoading ? '処理中...' : resources.auth.panel.login_button}</button>
                                    </form>

                                    <div className="auth-divider">
                                        <span>{resources.auth.panel.divider}</span>
                                    </div>

                                    <div className="auth-social">
                                        <button type="button" className="btn-social google">
                                            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M17.64 9.20455C17.64 8.56636 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z" fill="#4285F4" />
                                                <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4205 9 14.4205C6.65591 14.4205 4.67182 12.8373 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z" fill="#34A853" />
                                                <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957275C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z" fill="#FBBC05" />
                                                <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L14.9891 2.37682C13.4673 0.957273 11.43 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335" />
                                            </svg>
                                            Google
                                        </button>
                                        <button type="button" className="btn-social microsoft">
                                            <svg width="18" height="18" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
                                                <rect x="1" y="1" width="9" height="9" fill="#F25022" />
                                                <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
                                                <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
                                                <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
                                            </svg>
                                            Microsoft
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <ForgetPassword
                                    onBackToLogin={() => setAuthMode('login')}
                                    lang={currentLang}
                                />
                            )}
                        </div>

                        <div className="auth-promo">
                            {resources.auth.panel.footer_promo}<br />
                            {resources.auth.panel.no_account} <a href="#" onClick={(e) => { e.preventDefault(); }}>{resources.auth.panel.register}</a>
                        </div>

                        <footer className="auth-panel-footer">
                            <div className="auth-copyright">
                                {resources.app.copyright}
                            </div>
                        </footer>
                    </section>
                </div>
            </ConfigProvider >
        );
    }

    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#3f7cff',
                    borderRadius: 12,
                    fontFamily: 'Inter, system-ui, sans-serif',
                },
                components: {
                    Tabs: {
                        titleFontSize: 16,
                        fontWeightStrong: 900,
                        horizontalMargin: '0 0 32px 0',
                    }
                }
            }}
        >
            <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
                <Sidebar
                    collapsed={false}
                    onToggle={() => { }}
                    onSelectCustomer={setSelectedCustomer}
                />
                <div className="flex-1 flex flex-col min-w-0">
                    <Header />
                    <main className="flex-1 overflow-y-auto p-12">
                        {selectedCustomer ? (
                            <CustomerPortal customer={selectedCustomer} />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                                <span className="material-symbols-outlined text-[120px] mb-4">account_circle</span>
                                <h3 className="text-4xl font-black">お客様を選択してください</h3>
                                <p className="text-xl font-bold">左側のリストからお客様を選択して情報を表示します</p>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </ConfigProvider>
    );
};

export default App;
