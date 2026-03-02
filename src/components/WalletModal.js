"use client";

import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { X, Shield } from "lucide-react";

const WALLETS = [
  {
    id: "HashPack",
    label: "HashPack",
    icon: "🟣",
    desc: "Official Hedera wallet",
  },
  { id: "Blade", label: "Blade", icon: "⚔️", desc: "Multi-chain wallet" },
  {
    id: "WalletConnect",
    label: "WalletConnect",
    icon: "🔗",
    desc: "Connect any wallet",
  },
  {
    id: "Email",
    label: "Continue with Email",
    icon: "✉️",
    desc: "Use your email address",
  },
];

export default function WalletModal() {
  const { setShowWalletModal, connectWallet } = useApp();
  const router = useRouter();

  const handleConnect = (walletId) => {
    connectWallet(walletId);
    router.push("/onboarding/role");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => setShowWalletModal(false)}
      />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Connect Wallet</h2>
            <p className="text-sm text-slate-500 mt-1">
              Choose your preferred wallet
            </p>
          </div>
          <button
            onClick={() => setShowWalletModal(false)}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <div className="space-y-3">
          {WALLETS.map((wallet) => (
            <button
              key={wallet.id}
              onClick={() => handleConnect(wallet.id)}
              className="w-full flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
            >
              <span className="text-2xl">{wallet.icon}</span>
              <div>
                <div className="font-semibold text-slate-900 text-sm">
                  {wallet.label}
                </div>
                <div className="text-xs text-slate-500">{wallet.desc}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Shield size={12} />
            <span>
              By connecting, you agree to our{" "}
              <span className="text-blue-600 cursor-pointer hover:underline">
                Terms of Service
              </span>
            </span>
          </div>
          <button className="mt-2 text-xs text-blue-600 hover:underline">
            What's a wallet?
          </button>
        </div>
      </div>
    </div>
  );
}
