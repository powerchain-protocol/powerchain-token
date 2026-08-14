# Networks

**Version:** `1.0.0`

The canonical network map is `config/networks.json`.

## Solana Localnet

```text
RPC           http://127.0.0.1:8899
WebSocket     ws://127.0.0.1:8900
pwrc_lock     7JAV3PsxkHh5oKAFDMKqVpKaV2P2P5Vj3Qv15hH8wPwr
pwrc_token    PWRCpWCpQ8BRn3pzMnvaTzMK9Q2GsxuLx7QgJgduLSu
```

## Solana Devnet

The public Devnet RPC is suitable for development and qualification, but the
actual `pwrc_lock` Devnet program ID remains unset until a matching program
keypair is deployed and recorded.

```text
pwrc_token source/default identity
PWRCpWCpQ8BRn3pzMnvaTzMK9Q2GsxuLx7QgJgduLSu
```

A source ID does not prove a Devnet deployment.

## Solana Mainnet

Mainnet production requires:

- dedicated HTTPS primary RPC;
- independent secondary RPC;
- secure WebSocket when configured;
- explicit `pwrc_lock` and `pwrc_token` program IDs;
- matching program keypairs at deployment time;
- executable program-account verification;
- build/binary hashes;
- deployment transaction and finalized slot evidence.

No Localnet/Devnet bridge-lock ID falls through into Mainnet automatically.

## Sui

Configured alias:

```text
alias          powerchain
address        0x4a4a81c5e4a520c1b4d7b5b572a0567f48c6c7e85257f0a13e65639cfba49fb1
```

This is configuration/alias data. It is not treated as the published wPWRC
package ID.

Mainnet requires real publish evidence for:

```text
package ID
coin type
BridgeController object ID
metadata capability object ID
publish transaction
checkpoint
```
