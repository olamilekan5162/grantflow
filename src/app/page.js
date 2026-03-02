"use client";

import { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { mockGrants } from "@/lib/mockData";
import {
  ArrowRight,
  CheckCircle,
  Eye,
  Zap,
  Shield,
  TrendingUp,
  Clock,
  Users,
} from "lucide-react";

const STATS = [
  { value: "$2.5M+", label: "Total Funded" },
  { value: "147", label: "Active Grants" },
  { value: "89", label: "Organizations" },
  { value: "423", label: "Recipients Paid" },
];

const HOW_IT_WORKS = [
  {
    icon: Shield,
    title: "Funder Creates Grant",
    desc: "Define milestones, budget, and requirements. Funds held in smart contract escrow.",
  },
  {
    icon: CheckCircle,
    title: "Recipients Apply & Work",
    desc: "Artists, nonprofits, and researchers apply and submit proof when each milestone is complete.",
  },
  {
    icon: Zap,
    title: "Instant Payment",
    desc: "Verified milestones trigger automatic payment. No waiting, no paperwork, full transparency.",
  },
];

const TRUSTED_ORGS = [
  "City of Austin",
  "Texas Environmental Foundation",
  "EduFirst Foundation",
  "Travis County Heritage Fund",
  "Austin Parks Foundation",
  "Humanities Texas",
];

const FEATURED_GRANT_IDS = ["g1", "g2", "g3"];

export default function LandingPage() {
  const { setShowWalletModal, isConnected } = useApp();
  const featuredGrants = mockGrants.filter((g) =>
    FEATURED_GRANT_IDS.includes(g.id),
  );

  return (
    <div>
      {/* Hero */}
      <section className="bg-slate-900 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 text-sm font-medium px-4 py-2 rounded-full mb-8 border border-blue-500/30">
            <Zap size={14} /> Now live on Hedera Mainnet
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight mb-6">
            Transparent Funding
            <br />
            <span className="text-blue-400">for Public Goods</span>
          </h1>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            See exactly where every dollar goes. Get paid instantly when work is
            done. No middlemen. Full accountability.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/explore"
              className="bg-blue-500 text-white px-8 py-4 rounded-xl text-base font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              Explore Grants <ArrowRight size={18} />
            </Link>
            {!isConnected && (
              <button
                onClick={() => setShowWalletModal(true)}
                className="border border-white/30 bg-white/10 text-white px-8 py-4 rounded-xl text-base font-semibold hover:bg-white/20 transition-colors"
              >
                Connect Wallet
              </button>
            )}
          </div>
          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <div className="text-3xl font-bold text-white mb-1">
                  {value}
                </div>
                <div className="text-sm text-slate-400">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-slate-500 text-lg">
              Smart contracts automate trust at every step
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={i}
                className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center"
              >
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon size={24} className="text-blue-600" />
                </div>
                <div className="text-xs font-bold text-blue-600 mb-2 uppercase tracking-wider">
                  Step {i + 1}
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-3">
                  {title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Grants */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">
                Featured Grants
              </h2>
              <p className="text-slate-500">
                Active opportunities for creators and organizations
              </p>
            </div>
            <Link
              href="/explore"
              className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredGrants.map((grant) => (
              <FeaturedGrantCard key={grant.id} grant={grant} />
            ))}
          </div>
        </div>
      </section>

      {/* Trusted By */}
      <section className="py-16 px-4 bg-slate-50 border-y border-slate-200">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-8">
            Trusted by leading organizations
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {TRUSTED_ORGS.map((org) => (
              <div
                key={org}
                className="bg-white border border-slate-200 rounded-lg px-5 py-3 text-sm font-medium text-slate-600 shadow-sm"
              >
                {org}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-6">
            Ready to get started?
          </h2>
          <p className="text-slate-500 text-lg mb-10">
            Join hundreds of funders and recipients using GrantFlow today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/onboarding/role"
              className="bg-slate-900 text-white px-8 py-4 rounded-xl text-base font-semibold hover:bg-slate-800 transition-colors"
            >
              Get Started Free
            </Link>
            <Link
              href="/explore"
              className="border border-slate-300 bg-white text-slate-700 px-8 py-4 rounded-xl text-base font-semibold hover:bg-slate-50 transition-colors"
            >
              Browse Grants
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeaturedGrantCard({ grant }) {
  const disbursedPct =
    grant.totalBudget > 0
      ? Math.round((grant.disbursed / grant.totalBudget) * 100)
      : 0;
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
          {grant.category}
        </span>
        <span className="text-xs text-slate-400">{grant.currency}</span>
      </div>
      <h3 className="font-bold text-slate-900 mb-1">{grant.title}</h3>
      <p className="text-sm text-slate-500 mb-3">{grant.funder}</p>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-slate-500">Budget</span>
        <span className="font-semibold text-slate-900">
          ${grant.totalBudget.toLocaleString()}
        </span>
      </div>
      {disbursedPct > 0 && (
        <div className="mb-4">
          <div className="w-full bg-slate-100 rounded-full h-1.5">
            <div
              className="bg-blue-500 h-1.5 rounded-full"
              style={{ width: `${disbursedPct}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {disbursedPct}% disbursed
          </p>
        </div>
      )}
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
        <Clock size={12} />
        <span>
          Deadline:{" "}
          {new Date(grant.applicationDeadline).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>
      <Link
        href={`/explore/grants/${grant.id}`}
        className="mt-auto block text-center bg-slate-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
      >
        View Grant
      </Link>
    </div>
  );
}
