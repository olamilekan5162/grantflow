"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  ChevronDown,
  LogOut,
  User,
  LayoutDashboard,
  Zap,
  Wallet,
  Loader2,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

const NAV_LINKS = [{ href: "/explore", label: "Explore" }];

const ROLE_DASHBOARD = {
  funder: "/funder/dashboard",
  recipient: "/recipient/dashboard",
  verifier: "/verifier/dashboard",
  public: "/explore",
};

/**
 * Parse the Hedera account memo into a profile object.
 * Returns null if memo is empty / not valid JSON.
 */
function parseMemo(memo) {
  if (!memo || memo.trim() === "") return null;
  try {
    const parsed = JSON.parse(memo);
    if (parsed && parsed.role) return parsed;
    return null;
  } catch {
    return null;
  }
}

export default function Navigation() {
  const { account, connect, isConnected, disconnect, loading, balance, memo } =
    useApp();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [walletDropdown, setWalletDropdown] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  // Derive role from memo
  const profile = parseMemo(memo);
  const userRole = profile?.role || null;
  const dashboardHref = userRole ? ROLE_DASHBOARD[userRole] : "/explore";

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

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? "text-blue-600"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {isConnected && (
                <Link
                  href={dashboardHref}
                  className={`text-sm font-medium transition-colors ${
                    pathname.includes("dashboard")
                      ? "text-blue-600"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Dashboard
                </Link>
              )}
              {isConnected && userRole === "funder" && (
                <Link
                  href="/funder/grants/create"
                  className={`text-sm font-medium transition-colors ${
                    pathname === "/funder/grants/create"
                      ? "text-blue-600"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
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
                    <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                    <span className="font-mono hidden sm:block">{account}</span>
                    <ChevronDown size={14} />
                  </button>

                  {walletDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50">
                      {/* Balance */}
                      <div className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-500 border-b border-slate-100">
                        <Wallet size={14} />
                        <span>
                          {typeof balance === "number"
                            ? balance.toFixed(2)
                            : "—"}{" "}
                          HBAR
                        </span>
                      </div>
                      {/* Role badge */}
                      {userRole && (
                        <div className="px-4 py-2 text-xs text-slate-400 border-b border-slate-100">
                          Role:{" "}
                          <span className="font-semibold text-slate-700 capitalize">
                            {userRole}
                          </span>
                        </div>
                      )}
                      <Link
                        href={dashboardHref}
                        onClick={() => setWalletDropdown(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <LayoutDashboard size={14} /> Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          // TODO Trigger global onboarding via context if needed manually
                          setWalletDropdown(false);
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 w-full text-left hidden"
                      >
                        <User size={14} /> Edit Profile
                      </button>
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
                  disabled={loading}
                  className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />{" "}
                      Connecting...
                    </>
                  ) : (
                    "Connect Wallet"
                  )}
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
                  disabled={loading}
                  className="w-full mt-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60"
                >
                  {loading ? "Connecting..." : "Connect Wallet"}
                </button>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
