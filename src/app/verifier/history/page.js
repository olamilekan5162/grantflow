"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const HISTORY = [
  {
    id: "h1",
    date: "2025-02-15",
    grant: "Rural Broadband Access",
    milestone: "Equipment Install",
    decision: "approved",
    amount: 50000,
    recipient: "TechBridge TX",
  },
  {
    id: "h2",
    date: "2025-02-12",
    grant: "Historic Preservation",
    milestone: "Structural Assessment",
    decision: "approved",
    amount: 200000,
    recipient: "EduBridge Partnership",
  },
  {
    id: "h3",
    date: "2025-02-08",
    grant: "Youth Education Technology",
    milestone: "Program Planning",
    decision: "revisions",
    amount: 37500,
    recipient: "STEM Academy",
  },
  {
    id: "h4",
    date: "2025-01-30",
    grant: "Downtown Mural Initiative",
    milestone: "Design Approval",
    decision: "approved",
    amount: 15000,
    recipient: "Austin Mural Collective",
  },
  {
    id: "h5",
    date: "2025-01-25",
    grant: "Clean Energy Research",
    milestone: "Midpoint Report",
    decision: "approved",
    amount: 70000,
    recipient: "Green Future Research Lab",
  },
  {
    id: "h6",
    date: "2025-01-15",
    grant: "Community Garden Network",
    milestone: "Site Prep",
    decision: "rejected",
    amount: 18000,
    recipient: "Austin Green Coalition",
  },
  {
    id: "h7",
    date: "2025-01-10",
    grant: "Small Business Recovery",
    milestone: "Business Plan",
    decision: "approved",
    amount: 25000,
    recipient: "Main St Bookshop",
  },
];

const DECISION_ICON = { approved: "✅", revisions: "🔄", rejected: "❌" };
const DECISION_LABEL = {
  approved: "Approved",
  revisions: "Revisions",
  rejected: "Rejected",
};
const DECISION_COLORS = {
  approved: "bg-emerald-100 text-emerald-700",
  revisions: "bg-amber-100 text-amber-700",
  rejected: "bg-red-100 text-red-700",
};

export default function VerifierHistoryPage() {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const filtered = HISTORY.filter(
    (h) => filter === "all" || h.decision === filter,
  );
  const totalApproved = HISTORY.filter((h) => h.decision === "approved").reduce(
    (s, h) => s + h.amount,
    0,
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Review History</h1>
          <p className="text-slate-500 mt-1">
            {HISTORY.length} total reviews · ${totalApproved.toLocaleString()}{" "}
            released
          </p>
        </div>
        <div className="flex gap-2">
          {["all", "approved", "revisions", "rejected"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors capitalize ${
                filter === f
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                  Date
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                  Grant / Milestone
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                  Recipient
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                  Decision
                </th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                  Amount
                </th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((h) => (
                <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 text-sm text-slate-500">
                    {new Date(h.date).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-slate-900">
                      {h.milestone}
                    </p>
                    <p className="text-xs text-slate-500">{h.grant}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-700">
                    {h.recipient}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${DECISION_COLORS[h.decision]}`}
                    >
                      {DECISION_ICON[h.decision]} {DECISION_LABEL[h.decision]}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span
                      className={`text-sm font-bold ${h.decision === "approved" ? "text-emerald-600" : "text-slate-400"}`}
                    >
                      {h.decision === "approved" ? "+" : ""}$
                      {h.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button className="text-xs text-blue-600 hover:underline font-medium">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <p className="font-medium">No reviews match this filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
