import {
  loadEnvironment,
  serviceFeeSourceDebitFor,
} from "../env/index.js";

const loaded =
  loadEnvironment({
    NODE_ENV:
      "development",
    PWRC_CLUSTER:
      "localnet",
    SUI_NETWORK:
      "devnet",
    PWRC_SERVICE_FEE_ENABLED:
      "false",
  } as NodeJS.ProcessEnv);

const solana =
  serviceFeeSourceDebitFor(
    loaded,
    "solana",
  );
const sui =
  serviceFeeSourceDebitFor(
    loaded,
    "sui",
  );

const solanaRecipient:
  string | null =
    solana.recipient;
const solanaAsset:
  "PWRC" =
    solana.asset;
const suiRecipient:
  string =
    sui.recipient;
const suiAsset:
  "wPWRC" =
    sui.asset;
const separateFromPrincipal:
  true =
    loaded.serviceFee
      .separateFromPrincipal;

void solanaRecipient;
void solanaAsset;
void suiRecipient;
void suiAsset;
void separateFromPrincipal;
