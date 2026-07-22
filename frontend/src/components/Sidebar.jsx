import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Wand2,
  CreditCard,
  Settings as SettingsIcon,
  Sparkles,
  LogOut,
  Menu,
  X,
  LayoutTemplate,      // ✅ New: Templates Icon
  History as HistoryIcon, // ✅ New: History Icon
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

// ✅ Professional Link List (Includes new pages)
const LINKS = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true, testId: "sidebar-dashboard" },
  { to: "/app/create", label: "Create Content", icon: Wand2, testId: "sidebar-create" },
  { to: "/app/templates", label: "Templates", icon: LayoutTemplate, testId: "sidebar-templates" }, // ✅ New
  { to: "/app/history", label: "History", icon: HistoryIcon, testId: "sidebar-history" },         // ✅ New
  { to: "/app/subscription", label: "Subscription", icon: CreditCard, testId: "sidebar-subscription" },
  { to: "/app/settings", label: "Settings", icon: SettingsIcon, testId: "sidebar-settings" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // ✅ Professional NavLink Item Component
  const Item = ({ to, label, icon: Icon, end, testId }) => (
    <NavLink
      to={to}
      end={end}
      onClick={() => setOpen(false)}
      data-testid={testId}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition-all duration-200 ${
          isActive
            ? "bg-emerald-400/15 text-emerald-300 border border-emerald-400/30 shadow-[0_0_15px_rgba(52,211,153,0.15)]"
            : "text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon className="h-4 w-4 shrink-0" />
          <span className="font-medium">{label}</span>
          {/* ✅ Active Indicator Glow */}
          {isActive && (
            <span className="absolute inset-0 rounded-lg border border-emerald-500/30 animate-pulse pointer-events-none" />
          )}
        </>
      )}
    </NavLink>
  );

  const content = (
    <>
      {/* Brand / Logo */}
      <div className="flex items-center gap-3 px-3 mb-8" data-testid="sidebar-brand">
        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center shadow-[0_0_24px_rgba(45,212,191,0.55)]">
          <Sparkles className="h-5 w-5 text-slate-900" strokeWidth={2.5} />
        </div>
        <div className="leading-tight">
          <div className="font-display text-lg font-semibold tracking-tight">
            Repurpose<span className="text-emerald-400">AI</span>
          </div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
            Content Studio
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="space-y-1 flex-1">
        {LINKS.map((l) => (
          <Item key={l.to} {...l} />
        ))}
      </nav>

      {/* User Profile & Logout */}
      <div className="mt-6 pt-4 border-t border-white/5">
        <div className="px-3 py-2 flex items-center gap-3" data-testid="sidebar-user">
          {/* ✅ Robust Avatar Fallback */}
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-sm font-semibold">
            {(user?.user_metadata?.full_name || user?.email || "U").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium truncate">
              {user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User"}
            </div>
            <div className="text-[11px] text-slate-500 truncate">{user?.email}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          data-testid="sidebar-logout"
          className="mt-2 w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* ✅ Mobile Top Bar */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 glass-strong">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-slate-900" strokeWidth={2.5} />
          </div>
          <span className="font-display font-semibold">
            Repurpose<span className="text-emerald-400">AI</span>
          </span>
        </div>
        <button
          onClick={() => setOpen(true)}
          data-testid="sidebar-mobile-open"
          className="p-2 rounded-md hover:bg-white/5 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* ✅ Desktop Sidebar */}
      <aside
        data-testid="sidebar-desktop"
        className="hidden lg:flex w-64 shrink-0 flex-col p-4 glass-strong border-r border-white/5 sticky top-0 h-screen"
      >
        {content}
      </aside>

      {/* ✅ Mobile Drawer (Sidebar) */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              className="lg:hidden fixed inset-0 bg-black/60 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            {/* Drawer Content */}
            <motion.aside
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 p-4 z-50 glass-strong flex flex-col"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              data-testid="sidebar-mobile-drawer"
            >
              <button
                onClick={() => setOpen(false)}
                className="absolute top-3 right-3 p-2 rounded-md hover:bg-white/5 transition-colors"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}