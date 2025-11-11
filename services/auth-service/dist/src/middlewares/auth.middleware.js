import { verifyAccessToken } from "../jwt.js";
import { pool } from "../db.js";
export async function requireAuth(req, res, next) {
    const a = req.get("Authorization") || "";
    const parts = a.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer")
        return res.status(401).json({ error: "no token" });
    // workaround to not get typescript to yell at me for assigning string | undefined to string.
    const token = parts[1] || "";
    try {
        const payload = verifyAccessToken(token);
        // check session in DB
        const s = await pool.query("SELECT revoked, expires_at FROM sessions WHERE session_id=$1", [payload.session_id]);
        if (s.rowCount === 0)
            return res.status(401).json({ error: "session not found" });
        const session = s.rows[0];
        if (session.revoked || new Date(session.expires_at) < new Date())
            return res.status(401).json({ error: "session revoked/expired" });
        // attach user info
        req.auth = { user_id: payload.sub, role: payload.role, session_id: payload.session_id };
        return next();
    }
    catch (err) {
        return res.status(401).json({ error: "invalid_token" });
    }
}
export function requireRole(roleId) {
    return (req, res, next) => {
        const a = req.auth;
        if (!a)
            return res.status(401).json({ error: "unauth" });
        if (a.role !== roleId)
            return res.status(403).json({ error: "forbidden" });
        return next();
    };
}
//# sourceMappingURL=auth.middleware.js.map