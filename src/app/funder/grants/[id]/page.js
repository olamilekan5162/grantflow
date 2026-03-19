"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { getGrantApplications } from "@/utils/funderHelpers";
import { getGrantDetails } from "@/utils/recipientHelpers";
import { approveProposal, rejectProposal } from "@/utils/submissionHelpers";
import { ArrowLeft, Users, Clock, CheckCircle, Loader2, X } from "lucide-react";

const statusColors = {
  completed: "text-emerald-600 bg-emerald-50",
  pending_review: "text-amber-600 bg-amber-50",
  locked: "text-slate-500 bg-slate-100",
  available: "text-blue-600 bg-blue-50",
  revision_requested: "text-red-600 bg-red-50",
};
const statusLabels = {
  completed: "✅ Completed",
  pending_review: "🔄 Under Review",
  locked: "⏳ Locked",
  available: "🟢 Available",
  revision_requested: "⚠️ Revision Needed",
};

export default function FunderGrantPage() {
  const { id } = useParams();
  const router = useRouter();
  const { account } = useApp();
  const [activeTab, setActiveTab] = useState("overview");
  const [grant, setGrant] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [grantData, apps] = await Promise.all([
        getGrantDetails(id),
        getGrantApplications(id),
      ]);
      if (grantData) setGrant(grantData);
      if (apps) setApplications(apps);
      setLoading(false);
    }
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, [id]);

  const handleApprove = async (proposalId) => {
    setActionLoading(proposalId);
    try {
      await approveProposal(account, id, proposalId);
      const apps = await getGrantApplications(id);
      setApplications(apps);
    } catch (err) {
      console.error("Approve failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setActionLoading(rejectModal);
    try {
      await rejectProposal(account, id, rejectModal, rejectReason);
      const apps = await getGrantApplications(id);
      setApplications(apps);
      setRejectModal(null);
      setRejectReason("");
    } catch (err) {
      console.error("Reject failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 flex flex-col items-center gap-3">
        <Loader2 size={32} className="animate-spin text-blue-500" />
        <p className="text-slate-500">Loading grant details...</p>
      </div>
    );
  }

  if (!grant) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors mt-1"
        >
          <ArrowLeft size={18} className="text-slate-500" />
        </button>
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {grant.title}
              </h1>
              <p className="text-slate-500 mt-1">{grant.funder}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-slate-500 mb-1">Total Budget</p>
          <p className="text-xl font-bold text-slate-900">
            {budget.toLocaleString()} HBAR
          </p>
          <p className="text-xs text-slate-400">{grant.currency || ""}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-slate-500 mb-1">Applications</p>
          <p className="text-xl font-bold text-blue-600">
            {grant.applicationCount || 0}
          </p>
          <p className="text-xs text-slate-400">total received</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-slate-500 mb-1">Milestones</p>
          <p className="text-xl font-bold text-slate-900">
            {milestones.length}
          </p>
          <p className="text-xs text-slate-400">payment stages</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 mb-6">
        <div className="flex gap-6">
          {["overview", "milestones", "applications"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors capitalize ${
                activeTab === tab
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              {tab} {tab === "applications" && `(${applications.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Overview tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-3">Description</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {grant.description}
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-3">Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Category</p>
                <p className="font-medium">{grant.category || "—"}</p>
              </div>
              <div>
                <p className="text-slate-500">Deadline</p>
                <p className="font-medium">
                  {grant.deadline
                    ? new Date(grant.deadline).toLocaleDateString()
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Recipient Type</p>
                <p className="font-medium capitalize">
                  {grant.recipientType || "open"}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Max Recipients</p>
                <p className="font-medium">
                  {grant.maxRecipients || "Unlimited"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Milestones tab */}
      {activeTab === "milestones" && (
        <div className="space-y-4">
          {milestones.length === 0 ? (
            <p className="text-center text-slate-500 py-8">
              No milestones defined.
            </p>
          ) : (
            milestones.map((ms, i) => (
              <div
                key={i}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-slate-900">
                        {i + 1}. {ms.name}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{ms.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{ms.percentage}%</p>
                    <p className="text-xs text-slate-400">
                      {(ms.amount || 0).toLocaleString()} HBAR
                    </p>
                  </div>
                </div>
                {ms.verificationType === "approver" && (
                  <p className="text-xs text-blue-600">
                    Requires approver verification
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Applications tab */}
      {activeTab === "applications" && (
        <div className="space-y-4">
          {applications.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Users size={32} className="mx-auto mb-3 text-slate-300" />
              <p className="font-medium">No applications yet</p>
              <p className="text-sm">
                Applications will appear here once submitted.
              </p>
            </div>
          ) : (
            applications.map((app) => (
              <div
                key={app.proposalId}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900">
                      {app.name || app.recipient}
                    </p>
                    <p className="text-xs text-slate-500">
                      Submitted {new Date(app.submittedAt).toLocaleDateString()}
                    </p>
                    {app.proposal && (
                      <p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap">
                        {app.proposal}
                      </p>
                    )}
                    {(app.images?.length > 0 || app.documents?.length > 0) && (
                      <div className="mt-4 border-t border-slate-100 pt-3">
                        <p className="text-xs font-semibold text-slate-900 mb-2">
                          Attached Files
                        </p>
                        <div className="space-y-1">
                          {app.images?.map((img, idx) => (
                            <a
                              key={idx}
                              href={`https://${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${img.cid}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-blue-600 hover:underline block truncate flex items-center gap-1"
                            >
                              🖼️ {img.name || "Image"}
                            </a>
                          ))}
                          {app.documents?.map((doc, idx) => (
                            <a
                              key={idx}
                              href={`https://${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${doc.cid}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-blue-600 hover:underline block truncate flex items-center gap-1"
                            >
                              📄 {doc.name || "Document"}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        app.status === "approved"
                          ? "bg-emerald-100 text-emerald-700"
                          : app.status === "pending"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </span>
                    {app.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleApprove(app.proposalId)}
                          disabled={actionLoading === app.proposalId}
                          className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-60"
                        >
                          {actionLoading === app.proposalId ? "..." : "Approve"}
                        </button>
                        <button
                          onClick={() => setRejectModal(app.proposalId)}
                          disabled={actionLoading === app.proposalId}
                          className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-60"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Reject modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">
                Reject Application
              </h3>
              <button
                onClick={() => {
                  setRejectModal(null);
                  setRejectReason("");
                }}
              >
                <X size={18} className="text-slate-400" />
              </button>
            </div>
            <textarea
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm h-24 resize-none mb-4"
              placeholder="Reason for rejection (optional)..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setRejectModal(null);
                  setRejectReason("");
                }}
                className="flex-1 border border-slate-300 px-4 py-2 rounded-lg text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-60"
              >
                {actionLoading ? "Rejecting..." : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
