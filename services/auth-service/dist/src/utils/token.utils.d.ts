export declare function genRefreshToken(): string;
export declare function hashPassword(password: string): Promise<string>;
export declare function comparePassword(password: string, hash: string): Promise<boolean>;
export declare function hashToken(token: string): Promise<string>;
export declare function compareToken(token: string, hash: string): Promise<boolean>;
//# sourceMappingURL=token.utils.d.ts.map