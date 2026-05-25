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

function getCustomerLogSections(caseItem) {
  if (!caseItem) return [];
  return CUSTOMER_LOG_SECTIONS.filter(
    ({ key }) =>
      Array.isArray(caseItem[key]) && caseItem[key].length > 0
  );
}

function logExpandKey(caseId, sectionKey) {
  return `${caseId}:${sectionKey}`;
}

function StatusBadge({ status }) {
  const s = String(status || "").toLowerCase();
  if (s === "pending") return <span className="ui-badge-amber">Pending</span>;
  if (s === "approved") return <span className="ui-badge-emerald">Approved</span>;
  if (s === "rejected") return <span className="ui-badge-rose">Rejected</span>;
  return <span className="ui-badge-indigo">{status || "Pending"}</span>;
}

function LogSection({ logs, caseId, sectionKey, title, description, expandedLogs, onToggle }) {
  const sorted = [...logs].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
  const expandKey = logExpandKey(caseId, sectionKey);
  const showAll = expandedLogs[expandKey];
  const toShow =
    showAll || sorted.length <= LOG_PREVIEW_COUNT
      ? sorted
      : sorted.slice(0, LOG_PREVIEW_COUNT);

  return (
    <div className="min-w-0 space-y-2">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h5 className="text-sm font-semibold text-slate-800">{title}</h5>
          {description && (
            <p className="break-words text-xs text-slate-500">{description}</p>
          )}
        </div>
        {sorted.length > LOG_PREVIEW_COUNT && (
          <button
            type="button"
            onClick={() => onToggle(expandKey)}
            className="shrink-0 text-sm font-semibold text-indigo-700"
          >
            {showAll ? "Show less" : "View all"}
          </button>
        )}
      </div>
      <div className="space-y-3">
        {toShow.map((log, index) => (
          <div
            key={index}
            className="flex min-w-0 flex-col gap-1 border-t border-indigo-100 pt-3 first:border-0 first:pt-0"
          >
            <div className="shrink-0 text-xs text-slate-500">
              {formatLogDate(log.date)}
            </div>
            <div className="min-w-0 wrap-anywhere rounded-lg bg-indigo-50/50 px-3 py-2 text-sm text-slate-800">
              {log.remark ?? ""}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CaseCard({ caseItem, expandedLogs, onToggle }) {
  const logSections = getCustomerLogSections(caseItem);

  return (
    <article className="ui-card-compact min-w-0 overflow-hidden p-3 sm:p-4">
      <header className="min-w-0">
        <h3 className="break-words text-base font-semibold text-slate-900">
          {caseItem.name || "N/A"}
        </h3>
        <p className="mt-0.5 break-words text-sm text-slate-600">
          {caseItem.mobile ?? "N/A"}
        </p>
      </header>

      <div className="mt-2 flex flex-wrap gap-2">
        <StatusBadge status={caseItem.status} />
        {caseItem.documentShort ? (
          <span className="ui-badge-rose">Incomplete</span>
        ) : (
          <span className="ui-badge-emerald">Complete</span>
        )}
        {caseItem.solved ? (
          <span className="ui-badge-emerald">Solved</span>
        ) : (
          <span className="ui-badge-amber">In progress</span>
        )}
      </div>

      {logSections.length > 0 && (
        <section className="mt-3 min-w-0 space-y-4 border-t border-indigo-100 pt-3">
          <h4 className="text-sm font-semibold text-slate-800">Case logs</h4>
          {logSections.map(({ key, title, description }) => (
            <LogSection
              key={key}
              logs={caseItem[key]}
              caseId={caseItem.id}
              sectionKey={key}
              title={title}
              description={description}
              expandedLogs={expandedLogs}
              onToggle={onToggle}
            />
          ))}
        </section>
      )}
    </article>
  );
}

export default function OngoingComplaintStatus({ customer }) {
  const caseIds = Array.isArray(customer?.cases) ? customer.cases.filter(Boolean) : [];
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedLogs, setExpandedLogs] = useState({});

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
          const orderMap = new Map(caseIds.map((id, i) => [id, i]));
          all.sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0));
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
              onToggle={toggleLogSection}
            />
          ))}
        </div>
      )}
    </div>
  );
}
