export interface AtomicWriteOptions {
    mode?: number;
    durable?: boolean;
}
export declare function atomicWriteFile(file: string, data: string | Uint8Array, options?: AtomicWriteOptions): Promise<void>;
export declare function atomicWriteJson(file: string, value: unknown, options?: AtomicWriteOptions): Promise<void>;
//# sourceMappingURL=atomic-file.d.ts.map