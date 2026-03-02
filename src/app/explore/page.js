"use client";

import { useState } from "react";
import { mockGrants } from "@/lib/mockData";
import Link from "next/link";
import { Search, Filter } from "lucide-react";

const STATUS_CONFIG = {
  active: { label: "Active", color: "bg-emerald-100 text-emerald-700" },
  accepting_applications: { label: "Open", color: "bg-blue-100 text-blue-700" },
  completed: { label: "Completed", color: "bg-slate-100 text-slate-600" },
};

const CATEGORIES = [
  "All",
  "Arts & Culture",
  "Environment & Science",
  "Education",
  "Community Development",
  "Technology",
  "Economic Development",
];

export default function ExploreGrantsPage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = mockGrants.filter((g) => {
    const matchCat = activeCategory === "All" || g.category === activeCategory;
    const matchQ =
      !query ||
      g.title.toLowerCase().includes(query.toLowerCase()) ||
      g.funder.toLowerCase().includes(query.toLowerCase());
    const matchStatus = statusFilter === "all" || g.status === statusFilter;
    return matchCat && matchQ && matchStatus;
  });

  const totalFunded = mockGrants.reduce((s, g) => s + g.disbursed, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Public Grant Explorer
        </h1>
        <p className="text-slate-500 mb-4">
          Full transparency on all grants. Track every dollar.
        </p>
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="bg-slate-100 px-3 py-1 rounded-full text-slate-700 font-medium">
            {mockGrants.length} total grants
          </span>
          <span className="bg-emerald-100 px-3 py-1 rounded-full text-emerald-700 font-medium">
            ${totalFunded.toLocaleString()} disbursed
          </span>
          <span className="bg-blue-100 px-3 py-1 rounded-full text-blue-700 font-medium">
            {
              mockGrants.filter((g) => g.status === "accepting_applications")
                .length
            }{" "}
            open now
          </span>
        </div>
      </div>

      {/* Search and filter row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="Search grants or funders..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select
          className="border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="accepting_applications">Open</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 flex-wrap mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              activeCategory === cat
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <p className="text-sm text-slate-500 mb-5">
        {filtered.length} grants found
      </p>

      {/* Grants grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((grant) => {
          const disbursedPct =
            grant.totalBudget > 0
              ? Math.round((grant.disbursed / grant.totalBudget) * 100)
              : 0;
          const status = STATUS_CONFIG[grant.status] || STATUS_CONFIG.active;
          return (
            <div
              key={grant.id}
              className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${status.color}`}
                >
                  {status.label}
                </span>
                <span className="text-xs text-slate-400">{grant.currency}</span>
              </div>
              <h3 className="font-bold text-slate-900 mb-1">{grant.title}</h3>
              <p className="text-sm text-slate-500 mb-3">{grant.funder}</p>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-500">Total Budget</span>
                <span className="font-semibold">
                  ${grant.totalBudget.toLocaleString()}
                </span>
              </div>
              <div className="mb-4">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>{disbursedPct}% disbursed</span>
                  <span>{grant.recipientCount} recipients</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div
                    className="bg-blue-500 h-1.5 rounded-full"
                    style={{ width: `${disbursedPct}%` }}
                  />
                </div>
              </div>
              <Link
                href={`/explore/grants/${grant.id}`}
                className="mt-auto block text-center border border-slate-300 bg-white text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                View Timeline
              </Link>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-slate-500">
          <Filter size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="font-medium">No grants found.</p>
          <p className="text-sm">Try adjusting your filters.</p>
        </div>
      )}
    </div>
  );
}
