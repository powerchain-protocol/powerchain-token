import { open, mkdir, rename, unlink, } from "node:fs/promises";
import { dirname, basename, join } from "node:path";
import { randomBytes } from "node:crypto";
function temporaryPath(file) {
    const directory = dirname(file);
    const name = basename(file);
    const nonce = randomBytes(12).toString("hex");
    return join(directory, `.${name}.${process.pid}.${nonce}.tmp`);
}
async function syncDirectory(directory) {
    let handle;
    try {
        handle = await open(directory, "r");
        await handle.sync();
    }
    catch (error) {
        const code = error &&
            typeof error === "object" &&
            "code" in error
            ? String(error.code)
            : "";
        if (!["EINVAL", "ENOTSUP", "EISDIR", "EPERM"].includes(code)) {
            throw error;
        }
    }
    finally {
        await handle?.close();
    }
}
export async function atomicWriteFile(file, data, options = {}) {
    const directory = dirname(file);
    await mkdir(directory, { recursive: true });
    const temp = temporaryPath(file);
    let handle;
    try {
        handle = await open(temp, "wx", options.mode ?? 0o600);
        await handle.writeFile(data);
        if (options.durable !== false) {
            await handle.sync();
        }
        await handle.close();
        handle = undefined;
        await rename(temp, file);
        if (options.durable !== false) {
            await syncDirectory(directory);
        }
    }
    catch (error) {
        await handle?.close().catch(() => undefined);
        await unlink(temp).catch(() => undefined);
        throw error;
    }
}
export async function atomicWriteJson(file, value, options = {}) {
    await atomicWriteFile(file, `${JSON.stringify(value, null, 2)}\n`, options);
}
//# sourceMappingURL=atomic-file.js.map