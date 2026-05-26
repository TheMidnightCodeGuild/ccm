import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import CcmAppShell from "@/components/CcmAppShell";
import FileYourComplaint from "@/components/FileYourComplaint";
import KnowYourPolicy from "@/components/KnowYourPolicy";
import OngoingComplaintStatus from "@/components/OngoingComplaintStatus";
import PolicyAnalysis from "@/components/PolicyAnalysis";
import SuccessFeesCalculator from "@/components/SuccessFeesCalculator";
import ChangePassword from "@/components/ChangePassword";
import CcmIcon, { CcmIconBadge } from "@/components/CcmIcon";

const PANEL_TITLES = {
  complaint: "File Your Complaint",
  policy: "Know Your Policy",
  status: "Complaint Status",
  policyAnalysis: "Policy Analysis",
  successFees: "Success Fees",
};

const NAV_ITEMS = [
  { id: "complaint", label: "File Complaint", short: "Complaint", icon: "filePlus", primary: true },
  { id: "policy", label: "Know Your Policy", short: "Policy", icon: "fileText" },
  { id: "status", label: "Complaint Status", short: "Status", icon: "listChecks" },
  { id: "policyAnalysis", label: "Policy Analysis", short: "Analysis", icon: "clipboardCheck" },
  { id: "successFees", label: "Success Fees Calculator", short: "Fees", icon: "calculator" },
];

const PROFILE_FIELDS = [
  { key: "name", label: "Name", icon: "user", getValue: (c) => c.name },
  { key: "email", label: "Email", icon: "mail", getValue: (c) => c.email, breakAll: true },
  { key: "mobile", label: "Mobile", icon: "phone", getValue: (c) => c.mobile },
  {
    key: "cases",
    label: "Cases",
    icon: "briefcase",
    getValue: (c) =>
      Array.isArray(c.cases) && c.cases.length > 0
        ? `${c.cases.length} linked`
        : "None yet",
  },
];

export async function getServerSideProps(context) {
  const { req } = context;
  const cookies = req.cookies;

  if (!cookies.session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      userId: cookies.session,
    },
  };
}

export default function Dashboard({ userId }) {
  const router = useRouter();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePanel, setActivePanel] = useState(null);

  const loadCustomer = useCallback(async () => {
    const ref = doc(db, "customers", userId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      setError("Customer profile not found.");
      setCustomer(null);
    } else {
      setCustomer(snap.data());
      setError(null);
    }
  }, [userId]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        await loadCustomer();
      } catch (e) {
        if (!cancelled) setError(e.message || "Failed to load profile");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [loadCustomer]);

  const handleLogout = () => {
    document.cookie =
      "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/");
  };

  const shellTitle = activePanel ? PANEL_TITLES[activePanel] : "Claimant Mitra";
  const shellSubtitle = activePanel
    ? customer?.name
    : customer
      ? `Hello, ${customer.name?.split(" ")[0] || "Customer"}`
      : "Customer portal";

  return (
    <CcmAppShell
      title={shellTitle}
      subtitle={shellSubtitle}
      onBack={activePanel ? () => setActivePanel(null) : undefined}
      onLogout={handleLogout}
    >
      {loading && (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="ui-spinner" />
        </div>
      )}

      {error && !loading && !customer && (
        <p className="ui-alert-error" role="alert">
          {error}
        </p>
      )}

      {!loading && customer && !activePanel && (
        <div className="space-y-5">
          <div className="ui-page-intro">
            <div className="flex items-center gap-2">
              <CcmIcon name="layoutGrid" size={22} />
              <p className="ui-section-eyebrow !mb-0">Your profile</p>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Tap a service below to get started.
            </p>
          </div>

          <div className="ui-card-padded space-y-0 !p-4">
            {PROFILE_FIELDS.map((field) => (
              <div key={field.key} className="ccm-stat-row">
                <span className="ccm-stat-label">
                  <CcmIcon name={field.icon} size={16} className="text-indigo-500" />
                  {field.label}
                </span>
                <span
                  className={`ccm-stat-value ${field.breakAll ? "break-all" : ""} ${field.mono ? "font-mono text-xs" : ""}`}
                >
                  {field.getValue(customer)}
                </span>
              </div>
            ))}
          </div>

          <ChangePassword />

          <div className="grid grid-cols-2 gap-3">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActivePanel(item.id)}
                className={
                  item.primary
                    ? "ccm-nav-tile ring-2 ring-indigo-400/40"
                    : "ccm-nav-tile"
                }
              >
                <CcmIconBadge name={item.icon} />
                <span className="text-sm font-semibold text-slate-900">
                  {item.short}
                </span>
                <span className="text-xs leading-tight text-slate-600">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {!loading && customer && activePanel === "complaint" && (
        <FileYourComplaint
          userId={userId}
          customer={customer}
          onSuccess={loadCustomer}
        />
      )}

      {!loading && customer && activePanel === "policy" && (
        <KnowYourPolicy
          userId={userId}
          customer={customer}
          onUpdated={loadCustomer}
        />
      )}

      {!loading && customer && activePanel === "status" && (
        <OngoingComplaintStatus customer={customer} />
      )}

      {!loading && customer && activePanel === "policyAnalysis" && (
        <PolicyAnalysis userId={userId} />
      )}

      {!loading && customer && activePanel === "successFees" && (
        <SuccessFeesCalculator />
      )}
    </CcmAppShell>
  );
}
