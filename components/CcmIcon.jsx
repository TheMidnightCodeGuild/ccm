import {
  AlertCircle,
  Briefcase,
  Calculator,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Star,
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
  UserPlus,
  Users,
  Video,
} from "lucide-react";

const ICONS = {
  filePlus: FilePlus,
  fileText: FileText,
  listChecks: ListChecks,
  clipboardCheck: ClipboardCheck,
  calculator: Calculator,
  user: User,
  userPlus: UserPlus,
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
  chevronRight: ChevronRight,
  chevronUp: ChevronUp,
  star: Star,
  shield: Shield,
  users: Users,
  video: Video,
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

const BADGE_ICON_COLORS = {
  complaint: "text-indigo-700",
  refer: "text-emerald-700",
  policy: "text-sky-700",
  status: "text-amber-800",
  analysis: "text-violet-700",
  fees: "text-orange-700",
  team: "text-teal-700",
};

export function CcmIconBadge({ name, accent = "complaint", className = "" }) {
  const iconColor = BADGE_ICON_COLORS[accent] || BADGE_ICON_COLORS.complaint;
  return (
    <span
      className={`ccm-icon-badge ccm-icon-badge--${accent} ${className}`.trim()}
    >
      <CcmIcon name={name} size={22} className={iconColor} />
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
