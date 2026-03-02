"use client";

import { useParams, useRouter } from "next/navigation";
import { mockRecipients, mockGrants } from "@/lib/mockData";
import Link from "next/link";
import { ArrowLeft, Star, Globe, MapPin } from "lucide-react";

export default function PublicRecipientProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const recipient =
    mockRecipients.find((r) => r.id === id) || mockRecipients[0];

  // Find grants this recipient has received
  const receivedGrants = mockGrants.filter((g) =>
    g.applications.some(
      (a) => a.recipientId === recipient.id && a.status === "approved",
    ),
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile sidebar */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-2xl mx-auto mb-4">
              {recipient.avatar}
            </div>
            <h1 className="text-xl font-bold text-slate-900 text-center mb-1">
              {recipient.name}
            </h1>
            <p className="text-sm text-slate-500 text-center mb-1">
              {recipient.type}
            </p>
            <div className="flex items-center justify-center gap-1 text-sm text-slate-500 mb-4">
              <MapPin size={13} /> {recipient.location}
            </div>
            {/* Verification score */}
            <div className="flex items-center justify-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  size={16}
                  className={
                    n <= Math.floor(recipient.verificationScore)
                      ? "text-amber-400 fill-amber-400"
                      : "text-slate-300"
                  }
                />
              ))}
              <span className="text-sm font-bold text-slate-700 ml-1">
                {recipient.verificationScore}
              </span>
            </div>
            {recipient.website && (
              <a
                href={recipient.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 text-blue-600 hover:underline text-sm"
              >
                <Globe size={13} /> Website
              </a>
            )}
          </div>

          {/* Stats */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="font-semibold text-slate-900">Funding Overview</h3>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Total Received</span>
              <span className="font-bold text-emerald-600">
                ${recipient.totalEarned.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Grants Completed</span>
              <span className="font-bold">{recipient.completedGrants}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Verification Score</span>
              <span className="font-bold">
                {recipient.verificationScore}/5.0
              </span>
            </div>
          </div>

          {/* Categories */}
          {recipient.categories.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-3">Focus Areas</h3>
              <div className="flex flex-wrap gap-2">
                {recipient.categories.map((cat) => (
                  <span
                    key={cat}
                    className="bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bio */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h2 className="font-semibold text-slate-900 mb-3">About</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {recipient.bio}
            </p>
          </div>

          {/* Grants received */}
          <div>
            <h2 className="font-semibold text-slate-900 mb-4">
              Grants Received
            </h2>
            <div className="space-y-4">
              {receivedGrants.length === 0 ? (
                <p className="text-sm text-slate-400 italic">
                  No grants received yet.
                </p>
              ) : (
                receivedGrants.map((grant) => {
                  const app = grant.applications.find(
                    (a) => a.recipientId === recipient.id,
                  );
                  const completedMs = grant.milestones.filter(
                    (m) => m.status === "completed",
                  ).length;
                  const pct =
                    grant.totalBudget > 0
                      ? Math.round((grant.disbursed / grant.totalBudget) * 100)
                      : 0;
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
                          <p className="text-xs text-slate-500">
                            {grant.funder}
                          </p>
                        </div>
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                            grant.status === "active"
                              ? "bg-emerald-100 text-emerald-700"
                              : grant.status === "completed"
                                ? "bg-slate-100 text-slate-600"
                                : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {grant.status === "accepting_applications"
                            ? "Open"
                            : grant.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                        <span>
                          {completedMs}/{grant.milestones.length} milestones
                          completed
                        </span>
                        <span className="font-bold text-slate-700">
                          ${grant.disbursed.toLocaleString()} received
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 mb-3">
                        <div
                          className="bg-emerald-500 h-1.5 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <Link
                        href={`/explore/grants/${grant.id}`}
                        className="text-xs text-blue-600 hover:underline font-medium"
                      >
                        View grant →
                      </Link>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Past work gallery (dummy) */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h2 className="font-semibold text-slate-900 mb-4">Past Work</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                "from-violet-100 to-purple-200",
                "from-blue-100 to-cyan-200",
                "from-emerald-100 to-teal-200",
                "from-amber-100 to-orange-200",
                "from-pink-100 to-rose-200",
                "from-slate-100 to-slate-200",
              ].map((cls, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-xl bg-gradient-to-br ${cls} cursor-pointer hover:opacity-80 transition-opacity`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
