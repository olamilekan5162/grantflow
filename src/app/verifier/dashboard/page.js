"use client";

import Link from "next/link";
import { mockMilestoneSubmissions } from "@/lib/mockData";
import { Clock, Star } from "lucide-react";

export default function VerifierDashboard() {
  const stats = [
    { label: "Total Reviews", value: "42" },
    { label: "Approval Rate", value: "91%" },
    { label: "Avg Response", value: "1.2 days" },
    { label: "Reputation", value: "4.8 / 5" },
  ];

  const recent = [
    {
      grant: "Rural Broadband Access",
      milestone: "Equipment Install",
      decision: "approved",
      date: "2025-02-15",
      amount: 50000,
    },
    {
      grant: "Historic Preservation",
      milestone: "Structural Assessment",
      decision: "approved",
      date: "2025-02-12",
      amount: 200000,
    },
    {
      grant: "Youth Education",
      milestone: "Program Planning",
      decision: "revisions",
      date: "2025-02-08",
      amount: 37500,
    },
  ];

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
        {stats.map(({ label, value }) => (
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
          <div className="space-y-4">
            {mockMilestoneSubmissions.map((sub) => (
              <div
                key={sub.id}
                className="bg-white border border-amber-200 rounded-xl p-5 shadow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {sub.milestoneName}
                    </h3>
                    <p className="text-xs text-slate-500">{sub.grantTitle}</p>
                  </div>
                  <span className="text-sm font-bold text-emerald-600">
                    ${sub.amount.toLocaleString()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs text-slate-500 mb-4">
                  <div>
                    <span className="font-medium text-slate-700">
                      Recipient:
                    </span>{" "}
                    {sub.recipientName}
                  </div>
                  <div>
                    <span className="font-medium text-slate-700">
                      Submitted:
                    </span>{" "}
                    {new Date(sub.submittedAt).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium text-slate-700">Due:</span>{" "}
                    {new Date(sub.dueDate).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium text-slate-700">
                      Evidence:
                    </span>{" "}
                    {sub.evidenceImages} photos, {sub.evidenceDocuments} docs
                  </div>
                </div>
                <Link
                  href={`/verifier/review/${sub.id}`}
                  className="block text-center bg-slate-900 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors"
                >
                  Review Now
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            Recently Reviewed
          </h2>
          <div className="space-y-3">
            {recent.map((r, i) => (
              <div
                key={i}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {r.milestone}
                    </p>
                    <p className="text-xs text-slate-500">{r.grant}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(r.date).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`text-lg ${r.decision === "approved" ? "✅" : r.decision === "rejected" ? "❌" : "🔄"}`}
                  >
                    {r.decision === "approved"
                      ? "✅"
                      : r.decision === "rejected"
                        ? "❌"
                        : "🔄"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Reputation */}
          <div className="mt-6 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-3">Reputation</h3>
            <div className="flex items-center gap-2 mb-3">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  size={18}
                  className={
                    n <= 4 ? "text-amber-400 fill-amber-400" : "text-slate-300"
                  }
                />
              ))}
              <span className="text-sm font-bold text-slate-900 ml-1">4.8</span>
            </div>
            <div className="space-y-2">
              {[
                '"Very thorough and prompt reviewer!"',
                '"Fair, detailed feedback."',
              ].map((fb) => (
                <p key={fb} className="text-xs text-slate-500 italic">
                  {fb}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
