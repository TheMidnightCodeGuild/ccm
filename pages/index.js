import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import PwaInstallButton from "@/components/PwaInstallButton";
import { CcmFormField } from "@/components/CcmIcon";
import CcmIcon from "@/components/CcmIcon";

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/customer/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Invalid credentials. Please try again.");
      }

      await router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ccm-app-frame min-h-screen">
      <div className="ccm-auth-header">
        <Image
          src="/images/logo.png"
          width={48}
          height={48}
          alt=""
          className="mx-auto h-12 w-12 rounded-xl ring-2 ring-white/30"
          aria-hidden
        />
        <h1 className="mt-3 text-lg font-bold text-white">Claimant Mitra</h1>
        <p className="text-xs text-white/85">Customer portal</p>
      </div>
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-8">
        <div className="ccm-auth-card">
          <div className="text-center">
            <h2 className="ccm-auth-title">Sign in</h2>
            <p className="mt-1 text-sm text-slate-600">Welcome back</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <CcmFormField icon="mail" label="Email" htmlFor="email">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="ccm-input-with-icon"
              />
            </CcmFormField>

            <div>
              <label htmlFor="password" className="ui-label">
                Password
              </label>
              <div className="relative mt-1">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <CcmIcon name="lock" size={18} className="text-slate-400" />
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="ccm-input-with-icon pr-20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-indigo-600 hover:text-indigo-800"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
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
              disabled={isLoading}
              className="ui-btn-primary w-full"
            >
              {isLoading ? "Signing in…" : "Sign in"}
            </button>

            <PwaInstallButton />
          </form>

          <p className="text-center text-sm text-slate-600">
            No account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-violet-700 underline underline-offset-2 hover:text-violet-900"
            >
              Create one
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
