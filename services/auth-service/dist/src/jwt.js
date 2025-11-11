import fs from "fs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
function getKeys() {
    const algo = (process.env.JWT_ALGO || "RS256");
    if (algo.startsWith("RS")) {
        return {
            privateKey: fs.readFileSync(process.env.JWT_PRIVATE_KEY_PATH || "./keys/jwt_private.pem"),
            publicKey: fs.readFileSync(process.env.JWT_PUBLIC_KEY_PATH || "./keys/jwt_public.pem"),
            algo
        };
    }
    const secret = process.env.JWT_SECRET || "supersecret";
    return { privateKey: secret, publicKey: secret, algo };
}
const { privateKey, publicKey, algo } = getKeys();
export function signAccessToken(payload) {
    const options = {
        algorithm: algo,
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES || "15m"
    };
    return jwt.sign(payload, privateKey, options);
}
export function verifyAccessToken(token) {
    return jwt.verify(token, publicKey, { algorithms: [algo] });
}
//# sourceMappingURL=jwt.js.map