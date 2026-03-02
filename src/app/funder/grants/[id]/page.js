"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { mockGrants } from "@/lib/mockData";
import Link from "next/link";
import { ArrowLeft, Users, Clock, CheckCircle, Calendar } from "lucide-react";

export default function FunderGrantPage() {
  const { id } = useParams();
  const router = useRouter();
  const grant = mockGrants.find((g) => g.id === id) || mockGrants[0];
  const [activeTab, setActiveTab] = useState("overview");

  const disbursedPct =
    grant.totalBudget > 0
      ? Math.round((grant.disbursed / grant.totalBudget) * 100)
      : 0;

  const statusColors = {
    completed: "text-emerald-600 bg-emerald-50",
    in_review: "text-amber-600 bg-amber-50",
    locked: "text-slate-500 bg-slate-100",
    pending: "text-blue-600 bg-blue-50",
  };
  const statusLabels = {
    completed: "✅ Completed",
    in_review: "🔄 Under Review",
    locked: "⏳ Locked",
    pending: "⏰ Pending",
  };

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
            <div className="flex gap-2">
              <button className="border border-slate-300 bg-white text-slate-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                Edit
              </button>
              <button className="border border-slate-300 bg-white text-slate-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                Share
              </button>
              <button className="border border-slate-300 bg-white text-slate-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-slate-500 mb-1">Total Budget</p>
          <p className="text-xl font-bold text-slate-900">
            ${grant.totalBudget.toLocaleString()}
          </p>
          <p className="text-xs text-slate-400">{grant.currency}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-slate-500 mb-1">Disbursed</p>
          <p className="text-xl font-bold text-emerald-600">
            ${grant.disbursed.toLocaleString()}
          </p>
          <p className="text-xs text-slate-400">{disbursedPct}% of total</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-slate-500 mb-1">Status</p>
          <p className="text-xl font-bold text-slate-900 capitalize">
            {grant.status.replace("_", " ")}
          </p>
          <p className="text-xs text-slate-400">
            {grant.recipientCount}/{grant.maxRecipients} recipients
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-600 font-medium">Overall Progress</span>
          <span className="text-slate-900 font-bold">{disbursedPct}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 mb-2">
          <div
            className="bg-blue-500 h-3 rounded-full transition-all"
            style={{ width: `${disbursedPct}%` }}
          />
        </div>
        <p className="text-xs text-slate-400">
          ${grant.remaining.toLocaleString()} remaining to disburse
        </p>
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
              {tab} {tab === "applications" && `(${grant.applications.length})`}
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
          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Timeline</h3>
            <div className="space-y-4">
              {grant.timeline.map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-3 h-3 rounded-full mt-0.5 ${item.type === "payment" ? "bg-emerald-500" : item.type === "approved" ? "bg-blue-500" : "bg-slate-300"}`}
                    />
                    {i < grant.timeline.length - 1 && (
                      <div className="w-0.5 flex-1 bg-slate-200 mt-1" />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium text-slate-900">
                      {item.event}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(item.date).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    {item.amount && (
                      <p className="text-xs text-emerald-600 font-medium mt-0.5">
                        ${item.amount.toLocaleString()} released
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Milestones tab */}
      {activeTab === "milestones" && (
        <div className="space-y-4">
          {grant.milestones.map((ms, i) => (
            <div
              key={ms.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-slate-900">
                      {i + 1}. {ms.name}
                    </span>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[ms.status]}`}
                    >
                      {statusLabels[ms.status]}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{ms.description}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">{ms.percentage}%</p>
                  <p className="text-xs text-slate-400">
                    ${ms.amount?.toLocaleString()}
                  </p>
                </div>
              </div>
              {ms.verificationNeeded && (
                <p className="text-xs text-blue-600">
                  Requires approver verification
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Applications tab */}
      {activeTab === "applications" && (
        <div className="space-y-4">
          {grant.applications.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Users size={32} className="mx-auto mb-3 text-slate-300" />
              <p className="font-medium">No applications yet</p>
              <p className="text-sm">
                Applications will appear here once submitted.
              </p>
            </div>
          ) : (
            grant.applications.map((app) => (
              <div
                key={app.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {app.recipientName}
                  </p>
                  <p className="text-xs text-slate-500">
                    Submitted {new Date(app.submittedAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                    {app.proposal}
                  </p>
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
                  <Link
                    href={`/funder/grants/${grant.id}/applications/${app.id}`}
                    className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
                  >
                    Review
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
