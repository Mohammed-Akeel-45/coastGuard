import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();
export const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});
export async function query(sql, params = []) {
    const result = await pool.query(sql, params);
    return result.rows;
}
export async function queryOne(sql, params = []) {
    const result = await pool.query(sql, params);
    return result.rows[0] || null;
}
export async function execute(sql, params = []) {
    const result = await pool.query(sql, params);
    return result.rowCount || 0;
}
//# sourceMappingURL=db.js.map