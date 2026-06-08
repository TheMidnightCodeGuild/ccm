import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  documentId,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { CcmPageIntro } from "@/components/CcmIcon";
import OmbudsmanGuide from "@/components/OmbudsmanGuide";
import VideoVerificationBanner, {
  isVideoVerificationActionRequired,
} from "@/components/VideoVerificationBanner";

const CUSTOMER_LOG_SECTIONS = [
  { key: "mainLogs", title: "Main Logs", description: "General case updates" },
  { key: "igmsLogs", title: "IGMS Logs", description: "IGMS complaint updates" },
  {
    key: "ombudsmanLogs",
    title: "Ombudsman Logs",
    description: "Ombudsman proceedings",
  },
];

const LOG_PREVIEW_COUNT = 3;

function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

function formatLogDate(value) {
  if (!value) return "N/A";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "Invalid date";
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Invalid date";
  }
}

function getTotalLogCount(caseItem) {
  return CUSTOMER_LOG_SECTIONS.reduce((sum, { key }) => {
    const logs = caseItem?.[key];
    return sum + (Array.isArray(logs) ? logs.length : 0);
  }, 0);
}

function logExpandKey(caseId, sectionKey) {
  return `${caseId}:${sectionKey}`;
}

function isValidClaimScore(value) {
  return typeof value === "number" && !Number.isNaN(value) && value >= 0 && value <= 100;
}

function claimScoreBarColor(score) {
  if (score >= 70) return "bg-emerald-500";
  if (score >= 40) return "bg-amber-500";
  return "bg-rose-500";
}

function ClaimScoreDisplay({ score }) {
  if (!isValidClaimScore(score)) return null;

  return (
    <div className="min-w-0 space-y-1.5">
      <p className="text-sm font-medium text-slate-800">
        {score}% chance of success
      </p>
      <div
        className="h-2.5 w-full overflow-hidden rounded-full bg-gradient-to-r from-slate-200 via-indigo-100 to-violet-100"
        role="progressbar"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Claim score: ${score} percent chance of success`}
      >
        <div
          className={`h-full rounded-full transition-all ${claimScoreBarColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const s = String(status || "").toLowerCase();
  if (s === "pending") return <span className="ui-badge-amber">Pending</span>;
  if (s === "approved") return <span className="ui-badge-emerald">Approved</span>;
  if (s === "rejected") return <span className="ui-badge-rose">Rejected</span>;
  return <span className="ui-badge-indigo">{status || "Pending"}</span>;
}

function LabeledField({ label, children }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="w-22 shrink-0 text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function LogSection({
  logs,
  caseId,
  sectionKey,
  title,
  description,
  expandedLogs,
  onToggle,
}) {
  const entries = Array.isArray(logs) ? logs : [];

  return (
    <div className="min-w-0 space-y-2">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h5 className="text-sm font-semibold text-slate-800">{title}</h5>
          {description && (
            <p className="wrap-break-word text-xs text-slate-500">{description}</p>
          )}
        </div>
        {entries.length > LOG_PREVIEW_COUNT && (
          <button
            type="button"
            onClick={() => onToggle(logExpandKey(caseId, sectionKey))}
            className="shrink-0 text-sm font-semibold text-indigo-700"
          >
            {expandedLogs[logExpandKey(caseId, sectionKey)]
              ? "Show less"
              : "View all"}
          </button>
        )}
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-slate-500">No entries yet</p>
      ) : (
        <LogTimeline
          logs={entries}
          caseId={caseId}
          sectionKey={sectionKey}
          expandedLogs={expandedLogs}
        />
      )}
    </div>
  );
}

