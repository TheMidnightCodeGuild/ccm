import { useState } from "react";
import { db, storage, ref, uploadBytes, getDownloadURL } from "@/lib/firebase";
import { addDoc, arrayUnion, collection, doc, updateDoc } from "firebase/firestore";
import { CcmPageIntro } from "@/components/CcmIcon";
import CcmIcon from "@/components/CcmIcon";

function sanitizeFileName(name) {
  return name.replace(/[^\w.\-]/g, "_") || "file";
}

export default function KnowYourPolicy({ userId, customer, onUpdated }) {
  const [pendingFiles, setPendingFiles] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const policyFiles = Array.isArray(customer?.policyFiles)
    ? customer.policyFiles
    : [];

  const handleFileChange = (e) => {
    const picked = Array.from(e.target.files || []);
    setPendingFiles((prev) => [...prev, ...picked]);
    e.target.value = "";
  };

  const removePending = (index) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (pendingFiles.length === 0) return;
    setLoading(true);
    setError(null);

    try {
      const customerRef = doc(db, "customers", userId);

      for (const file of pendingFiles) {
        const safeName = sanitizeFileName(file.name);
        const storagePath = `policies/${userId}/${Date.now()}-${safeName}`;
        const storageRef = ref(storage, storagePath);
        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);
        const uploadedAt = new Date().toISOString();

        await addDoc(collection(db, "PolicyAnalysis"), {
          customerUserId: userId,
          policyStoragePath: storagePath,
          policyFileName: file.name,
          policyFileUrl: url,
          insurerName: "",
          policyType: "",
          coverageSummary: "",
          keyExclusions: "",
          recommendations: "",
          additionalNotes: "",
          status: "pending",
          analyzed: false,
          createdAt: uploadedAt,
          completedAt: null,
        });

        const meta = {
          url,
          fileName: file.name,
          uploadedAt,
        };
        await updateDoc(customerRef, {
          policyFiles: arrayUnion(meta),
        });
      }

      setPendingFiles([]);
      if (typeof onUpdated === "function") onUpdated();
    } catch (err) {
      console.error(err);
      setError(err.message || "Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ui-card-padded space-y-4">
      <CcmPageIntro icon="fileText" eyebrow="Policies">
        Upload policy documents. Files are stored under your account.
      </CcmPageIntro>

      <div>
        <label className="ui-label">Add files</label>
        <input
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,application/pdf"
          onChange={handleFileChange}
          className="mt-1 block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-indigo-700"
        />
      </div>

      {pendingFiles.length > 0 && (
        <div className="ui-card-compact overflow-hidden">
          <ul className="divide-y divide-indigo-100">
            {pendingFiles.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                className="flex items-center justify-between gap-2 px-3 py-2 text-sm"
              >
                <span className="truncate text-slate-800">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removePending(index)}
                  className="shrink-0 text-sm font-medium text-rose-600 hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <div className="border-t border-indigo-100 p-3">
            <button
              type="button"
              onClick={handleUpload}
              disabled={loading}
              className="ui-btn-primary w-full sm:w-auto"
            >
              {loading ? "Uploading…" : "Upload"}
            </button>
          </div>
        </div>
      )}

        {error && (
          <p className="ui-alert-error flex items-start gap-2" role="alert">
            <CcmIcon name="alertCircle" size={18} className="mt-0.5 shrink-0 text-rose-600" />
            <span>{error}</span>
          </p>
        )}

      <div>
        <h3 className="ui-section-title text-base">Saved policy files</h3>
        {policyFiles.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No uploads yet.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {policyFiles.map((item, i) => (
              <li
                key={`${item.url}-${i}`}
                className="ui-card-compact flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm"
              >
                <span className="font-medium text-slate-800">
                  {item.fileName || "Document"}
                </span>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-indigo-700 underline"
                >
                  Open
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
