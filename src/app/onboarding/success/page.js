"use client";

import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { CheckCircle, ArrowRight } from "lucide-react";

const ROLE_CONFIG = {
  funder: {
    emoji: "📢",
    label: "Grant Funder",
    dashLink: "/funder/dashboard",
    dashLabel: "Go to Funder Dashboard",
  },
  recipient: {
    emoji: "🎨",
    label: "Grant Recipient",
    dashLink: "/recipient/dashboard",
    dashLabel: "Go to Recipient Dashboard",
  },
  verifier: {
    emoji: "✅",
    label: "Verifier (Pending Approval)",
    dashLink: "/verifier/dashboard",
    dashLabel: "Go to Verifier Dashboard",
  },
  public: {
    emoji: "👀",
    label: "Public Browser",
    dashLink: "/explore",
    dashLabel: "Start Exploring",
  },
};

export default function OnboardingSuccessPage() {
  const { userRole, userProfile } = useApp();
  const config = ROLE_CONFIG[userRole] || ROLE_CONFIG.public;

  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle size={36} className="text-emerald-500" />
      </div>
      <h1 className="text-3xl font-bold text-slate-900 mb-3">
        Your profile is complete!
      </h1>
      <p className="text-slate-500 mb-8">
        You're set up as a{" "}
        <strong className="text-slate-900">
          {config.emoji} {config.label}
        </strong>
        {userProfile?.orgName && ` for ${userProfile.orgName}`}
        {userProfile?.name && ` — ${userProfile.name}`}.
      </p>

      {userRole === "verifier" && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 text-left">
          <p className="text-sm text-amber-800 font-medium">Pending Review</p>
          <p className="text-xs text-amber-700 mt-1">
            Your verifier application is under review. We'll email you within
            2-3 business days once approved.
          </p>
        </div>
      )}

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-8 text-left space-y-3">
        <h3 className="font-semibold text-slate-900 text-sm mb-4">
          Profile Summary
        </h3>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Role</span>
          <span className="font-medium text-slate-900">
            {config.emoji} {config.label}
          </span>
        </div>
        {userProfile?.orgName && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Organization</span>
            <span className="font-medium text-slate-900">
              {userProfile.orgName}
            </span>
          </div>
        )}
        {userProfile?.name && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Name</span>
            <span className="font-medium text-slate-900">
              {userProfile.name}
            </span>
          </div>
        )}
        {userProfile?.location && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Location</span>
            <span className="font-medium text-slate-900">
              {userProfile.location}
            </span>
          </div>
        )}
      </div>

      <Link
        href={config.dashLink}
        className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-3.5 rounded-xl text-base font-semibold hover:bg-slate-800 transition-colors"
      >
        {config.dashLabel} <ArrowRight size={18} />
      </Link>
    </div>
  );
}
