import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { createClient } from "@supabase/supabase-js";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import { FileText, Twitter, Linkedin, History as HistoryIcon, Repeat, Inbox, Calendar } from "lucide-react";
import { useAuth } from "../context/AuthContext";

/**
 * Supabase client — uses Vite's import.meta.env for production.
 * Falls back to mock data if environment variables are missing (useful for dev).
 */
const viteEnv = (typeof import.meta !== "undefined" && import.meta.env) || {};
const SUPABASE_URL =
  viteEnv.VITE_SUPABASE_URL ||
  (typeof process !== "undefined" && process.env && process.env.REACT_APP_SUPABASE_URL) ||
  "";
const SUPABASE_ANON_KEY =
  viteEnv.VITE_SUPABASE_ANON_KEY ||
  (typeof process !== "undefined" && process.env && process.env.REACT_APP_SUPABASE_ANON_KEY) ||
  "";

const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// Fallback rows when Supabase is not configured — keeps the UI meaningful in dev.
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

const PLATFORM_META = {
  blog: { label: "Blog", Icon: FileText, text: "text-emerald-300", bg: "bg-emerald-400/10" },
  twitter: { label: "X", Icon: Twitter, text: "text-sky-300", bg: "bg-sky-400/10" },
  linkedin: { label: "LinkedIn", Icon: Linkedin, text: "text-blue-300", bg: "bg-blue-400/10" },
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

      // Fallback path — no Supabase env configured.
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
        // Convert columns to platforms array for consistency with UI
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
            <HistoryIcon className="h-3.5 w-3.5" /> Your generations
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
                          <Icon className="h-3 w-3" />
                          {meta.label}
                        </span>
                      );
                    })}
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 ml-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(row.created_at)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/app/create", { state: { reuseText: row.text } })}
                  data-testid={`history-reuse-${row.id}`}
                  className="shrink-0 inline-flex items-center gap-1.5 text-xs font-medium px-3.5 py-2 rounded-md bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/15 transition"
                >
                  <Repeat className="h-3.5 w-3.5" /> Reuse
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
        <Inbox className="h-6 w-6 text-emerald-300" />
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