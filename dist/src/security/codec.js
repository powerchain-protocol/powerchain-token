export const PWRC_FORMAT_VERSION = 1;
export function assertFormatVersion(version) {
    if (version !== PWRC_FORMAT_VERSION) {
        throw new Error("PWRC_UNSUPPORTED_FORMAT_VERSION");
    }
}
export function readExactBytes(input, expectedLength) {
    if (input.length !== expectedLength) {
        throw new Error("PWRC_MALFORMED_OR_TRAILING_BYTES");
    }
    return input;
}
//# sourceMappingURL=codec.js.map