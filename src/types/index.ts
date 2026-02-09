export type Language = 'ZH' | 'EN' | 'JA';

export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
}

export interface Customer {
    id: string;
    code: string;
    name: string;
    shortName: string;
    industry?: string;
    status: 'active' | 'inactive' | 'lead';
}

export interface OrganizationNode {
    id: string;
    name: string;
    type: 'department' | 'section' | 'member';
    children?: OrganizationNode[];
    isPrivate?: boolean;
}

export interface Contract {
    id: string;
    title: string;
    fileUrl: string;
    uploadDate: string;
    size: number;
    summary?: string;
}

export interface RemoteConnection {
    id: string;
    protocol: 'SSH' | 'RDP' | 'HTTP' | 'HTTPS';
    address: string;
    port: number;
    credentialsRef: string;
    description: string;
    args?: Record<string, string>;
}

export interface CustomerRequirement {
    id: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    status: 'open' | 'in-progress' | 'closed';
    date: string;
}
