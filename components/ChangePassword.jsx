import { useState } from "react";
import CcmIcon from "@/components/CcmIcon";

function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  show,
  onToggleShow,
}) {
  return (
    <div>
      <label htmlFor={id} className="ui-label">
        {label}
      </label>
      <div className="relative mt-1">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <CcmIcon name="lock" size={18} className="text-slate-400" />
        </span>
        <input
          id={id}
          name={id}
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          required
          value={value}
          onChange={onChange}
          className="ccm-input-with-icon pr-20"
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-indigo-600 hover:text-indigo-800"
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    if (newPassword === currentPassword) {
      setError("New password must be different from your current password.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/customer/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Failed to update password.");
      }

      setSuccess(data.message || "Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ui-card-padded space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <CcmIcon name="lock" size={20} className="text-indigo-600" />
          <h3 className="text-sm font-semibold text-slate-900">Change password</h3>
        </div>
        <p className="mt-1 text-xs text-slate-600">
          Enter your current password, then choose a new one.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <PasswordField
          id="currentPassword"
          label="Current password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          autoComplete="current-password"
          show={showCurrent}
          onToggleShow={() => setShowCurrent((v) => !v)}
        />
        <PasswordField
          id="newPassword"
          label="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
          show={showNew}
          onToggleShow={() => setShowNew((v) => !v)}
        />
        <PasswordField
          id="confirmPassword"
          label="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          show={showConfirm}
          onToggleShow={() => setShowConfirm((v) => !v)}
        />

        {error && (
          <p className="ui-alert-error flex items-start gap-2" role="alert">
            <CcmIcon
              name="alertCircle"
              size={18}
              className="mt-0.5 shrink-0 text-rose-600"
            />
            <span>{error}</span>
          </p>
        )}

        {success && (
          <p
            className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
            role="status"
          >
            {success}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="ui-btn-primary w-full"
        >
          {loading ? "Updating…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
