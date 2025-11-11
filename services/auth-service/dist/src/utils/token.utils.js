import crypto from "crypto";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();
export function genRefreshToken() {
    return crypto.randomBytes(64).toString("hex"); // 128 hex chars
}
export async function hashPassword(password) {
    const rounds = Number(process.env.BCRYPT_SALT_ROUNDS || 12);
    return bcrypt.hash(password, rounds);
}
export async function comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
}
export async function hashToken(token) {
    const rounds = Number(process.env.BCRYPT_SALT_ROUNDS || 12);
    return bcrypt.hash(token, rounds);
}
export async function compareToken(token, hash) {
    return bcrypt.compare(token, hash);
}
//# sourceMappingURL=token.utils.js.map