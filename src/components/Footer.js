import Link from "next/link";
import { Zap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Zap size={16} className="text-white" />
              </div>
              <span className="font-bold text-white text-lg">GrantFlow</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              Transparent grant funding powered by smart contracts. Every dollar
              tracked, every milestone verified.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4 text-slate-300 uppercase tracking-wide">
              Platform
            </h4>
            <ul className="space-y-2">
              {[
                ["Explore Grants", "/explore"],
                ["How It Works", "/"],
                ["For Funders", "/onboarding/role"],
                ["For Recipients", "/onboarding/role"],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-slate-400 hover:text-white text-sm transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4 text-slate-300 uppercase tracking-wide">
              Resources
            </h4>
            <ul className="space-y-2">
              {[
                "Documentation",
                "API Reference",
                "Smart Contracts",
                "Security",
              ].map((label) => (
                <li key={label}>
                  <span className="text-slate-400 text-sm cursor-pointer hover:text-white transition-colors">
                    {label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4 text-slate-300 uppercase tracking-wide">
              Company
            </h4>
            <ul className="space-y-2">
              {["About", "Blog", "Careers", "Contact"].map((label) => (
                <li key={label}>
                  <span className="text-slate-400 text-sm cursor-pointer hover:text-white transition-colors">
                    {label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            © 2025 GrantFlow. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(
              (label) => (
                <span
                  key={label}
                  className="text-slate-500 hover:text-slate-300 text-sm cursor-pointer transition-colors"
                >
                  {label}
                </span>
              ),
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
