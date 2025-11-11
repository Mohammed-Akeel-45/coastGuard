import type { User } from "../type.ts";
import { query, queryOne, execute } from "../db.js";
import { v4 as uuidv4 } from "uuid";

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
    const sql = `SELECT * FROM users WHERE email = $1 AND is_deleted = false`;
    return await queryOne<User>(sql, [email]);
}

export async function findUserById(userId: string): Promise<User | null> {
    const sql = `SELECT * FROM users WHERE user_id = $1 AND is_deleted = false`;
    return await queryOne<User>(sql, [userId]);
}

export async function createSession(
    userId: number,
    tokenId: string,
    refreshTokenHash: string,
    ipAddr: string,
    userAgent: string,
    expiresAt: string
): Promise<void> {
    const sql = `
    INSERT INTO sessions (session_id, user_id, token_id, refresh_token_hash, ip_addr, user_agent, expires_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `;
    await execute(sql, [uuidv4(), userId, tokenId, refreshTokenHash, ipAddr, userAgent, expiresAt]);
}

export async function findSessionByTokenId(tokenId: string) {
    const sql = `SELECT * FROM sessions WHERE token_id = $1`;
    return await queryOne<any>(sql, [tokenId]);
}

export async function revokeSessionByTokenId(tokenId: string) {
    const sql = `UPDATE sessions SET revoked = true WHERE token_id = $1`;
    await execute(sql, [tokenId]);
}

export async function revokeAllSessionsForUser(userId: string) {
    const sql = `UPDATE sessions SET revoked = true WHERE user_id = $1`;
    await execute(sql, [userId]);
}

export async function rotateSession(
    oldSessionId: string,
    newTokenId: string,
    newRefreshTokenHash: string,
    ipAddr: string,
    userAgent: string,
    expiresAt: string
): Promise<void> {
    const newSessionId = uuidv4();
    const sql1 = `UPDATE sessions SET revoked = true, replaced_by_session_id = $1 WHERE session_id = $2`;
    const sql2 = `
    INSERT INTO sessions (session_id, user_id, token_id, refresh_token_hash, ip_addr, user_agent, expires_at)
    SELECT $1, user_id, $2, $3, $4, $5, $6 FROM sessions WHERE session_id = $7
  `;
    await execute(sql1, [newSessionId, oldSessionId]);
    await execute(sql2, [newSessionId, newTokenId, newRefreshTokenHash, ipAddr, userAgent, expiresAt, oldSessionId]);
}
