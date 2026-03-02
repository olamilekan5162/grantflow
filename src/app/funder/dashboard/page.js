"use client";

import Link from "next/link";
import { mockGrants, mockFunderStats, mockTransactions } from "@/lib/mockData";
import {
  Plus,
  Eye,
  Settings,
  AlertCircle,
  DollarSign,
  Activity,
  Users,
  BarChart3,
} from "lucide-react";

const FUNDER_GRANTS = mockGrants.filter((g) => g.funderId === "f1").slice(0, 4);

export default function FunderDashboard() {
  const stats = mockFunderStats;

  const pendingApprovals = [
    {
      name: "Austin Mural Collective",
      grant: "Downtown Mural Initiative 2025",
      milestone: "Surface Prep & Primer",
      id: "sub1",
    },
    {
      name: "EduBridge Partnership",
      grant: "Historic Preservation",
      milestone: "Interior Restoration",
      id: "sub3",
    },
  ];

  const activity = [
    {
      text: "$15,000 released to Austin Mural Collective",
      time: "2 days ago",
      type: "payment",
    },
    {
      text: "New application from Maria Santos",
      time: "3 days ago",
      type: "application",
    },
    {
      text: "$70,000 released to Green Future Research Lab",
      time: "5 days ago",
      type: "payment",
    },
    {
      text: 'Grant "Rural Broadband Access" ended',
      time: "1 week ago",
      type: "ended",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, City of Austin
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
            value: `$${(stats.totalCommitted / 1000).toFixed(0)}K`,
            icon: DollarSign,
            color: "text-blue-600 bg-blue-50",
          },
          {
            label: "Total Disbursed",
            value: `$${(stats.totalDisbursed / 1000).toFixed(0)}K`,
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
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            Your Active Grants
          </h2>
          <div className="space-y-4">
            {FUNDER_GRANTS.map((grant) => {
              const pct =
                grant.totalBudget > 0
                  ? Math.round((grant.disbursed / grant.totalBudget) * 100)
                  : 0;
              const completedMs = grant.milestones.filter(
                (m) => m.status === "completed",
              ).length;
              return (
                <div
                  key={grant.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {grant.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Budget: ${grant.totalBudget.toLocaleString()} · {pct}%
                        Paid
                      </p>
                    </div>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        grant.status === "active"
                          ? "bg-emerald-100 text-emerald-700"
                          : grant.status === "accepting_applications"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {grant.status === "accepting_applications"
                        ? "Open"
                        : grant.status.charAt(0).toUpperCase() +
                          grant.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                    <span>{grant.recipientCount} recipients</span>
                    <span>
                      {completedMs}/{grant.milestones.length} milestones
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 mb-3">
                    <div
                      className="bg-blue-500 h-1.5 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/explore/grants/${grant.id}`}
                      className="border border-slate-300 bg-white text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-1"
                    >
                      <Eye size={14} /> View
                    </Link>
                    <Link
                      href={`/funder/grants/${grant.id}`}
                      className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-1"
                    >
                      <Settings size={14} /> Manage
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pending Approvals */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Pending Approvals
            </h2>
            <div className="space-y-3">
              {pendingApprovals.map((item, i) => (
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
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-500">{item.milestone}</p>
                    </div>
                  </div>
                  <Link
                    href={`/verifier/review/${item.id}`}
                    className="mt-3 block text-center bg-amber-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-amber-600 transition-colors"
                  >
                    Review Now
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Recent Activity
            </h2>
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
              {activity.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      item.type === "payment"
                        ? "bg-emerald-500"
                        : item.type === "application"
                          ? "bg-blue-500"
                          : "bg-slate-300"
                    }`}
                  />
                  <div>
                    <p className="text-sm text-slate-700">{item.text}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
