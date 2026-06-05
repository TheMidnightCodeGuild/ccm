import CcmIcon, { CcmIconBadge } from "@/components/CcmIcon";

export default function CcmServiceGroup({
  title,
  accent,
  children,
  className = "",
}) {
  return (
    <section
      className={`ccm-service-group ccm-service-group--${accent} ${className}`.trim()}
    >
      <div className={`ccm-service-group-header ccm-service-group-header--${accent}`}>
        <h3 className="text-sm font-bold tracking-tight">{title}</h3>
      </div>
      <div className="ccm-service-group-body">{children}</div>
    </section>
  );
}

export function CcmServiceTile({ item, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`ccm-service-tile ccm-service-tile--${item.accent}${
        item.primary ? " ccm-service-tile--primary" : ""
      }`}
    >
      <CcmIconBadge name={item.icon} accent={item.accent} />
      <div className="min-w-0 flex-1 pr-6 text-left">
        <span className="block text-sm font-semibold text-slate-900">
          {item.short}
        </span>
        <span className="block text-xs leading-tight text-slate-600">
          {item.label}
        </span>
      </div>
      <CcmIcon
        name="chevronRight"
        size={16}
        className="ccm-service-tile-chevron text-slate-400"
      />
    </button>
  );
}
