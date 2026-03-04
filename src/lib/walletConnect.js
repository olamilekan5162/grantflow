import {
  HederaSessionEvent,
  HederaJsonRpcMethod,
  DAppConnector,
  HederaChainId,
} from "@hashgraph/hedera-wallet-connect";
import { LedgerId } from "@hiero-ledger/sdk";

const metadata = {
  name: "Grantflow",
  description: "Hedera Integration with WalletConnect",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  icons: ["https:kuduz.com/logo.png"],
};

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";

let dAppConnector = null;

export const initializeWalletConnect = async () => {
  if (!dAppConnector) {
    dAppConnector = new DAppConnector(
      metadata,
      LedgerId.TESTNET,
      projectId,
      Object.values(HederaJsonRpcMethod),
      [HederaSessionEvent.ChainChanged, HederaSessionEvent.AccountsChanged],
      [HederaChainId.Mainnet, HederaChainId.Testnet],
    );

    await dAppConnector.init({ logger: "error" });
  }
  return dAppConnector;
};

export const getConnector = () => dAppConnector;
