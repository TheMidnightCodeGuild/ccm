import { useCallback, useEffect, useRef, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import CcmIcon from "@/components/CcmIcon";

function clampRating(value) {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n)) return 5;
  return Math.min(5, Math.max(1, n));
}

function StarRatingDisplay({ rating, size = 18 }) {
  const stars = clampRating(rating);
  return (
    <div className="flex items-center gap-0.5" aria-label={`${stars} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <CcmIcon
          key={i}
          name="star"
          size={size}
          className={
            i <= stars
              ? "fill-amber-400 text-amber-500"
              : "text-slate-300"
          }
          strokeWidth={i <= stars ? 2.5 : 1.5}
        />
      ))}
    </div>
  );
}

const PREVIEW_MAX_CHARS = 100;

function ReviewCard({ review }) {
  const [expanded, setExpanded] = useState(false);
  const text = review.reviewText || "";
  const isTruncatable = text.length > PREVIEW_MAX_CHARS;
  const displayText =
    !expanded && isTruncatable
      ? `${text.slice(0, PREVIEW_MAX_CHARS).trim()}…`
      : text;

  return (
    <article
      className={`ui-card-padded ui-review-card flex min-w-[88vw] max-w-[320px] shrink-0 snap-center flex-col gap-2 overflow-hidden p-3 sm:min-w-[72%] ${
        expanded
          ? "max-h-[min(50dvh,320px)]"
          : "max-h-[min(38dvh,260px)]"
      }`}
    >
      <div className="flex shrink-0 items-center gap-2">
        <h3 className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900">
          {review.reviewerName || "Customer"}
        </h3>
        <StarRatingDisplay rating={review.rating} size={16} />
      </div>

      <div
        className={`min-h-0 flex-1 ${
          expanded ? "max-h-[min(36dvh,220px)] overflow-y-auto" : "overflow-hidden"
        }`}
      >
        <p className="text-sm leading-snug text-slate-600">{displayText}</p>
        {isTruncatable && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            className="mt-1 text-sm font-semibold text-indigo-700 hover:text-indigo-900"
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}
      </div>

      {review.googleReviewUrl && (
        <a
          href={review.googleReviewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-indigo-700 hover:text-indigo-900"
          onClick={(e) => e.stopPropagation()}
        >
          View on Google
          <CcmIcon name="chevronRight" size={16} className="text-indigo-600" />
        </a>
      )}
    </article>
  );
}

export default function CustomerReviews() {
  const scrollRef = useRef(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = query(
        collection(db, "customerReviews"),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      const rows = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((r) => r.active !== false);
      setReviews(rows);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load reviews.");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const scrollByCard = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector("article")?.offsetWidth || 280;
    el.scrollBy({ left: direction * (cardWidth + 16), behavior: "smooth" });
  };

  if (loading) {
    return (
      <section className="space-y-3 pt-2" aria-label="Customer reviews">
        <div className="ui-section-header-reviews">
          <CcmIcon name="star" size={18} className="text-amber-500" />
          <h3 className="text-sm font-semibold text-slate-900">Customer reviews</h3>
        </div>
        <div className="flex justify-center py-6">
          <div className="ui-spinner" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-3 pt-2" aria-label="Customer reviews">
        <div className="ui-section-header-reviews">
          <CcmIcon name="star" size={18} className="text-amber-500" />
          <h3 className="text-sm font-semibold text-slate-900">Customer reviews</h3>
        </div>
        <p className="ui-alert-error text-sm" role="alert">
          {error}
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-3 pt-2" aria-label="Customer reviews">
      <div>
        <div className="ui-section-header-reviews">
          <CcmIcon name="star" size={18} className="text-amber-500" />
          <h3 className="text-sm font-semibold text-slate-900">Customer reviews</h3>
        </div>
        <p className="mt-1 text-xs text-slate-600">
          What our customers say — swipe to read more.
        </p>
      </div>

      {reviews.length === 0 ? (
        <div className="ui-empty-state text-sm">No reviews yet.</div>
      ) : (
        <div className="relative">
          {reviews.length > 1 && (
            <div className="mb-3 hidden items-center justify-end gap-2 sm:flex">
              <button
                type="button"
                onClick={() => scrollByCard(-1)}
                className="inline-flex items-center justify-center rounded-lg border border-indigo-200 bg-white p-2 text-indigo-700 hover:bg-indigo-50"
                aria-label="Previous review"
              >
                <CcmIcon name="chevronLeft" size={20} />
              </button>
              <button
                type="button"
                onClick={() => scrollByCard(1)}
                className="inline-flex items-center justify-center rounded-lg border border-indigo-200 bg-white p-2 text-indigo-700 hover:bg-indigo-50"
                aria-label="Next review"
              >
                <CcmIcon name="chevronRight" size={20} />
              </button>
            </div>
          )}

          <div
            ref={scrollRef}
            className="flex snap-x snap-mandatory items-stretch gap-3 overflow-x-auto pr-1 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
