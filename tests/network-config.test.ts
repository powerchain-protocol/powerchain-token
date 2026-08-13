import test from "node:test";
import assert from "node:assert/strict";
import networks from "../config/sui/networks.json" with { type: "json" };
import token from "../config/token.json" with { type: "json" };
import transactions from "../config/transactions.json" with { type: "json" };


test("Sui network endpoints remain explicitly configured", () => {
  assert.equal(
    networks.networks.testnet.rpcUrl,
    "https://fullnode.testnet.sui.io:443",
  );
  assert.equal(
    networks.networks.mainnet.rpcUrl,
    "https://fullnode.mainnet.sui.io:443",
  );
  assert.equal(
    networks.networks.devnet.rpcUrl,
    "https://fullnode.devnet.sui.io:443",
  );
  assert.equal(
    networks.networks.local.rpcUrl,
    "http://127.0.0.1:9000",
  );
});


test("canonical transaction policy matches token fee policy", () => {
  assert.equal(token.decimals, 9);
  assert.equal(token.transferFee.basisPoints, 250);
  assert.equal(
    transactions.fee.basisPoints,
    token.transferFee.basisPoints,
  );
  assert.equal(
    transactions.fee.maximumFeeBaseUnits,
    token.transferFee.maximumFeeBaseUnits,
  );
  assert.equal(
    transactions.policy.blindWriteRetries,
    false,
  );
});
