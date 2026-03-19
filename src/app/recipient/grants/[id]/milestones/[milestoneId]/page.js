"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { submitMilestoneProof } from "@/utils/submissionHelpers";
import { getGrantDetails, getMyApplications } from "@/utils/recipientHelpers";
import { uploadFile } from "@/lib/utils";
import FileUpload from "@/components/FileUpload";
import { ArrowLeft, Info, CheckCircle, Loader2 } from "lucide-react";

export default function SubmitMilestoneProofPage() {
  const { id, milestoneId } = useParams();
  const router = useRouter();
  const { account } = useApp();

  const [grant, setGrant] = useState(null);
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  const [notes, setNotes] = useState("");
  const [workDesc, setWorkDesc] = useState("");
  const [files, setFiles] = useState([]);
  const [confirmed, setConfirmed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    async function loadData() {
      if (!account) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const [grantData, myApps] = await Promise.all([
          getGrantDetails(id),
          getMyApplications(account),
        ]);

        if (grantData) setGrant(grantData);

        // Find the specific application for this grant
        const app = myApps.find((a) => a.grantId === id);
        if (app) setApplication(app);
      } catch (err) {
        console.error("Failed to load milestone data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, account]);

  const handleSubmit = async () => {
    if (!application) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      let uploadedDocs = [];
      let uploadedImages = [];
      if (files.length > 0) {
        for (const file of files) {
          try {
            const cid = await uploadFile(file);
            const isImage = file.type.startsWith("image/");
            if (isImage) {
              uploadedImages.push({ name: file.name, cid });
            } else {
              uploadedDocs.push({ name: file.name, cid });
            }
          } catch (e) {
            console.error("Failed to upload file", file.name, e);
          }
        }
      }

      await submitMilestoneProof(
        account,
        id,
        application.proposalId,
        Number(milestoneId),
        {
          workDesc,
          notes,
          images: uploadedImages,
          documents: uploadedDocs,
          timestamp: Date.now(),
        }
      );
      setSubmitted(true);
      setTimeout(() => router.push("/recipient/dashboard"), 2000);
    } catch (err) {
      console.error("Proof submission failed:", err);
      setSubmitError(
        err.message || "Failed to submit proof. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    "w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all";

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 flex flex-col items-center gap-3">
        <Loader2 size={32} className="animate-spin text-blue-500" />
        <p className="text-slate-500">Loading milestone details...</p>
      </div>
    );
  }

  if (!grant || !application) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-500">Milestone or Application not found.</p>
        <button
          onClick={() => router.back()}
          className="text-blue-600 text-sm mt-2 hover:underline"
        >
          ← Go back
        </button>
      </div>
    );
  }

  const msIndex = Number(milestoneId);
  const ms = grant.milestones[msIndex] || {};

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
            <h3 className="font-semibold text-slate-900">
              {ms.name || `Milestone ${msIndex + 1}`}
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">{ms.description}</p>
          </div>
          <div className="text-right">
            <span className="text-xl font-bold text-emerald-600">
              {(ms.amount || 0).toLocaleString()} HBAR
            </span>
            <p className="text-xs text-slate-400">
              {ms.percentage || 0}% of budget
            </p>
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
              onFiles={setFiles}
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
              {ms.verificationType === "approver"
                ? `This milestone requires verification by ${
                    ms.verifier ? "an assigned verifier" : "a verifier"
                  }. Funds will be released after approval.`
                : "This milestone is self-verified. Funds will be released after you submit this proof."}
            </p>
          </div>

          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{submitError}</p>
            </div>
          )}

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
            disabled={!confirmed || !workDesc.trim() || submitting}
            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-base font-semibold transition-colors disabled:opacity-60 ${
              confirmed && workDesc.trim()
                ? "bg-slate-900 text-white hover:bg-slate-800"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Submitting...
              </>
            ) : (
              "Submit Proof"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
