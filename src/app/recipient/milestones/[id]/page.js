"use client";

import { useParams, useRouter } from "next/navigation";
import { mockGrants } from "@/lib/mockData";
import { ArrowLeft, CheckCircle, Clock, AlertCircle, Lock } from "lucide-react";

const STATUS_ICON = {
  completed: <CheckCircle size={20} className="text-emerald-500" />,
  in_review: <Clock size={20} className="text-amber-500" />,
  pending: <AlertCircle size={20} className="text-blue-500" />,
  locked: <Lock size={20} className="text-slate-300" />,
};

const STATUS_LABEL = {
  completed: "✅ Completed",
  in_review: "🔄 Under Review",
  pending: "⏰ Pending Submission",
  locked: "⏳ Locked",
};

export default function MilestoneStatusPage() {
  const { id } = useParams();
  const router = useRouter();
  // find the grant that has this milestone
  const grant =
    mockGrants.find((g) => g.milestones.some((m) => m.id === id)) ||
    mockGrants[0];
  const milestones = grant.milestones;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">
          Milestone Progress
        </h1>
        <p className="text-slate-500">{grant.title}</p>
      </div>

      {/* Overall progress */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm mb-8">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-600">Overall</span>
          <span className="font-bold">
            {milestones.filter((m) => m.status === "completed").length}/
            {milestones.length} complete
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3">
          <div
            className="bg-emerald-500 h-3 rounded-full transition-all"
            style={{
              width: `${(milestones.filter((m) => m.status === "completed").length / milestones.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Milestones timeline */}
      <div className="space-y-4">
        {milestones.map((ms, i) => (
          <div key={ms.id} className="relative">
            {i < milestones.length - 1 && (
              <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-slate-200" />
            )}
            <div
              className={`bg-white border rounded-xl p-5 shadow-sm ${
                ms.status === "locked"
                  ? "border-slate-100 opacity-60"
                  : ms.status === "completed"
                    ? "border-emerald-200"
                    : ms.status === "in_review"
                      ? "border-amber-200"
                      : "border-slate-200"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0 mt-0.5">{STATUS_ICON[ms.status]}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900">{ms.name}</h3>
                    <span className="text-sm font-bold text-slate-900">
                      ${ms.amount?.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {STATUS_LABEL[ms.status]}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {ms.description}
                  </p>
                  {ms.status === "in_review" && (
                    <p className="text-xs text-amber-600 mt-2 font-medium">
                      Awaiting verifier review
                    </p>
                  )}
                  {ms.status === "pending" && (
                    <a
                      href={`/recipient/grants/${grant.id}/milestones/${ms.id}`}
                      className="mt-3 inline-block bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors"
                    >
                      Submit Proof
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
