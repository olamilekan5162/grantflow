"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Upload, Info } from "lucide-react";
import { mockGrants } from "@/lib/mockData";

const FUNDERS = [...new Set(mockGrants.map((g) => g.funder))];

export default function VerifierProfilePage() {
  const { setUserProfile, setOnboardingComplete } = useApp();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    expertise: "",
    affiliation: "",
    qualifications: "",
    license: "",
  });
  const [selectedFunders, setSelectedFunders] = useState([]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const toggleFunder = (f) =>
    setSelectedFunders((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f],
    );

  const handleSubmit = () => {
    setUserProfile({ ...form, funders: selectedFunders, role: "verifier" });
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
          <span>Verifier Profile</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Verifier Application
        </h1>
        <p className="text-slate-500 text-sm">
          Verifiers need approval before they can review milestones.
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <label className={labelCls}>
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            className={inputCls}
            placeholder="Your legal name"
            value={form.name}
            onChange={set("name")}
          />
        </div>

        <div>
          <label className={labelCls}>
            Area of Expertise <span className="text-red-500">*</span>
          </label>
          <select
            className={inputCls}
            value={form.expertise}
            onChange={set("expertise")}
          >
            <option value="">Select expertise...</option>
            <option>Architecture</option>
            <option>Construction</option>
            <option>Arts</option>
            <option>Education</option>
            <option>Environment</option>
            <option>Finance</option>
            <option>Legal</option>
          </select>
        </div>

        <div>
          <label className={labelCls}>Affiliation</label>
          <input
            className={inputCls}
            placeholder="e.g., Austin Public Works"
            value={form.affiliation}
            onChange={set("affiliation")}
          />
        </div>

        <div>
          <label className={labelCls}>
            Qualifications <span className="text-red-500">*</span>
          </label>
          <textarea
            className={`${inputCls} h-28 resize-none`}
            placeholder="How are you qualified to verify this type of work?"
            value={form.qualifications}
            onChange={set("qualifications")}
          />
        </div>

        <div>
          <label className={labelCls}>License / Certification #</label>
          <input
            className={inputCls}
            placeholder="Optional"
            value={form.license}
            onChange={set("license")}
          />
        </div>

        {/* Verification uploads */}
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-1">
            Identity Verification <span className="text-red-500">*</span>
          </h3>
          <div className="flex items-start gap-2 mb-4">
            <Info size={14} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-500">
              Verifiers need approval before they can verify milestones. Your
              documents will be reviewed within 2-3 business days.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="flex items-center gap-2 border border-slate-300 bg-white text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
              <Upload size={14} /> Upload License/ID
            </button>
            <button className="flex items-center gap-2 border border-slate-300 bg-white text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
              <Upload size={14} /> Background Check
            </button>
          </div>
        </div>

        {/* Organizations */}
        <div>
          <label className={labelCls}>Organizations I work with</label>
          <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-3">
            {FUNDERS.map((f) => (
              <label
                key={f}
                className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-1 rounded"
              >
                <input
                  type="checkbox"
                  checked={selectedFunders.includes(f)}
                  onChange={() => toggleFunder(f)}
                  className="w-4 h-4 accent-blue-500"
                />
                <span className="text-sm text-slate-700">{f}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => router.push("/onboarding/success")}
            className="border border-slate-300 bg-white text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Save Draft
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            Submit for Review
          </button>
        </div>
      </div>
    </div>
  );
}
