import crypto from "crypto";

export function genRefreshToken(): string {
    return crypto.randomBytes(64).toString("base64url");
}

export function hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
}
