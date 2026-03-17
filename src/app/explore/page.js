"use client";

import { useState, useEffect } from "react";
import { useGrantFlow } from "@/hooks/useGrantFlow";
import Link from "next/link";
import { Search, Filter, Loader2 } from "lucide-react";

const STATUS_CONFIG = {
  active: { label: "Active", color: "bg-emerald-100 text-emerald-700" },
  accepting_applications: {
    label: "Open",
    color: "bg-blue-100 text-blue-700",
  },
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
  const { loadAllGrants, loading } = useGrantFlow();
  const [grants, setGrants] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    async function loadData() {
      const allGrants = await loadAllGrants();
      if (allGrants) setGrants(allGrants);
      setDataLoaded(true);
    }
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const filtered = grants.filter((g) => {
    const matchCat = activeCategory === "All" || g.category === activeCategory;
    const matchQ =
      !query ||
      (g.title || "").toLowerCase().includes(query.toLowerCase()) ||
      (g.funder || "").toLowerCase().includes(query.toLowerCase());
    const matchStatus = statusFilter === "all" || g.status === statusFilter;
    return matchCat && matchQ && matchStatus;
  });

  const totalBudget = grants.reduce(
    (s, g) => s + (g.totalBudget || g.budget || 0),
    0,
  );

  if (loading && !dataLoaded) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center gap-3">
        <Loader2 size={32} className="animate-spin text-blue-500" />
        <p className="text-slate-500">Loading grants...</p>
      </div>
    );
  }

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
            {grants.length} total grants
          </span>
          <span className="bg-emerald-100 px-3 py-1 rounded-full text-emerald-700 font-medium">
            ${totalBudget.toLocaleString()} committed
          </span>
          <span className="bg-blue-100 px-3 py-1 rounded-full text-blue-700 font-medium">
            {grants.filter((g) => g.applicationCount > 0).length} with
            applications
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
          const budget = grant.totalBudget || grant.budget || 0;
          const grantId = grant.grantId || grant.id;
          return (
            <div
              key={grantId}
              className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    STATUS_CONFIG[grant.status]?.color ||
                    STATUS_CONFIG.active.color
                  }`}
                >
                  {STATUS_CONFIG[grant.status]?.label || "Active"}
                </span>
                <span className="text-xs text-slate-400">
                  {grant.currency || "HBAR"}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 mb-1">{grant.title}</h3>
              <p className="text-sm text-slate-500 mb-3">{grant.funder}</p>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-500">Total Budget</span>
                <span className="font-semibold">
                  ${budget.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                <span>
                  {grant.applicationCount || 0} application
                  {(grant.applicationCount || 0) !== 1 ? "s" : ""}
                </span>
                <span>
                  {(grant.milestones || []).length} milestone
                  {(grant.milestones || []).length !== 1 ? "s" : ""}
                </span>
              </div>
              <Link
                href={`/explore/grants/${grantId}`}
                className="mt-auto block text-center border border-slate-300 bg-white text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                View Timeline
              </Link>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && dataLoaded && (
        <div className="text-center py-20 text-slate-500">
          <Filter size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="font-medium">No grants found.</p>
          <p className="text-sm">Try adjusting your filters.</p>
        </div>
      )}
    </div>
  );
}
