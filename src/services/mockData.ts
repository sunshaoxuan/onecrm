import { Customer, User } from '../types';

export const mockCurrentUser: User = {
    id: 'u1',
    name: '田中 太郎',
    email: 'tanaka.taro@example.com',
    avatar: 'https://i.pravatar.cc/150?u=tanaka'
};

export const mockCustomers: Customer[] = [
    { id: 'c1', code: 'CUST-001', name: '株式会社テクノロジー', shortName: 'テクノロジー', status: 'active', industry: 'IT' },
    { id: 'c2', code: 'CUST-002', name: 'グローバル・ロジスティクス', shortName: 'GLO', status: 'active', industry: 'Logistics' },
    { id: 'c3', code: 'CUST-003', name: 'フューチャー・マニュファクチャリング', shortName: 'FM', status: 'lead', industry: 'Manufacturing' },
    { id: 'c4', code: 'CUST-004', name: 'サンライズ・リサーチ', shortName: 'SRI', status: 'inactive', industry: 'Research' },
    { id: 'c5', code: 'CUST-005', name: 'ブルーオーシャン・コンサルティング', shortName: 'BOC', status: 'active', industry: 'Service' },
];
