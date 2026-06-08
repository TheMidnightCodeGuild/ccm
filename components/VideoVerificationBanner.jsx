import CcmIcon from "@/components/CcmIcon";
import { getVerificationUrl } from "@/lib/verificationUrl";

function formatRequestedAt(value) {
  if (!value) return "";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export default function VideoVerificationBanner({
  caseId,
  caseName,
  requestedAt,
}) {
  const verificationUrl = getVerificationUrl(caseId);
  const requestedLabel = formatRequestedAt(requestedAt);

  return (
    <section
      className="ccm-video-verification-banner mt-3"
      aria-label={
        caseName
          ? `Video verification pending for ${caseName}`
          : "Video verification pending"
      }
    >
      <div className="flex items-start gap-3">
        <span className="ccm-video-verification-banner-icon shrink-0">
          <CcmIcon name="video" size={22} className="text-violet-700" />
        </span>
        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <p className="ccm-video-verification-banner-eyebrow">
              Action required
            </p>
            <h4 className="text-base font-bold text-violet-950">
              Video verification pending
            </h4>
            <p className="mt-1 text-sm text-slate-700">
              Complete your video verification to keep your case moving forward.
            </p>
            {requestedLabel && (
              <p className="mt-1 text-xs text-slate-500">
                Requested on {requestedLabel}
              </p>
            )}
          </div>

          <a
            href={verificationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ccm-video-verification-banner-btn"
          >
            Start video verification
            <CcmIcon name="chevronRight" size={18} className="text-white" />
          </a>

          <p className="truncate text-xs text-violet-800/80" title={verificationUrl}>
            {verificationUrl}
          </p>
        </div>
      </div>
    </section>
  );
}

export function isVideoVerificationActionRequired(caseItem) {
  if (!caseItem?.requestVerificationRequestedAt) return false;
  const status = caseItem.VideoVerification || "Verification Pending";
  return status === "Verification Pending";
}
