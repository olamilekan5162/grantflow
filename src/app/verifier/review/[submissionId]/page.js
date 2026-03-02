"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { mockMilestoneSubmissions, mockGrants } from "@/lib/mockData";
import { ArrowLeft, CheckCircle, Plus, X } from "lucide-react";

const DEFAULT_CHECKLIST = [
  { label: "Location matches grant requirements", checked: false },
  { label: "Matches approved design/plan", checked: false },
  { label: "Quality meets stated standards", checked: false },
  { label: "All required evidence provided", checked: false },
];

const DUMMY_IMAGES = [
  "bg-gradient-to-br from-blue-100 to-blue-200",
  "bg-gradient-to-br from-emerald-100 to-emerald-200",
  "bg-gradient-to-br from-amber-100 to-amber-200",
];

export default function ReviewMilestonePage() {
  const { submissionId } = useParams();
  const router = useRouter();
  const submission =
    mockMilestoneSubmissions.find((s) => s.id === submissionId) ||
    mockMilestoneSubmissions[0];
  const grant =
    mockGrants.find((g) => g.id === submission.grantId) || mockGrants[0];

  const [checklist, setChecklist] = useState(DEFAULT_CHECKLIST);
  const [newItem, setNewItem] = useState("");
  const [comments, setComments] = useState("");
  const [decisionMade, setDecisionMade] = useState(null);
  const [revisionsNote, setRevisionsNote] = useState("");
  const [showRevisions, setShowRevisions] = useState(false);

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
  const allChecked = checklist.every((c) => c.checked);

  const handleDecision = (decision) => {
    setDecisionMade(decision);
    setTimeout(() => router.push("/verifier/dashboard"), 2000);
  };

  const inputCls =
    "w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all";

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
            {grant.title} · {submission.recipientName}
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-emerald-600">
            ${submission.amount.toLocaleString()}
          </span>
          <p className="text-xs text-slate-400">to release</p>
        </div>
      </div>

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
          <p className="font-medium">
            {decisionMade === "approved"
              ? "✅ Funds released! Redirecting..."
              : decisionMade === "rejected"
                ? "❌ Submission rejected. Redirecting..."
                : "🔄 Revisions requested. Redirecting..."}
          </p>
        </div>
      )}

      <div className="space-y-6">
        {/* Milestone info */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-500">Milestone:</span>{" "}
              <span className="font-medium text-slate-900">
                {submission.milestoneName}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Recipient:</span>{" "}
              <span className="font-medium text-slate-900">
                {submission.recipientName}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Submitted:</span>{" "}
              <span className="font-medium text-slate-900">
                {new Date(submission.submittedAt).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Due:</span>{" "}
              <span className="font-medium text-slate-900">
                {new Date(submission.dueDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Evidence images */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-4">
            Evidence ({submission.evidenceImages} photos,{" "}
            {submission.evidenceDocuments} documents)
          </h2>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {DUMMY_IMAGES.map((cls, i) => (
              <div
                key={i}
                className={`aspect-square rounded-xl ${cls} cursor-pointer hover:opacity-80 transition-opacity`}
              />
            ))}
          </div>
          <div className="space-y-2">
            {["milestone_report.pdf", "site_inspection.pdf"].map((doc, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg"
              >
                <span className="text-slate-400">📄</span>
                <span className="text-sm text-blue-600 hover:underline cursor-pointer">
                  {doc}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recipient notes */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-3">
            Recipient's Notes
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
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
            className="flex items-center justify-center gap-2 bg-emerald-500 text-white px-5 py-3.5 rounded-xl font-semibold hover:bg-emerald-600 transition-colors"
          >
            <CheckCircle size={18} /> Approve & Release
          </button>
          <button
            onClick={() => {
              if (showRevisions && revisionsNote.trim()) {
                handleDecision("revisions");
              } else {
                setShowRevisions(true);
              }
            }}
            className="flex items-center justify-center gap-2 bg-amber-500 text-white px-5 py-3.5 rounded-xl font-semibold hover:bg-amber-600 transition-colors"
          >
            🔄 Request Revisions
          </button>
          <button
            onClick={() => handleDecision("rejected")}
            className="flex items-center justify-center gap-2 bg-red-500 text-white px-5 py-3.5 rounded-xl font-semibold hover:bg-red-600 transition-colors"
          >
            ✕ Reject
          </button>
        </div>
      </div>
    </div>
  );
}
