"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  Menu,
  X,
  ChevronDown,
  LogOut,
  User,
  LayoutDashboard,
  Zap,
} from "lucide-react";
import WalletModal from "./WalletModal";
import { useHederaWallet } from "@/hooks/useHederaWallet";
import { Wallet } from "lucide-react";

const NAV_LINKS = [{ href: "/explore", label: "Explore" }];

const ROLE_DASHBOARD = {
  funder: "/funder/dashboard",
  recipient: "/recipient/dashboard",
  verifier: "/verifier/dashboard",
  public: "/explore",
};

export default function Navigation() {
  const {
    account,
    connect,
    isConnected,
    disconnect,
    loading,
    balance,
    updateAccountInfo,
  } = useHederaWallet();

  const {
    isConnected: isDummyCOnnect,
    walletAddress,
    userRole,
    disconnectWallet,
    setShowWalletModal,
    showWalletModal,
  } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [walletDropdown, setWalletDropdown] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const dashboardHref = userRole
    ? ROLE_DASHBOARD[userRole]
    : "/onboarding/role";

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                <Zap size={16} className="text-white" />
              </div>
              <span className="font-bold text-slate-900 text-lg tracking-tight">
                GrantFlow
              </span>
            </Link>

            {/* <button onClick={() => updateAccountInfo("Janet My love love")}>
              Update
            </button> */}

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${pathname === link.href ? "text-blue-600" : "text-slate-600 hover:text-slate-900"}`}
                >
                  {link.label}
                </Link>
              ))}
              {isConnected && (
                <Link
                  href={dashboardHref}
                  className={`text-sm font-medium transition-colors ${pathname.includes("dashboard") ? "text-blue-600" : "text-slate-600 hover:text-slate-900"}`}
                >
                  Dashboard
                </Link>
              )}

              {isConnected && (
                <Link
                  href="/funder/grants/create"
                  className={`text-sm font-medium transition-colors ${pathname === "/funder/grants/create" ? "text-blue-600" : "text-slate-600 hover:text-slate-900"}`}
                >
                  Create Grant
                </Link>
              )}
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {isConnected ? (
                <div className="relative">
                  <button
                    onClick={() => setWalletDropdown(!walletDropdown)}
                    className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    {/* <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {account}
                    </div> */}
                    <span className="font-mono">{account}</span>
                    <ChevronDown size={14} />
                  </button>
                  {walletDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50">
                      <div className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                        <Wallet size={14} /> Balance: {balance.toFixed(0)} HBAR
                      </div>
                      <Link
                        href="/onboarding/role"
                        onClick={() => setWalletDropdown(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <User size={14} /> Profile
                      </Link>
                      <Link
                        href={dashboardHref}
                        onClick={() => setWalletDropdown(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <LayoutDashboard size={14} /> Dashboard
                      </Link>
                      <hr className="my-1 border-slate-100" />
                      <button
                        onClick={() => {
                          disconnect();
                          setWalletDropdown(false);
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 w-full text-left"
                      >
                        <LogOut size={14} /> Disconnect
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => connect()}
                  className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
                >
                  Connect Wallet
                </button>
              )}
              {/* Mobile hamburger */}
              <button
                className="md:hidden p-2 rounded-lg hover:bg-slate-100"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white">
            <div className="px-4 py-3 space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block py-2 text-sm font-medium text-slate-700 hover:text-slate-900"
                >
                  {link.label}
                </Link>
              ))}
              {isConnected && (
                <Link
                  href={dashboardHref}
                  onClick={() => setMobileOpen(false)}
                  className="block py-2 text-sm font-medium text-slate-700 hover:text-slate-900"
                >
                  Dashboard
                </Link>
              )}
              {isConnected && userRole === "funder" && (
                <Link
                  href="/funder/grants/create"
                  onClick={() => setMobileOpen(false)}
                  className="block py-2 text-sm font-medium text-slate-700 hover:text-slate-900"
                >
                  Create Grant
                </Link>
              )}
              {!isConnected && (
                <button
                  onClick={() => {
                    connect();
                    setMobileOpen(false);
                  }}
                  className="w-full mt-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {showWalletModal && <WalletModal />}
    </>
  );
}
