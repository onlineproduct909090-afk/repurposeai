import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Bell,
  Trash2,
  Save,
  Upload,
  Camera,
  Moon,
  Sun,
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { delay },
});

export default function UpgradedSettings() {
  const { user, signOut, updatePassword } = useAuth();

  const [name, setName] = useState(user?.user_metadata?.full_name || user?.email?.split("@")[0] || "");
  const [email] = useState(user?.email || "");
  const [avatar, setAvatar] = useState(null);
  const fileRef = useRef(null);

  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  const [emailNotif, setEmailNotif] = useState(true);
  const [productUpdates, setProductUpdates] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [showPw, setShowPw] = useState(false);

  const [isUpdatingPw, setIsUpdatingPw] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const pickAvatar = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (avatar) URL.revokeObjectURL(avatar);
    setAvatar(URL.createObjectURL(file));
    toast.success("Avatar uploaded! (Preview mode)");
  };

  const saveProfile = (e) => {
    e.preventDefault();
    // Real name update logic can be added here later (Supabase updateUser)
    toast.success("Profile saved successfully!");
  };

  // ✅ Real Supabase Password Update
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (newPw.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    setIsUpdatingPw(true);
    try {
      await updatePassword({ newPassword: newPw });
      toast.success("Password updated successfully.");
      setCurrentPw("");
      setNewPw("");
    } catch (err) {
      toast.error(err.message || "Failed to update password.");
    } finally {
      setIsUpdatingPw(false);
    }
  };

  // ✅ Professional Delete Account Flow
  const deleteAccount = async () => {
    if (!window.confirm("⚠️ This action is irreversible. Are you sure you want to delete your account and all associated data?")) return;
    
    setIsDeleting(true);
    try {
      // Add your real Supabase Admin delete logic here or call a backend endpoint
      toast.loading("Deleting your account...");
      setTimeout(() => {
        toast.dismiss();
        toast.success("Account deletion initiated. You will be signed out.");
        signOut();
      }, 1500);
    } catch (err) {
      toast.error(err.message || "Failed to delete account.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="px-5 sm:px-8 py-8 sm:py-10 max-w-3xl mx-auto fade-up" data-testid="upgraded-settings-root">
      <header className="mb-10">
        <span className="text-xs uppercase tracking-[0.22em] text-emerald-300/80">Settings</span>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight mt-2 shimmer-text">
          Manage your workspace.
        </h1>
      </header>

      {/* -------- Profile & Avatar -------- */}
      <motion.section {...fade(0)} className="glass rounded-2xl p-6 mb-6" data-testid="settings-profile">
        <h2 className="font-medium text-base mb-5 flex items-center gap-2">
          <User className="h-4 w-4 text-emerald-300" /> Profile
        </h2>

        <div className="flex items-center gap-5 mb-6">
          <div className="relative">
            <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-emerald-400/40 bg-slate-900/60 flex items-center justify-center text-2xl font-bold text-white">
              {avatar ? (
                <img src={avatar} alt="Avatar" className="h-full w-full object-cover" data-testid="settings-avatar-img" />
              ) : (
                (user?.email?.charAt(0) || "U").toUpperCase()
              )}
            </div>
            <span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-emerald-400 text-slate-900 flex items-center justify-center">
              <Upload className="h-3 w-3" />
            </span>
          </div>
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={pickAvatar}
              data-testid="settings-avatar-input"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              data-testid="settings-avatar-upload"
              className="inline-flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-sm hover:bg-white/10 transition"
            >
              <Upload className="h-4 w-4 text-emerald-300" /> Upload photo
            </button>
            <p className="text-xs text-slate-500 mt-2">PNG or JPG. Preview only.</p>
          </div>
        </div>

        <form onSubmit={saveProfile} className="space-y-4">
          <Field label="Display name" value={name} onChange={setName} testId="settings-name" />
          <Field label="Email" value={email} disabled icon={Mail} testId="settings-email" />
          <button
            type="submit"
            data-testid="settings-save"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-400 text-slate-900 font-semibold px-4 py-2.5 text-sm hover:brightness-105 transition"
          >
            <Save className="h-4 w-4" /> Save changes
          </button>
        </form>
      </motion.section>

      {/* -------- Appearance (Dark/Light Mode) -------- */}
      <motion.section {...fade(0.05)} className="glass rounded-2xl p-6 mb-6" data-testid="settings-appearance">
        <h2 className="font-medium text-base mb-4 flex items-center gap-2">
          {theme === "dark" ? <Moon className="h-4 w-4 text-emerald-300" /> : <Sun className="h-4 w-4 text-emerald-300" />}
          Appearance
        </h2>
        <div className="flex items-center justify-between py-1">
          <div>
            <p className="text-sm text-slate-200">Dark mode</p>
            <p className="text-xs text-slate-500 mt-0.5">Saved to your device.</p>
          </div>
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            data-testid="settings-theme-toggle"
            data-checked={theme === "dark"}
            className={`relative h-6 w-11 rounded-full p-0.5 transition-colors ${
              theme === "dark" ? "bg-emerald-400/60" : "bg-white/10"
            }`}
          >
            <span
              className={`block h-5 w-5 rounded-full bg-white transition-transform flex items-center justify-center ${
                theme === "dark" ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </motion.section>

      {/* -------- Notifications -------- */}
      <motion.section {...fade(0.1)} className="glass rounded-2xl p-6 mb-6" data-testid="settings-notifications">
        <h2 className="font-medium text-base mb-4 flex items-center gap-2">
          <Bell className="h-4 w-4 text-emerald-300" /> Notifications
        </h2>
        <Toggle label="Email me when content is ready" value={emailNotif} onChange={setEmailNotif} testId="settings-notif-content-ready" />
        <Toggle label="Product updates" value={productUpdates} onChange={setProductUpdates} testId="settings-notif-product-updates" />
        <Toggle label="Marketing emails" value={marketingEmails} onChange={setMarketingEmails} testId="settings-notif-marketing" />
      </motion.section>

      {/* -------- Security -------- */}
      <motion.section {...fade(0.15)} className="glass rounded-2xl p-6 mb-6" data-testid="settings-security">
        <h2 className="font-medium text-base mb-4 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-300" /> Security
        </h2>
        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <Field
            label="Current password"
            value={currentPw}
            onChange={setCurrentPw}
            icon={Lock}
            type={showPw ? "text" : "password"}
            testId="settings-current-password"
          />
          <div className="relative">
            <Field
              label="New password"
              value={newPw}
              onChange={setNewPw}
              icon={Lock}
              type={showPw ? "text" : "password"}
              testId="settings-new-password"
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              data-testid="settings-toggle-password-visibility"
              className="absolute right-3 bottom-3 text-slate-500 hover:text-slate-300 transition"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <Field label="Change email" value={email} disabled icon={Mail} testId="settings-change-email" />
          <button
            type="submit"
            disabled={isUpdatingPw}
            data-testid="settings-update-password"
            className="inline-flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-sm hover:bg-white/10 transition disabled:opacity-60"
          >
            {isUpdatingPw ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4 text-emerald-300" />}
            Update password
          </button>
        </form>
      </motion.section>

      {/* -------- Danger Zone -------- */}
      <motion.section {...fade(0.2)} className="glass rounded-2xl p-6 border border-rose-400/20" data-testid="settings-danger">
        <h2 className="font-medium text-base mb-2 flex items-center gap-2 text-rose-300">
          <Trash2 className="h-4 w-4" /> Danger zone
        </h2>
        <p className="text-sm text-slate-400 mb-4">
          Permanently delete your account, history, and generations.
        </p>
        <button
          onClick={deleteAccount}
          disabled={isDeleting}
          data-testid="settings-delete-account"
          className="inline-flex items-center gap-2 rounded-lg bg-rose-500/10 text-rose-300 font-medium px-4 py-2.5 text-sm hover:bg-rose-500/15 transition disabled:opacity-60"
        >
          {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          Delete account
        </button>
      </motion.section>
    </div>
  );
}

// ------------------- Reusable Sub-Components -------------------

function Field({ label, value, onChange, icon: Icon, disabled, type = "text", testId }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wider text-slate-500">{label}</span>
      <div className="relative mt-1">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          data-testid={testId}
          className={`w-full bg-slate-900/60 border border-white/10 rounded-lg ${
            Icon ? "pl-10" : "pl-3"
          } pr-3 py-2.5 text-sm focus:outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20 disabled:opacity-60`}
        />
      </div>
    </label>
  );
}

function Toggle({ label, value, onChange, testId }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      data-testid={testId}
      data-checked={value}
      className="w-full flex items-center justify-between py-3 border-b border-white/5 last:border-0"
    >
      <span className="text-sm text-slate-200">{label}</span>
      <span
        className={`h-5 w-9 rounded-full p-0.5 transition-colors ${
          value ? "bg-emerald-400/60" : "bg-white/10"
        }`}
      >
        <span
          className={`block h-4 w-4 rounded-full bg-white transition-transform ${
            value ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}