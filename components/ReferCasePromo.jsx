import CcmIcon from "@/components/CcmIcon";

export default function ReferCasePromo({ onRefer }) {
  return (
    <section
      className="ccm-refer-hero"
      aria-label="Refer a case and earn rewards"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 ring-1 ring-emerald-300/50">
          <CcmIcon name="sparkles" size={24} className="text-emerald-700" />
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="ccm-refer-hero-eyebrow">Earn rewards</p>
          <p className="ccm-refer-hero-amount">Earn ₹300</p>
          <p className="text-sm font-medium text-emerald-900/90">
            per successful referral
          </p>
        </div>
      </div>

      <p className="mt-3 text-sm leading-snug text-slate-700">
        Know someone with an insurance claim? Refer their case to Claimant Mitra.
        You earn ₹300 when the referred case is accepted and taken up by us.
      </p>

      <p className="mt-2 text-xs text-slate-500">
        Payout is subject to verification after the case is accepted.
      </p>

      <button
        type="button"
        onClick={onRefer}
        className="ccm-refer-hero-btn mt-4"
      >
        <CcmIcon name="userPlus" size={18} className="text-white" />
        Refer now
      </button>
    </section>
  );
}
