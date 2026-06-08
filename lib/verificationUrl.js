export function getVerificationUrl(caseId) {
  const base =
    process.env.NEXT_PUBLIC_VCM_BASE_URL ||
    "https://verification.claimantmitra.com";
  return `${base.replace(/\/$/, "")}/requestVerification/${caseId}`;
}
