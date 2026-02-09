import React from 'react';
import { List, Button, Space, Tag, Typography } from 'antd';
import { Contract } from '../types';

const { Text } = Typography;

const mockContracts: Contract[] = [
    { id: 'con1', title: '2025年度保守契約書', uploadDate: '2025-12-01', size: 2400000, fileUrl: '#', summary: 'サーバー保守及びセキュリティアップデートに関する契約。' },
    { id: 'con2', title: 'システム拡張に関する覚書', uploadDate: '2026-01-15', size: 540000, fileUrl: '#', summary: '新機能追加に伴う開発費用の調整。' },
];

const ContractList: React.FC = () => {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center bg-primary/5 p-6 rounded-[24px]">
                <div>
                    <h4 className="text-xl font-black text-slate-800">AI 契約分析</h4>
                    <p className="text-sm font-bold text-slate-500">直近の契約では保守範囲が 15% 拡大されています。</p>
                </div>
                <Button danger type="primary" className="rounded-full px-6 font-bold">重要事項を確認</Button>
            </div>

            <List
                dataSource={mockContracts}
                renderItem={item => (
                    <List.Item className="bg-white border border-slate-100 rounded-3xl p-6 mb-4 flex flex-col items-start gap-4">
                        <div className="flex justify-between w-full items-center">
                            <Space>
                                <span className="material-symbols-outlined text-primary">description</span>
                                <span className="text-lg font-black text-slate-800">{item.title}</span>
                                <Tag color="blue">PDF</Tag>
                            </Space>
                            <Text type="secondary" className="font-bold text-xs uppercase tracking-widest">{item.uploadDate}</Text>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl w-full border-l-4 border-primary">
                            <Text className="text-sm font-bold text-slate-600 italic">AI 要約: {item.summary}</Text>
                        </div>

                        <div className="flex justify-between w-full mt-2">
                            <Text type="secondary" className="text-xs font-bold">サイズ: {(item.size / 1024 / 1024).toFixed(2)} MB</Text>
                            <Space>
                                <Button type="link" className="font-black text-primary p-0">表示</Button>
                                <Button type="link" className="font-black text-primary p-0">ダウンロード</Button>
                            </Space>
                        </div>
                    </List.Item>
                )}
            />
        </div>
    );
};

export default ContractList;
