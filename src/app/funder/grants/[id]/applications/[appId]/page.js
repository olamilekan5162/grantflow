"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { mockGrants } from "@/lib/mockData";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  MessageSquare,
  FileText,
  Image,
} from "lucide-react";

export default function ReviewApplicationPage() {
  const { id, appId } = useParams();
  const router = useRouter();
  const grant = mockGrants.find((g) => g.id === id) || mockGrants[0];
  const application =
    grant.applications.find((a) => a.id === appId) || grant.applications[0];
  const [comments, setComments] = useState("");
  const [decision, setDecision] = useState(null);

  if (!application)
    return (
      <div className="p-8 text-center text-slate-500">
        Application not found.
      </div>
    );

  const handleDecision = (d) => {
    setDecision(d);
    setTimeout(() => router.push(`/funder/grants/${id}`), 1500);
  };

  const inputCls =
    "w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Review Application
          </h1>
          <p className="text-slate-500 mt-1">{grant.title}</p>
        </div>
        <span
          className={`text-sm font-medium px-3 py-1 rounded-full ${
            application.status === "approved"
              ? "bg-emerald-100 text-emerald-700"
              : application.status === "pending"
                ? "bg-amber-100 text-amber-700"
                : "bg-red-100 text-red-700"
          }`}
        >
          {application.status.charAt(0).toUpperCase() +
            application.status.slice(1)}
        </span>
      </div>

      {decision && (
        <div
          className={`mb-6 p-4 rounded-xl border ${
            decision === "approved"
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : decision === "rejected"
                ? "bg-red-50 border-red-200 text-red-700"
                : "bg-amber-50 border-amber-200 text-amber-700"
          }`}
        >
          <p className="font-medium">
            {decision === "approved"
              ? "✅ Application approved! Redirecting..."
              : decision === "rejected"
                ? "❌ Application rejected. Redirecting..."
                : "📬 Revision requested. Redirecting..."}
          </p>
        </div>
      )}

      <div className="space-y-6">
        {/* Applicant info */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-4">
            Applicant Details
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
              {application.recipientName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-slate-900">
                {application.recipientName}
              </p>
              <p className="text-sm text-slate-500">
                Submitted{" "}
                {new Date(application.submittedAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Proposal */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <FileText size={16} className="text-slate-400" /> Project Proposal
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            {application.proposal}
          </p>
        </div>

        {/* Budget preview (dummy) */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-4">Budget Preview</h2>
          <div className="space-y-2">
            {[
              ["Materials", "$8,500"],
              ["Labor", "$12,000"],
              ["Equipment rental", "$3,200"],
              ["Contingency (5%)", "$1,300"],
            ].map(([k, v]) => (
              <div
                key={k}
                className="flex justify-between text-sm border-b border-slate-50 pb-2"
              >
                <span className="text-slate-600">{k}</span>
                <span className="font-medium text-slate-900">{v}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm font-bold">
              <span>Total</span>
              <span>$25,000</span>
            </div>
          </div>
        </div>

        {/* Portfolio (dummy thumbnails) */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Image size={16} className="text-slate-400" /> Portfolio
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center"
              >
                <Image size={24} className="text-slate-300" />
              </div>
            ))}
          </div>
        </div>

        {/* Comments */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <MessageSquare size={16} className="text-slate-400" /> Comments to
            Applicant
          </h2>
          <textarea
            className={`${inputCls} h-28 resize-none`}
            placeholder="Optional comments or feedback for the applicant..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />
        </div>

        {/* Decision */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => handleDecision("approved")}
            className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 text-white px-5 py-3 rounded-xl font-semibold hover:bg-emerald-600 transition-colors"
          >
            <CheckCircle size={18} /> Approve Application
          </button>
          <button
            onClick={() => handleDecision("revisions")}
            className="flex-1 flex items-center justify-center gap-2 bg-amber-500 text-white px-5 py-3 rounded-xl font-semibold hover:bg-amber-600 transition-colors"
          >
            📬 Request More Info
          </button>
          <button
            onClick={() => handleDecision("rejected")}
            className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white px-5 py-3 rounded-xl font-semibold hover:bg-red-600 transition-colors"
          >
            <XCircle size={18} /> Reject
          </button>
        </div>
      </div>
    </div>
  );
}
