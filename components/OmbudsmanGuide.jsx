import CcmIcon from "@/components/CcmIcon";

function formatUploadedAt(value) {
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

export default function OmbudsmanGuide({ guides, caseName }) {
  const items = Array.isArray(guides) ? guides : [];

  return (
    <section
      className="mt-3 min-w-0 border-t border-indigo-100 pt-3"
      aria-label={
        caseName
          ? `Ombudsman guide for ${caseName}`
          : "Ombudsman guide"
      }
    >
      <div className="flex items-center gap-2">
        <CcmIcon name="fileText" size={18} className="text-indigo-600" />
        <h4 className="text-sm font-semibold text-slate-800">Ombudsman Guide</h4>
      </div>
      <p className="mt-1 text-xs text-slate-600">
        Guides shared by Claimant Mitra for your ombudsman case.
      </p>

      {items.length === 0 ? (
        <p className="ui-empty-state mt-3 py-4 text-sm">
          No ombudsman guides yet.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.map((guide) => (
            <li
              key={guide.id || guide.storagePath || guide.downloadUrl}
              className="ui-card-compact flex min-w-0 items-center justify-between gap-3 p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">
                  {guide.title || guide.fileName || "Guide PDF"}
                </p>
                {guide.uploadedAt && (
                  <p className="mt-0.5 text-xs text-slate-500">
                    Added {formatUploadedAt(guide.uploadedAt)}
                  </p>
                )}
              </div>
              {guide.downloadUrl ? (
                <a
                  href={guide.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-sm font-semibold text-indigo-700 hover:text-indigo-900"
                >
                  View PDF
                </a>
              ) : (
                <span className="shrink-0 text-xs text-slate-500">
                  Unavailable
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
