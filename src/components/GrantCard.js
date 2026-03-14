import Link from "next/link";
import { Clock, Users, CheckCircle, ArrowRight } from "lucide-react";

const STATUS_CONFIG = {
  active: { label: "Active", color: "bg-emerald-100 text-emerald-700" },
  accepting_applications: {
    label: "Accepting Applications",
    color: "bg-blue-100 text-blue-700",
  },
  completed: { label: "Completed", color: "bg-slate-100 text-slate-600" },
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700" },
};

export default function GrantCard({ grant, context = "explore", onApply }) {
  const grantIdentifier = grant.grantId || grant.id;
  const budget = grant.totalBudget || grant.budget || 0;
  const disbursed = grant.disbursed || 0;
  const milestones = grant.milestones || [];
  const disbursedPct = budget > 0 ? Math.round((disbursed / budget) * 100) : 0;
  const statusInfo = STATUS_CONFIG[grant.status] || STATUS_CONFIG.active;
  const completedMilestones = milestones.filter(
    (m) => m.status === "completed",
  ).length;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusInfo.color}`}
        >
          {statusInfo.label}
        </span>
        <span className="text-xs text-slate-400 font-mono">
          {grant.currency || ""}
        </span>
      </div>

      <h3 className="font-bold text-slate-900 text-base mb-1 leading-snug">
        {grant.title}
      </h3>
      <p className="text-sm text-slate-500 mb-3">{grant.funder}</p>
      <p className="text-sm text-slate-600 line-clamp-2 mb-4 flex-1">
        {grant.description}
      </p>

      <div className="space-y-3">
        {/* Budget */}
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Total Budget</span>
          <span className="font-semibold text-slate-900">
            ${budget.toLocaleString()}
          </span>
        </div>

        {/* Progress bar */}
        {grant.status !== "accepting_applications" && disbursedPct > 0 && (
          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Disbursed</span>
              <span>{disbursedPct}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5">
              <div
                className="bg-blue-500 h-1.5 rounded-full transition-all"
                style={{ width: `${disbursedPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
          {(grant.recipientCount != null || grant.applicationCount != null) && (
            <span className="flex items-center gap-1">
              <Users size={12} />
              {grant.applicationCount || grant.recipientCount || 0}
              {grant.maxRecipients ? `/${grant.maxRecipients}` : ""}{" "}
              {grant.applicationCount != null ? "applications" : "recipients"}
            </span>
          )}
          {milestones.length > 0 && (
            <span className="flex items-center gap-1">
              <CheckCircle size={12} />
              {completedMilestones}/{milestones.length} milestones
            </span>
          )}
          {(grant.applicationDeadline || grant.deadline) &&
            (grant.status === "accepting_applications" || !grant.status) && (
              <span className="flex items-center gap-1">
                <Clock size={12} />
                Due{" "}
                {new Date(
                  grant.applicationDeadline || grant.deadline,
                ).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
        <Link
          href={`/explore/grants/${grantIdentifier}`}
          className="flex-1 text-center border border-slate-300 bg-white text-slate-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
        >
          View Details
        </Link>
        {context === "recipient" &&
          (grant.status === "accepting_applications" || !grant.status) && (
            <Link
              href={`/recipient/grants/${grantIdentifier}`}
              className="flex-1 text-center bg-slate-900 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-1"
            >
              Apply <ArrowRight size={14} />
            </Link>
          )}
      </div>
    </div>
  );
}
