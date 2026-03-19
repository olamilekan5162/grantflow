"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { useGrantFlow } from "@/hooks/useGrantFlow";
import GrantCard from "@/components/GrantCard";
import { Search, Loader2 } from "lucide-react";

const CATEGORIES = [
  "All",
  "Arts & Culture",
  "Environment & Science",
  "Education",
  "Community Development",
  "Technology",
  "Economic Development",
];

export default function BrowseGrantsPage() {
  const { account } = useApp();
  const { loadAvailableGrants, loading } = useGrantFlow();
  const [grants, setGrants] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    async function loadData() {
      const available = await loadAvailableGrants();
      if (available) setGrants(available);
      setDataLoaded(true);
    }
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [account]);

  const filtered = grants.filter((g) => {
    const matchCat = activeCategory === "All" || g.category === activeCategory;
    const matchQ =
      !query ||
      (g.title || "").toLowerCase().includes(query.toLowerCase()) ||
      (g.funder || "").toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQ;
  });

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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Browse Grants
        </h1>
        <p className="text-slate-500">
          Find opportunities that match your skills and interests
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          placeholder="Search grants by title or funder..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Category pills */}
      <div className="flex gap-2 flex-wrap mb-8">
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

      <p className="text-sm text-slate-500 mb-4">
        {filtered.length} grants found
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((grant) => (
          <GrantCard key={grant.grantId} grant={grant} context="recipient" />
        ))}
      </div>

      {filtered.length === 0 && dataLoaded && (
        <div className="text-center py-20 text-slate-500">
          <p className="font-medium">No grants match your search.</p>
          <p className="text-sm">Try adjusting your filters.</p>
        </div>
      )}
    </div>
  );
}
