import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { createClient } from "@supabase/supabase-js";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

// 🔥 FIX: Lucide-React imports hata kar SVG use kiya (100% Error-free)
const FileText = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
const TwitterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
const LinkedinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>;
const HistoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>;
const RepeatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 2l4 4-4 4"/><path d="M7 22l-4-4 4-4"/><path d="M21 12v4a4 4 0 0 1-4 4H7"/><path d="M3 12V8a4 4 0 0 1 4-4h10"/></svg>;
const InboxIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v6z"/><path d="M2 12h5l2 3h6l2-3h5"/></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;

const viteEnv = (typeof import.meta !== "undefined" && import.meta.env) || {};
const SUPABASE_URL =
  viteEnv.VITE_SUPABASE_URL ||
  (typeof process !== "undefined" && process.env && process.env.REACT_APP_SUPABASE_URL) ||
  "";
const SUPABASE_ANON_KEY =
  viteEnv.VITE_SUPABASE_ANON_KEY ||
  (typeof process !== "undefined" && process.env && process.env.REACT_APP_SUPABASE_ANON_KEY) ||
  "";

const supabase = SUPABASE_URL && SUPABASE_ANON_KEY ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// Fallback rows
const MOCK_ROWS = [
  {
    id: "m1",
    text: "Today I want to talk about the power of compound habits. Most people overestimate what they can do in a day and underestimate what they can do in a year…",
    platforms: ["blog", "twitter", "linkedin"],
    created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    id: "m2",
    text: "The best product bets are ones nobody else can make. Look for the unfair advantage hiding in plain sight — your history, your obsession, your small niche…",
    platforms: ["twitter", "linkedin"],
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
  },
  {
    id: "m3",
    text: "Dark-mode UI is not just an aesthetic choice — it's a trust signal. Here's how we redesigned RepurposeAI's dashboard using semantic color tokens and glass surfaces…",
    platforms: ["blog", "linkedin"],
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
];

// ✅ Platform Meta with SVG Icons
const PLATFORM_META = {
  blog: { label: "Blog", Icon: FileText, text: "text-emerald-300", bg: "bg-emerald-400/10" },
  twitter: { label: "X", Icon: TwitterIcon, text: "text-sky-300", bg: "bg-sky-400/10" },
  linkedin: { label: "LinkedIn", Icon: LinkedinIcon, text: "text-blue-300", bg: "bg-blue-400/10" },
};

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function History() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      // Fallback path
      if (!supabase || !user?.id) {
        await new Promise((r) => setTimeout(r, 700));
        if (!cancelled) {
          setRows(MOCK_ROWS);
          setLoading(false);
        }
        return;
      }

      const { data, error: err } = await supabase
        .from("history")
        .select("id, input_text, blog, twitter, linkedin, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (cancelled) return;
      if (err) {
        setError(err.message);
        toast.error(`Failed to load history: ${err.message}`);
        setRows([]);
      } else {
        const formatted = data.map((item) => ({
          id: item.id,
          text: item.input_text || "",
          platforms: [
            item.blog ? "blog" : null,
            item.twitter ? "twitter" : null,
            item.linkedin ? "linkedin" : null,
          ].filter(Boolean),
          created_at: item.created_at,
        }));
        setRows(formatted || []);
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const usingMock = useMemo(() => !supabase, []);

  return (
    <>
      <Helmet>
        <title>History | RepurposeAI</title>
        <meta name="description" content="View your past content repurposes on RepurposeAI. Reuse any source in one click." />
      </Helmet>

      <div className="px-5 sm:px-8 py-8 sm:py-10 max-w-5xl mx-auto bg-background text-foreground" data-testid="history-root">
        <motion.header
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <span className="text-xs uppercase tracking-[0.22em] text-emerald-300/80 inline-flex items-center gap-2">
            <HistoryIcon /> Your generations
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight mt-2 shimmer-text">
            History
          </h1>
          <p className="text-slate-400 mt-3 max-w-xl">
            Every repurpose you've run. Reuse a source in one click.
          </p>
          {usingMock && (
            <p className="text-[11px] text-amber-300/80 mt-3">
              Supabase env not configured — showing sample rows.
            </p>
          )}
        </motion.header>

        {loading && <SkeletonList />}

        {!loading && error && (
          <div className="glass rounded-2xl p-6 text-sm text-rose-300" data-testid="history-error">
            Couldn't load history: {error}
          </div>
        )}

        {!loading && !error && rows.length === 0 && <EmptyState onNew={() => navigate("/app/create")} />}

        {!loading && !error && rows.length > 0 && (
          <ul className="space-y-3" data-testid="history-list">
            {rows.map((row, i) => (
              <motion.li
                key={row.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                className="glass rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-white/[0.03] transition-colors"
                data-testid={`history-row-${row.id}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 leading-relaxed line-clamp-2">
                    {row.text}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {(row.platforms || []).map((p) => {
                      const meta = PLATFORM_META[p];
                      if (!meta) return null;
                      const Icon = meta.Icon;
                      return (
                        <span
                          key={p}
                          className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md ${meta.bg} ${meta.text}`}
                        >
                          <Icon />
                          {meta.label}
                        </span>
                      );
                    })}
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 ml-1">
                      <CalendarIcon />
                      {formatDate(row.created_at)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/app/create", { state: { reuseText: row.text } })}
                  data-testid={`history-reuse-${row.id}`}
                  className="shrink-0 inline-flex items-center gap-1.5 text-xs font-medium px-3.5 py-2 rounded-md bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/15 transition"
                >
                  <RepeatIcon /> Reuse
                </button>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function SkeletonList() {
  return (
    <ul className="space-y-3" data-testid="history-skeleton">
      {[0, 1, 2, 3].map((i) => (
        <li key={i} className="glass rounded-xl p-5 animate-pulse">
          <div className="h-3.5 rounded bg-white/10 w-11/12" />
          <div className="h-3.5 rounded bg-white/10 w-8/12 mt-2" />
          <div className="mt-4 flex gap-2">
            <div className="h-5 w-14 rounded bg-white/10" />
            <div className="h-5 w-10 rounded bg-white/10" />
            <div className="h-5 w-16 rounded bg-white/10" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function EmptyState({ onNew }) {
  return (
    <div data-testid="history-empty" className="glass rounded-2xl p-10 sm:p-14 text-center">
      <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-emerald-400/10 border border-emerald-400/20 mb-4">
        <InboxIcon />
      </div>
      <h2 className="font-display text-2xl font-semibold tracking-tight">Nothing here yet</h2>
      <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto">
        Every video you repurpose will show up here so you can jump right back in.
      </p>
      <button
        onClick={onNew}
        data-testid="history-empty-cta"
        className="btn-glow mt-6 inline-flex items-center gap-2 bg-emerald-400 text-slate-900 font-semibold px-5 py-3 rounded-lg text-sm"
      >
        Create your first
      </button>
    </div>
  );
}