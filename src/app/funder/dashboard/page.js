"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { useGrantFlow } from "@/hooks/useGrantFlow";
import {
  Plus,
  Eye,
  Settings,
  AlertCircle,
  DollarSign,
  Activity,
  Users,
  BarChart3,
  Loader2,
} from "lucide-react";

export default function FunderDashboard() {
  const { account, memo } = useApp();
  const { loadMyGrants, loadPendingReviews, loadPastReviews, loading } =
    useGrantFlow();

  const [grants, setGrants] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [pastReviews, setPastReviews] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Parse display name from memo
  let displayName = "Funder";
  try {
    if (memo) {
      const parsed = JSON.parse(memo);
      displayName = parsed.orgName || parsed.name || "Funder";
    }
  } catch {}

  useEffect(() => {
    if (!account) return;

    async function loadData() {
      const [myGrants, pending, past] = await Promise.all([
        loadMyGrants(),
        loadPendingReviews(),
        loadPastReviews(),
      ]);
      if (myGrants) setGrants(myGrants);
      if (pending) setPendingReviews(pending);
      if (past) setPastReviews(past);
      setDataLoaded(true);
    }

    loadData();

    // Refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [account]);

  // Compute stats from real data
  const stats = {
    totalCommitted: grants.reduce(
      (sum, g) => sum + (g.totalBudget || g.budget || 0),
      0,
    ),
    totalDisbursed: grants.reduce((sum, g) => sum + (g.disbursed || 0), 0),
    activeGrants: grants.filter((g) => g.status !== "completed").length,
    activeRecipients: grants.reduce(
      (sum, g) => sum + (g.approvedCount || 0),
      0,
    ),
  };

  if (!account) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Connect Your Wallet
        </h1>
        <p className="text-slate-500">
          Please connect your wallet to view your funder dashboard.
        </p>
      </div>
    );
  }

  if (loading && !dataLoaded) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center gap-3">
        <Loader2 size={32} className="animate-spin text-blue-500" />
        <p className="text-slate-500">Loading your grants...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {displayName}
          </h1>
          <p className="text-slate-500 mt-1">
            Manage your grants and track impact
          </p>
        </div>
        <Link
          href="/funder/grants/create"
          className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors"
        >
          <Plus size={16} /> Create New Grant
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Total Committed",
            value:
              stats.totalCommitted > 0
                ? `${stats.totalCommitted.toLocaleString()} HBAR`
                : "0 HBAR",
            icon: DollarSign,
            color: "text-blue-600 bg-blue-50",
          },
          {
            label: "Total Disbursed",
            value:
              stats.totalDisbursed > 0
                ? `${stats.totalDisbursed.toLocaleString()} HBAR`
                : "0 HBAR",
            icon: BarChart3,
            color: "text-emerald-600 bg-emerald-50",
          },
          {
            label: "Active Grants",
            value: stats.activeGrants,
            icon: Activity,
            color: "text-amber-600 bg-amber-50",
          },
          {
            label: "Active Recipients",
            value: stats.activeRecipients,
            icon: Users,
            color: "text-purple-600 bg-purple-50",
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm"
          >
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}
            >
              <Icon size={18} />
            </div>
            <div className="text-2xl font-bold text-slate-900">{value}</div>
            <div className="text-sm text-slate-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Active Grants */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Your Grants</h2>
          {grants.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
              <p className="text-slate-500 mb-4">
                You haven't created any grants yet.
              </p>
              <Link
                href="/funder/grants/create"
                className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors"
              >
                <Plus size={16} /> Create Your First Grant
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {grants.map((grant) => {
                const budget = grant.totalBudget || grant.budget || 0;
                const milestones = grant.milestones || [];
                return (
                  <div
                    key={grant.grantId}
                    className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {grant.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Budget: {budget.toLocaleString()} HBAR ·{" "}
                          {grant.applicationCount || 0} application
                          {grant.applicationCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                          grant.status === "completed"
                            ? "bg-slate-100 text-slate-600"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {grant.status === "completed" ? "Completed" : "Active"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                      <span>{grant.category || "—"}</span>
                      <span>{milestones.length} milestones</span>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/explore/grants/${grant.grantId}`}
                        className="border border-slate-300 bg-white text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-1"
                      >
                        <Eye size={14} /> View
                      </Link>
                      <Link
                        href={`/funder/grants/${grant.grantId}`}
                        className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-1"
                      >
                        <Settings size={14} /> Manage
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pending Reviews */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Pending Reviews
            </h2>
            {pendingReviews.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
                <p className="text-sm text-slate-400">No pending reviews</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingReviews.map((item, i) => (
                  <div
                    key={i}
                    className="bg-amber-50 border border-amber-200 rounded-xl p-4"
                  >
                    <div className="flex items-start gap-3">
                      <AlertCircle
                        size={16}
                        className="text-amber-500 shrink-0 mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {item.grantTitle}
                        </p>
                        <p className="text-xs text-slate-500">
                          {item.milestoneName}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/funder/review/${item.proposalId}_${item.milestoneIndex}`}
                      className="mt-3 block text-center bg-amber-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-amber-600 transition-colors"
                    >
                      Review Now
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past Reviews */}
          {pastReviews.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-4">
                Past Reviews
              </h2>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {pastReviews.map((item, i) => (
                  <div
                    key={i}
                    className="bg-white border border-slate-200 rounded-xl p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {item.grantTitle}
                        </p>
                        <p className="text-xs text-slate-500">
                          {item.milestoneName} (
                          {new Date(item.timestamp).toLocaleDateString()})
                        </p>
                      </div>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          item.status === "completed"
                            ? "bg-emerald-100 text-emerald-700"
                            : item.status === "revision_requested"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {item.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-400 mb-1">Account</p>
            <p className="text-sm font-mono text-slate-700 break-all">
              {account}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
