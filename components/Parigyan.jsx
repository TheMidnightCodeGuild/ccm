import { useCallback, useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { CcmPageIntro } from "@/components/CcmIcon";

const PREVIEW_MAX_CHARS = 120;

function QaCard({ item }) {
  const [expanded, setExpanded] = useState(false);
  const answer = item.answer || "";
  const isTruncatable = answer.length > PREVIEW_MAX_CHARS;
  const displayAnswer =
    !expanded && isTruncatable
      ? `${answer.slice(0, PREVIEW_MAX_CHARS).trim()}…`
      : answer;

  return (
    <article className="ui-card-padded ui-parigyan-card space-y-2 p-4">
      <h3 className="text-base font-semibold leading-snug text-slate-900">
        {item.question || "Question"}
      </h3>

      <div
        className={
          expanded && isTruncatable
            ? "max-h-[min(50dvh,320px)] overflow-y-auto"
            : undefined
        }
      >
        <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-wrap">
          {displayAnswer}
        </p>
        {isTruncatable && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-2 text-sm font-semibold text-violet-700 hover:text-violet-900"
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}
      </div>
    </article>
  );
}

export default function Parigyan() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = query(collection(db, "parigyan"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const rows = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((row) => row.active !== false);
      setItems(rows);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load Parigyan.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  return (
    <div className="ui-card-padded space-y-4 p-4!">
      <CcmPageIntro icon="bookOpen" eyebrow="Parigyan">
        Answers to common questions about insurance claims and your rights.
      </CcmPageIntro>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="ui-spinner" />
        </div>
      )}

      {!loading && error && (
        <p className="ui-alert-error" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && items.length === 0 && (
        <p className="ui-empty-state text-sm">No Q&A yet.</p>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="space-y-3">
          {items.map((item) => (
            <QaCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
