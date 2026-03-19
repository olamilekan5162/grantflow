"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  getGrantDetails,
  getMyApplications,
  getNextMilestone,
} from "@/utils/recipientHelpers";
import { submitProposal } from "@/utils/submissionHelpers";
import { uploadFile } from "@/lib/utils";
import Link from "next/link";
import FileUpload from "@/components/FileUpload";
import { ArrowLeft, CheckCircle, Loader2, ArrowRight } from "lucide-react";

export default function GrantDetailsApplyPage() {
  const { id } = useParams();
  const router = useRouter();
  const { account } = useApp();

  const [grant, setGrant] = useState(null);
  const [myApp, setMyApp] = useState(null); // The user's application matching this grant
  const [nextMilestone, setNextMilestone] = useState(null);
  const [loading, setLoading] = useState(true);

  const [applying, setApplying] = useState(false);
  const [proposal, setProposal] = useState("");
  const [name, setName] = useState("");
  const [files, setFiles] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const grantData = await getGrantDetails(id);
        if (grantData) setGrant(grantData);

        if (account) {
          const apps = await getMyApplications(account);
          const app = apps.find((a) => a.grantId === id);
          if (app) {
            setMyApp(app);
            if (app.status === "approved" || app.status === "active") {
              const nextMs = getNextMilestone(app.milestones || []);
              setNextMilestone(nextMs);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load grant details/application:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, account]);

  const handleSubmit = async () => {
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

      await submitProposal(account, id, {
        name,
        proposal,
        images: uploadedImages,
        documents: uploadedDocs,
        grantId: id,
      });
      setSubmitted(true);
      setTimeout(() => router.push("/recipient/dashboard"), 2000);
    } catch (err) {
      console.error("Proposal submission failed:", err);
      setSubmitError(
        err.message || "Failed to submit application. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    "w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all";

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 flex flex-col items-center gap-3">
        <Loader2 size={32} className="animate-spin text-blue-500" />
        <p className="text-slate-500">Loading grant details...</p>
      </div>
    );
  }

  if (!grant) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-500">Grant not found.</p>
        <button
          onClick={() => router.back()}
          className="text-blue-600 text-sm mt-2 hover:underline"
        >
          ← Go back
        </button>
      </div>
    );
  }

  const budget = grant.totalBudget || grant.budget || 0;
  const milestones = grant.milestones || [];
  const requirements = grant.requirements || [];

  // Determine user state
  const hasApplied = !!myApp;
  const isApproved = myApp?.status === "approved" || myApp?.status === "active";
  const isPending = myApp?.status === "pending";
  const isRejected = myApp?.status === "rejected";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Grants
      </button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Grant details */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                {grant.category || "Grant"}
              </span>
              {grant.status === "completed" && (
                <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200 uppercase tracking-wide">
                  Completed
                </span>
              )}
              <span className="text-xs text-slate-400">
                {grant.currency || ""}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">
              {grant.title}
            </h1>
            <p className="text-slate-500">Funded by {grant.funder}</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-6">
            <h2 className="font-semibold text-slate-900 mb-3">
              About this Grant
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
              {grant.description}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-6">
            <h2 className="font-semibold text-slate-900 mb-4">Milestones</h2>
            <div className="space-y-3">
              {milestones.map((ms, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
                >
                  <div>
                    <span className="text-sm font-medium text-slate-900">
                      {i + 1}. {ms.name}
                    </span>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {ms.description}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-slate-900 ml-4">
                    {ms.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {requirements.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-6">
              <h2 className="font-semibold text-slate-900 mb-3">
                Requirements
              </h2>
              <ul className="space-y-2">
                {requirements.map((req) => (
                  <li
                    key={req}
                    className="flex items-center gap-2 text-sm text-slate-600"
                  >
                    <CheckCircle
                      size={14}
                      className="text-emerald-500 shrink-0"
                    />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Application Status / Action area */}
          {!hasApplied && !applying && !submitted && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-6 text-center">
              <h3 className="font-semibold text-slate-900 mb-2">
                {grant.status === "completed"
                  ? "Grant Completed"
                  : "Ready to apply?"}
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                {grant.status === "completed"
                  ? "This grant has successfully reached its recipient limit and all milestones have been completed."
                  : "Make sure you meet all the requirements before submitting your proposal."}
              </p>
              <button
                onClick={() => setApplying(true)}
                disabled={!account || grant.status === "completed"}
                className="w-full bg-slate-900 text-white px-6 py-3.5 rounded-xl text-base font-semibold hover:bg-slate-800 transition-colors disabled:opacity-60"
              >
                {!account
                  ? "Connect wallet to apply"
                  : grant.status === "completed"
                    ? "Grant Completed"
                    : "Start Application"}
              </button>
            </div>
          )}

          {hasApplied && (
            <div
              className={`border rounded-xl p-6 mb-6 ${
                isApproved
                  ? "bg-emerald-50 border-emerald-200"
                  : isRejected
                    ? "bg-red-50 border-red-200"
                    : "bg-amber-50 border-amber-200"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`mt-1 shrink-0 ${
                    isApproved
                      ? "text-emerald-500"
                      : isRejected
                        ? "text-red-500"
                        : "text-amber-500"
                  }`}
                >
                  <CheckCircle size={24} />
                </div>
                <div className="flex-1">
                  <h3
                    className={`font-semibold text-lg mb-1 ${
                      isApproved
                        ? "text-emerald-800"
                        : isRejected
                          ? "text-red-800"
                          : "text-amber-800"
                    }`}
                  >
                    {isApproved
                      ? "Application Approved!"
                      : isRejected
                        ? "Application Rejected"
                        : "Application Under Review"}
                  </h3>
                  <p
                    className={`text-sm mb-4 ${
                      isApproved
                        ? "text-emerald-600"
                        : isRejected
                          ? "text-red-600"
                          : "text-amber-600"
                    }`}
                  >
                    {isApproved
                      ? "Your funding request was successful. You can now begin work on your next milestone."
                      : isRejected
                        ? "Unfortunately, your application was not selected for this grant."
                        : "The funder is currently reviewing your proposal. You will be notified when a decision is made."}
                  </p>

                  {isApproved &&
                    nextMilestone &&
                    nextMilestone.status !== "pending_review" && (
                      <div className="bg-white rounded-lg p-4 border border-emerald-200 shadow-sm">
                        <p className="text-sm font-medium text-slate-900 mb-1">
                          Next Step: {nextMilestone.name}
                        </p>
                        <p className="text-xs text-slate-500 mb-3">
                          {nextMilestone.description}
                        </p>
                        <Link
                          href={`/recipient/grants/${id}/milestones/${nextMilestone.index}`}
                          className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition"
                        >
                          {nextMilestone.status === "revision_requested"
                            ? "Resubmit Proof"
                            : "Submit Milestone Proof"}{" "}
                          <ArrowRight size={16} />
                        </Link>
                      </div>
                    )}

                  {isApproved &&
                    nextMilestone &&
                    nextMilestone.status === "pending_review" && (
                      <div className="bg-amber-50 rounded-lg p-4 border border-amber-200 shadow-sm text-center">
                        <p className="text-sm font-medium text-amber-800 mb-1">
                          Milestone Pending Review: {nextMilestone.name}
                        </p>
                        <p className="text-xs text-amber-700">
                          The funder is currently reviewing your submission for
                          this milestone. You will be notified when it is
                          approved or if revisions are needed.
                        </p>
                      </div>
                    )}

                  {isApproved && !nextMilestone && (
                    <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200 shadow-sm text-center">
                      <p className="text-sm font-medium text-emerald-800">
                        All milestones completed!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Application Form */}
          {applying && !submitted && !hasApplied && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
              <h2 className="font-semibold text-slate-900">Your Application</h2>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Your Name / Organization{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  className={inputCls}
                  placeholder="e.g., Austin Mural Collective"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Project Proposal <span className="text-red-500">*</span>
                </label>
                <textarea
                  className={`${inputCls} h-40 resize-none`}
                  placeholder="Describe your project, its goals, and how it meets the grant requirements..."
                  value={proposal}
                  onChange={(e) => setProposal(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Supporting Documents (Optional)
                </label>
                <FileUpload
                  label="Upload photos, PDFs, or docs"
                  multiple
                  accept="image/*,.pdf"
                  onFiles={setFiles}
                />
              </div>
              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">{submitError}</p>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setApplying(false)}
                  className="border border-slate-300 bg-white text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !proposal.trim() || !name.trim()}
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />{" "}
                      Submitting...
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </button>
              </div>
            </div>
          )}

          {submitted && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
              <CheckCircle
                size={32}
                className="text-emerald-500 mx-auto mb-3"
              />
              <p className="font-semibold text-emerald-700">
                Application submitted!
              </p>
              <p className="text-sm text-emerald-600">
                Redirecting to dashboard...
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-4">Grant Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Total Budget</span>
                <span className="font-semibold">{budget.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Currency</span>
                <span className="font-semibold">{grant.currency || "—"}</span>
              </div>
              {grant.deadline && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Deadline</span>
                  <span className="font-semibold">
                    {new Date(grant.deadline).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Max Recipients</span>
                <span className="font-semibold">
                  {grant.maxRecipients || "Unlimited"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Milestones</span>
                <span className="font-semibold">{milestones.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <p className="text-sm text-blue-800 font-medium">
              💡 How Payment Works
            </p>
            <p className="text-xs text-blue-700 mt-2 leading-relaxed">
              Funds are released automatically when each milestone is verified.
              No waiting for bank transfers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
