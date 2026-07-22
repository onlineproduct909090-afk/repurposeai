import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, ArrowRight, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async"; // ✅ Professional SEO/Title (install karna hai)
import { useAuth } from "../context/AuthContext";

// ✅ Password Strength Score (Robust check)
function getPasswordScore(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 5);
}

const STRENGTH_META = [
  { label: "Too short", color: "bg-rose-500/70", text: "text-rose-300" },
  { label: "Weak", color: "bg-orange-400/70", text: "text-orange-300" },
  { label: "Fair", color: "bg-amber-400/70", text: "text-amber-300" },
  { label: "Strong", color: "bg-emerald-400/70", text: "text-emerald-300" },
  { label: "Very Strong", color: "bg-teal-400/70", text: "text-teal-300" },
  { label: "Elite", color: "bg-cyan-400/80", text: "text-cyan-300" },
];

export default function ResetPassword() {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);

  const score = useMemo(() => getPasswordScore(pw), [pw]);
  const meta = STRENGTH_META[score];

  const submit = async (e) => {
    e.preventDefault();
    if (pw.length < 6) return toast.error("Password must be at least 6 characters");
    if (pw !== confirm) return toast.error("Passwords do not match");

    setBusy(true);
    try {
      // ✅ FIX: object { newPassword } pass kiya
      await updatePassword({ newPassword: pw });
      toast.success("Password updated — please sign in");
      navigate("/login", { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {/* ✅ Professional Page Title for SEO */}
      <Helmet>
        <title>Reset Password | RepurposeAI</title>
      </Helmet>

      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 relative">
        <div className="aurora" />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
          className="relative z-10 w-full max-w-md"
        >
          <Link to="/" className="flex items-center gap-2 justify-center mb-8" data-testid="reset-brand">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center shadow-[0_0_24px_rgba(45,212,191,0.55)]">
              <Sparkles className="h-5 w-5 text-slate-900" strokeWidth={2.5} />
            </div>
            <span className="font-display text-xl font-semibold">
              Repurpose<span className="text-emerald-400">AI</span>
            </span>
          </Link>

          <div className="glass rounded-2xl p-7 sm:p-8">
            <div className="flex items-center gap-2 text-emerald-300 text-xs uppercase tracking-[0.22em]">
              <ShieldCheck className="h-3.5 w-3.5" /> Reset password
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight mt-2">
              Set a new password
            </h1>
            <p className="text-sm text-slate-400 mt-2">
              Choose something strong. You'll use it to sign in from now on.
            </p>

            <form onSubmit={submit} className="mt-7 space-y-4" data-testid="reset-form">
              <PasswordField
                label="New password"
                value={pw}
                onChange={setPw}
                show={showPw}
                onToggle={() => setShowPw((s) => !s)}
                testId="reset-new-password"
                placeholder="••••••••"
              />

              {/* Strength meter */}
              <div data-testid="reset-strength" className="pt-1">
                <div className="flex gap-1.5">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <span
                      key={i}
                      className={`flex-1 h-1.5 rounded-full transition-colors ${
                        i < score ? meta.color : "bg-white/10"
                      }`}
                    />
                  ))}
                </div>
                <div className={`text-[11px] mt-2 flex items-center justify-between ${meta.text}`}>
                  <span>{pw.length ? meta.label : "Start typing…"}</span>
                  <span className="text-slate-500">
                    {pw.length} char{pw.length === 1 ? "" : "s"}
                  </span>
                </div>
              </div>

              <PasswordField
                label="Confirm new password"
                value={confirm}
                onChange={setConfirm}
                show={showPw}
                onToggle={() => setShowPw((s) => !s)}
                testId="reset-confirm-password"
                placeholder="••••••••"
              />

              <button
                type="submit"
                disabled={busy}
                data-testid="reset-submit"
                className="btn-glow w-full mt-2 rounded-lg bg-emerald-400 text-slate-900 font-semibold py-3 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Reset Password <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-sm text-center text-slate-400">
              Remembered it?{" "}
              <Link
                to="/login"
                className="text-emerald-300 hover:text-emerald-200 font-medium"
                data-testid="reset-to-login"
              >
                Sign in
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}

// ✅ Extracted outside for cleaner code & better performance
function PasswordField({ label, value, onChange, show, onToggle, testId, placeholder }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wider text-slate-500">{label}</span>
      <div className="relative mt-1">
        <Lock className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          data-testid={testId}
          placeholder={placeholder}
          className="w-full bg-slate-900/60 border border-white/10 rounded-lg pl-10 pr-11 py-3 text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20 transition"
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-200"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </label>
  );
}