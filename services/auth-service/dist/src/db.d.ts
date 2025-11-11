import type { QueryResultRow } from "pg";
import { Pool } from "pg";
export declare const pool: Pool;
export declare function query<T extends QueryResultRow>(sql: string, params?: any[]): Promise<T[]>;
export declare function queryOne<T extends QueryResultRow>(sql: string, params?: any[]): Promise<T | null>;
export declare function execute(sql: string, params?: any[]): Promise<number>;
//# sourceMappingURL=db.d.ts.map