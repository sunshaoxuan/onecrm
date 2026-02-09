import React, { useState } from 'react';
import { Tree, Switch, Button, Space, Tag } from 'antd';
import { OrganizationNode } from '../types';

const mockOrgData: OrganizationNode[] = [
    {
        id: 'n1',
        name: '営業本部',
        type: 'department',
        children: [
            {
                id: 'n2', name: '第一営業部', type: 'department', children: [
                    { id: 'n3', name: '山田 太郎', type: 'member' },
                    { id: 'n4', name: '鈴木 一郎', type: 'member', isPrivate: true },
                ]
            },
            {
                id: 'n5', name: '第二営業部', type: 'department', children: [
                    { id: 'n6', name: '佐藤 花子', type: 'member' },
                ]
            },
        ]
    },
    {
        id: 'n7',
        name: 'システム開発部',
        type: 'department',
        children: [
            {
                id: 'n8', name: '開発チームA', type: 'department', children: [
                    { id: 'n9', name: '田中 次郎', type: 'member' },
                ]
            }
        ]
    }
];

const OrgTree: React.FC = () => {
    const [showPrivate, setShowPrivate] = useState(false);

    // Simple filter for private nodes
    const filterNodes = (nodes: OrganizationNode[]): OrganizationNode[] => {
        return nodes
            .filter(n => showPrivate || !n.isPrivate)
            .map(n => ({
                ...n,
                children: n.children ? filterNodes(n.children) : undefined
            }));
    };

    const treeData = filterNodes(mockOrgData).map(n => ({
        key: n.id,
        title: (
            <Space>
                {n.type === 'department' ? (
                    <span className="font-bold">{n.name}</span>
                ) : (
                    <span>{n.name}</span>
                )}
                {n.isPrivate && <Tag color="red">Private</Tag>}
            </Space>
        ),
        children: n.children?.map(c => ({
            key: c.id,
            title: <Space>{c.name} {c.isPrivate && <Tag color="red">Private</Tag>}</Space>
        })) // Simplified for Mock depth
    }));

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl">
                <Space size="large">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-500">公開ビュー</span>
                        <Switch checked={showPrivate} onChange={setShowPrivate} />
                        <span className="text-sm font-bold text-slate-500">編集・プライベートビュー</span>
                    </div>
                </Space>
                <Button type="primary" className="rounded-full px-8 font-bold">ビューを公開</Button>
            </div>

            <div className="p-4 border border-slate-100 rounded-3xl bg-white">
                <Tree
                    showIcon
                    defaultExpandAll
                    treeData={treeData}
                    className="org-tree-custom"
                />
            </div>
        </div>
    );
};

export default OrgTree;
