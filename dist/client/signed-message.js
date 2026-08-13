import bs58 from "bs58";
import nacl from "tweetnacl";
import { PublicKey } from "@solana/web3.js";
import { assertSignedMessagePayload } from "../src/operations/policy.js";
export function verifySolanaSignedMessage(envelope) {
    if (envelope.version !== "1.0.0") {
        throw new Error("PWRC_SIGNED_MESSAGE_VERSION_INVALID");
    }
    const signer = new PublicKey(envelope.signer);
    const message = Buffer.from(envelope.messageBase64, "base64");
    assertSignedMessagePayload(message);
    const signature = bs58.decode(envelope.signatureBase58);
    if (signature.length != 64) {
        throw new Error("PWRC_SIGNED_MESSAGE_SIGNATURE_INVALID");
    }
    return nacl.sign.detached.verify(message, signature, signer.toBytes());
}
//# sourceMappingURL=signed-message.js.map