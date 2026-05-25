import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { CcmFormField } from "@/components/CcmIcon";
import CcmIcon from "@/components/CcmIcon";

export default function Signup() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [aadharNo, setAadharNo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/customer/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          mobile,
          email,
          aadharNo,
          password,
        }),
        credentials: "include",
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "Could not create account.");
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
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-8">
        <div className="w-full space-y-5 rounded-2xl border border-white/50 bg-gradient-to-br from-white/98 via-white/95 to-indigo-50/90 p-6 shadow-2xl shadow-indigo-950/15 ring-1 ring-indigo-200/60">
          <div className="text-center">
            <Image
              src="/images/logo.png"
              width={72}
              height={72}
              alt="Claimant Mitra"
              className="mx-auto h-14 w-auto rounded-xl"
            />
            <h1 className="mt-3 text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-900 to-indigo-700 bg-clip-text text-transparent">
              Create account
            </h1>
            <p className="mt-1 text-sm text-slate-600">Register for customer access</p>
          </div>

          <form className="space-y-3" onSubmit={handleSubmit}>
            <CcmFormField icon="user" label="Full name" htmlFor="name">
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="ccm-input-with-icon"
              />
            </CcmFormField>

            <CcmFormField icon="phone" label="Mobile (10 digits)" htmlFor="mobile">
              <input
                id="mobile"
                name="mobile"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                required
                maxLength={15}
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="ccm-input-with-icon"
              />
            </CcmFormField>

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

            <CcmFormField icon="creditCard" label="Aadhar (12 digits)" htmlFor="aadharNo">
              <input
                id="aadharNo"
                name="aadharNo"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                required
                maxLength={14}
                value={aadharNo}
                onChange={(e) => setAadharNo(e.target.value)}
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
                  autoComplete="new-password"
                  required
                  minLength={6}
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
              {isLoading ? "Creating account…" : "Sign up"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link
              href="/"
              className="font-semibold text-indigo-700 underline underline-offset-2 hover:text-indigo-900"
            >
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
