import { mockCustomers, mockCurrentUser } from './mockData';
import { Customer, User } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
    getCurrentUser: async (): Promise<User> => {
        await delay(500);
        return mockCurrentUser;
    },
    getCustomers: async (): Promise<Customer[]> => {
        await delay(800);
        return mockCustomers;
    },
    getCustomerById: async (id: string): Promise<Customer | undefined> => {
        await delay(600);
        return mockCustomers.find(c => c.id === id);
    }
};
