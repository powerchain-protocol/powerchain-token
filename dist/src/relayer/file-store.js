import { mkdir, open, readFile, readdir, } from "node:fs/promises";
import { join } from "node:path";
import { atomicWriteJson, } from "../common/atomic-file.js";
const HASH = /^[a-f0-9]{64}$/i;
function assertHashKey(key) {
    if (!HASH.test(key)) {
        throw new Error("PWRC_DURABLE_STORE_KEY_INVALID");
    }
}
function assertRecord(record) {
    assertHashKey(record.key);
    if (record.version !== "1.0.0") {
        throw new Error("PWRC_RELAYER_RECORD_VERSION_INVALID");
    }
    if (!record.sourceReference.trim()) {
        throw new Error("PWRC_RELAYER_SOURCE_REFERENCE_REQUIRED");
    }
    if (!Number.isSafeInteger(record.attempts) ||
        record.attempts < 0 ||
        record.attempts > 1_000) {
        throw new Error("PWRC_RELAYER_ATTEMPTS_INVALID");
    }
    for (const value of [record.createdAt, record.updatedAt]) {
        if (Number.isNaN(Date.parse(value))) {
            throw new Error("PWRC_RELAYER_TIMESTAMP_INVALID");
        }
    }
}
async function exclusiveWriteJson(file, value) {
    let handle;
    try {
        handle = await open(file, "wx", 0o600);
        await handle.writeFile(`${JSON.stringify(value, null, 2)}\n`);
        await handle.sync();
        return true;
    }
    catch (error) {
        const code = error &&
            typeof error === "object" &&
            "code" in error
            ? String(error.code)
            : "";
        if (code === "EEXIST") {
            return false;
        }
        throw error;
    }
    finally {
        await handle?.close();
    }
}
export class FileBridgeIdempotencyStore {
    directory;
    constructor(directory) {
        this.directory = directory;
        if (!directory.trim()) {
            throw new Error("PWRC_RELAYER_STORE_DIRECTORY_REQUIRED");
        }
    }
    #file(key) {
        assertHashKey(key);
        return join(this.directory, `${key.toLowerCase()}.json`);
    }
    async get(key) {
        const file = this.#file(key);
        try {
            const record = JSON.parse(await readFile(file, "utf8"));
            assertRecord(record);
            if (record.key.toLowerCase() !== key.toLowerCase()) {
                throw new Error("PWRC_RELAYER_RECORD_KEY_MISMATCH");
            }
            return record;
        }
        catch (error) {
            const code = error &&
                typeof error === "object" &&
                "code" in error
                ? String(error.code)
                : "";
            if (code === "ENOENT") {
                return null;
            }
            throw error;
        }
    }
    async put(record) {
        assertRecord(record);
        await atomicWriteJson(this.#file(record.key), record);
    }
    async reserve(record) {
        assertRecord(record);
        await mkdir(this.directory, { recursive: true });
        return exclusiveWriteJson(this.#file(record.key), record);
    }
    async list() {
        await mkdir(this.directory, { recursive: true });
        const names = (await readdir(this.directory))
            .filter((name) => /^[a-f0-9]{64}\.json$/i.test(name))
            .sort();
        const records = [];
        for (const name of names) {
            const key = name.slice(0, -5);
            const record = await this.get(key);
            if (record)
                records.push(record);
        }
        return records;
    }
}
export class FileReplayStore {
    directory;
    constructor(directory) {
        this.directory = directory;
        if (!directory.trim()) {
            throw new Error("PWRC_REPLAY_STORE_DIRECTORY_REQUIRED");
        }
    }
    #file(key) {
        assertHashKey(key);
        return join(this.directory, key.toLowerCase());
    }
    async has(key) {
        try {
            await readFile(this.#file(key));
            return true;
        }
        catch (error) {
            const code = error &&
                typeof error === "object" &&
                "code" in error
                ? String(error.code)
                : "";
            if (code === "ENOENT")
                return false;
            throw error;
        }
    }
    async reserve(key) {
        assertHashKey(key);
        await mkdir(this.directory, { recursive: true });
        let handle;
        try {
            handle = await open(this.#file(key), "wx", 0o600);
            await handle.writeFile("reserved\n");
            await handle.sync();
            return true;
        }
        catch (error) {
            const code = error &&
                typeof error === "object" &&
                "code" in error
                ? String(error.code)
                : "";
            if (code === "EEXIST")
                return false;
            throw error;
        }
        finally {
            await handle?.close();
        }
    }
}
const TERMINAL_STATES = new Set([
    "reconciled",
    "blocked",
]);
export async function loadRecoverableBridgeOperations(store) {
    return (await store.list())
        .filter((record) => !TERMINAL_STATES.has(record.state))
        .sort((a, b) => a.updatedAt.localeCompare(b.updatedAt) ||
        a.key.localeCompare(b.key));
}
//# sourceMappingURL=file-store.js.map