function LogTimeline({ logs, caseId, sectionKey, expandedLogs }) {
  const sorted = [...logs].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
  const showAll = expandedLogs[logExpandKey(caseId, sectionKey)];
  const toShow =
    showAll || sorted.length <= LOG_PREVIEW_COUNT
      ? sorted
      : sorted.slice(0, LOG_PREVIEW_COUNT);

  return (
    <div className="space-y-4">
      {toShow.map((log, index) => (
        <div key={index} className="flex min-w-0 gap-2">
          <div className="flex shrink-0 flex-col items-center pt-1.5">
            <span
              className="h-2 w-2 rounded-full bg-indigo-500"
              aria-hidden
            />
          </div>
          <div className="min-w-0 flex-1 border-l-2 border-indigo-200 pl-3">
            <time className="text-xs text-slate-500">
              {formatLogDate(log.date)}
            </time>
            <p className="mt-1 wrap-anywhere text-sm text-slate-800">
              {log.remark ?? ""}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function CaseCard({
  caseItem,
  expandedLogs,
  expandedCaseLogs,
  onToggleLogSection,
  onToggleCaseLogs,
}) {
  const logsOpen = expandedCaseLogs[caseItem.id];
  const totalLogs = getTotalLogCount(caseItem);

  return (
    <article className="ui-card-compact min-w-0 overflow-hidden p-3 sm:p-4">
      <header className="min-w-0">
        <h3 className="wrap-break-word text-base font-semibold text-slate-900">
          {caseItem.name || "N/A"}
        </h3>
        <p className="mt-0.5 wrap-break-word text-sm text-slate-600">
          {caseItem.companyName?.trim() || "Insurance company not set"}
        </p>
      </header>

      <div className="mt-3 space-y-2">
        <LabeledField label="Status">
          <StatusBadge status={caseItem.status} />
        </LabeledField>
        <LabeledField label="Documents">
          {caseItem.documentShort ? (
            <span className="ui-badge-rose">Incomplete</span>
          ) : (
            <span className="ui-badge-emerald">Complete</span>
          )}
        </LabeledField>
        <LabeledField label="Progress">
          {caseItem.solved ? (
            <span className="ui-badge-emerald">Solved</span>
          ) : (
            <span className="ui-badge-amber">In progress</span>
          )}
        </LabeledField>
        {isValidClaimScore(caseItem.claimScore) && (
          <LabeledField label="Claim score">
            <ClaimScoreDisplay score={caseItem.claimScore} />
          </LabeledField>
        )}
      </div>

      {isVideoVerificationActionRequired(caseItem) && (
        <VideoVerificationBanner
          caseId={caseItem.id}
          caseName={caseItem.name}
          requestedAt={caseItem.requestVerificationRequestedAt}
        />
      )}

      {caseItem.ombudsman && (
        <OmbudsmanGuide
          guides={caseItem.ombudsmanGuides}
          caseName={caseItem.name}
        />
      )}

      <section className="mt-3 min-w-0 border-t border-indigo-100 pt-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <h4 className="text-sm font-semibold text-slate-800">Case logs</h4>
            {totalLogs > 0 && !logsOpen && (
              <span className="ui-badge-indigo">{totalLogs}</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => onToggleCaseLogs(caseItem.id)}
            className="shrink-0 text-sm font-semibold text-indigo-700"
          >
            {logsOpen ? "Hide logs" : "View logs"}
          </button>
        </div>

        {logsOpen && (
          <div className="mt-4 space-y-4">
            {CUSTOMER_LOG_SECTIONS.map(({ key, title, description }) => (
              <LogSection
                key={key}
                logs={caseItem[key]}
                caseId={caseItem.id}
                sectionKey={key}
                title={title}
                description={description}
                expandedLogs={expandedLogs}
                onToggle={onToggleLogSection}
              />
            ))}
          </div>
        )}
      </section>
    </article>
  );
}

export default function OngoingComplaintStatus({ customer }) {
  const caseIds = Array.isArray(customer?.cases) ? customer.cases.filter(Boolean) : [];
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedLogs, setExpandedLogs] = useState({});
  const [expandedCaseLogs, setExpandedCaseLogs] = useState({});

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (caseIds.length === 0) {
        setCases([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const usersCollection = collection(db, "users");
        const all = [];

        for (const chunk of chunkArray(caseIds, 10)) {
          const q = query(
            usersCollection,
            where(documentId(), "in", chunk)
          );
          const snapshot = await getDocs(q);
          snapshot.forEach((docSnap) => {
            all.push({ id: docSnap.id, ...docSnap.data() });
          });
        }

        if (!cancelled) {
          all.sort(
            (a, b) =>
              new Date(b.complaintDate || 0) - new Date(a.complaintDate || 0)
          );
          setCases(all);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setError(err.message || "Failed to load cases.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [customer?.cases]);

  const toggleLogSection = (expandKey) => {
    setExpandedLogs((prev) => ({ ...prev, [expandKey]: !prev[expandKey] }));
  };

  const toggleCaseLogs = (caseId) => {
    setExpandedCaseLogs((prev) => ({ ...prev, [caseId]: !prev[caseId] }));
  };

  return (
    <div className="ui-card-padded space-y-4 !p-4">
      <CcmPageIntro icon="listChecks" eyebrow="Cases">
        Status and timeline for cases linked to your account.
      </CcmPageIntro>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="ui-spinner" />
        </div>
      )}

      {!loading && error && (
        <p className="ui-alert-error">{error}</p>
      )}

      {!loading && !error && caseIds.length === 0 && (
        <p className="ui-empty-state text-sm">
          No cases linked yet. Use File Complaint to create one.
        </p>
      )}

      {!loading && !error && cases.length > 0 && (
        <div className="min-w-0 space-y-3">
          {cases.map((caseItem) => (
            <CaseCard
              key={caseItem.id}
              caseItem={caseItem}
              expandedLogs={expandedLogs}
              expandedCaseLogs={expandedCaseLogs}
              onToggleLogSection={toggleLogSection}
              onToggleCaseLogs={toggleCaseLogs}
            />
          ))}
        </div>
      )}
    </div>
  );
}
