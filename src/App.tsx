import React, { useState } from 'react';
import { ConfigProvider } from 'antd';

const App: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log({ email, password, remember });
    };

    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#137fec',
                    borderRadius: 4,
                },
            }}
        >
            <div className="bg-background-light dark:bg-background-dark font-display min-h-screen flex flex-col overflow-x-hidden text-slate-900 dark:text-white">
                {/* Header */}
                <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-12 py-5 bg-transparent">
                    <div className="flex items-center gap-3 text-[#0d141b] dark:text-white">
                        <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20">
                            <svg className="size-5" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path clip-rule="evenodd" d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z" fill="currentColor" fill-rule="evenodd"></path>
                            </svg>
                        </div>
                        <h2 className="text-xl font-black leading-tight tracking-tight uppercase">OneCRM</h2>
                    </div>
                    <div className="hidden md:flex items-center gap-8">
                        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700"></div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-[#4c739a] dark:text-slate-400">
                            <span className="material-symbols-outlined text-[18px]">language</span>
                            <span className="text-primary cursor-pointer">JP</span>
                            <span className="opacity-30">|</span>
                            <button className="hover:text-primary transition-colors">EN</button>
                            <span className="opacity-30">|</span>
                            <button className="hover:text-primary transition-colors">CN</button>
                        </div>
                    </div>
                </header>

                <main className="flex-1 flex flex-col md:flex-row min-h-screen">
                    {/* Hero Section */}
                    <section className="relative w-full md:w-3/5 flex flex-col justify-center px-8 md:px-20 py-24 bg-[#0a0f14] overflow-hidden">
                        <div className="absolute inset-0 z-0">
                            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]"></div>
                            <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px]"></div>
                        </div>
                        <div className="relative z-10 max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider mb-8">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                </span>
                                v3.0 Now Live
                            </div>
                            <h1 className="text-white text-5xl md:text-6xl font-black leading-[1.2] tracking-tight mb-8">
                                散らばる営みを<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">ひとつの流れへ</span>
                            </h1>
                            <p className="text-slate-400 text-lg md:text-xl font-normal leading-relaxed mb-12 max-w-lg">
                                秩序が生まれ、未来の轮郭が立ち上がる
                            </p>
                            <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10 group bg-white/5 backdrop-blur-md">
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                                    style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuApEG2jTUqSOHl1nujlsBwIzLANVHw755SxcLtv4o2fwBxH2Vm1ytKc3HiOwYzQ1QYuGsxNcNIntz59oJwXJS5x54y7h3V3WaoWF8OJ7TKzlfJ-IeZuBo6chKKqGRfT8aV7kkdj129pJBlCbAOte_6qwIeKJhWhIh-AHHrEMFIKCyhNr6rBGrqRfDpAuMEBXkO0thGT4g6nDOcMzj9MrAb-xQI5pK89EAVfzQR39M-unjnK_fXBGvWlAjJD9t8cf2Lj-7AUKJt6DA")' }}
                                ></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                                    <div className="flex -space-x-3">
                                        <img alt="User" className="w-10 h-10 rounded-full border-2 border-slate-900" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDaxN-ldCJ4aPDOt3Bi1Z5wy-0OX73mkf_0g7vBtIYXvFrSF77JX7TKB1JylTMBjzrpKR2TBWlB1OG0pG9nEHJfwv8B_oduaZoWwWlW55enelFBKodAYPNFOdxSYE_mJGyTaIiJ0U6WnGG46Pa4Dzh5hs9kwLxMwhvTgZdWox728R6uOZKmwQHvXO67aM-3gFe4WHCBBo0vOyPlBtk4Eyz9Krq21DIZK7NxnbwcAFQQR4iPyAq_LR5e3BgjUviiCpJJqEw8LEngJg" />
                                        <img alt="User" className="w-10 h-10 rounded-full border-2 border-slate-900" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC48sklMWHQWnQqZ0q6NTzPHeOwNBdlmBZHo2l-VUJF4s7njKH8KijCvb4dYLdUoWBQxB7e_EE6xrVtLwr3XcZC6LpBo7ZdxB9jZfFUf6zQ4ZExdNnQ2qrxSPUIB8q1_KvduhkfJwzt4OrKrqsVpyMczJfCtlZzvXcvHYh-aKZfMPJC3IM_uTjE7zHcNAqfXjrhY2MKEaGKYfTnsPdb124aEKozV4re7w08REPavCqdK1O1r67dHOhhcEF8k749p0f5QLga4WUOGA" />
                                        <img alt="User" className="w-10 h-10 rounded-full border-2 border-slate-900" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDnNmXIe2oTlLsjsPh_sEbtGgB2c2dhFg2GOuZSqNGrSibEFaA1B0XgNbhSLKcdQ0ooisKOrqv41EtJAfHX1UDFSIcvpGctQ5TcCTCuteNpvwlSMQVZ7IIwV79tOnwidCjVWKv9QhTtugIefC9o1CIxGRICX_ZwFA9S3Rvoodcnyzc3x0z_xPKhJsY3mVjUywfBO5CaeMb1zQX7rWjjCfL4J6jZ_gOvJtM5Tvxk9dhQf7zA12KoBx2bfwscrFHnkvGyvrm3JmvV7Q" />
                                        <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white tracking-tighter">+2.4k</div>
                                    </div>
                                    <div className="flex items-center gap-2 text-white/80 text-sm font-medium bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                                        <span className="material-symbols-outlined text-sm">trending_up</span>
                                        <span>業務効率 42% 向上</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Login Section */}
                    <section className="w-full md:w-2/5 flex flex-col items-center justify-center bg-white dark:bg-background-dark px-8 py-20 relative">
                        <div className="w-full max-w-[400px]">
                            <div className="mb-10 text-center md:text-left">
                                <h2 className="text-[#0d141b] dark:text-white text-3xl font-bold tracking-tight mb-3">おかえりなさい</h2>
                                <p className="text-[#4c739a] dark:text-slate-400 text-sm font-normal">OneCRMのアカウント情報を入力してください</p>
                            </div>
                            <form className="space-y-6" onSubmit={handleSubmit}>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[#0d141b] dark:text-slate-200 text-sm font-semibold px-1">メールアドレス</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#4c739a] group-focus-within:text-primary transition-colors">
                                            <span className="material-symbols-outlined text-[20px]">mail</span>
                                        </div>
                                        <input
                                            className="w-full pl-11 pr-4 py-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-[#0d141b] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                                            placeholder="name@company.com"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-[#0d141b] dark:text-slate-200 text-sm font-semibold">パスワード</label>
                                        <a className="text-primary text-xs font-bold hover:underline" href="#">パスワードをお忘れですか？</a>
                                    </div>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#4c739a] group-focus-within:text-primary transition-colors">
                                            <span className="material-symbols-outlined text-[20px]">lock</span>
                                        </div>
                                        <input
                                            className="w-full pl-11 pr-12 py-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-[#0d141b] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                                            placeholder="••••••••"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <button className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#4c739a] hover:text-primary transition-colors" type="button">
                                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 px-1">
                                    <input
                                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary"
                                        id="remember"
                                        type="checkbox"
                                        checked={remember}
                                        onChange={(e) => setRemember(e.target.checked)}
                                    />
                                    <label className="text-sm text-[#4c739a] dark:text-slate-400 select-none cursor-pointer" htmlFor="remember">ログイン状態を維持する</label>
                                </div>
                                <button
                                    className="w-full flex items-center justify-center gap-2 h-14 rounded-xl bg-gradient-to-r from-primary to-[#0066cc] text-white font-bold text-base shadow-lg shadow-primary/30 hover:shadow-primary/40 active:scale-[0.98] transition-all"
                                    type="submit"
                                >
                                    <span>サインイン</span>
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </button>
                            </form>
                            <div className="relative my-10">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-slate-200 dark:border-slate-800"></span>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white dark:bg-background-dark px-4 text-[#4c739a] dark:text-slate-500 font-medium">または他のアカウントで続行</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <button className="flex items-center justify-center gap-2 h-12 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-transparent text-sm font-semibold text-[#0d141b] dark:text-white hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"></path>
                                    </svg>
                                    Google
                                </button>
                                <button className="flex items-center justify-center gap-2 h-12 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-transparent text-sm font-semibold text-[#0d141b] dark:text-white hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                                    <svg className="w-5 h-5 text-black dark:text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path>
                                    </svg>
                                    GitHub
                                </button>
                            </div>
                            <div className="mt-12 text-center">
                                <p className="text-sm text-[#4c739a] dark:text-slate-400">
                                    アカウントをお持ちではありませんか？
                                    <a className="text-primary font-bold ml-1 hover:underline" href="#">新規登録</a>
                                </p>
                            </div>
                        </div>
                        <div className="absolute bottom-8 text-[11px] text-slate-400 dark:text-slate-600 flex flex-wrap justify-center gap-6">
                            <a className="hover:text-primary transition-colors" href="#">プライバシーポリシー</a>
                            <a className="hover:text-primary transition-colors" href="#">利用规约</a>
                            <a className="hover:text-primary transition-colors" href="#">Cookieポリシー</a>
                            <span className="flex items-center gap-1 opacity-60">
                                <span className="material-symbols-outlined text-[12px]">copyright</span> 2024 OneCRM
                            </span>
                        </div>
                    </section>
                </main>
            </div>
        </ConfigProvider>
    );
};

export default App;
