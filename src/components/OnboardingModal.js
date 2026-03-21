"use client";

import { useState } from "react";
import { X, Loader2, CheckCircle } from "lucide-react";

const ROLES = [
  {
    id: "funder",
    label: "Grant Funder",
    subtitle: "Government, Foundation, DAO",
  },
  {
    id: "recipient",
    label: "Grant Recipient",
    subtitle: "Nonprofit, Artist, Researcher",
  },
];

const ORG_TYPES = [
  "Government Agency",
  "Foundation",
  "Corporation",
  "DAO",
  "Other",
];
const EXPERTISE = [
  "Architecture",
  "Construction",
  "Arts",
  "Education",
  "Environment",
  "Finance",
  "Legal",
];
const RECIPIENT_TYPES = [
  "Individual Artist",
  "Nonprofit",
  "Small Business",
  "Researcher",
  "Other",
];

const inputCls =
  "w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400";
const labelCls = "block text-sm font-medium text-slate-700 mb-1.5";

export default function OnboardingModal({
  onComplete,
  onClose,
  updateAccountInfo,
}) {
  const [role, setRole] = useState("");
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const setField = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const canSubmit = () => {
    if (!role) return false;
    if (role === "funder") return !!form.orgName;
    if (role === "recipient") return !!form.name;
    return true;
  };

  const handleSubmit = async () => {
    if (!canSubmit()) return;
    setSaving(true);
    setError("");
    try {
      const memoPayload = JSON.stringify({ role, ...form });
      await updateAccountInfo(memoPayload);
      setDone(true);
      setTimeout(() => onComplete(role), 1200);
    } catch (e) {
      console.error("Failed to save profile:", e);
      setError("Transaction failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={18} />
        </button>
        {/* Header */}
        <div className="bg-slate-900 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">
                Welcome to GrantFlow
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">
                Set up your profile — saved to your Hedera account
              </p>
            </div>
            {/* <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white text-sm font-bold">G</span>
            </div> */}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {done ? (
            <div className="flex flex-col items-center py-6 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle size={32} className="text-emerald-500" />
              </div>
              <p className="font-bold text-slate-900 text-lg">Profile saved!</p>
              <p className="text-sm text-slate-500 mt-1">
                Taking you to your dashboard...
              </p>
            </div>
          ) : (
            <>
              {/* Role selector */}
              <div>
                <label className={labelCls}>
                  Your Role <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLES.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        setRole(r.id);
                        setForm({});
                      }}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        role === r.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="text-base leading-none mb-1">
                        {r.label.split(" ")[0]}
                      </div>
                      <div className="text-xs font-semibold text-slate-900 leading-snug">
                        {r.label.split(" ").slice(1).join(" ")}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 leading-tight">
                        {r.subtitle}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Funder fields ── */}
              {role === "funder" && (
                <div className="space-y-4">
                  <div className="h-px bg-slate-100" />
                  <div>
                    <label className={labelCls}>
                      Organization Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      className={inputCls}
                      placeholder="e.g., City of Austin Arts Dept"
                      value={form.orgName || ""}
                      onChange={setField("orgName")}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Organization Type</label>
                    <select
                      className={inputCls}
                      value={form.orgType || ""}
                      onChange={setField("orgType")}
                    >
                      <option value="">Select type...</option>
                      {ORG_TYPES.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Website</label>
                    <input
                      className={inputCls}
                      placeholder="https://"
                      value={form.website || ""}
                      onChange={setField("website")}
                    />
                  </div>
                </div>
              )}

              {/* ── Recipient fields ── */}
              {role === "recipient" && (
                <div className="space-y-4">
                  <div className="h-px bg-slate-100" />
                  <div>
                    <label className={labelCls}>
                      Name / Organization{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      className={inputCls}
                      placeholder="Your name or org"
                      value={form.name || ""}
                      onChange={setField("name")}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Profile Type</label>
                    <select
                      className={inputCls}
                      value={form.recipientType || ""}
                      onChange={setField("recipientType")}
                    >
                      <option value="">Select type...</option>
                      {RECIPIENT_TYPES.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Location</label>
                    <input
                      className={inputCls}
                      placeholder="City, State"
                      value={form.location || ""}
                      onChange={setField("location")}
                    />
                  </div>
                </div>
              )}

              {error && (
                <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!done && (
          <div className="px-6 pb-6">
            <button
              onClick={handleSubmit}
              disabled={!canSubmit() || saving}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
                canSubmit() && !saving
                  ? "bg-slate-900 text-white hover:bg-slate-800 cursor-pointer"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Saving to
                  Hedera...
                </>
              ) : (
                "Save Profile & Continue"
              )}
            </button>
            <p className="text-xs text-center text-slate-400 mt-3">
              This signs a transaction to store your profile in your Hedera
              account memo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
