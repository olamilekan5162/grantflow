import { useEffect, useState, useCallback } from "react";
import { initializeWalletConnect, getConnector } from "../lib/walletConnect";
import { AccountId, AccountUpdateTransaction } from "@hiero-ledger/sdk";

export const useHederaWallet = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [memo, setMemo] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      await initializeWalletConnect();
      const connector = getConnector();
      if (connector?.session) {
        const accounts = connector.session.namespaces?.hedera?.accounts || [];
        if (accounts.length > 0) {
          const accountId = accounts[0].split(":").pop();
          setAccount(accountId);
          setIsConnected(true);
          await getAccountInfo(accountId);
        }
      }
    };
    init();
  }, []);

  const connect = async () => {
    setLoading(true);
    try {
      const connector = getConnector();
      if (!connector) throw new Error("Connector not initialized");

      const session = await connector.openModal();

      if (session?.namespaces?.hedera?.accounts?.length > 0) {
        const accounts = session.namespaces?.hedera?.accounts[0];
        const accountId = accounts.split(":").pop();
        setAccount(accountId);
        setIsConnected(true);
        await getAccountInfo(accountId);
      }
    } catch (error) {
      console.error("Connection failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const disconnect = async () => {
    const connector = getConnector();
    if (connector) {
      await connector.disconnect();
      setIsConnected(false);
      setAccount(null);
      setBalance(null);
      setMemo(null);
    }
  };

  const updateAccountInfo = async (memo) => {
    try {
      const connector = getConnector();
      const signer = connector.getSigner(AccountId.fromString(account));

      const transaction = await new AccountUpdateTransaction()
        .setAccountId(account)
        .setAccountMemo(memo)
        .executeWithSigner(signer);

      const transactionId = await transaction.transactionId.toString();
      console.log("transactionId", transactionId);

      await getAccountInfo(account);

      return transactionId;
    } catch (e) {
      console.log("error", e);
      throw e;
    }
  };

  const getAccountInfo = useCallback(
    async (accountId = account) => {
      if (!accountId) return null;

      try {
        const url = `https://testnet.mirrornode.hedera.com/api/v1/accounts/${accountId}?limit=25&order=desc&transactions=true`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Account data:", data);

        if (data.balance) {
          const tinybarBalance = data.balance.balance;
          const hbarBalance = tinybarBalance / 100000000;
          setBalance(hbarBalance);
        }

        const accountMemo = data.memo || null;
        setMemo(accountMemo);

        return {
          balance: data.balance ? data.balance.balance / 100000000 : null,
          memo: data.memo || null,
        };
      } catch (error) {
        console.error("Failed to fetch balance:", error);
        return null;
      }
    },
    [account],
  );

  const refreshAccountInfo = useCallback(async () => {
    if (account) {
      return await getAccountInfo();
    }
  }, [account, getAccountInfo]);

  return {
    connect,
    disconnect,
    isConnected,
    account,
    balance,
    memo,
    loading,
    getAccountInfo,
    refreshAccountInfo,
    updateAccountInfo,
  };
};
