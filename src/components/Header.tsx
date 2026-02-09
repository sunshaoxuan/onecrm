import React, { useState, useEffect } from 'react';
import { Avatar, Dropdown, Button, Input } from 'antd';
import { api } from '../services/api';
import { User, Language } from '../types';

const Header: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [lang, setLang] = useState<Language>('JA');

    useEffect(() => {
        api.getCurrentUser().then(setUser);
    }, []);

    const langMenu = {
        items: [
            { key: 'JA', label: '日本語', onClick: () => setLang('JA') },
            { key: 'EN', label: 'English', onClick: () => setLang('EN') },
            { key: 'ZH', label: '中文', onClick: () => setLang('ZH') },
        ]
    };

    return (
        <header className="h-20 bg-white border-b border-slate-100 px-8 flex items-center justify-between z-10">
            <div className="flex-1 max-w-xl">
                <Input
                    prefix={<span className="material-symbols-outlined text-primary text-lg">psychology</span>}
                    placeholder="AI 検索: 顧客の現状や重要事項について尋ねる..."
                    className="rounded-xl bg-slate-50 border-none h-11"
                />
            </div>

            <div className="flex items-center gap-6">
                <Dropdown menu={langMenu} trigger={['click']}>
                    <Button type="text" className="font-bold text-slate-500 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">language</span>
                        {lang}
                    </Button>
                </Dropdown>

                <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
                    <div className="text-right hidden md:block">
                        <div className="text-sm font-black text-slate-800 leading-none">{user?.name}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Administrator</div>
                    </div>
                    <Dropdown menu={{ items: [{ key: 'logout', label: 'サインアウト' }] }} trigger={['click']}>
                        <Avatar size={40} src={user?.avatar} className="border-2 border-primary/20 cursor-pointer hover:scale-110 transition-transform" />
                    </Dropdown>
                </div>
            </div>
        </header>
    );
};

export default Header;
