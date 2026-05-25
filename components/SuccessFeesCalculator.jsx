import { useMemo, useState } from "react";
import { CcmPageIntro } from "@/components/CcmIcon";

const SUCCESS_FEE_RATE = 0.2;
const GST_RATE = 0.18;

function formatInr(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function SuccessFeesCalculator() {
  const [claimInput, setClaimInput] = useState("");

  const claimAmount = useMemo(() => {
    const parsed = parseFloat(String(claimInput).replace(/,/g, ""));
    if (!Number.isFinite(parsed) || parsed <= 0) return null;
    return parsed;
  }, [claimInput]);

  const breakdown = useMemo(() => {
    if (claimAmount == null) return null;
    const successFee = claimAmount * SUCCESS_FEE_RATE;
    const gstAmount = successFee * GST_RATE;
    const total = successFee + gstAmount;
    return { successFee, gstAmount, total };
  }, [claimAmount]);

  return (
    <div className="ui-card-padded space-y-5">
      <CcmPageIntro icon="calculator" eyebrow="Fees">
        A success fee of 20% plus 18% GST on the success fee is charged.
      </CcmPageIntro>

      <div>
        <label htmlFor="claimAmount" className="ui-label">
          Total claim amount (₹)
        </label>
        <input
          id="claimAmount"
          type="number"
          min="0"
          step="0.01"
          placeholder="e.g. 100000"
          value={claimInput}
          onChange={(e) => setClaimInput(e.target.value)}
          className="ui-input"
        />
      </div>

      {breakdown ? (
        <dl className="ui-section-indigo space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <dt className="text-sm text-slate-600">Success fee (20%)</dt>
            <dd className="text-sm font-semibold text-slate-900">
              {formatInr(breakdown.successFee)}
            </dd>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <dt className="text-sm text-slate-600">GST (18%)</dt>
            <dd className="text-sm font-semibold text-slate-900">
              {formatInr(breakdown.gstAmount)}
            </dd>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-indigo-200/80 pt-3">
            <dt className="text-sm font-medium text-slate-800">Total</dt>
            <dd className="text-base font-semibold text-indigo-900">
              {formatInr(breakdown.total)}
            </dd>
          </div>
        </dl>
      ) : (
        <p className="ui-empty-state text-sm">
          Enter a positive claim amount to see the fee breakdown.
        </p>
      )}
    </div>
  );
}
