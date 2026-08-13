import * as anchor from "@coral-xyz/anchor";
import axios, { type AxiosInstance } from "axios";
import bs58 from "bs58";
import fs from "node:fs";
import {
  Connection,
  Keypair,
  PublicKey,
  type Commitment,
  type Finality,
} from "@solana/web3.js";
import {
  getMint,
  getTransferFeeConfig,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import { resolvePwrcRpc } from "../../protocol/src/solana.js";
import {
  PWRC_CANONICAL_MINT,
  PWRC_DECIMALS,
  PWRC_MAX_BASE_UNITS,
  PWRC_MAX_TRANSFER_FEE_BASE_UNITS,
  PWRC_TRANSFER_FEE_BPS_NUMBER,
} from "../../protocol/src/constants.js";

export type PWRCCluster = "devnet" | "mainnet-beta" | "localnet";

export interface PWRCClientOptions {
  cluster: PWRCCluster;
  rpcUrl?: string;
  commitment?: Commitment;
  wallet?: anchor.Wallet;
  timeoutMs?: number;
}

export interface PWRCRpcResponse<T> {
  jsonrpc: "2.0";
  id: number | string;
  result?: T;
  error?: { code: number; message: string; data?: unknown };
}

export interface PWRCMintSnapshot {
  mint: string;
  cluster: PWRCCluster;
  ownerProgram: string;
  decimals: number;
  supplyBaseUnits: bigint;
  mintAuthority: string | null;
  freezeAuthority: string | null;
  transferFeeBasisPoints: number | null;
  maximumTransferFeeBaseUnits: bigint | null;
  transferFeeConfigAuthority: string | null;
  withdrawWithheldAuthority: string | null;
  observedSlot: number;
}

export interface PWRCCanonicalVerification {
  verified: boolean;
  errors: string[];
  snapshot: PWRCMintSnapshot;
}

export function resolveRpcUrl(cluster: PWRCCluster, rpcUrl?: string): string {
  return resolvePwrcRpc(cluster, rpcUrl);
}

export function assertSolanaSignature(signature: string): void {
  let decoded: Uint8Array;
  try { decoded = bs58.decode(signature); } catch { throw new Error("PWRC_INVALID_SIGNATURE_BASE58"); }
  if (decoded.length !== 64) throw new Error(`PWRC_INVALID_SIGNATURE_LENGTH:${decoded.length}`);
}

export function decodeSecretKey(value: string): Uint8Array {
  const input = value.trim();
  if (!input) throw new Error("PWRC_EMPTY_SECRET_KEY");
  if (input.startsWith("[")) {
    const parsed = JSON.parse(input) as unknown;
    if (!Array.isArray(parsed) || parsed.some((v) => !Number.isInteger(v) || (v as number) < 0 || (v as number) > 255)) {
      throw new Error("PWRC_INVALID_JSON_SECRET_KEY");
    }
    return Uint8Array.from(parsed as number[]);
  }
  return bs58.decode(input);
}

export function loadKeypairFile(filePath: string): Keypair {
  const bytes = decodeSecretKey(fs.readFileSync(filePath, "utf8"));
  if (bytes.length !== 64) throw new Error(`PWRC_INVALID_SECRET_KEY_LENGTH:${bytes.length}`);
  return Keypair.fromSecretKey(bytes);
}

export function walletFromKeypair(keypair: Keypair): anchor.Wallet {
  return new anchor.Wallet(keypair);
}

export class PWRCClient {
  readonly cluster: PWRCCluster;
  readonly rpcUrl: string;
  readonly connection: Connection;
  readonly provider: anchor.AnchorProvider | null;
  readonly http: AxiosInstance;
  private requestId = 0;

  constructor(options: PWRCClientOptions) {
    this.cluster = options.cluster;
    this.rpcUrl = resolveRpcUrl(options.cluster, options.rpcUrl);
    const commitment = options.commitment ?? "finalized";
    this.connection = new Connection(this.rpcUrl, commitment);
    this.provider = options.wallet
      ? new anchor.AnchorProvider(this.connection, options.wallet, {
          commitment,
          preflightCommitment: "confirmed",
        })
      : null;
    this.http = axios.create({
      baseURL: this.rpcUrl,
      timeout: options.timeoutMs ?? 10_000,
      headers: { "content-type": "application/json" },
      validateStatus: (status) => status >= 200 && status < 300,
    });
  }

  static fromKeypair(options: Omit<PWRCClientOptions, "wallet"> & { keypair: Keypair }): PWRCClient {
    return new PWRCClient({ ...options, wallet: walletFromKeypair(options.keypair) });
  }

  static fromKeypairFile(options: Omit<PWRCClientOptions, "wallet"> & { keypairFile: string }): PWRCClient {
    return PWRCClient.fromKeypair({ ...options, keypair: loadKeypairFile(options.keypairFile) });
  }

  async rpcRead<T>(method: string, params: unknown[] = []): Promise<T> {
    const id = ++this.requestId;
    const response = await this.http.post<PWRCRpcResponse<T>>("", { jsonrpc: "2.0", id, method, params });
    if (response.data.error) {
      const { code, message } = response.data.error;
      throw new Error(`PWRC_RPC_ERROR:${method}:${code}:${message}`);
    }
    if (!("result" in response.data)) throw new Error(`PWRC_RPC_MISSING_RESULT:${method}`);
    return response.data.result as T;
  }

  async getHealth(): Promise<"ok"> { return this.rpcRead<"ok">("getHealth"); }

  async getMintSnapshot(mintAddress: string): Promise<PWRCMintSnapshot> {
    const mint = new PublicKey(mintAddress);
    const [mintState, slot] = await Promise.all([
      getMint(this.connection, mint, "finalized", TOKEN_2022_PROGRAM_ID),
      this.connection.getSlot("finalized"),
    ]);
    const fee = getTransferFeeConfig(mintState);
    const activeFee = fee?.newerTransferFee ?? null;
    return {
      mint: mint.toBase58(),
      cluster: this.cluster,
      ownerProgram: TOKEN_2022_PROGRAM_ID.toBase58(),
      decimals: mintState.decimals,
      supplyBaseUnits: mintState.supply,
      mintAuthority: mintState.mintAuthority?.toBase58() ?? null,
      freezeAuthority: mintState.freezeAuthority?.toBase58() ?? null,
      transferFeeBasisPoints: activeFee?.transferFeeBasisPoints ?? null,
      maximumTransferFeeBaseUnits: activeFee?.maximumFee ?? null,
      transferFeeConfigAuthority: fee?.transferFeeConfigAuthority?.toBase58() ?? null,
      withdrawWithheldAuthority: fee?.withdrawWithheldAuthority?.toBase58() ?? null,
      observedSlot: slot,
    };
  }

  async verifyCanonicalMint(
    mintAddress: string = PWRC_CANONICAL_MINT,
    options: { requireFinalized?: boolean; requireCanonicalAddress?: boolean } = {},
  ): Promise<PWRCCanonicalVerification> {
    const snapshot = await this.getMintSnapshot(mintAddress);
    const errors: string[] = [];
    if ((options.requireCanonicalAddress ?? true) && snapshot.mint !== PWRC_CANONICAL_MINT) errors.push("CANONICAL_MINT_MISMATCH");
    if (snapshot.decimals !== PWRC_DECIMALS) errors.push("DECIMALS_MISMATCH");
    if (snapshot.supplyBaseUnits > PWRC_MAX_BASE_UNITS) errors.push("SUPPLY_EXCEEDS_MAX");
    if (snapshot.freezeAuthority !== null) errors.push("FREEZE_AUTHORITY_ACTIVE");
    if (options.requireFinalized && snapshot.mintAuthority !== null) errors.push("MINT_AUTHORITY_ACTIVE");
    if (snapshot.transferFeeBasisPoints !== PWRC_TRANSFER_FEE_BPS_NUMBER) errors.push("TRANSFER_FEE_BPS_MISMATCH");
    if (snapshot.maximumTransferFeeBaseUnits !== PWRC_MAX_TRANSFER_FEE_BASE_UNITS) errors.push("TRANSFER_FEE_CAP_MISMATCH");
    return { verified: errors.length === 0, errors, snapshot };
  }

  async getFinalizedTransaction(signature: string) {
    assertSolanaSignature(signature);
    const tx = await this.connection.getTransaction(signature, {
      commitment: "finalized" as Finality,
      maxSupportedTransactionVersion: 0,
    });
    if (!tx) throw new Error(`PWRC_TRANSACTION_NOT_FOUND:${signature}`);
    if (tx.meta?.err) throw new Error(`PWRC_TRANSACTION_FAILED:${signature}`);
    return tx;
  }
}
