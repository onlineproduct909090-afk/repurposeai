import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Wand2, Sparkles, TrendingUp, Clock, ArrowUpRight, FileText, Trash2, Loader2, Lightbulb, Layers, History,
  Repeat, Zap, Trophy, Rocket, Calendar
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { createClient } from "@supabase/supabase-js";

// ✅ Supabase Client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// ---------- SVGs & Platform Meta ----------
const BlogIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-300"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
const TwitterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-sky-300"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
const LinkedInIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-blue-300"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>;

const PLATFORM_META = {
  blog: { Icon: BlogIcon, color: "text-emerald-300", bg: "bg-emerald-400/10" },
  twitter: { Icon: TwitterIcon, color: "text-sky-300", bg: "bg-sky-400/10" },
  linkedin: { Icon: LinkedInIcon, color: "text-blue-300", bg: "bg-blue-400/10" },
};

// ---------- Random Data ----------
const AI_TIPS = [
  "💡 Add bullet points to your blog for better readability!",
  "🚀 Twitter threads with emojis get 30% more engagement.",
  "📈 Consistency > Perfection. Post daily to build a following.",
  "🎨 Using custom colors in your brand makes your content stand out.",
  "🔥 Start your tweets with a bold statement to grab attention."
];

const ANNOUNCEMENT = "🚀 New: You can now export your content as Word (.docx) files!";

