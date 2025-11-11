import type { QueryResultRow } from "pg";
export interface User extends QueryResultRow {
    user_id: number;
    user_name: string;
    email: string;
    user_role_id: number;
    phone: string;
    hashed_password?: string;
}
export interface Token {
    access_token: string;
    refresh_token: string;
    token_type: "bearer";
    expires_in: number;
}
//# sourceMappingURL=type.d.ts.map