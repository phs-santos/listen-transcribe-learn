export type User = {
    id: number;
    name: string;
    email: string;
    role?: "admin" | "user";
    token: string;
    created_at?: string;
    updated_at?: string;
};
