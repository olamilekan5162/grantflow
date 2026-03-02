"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { ArrowRight } from "lucide-react";

const ROLES = [
  {
    id: "funder",
    emoji: "📢",
    title: "I FUND projects",
    subtitle: "Government, Foundation, DAO",
    desc: "Create grants, manage milestones, and track impact.",
  },
  {
    id: "recipient",
    emoji: "🎨",
    title: "I APPLY for funding",
    subtitle: "Nonprofit, Artist, Researcher",
    desc: "Find grants, submit work, and get paid instantly.",
  },
  {
    id: "verifier",
    emoji: "✅",
    title: "I VERIFY work",
    subtitle: "Inspector, Expert, Community",
    desc: "Review milestone submissions and unlock payments.",
  },
  {
    id: "public",
    emoji: "👀",
    title: "I'm just BROWSING",
    subtitle: "Citizen, Journalist, Donor",
    desc: "Explore all grants and track public spending.",
  },
];

export default function RoleSelectionPage() {
  const [selected, setSelected] = useState(null);
  const { setUserRole } = useApp();
  const router = useRouter();

  const handleContinue = () => {
    if (!selected) return;
    setUserRole(selected);
    const paths = {
      funder: "/onboarding/funder",
      recipient: "/onboarding/recipient",
      verifier: "/onboarding/verifier",
      public: "/onboarding/public",
    };
    router.push(paths[selected]);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-3">
          How will you use GrantFlow?
        </h1>
        <p className="text-slate-500">
          Choose your role to get a personalized experience.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        {ROLES.map((role) => (
          <button
            key={role.id}
            onClick={() => setSelected(role.id)}
            className={`p-6 rounded-xl border-2 text-left transition-all hover:shadow-md ${
              selected === role.id
                ? "border-blue-500 bg-blue-50 shadow-md"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <div className="text-3xl mb-3">{role.emoji}</div>
            <div className="font-bold text-slate-900 mb-1">{role.title}</div>
            <div className="text-xs text-blue-600 font-medium mb-2">
              {role.subtitle}
            </div>
            <p className="text-sm text-slate-500">{role.desc}</p>
          </button>
        ))}
      </div>

      <button
        onClick={handleContinue}
        disabled={!selected}
        className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-base font-semibold transition-all ${
          selected
            ? "bg-slate-900 text-white hover:bg-slate-800 cursor-pointer"
            : "bg-slate-200 text-slate-400 cursor-not-allowed"
        }`}
      >
        Continue <ArrowRight size={18} />
      </button>
    </div>
  );
}
