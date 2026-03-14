"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { getPendingMilestoneReviews } from "@/utils/funderHelpers";
import { getMessages, filterByType } from "@/utils/grantFlowHelpers";
import { Clock, Star, Loader2 } from "lucide-react";

export default function VerifierDashboard() {
  const { account, memo } = useApp();
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  let displayName = "Verifier";
  try {
    if (memo) {
      const parsed = JSON.parse(memo);
      displayName = parsed.name || parsed.orgName || "Verifier";
    }
  } catch {}

  useEffect(() => {
    if (!account) return;

    async function loadData() {
      setLoading(true);
      try {
        // For verifier, show all pending milestone reviews across all grants
        // (In a full system, this would be filtered to only grants assigned to this verifier)
        const messages = await getMessages();

        // Find all milestone submissions that are pending review
        const allSubmissions = messages.filter(
          (m) => m.type === "MILESTONE_SUBMITTED",
        );

        const pending = [];
        for (const sub of allSubmissions) {
          const approved = messages.find(
            (m) =>
              m.type === "MILESTONE_APPROVED" &&
              m.proposalId === sub.proposalId &&
              m.milestoneIndex === sub.milestoneIndex,
          );
          const revised = messages.find(
            (m) =>
              m.type === "MILESTONE_REVISION_REQUESTED" &&
              m.proposalId === sub.proposalId &&
              m.milestoneIndex === sub.milestoneIndex,
          );

          if (!approved && !revised) {
            const grantMsg = messages.find(
              (m) => m.type === "GRANT_CREATED" && m.grantId === sub.grantId,
            );
            pending.push({
              ...sub,
              grantTitle: grantMsg?.grantId || sub.grantId,
              milestoneName: `Milestone ${sub.milestoneIndex + 1}`,
            });
          }
        }

        setPendingSubmissions(pending);

        // Get recent approvals/revisions by this account
        const myReviews = messages.filter(
          (m) =>
            (m.type === "MILESTONE_APPROVED" ||
              m.type === "MILESTONE_REVISION_REQUESTED") &&
            (m.approvedBy === account || m.requestedBy === account),
        );
        setRecentReviews(
          myReviews.sort((a, b) => b.timestamp - a.timestamp).slice(0, 5),
        );
      } catch (err) {
        console.error("Failed to load verifier data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, [account]);

  if (!account) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Connect Your Wallet
        </h1>
        <p className="text-slate-500">
          Connect your wallet to view verifier dashboard.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 flex flex-col items-center gap-3">
        <Loader2 size={32} className="animate-spin text-blue-500" />
        <p className="text-slate-500">Loading verifier dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Verifier Dashboard
        </h1>
        <p className="text-slate-500 mt-1">
          Review milestone submissions and release payments
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Pending Reviews",
            value: pendingSubmissions.length,
          },
          {
            label: "Total Reviews",
            value: recentReviews.length,
          },
          {
            label: "Approved",
            value: recentReviews.filter((r) => r.type === "MILESTONE_APPROVED")
              .length,
          },
          {
            label: "Revisions",
            value: recentReviews.filter(
              (r) => r.type === "MILESTONE_REVISION_REQUESTED",
            ).length,
          },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm text-center"
          >
            <div className="text-2xl font-bold text-slate-900">{value}</div>
            <div className="text-sm text-slate-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pending */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            Pending Verifications
          </h2>
          {pendingSubmissions.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
              <p className="text-slate-500">
                No pending verifications right now.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingSubmissions.map((sub, index) => (
                <div
                  key={index}
                  className="bg-white border border-amber-200 rounded-xl p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {sub.milestoneName}
                      </h3>
                      <p className="text-xs text-slate-500">{sub.grantTitle}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs text-slate-500 mb-4">
                    <div>
                      <span className="font-medium text-slate-700">Grant:</span>{" "}
                      {sub.grantId}
                    </div>
                    <div>
                      <span className="font-medium text-slate-700">
                        Submitted:
                      </span>{" "}
                      {new Date(sub.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                  <Link
                    href={`/verifier/review/${sub.proposalId}_${sub.milestoneIndex}`}
                    className="block text-center bg-slate-900 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors"
                  >
                    Review Now
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            Recent Reviews
          </h2>
          {recentReviews.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
              <p className="text-sm text-slate-400">No reviews yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentReviews.map((r, i) => (
                <div
                  key={i}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        Milestone {r.milestoneIndex + 1}
                      </p>
                      <p className="text-xs text-slate-500">{r.grantId}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(r.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-lg">
                      {r.type === "MILESTONE_APPROVED" ? "✅" : "🔄"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Account info */}
          <div className="mt-6 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-3">Your Account</h3>
            <p className="text-xs text-slate-400 mb-1">Account ID</p>
            <p className="text-sm font-mono text-slate-700 break-all">
              {account}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
