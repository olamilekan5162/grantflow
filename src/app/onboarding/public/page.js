"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

const INTERESTS = [
  "Arts funding",
  "Environmental grants",
  "City budget",
  "Research",
  "Education",
  "Housing",
];
const NOTIF_PREFS = [
  "New grants",
  "Milestone completions",
  "Reports published",
  "Grant deadlines",
];

export default function PublicProfilePage() {
  const { setUserProfile, setOnboardingComplete } = useApp();
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [interests, setInterests] = useState([]);
  const [notifPrefs, setNotifPrefs] = useState([]);

  const toggle = (arr, setArr, val) =>
    setArr((prev) =>
      prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val],
    );

  const handleSave = () => {
    setUserProfile({ displayName, interests, notifPrefs, role: "public" });
    setOnboardingComplete(true);
    router.push("/onboarding/success");
  };

  const inputCls =
    "w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all";

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
          <span className="bg-blue-500 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold">
            2
          </span>
          <span>Browser Profile</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Customize your experience
        </h1>
        <p className="text-slate-500 text-sm">
          Everything here is optional. You can browse without an account.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Display Name (optional)
          </label>
          <input
            className={inputCls}
            placeholder="How should we call you?"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Interests
          </label>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => toggle(interests, setInterests, item)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  interests.includes(item)
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-slate-700 border-slate-200 hover:border-blue-300"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Notification Preferences
          </label>
          <div className="space-y-2">
            {NOTIF_PREFS.map((pref) => (
              <label
                key={pref}
                className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={notifPrefs.includes(pref)}
                  onChange={() => toggle(notifPrefs, setNotifPrefs, pref)}
                  className="w-4 h-4 accent-blue-500"
                />
                <span className="text-sm text-slate-700">{pref}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => router.push("/explore")}
            className="border border-slate-300 bg-white text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
