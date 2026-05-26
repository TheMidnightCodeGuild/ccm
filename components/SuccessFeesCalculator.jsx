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

function parseDiscountPercent(input) {
  const parsed = parseFloat(String(input).replace(/,/g, ""));
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  if (parsed > 100) return 100;
  return parsed;
}

export default function SuccessFeesCalculator() {
  const [claimInput, setClaimInput] = useState("");
  const [discountInput, setDiscountInput] = useState("");

  const claimAmount = useMemo(() => {
    const parsed = parseFloat(String(claimInput).replace(/,/g, ""));
    if (!Number.isFinite(parsed) || parsed <= 0) return null;
    return parsed;
  }, [claimInput]);

  const discountPercent = useMemo(
    () => parseDiscountPercent(discountInput),
    [discountInput]
  );

  const breakdown = useMemo(() => {
    if (claimAmount == null) return null;

    const successFee = claimAmount * SUCCESS_FEE_RATE;
    const gstAmount = successFee * GST_RATE;
    const totalWithGst = successFee + gstAmount;

    const discountRate = discountPercent / 100;
    const discountedSuccessFee = successFee * (1 - discountRate);
    const discountedGst = discountedSuccessFee * GST_RATE;
    const finalWithoutGst = discountedSuccessFee;
    const finalWithGst = discountedSuccessFee + discountedGst;

    return {
      successFee,
      gstAmount,
      totalWithGst,
      discountPercent,
      discountedSuccessFee,
      discountedGst,
      finalWithoutGst,
      finalWithGst,
    };
  }, [claimAmount, discountPercent]);

  return (
    <div className="ui-card-padded space-y-5">
      <CcmPageIntro icon="calculator" eyebrow="Fees">
        A success fee of 20% plus 18% GST on the success fee is charged. You can
        apply an optional discount percentage to see your final amounts.
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

      <div>
        <label htmlFor="discountPercent" className="ui-label">
          Discount (%)
        </label>
        <input
          id="discountPercent"
          type="number"
          min="0"
          max="100"
          step="0.01"
          placeholder="e.g. 10"
          value={discountInput}
          onChange={(e) => setDiscountInput(e.target.value)}
          className="ui-input"
        />
      </div>

      {breakdown ? (
        <dl className="ui-section-indigo space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-200/80 pb-3">
            <dt className="text-sm font-medium text-slate-800">
              Total without GST
              {breakdown.discountPercent > 0 ? " (after discount)" : ""}
            </dt>
            <dd className="text-base font-semibold text-slate-900">
              {formatInr(breakdown.finalWithoutGst)}
            </dd>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-200/80 pb-3">
            <dt className="text-sm font-medium text-slate-800">
              Total with GST
              {breakdown.discountPercent > 0 ? " (after discount)" : ""}
            </dt>
            <dd className="text-base font-semibold text-indigo-900">
              {formatInr(breakdown.finalWithGst)}
            </dd>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <dt className="text-sm text-slate-600">Success fee (20%)</dt>
            <dd className="text-sm font-semibold text-slate-900">
              {formatInr(breakdown.discountedSuccessFee)}
              {breakdown.discountPercent > 0 && (
                <span className="ml-2 text-xs font-normal text-slate-500">
                  (was {formatInr(breakdown.successFee)})
                </span>
              )}
            </dd>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <dt className="text-sm text-slate-600">GST (18%)</dt>
            <dd className="text-sm font-semibold text-slate-900">
              {formatInr(breakdown.discountedGst)}
              {breakdown.discountPercent > 0 && (
                <span className="ml-2 text-xs font-normal text-slate-500">
                  (was {formatInr(breakdown.gstAmount)})
                </span>
              )}
            </dd>
          </div>

          {breakdown.discountPercent > 0 && (
            <p className="border-t border-indigo-200/80 pt-3 text-xs text-slate-500">
              {breakdown.discountPercent}% discount applied to the success fee
              before GST.
            </p>
          )}
        </dl>
      ) : (
        <p className="ui-empty-state text-sm">
          Enter a positive claim amount to see the fee breakdown.
        </p>
      )}
    </div>
  );
}
