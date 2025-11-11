import type { User } from "../type.ts";
export declare function createUser(userName: string, email: string, hashedPassword: string, phone: string): Promise<User>;
export declare function findUserByEmail(email: string): Promise<User | null>;
export declare function updateUserPhone(userId: string, newPhone: string): Promise<User | null>;
export declare function deleteUser(userId: string): Promise<boolean>;
export declare function createRefreshToken(userId: string, refreshTokenHash: string, expiresAt: Date): Promise<Number>;
//# sourceMappingURL=auth.services.d.ts.map