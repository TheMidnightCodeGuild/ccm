import { Fragment, useEffect, useState } from "react";
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

function formatDate(value) {
  if (!value) return "Not set";
  try {
    const d =
      typeof value?.toDate === "function" ? value.toDate() : new Date(value);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "Invalid date";
  }
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
    <div className="space-y-2">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h5 className="text-sm font-semibold text-slate-800">{title}</h5>
          {description && (
            <p className="text-xs text-slate-500">{description}</p>
          )}
        </div>
        {sorted.length > LOG_PREVIEW_COUNT && (
          <button
            type="button"
            onClick={() => onToggle(expandKey)}
            className="text-sm font-semibold text-indigo-700"
          >
            {showAll ? "Show less" : "View all"}
          </button>
        )}
      </div>
      <div className="space-y-3">
        {toShow.map((log, index) => (
          <div
            key={index}
            className="flex flex-col gap-1 border-t border-indigo-100 pt-3 first:border-0 first:pt-0"
          >
            <div className="shrink-0 text-xs text-slate-500">
              {formatLogDate(log.date)}
            </div>
            <div className="flex-1 rounded-lg bg-indigo-50/50 px-3 py-2 text-sm text-slate-800">
              {log.remark ?? ""}
            </div>
          </div>
        ))}
      </div>
    </div>
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
        <div className="-mx-1 overflow-x-auto rounded-xl border border-indigo-200/60">
          <table className="min-w-[640px] w-full divide-y divide-indigo-100">
            <thead className="bg-indigo-50/80">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Name
                </th>
                <th className="hidden px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 sm:table-cell">
                  Mobile
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Status
                </th>
                <th className="hidden px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 md:table-cell">
                  Docs
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Progress
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-50 bg-white">
              {cases.map((caseItem) => {
                const logSections = getCustomerLogSections(caseItem);
                return (
                  <Fragment key={caseItem.id}>
                    <tr className="align-top">
                      <td className="px-3 py-2 text-sm font-medium text-slate-900">
                        {caseItem.name || "N/A"}
                      </td>
                      <td className="hidden px-3 py-2 text-sm text-slate-600 sm:table-cell">
                        {caseItem.mobile ?? "N/A"}
                      </td>
                      <td className="px-3 py-2">
                        <StatusBadge status={caseItem.status} />
                      </td>
                      <td className="hidden px-3 py-2 md:table-cell">
                        {caseItem.documentShort ? (
                          <span className="ui-badge-rose">Incomplete</span>
                        ) : (
                          <span className="ui-badge-emerald">Complete</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {caseItem.solved ? (
                          <span className="ui-badge-emerald">Solved</span>
                        ) : (
                          <span className="ui-badge-amber">In progress</span>
                        )}
                      </td>
                    </tr>
                    {logSections.length > 0 && (
                      <tr>
                        <td colSpan={5} className="bg-indigo-50/30 px-3 py-3">
                          <div className="ui-card-compact space-y-4 p-3">
                            <h4 className="text-sm font-semibold text-slate-800">
                              Case logs
                            </h4>
                            {logSections.map(({ key, title, description }) => (
                              <LogSection
                                key={key}
                                logs={caseItem[key]}
                                caseId={caseItem.id}
                                sectionKey={key}
                                title={title}
                                description={description}
                                expandedLogs={expandedLogs}
                                onToggle={toggleLogSection}
                              />
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
