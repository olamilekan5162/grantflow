"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { mockGrants } from "@/lib/mockData";
import FileUpload from "@/components/FileUpload";
import { ArrowLeft, Info, CheckCircle } from "lucide-react";

export default function SubmitMilestoneProofPage() {
  const { id, milestoneId } = useParams();
  const router = useRouter();
  const grant = mockGrants.find((g) => g.id === id) || mockGrants[0];
  const ms =
    grant.milestones.find((m) => m.id === milestoneId) || grant.milestones[0];

  const [notes, setNotes] = useState("");
  const [workDesc, setWorkDesc] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => router.push("/recipient/dashboard"), 2000);
  };

  const inputCls =
    "w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all";

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">
          Submit Milestone Proof
        </h1>
        <p className="text-slate-500">{grant.title}</p>
      </div>

      {/* Milestone info card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">{ms.name}</h3>
            <p className="text-sm text-slate-500 mt-0.5">{ms.description}</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-emerald-600">
              ${ms.amount?.toLocaleString()}
            </span>
            <p className="text-xs text-slate-400">{ms.percentage}% of budget</p>
          </div>
        </div>
      </div>

      {submitted ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 text-center">
          <CheckCircle size={36} className="text-emerald-500 mx-auto mb-3" />
          <p className="font-semibold text-emerald-700 text-lg">
            Proof submitted!
          </p>
          <p className="text-sm text-emerald-600 mt-1">
            Your submission is under review. Redirecting...
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Description of Work Completed{" "}
              <span className="text-red-500">*</span>
            </label>
            <textarea
              className={`${inputCls} h-36 resize-none`}
              placeholder="Describe the work you completed for this milestone in detail..."
              value={workDesc}
              onChange={(e) => setWorkDesc(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Evidence / Proof
            </label>
            <FileUpload
              label="Upload photos, videos, or documents"
              multiple
              accept="image/*,video/*,.pdf"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Additional Notes
            </label>
            <textarea
              className={`${inputCls} h-24 resize-none`}
              placeholder="Any additional context or notes for the verifier..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Info note */}
          <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700">
              {ms.verificationNeeded
                ? `This milestone requires verification by ${ms.verifier ? "an assigned verifier" : "a verifier"}. Funds will be released after approval.`
                : "This milestone is self-verified. Funds will be released after you submit this proof."}
            </p>
          </div>

          {/* Confirmation */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="w-4 h-4 mt-0.5 accent-blue-500"
            />
            <span className="text-sm text-slate-700">
              I confirm that this work is complete and the information provided
              is accurate and truthful.
            </span>
          </label>

          <button
            onClick={handleSubmit}
            disabled={!confirmed || !workDesc.trim()}
            className={`w-full py-3.5 rounded-xl text-base font-semibold transition-colors ${
              confirmed && workDesc.trim()
                ? "bg-slate-900 text-white hover:bg-slate-800"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            Submit Proof
          </button>
        </div>
      )}
    </div>
  );
}
