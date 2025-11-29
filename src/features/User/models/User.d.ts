export interface User {
    id: number;
    username: string;
    password?: string;
    isAdmin: boolean;
    createdAt: string;
};
