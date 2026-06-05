import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import CcmAppShell from "@/components/CcmAppShell";
import CcmBottomNav from "@/components/CcmBottomNav";
import CcmServiceGroup, { CcmServiceTile } from "@/components/CcmServiceGroup";
import FileYourComplaint from "@/components/FileYourComplaint";
import KnowYourPolicy from "@/components/KnowYourPolicy";
import OngoingComplaintStatus from "@/components/OngoingComplaintStatus";
import PolicyAnalysis from "@/components/PolicyAnalysis";
import SuccessFeesCalculator from "@/components/SuccessFeesCalculator";
import ChangePassword from "@/components/ChangePassword";
import MeetOurTeam from "@/components/MeetOurTeam";
import CustomerReviews from "@/components/CustomerReviews";
import TestimonialVideos from "@/components/TestimonialVideos";
import Gallery from "@/components/Gallery";
import FromClaimantMitra from "@/components/FromClaimantMitra";
import ReferCasePromo from "@/components/ReferCasePromo";
import Parigyan from "@/components/Parigyan";
import CcmIcon from "@/components/CcmIcon";

const PANEL_TITLES = {
  complaint: "File Your Complaint",
  referCase: "Refer a Case",
  policy: "Know Your Policy",
  status: "Complaint Status",
  policyAnalysis: "Policy Analysis",
  successFees: "Success Fees",
  team: "Meet Our Team",
  parigyan: "Parigyan",
};

const TAB_TITLES = {
  home: "Claimant Mitra",
  services: "Services",
  account: "Account",
};

const TAB_SUBTITLES = {
  home: (customer) =>
    customer ? `Hello, ${customer.name?.split(" ")[0] || "Customer"}` : "Customer portal",
  services: () => "Case tools & support",
  account: (customer) => customer?.name || "Your account",
};

