import type { User } from "../type.ts";
import { query, queryOne, execute } from "../db.js";

export async function createUser(
    userName: string,
    email: string,
    hashedPassword: string,
    phone: string
): Promise<User> {
    const sql = `
    INSERT INTO users (user_name, email, hashed_password, phone)
    VALUES ($1, $2, $3, $4)
    RETURNING user_id, user_name, email, phone, created_at
  `;
    return (await queryOne<User>(sql, [userName, email, hashedPassword, phone]))!;
}

export async function findUserByEmail(email: string): Promise<User | null> {
    const sql = `
    SELECT user_id, user_name, email, phone, created_at
    FROM users
    WHERE email = $1
  `;
    return await queryOne<User>(sql, [email]);
}

export async function updateUserPhone(userId: string, newPhone: string): Promise<User | null> {
    const sql = `
    UPDATE users
    SET phone = $1
    WHERE user_id = $2
    RETURNING user_id, user_name, email, phone, created_at
  `;
    return await queryOne<User>(sql, [newPhone, userId]);
}

export async function deleteUser(userId: string): Promise<boolean> {
    const sql = `DELETE FROM users WHERE user_id = $1`;
    const count = await execute(sql, [userId]);
    return count > 0;
}

export async function createRefreshToken(userId: string, refreshTokenHash: string, expiresAt: Date): Promise<Token | null> {
    const sql = `
    INSERT INTO sessions (user_id, refresh_token_hash, expires_at)
    VALUES ($1, $2, $3)
    RETURNING refresh_token_hash
    `
}
