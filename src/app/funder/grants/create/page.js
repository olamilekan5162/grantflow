"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { submitGrant } from "@/utils/submissionHelpers";
import { Plus, Trash2, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";

const STEPS = ["Basics", "Milestones", "Recipients", "Review & Deposit"];

const INITIAL_MILESTONE = {
  name: "",
  percentage: "",
  verificationType: "self",
  verifier: "",
  description: "",
};

export default function CreateGrantPage() {
  const router = useRouter();
  const { account, balance } = useApp();
  const [submitError, setSubmitError] = useState("");
  const [step, setStep] = useState(0);

  // Step 1 state
  const [basics, setBasics] = useState({
    title: "",
    description: "",
    category: "",
    budget: "",
    currency: "HBAR",
    deadline: "",
  });
  // Step 2 state
  const [milestones, setMilestones] = useState([{ ...INITIAL_MILESTONE }]);
  // Step 3 state
  const [recipientType, setRecipientType] = useState("open");
  const [numAwards, setNumAwards] = useState("");
  const [inviteAddress, setInviteAddress] = useState("");
  const [inviteList, setInviteList] = useState([]);
  const [requirements, setRequirements] = useState([]);
  // Step 4 deposit simulation
  const [depositing, setDepositing] = useState(false);
  const [launched, setLaunched] = useState(false);

  const setBasic = (k) => (e) =>
    setBasics((b) => ({ ...b, [k]: e.target.value }));

  const addMilestone = () =>
    setMilestones((m) => [...m, { ...INITIAL_MILESTONE }]);
  const removeMilestone = (i) =>
    setMilestones((m) => m.filter((_, idx) => idx !== i));
  const setMilestone = (i, k) => (e) =>
    setMilestones((m) =>
      m.map((ms, idx) => (idx === i ? { ...ms, [k]: e.target.value } : ms)),
    );

  const totalPct = milestones.reduce(
    (s, m) => s + Number(m.percentage || 0),
    0,
  );

  const toggleReq = (r) =>
    setRequirements((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r],
    );

  const handleDeposit = async () => {
    setDepositing(true);
    setSubmitError("");
    try {
      const grantData = {
        title: basics.title,
        description: basics.description,
        category: basics.category,
        budget: Number(basics.budget),
        totalBudget: Number(basics.budget),
        currency: basics.currency,
        deadline: basics.deadline,
        milestones: milestones.map((ms, i) => ({
          name: ms.name,
          percentage: Number(ms.percentage),
          amount: Math.round(
            (Number(basics.budget) * Number(ms.percentage)) / 100,
          ),
          verificationType: ms.verificationType,
          verifier: ms.verifier,
          description: ms.description,
          index: i,
        })),
        recipientType,
        maxRecipients: numAwards ? Number(numAwards) : null,
        inviteList: recipientType === "invite" ? inviteList : [],
        requirements,
      };

      await submitGrant(account, grantData);

      setLaunched(true);
      setTimeout(() => router.push("/funder/dashboard"), 1500);
    } catch (err) {
      console.error("Grant submission failed:", err);
      setSubmitError(
        err.message || "Failed to submit grant. Please try again.",
      );
    } finally {
      setDepositing(false);
    }
  };

  const inputCls =
    "w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all";
  const labelCls = "block text-sm font-medium text-slate-700 mb-1.5";

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Progress */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-2">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-1 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  i < step
                    ? "bg-emerald-500 text-white"
                    : i === step
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-400"
                }`}
              >
                {i < step ? "✓" : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-1 ${i < step ? "bg-emerald-500" : "bg-slate-200"}`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {STEPS.map((s, i) => (
            <span
              key={i}
              className={`text-xs ${i === step ? "text-slate-900 font-medium" : "text-slate-400"}`}
              style={{
                width: `${100 / STEPS.length}%`,
                textAlign:
                  i === 0
                    ? "left"
                    : i === STEPS.length - 1
                      ? "right"
                      : "center",
              }}
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Step 1 */}
      {step === 0 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">
              Grant Basics
            </h2>
            <p className="text-slate-500 text-sm">
              Describe what you're funding and how much.
            </p>
          </div>
          <div>
            <label className={labelCls}>
              Grant Title <span className="text-red-500">*</span>
            </label>
            <input
              className={inputCls}
              placeholder="e.g., Downtown Mural Initiative 2025"
              value={basics.title}
              onChange={setBasic("title")}
            />
          </div>
          <div>
            <label className={labelCls}>
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              className={`${inputCls} h-32 resize-none`}
              placeholder="Describe the grant goals, requirements, and ideal recipient..."
              value={basics.description}
              onChange={setBasic("description")}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Category</label>
              <select
                className={inputCls}
                value={basics.category}
                onChange={setBasic("category")}
              >
                <option value="">Select...</option>
                <option>Arts & Culture</option>
                <option>Environment & Science</option>
                <option>Education</option>
                <option>Community Development</option>
                <option>Technology</option>
                <option>Economic Development</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Application Deadline</label>
              <input
                type="date"
                className={inputCls}
                value={basics.deadline}
                onChange={setBasic("deadline")}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                Total Budget <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                className={inputCls}
                placeholder="e.g., 75000"
                value={basics.budget}
                onChange={setBasic("budget")}
              />
            </div>
            <div>
              <label className={labelCls}>Currency</label>
              <div className="flex gap-3 mt-2">
                {["HBAR", "USD"].map((c) => (
                  <label
                    key={c}
                    className="flex items-center gap-1.5 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="currency"
                      value={c}
                      checked={basics.currency === c}
                      onChange={setBasic("currency")}
                      className="accent-blue-500"
                    />
                    <span className="text-sm text-slate-700">{c}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">
              Define Milestones
            </h2>
            <p className="text-slate-500 text-sm">
              Break the grant into verifiable payment stages.
            </p>
          </div>
          {milestones.map((ms, i) => (
            <div
              key={i}
              className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">
                  Milestone {i + 1}
                </span>
                {milestones.length > 1 && (
                  <button
                    onClick={() => removeMilestone(i)}
                    className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Name</label>
                  <input
                    className={inputCls}
                    placeholder="e.g., Design Approval"
                    value={ms.name}
                    onChange={setMilestone(i, "name")}
                  />
                </div>
                <div>
                  <label className={labelCls}>% of Budget</label>
                  <input
                    type="number"
                    className={inputCls}
                    placeholder="e.g., 25"
                    value={ms.percentage}
                    onChange={setMilestone(i, "percentage")}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>Verification Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      checked={ms.verificationType === "self"}
                      onChange={() =>
                        setMilestone(
                          i,
                          "verificationType",
                        )({ target: { value: "self" } })
                      }
                      className="accent-blue-500"
                    />
                    <span className="text-sm text-slate-700">
                      Self-verified
                    </span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      checked={ms.verificationType === "approver"}
                      onChange={() =>
                        setMilestone(
                          i,
                          "verificationType",
                        )({ target: { value: "approver" } })
                      }
                      className="accent-blue-500"
                    />
                    <span className="text-sm text-slate-700">
                      Needs Approver
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className={labelCls}>Description</label>
                <textarea
                  className={`${inputCls} h-20 resize-none`}
                  placeholder="What must be completed for this milestone?"
                  value={ms.description}
                  onChange={setMilestone(i, "description")}
                />
              </div>
            </div>
          ))}

          <button
            onClick={addMilestone}
            className="w-full border-2 border-dashed border-slate-300 text-slate-500 rounded-xl py-3 text-sm font-medium hover:border-blue-400 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={16} /> Add Milestone
          </button>

          <div
            className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium ${totalPct === 100 ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : totalPct > 100 ? "bg-red-50 text-red-700 border border-red-200" : "bg-slate-50 text-slate-600 border border-slate-200"}`}
          >
            <span>Total Percentage</span>
            <span>
              {totalPct}%{" "}
              {totalPct === 100
                ? "✓"
                : totalPct > 100
                  ? "(exceeds 100%)"
                  : "(must equal 100%)"}
            </span>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 2 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">
              Recipients
            </h2>
            <p className="text-slate-500 text-sm">
              Define who can apply and what they need to submit.
            </p>
          </div>
          <div>
            <label className={labelCls}>Recipient Type</label>
            <div className="flex gap-4">
              {[
                ["open", "Open call (anyone)"],
                ["invite", "Invite only"],
              ].map(([val, label]) => (
                <label
                  key={val}
                  className="flex items-center gap-1.5 cursor-pointer"
                >
                  <input
                    type="radio"
                    checked={recipientType === val}
                    onChange={() => setRecipientType(val)}
                    className="accent-blue-500"
                  />
                  <span className="text-sm text-slate-700">{label}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className={labelCls}>Number of Awards</label>
            <input
              type="number"
              className={inputCls}
              placeholder="Max number of recipients"
              value={numAwards}
              onChange={(e) => setNumAwards(e.target.value)}
            />
          </div>
          {recipientType === "invite" && (
            <div>
              <label className={labelCls}>Invite by Wallet Address</label>
              <div className="flex gap-2">
                <input
                  className={`${inputCls} flex-1`}
                  placeholder="0x..."
                  value={inviteAddress}
                  onChange={(e) => setInviteAddress(e.target.value)}
                />
                <button
                  onClick={() => {
                    if (inviteAddress) {
                      setInviteList([...inviteList, inviteAddress]);
                      setInviteAddress("");
                    }
                  }}
                  className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
                >
                  Add
                </button>
              </div>
              {inviteList.length > 0 && (
                <div className="mt-2 space-y-1">
                  {inviteList.map((addr, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg text-sm font-mono"
                    >
                      <span className="text-slate-700">{addr}</span>
                      <button
                        onClick={() =>
                          setInviteList(
                            inviteList.filter((_, idx) => idx !== i),
                          )
                        }
                        className="text-red-400 hover:text-red-600 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <div>
            <label className={labelCls}>Application Requirements</label>
            <div className="space-y-2">
              {[
                "Project proposal (PDF)",
                "Budget breakdown",
                "Portfolio samples",
                "Letter of recommendation",
              ].map((req) => (
                <label
                  key={req}
                  className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={requirements.includes(req)}
                    onChange={() => toggleReq(req)}
                    className="w-4 h-4 accent-blue-500"
                  />
                  <span className="text-sm text-slate-700">{req}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 4 */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">
              Review & Deposit
            </h2>
            <p className="text-slate-500 text-sm">
              Review your grant details before launching.
            </p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
            <h3 className="font-semibold text-slate-900 mb-3">Grant Summary</h3>
            {[
              ["Title", basics.title || "(untitled)"],
              ["Category", basics.category || "—"],
              [
                "Total Budget",
                basics.budget
                  ? `$${Number(basics.budget).toLocaleString()} ${basics.currency}`
                  : "—",
              ],
              ["Deadline", basics.deadline || "—"],
              ["Milestones", milestones.length],
              [
                "Recipient Type",
                recipientType === "open" ? "Open Call" : "Invite Only",
              ],
              ["Max Recipients", numAwards || "—"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-slate-500">{k}</span>
                <span className="font-medium text-slate-900">{v}</span>
              </div>
            ))}
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <h3 className="font-semibold text-blue-900 mb-2">
              🔒 Smart Contract Escrow
            </h3>
            <p className="text-sm text-blue-700">
              Funds will be held securely in a smart contract. They're released
              automatically when milestones are verified—you don't need to take
              action for each payment.
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Amount to Deposit</span>
              <span className="font-bold text-slate-900 text-base">
                ${basics.budget ? Number(basics.budget).toLocaleString() : "0"}{" "}
                {basics.currency}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Wallet Balance</span>
              <span className="font-medium text-emerald-600">
                {typeof balance === "number"
                  ? `${balance.toFixed(2)} HBAR`
                  : "—"}
              </span>
            </div>
          </div>

          {launched ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center">
              <div className="text-2xl mb-2">🎉</div>
              <p className="font-semibold text-emerald-700">
                Grant Launched Successfully!
              </p>
              <p className="text-sm text-emerald-600">
                Redirecting to dashboard...
              </p>
            </div>
          ) : (
            <>
              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                  <p className="text-sm text-red-700">{submitError}</p>
                </div>
              )}
              <button
                onClick={handleDeposit}
                disabled={depositing || !account}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3.5 rounded-xl text-base font-semibold hover:bg-slate-800 transition-colors disabled:opacity-60"
              >
                {depositing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Submitting to Hedera...
                  </>
                ) : (
                  "💸 Deposit & Launch Grant"
                )}
              </button>
              {!account && (
                <p className="text-xs text-center text-amber-600 mt-2">
                  Connect your wallet first to launch a grant.
                </p>
              )}
            </>
          )}
        </div>
      )}

      {/* Navigation */}
      {!launched && (
        <div className="flex justify-between mt-8 pt-6 border-t border-slate-200">
          <button
            onClick={() =>
              step > 0
                ? setStep((s) => s - 1)
                : router.push("/funder/dashboard")
            }
            className="flex items-center gap-2 border border-slate-300 bg-white text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft size={16} /> {step === 0 ? "Cancel" : "Back"}
          </button>
          {step < STEPS.length - 1 && (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
            >
              {STEPS[step + 1]} <ChevronRight size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
