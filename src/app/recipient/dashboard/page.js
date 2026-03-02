"use client";

import Link from "next/link";
import { mockGrants, mockTransactions } from "@/lib/mockData";
import { ArrowRight, DollarSign, CheckCircle, Clock } from "lucide-react";

const MY_GRANTS = mockGrants.filter((g) => g.status === "active").slice(0, 3);
const AVAILABLE_GRANTS = mockGrants
  .filter((g) => g.status === "accepting_applications")
  .slice(0, 3);

export default function RecipientDashboard() {
  const totalEarned = mockTransactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, Austin Mural Collective
          </h1>
          <p className="text-slate-500 mt-1">
            Track your grants and submit milestone proof
          </p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-3 flex items-center gap-3">
          <DollarSign size={18} className="text-emerald-600" />
          <div>
            <p className="text-xs text-emerald-700 font-medium">Total Earned</p>
            <p className="text-lg font-bold text-emerald-700">
              ${totalEarned.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Active Grants */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-slate-900 mb-4">
          Your Active Grants
        </h2>
        <div className="grid gap-4">
          {MY_GRANTS.map((grant) => {
            const disbursedPct =
              grant.totalBudget > 0
                ? Math.round((grant.disbursed / grant.totalBudget) * 100)
                : 0;
            const nextMs = grant.milestones.find(
              (m) => m.status !== "completed",
            );
            return (
              <div
                key={grant.id}
                className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900">{grant.title}</h3>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {grant.funder}
                    </p>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Progress</span>
                        <span>{disbursedPct}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${disbursedPct}%` }}
                        />
                      </div>
                    </div>
                    {nextMs && (
                      <div className="mt-3 flex items-center gap-2">
                        <Clock size={14} className="text-amber-500" />
                        <p className="text-sm text-slate-600">
                          Next:{" "}
                          <span className="font-medium">{nextMs.name}</span> ($
                          {nextMs.amount?.toLocaleString()})
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Link
                      href={`/recipient/milestones/${grant.milestones[0]?.id}`}
                      className="border border-slate-300 bg-white text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                    >
                      View Progress
                    </Link>
                    {nextMs && nextMs.status !== "locked" && (
                      <Link
                        href={`/recipient/grants/${grant.id}/milestones/${nextMs.id}`}
                        className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
                      >
                        Submit Proof
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
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
        <div className="grid md:grid-cols-3 gap-4">
          {AVAILABLE_GRANTS.map((grant) => (
            <div
              key={grant.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                  {grant.category}
                </span>
                <span className="text-xs text-slate-400">{grant.currency}</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">
                {grant.title}
              </h3>
              <p className="text-xs text-slate-500 mb-3">{grant.funder}</p>
              <div className="flex justify-between text-sm mb-3">
                <span className="text-slate-500">Budget</span>
                <span className="font-semibold">
                  ${grant.totalBudget.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-400 mb-4">
                <Clock size={11} />
                <span>
                  deadline:{" "}
                  {new Date(grant.applicationDeadline).toLocaleDateString(
                    "en-US",
                    { month: "short", day: "numeric" },
                  )}
                </span>
              </div>
              <Link
                href={`/recipient/grants/${grant.id}`}
                className="block text-center bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
              >
                Apply Now
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Payment History */}
      <section>
        <h2 className="text-lg font-bold text-slate-900 mb-4">
          Payment History
        </h2>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {mockTransactions.slice(0, 5).map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between px-5 py-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-emerald-50 rounded-full flex items-center justify-center">
                    <DollarSign size={16} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {tx.milestone}
                    </p>
                    <p className="text-xs text-slate-500">
                      {tx.grant} · {new Date(tx.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className="text-emerald-600 font-bold text-sm">
                  +${tx.amount.toLocaleString()} {tx.currency}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
