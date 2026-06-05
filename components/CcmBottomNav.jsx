import CcmIcon from "@/components/CcmIcon";

const TABS = [
  { id: "home", label: "Home", icon: "layoutGrid", accent: "home" },
  { id: "services", label: "Services", icon: "sparkles", accent: "services" },
  { id: "account", label: "Account", icon: "user", accent: "account" },
];

export default function CcmBottomNav({ activeTab, onTabChange, hidden }) {
  if (hidden) return null;

  return (
    <nav
      className="ccm-bottom-nav"
      aria-label="Main navigation"
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`ccm-bottom-nav-item ccm-bottom-nav-item--${tab.accent}${
              isActive ? " ccm-bottom-nav-item--active" : ""
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            <CcmIcon
              name={tab.icon}
              size={22}
              className={
                isActive
                  ? `ccm-bottom-nav-icon--active-${tab.accent}`
                  : "text-slate-500"
              }
            />
            <span className="ccm-bottom-nav-label">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
