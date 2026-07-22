import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// ✅ Real Supabase Auth use kar rahe hain
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const navigate = useNavigate();
  const { signUpWithEmail, signInWithGoogle, signInWithGithub, signInWithMagicLink } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [useMagicLink, setUseMagicLink] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  // ✅ Password Strength Calculator (Score 0-4)
  const getPasswordStrength = (pass) => {
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
    if (/\d/.test(pass)) score++;
    return score;
  };
  const strength = getPasswordStrength(password);
  const strengthText = ["Weak", "Fair", "Good", "Strong", "Very Strong"];
  const strengthColor = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-emerald-500"];

  // Email / Password Signup
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!agreeTerms) {
      return toast.error("Please accept the Terms & Conditions to continue.");
    }
    
    setLoading(true);
    try {
      if (useMagicLink) {
        await signInWithMagicLink({ email });
        toast.success("Magic link sent to your email!");
      } else {
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters.");
        }
        await signUpWithEmail({ email, password, name });
        toast.success("Account created! Please check your email to confirm.");
        navigate("/login");
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Social Login Handlers
  const handleSocialLogin = async (provider) => {
    setError("");
    setLoading(true);
    try {
      if (provider === "google") await signInWithGoogle();
      else if (provider === "github") await signInWithGithub();
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 relative overflow-hidden">
      <div className="aurora" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass max-w-md w-full rounded-3xl p-8 relative z-10 border border-white/10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-emerald-500/20 text-emerald-400 mb-4 mx-auto">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="font-display text-3xl font-semibold tracking-tight">Create your account</h2>
          <p className="text-slate-400 text-sm mt-1">Start turning your content into social posts.</p>
        </div>

        {/* Social Login Buttons */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => handleSocialLogin("google")}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-slate-800/80 hover:bg-slate-800 text-white border border-white/10 py-2.5 rounded-lg transition-all font-medium text-sm"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Sign up with Google
          </button>

          <button
            onClick={() => handleSocialLogin("github")}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-slate-800/80 hover:bg-slate-800 text-white border border-white/10 py-2.5 rounded-lg transition-all font-medium text-sm"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            Sign up with GitHub
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-white/10"></div>
          <span className="text-xs text-slate-500 uppercase tracking-wider">Or sign up with email</span>
          <div className="flex-1 h-px bg-white/10"></div>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required={!useMagicLink}
              placeholder="John Doe"
              className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@studio.com"
              className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20 transition"
            />
          </div>

          {!useMagicLink && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={!useMagicLink}
                placeholder="•••••••• (min 6 chars)"
                className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20 transition"
              />
              
              {/* ✅ Password Strength Meter */}
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex h-1.5 w-full rounded-full bg-slate-700 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${strengthColor[strength]}`}
                      style={{ width: `${(strength / 4) * 100}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 text-right">
                    Strength: {strengthText[strength]}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ✅ Terms & Conditions Checkbox */}
          <div className="flex items-start gap-2 mt-2">
            <input
              type="checkbox"
              id="terms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-white/10 bg-slate-900/50 text-emerald-400 focus:ring-emerald-400"
            />
            <label htmlFor="terms" className="text-xs text-slate-400">
              I agree to the{" "}
              <Link to="/terms" className="text-emerald-400 hover:text-emerald-300">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-emerald-400 hover:text-emerald-300">
                Privacy Policy
              </Link>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-glow w-full bg-emerald-400 text-slate-900 font-semibold py-2.5 rounded-lg transition-transform disabled:opacity-60 flex justify-center items-center"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              useMagicLink ? "Send Magic Link" : "Create Account"
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="flex flex-col items-center gap-3 mt-6 text-xs text-slate-400">
          <button
            type="button"
            onClick={() => setUseMagicLink(!useMagicLink)}
            className="hover:text-slate-200 transition-colors underline decoration-dotted"
          >
            {useMagicLink ? "Use password instead" : "Sign up with magic link (no password)"}
          </button>
          <p>
            Already have an account?{" "}
            <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}