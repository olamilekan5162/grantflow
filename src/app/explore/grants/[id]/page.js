"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getGrantDetails } from "@/utils/recipientHelpers";
import {
  ArrowLeft,
  ExternalLink,
  Share2,
  Download,
  Loader2,
} from "lucide-react";

export default function PublicGrantDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [grant, setGrant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalProof, setModalProof] = useState(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const grantData = await getGrantDetails(id);
        if (grantData) setGrant(grantData);
      } catch (err) {
        console.error("Failed to load generic grant view:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
    const interval = setInterval(loadData, 10000); // 30s auto-refresh
    return () => clearInterval(interval);
  }, [id]);

  if (loading && !grant) {
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

  // Derive display values safely
  const disbursedPct =
    grant.totalBudget && grant.totalBudget > 0
      ? Math.round(((grant.disbursed || 0) / grant.totalBudget) * 100)
      : 0;

  const remaining =
    grant.remaining ||
    (grant.totalBudget || grant.budget || 0) - (grant.disbursed || 0);

  const totalBudget = grant.totalBudget || grant.budget || 0;
  const milestones = grant.milestones || [];
  const applications = grant.applications || [];
  const timeline = grant.timeline || [];

  const STATUS_COLOR = {
    active: "bg-emerald-100 text-emerald-700",
    accepting_applications: "bg-blue-100 text-blue-700",
    completed: "bg-slate-100 text-slate-600",
  };

  const TIMELINE_ICON = {
    payment: "💰",
    approved: "✅",
    created: "🚀",
    info: "ℹ️",
    ended: "🏁",
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Explorer
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                STATUS_COLOR[grant.status] || "bg-blue-100 text-blue-700"
              }`}
            >
              {grant.status === "accepting_applications" ||
              grant.status === "active"
                ? "Open"
                : (grant.status || "open")
                    .replace("_", " ")
                    .charAt(0)
                    .toUpperCase() + (grant.status || "open").slice(1)}
            </span>
            <span className="text-xs text-slate-400 capitalize">
              {grant.category || "Grant"}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">
            {grant.title}
          </h1>
          <p className="text-slate-500 font-mono text-sm">
            Funded by{" "}
            <span className="font-medium text-slate-700">{grant.funder}</span>
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button className="border border-slate-300 bg-white text-slate-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-1.5">
            <Share2 size={14} /> Share
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Total Budget",
            value: `${totalBudget.toLocaleString()} HBAR`,
            sub: grant.currency || "HBAR",
          },
          {
            label: "Disbursed",
            value: `${(grant.disbursed || 0).toLocaleString()} HBAR`,
            sub: `${disbursedPct}%`,
          },
          {
            label: "Remaining",
            value: `${remaining.toLocaleString()} HBAR`,
            sub: "in escrow",
          },
          {
            label: "Recipients",
            value: `${
              grant.recipientCount ||
              applications.filter((a) => a.status === "approved").length
            }/${grant.maxRecipients || "Unlimited"}`,
            sub: "funded",
          },
        ].map(({ label, value, sub }) => (
          <div
            key={label}
            className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
          >
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <p className="text-lg font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-400">{sub}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm mb-8">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-600 font-medium">
            Disbursement Progress
          </span>
          <span className="font-bold text-slate-900">{disbursedPct}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-4 mb-1">
          <div
            className="bg-blue-500 h-4 rounded-full transition-all"
            style={{ width: `${disbursedPct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-400">
          <span>{(grant.disbursed || 0).toLocaleString()} HBAR released</span>
          <span>{remaining.toLocaleString()} HBAR remaining</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Timeline */}
        <div className="lg:col-span-2 space-y-8">
          {/* Milestones breakdown (Moved above Timeline for more logical read order) */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Milestone Breakdown
            </h2>
            {milestones.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400">
                No milestones defined.
              </div>
            ) : (
              <div className="space-y-3">
                {milestones.map((ms, i) => (
                  <div
                    key={i}
                    className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-4"
                  >
                    <div
                      className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-sm ${
                        ms.status === "completed"
                          ? "bg-emerald-100 text-emerald-700"
                          : ms.status === "in_review"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {ms.status === "completed"
                        ? "✓"
                        : ms.status === "in_review"
                          ? "⏳"
                          : i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">
                        {ms.name || `Milestone ${i + 1}`}
                      </p>
                      <p className="text-xs text-slate-500">{ms.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-slate-900">
                        {ms.percentage || 0}%
                      </p>
                      <p className="text-xs text-slate-400">
                        {(ms.amount || 0).toLocaleString()} HBAR
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-6">
              Transaction Timeline
            </h2>
            {timeline.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                No transactions yet
              </div>
            ) : (
              <div className="space-y-2">
                {timeline.map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="text-lg leading-none mt-0.5">
                        {TIMELINE_ICON[item.type] || "•"}
                      </div>
                      {i < timeline.length - 1 && (
                        <div className="w-0.5 flex-1 bg-slate-200 mt-1" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pb-4">
                      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0 pr-2">
                            <p className="text-sm font-medium text-slate-900">
                              {item.event}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {new Date(item.date).toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                          {item.amount && (
                            <span className="text-emerald-600 font-bold text-sm shrink-0">
                              ${item.amount.toLocaleString()}
                            </span>
                          )}
                        </div>
                        {item.txHash && (
                          <div className="mt-2 text-xs text-slate-400 font-mono truncate">
                            Tx: {item.txHash}
                          </div>
                        )}
                        {item.type === "payment" && (
                          <button
                            onClick={() => setModalProof(item)}
                            className="mt-2 text-xs text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink size={11} /> View Proof
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recipients & About */}
        <div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm mb-6">
            <h3 className="font-semibold text-slate-900 mb-3">
              About this Grant
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
              {grant.description}
            </p>
          </div>

          <h2 className="text-lg font-bold text-slate-900 mb-4">Recipients</h2>
          <div className="space-y-3">
            {applications
              .filter((a) => a.status === "approved" || a.status === "active")
              .map((app, i) => (
                <div
                  key={i}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
                      {(app.name || app.recipient || "U")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {app.name || app.recipient}
                      </p>
                      <p className="text-xs text-slate-500">
                        Approved{" "}
                        {new Date(
                          app.submittedAt || Date.now(),
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            {applications.filter(
              (a) => a.status === "approved" || a.status === "active",
            ).length === 0 && (
              <p className="text-sm text-slate-400 italic">
                No recipients selected yet.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Proof Modal */}
      {modalProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setModalProof(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Proof Details
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Event</span>
                <span className="font-medium text-right ml-4">
                  {modalProof.event}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount</span>
                <span className="font-bold text-emerald-600">
                  ${modalProof.amount?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date</span>
                <span>{new Date(modalProof.date).toLocaleDateString()}</span>
              </div>
              {modalProof.txHash && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Transaction</span>
                  <span
                    className="font-mono text-xs w-32 truncate text-right border border-slate-100 bg-slate-50 px-2 py-1 rounded"
                    title={modalProof.txHash}
                  >
                    {modalProof.txHash}
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={() => setModalProof(null)}
              className="mt-5 w-full bg-slate-900 text-white py-2 rounded-lg text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
