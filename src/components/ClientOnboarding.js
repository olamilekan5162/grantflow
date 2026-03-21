"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import OnboardingModal from "./OnboardingModal";

const ROLE_DASHBOARD = {
  funder: "/funder/dashboard",
  recipient: "/recipient/dashboard",
  verifier: "/verifier/dashboard",
  public: "/explore",
};

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

export default function ClientOnboarding() {
  const { isConnected, account, memo, loading, updateAccountInfo } = useApp();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const checkedAccountRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (!isConnected || !account) return;
    // Already checked this account this session — don't re-trigger
    if (checkedAccountRef.current === account) return;
    // Still loading — wait for loading to finish before deciding
    if (loading) return;
    // Mark this account as checked
    checkedAccountRef.current = account;

    const parsed = parseMemo(memo);
    if (!parsed) {
      setShowOnboarding(true);
    } else {
      setShowOnboarding(false);
    }
  }, [isConnected, account, memo, loading]);

  const handleOnboardingComplete = (role) => {
    setShowOnboarding(false);
    router.push(ROLE_DASHBOARD[role] || "/explore");
  };

  if (!showOnboarding) return null;

  return (
    <OnboardingModal
      onClose={() => setShowOnboarding(false)}
      onComplete={handleOnboardingComplete}
      updateAccountInfo={updateAccountInfo}
    />
  );
}
