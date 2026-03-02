"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { mockGrants } from "@/lib/mockData";
import Link from "next/link";
import FileUpload from "@/components/FileUpload";
import { ArrowLeft, CheckCircle } from "lucide-react";

export default function GrantDetailsApplyPage() {
  const { id } = useParams();
  const router = useRouter();
  const grant = mockGrants.find((g) => g.id === id) || mockGrants[0];
  const [applying, setApplying] = useState(false);
  const [proposal, setProposal] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => router.push("/recipient/dashboard"), 2000);
  };

  const inputCls =
    "w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Grants
      </button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Grant details */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                {grant.category}
              </span>
              <span className="text-xs text-slate-400">{grant.currency}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">
              {grant.title}
            </h1>
            <p className="text-slate-500">Funded by {grant.funder}</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-6">
            <h2 className="font-semibold text-slate-900 mb-3">
              About this Grant
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {grant.description}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-6">
            <h2 className="font-semibold text-slate-900 mb-4">Milestones</h2>
            <div className="space-y-3">
              {grant.milestones.map((ms, i) => (
                <div
                  key={ms.id}
                  className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
                >
                  <div>
                    <span className="text-sm font-medium text-slate-900">
                      {i + 1}. {ms.name}
                    </span>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {ms.description}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-slate-900 ml-4">
                    {ms.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {grant.requirements.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-6">
              <h2 className="font-semibold text-slate-900 mb-3">
                Requirements
              </h2>
              <ul className="space-y-2">
                {grant.requirements.map((req) => (
                  <li
                    key={req}
                    className="flex items-center gap-2 text-sm text-slate-600"
                  >
                    <CheckCircle
                      size={14}
                      className="text-emerald-500 shrink-0"
                    />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!applying && !submitted && (
            <button
              onClick={() => setApplying(true)}
              className="w-full bg-slate-900 text-white px-6 py-3.5 rounded-xl text-base font-semibold hover:bg-slate-800 transition-colors"
            >
              Start Application
            </button>
          )}

          {/* Application Form */}
          {applying && !submitted && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
              <h2 className="font-semibold text-slate-900">Your Application</h2>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Project Proposal <span className="text-red-500">*</span>
                </label>
                <textarea
                  className={`${inputCls} h-40 resize-none`}
                  placeholder="Describe your project, its goals, and how it meets the grant requirements..."
                  value={proposal}
                  onChange={(e) => setProposal(e.target.value)}
                />
              </div>
              {grant.requirements.includes("Budget breakdown") && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Budget Breakdown
                  </label>
                  <FileUpload
                    label="Upload budget document"
                    multiple={false}
                    accept=".pdf,.xlsx,.csv"
                  />
                </div>
              )}
              {grant.requirements.includes("Portfolio samples") && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Portfolio Samples
                  </label>
                  <FileUpload
                    label="Upload portfolio files"
                    multiple
                    accept="image/*,.pdf"
                  />
                </div>
              )}
              <div className="flex gap-3">
                <button className="border border-slate-300 bg-white text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                  Save Draft
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
                >
                  Submit Application
                </button>
              </div>
            </div>
          )}

          {submitted && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
              <CheckCircle
                size={32}
                className="text-emerald-500 mx-auto mb-3"
              />
              <p className="font-semibold text-emerald-700">
                Application submitted!
              </p>
              <p className="text-sm text-emerald-600">
                Redirecting to dashboard...
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-4">Grant Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Total Budget</span>
                <span className="font-semibold">
                  ${grant.totalBudget.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Currency</span>
                <span className="font-semibold">{grant.currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Deadline</span>
                <span className="font-semibold">
                  {new Date(grant.applicationDeadline).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Max Recipients</span>
                <span className="font-semibold">{grant.maxRecipients}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Milestones</span>
                <span className="font-semibold">{grant.milestones.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <p className="text-sm text-blue-800 font-medium">
              💡 How Payment Works
            </p>
            <p className="text-xs text-blue-700 mt-2 leading-relaxed">
              Funds are released automatically when each milestone is verified.
              No waiting for bank transfers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
