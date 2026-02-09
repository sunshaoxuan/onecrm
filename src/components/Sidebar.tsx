import React, { useState, useEffect } from 'react';
import { Input, List, Skeleton, Badge } from 'antd';
import { api } from '../services/api';
import { Customer } from '../types';

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
    onSelectCustomer?: (customer: Customer) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onSelectCustomer }) => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        api.getCustomers().then(data => {
            setCustomers(data);
            setLoading(false);
        });
    }, []);

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <aside className={`${collapsed ? 'w-20' : 'w-72'} transition-all duration-300 border-r border-slate-100 bg-white flex flex-col h-full bg-white/70 backdrop-blur-xl`}>
            <div className="p-6 flex items-center gap-3">
                <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white flex-shrink-0">
                    <svg className="size-5" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z" fill="currentColor"></path></svg>
                </div>
                {!collapsed && <span className="font-black tracking-tighter text-xl uppercase">OneCRM</span>}
            </div>

            <div className="px-4 mb-4">
                {!collapsed && (
                    <Input
                        prefix={<span className="material-symbols-outlined text-slate-400 text-sm">search</span>}
                        placeholder="お客様を検索..."
                        className="rounded-lg bg-slate-50 border-none"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                )}
            </div>

            <div className="flex-1 overflow-y-auto px-2">
                {loading ? (
                    <div className="p-4 space-y-4">
                        <Skeleton active title={false} paragraph={{ rows: 6 }} />
                    </div>
                ) : (
                    <List
                        dataSource={filteredCustomers}
                        renderItem={item => (
                            <List.Item
                                className="hover:bg-primary/5 cursor-pointer rounded-xl px-4 border-none transition-colors group mb-1"
                                onClick={() => onSelectCustomer?.(item)}
                            >
                                <div className="flex flex-col w-full">
                                    <div className="flex justify-between items-center h-8">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.code}</span>
                                        <Badge status={item.status === 'active' ? 'success' : item.status === 'lead' ? 'processing' : 'default'} />
                                    </div>
                                    {!collapsed && <span className="text-sm font-bold text-slate-700 truncate">{item.name}</span>}
                                </div>
                            </List.Item>
                        )}
                    />
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
