import type { QueryResultRow } from "pg";

export interface User extends QueryResultRow {
    user_id: number;
    user_name: string;
    email: string;
    user_role_id: number;
    phone: string;
    hashed_password?: string;
};
