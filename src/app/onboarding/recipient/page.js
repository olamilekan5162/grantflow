"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Camera } from "lucide-react";

const CATEGORIES = [
  "Murals",
  "Community Art",
  "Education",
  "Digital Art",
  "Research",
  "Environment",
];

export default function RecipientProfilePage() {
  const { setUserProfile, setOnboardingComplete } = useApp();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    type: "",
    location: "",
    website: "",
    bio: "",
    instagram: "",
    twitter: "",
  });
  const [categories, setCategories] = useState([]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const toggleCat = (c) =>
    setCategories((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );

  const handleSave = () => {
    setUserProfile({ ...form, categories, role: "recipient" });
    setOnboardingComplete(true);
    router.push("/onboarding/success");
  };

  const inputCls =
    "w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all";
  const labelCls = "block text-sm font-medium text-slate-700 mb-1.5";

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
          <span className="bg-blue-500 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold">
            2
          </span>
          <span>Recipient Profile</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Set up your profile
        </h1>
        <p className="text-slate-500 text-sm">
          Help funders learn about your work.
        </p>
      </div>

      <div className="space-y-5">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center border-2 border-dashed border-slate-300 cursor-pointer hover:bg-slate-200 transition-colors">
            <Camera size={20} className="text-slate-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">Profile Photo</p>
            <p className="text-xs text-slate-500">Click to upload</p>
          </div>
        </div>

        <div>
          <label className={labelCls}>
            Name / Organization <span className="text-red-500">*</span>
          </label>
          <input
            className={inputCls}
            placeholder="Your name or organization"
            value={form.name}
            onChange={set("name")}
          />
        </div>

        <div>
          <label className={labelCls}>Profile Type</label>
          <select className={inputCls} value={form.type} onChange={set("type")}>
            <option value="">Select type...</option>
            <option>Individual Artist</option>
            <option>Nonprofit</option>
            <option>Small Business</option>
            <option>Researcher</option>
            <option>Other</option>
          </select>
        </div>

        <div>
          <label className={labelCls}>
            Location <span className="text-red-500">*</span>
          </label>
          <input
            className={inputCls}
            placeholder="City, State"
            value={form.location}
            onChange={set("location")}
          />
        </div>

        <div>
          <label className={labelCls}>Website / Portfolio</label>
          <input
            className={inputCls}
            placeholder="https://"
            value={form.website}
            onChange={set("website")}
          />
        </div>

        <div>
          <label className={labelCls}>Bio / Statement</label>
          <textarea
            className={`${inputCls} h-28 resize-none`}
            placeholder="Tell funders about your work and mission..."
            value={form.bio}
            onChange={set("bio")}
          />
        </div>

        <div>
          <label className={labelCls}>Categories</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCat(cat)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  categories.includes(cat)
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-slate-700 border-slate-200 hover:border-blue-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Instagram</label>
            <input
              className={inputCls}
              placeholder="@handle"
              value={form.instagram}
              onChange={set("instagram")}
            />
          </div>
          <div>
            <label className={labelCls}>Twitter / X</label>
            <input
              className={inputCls}
              placeholder="@handle"
              value={form.twitter}
              onChange={set("twitter")}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => router.push("/onboarding/success")}
            className="border border-slate-300 bg-white text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Skip for Now
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
}
