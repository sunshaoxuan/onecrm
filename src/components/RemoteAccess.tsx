import React from 'react';
import { Table, Tag, Button, Space, Card } from 'antd';
import { RemoteConnection } from '../types';

const mockConnections: RemoteConnection[] = [
    { id: 'rem1', protocol: 'SSH', address: '192.168.1.100', port: 22, credentialsRef: 'CRED-001', description: '開発サーバー' },
    { id: 'rem2', protocol: 'HTTPS', address: 'portal.cust-env.jp', port: 443, credentialsRef: 'CRED-002', description: '管理ポータル' },
];

const RemoteAccess: React.FC = () => {
    const columns = [
        { title: 'プロトコル', dataIndex: 'protocol', key: 'protocol', render: (p: string) => <Tag color="blue">{p}</Tag> },
        { title: 'アドレス', dataIndex: 'address', key: 'address', render: (a: string) => <span className="font-mono">{a}</span> },
        { title: 'ポート', dataIndex: 'port', key: 'port' },
        { title: '説明', dataIndex: 'description', key: 'description' },
        {
            title: 'アクション', key: 'action', render: () => (
                <Space>
                    <Button size="small" type="primary">接続</Button>
                    <Button size="small">詳細</Button>
                </Space>
            )
        },
    ];

    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card title="接続サマリー" className="rounded-2xl shadow-sm border-slate-100">
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between">
                            <span className="text-slate-400 font-bold">有効な接続</span>
                            <span className="font-black">2 件</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400 font-bold">最後の方</span>
                            <span className="font-black">2026-01-29</span>
                        </div>
                    </div>
                </Card>
                <Card title="AI アシスタント" className="rounded-2xl shadow-sm border-slate-100 bg-primary/5">
                    <p className="text-sm font-bold text-slate-700">「SSH接続がタイムアウトする場合は、ポート 2222 を試してみてください。」</p>
                </Card>
            </div>

            <Table
                dataSource={mockConnections}
                columns={columns}
                rowKey="id"
                pagination={false}
                className="connection-table"
            />
        </div>
    );
};

export default RemoteAccess;
