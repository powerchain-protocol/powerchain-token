console.log(`PowerChain 1.0.0 Mainnet launch plan:
1. Install dependencies and generate pnpm-lock.yaml.
2. Install Rust 1.97.1 / Anchor 1.0.2 / Agave 3.1.10.
3. Generate Cargo.lock.
4. Establish final pwrc_lock Mainnet program identity.
5. Verify the private keypair matching PWRCpWCp... for pwrc_token.
6. Build and test both Solana programs.
7. Build/publish wPWRC and preserve Move.lock + publish evidence.
8. Record independent finalized Solana/Sui observations.
9. Create config/mainnet/evidence.json.
10. Sign short-lived release authorization.
11. Run pnpm mainnet:status and require readyForMainnet=true.
`);
