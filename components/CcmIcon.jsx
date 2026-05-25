import {
  AlertCircle,
  Briefcase,
  Calculator,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  ClipboardCheck,
  CreditCard,
  Download,
  FilePlus,
  FileText,
  LayoutGrid,
  ListChecks,
  Lock,
  LogOut,
  Mail,
  Phone,
  Shield,
  Sparkles,
  User,
} from "lucide-react";

const ICONS = {
  filePlus: FilePlus,
  fileText: FileText,
  listChecks: ListChecks,
  clipboardCheck: ClipboardCheck,
  calculator: Calculator,
  user: User,
  mail: Mail,
  phone: Phone,
  creditCard: CreditCard,
  briefcase: Briefcase,
  logOut: LogOut,
  lock: Lock,
  download: Download,
  layoutGrid: LayoutGrid,
  sparkles: Sparkles,
  checkCircle2: CheckCircle2,
  alertCircle: AlertCircle,
  chevronDown: ChevronDown,
  chevronLeft: ChevronLeft,
  chevronUp: ChevronUp,
  shield: Shield,
};

export default function CcmIcon({
  name,
  size = 20,
  className = "text-indigo-600 shrink-0",
  strokeWidth = 2,
  "aria-hidden": ariaHidden = true,
}) {
  const Icon = ICONS[name];
  if (!Icon) return null;
  return (
    <Icon
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      aria-hidden={ariaHidden}
    />
  );
}

export function CcmIconBadge({ name, className = "" }) {
  return (
    <span className={`ccm-icon-badge ${className}`.trim()}>
      <CcmIcon name={name} size={22} className="text-indigo-700" />
    </span>
  );
}

export function CcmPageIntro({ icon, eyebrow, children }) {
  return (
    <div className="ui-page-intro !mb-0">
      <div className="flex items-center gap-2">
        <CcmIcon name={icon} size={22} />
        <p className="ui-section-eyebrow !mb-0">{eyebrow}</p>
      </div>
      {children && (
        <p className="mt-2 text-sm text-slate-600">{children}</p>
      )}
    </div>
  );
}

export function CcmFormField({ icon, label, htmlFor, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="ui-label">
        {label}
      </label>
      <div className="relative mt-1">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <CcmIcon name={icon} size={18} className="text-slate-400" />
          </span>
        )}
        {children}
      </div>
    </div>
  );
}
