"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { useGrantFlow } from "@/hooks/useGrantFlow";
import {
  ArrowRight,
  DollarSign,
  CheckCircle,
  Clock,
  Loader2,
  AlertTriangle,
} from "lucide-react";

export default function RecipientDashboard() {
  const { account, memo } = useApp();
  const { loadMyApplications, loadAvailableGrants, loading } = useGrantFlow();

  const [applications, setApplications] = useState([]);
  const [availableGrants, setAvailableGrants] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Parse display name from memo
  let displayName = "Recipient";
  try {
    if (memo) {
      const parsed = JSON.parse(memo);
      displayName = parsed.name || parsed.orgName || "Recipient";
    }
  } catch {}

  useEffect(() => {
    if (!account) return;

    async function loadData() {
      const [myApps, available] = await Promise.all([
        loadMyApplications(),
        loadAvailableGrants(),
      ]);
      if (myApps) setApplications(myApps);
      if (available) setAvailableGrants(available.filter((g) => !g.expired));
      setDataLoaded(true);
    }

    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [account]);

  if (!account) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Connect Your Wallet
        </h1>
        <p className="text-slate-500">
          Please connect your wallet to view your dashboard.
        </p>
      </div>
    );
  }

  if (loading && !dataLoaded) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center gap-3">
        <Loader2 size={32} className="animate-spin text-blue-500" />
        <p className="text-slate-500">Loading your dashboard...</p>
      </div>
    );
  }

  // Active = approved applications
  const activeApps = applications.filter((a) => a.status === "approved");
  const pendingApps = applications.filter((a) => a.status === "pending");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {displayName}
          </h1>
          <p className="text-slate-500 mt-1">
            Track your grants and submit milestone proof
          </p>
        </div>
        {pendingApps.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 flex items-center gap-3">
            <Clock size={18} className="text-amber-600" />
            <div>
              <p className="text-xs text-amber-700 font-medium">
                Pending Applications
              </p>
              <p className="text-lg font-bold text-amber-700">
                {pendingApps.length}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Active Grants (approved applications) */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-slate-900 mb-4">
          Your Active Grants
        </h2>
        {activeApps.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
            <p className="text-slate-500 mb-2">
              {pendingApps.length > 0
                ? "Your applications are still pending review."
                : "You don't have any active grants yet."}
            </p>
            <Link
              href="/recipient/grants"
              className="text-blue-600 text-sm font-medium hover:underline"
            >
              Browse available grants →
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {activeApps.map((app) => {
              const completedMs = app.completedMilestones || 0;
              const totalMs = app.totalMilestones || 0;
              const pct =
                totalMs > 0 ? Math.round((completedMs / totalMs) * 100) : 0;

              return (
                <div
                  key={app.proposalId}
                  className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900">
                        {app.grantTitle}
                      </h3>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {app.grantBudget
                          ? `${Number(app.grantBudget).toLocaleString()} HBAR`
                          : "—"}
                      </p>
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                          <span>
                            Milestones: {completedMs}/{totalMs}
                          </span>
                          <span>{pct}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      {app.hasRevisions && (
                        <div className="mt-3 flex items-center gap-2">
                          <AlertTriangle size={14} className="text-amber-500" />
                          <p className="text-sm text-amber-600">
                            Revision requested on a milestone
                          </p>
                        </div>
                      )}
                      {app.hasPendingReviews && (
                        <div className="mt-2 flex items-center gap-2">
                          <Clock size={14} className="text-blue-500" />
                          <p className="text-sm text-blue-600">
                            Milestone proof pending review
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Link
                        href={`/recipient/grants/${app.grantId}`}
                        className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Available Grants */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Available Grants</h2>
          <Link
            href="/recipient/grants"
            className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1"
          >
            Browse all <ArrowRight size={14} />
          </Link>
        </div>
        {availableGrants.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
            <p className="text-slate-500">No grants are currently available.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {availableGrants.slice(0, 6).map((grant) => (
              <div
                key={grant.grantId}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                    {grant.category || "Grant"}
                  </span>
                  {grant.applied && (
                    <span className="text-xs text-emerald-600 font-medium">
                      ✓ Applied
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">
                  {grant.title}
                </h3>
                <p className="text-xs text-slate-500 mb-3 truncate">
                  {grant.funder}
                </p>
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-slate-500">Budget</span>
                  <span className="font-semibold">
                    {(grant.totalBudget || grant.budget || 0).toLocaleString()}{" "}
                    HBAR
                  </span>
                </div>
                {grant.deadline && (
                  <div className="flex items-center gap-1 text-xs text-slate-400 mb-4">
                    <Clock size={11} />
                    <span>
                      deadline:{" "}
                      {new Date(grant.deadline).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                )}
                <Link
                  href={`/recipient/grants/${grant.grantId}`}
                  className="block text-center bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
                >
                  {grant.applied ? "View Application" : "Apply Now"}
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Pending Applications */}
      {pendingApps.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            Pending Applications
          </h2>
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
              {pendingApps.map((app) => (
                <div
                  key={app.proposalId}
                  className="flex items-center justify-between px-5 py-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-amber-50 rounded-full flex items-center justify-center">
                      <Clock size={16} className="text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {app.grantTitle}
                      </p>
                      <p className="text-xs text-slate-500">
                        Submitted{" "}
                        {new Date(app.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                    Pending
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
