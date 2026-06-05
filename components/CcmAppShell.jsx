import Image from "next/image";
import CcmIcon from "@/components/CcmIcon";

export default function CcmAppShell({
  title,
  subtitle,
  onBack,
  onLogout,
  bottomNav,
  hasBottomNav = false,
  children,
}) {
  return (
    <div className="ccm-app-frame">
      <header className="ccm-app-header">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="inline-flex shrink-0 items-center justify-center rounded-lg p-1.5 text-white/90 ring-1 ring-white/20 hover:bg-white/10"
                aria-label="Go back"
              >
                <CcmIcon name="chevronLeft" size={20} className="text-white" />
              </button>
            ) : (
              <Image
                src="/images/logo.png"
                width={28}
                height={28}
                alt=""
                className="h-7 w-7 shrink-0 rounded-lg ring-1 ring-white/25"
                aria-hidden
              />
            )}
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold tracking-tight text-white">
                {title}
              </h1>
              {subtitle && (
                <p className="truncate text-xs text-white/85">{subtitle}</p>
              )}
            </div>
          </div>
          {onLogout && !hasBottomNav && (
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/25 hover:bg-white/20"
            >
              <CcmIcon name="logOut" size={14} className="text-white" />
              Sign out
            </button>
          )}
        </div>
      </header>
      <main
        className={`ccm-app-main${hasBottomNav ? " ccm-app-main--with-tabs" : ""}`}
      >
        {children}
      </main>
      {bottomNav}
    </div>
  );
}
