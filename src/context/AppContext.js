"use client";

import { createContext, useContext, useState } from "react";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [walletBalance, setWalletBalance] = useState(250000);
  const [userRole, setUserRole] = useState(null); // 'funder' | 'recipient' | 'verifier' | 'public' | null
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  const connectWallet = (walletType) => {
    const addresses = {
      HashPack: "0x742...d3F1",
      Blade: "0x891...aB2C",
      WalletConnect: "0x3F4...e7D9",
      Email: "0x1A2...c4E5",
    };
    setWalletAddress(addresses[walletType] || "0x742...d3F1");
    setIsConnected(true);
    setShowWalletModal(false);
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress("");
    setUserRole(null);
    setOnboardingComplete(false);
  };

  return (
    <AppContext.Provider
      value={{
        isConnected,
        walletAddress,
        walletBalance,
        userRole,
        setUserRole,
        showWalletModal,
        setShowWalletModal,
        onboardingComplete,
        setOnboardingComplete,
        userProfile,
        setUserProfile,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