const SERVICE_GROUPS = [
  {
    id: "claim",
    title: "My claim",
    accent: "claim",
    items: [
      {
        id: "complaint",
        label: "File Complaint",
        short: "Complaint",
        icon: "filePlus",
        accent: "complaint",
        primary: true,
      },
      {
        id: "status",
        label: "Complaint Status",
        short: "Status",
        icon: "listChecks",
        accent: "status",
      },
    ],
  },
  {
    id: "policy",
    title: "Policy and fees",
    accent: "policy",
    items: [
      {
        id: "policy",
        label: "Know Your Policy",
        short: "Policy",
        icon: "fileText",
        accent: "policy",
      },
      {
        id: "policyAnalysis",
        label: "Policy Analysis",
        short: "Analysis",
        icon: "clipboardCheck",
        accent: "analysis",
      },
      {
        id: "successFees",
        label: "Success Fees Calculator",
        short: "Fees",
        icon: "calculator",
        accent: "fees",
      },
    ],
  },
  {
    id: "learn",
    title: "Learn and support",
    accent: "learn",
    items: [
      {
        id: "parigyan",
        label: "Parigyan",
        short: "Parigyan",
        icon: "bookOpen",
        accent: "parigyan",
      },
      {
        id: "team",
        label: "Meet Our Team",
        short: "Team",
        icon: "users",
        accent: "team",
      },
    ],
  },
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
  const [activeTab, setActiveTab] = useState("home");
  const [activePanel, setActivePanel] = useState(null);
  const [panelOriginTab, setPanelOriginTab] = useState("services");
  const [profileExpanded, setProfileExpanded] = useState(false);

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

  const openPanel = (panelId, originTab = "services") => {
    setPanelOriginTab(originTab);
    setActivePanel(panelId);
  };

  const handlePanelBack = () => {
    setActivePanel(null);
    setActiveTab(panelOriginTab);
  };

  const shellTitle = activePanel
    ? PANEL_TITLES[activePanel]
    : TAB_TITLES[activeTab];
  const shellSubtitle = activePanel
    ? customer?.name
    : TAB_SUBTITLES[activeTab](customer);

  return (
    <CcmAppShell
      title={shellTitle}
      subtitle={shellSubtitle}
      onBack={activePanel ? handlePanelBack : undefined}
      hasBottomNav={!activePanel}
      bottomNav={
        <CcmBottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          hidden={!!activePanel}
        />
      }
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

      {!loading && customer && !activePanel && activeTab === "home" && (
        <div className="ccm-tab-panel-home">
          <div className="ccm-home-hero">
            <p className="text-xs font-bold uppercase tracking-widest text-violet-700">
              Welcome back
            </p>
            <h2 className="ccm-home-hero-title mt-1">
              {customer.name?.split(" ")[0] || "Customer"}
            </h2>
            <p className="mt-2 text-sm text-slate-700">
              Stories, updates, and ways to earn — all in one place.
            </p>
          </div>

          <ReferCasePromo onRefer={() => openPanel("referCase", "home")} />

          <CustomerReviews />
          <TestimonialVideos />
          <Gallery />
          <FromClaimantMitra />
        </div>
      )}

      {!loading && customer && !activePanel && activeTab === "services" && (
        <div className="ccm-tab-panel-services">
          <div className="ui-page-intro">
            <div className="flex items-center gap-2">
              <CcmIcon name="sparkles" size={22} className="text-indigo-600" />
              <p className="ui-section-eyebrow mb-0!">Your services</p>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              File claims, check status, and explore policy tools.
            </p>
          </div>

          {SERVICE_GROUPS.map((group) => (
            <CcmServiceGroup
              key={group.id}
              title={group.title}
              accent={group.accent}
            >
              {group.items.map((item) => (
                <CcmServiceTile
                  key={item.id}
                  item={item}
                  onClick={() => openPanel(item.id, "services")}
                />
              ))}
            </CcmServiceGroup>
          ))}
        </div>
      )}

      {!loading && customer && !activePanel && activeTab === "account" && (
        <div className="ccm-tab-panel-account">
          <div className="ui-page-intro">
            <div className="flex items-center gap-2">
              <CcmIcon name="user" size={22} className="text-teal-600" />
              <p className="ui-section-eyebrow mb-0!">Your account</p>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Profile, security, and sign out.
            </p>
          </div>

          <div className="ui-card-padded space-y-0 p-4!">
            <button
              type="button"
              onClick={() => setProfileExpanded((v) => !v)}
              className="flex w-full items-center justify-between gap-3 text-left"
              aria-expanded={profileExpanded}
            >
              <span className="flex items-center gap-2">
                <CcmIcon name="user" size={18} className="text-indigo-500" />
                <span className="text-sm font-semibold text-slate-900">
                  Profile details
                </span>
              </span>
              <CcmIcon
                name={profileExpanded ? "chevronUp" : "chevronDown"}
                size={18}
                className="text-slate-500"
              />
            </button>

            {profileExpanded && (
              <div className="mt-3 space-y-0">
                {PROFILE_FIELDS.map((field) => (
                  <div key={field.key} className="ccm-stat-row">
                    <span className="ccm-stat-label">
                      <CcmIcon
                        name={field.icon}
                        size={16}
                        className="text-indigo-500"
                      />
                      {field.label}
                    </span>
                    <span
                      className={`ccm-stat-value ${
                        field.breakAll ? "break-all" : ""
                      } ${field.mono ? "font-mono text-xs" : ""}`}
                    >
                      {field.getValue(customer)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <ChangePassword />

          <button
            type="button"
            onClick={handleLogout}
            className="ccm-account-signout"
          >
            <CcmIcon name="logOut" size={18} className="text-rose-700" />
            Sign out
          </button>
        </div>
      )}

      {!loading && customer && activePanel === "complaint" && (
        <FileYourComplaint
          userId={userId}
          customer={customer}
          onSuccess={loadCustomer}
        />
      )}

      {!loading && customer && activePanel === "referCase" && (
        <FileYourComplaint
          userId={userId}
          customer={customer}
          mode="refer"
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

      {!loading && customer && activePanel === "team" && <MeetOurTeam />}

      {!loading && customer && activePanel === "parigyan" && <Parigyan />}
    </CcmAppShell>
  );
}
