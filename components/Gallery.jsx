import { useCallback, useEffect, useRef, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import CcmIcon from "@/components/CcmIcon";

function ImageCard({ image }) {
  return (
    <article className="ui-card-padded ui-gallery-card flex min-w-[88vw] max-w-[320px] shrink-0 snap-center flex-col gap-2 overflow-hidden p-3 sm:min-w-[72%] max-h-[min(55dvh,400px)]">
      {image.title && (
        <h3 className="shrink-0 truncate text-sm font-semibold text-slate-900">
          {image.title}
        </h3>
      )}
      {image.downloadUrl ? (
        <img
          src={image.downloadUrl}
          alt={image.title || "Gallery image"}
          loading="lazy"
          className="w-full max-h-[min(40dvh,280px)] rounded-lg bg-slate-100 object-contain"
        />
      ) : (
        <p className="text-sm text-slate-500">Image unavailable</p>
      )}
    </article>
  );
}

export default function Gallery() {
  const scrollRef = useRef(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadImages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = query(
        collection(db, "galleryImages"),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      const rows = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((img) => img.active !== false);
      setImages(rows);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load gallery.");
      setImages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  const scrollByCard = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector("article")?.offsetWidth || 280;
    el.scrollBy({ left: direction * (cardWidth + 12), behavior: "smooth" });
  };

  if (loading) {
    return (
      <section className="space-y-3 pt-2" aria-label="Gallery">
        <div className="ui-section-header-gallery">
          <CcmIcon name="images" size={18} className="text-teal-600" />
          <h3 className="text-sm font-semibold text-slate-900">Gallery</h3>
        </div>
        <div className="flex justify-center py-6">
          <div className="ui-spinner" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-3 pt-2" aria-label="Gallery">
        <div className="ui-section-header-gallery">
          <CcmIcon name="images" size={18} className="text-teal-600" />
          <h3 className="text-sm font-semibold text-slate-900">Gallery</h3>
        </div>
        <p className="ui-alert-error text-sm" role="alert">
          {error}
        </p>
      </section>
    );
  }

  if (images.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3 pt-2" aria-label="Gallery">
      <div>
        <div className="ui-section-header-gallery">
          <CcmIcon name="images" size={18} className="text-teal-600" />
          <h3 className="text-sm font-semibold text-slate-900">Gallery</h3>
        </div>
        <p className="mt-1 text-xs text-slate-600">
          Swipe to browse photos.
        </p>
      </div>

      <div className="relative">
        {images.length > 1 && (
          <div className="mb-3 hidden items-center justify-end gap-2 sm:flex">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              className="inline-flex items-center justify-center rounded-lg border border-indigo-200 bg-white p-2 text-indigo-700 hover:bg-indigo-50"
              aria-label="Previous image"
            >
              <CcmIcon name="chevronLeft" size={20} />
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              className="inline-flex items-center justify-center rounded-lg border border-indigo-200 bg-white p-2 text-indigo-700 hover:bg-indigo-50"
              aria-label="Next image"
            >
              <CcmIcon name="chevronRight" size={20} />
            </button>
          </div>
        )}

        <div
          ref={scrollRef}
          className="flex snap-x snap-mandatory items-stretch gap-3 overflow-x-auto pr-1 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((image) => (
            <ImageCard key={image.id} image={image} />
          ))}
        </div>
      </div>
    </section>
  );
}
