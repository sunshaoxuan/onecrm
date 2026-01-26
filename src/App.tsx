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
                    colorPrimary: '#FD6C26',
                    borderRadius: 4,
                },
            }}
        >
            <div className="bg-[#FFFFFF] font-display min-h-screen flex flex-col overflow-x-hidden text-slate-900">
                {/* Header */}
                <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 md:py-6 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2 md:gap-3 text-slate-900">
                        <div className="size-7 md:size-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20">
                            <svg className="size-4 md:size-5" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path clipRule="evenodd" d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z" fill="currentColor" fillRule="evenodd"></path>
                            </svg>
                        </div>
                        <h2 className="text-lg md:text-xl font-black leading-tight tracking-tight uppercase flex items-baseline select-none">
                            O<span className="text-[0.85em] lowercase">ne</span>CRM
                        </h2>
                    </div>
                    <div className="hidden sm:flex items-center gap-4 md:gap-8">
                        <nav className="flex items-center gap-6 text-sm font-semibold text-slate-600 mr-4">
                            <a href="#" className="hover:text-primary transition-colors">製品</a>
                            <a href="#" className="hover:text-primary transition-colors">ソリューション</a>
                            <a href="#" className="hover:text-primary transition-colors">価格</a>
                        </nav>
                        <div className="h-4 w-px bg-slate-200"></div>
                        <div className="flex items-center gap-2 text-[10px] md:text-xs font-semibold text-slate-500">
                            <span className="material-symbols-outlined text-[16px] md:text-[18px]">language</span>
                            <span className="text-primary cursor-pointer">JP</span>
                            <span className="opacity-30">|</span>
                            <button className="hover:text-primary transition-colors">EN</button>
                            <span className="opacity-30">|</span>
                            <button className="hover:text-primary transition-colors">CN</button>
                        </div>
                    </div>
                </header>

                <main className="flex-1 flex flex-col md:flex-row min-h-screen pt-16 md:pt-20">
                    {/* Hero Section - Sunny & Positive (PC prioritized) */}
                    <section className="relative w-full md:w-3/5 min-h-[40vh] md:min-h-screen flex flex-col justify-center px-6 sm:px-12 md:px-20 py-20 md:py-24 bg-[#F8FAFC] overflow-hidden">
                        <div className="absolute inset-0 z-0">
                            <div className="absolute top-[-5%] right-[-5%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-primary/10 rounded-full blur-[80px] md:blur-[140px]"></div>
                            <div className="absolute bottom-[-5%] left-[-5%] w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-orange-400/5 rounded-full blur-[70px] md:blur-[120px]"></div>
                            {/* Simple Grid Background */}
                            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#FD6C26 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
                        </div>
                        <div className="relative z-10 max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-[9px] md:text-[10px] font-bold uppercase tracking-wider mb-6 md:mb-10">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                </span>
                                v3.0 Intelligent Update
                            </div>
                            <h1 className="text-slate-900 text-4xl sm:text-5xl md:text-7xl font-black leading-[1.1] tracking-tighter mb-6 md:mb-10">
                                散らばる営みを<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#ff9100]">ひとつの流れへ</span>
                            </h1>
                            <p className="text-slate-600 text-base md:text-2xl font-medium leading-relaxed mb-8 md:mb-16 max-w-lg">
                                秩序が生まれ、未来の輪郭が立ち上がる
                            </p>

                            {/* Visual Asset - Light & Clean */}
                            <div className="relative w-full aspect-video rounded-xl md:rounded-3xl overflow-hidden shadow-[0_32px_64px_-16px_rgba(253,108,38,0.15)] border border-slate-200 group bg-white p-2">
                                <div className="absolute inset-0 m-2 rounded-[inherit] overflow-hidden">
                                    <div
                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                                        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop")' }}
                                    ></div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent"></div>
                                </div>
                                <div className="absolute bottom-6 md:bottom-10 left-6 md:left-10 right-6 md:right-10 flex items-center justify-between z-10">
                                    <div className="flex -space-x-2 md:-space-x-4">
                                        {[1, 2, 3].map((i) => (
                                            <img
                                                key={i}
                                                alt="User"
                                                className="w-8 h-8 md:w-12 md:h-12 rounded-full border-2 border-white shadow-md"
                                                src={`https://i.pravatar.cc/150?u=${i + 10}`}
                                            />
                                        ))}
                                        <div className="w-8 h-8 md:w-12 md:h-12 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[9px] md:text-[11px] font-bold text-slate-600 tracking-tighter shadow-md">+2.4k</div>
                                    </div>
                                    <div className="flex items-center gap-1.5 md:gap-3 text-slate-800 text-[10px] md:text-base font-bold bg-white/90 backdrop-blur-xl px-4 md:px-7 py-2 md:py-4 rounded-full border border-slate-100 shadow-xl">
                                        <span className="material-symbols-outlined text-xs md:text-2xl text-primary">trending_up</span>
                                        <span>業務効率 42% 向上</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Login Section - Workbench prioritized */}
                    <section className="w-full md:w-2/5 flex flex-col items-center justify-center bg-white px-6 sm:px-12 md:px-16 py-16 md:py-20 relative">
                        <div className="w-full max-w-[380px] md:max-w-[420px]">
                            <div className="mb-8 md:mb-14 text-center md:text-left">
                                <div className="text-primary font-bold text-sm uppercase tracking-widest mb-2 opacity-80">Welcome Back</div>
                                <h2 className="text-slate-900 text-3xl md:text-4xl font-black tracking-tight mb-2 md:mb-4">おかえりなさい</h2>
                                <p className="text-slate-500 text-sm md:text-base font-medium">OneCRMのアカウント情報を入力してください</p>
                            </div>

                            <form className="space-y-4 md:space-y-8" onSubmit={handleSubmit}>
                                <div className="flex flex-col gap-2">
                                    <label className="text-slate-900 text-xs md:text-sm font-bold px-1 uppercase tracking-wider opacity-60">メールアドレス</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                                            <span className="material-symbols-outlined text-[18px] md:text-[22px]">mail</span>
                                        </div>
                                        <input
                                            className="w-full pl-12 pr-4 py-3.5 md:py-5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-slate-400/60 text-sm md:text-lg font-medium"
                                            placeholder="name@company.com"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-slate-900 text-xs md:text-sm font-bold uppercase tracking-wider opacity-60">パスワード</label>
                                        <a className="text-primary text-[10px] md:text-xs font-bold hover:underline" href="#">パスワードをお忘れですか？</a>
                                    </div>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                                            <span className="material-symbols-outlined text-[18px] md:text-[22px]">lock</span>
                                        </div>
                                        <input
                                            className="w-full pl-12 pr-12 py-3.5 md:py-5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-slate-400/60 text-sm md:text-lg font-medium"
                                            placeholder="••••••••"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <button className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-primary transition-colors" type="button">
                                            <span className="material-symbols-outlined text-[18px] md:text-[22px]">visibility</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 px-1">
                                    <input
                                        className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary transition-colors cursor-pointer"
                                        id="remember"
                                        type="checkbox"
                                        checked={remember}
                                        onChange={(e) => setRemember(e.target.checked)}
                                    />
                                    <label className="text-xs md:text-sm text-slate-500 select-none cursor-pointer font-bold" htmlFor="remember">ログイン状態を維持する</label>
                                </div>

                                <button
                                    className="w-full flex items-center justify-center gap-2 h-12 md:h-16 rounded-xl bg-gradient-to-r from-primary to-[#cc561d] text-white font-black text-sm md:text-lg shadow-xl shadow-primary/30 hover:shadow-primary/40 active:scale-[0.98] transition-all uppercase tracking-widest"
                                    type="submit"
                                >
                                    <span>サインイン</span>
                                    <span className="material-symbols-outlined text-[18px] md:text-[22px]">arrow_forward</span>
                                </button>
                            </form>

                            <div className="relative my-8 md:my-14">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-slate-100"></span>
                                </div>
                                <div className="relative flex justify-center text-[10px] md:text-xs uppercase tracking-[0.2em]">
                                    <span className="bg-white px-5 text-slate-400 font-black">OR CONTINUE WITH</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 md:gap-5">
                                <button className="flex items-center justify-center gap-2 h-11 md:h-14 rounded-xl border border-slate-200 bg-white text-[13px] md:text-base font-bold text-slate-900 hover:bg-slate-50 transition-colors shadow-sm">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"></path>
                                    </svg>
                                    Google
                                </button>
                                <button className="flex items-center justify-center gap-2 h-11 md:h-14 rounded-xl border border-slate-200 bg-white text-[13px] md:text-base font-bold text-slate-900 hover:bg-slate-50 transition-colors shadow-sm">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path>
                                    </svg>
                                    GitHub
                                </button>
                            </div>

                            <div className="mt-12 md:mt-16 text-center">
                                <p className="text-sm md:text-base text-slate-500 font-bold">
                                    アカウントをお持ちではありませんか？
                                    <a className="text-primary font-black ml-2 hover:underline" href="#">新規登録</a>
                                </p>
                            </div>
                        </div>

                        <div className="absolute bottom-6 md:bottom-10 text-[9px] md:text-[13px] text-slate-400 flex flex-wrap justify-center gap-4 md:gap-8 px-4 text-center font-bold">
                            <a className="hover:text-primary transition-colors" href="#">プライバシーポリシー</a>
                            <a className="hover:text-primary transition-colors" href="#">利用規約</a>
                            <a className="hover:text-primary transition-colors" href="#">Cookieポリシー</a>
                            <span className="flex items-center gap-1 opacity-60">
                                <span className="material-symbols-outlined text-[10px] md:text-[14px]">copyright</span> 2024 OneCRM
                            </span>
                        </div>
                    </section>
                </main>
            </div>
        </ConfigProvider>
    );
};

export default App;
