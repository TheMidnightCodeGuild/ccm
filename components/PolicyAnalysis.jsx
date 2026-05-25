import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import CcmIcon, { CcmPageIntro } from "@/components/CcmIcon";

function formatDate(value) {
  if (!value) return "—";
  try {
    const d = new Date(value);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function AnalysisCard({ item }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="ui-card-compact overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full flex-wrap items-start justify-between gap-3 p-4 text-left"
      >
        <div>
          <h3 className="font-semibold text-slate-900">
            {item.insurerName || "Policy analysis"}
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            {item.policyFileName || "Policy document"} · {formatDate(item.createdAt)}
          </p>
          {item.policyType && (
            <p className="mt-0.5 text-xs text-slate-500">{item.policyType}</p>
          )}
        </div>
        <CcmIcon
          name={expanded ? "chevronUp" : "chevronDown"}
          size={20}
          className="text-indigo-700"
        />
      </button>

      {expanded && (
        <div className="space-y-4 border-t border-indigo-100 px-4 pb-4 pt-3">
          {item.coverageSummary && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Coverage summary
              </h4>
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">
                {item.coverageSummary}
              </p>
            </div>
          )}
          {item.keyExclusions && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Key exclusions
              </h4>
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">
                {item.keyExclusions}
              </p>
            </div>
          )}
          {item.recommendations && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Recommendations
              </h4>
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">
                {item.recommendations}
              </p>
            </div>
          )}
          {item.additionalNotes && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Additional notes
              </h4>
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">
                {item.additionalNotes}
              </p>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

export default function PolicyAnalysis({ userId }) {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const q = query(
          collection(db, "PolicyAnalysis"),
          where("customerUserId", "==", userId)
        );
        const snap = await getDocs(q);
        const rows = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter(
            (item) => item.analyzed === true && item.status === "completed"
          );
        rows.sort((a, b) => {
          const ta = new Date(a.createdAt || 0).getTime();
          const tb = new Date(b.createdAt || 0).getTime();
          return tb - ta;
        });
        if (!cancelled) setAnalyses(rows);
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError(err.message || "Failed to load policy analyses.");
          setAnalyses([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return (
    <div className="ui-card-padded space-y-4">
      <CcmPageIntro icon="clipboardCheck" eyebrow="Analysis">
        Expert reviews of your uploaded policy documents.
      </CcmPageIntro>

      {loading && (
        <div className="flex justify-center py-8">
          <div className="ui-spinner" />
        </div>
      )}

      {error && !loading && (
        <p className="ui-alert-error flex items-start gap-2" role="alert">
          <CcmIcon name="alertCircle" size={18} className="mt-0.5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </p>
      )}

      {!loading && !error && analyses.length === 0 && (
        <p className="ui-empty-state text-sm">
          No policy analysis available yet.
        </p>
      )}

      {!loading && !error && analyses.length > 0 && (
        <ul className="space-y-3">
          {analyses.map((item) => (
            <li key={item.id}>
              <AnalysisCard item={item} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
