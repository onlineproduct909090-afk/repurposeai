import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { 
  User, Mail, Bell, Trash2, Save, Loader2, Moon, Sun, UploadCloud, Download, CreditCard, Check, Lock 
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

// ✅ Fix: Relative path use kiya
import { useAuth } from "../context/AuthContext";

// ✅ Supabase Client (Environment variables frontend .env mein define hone chahiye)
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function Settings() {
  const { user, logout } = useAuth();
  const fileInputRef = useRef(null);
  
  // --- State Variables ---
  const [displayName, setDisplayName] = useState(user?.user_metadata?.full_name || user?.email?.split("@")[0] || "");
  const [email] = useState(user?.email || "");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Password State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Notifications & Theme State
  const [emailNotif, setEmailNotif] = useState(true);
  const [productUpdates, setProductUpdates] = useState(false);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [theme, setTheme] = useState("dark");

  // --- Load Initial Data ---
  useEffect(() => {
    const savedTheme = localStorage.getItem("app_theme") || "dark";
    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  // --- Handlers ---

  // 1. Save Profile (Name)
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: displayName }
      });
      if (error) throw new Error(error.message);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Change Password
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return toast.error("Passwords do not match");
    if (newPassword.length < 6) return toast.error("Password must be at least 6 characters");
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw new Error(error.message);
      toast.success("Password changed successfully!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. Avatar Upload (Preview only, baad mein Supabase Storage connect karenge)
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setAvatarPreview(imageUrl);
      toast.success("Avatar uploaded! (Preview mode)");
    }
  };

  // 4. Theme Toggle
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("app_theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    toast.success(`Theme switched to ${newTheme} mode`);
  };

  // 5. Export Data (Download JSON)
  const handleExportData = async () => {
    toast.loading("Preparing your data...");
    try {
      const { data: history, error } = await supabase
        .from("history")
        .select("*")
        .eq("user_id", user.id);
      if (error) throw error;

      const exportData = {
        user: { email: user.email, name: displayName },
        history: history || [],
        exportedAt: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `repurposeai-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.dismiss();
      toast.success("Data exported successfully!");
    } catch (err) {
      toast.dismiss();
      toast.error("Failed to export data");
    }
  };

  // 6. Delete Account
  const wipe = () => {
    if (!window.confirm("Delete your account? This is irreversible (in real life).")) return;
    toast.success("Account scheduled for deletion");
    setTimeout(() => logout(), 500);
  };

  return (
    <div className="px-5 sm:px-8 py-8 sm:py-10 max-w-4xl mx-auto fade-up" data-testid="settings-root">
      <header className="mb-10">
        <span className="text-xs uppercase tracking-[0.22em] text-emerald-300/80">Settings</span>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight mt-2">
          Manage your <span className="text-emerald-300">workspace</span>.
        </h1>
      </header>

      {/* ----- 1. PROFILE SECTION ----- */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6 mb-6"
        data-testid="settings-profile"
      >
        <h2 className="font-medium text-base mb-4 flex items-center gap-2">
          <User className="h-4 w-4 text-emerald-300" /> Profile
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-6 items-start mb-6">
          {/* Avatar Upload UI */}
          <div className="flex flex-col items-center gap-3 shrink-0">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-emerald-500 to-slate-800 flex items-center justify-center text-4xl font-bold text-white relative overflow-hidden border-2 border-emerald-400/30 shadow-[0_0_24px_rgba(45,212,191,0.25)]">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                (user?.email?.charAt(0) || "U").toUpperCase()
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*" 
              className="hidden" 
              onChange={handleAvatarChange}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="text-xs bg-slate-800/80 hover:bg-slate-800 border border-white/10 px-3 py-1 rounded-full transition flex items-center gap-1"
            >
              <UploadCloud className="h-3 w-3" /> Upload
            </button>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSaveProfile} className="flex-1 w-full space-y-3">
            <Field
              label="Display name"
              value={displayName}
              onChange={setDisplayName}
              testId="settings-name"
            />
            <Field
              label="Email"
              value={email}
              disabled
              icon={Mail}
              testId="settings-email"
            />
          </form>
        </div>

        <button
          type="button"
          onClick={handleSaveProfile}
          disabled={loading}
          data-testid="settings-save"
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-400 text-slate-900 font-semibold px-4 py-2.5 text-sm hover:brightness-105 transition disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} 
          Save changes
        </button>
      </motion.section>

      {/* ----- 2. SECURITY SECTION ----- */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass rounded-2xl p-6 mb-6"
        data-testid="settings-security"
      >
        <h2 className="font-medium text-base mb-4 flex items-center gap-2">
          <Lock className="h-4 w-4 text-sky-300" /> Security
        </h2>
        <form onSubmit={handlePasswordChange} className="space-y-3 max-w-md">
          <div>
            <label className="text-[11px] uppercase tracking-wider text-slate-500 block mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min. 6 characters"
              className="w-full bg-slate-900/60 border border-white/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20"
            />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-wider text-slate-500 block mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="w-full bg-slate-900/60 border border-white/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-sky-400 text-slate-900 font-semibold px-4 py-2.5 text-sm hover:brightness-105 transition disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />} 
            Update Password
          </button>
        </form>
      </motion.section>

      {/* ----- 3. PREFERENCES SECTION ----- */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-6 mb-6"
        data-testid="settings-preferences"
      >
        <h2 className="font-medium text-base mb-4 flex items-center gap-2">
          <Bell className="h-4 w-4 text-purple-300" /> Preferences
        </h2>
        
        {/* Theme Toggle */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-3">
          <div className="flex items-center gap-3">
            {theme === "dark" ? <Moon className="h-5 w-5 text-slate-300" /> : <Sun className="h-5 w-5 text-yellow-400" />}
            <div>
              <p className="text-sm font-medium">App Theme</p>
              <p className="text-xs text-slate-400">{theme === "dark" ? "Dark Mode" : "Light Mode"}</p>
            </div>
          </div>
          <button 
            onClick={toggleTheme} 
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${theme === 'dark' ? 'bg-emerald-400' : 'bg-slate-600'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        {/* Notification Toggles */}
        <Toggle
          label="Email me when content is ready"
          value={emailNotif}
          onChange={setEmailNotif}
          testId="settings-notif-email"
        />
        <Toggle
          label="Product updates & tips"
          value={productUpdates}
          onChange={setProductUpdates}
          testId="settings-notif-product"
        />
        <Toggle
          label="Marketing emails & offers"
          value={marketingEmails}
          onChange={setMarketingEmails}
          testId="settings-notif-marketing"
        />
      </motion.section>

      {/* ----- 4. SUBSCRIPTION & DATA SECTION ----- */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass rounded-2xl p-6 mb-6"
        data-testid="settings-billing"
      >
        <h2 className="font-medium text-base mb-4 flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-indigo-300" /> Subscription & Data
        </h2>
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div>
            <p className="text-sm text-slate-400">Current Plan</p>
            <p className="font-medium text-lg">{user?.plan || "Free"} <span className="text-xs text-emerald-400 font-normal">Plan</span></p>
          </div>
          <Link to="/app/subscription" className="text-sm text-emerald-400 hover:text-emerald-300 font-medium underline decoration-dotted">
            Manage / Upgrade
          </Link>
        </div>
        
        {/* Export Data */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <p className="text-sm font-medium">Export your data</p>
            <p className="text-xs text-slate-400">Download all your past generations in JSON format.</p>
          </div>
          <button 
            onClick={handleExportData} 
            className="bg-slate-800/80 hover:bg-slate-800 border border-white/10 px-4 py-2 rounded-lg text-sm transition flex items-center gap-2"
          >
            <Download className="h-4 w-4" /> Export
          </button>
        </div>
      </motion.section>

      {/* ----- 5. DANGER ZONE ----- */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-2xl p-6 border border-rose-500/20 bg-rose-500/5"
        data-testid="settings-danger"
      >
        <h2 className="font-medium text-base mb-2 flex items-center gap-2 text-rose-300">
          <Trash2 className="h-4 w-4" /> Danger zone
        </h2>
        <p className="text-sm text-slate-400 mb-4">
          Permanently delete your account, history and all generations. This action is irreversible.
        </p>
        <button
          onClick={wipe}
          disabled={loading}
          data-testid="settings-delete-account"
          className="inline-flex items-center gap-2 rounded-lg bg-rose-500/10 text-rose-300 font-medium px-4 py-2.5 text-sm hover:bg-rose-500/15 transition disabled:opacity-60"
        >
          <Trash2 className="h-4 w-4" />
          Delete account
        </button>
      </motion.section>
    </div>
  );
}

// ------------------- Reusable Sub-Components -------------------

function Field({ label, value, onChange, icon: Icon, disabled, testId }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wider text-slate-500">{label}</span>
      <div className="relative mt-1">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        )}
        <input
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