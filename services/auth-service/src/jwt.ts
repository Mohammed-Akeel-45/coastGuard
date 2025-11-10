import fs from "fs";
import type { Algorithm, Secret } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

function getKeys(): { privateKey: Secret; publicKey: Secret; algo: Algorithm } {
    const algo = (process.env.JWT_ALGO || "RS256") as Algorithm;
    if (algo.startsWith("RS")) {
        return {
            privateKey: fs.readFileSync(process.env.JWT_PRIVATE_KEY_PATH || "./keys/jwt_private.pem"),
            publicKey: fs.readFileSync(process.env.JWT_PUBLIC_KEY_PATH || "./keys/jwt_public.pem"),
            algo
        };
    }
    const secret = process.env.JWT_PRIVATE_KEY_PATH || "supersecret";
    return { privateKey: secret, publicKey: secret, algo };
}

const { privateKey, publicKey, algo } = getKeys();

export function signAccessToken(payload: object): string {
    return jwt.sign(payload, privateKey, {
        algorithm: algo,
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES || "15m"
    });
}

export function verifyAccessToken(token: string): any {
    return jwt.verify(token, publicKey, { algorithms: [algo] });
}
