"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Camera, Shield, FileCheck } from "lucide-react";

export default function FunderProfilePage() {
  const { setUserProfile, setOnboardingComplete } = useApp();
  const router = useRouter();
  const [form, setForm] = useState({
    orgName: "",
    orgType: "",
    website: "",
    taxId: "",
    bio: "",
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = () => {
    setUserProfile({ ...form, role: "funder" });
    setOnboardingComplete(true);
    router.push("/onboarding/success");
  };

  const inputCls =
    "w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all";
  const labelCls = "block text-sm font-medium text-slate-700 mb-1.5";

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
          <span className="bg-blue-500 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold">
            2
          </span>
          <span>Funder Profile</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Tell us about your organization
        </h1>
        <p className="text-slate-500 text-sm">
          This info will be shown on your grants.
        </p>
      </div>

      <div className="space-y-5">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center border-2 border-dashed border-slate-300 cursor-pointer hover:bg-slate-200 transition-colors">
            <Camera size={20} className="text-slate-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">
              Organization Logo
            </p>
            <p className="text-xs text-slate-500">
              Click to upload (PNG, JPG, max 2MB)
            </p>
          </div>
        </div>

        <div>
          <label className={labelCls}>
            Organization Name <span className="text-red-500">*</span>
          </label>
          <input
            className={inputCls}
            placeholder="e.g., City of Austin Arts Department"
            value={form.orgName}
            onChange={set("orgName")}
          />
        </div>

        <div>
          <label className={labelCls}>
            Organization Type <span className="text-red-500">*</span>
          </label>
          <select
            className={inputCls}
            value={form.orgType}
            onChange={set("orgType")}
          >
            <option value="">Select type...</option>
            <option>Government Agency</option>
            <option>Foundation</option>
            <option>Corporation</option>
            <option>DAO</option>
            <option>Other</option>
          </select>
        </div>

        <div>
          <label className={labelCls}>Website</label>
          <input
            className={inputCls}
            placeholder="https://"
            value={form.website}
            onChange={set("website")}
          />
        </div>

        <div>
          <label className={labelCls}>Tax ID / EIN</label>
          <input
            className={inputCls}
            placeholder="XX-XXXXXXX (optional)"
            value={form.taxId}
            onChange={set("taxId")}
          />
        </div>

        <div>
          <label className={labelCls}>Bio / Description</label>
          <textarea
            className={`${inputCls} h-28 resize-none`}
            placeholder="Describe your organization's mission..."
            value={form.bio}
            onChange={set("bio")}
          />
        </div>

        {/* Verification */}
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
            <Shield size={16} className="text-blue-500" /> Optional Verification
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Verified accounts appear with a badge on all grants.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="flex items-center gap-2 border border-slate-300 bg-white text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
              <FileCheck size={14} /> Verify with Gov't Email
            </button>
            <button className="flex items-center gap-2 border border-slate-300 bg-white text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
              <Shield size={14} /> Verify with Document
            </button>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => router.push("/onboarding/success")}
            className="border border-slate-300 bg-white text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Skip for Now
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
}
