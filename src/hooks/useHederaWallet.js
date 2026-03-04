import { useEffect, useState, useCallback } from "react";
import { initializeWalletConnect, getConnector } from "../lib/walletConnect";

export const useHederaWallet = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      await initializeWalletConnect();
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
        await getBalance(accountId);
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
    }
  };

  const getBalance = async (account) => {
    if (!account) return null;

    try {
      const url = `https://testnet.mirrornode.hedera.com/api/v1/balances?account.id=${account}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Balance data:", data);

      if (data.balances && data.balances.length > 0) {
        const tinybarBalance = data.balances[0].balance;
        const hbarBalance = tinybarBalance / 100000000;
        setBalance(hbarBalance);
        return hbarBalance;
      }
      return 0;
    } catch (error) {
      console.error("Failed to fetch balance:", error);
      return null;
    }
  };

  const refreshBalance = useCallback(async () => {
    if (account) {
      return await getBalance();
    }
  }, [account, getBalance]);

  return {
    connect,
    disconnect,
    isConnected,
    account,
    balance,
    loading,
    getBalance,
    refreshBalance,
  };
};
