"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { getMessages } from "@/utils/grantFlowHelpers";
import {
  approveMilestone,
  requestMilestoneRevision,
} from "@/utils/submissionHelpers";
import { getData } from "@/lib/utils";
import { ArrowLeft, CheckCircle, Plus, X, Loader2 } from "lucide-react";

const DEFAULT_CHECKLIST = [
  { label: "Location/details match grant requirements", checked: false },
  { label: "Matches approved design/plan", checked: false },
  { label: "Quality meets stated standards", checked: false },
  { label: "All required evidence provided", checked: false },
];

const DUMMY_IMAGES = [];

export default function ReviewMilestonePage() {
  const { submissionId } = useParams(); // format: proposalId_milestoneIndex

  const router = useRouter();
  const { account } = useApp();

  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState(null);

  const [checklist, setChecklist] = useState(DEFAULT_CHECKLIST);
  const [newItem, setNewItem] = useState("");
  const [comments, setComments] = useState("");
  const [decisionMade, setDecisionMade] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [revisionsNote, setRevisionsNote] = useState("");
  const [showRevisions, setShowRevisions] = useState(false);
  const [error, setError] = useState("");

  const parts = (submissionId || "").split("_");

  const [proposalId, msIndexStr] = [
    parts.slice(0, -1).join("_"),
    parts[parts.length - 1],
  ];
  const milestoneIndex = Number(msIndexStr);

  useEffect(() => {
    async function loadData() {
      if (!proposalId || isNaN(milestoneIndex)) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const messages = await getMessages();

        // Find the submission message
        const subMsg = messages.find(
          (m) =>
            m.type === "MILESTONE_SUBMITTED" &&
            m.proposalId === proposalId &&
            m.milestoneIndex === milestoneIndex,
        );

        if (!subMsg) {
          setLoading(false);
          return;
        }

        // Fetch proposal to get recipient and grantId
        const propMsg = messages.find(
          (m) => m.type === "PROPOSAL_SUBMITTED" && m.proposalId === proposalId,
        );
        const grantId = propMsg?.grantId || subMsg.grantId;

        // Fetch grant to get budget/names
        const grantMsg = messages.find(
          (m) => m.type === "GRANT_CREATED" && m.grantId === grantId,
        );
        const grantData = grantMsg ? await getData(grantMsg.ipfsHash) : {};

        const ms = grantData.milestones?.[milestoneIndex] || {};
        const proofData = subMsg.ipfsHash ? await getData(subMsg.ipfsHash) : {};

        setSubmission({
          proposalId,
          grantId,
          milestoneIndex,
          recipientId: propMsg?.recipient,
          recipientName: propMsg?.recipient || "Unknown Recipient",
          grantTitle: grantData.title || `Grant ${grantId}`,
          milestoneName: ms.name || `Milestone ${milestoneIndex + 1}`,
          amount: ms.amount || 0,
          submittedAt: subMsg.timestamp,
          notes: proofData.notes || proofData.workDesc || "No notes provided.",
          evidenceImages: proofData.images || [],
          evidenceDocuments: proofData.documents || [],
        });
      } catch (err) {
        console.error("Failed to load submission:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [proposalId, milestoneIndex]);

  const toggleCheck = (i) =>
    setChecklist((cl) =>
      cl.map((item, idx) =>
        idx === i ? { ...item, checked: !item.checked } : item,
      ),
    );

  const addItem = () => {
    if (newItem.trim()) {
      setChecklist((cl) => [...cl, { label: newItem.trim(), checked: false }]);
      setNewItem("");
    }
  };

  const removeItem = (i) =>
    setChecklist((cl) => cl.filter((_, idx) => idx !== i));

  const handleDecision = async (decision) => {
    setSubmitting(true);
    setError("");
    try {
      if (decision === "approved") {
        await approveMilestone(
          account,
          submission.grantId,
          proposalId,
          milestoneIndex,
          submission.recipientId,
          submission.amount,
        );
      } else if (decision === "revisions") {
        await requestMilestoneRevision(
          account,
          submission.grantId,
          proposalId,
          milestoneIndex,
          revisionsNote || comments,
        );
      } else if (decision === "rejected") {
        await requestMilestoneRevision(
          account,
          submission.grantId,
          proposalId,
          milestoneIndex,
          "Rejected. " + (comments || ""),
        );
      }

      setDecisionMade(decision);
      setTimeout(() => router.push("/funder/dashboard"), 2000);
    } catch (err) {
      console.error(`${decision} failed:`, err);
      setError(err.message || "Action failed.");
      setSubmitting(false);
    }
  };

  const inputCls =
    "w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all";

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 flex flex-col items-center gap-3">
        <Loader2 size={32} className="animate-spin text-blue-500" />
        <p className="text-slate-500">Loading submission data...</p>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-500">
          Submission not found or format invalid.
        </p>
        <button
          onClick={() => router.back()}
          className="text-blue-600 text-sm mt-2 hover:underline"
        >
          ← Go back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Review Milestone
          </h1>
          <p className="text-slate-500 mt-1">
            {submission.grantTitle} · {submission.recipientName}
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-emerald-600">
            ${(submission.amount || 0).toLocaleString()}
          </span>
          <p className="text-xs text-slate-400">to release</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {decisionMade && (
        <div
          className={`mb-6 p-4 rounded-xl border ${
            decisionMade === "approved"
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : decisionMade === "rejected"
                ? "bg-red-50 border-red-200 text-red-700"
                : "bg-amber-50 border-amber-200 text-amber-700"
          }`}
        >
          <div className="flex items-center gap-2 font-medium">
            <Loader2 size={16} className="animate-spin" />
            <p>
              {decisionMade === "approved"
                ? "✅ Funds released! Redirecting..."
                : decisionMade === "rejected"
                  ? "❌ Submission rejected. Redirecting..."
                  : "🔄 Revisions requested. Redirecting..."}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Milestone info */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-slate-500 block mb-1">Milestone:</span>
              <span className="font-medium text-slate-900">
                {submission.milestoneName}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Recipient:</span>
              <span className="font-medium text-slate-900 truncate block">
                {submission.recipientName}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Submitted:</span>
              <span className="font-medium text-slate-900">
                {new Date(submission.submittedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Evidence images */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-4">
            Evidence ({submission.evidenceImages.length} photos/videos,{" "}
            {submission.evidenceDocuments.length} documents)
          </h2>

          {submission.evidenceImages.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              {submission.evidenceImages.map((img, i) => (
                <a
                  key={i}
                  href={`https://${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${img.cid}`}
                  target="_blank"
                  rel="noreferrer"
                  className="aspect-square rounded-xl bg-slate-100 border border-slate-200 hover:border-blue-400 transition-colors flex flex-col items-center justify-center p-2 text-center overflow-hidden relative group"
                >
                  <img
                    src={`https://${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${img.cid}`}
                    alt="Evidence"
                    className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                  <div className="relative z-10 bg-black/60 text-white text-xs w-full py-1 truncate px-2">
                    {img.name}
                  </div>
                </a>
              ))}
            </div>
          )}

          {submission.evidenceDocuments.length > 0 && (
            <div className="space-y-2">
              {submission.evidenceDocuments.map((doc, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <span className="text-slate-400">📄</span>
                  <a
                    href={`https://${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${doc.cid}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-blue-600 hover:underline cursor-pointer truncate flex-1"
                  >
                    {doc.name}
                  </a>
                </div>
              ))}
            </div>
          )}

          {submission.evidenceImages.length === 0 &&
            submission.evidenceDocuments.length === 0 && (
              <p className="text-sm text-slate-500 italic">
                No files were attached to this submission.
              </p>
            )}
        </div>

        {/* Recipient notes */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-3">
            Recipient's Notes
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
            {submission.notes}
          </p>
        </div>

        {/* Checklist */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-4">
            Verification Checklist
          </h2>
          <div className="space-y-3">
            {checklist.map((item, i) => (
              <label
                key={i}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => toggleCheck(i)}
                  className="w-4 h-4 accent-blue-500"
                />
                <span
                  className={`text-sm flex-1 ${item.checked ? "line-through text-slate-400" : "text-slate-700"}`}
                >
                  {item.label}
                </span>
                {i >= DEFAULT_CHECKLIST.length && (
                  <button
                    onClick={() => removeItem(i)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded text-red-400 transition-all"
                  >
                    <X size={12} />
                  </button>
                )}
              </label>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <input
              className={`${inputCls} flex-1`}
              placeholder="Add custom checklist item..."
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addItem()}
            />
            <button
              onClick={addItem}
              className="border border-slate-300 bg-white text-slate-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Comments */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-3">
            Comments to Recipient
          </h2>
          <textarea
            className={`${inputCls} h-28 resize-none`}
            placeholder="Optional feedback or comments..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />
        </div>

        {/* Revisions note */}
        {showRevisions && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <label className="block text-sm font-medium text-amber-900 mb-2">
              What revisions are needed? *
            </label>
            <textarea
              className={`${inputCls} h-24 resize-none bg-white`}
              placeholder="Describe what the recipient needs to change or provide..."
              value={revisionsNote}
              onChange={(e) => setRevisionsNote(e.target.value)}
            />
          </div>
        )}

        {/* Decision buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => handleDecision("approved")}
            disabled={submitting}
            className="flex items-center justify-center gap-2 bg-emerald-500 text-white px-5 py-3.5 rounded-xl font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-60"
          >
            {submitting && decisionMade === "approved" ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <CheckCircle size={18} />
            )}{" "}
            Approve & Release
          </button>
          <button
            onClick={() => {
              if (showRevisions && revisionsNote.trim()) {
                handleDecision("revisions");
              } else {
                setShowRevisions(true);
              }
            }}
            disabled={submitting}
            className="flex items-center justify-center gap-2 bg-amber-500 text-white px-5 py-3.5 rounded-xl font-semibold hover:bg-amber-600 transition-colors disabled:opacity-60"
          >
            {submitting && decisionMade === "revisions" ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              "🔄"
            )}{" "}
            Request Revisions
          </button>
          <button
            onClick={() => handleDecision("rejected")}
            disabled={submitting}
            className="flex items-center justify-center gap-2 bg-red-500 text-white px-5 py-3.5 rounded-xl font-semibold hover:bg-red-600 transition-colors disabled:opacity-60"
          >
            {submitting && decisionMade === "rejected" ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              "✕"
            )}{" "}
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