export default function Dashboard() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [tip, setTip] = useState("");

  // Random Tip
  useEffect(() => {
    setTip(AI_TIPS[Math.floor(Math.random() * AI_TIPS.length)]);
  }, []);

  // Fetch History
  const fetchHistory = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) console.error("Fetch Error:", error);
    else setHistory(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchHistory(); }, [user]);

  // Delete History
  const handleDelete = async (id) => {
    if (!confirm("Delete this item?")) return;
    setDeletingId(id);
    const { error } = await supabase.from("history").delete().eq("id", id);
    if (error) alert("Error: " + error.message);
    else fetchHistory();
    setDeletingId(null);
  };

  // Quick Reuse Function
  const handleReuse = (text) => {
    // Save text to localStorage for ContentCreator to pickup
    localStorage.setItem("reuseText", text);
    window.location.href = "/app/create";
  };

  // ---------- Stats ----------
  const totalRepurposes = history.length;
  const totalChars = history.reduce((acc, curr) => acc + (curr.input_text?.length || 0), 0);
  const totalPosts = history.reduce((acc, curr) => {
    return acc + (curr.blog ? 1 : 0) + (curr.twitter ? 1 : 0) + (curr.linkedin ? 1 : 0);
  }, 0);
  const streak = Math.min(totalRepurposes, 7); // Dummy streak for demo

  const STATS = [
    { label: "Projects", value: totalRepurposes, trend: "Lifetime count", icon: Sparkles },
    { label: "Posts Generated", value: totalPosts, trend: "Across all platforms", icon: TrendingUp },
    { label: "Chars Processed", value: totalChars.toLocaleString(), trend: "AI read this much", icon: FileText },
  ];

  // Chart Data (Last 7 days)
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  };
  const weekDays = getLast7Days();
  const chartData = weekDays.map(day => {
    const count = history.filter(h => h.created_at?.split('T')[0] === day).length;
    return { day: new Date(day).toLocaleDateString('en-US', { weekday: 'short' }), count };
  });
  const maxCount = Math.max(...chartData.map(d => d.count), 1);

  // Personalized Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="px-5 sm:px-8 py-8 sm:py-10 max-w-6xl mx-auto fade-up">
      
      {/* -------- Announcement Banner -------- */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 rounded-xl p-4 mb-6 flex items-center gap-3 text-sm">
        <Rocket className="h-4 w-4 text-emerald-400 shrink-0" />
        <span className="text-slate-200">{ANNOUNCEMENT}</span>
      </motion.div>

      {/* -------- Hero Section -------- */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-xs uppercase tracking-[0.22em] text-emerald-300/80">Dashboard</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
              {user?.plan || "Free"} Plan
            </span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight mt-2">
            {getGreeting()}, <span className="text-emerald-300">{user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Creator"}</span>.
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-slate-400 max-w-lg text-sm sm:text-base">
              {totalRepurposes === 0 ? "Ready to turn text into social gold? 🪙" : `You've created ${totalRepurposes} projects. Keep shining! ✨`}
            </p>
            {/* 🔥 Streak Counter */}
            {streak > 0 && (
              <span className="inline-flex items-center gap-1 text-xs bg-orange-500/20 text-orange-300 px-2.5 py-1 rounded-full border border-orange-500/30">
                <Zap className="h-3 w-3" /> {streak} day streak
              </span>
            )}
          </div>
        </div>
        <Link to="/app/create" className="btn-glow inline-flex items-center gap-2 bg-emerald-400 text-slate-900 font-semibold px-5 py-3 rounded-lg hover:scale-[1.02] transition-transform duration-200">
          <Wand2 className="h-4 w-4" /> Create content
        </Link>
      </motion.div>

      {/* -------- Quick Actions -------- */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <motion.div whileHover={{ scale: 1.02 }} className="glass rounded-xl p-5 cursor-pointer hover:border-emerald-400/40 transition-all">
          <Link to="/app/create" className="flex flex-col items-start gap-2">
            <div className="bg-emerald-400/10 p-2 rounded-lg text-emerald-400"><Wand2 className="h-5 w-5" /></div>
            <h3 className="font-medium text-sm mt-1">New Content</h3>
            <p className="text-xs text-slate-400">Paste text & generate instantly</p>
          </Link>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} className="glass rounded-xl p-5 cursor-pointer hover:border-sky-400/40 transition-all">
          <div className="flex flex-col items-start gap-2">
            <div className="bg-sky-400/10 p-2 rounded-lg text-sky-400"><Layers className="h-5 w-5" /></div>
            <h3 className="font-medium text-sm mt-1">Templates</h3>
            <p className="text-xs text-slate-400">Ready-to-use AI prompts</p>
          </div>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} className="glass rounded-xl p-5 cursor-pointer hover:border-purple-400/40 transition-all">
          <Link to="/app/settings" className="flex flex-col items-start gap-2">
            <div className="bg-purple-400/10 p-2 rounded-lg text-purple-400"><History className="h-5 w-5" /></div>
            <h3 className="font-medium text-sm mt-1">My History</h3>
            <p className="text-xs text-slate-400">Review past generations</p>
          </Link>
        </motion.div>
      </section>

      {/* -------- AI Tip of the Day -------- */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass-strong rounded-xl p-4 mb-10 border border-emerald-500/20 flex items-center gap-3">
        <Lightbulb className="h-5 w-5 text-emerald-400 shrink-0" />
        <p className="text-sm text-slate-300">{tip}</p>
      </motion.div>

      {/* -------- Stats Cards -------- */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="glass p-10 h-24 animate-pulse"></div>
          <div className="glass p-10 h-24 animate-pulse"></div>
          <div className="glass p-10 h-24 animate-pulse"></div>
        </div>
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {STATS.map(({ label, value, trend, icon: Icon }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass rounded-xl p-5 hover:scale-[1.02] hover:shadow-lg transition-all duration-200 cursor-default">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-400 tracking-wider">{label}</span>
                <Icon className="h-4 w-4 text-emerald-300/80" />
              </div>
              <div className="font-display text-3xl font-semibold tracking-tight">{value}</div>
              <div className="text-[11px] text-slate-500 mt-1 tracking-wide">{trend}</div>
            </motion.div>
          ))}
        </section>
      )}

      {/* -------- Weekly Activity Chart -------- */}
      {!loading && history.length > 0 && (
        <section className="glass rounded-2xl p-5 mb-10">
          <h3 className="text-sm font-semibold mb-4 text-slate-300">Weekly Activity</h3>
          <div className="flex items-end justify-between h-32 gap-2">
            {chartData.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-2 flex-1">
                <div className="w-full bg-white/5 rounded-t-lg relative h-28 flex items-end overflow-hidden">
                  <motion.div initial={{ height: 0 }} animate={{ height: `${(d.count / maxCount) * 100}%` }} transition={{ duration: 0.5, delay: i * 0.05 }} className="w-full bg-gradient-to-t from-emerald-500 to-cyan-400 rounded-t-lg" />
                </div>
                <span className="text-[10px] text-slate-500">{d.day}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* -------- Recent Activity List -------- */}
      <section className="glass rounded-2xl overflow-hidden">
        <header className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h2 className="font-semibold text-sm">Recent repurposes</h2>
        </header>
        
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Loading...</div>
        ) : history.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-3xl">📝</div>
            <h3 className="text-lg font-medium">Ready to start?</h3>
            <p className="text-sm text-slate-400 max-w-sm">Paste your first article and watch magic happen!</p>
            <Link to="/app/create" className="btn-glow bg-emerald-400 text-slate-900 font-semibold px-5 py-2 rounded-lg mt-2">Create your first post</Link>
          </div>
        ) : (
          <ul className="divide-y divide-white/5">
            {history.slice(0, 5).map((item, i) => (
              <motion.li key={item.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="px-5 py-4 flex items-center gap-4 hover:bg-white/[0.03] transition-all duration-200 group">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-sm shrink-0 text-slate-400">✍️</div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{item.input_text?.substring(0, 50)}{item.input_text?.length > 50 ? "..." : ""}</div>
                  <div className="text-xs text-slate-500 truncate mt-0.5 flex flex-wrap gap-2">
                    {item.blog && <span className="text-emerald-400 border border-emerald-400/20 px-1.5 rounded text-[10px]">Blog</span>}
                    {item.twitter && <span className="text-sky-400 border border-sky-400/20 px-1.5 rounded text-[10px]">X</span>}
                    {item.linkedin && <span className="text-blue-400 border border-blue-400/20 px-1.5 rounded text-[10px]">LinkedIn</span>}
                    <span className="text-slate-500 text-[10px]">{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* 🔥 Reuse Button */}
                  <button 
                    onClick={() => handleReuse(item.input_text)}
                    className="p-1.5 hover:bg-emerald-500/10 rounded-lg text-emerald-400 transition"
                    title="Reuse this text"
                  >
                    <Repeat className="h-4 w-4" />
                  </button>
                  {/* Delete Button */}
                  <button 
                    onClick={() => handleDelete(item.id)} 
                    disabled={deletingId === item.id}
                    className="p-1.5 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition"
                  >
                    {deletingId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </button>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </section>

      {/* 🔥 Floating Need Help Button (UI only) */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1 }}
        className="fixed bottom-8 right-8 z-50"
      >
        <button className="h-14 w-14 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 shadow-lg flex items-center justify-center text-slate-900 hover:scale-105 transition">
          <span className="text-2xl font-bold">?</span>
        </button>
      </motion.div>
    </div>
  );
}