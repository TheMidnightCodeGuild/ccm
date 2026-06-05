import { useCallback, useEffect, useRef, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import CcmIcon from "@/components/CcmIcon";

function VideoCard({ video }) {
  return (
    <article className="ui-card-padded flex min-w-[88vw] max-w-[320px] shrink-0 snap-center flex-col gap-2 overflow-hidden p-3 sm:min-w-[72%] max-h-[min(55dvh,400px)]">
      {video.title && (
        <h3 className="shrink-0 truncate text-sm font-semibold text-slate-900">
          {video.title}
        </h3>
      )}
      {video.downloadUrl ? (
        <video
          controls
          playsInline
          preload="metadata"
          className="w-full max-h-[min(40dvh,280px)] rounded-lg bg-slate-900 object-contain"
          src={video.downloadUrl}
        >
          Your browser does not support video playback.
        </video>
      ) : (
        <p className="text-sm text-slate-500">Video unavailable</p>
      )}
    </article>
  );
}

export default function FromClaimantMitra() {
  const scrollRef = useRef(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadVideos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = query(
        collection(db, "fromClaimantMitraVideos"),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      const rows = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((v) => v.active !== false);
      setVideos(rows);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load From Claimant Mitra videos.");
      setVideos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  const scrollByCard = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector("article")?.offsetWidth || 280;
    el.scrollBy({ left: direction * (cardWidth + 12), behavior: "smooth" });
  };

  if (loading) {
    return (
      <section className="space-y-3 pt-2" aria-label="From Claimant Mitra">
        <div className="ui-section-header-fcm">
          <CcmIcon name="video" size={18} className="text-indigo-600" />
          <h3 className="text-sm font-semibold text-slate-900">
            From Claimant Mitra
          </h3>
        </div>
        <div className="flex justify-center py-6">
          <div className="ui-spinner" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-3 pt-2" aria-label="From Claimant Mitra">
        <div className="ui-section-header-fcm">
          <CcmIcon name="video" size={18} className="text-indigo-600" />
          <h3 className="text-sm font-semibold text-slate-900">
            From Claimant Mitra
          </h3>
        </div>
        <p className="ui-alert-error text-sm" role="alert">
          {error}
        </p>
      </section>
    );
  }

  if (videos.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3 pt-2" aria-label="From Claimant Mitra">
      <div>
        <div className="ui-section-header-fcm">
          <CcmIcon name="video" size={18} className="text-indigo-600" />
          <h3 className="text-sm font-semibold text-slate-900">
            From Claimant Mitra
          </h3>
        </div>
        <p className="mt-1 text-xs text-slate-600">
          Swipe to watch updates from Claimant Mitra.
        </p>
      </div>

      <div className="relative">
        {videos.length > 1 && (
          <div className="mb-3 hidden items-center justify-end gap-2 sm:flex">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              className="inline-flex items-center justify-center rounded-lg border border-indigo-200 bg-white p-2 text-indigo-700 hover:bg-indigo-50"
              aria-label="Previous video"
            >
              <CcmIcon name="chevronLeft" size={20} />
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              className="inline-flex items-center justify-center rounded-lg border border-indigo-200 bg-white p-2 text-indigo-700 hover:bg-indigo-50"
              aria-label="Next video"
            >
              <CcmIcon name="chevronRight" size={20} />
            </button>
          </div>
        )}

        <div
          ref={scrollRef}
          className="flex snap-x snap-mandatory items-stretch gap-3 overflow-x-auto pr-1 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </div>
    </section>
  );
}
