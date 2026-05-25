import { useEffect, useState } from "react";
import { db, storage, ref, uploadBytes, getDownloadURL } from "@/lib/firebase";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  updateDoc,
} from "firebase/firestore";
import CcmIcon, { CcmPageIntro } from "@/components/CcmIcon";

const initialForm = {
  name: "",
  estimatedClaimAmount: "",
  mobile: "",
  email: "",
  companyName: "",
  claimNo: "",
  policyNo: "",
  policyHolder: "",
  aadharNo: "",
  address: "",
};

export default function FileYourComplaint({
  userId,
  customer,
  onSuccess,
}) {
  const [formData, setFormData] = useState(initialForm);
  const [files, setFiles] = useState([]);
  const [selectedFileNames, setSelectedFileNames] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!customer) return;
    setFormData((prev) => ({
      ...prev,
      name: customer.name ?? prev.name,
      email: customer.email ?? prev.email,
      mobile: customer.mobile != null ? String(customer.mobile) : prev.mobile,
      aadharNo: customer.aadharNo != null ? String(customer.aadharNo) : prev.aadharNo,
    }));
  }, [customer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...newFiles]);
    setSelectedFileNames((prev) => [...prev, ...newFiles.map((f) => f.name)]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setSelectedFileNames((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    const uploadedUrls = [];
    let progress = 0;
    const increment = files.length ? 100 / files.length : 100;

    for (const file of files) {
      const safeName = file.name.replace(/[^\w.\-]/g, "_");
      const storageRef = ref(
        storage,
        `customer-case-files/${userId}/${Date.now()}-${safeName}`
      );
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      uploadedUrls.push(url);
      progress += increment;
      setUploadProgress(Math.round(progress));
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    setUploadProgress(0);

    try {
      let fileUrls = [];
      if (files.length > 0) {
        fileUrls = await uploadFiles();
      }

      const userDoc = {
        ...formData,
        estimatedClaimAmount: formData.estimatedClaimAmount
          ? Number(formData.estimatedClaimAmount)
          : 0,
        mobile: formData.mobile ? Number(String(formData.mobile).replace(/\D/g, "")) : null,
        partnerRef: "",
        customerUserId: userId,
        complaintDate: new Date().toISOString(),
        takenForReview: false,
        reviewDate: null,
        status: "pending",
        documentShort: true,
        caseRejectionReason: "",
        caseRejectionDate: null,
        rejected: false,
        inReimbursement: false,
        isPending: false,
        caseAcceptanceDate: null,
        mainLogs: [],
        internalLogs: [],
        igms: false,
        igmsDate: null,
        igmsFollowUpDate: null,
        igmsLogs: [],
        igmsRejectionReason: "",
        ombudsman: false,
        ombudsmanDate: null,
        ombudsmanCourierDate: null,
        ombudsmanFollowUpDate: null,
        ombudsmanComplaintNumber: "",
        sixAFormSubmitted: false,
        ombudsmanMode: "",
        ombudsmanLogs: [],
        ombudsmanRejectionReason: "",
        solved: false,
        solvedDate: null,
        claim: 0,
        commisionReceived: 0,
        partnerCommision: 0,
        fileBucket: fileUrls,
      };

      const docRef = await addDoc(collection(db, "users"), userDoc);

      await updateDoc(doc(db, "customers", userId), {
        cases: arrayUnion(docRef.id),
      });

      setSuccess(true);
      setFormData(initialForm);
      setFiles([]);
      setSelectedFileNames([]);
      setUploadProgress(0);
      if (typeof onSuccess === "function") onSuccess();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to submit complaint.");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="ui-card-padded space-y-5">
      <CcmPageIntro icon="filePlus" eyebrow="Complaint">
        Your case will be added and linked to your account.
      </CcmPageIntro>

      {success && (
        <div className="ui-alert-success flex items-start gap-2" role="status">
          <CcmIcon name="checkCircle2" size={18} className="mt-0.5 shrink-0 text-emerald-700" />
          <span>Complaint filed successfully. It has been added to your cases.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h3 className="ui-section-title border-b border-indigo-100 pb-2 text-base">
            Personal information
          </h3>
          <label className="ui-label">
            Client name
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="ui-input"
              required
            />
          </label>
          <label className="ui-label">
            Policy holder name
            <input
              type="text"
              name="policyHolder"
              value={formData.policyHolder}
              onChange={handleChange}
              className="ui-input"
              required
            />
          </label>
          <label className="ui-label">
            Mobile
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              className="ui-input"
              required
            />
          </label>
          <label className="ui-label">
            Email
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="ui-input"
              required
            />
          </label>
          <label className="ui-label">
            Aadhar number
            <input
              type="text"
              name="aadharNo"
              value={formData.aadharNo}
              onChange={handleChange}
              className="ui-input"
              required
            />
          </label>
          <label className="ui-label">
            Address
            <textarea
              name="address"
              rows={3}
              value={formData.address}
              onChange={handleChange}
              className="ui-input"
              required
            />
          </label>
        </div>

        <div className="space-y-4">
          <h3 className="ui-section-title border-b border-indigo-100 pb-2 text-base">
            Claim information
          </h3>
          <label className="ui-label">
            Insurance company
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              className="ui-input"
              required
            />
          </label>
          <label className="ui-label">
            Estimated claim amount (₹)
            <input
              type="number"
              name="estimatedClaimAmount"
              min="0"
              step="any"
              value={formData.estimatedClaimAmount}
              onChange={handleChange}
              className="ui-input"
            />
          </label>
          <label className="ui-label">
            Claim number
            <input
              type="text"
              name="claimNo"
              value={formData.claimNo}
              onChange={handleChange}
              className="ui-input"
            />
          </label>
          <label className="ui-label">
            Policy number
            <input
              type="text"
              name="policyNo"
              value={formData.policyNo}
              onChange={handleChange}
              className="ui-input"
            />
          </label>

          <div>
            <span className="ui-label">Documents (optional)</span>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-indigo-700"
            />
            {selectedFileNames.length > 0 && (
              <ul className="mt-2 space-y-1">
                {selectedFileNames.map((name, index) => (
                  <li
                    key={`${name}-${index}`}
                    className="ui-card-compact flex items-center justify-between gap-2 px-2 py-1 text-sm"
                  >
                    <span className="truncate">{name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="shrink-0 text-sm font-medium text-rose-600 hover:underline"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {loading && uploadProgress > 0 && files.length > 0 && (
              <p className="mt-2 text-xs text-slate-500">
                Uploading… {uploadProgress}%
              </p>
            )}
          </div>
        </div>

        {error && (
          <p className="ui-alert-error flex items-start gap-2" role="alert">
            <CcmIcon name="alertCircle" size={18} className="mt-0.5 shrink-0 text-rose-600" />
            <span>{error}</span>
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="ui-btn-primary w-full"
        >
          {loading ? "Submitting…" : "Submit complaint"}
        </button>
      </form>
    </div>
  );
}
