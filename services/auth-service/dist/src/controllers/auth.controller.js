import { pool } from "../db.js";
import { genRefreshToken, hashPassword, comparePassword, hashToken, compareToken } from "../utils/token.utils.js";
import { v7 as uuidv7 } from "uuid";
import { signAccessToken } from "../jwt.js";
const REFRESH_EXPIRES_DAYS = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 30);
function addDays(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString();
}
// ------------------- REGISTER -------------------
export async function register(req, res) {
    const { email, password, user_name, phone, user_role_id } = req.body;
    if (!email || !password || !user_name)
        return res.status(400).json({ error: "missing fields" });
    const hashed = await hashPassword(password);
    try {
        const q = `
      INSERT INTO users (user_name, email, hashed_password, phone, user_role_id)
      VALUES ($1,$2,$3,$4,$5)
      RETURNING user_id, email, user_name, user_role_id, created_at
    `;
        const r = await pool.query(q, [user_name, email, hashed, phone || null, user_role_id || null]);
        res.status(201).json({ user: r.rows[0] });
    }
    catch (err) {
        if (err.code === "23505")
            return res.status(409).json({ error: "email already exists" });
        console.error(err);
        res.status(500).json({ error: "internal" });
    }
}
// ------------------- LOGIN -------------------
export async function login(req, res) {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ error: "missing" });
    const r = await pool.query("SELECT * FROM users WHERE email=$1 AND is_deleted=false", [email]);
    if (r.rowCount === 0)
        return res.status(401).json({ error: "invalid" });
    const user = r.rows[0];
    const ok = await comparePassword(password, user.hashed_password);
    if (!ok)
        return res.status(401).json({ error: "invalid" });
    const sessionId = uuidv7();
    const tokenId = uuidv7();
    const secret = genRefreshToken();
    const refreshHash = await hashToken(secret);
    const expiresAt = addDays(REFRESH_EXPIRES_DAYS);
    await pool.query(`INSERT INTO sessions (session_id, user_id, token_id, refresh_token_hash, ip_addr, user_agent, expires_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`, [sessionId, user.user_id, tokenId, refreshHash, req.ip, req.get("User-Agent"), expiresAt]);
    const rawRefreshToken = `${tokenId}.${secret}`;
    const accessToken = signAccessToken({
        sub: user.user_id,
        session_id: sessionId,
        role: user.user_role_id
    });
    return res.json({
        access_token: accessToken,
        token_type: "bearer",
        expires_in: 15 * 60,
        refresh_token: rawRefreshToken
    });
}
// ------------------- REFRESH -------------------
export async function refreshToken(req, res) {
    const { refresh_token } = req.body;
    if (!refresh_token)
        return res.status(400).json({ error: "missing refresh_token" });
    const parts = refresh_token.split(".");
    if (parts.length !== 2)
        return res.status(400).json({ error: "malformed_token" });
    const [tokenId, secret] = parts;
    // Find the session by token_id
    const r = await pool.query("SELECT * FROM sessions WHERE token_id=$1", [tokenId]);
    if (r.rowCount === 0)
        return res.status(401).json({ error: "invalid_refresh" });
    const session = r.rows[0];
    // Check session validity
    if (session.revoked || new Date(session.expires_at) < new Date())
        return res.status(401).json({ error: "expired_or_revoked" });
    // Verify secret part
    const match = await compareToken(secret, session.refresh_token_hash);
    if (!match) {
        // token reuse or invalid secret -> revoke the chain
        await pool.query("UPDATE sessions SET revoked=true WHERE user_id=$1", [session.user_id]);
        return res.status(401).json({ error: "refresh_reuse_detected" });
    }
    // Rotate: revoke old, create new
    const newSessionId = uuidv7();
    const newTokenId = uuidv7();
    const newSecret = genRefreshToken();
    const newHash = await hashToken(newSecret);
    const expiresAt = addDays(REFRESH_EXPIRES_DAYS);
    await pool.query("BEGIN");
    try {
        await pool.query("UPDATE sessions SET revoked=true, replaced_by_session_id=$1 WHERE session_id=$2", [newSessionId, session.session_id]);
        await pool.query(`INSERT INTO sessions (session_id, user_id, token_id, refresh_token_hash, ip_addr, user_agent, expires_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`, [newSessionId, session.user_id, newTokenId, newHash, req.ip, req.get("User-Agent"), expiresAt]);
        await pool.query("COMMIT");
    }
    catch (err) {
        await pool.query("ROLLBACK");
        console.error(err);
        return res.status(500).json({ error: "internal" });
    }
    const ur = await pool.query("SELECT user_id, user_name, user_role_id FROM users WHERE user_id=$1", [session.user_id]);
    const user = ur.rows[0];
    const newAccessToken = signAccessToken({
        sub: user.user_id,
        session_id: newSessionId,
        role: user.user_role_id
    });
    const newRawRefreshToken = `${newTokenId}.${newSecret}`;
    return res.json({
        access_token: newAccessToken,
        token_type: "bearer",
        expires_in: 15 * 60,
        refresh_token: newRawRefreshToken
    });
}
// ------------------- LOGOUT -------------------
export async function logout(req, res) {
    const { refresh_token } = req.body;
    if (!refresh_token)
        return res.status(400).json({ error: "missing refresh_token" });
    const parts = refresh_token.split(".");
    if (parts.length !== 2)
        return res.status(400).json({ error: "malformed_token" });
    const [tokenId] = parts;
    await pool.query("UPDATE sessions SET revoked=true WHERE token_id=$1", [tokenId]);
    return res.json({ ok: true });
}
//# sourceMappingURL=auth.controller.js.map