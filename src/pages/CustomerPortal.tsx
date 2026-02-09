import React, { useState } from 'react';
import { Tabs, Tag } from 'antd';
import { Customer } from '../types';
import OrgTree from '../components/OrgTree';
import RemoteAccess from '../components/RemoteAccess';
import ContractList from '../components/ContractList';

interface CustomerPortalProps {
    customer: Customer;
}

const CustomerPortal: React.FC<CustomerPortalProps> = ({ customer }) => {
    const [activeTab, setActiveTab] = useState('1');

    const tabItems = [
        { key: '1', label: '基本情報', children: <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm min-h-[400px]">基本情報コンテンツ (Mock)</div> },
        { key: '2', label: '組織構成', children: <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm min-h-[400px]"><OrgTree /></div> },
        { key: '3', label: '実施製品', children: <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm min-h-[400px]">実施製品リスト (Mock)</div> },
        { key: '4', label: '契約管理', children: <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm min-h-[400px]"><ContractList /></div> },
        { key: '5', label: 'カスタマイズ', children: <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm min-h-[400px]">カスタマイズ詳細 (Mock)</div> },
        { key: '6', label: 'データ資料', children: <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm min-h-[400px]">データ資料一覧 (Mock)</div> },
        { key: '7', label: '特殊対応', children: <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm min-h-[400px]">特殊アプリケーション情報 (Mock)</div> },
        { key: '8', label: 'リモート接続', children: <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm min-h-[400px]"><RemoteAccess /></div> },
        { key: '9', label: '顧客要望', children: <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm min-h-[400px]">要望・フィードバック (Mock)</div> },
        { key: '10', label: 'バックアップ', children: <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm min-h-[400px]">バックアップリンク (Mock)</div> },
        { key: '11', label: 'その他ファイル', children: <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm min-h-[400px]">補足資料 (Mock)</div> },
        { key: '12', label: '責任マトリクス', children: <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm min-h-[400px]">担当者一覧 (Mock)</div> },
    ];

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-[32px] bg-white p-10 md:p-16 border border-slate-100 shadow-xl shadow-slate-200/50">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] select-none pointer-events-none">
                    <span className="text-[200px] font-black leading-none">{customer.code}</span>
                </div>

                <div className="relative z-10 flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <Tag color="orange" className="font-bold border-none px-3 py-0.5 rounded-full">{customer.industry}</Tag>
                        <span className="text-slate-400 font-bold text-sm tracking-widest">{customer.code}</span>
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-900 leading-tight">
                        {customer.name}
                    </h1>
                    <p className="text-lg md:text-2xl font-bold text-slate-400">
                        {customer.shortName} <span className="mx-4 text-slate-200">|</span> 顧客ステータス:
                        <span className={`ml-2 ${customer.status === 'active' ? 'text-green-500' : 'text-orange-500'}`}>
                            {customer.status.toUpperCase()}
                        </span>
                    </p>
                </div>

                {/* Decorative corner */}
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-transparent to-primary/5 rounded-tl-full"></div>
            </div>

            {/* Tabs */}
            <div className="customer-tabs">
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={tabItems}
                    className="custom-tabs"
                />
            </div>
        </div>
    );
};

export default CustomerPortal;
