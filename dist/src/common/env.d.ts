export declare function readEnv(env: NodeJS.ProcessEnv, name: string): string | undefined;
export declare function requireEnv(env: NodeJS.ProcessEnv, name: string): string;
export declare function readBooleanEnv(env: NodeJS.ProcessEnv, name: string): boolean | undefined;
export declare function readIntegerEnv(env: NodeJS.ProcessEnv, name: string, options?: {
    min?: number;
    max?: number;
}): number | undefined;
export declare function readEnumEnv<const T extends readonly string[]>(env: NodeJS.ProcessEnv, name: string, allowed: T): T[number] | undefined;
export declare function readRpcEnv(env: NodeJS.ProcessEnv, name: string, production: boolean): string | undefined;
export declare function readWsEnv(env: NodeJS.ProcessEnv, name: string, production: boolean): string | undefined;
//# sourceMappingURL=env.d.ts.map