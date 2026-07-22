import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Twitter,
  Linkedin,
  FileText,
  Mail,
  Youtube,
  Instagram,
  Podcast,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

const TEMPLATES = [
  {
    id: "viral-thread",
    title: "Viral Twitter Thread",
    description: "Hook-first 6-tweet thread with a bold takeaway per tweet and a bookmark-worthy CTA.",
    Icon: Twitter,
    accent: "sky",
    tag: "X / Twitter",
  },
  {
    id: "linkedin-pro",
    title: "Professional LinkedIn Post",
    description: "Thought-leadership post with a scroll-stopping first line, tight bullets, and a comment-driving question.",
    Icon: Linkedin,
    accent: "blue",
    tag: "LinkedIn",
  },
  {
    id: "seo-blog",
    title: "SEO Blog Post",
    description: "Long-form Markdown article, 1,000+ words, H2 structure, key-takeaways section — publish-ready.",
    Icon: FileText,
    accent: "emerald",
    tag: "Blog",
  },
  {
    id: "newsletter",
    title: "Weekly Newsletter",
    description: "Personable email digest with a strong opener, 3 insight blocks, and a soft product mention.",
    Icon: Mail,
    accent: "amber",
    tag: "Email",
  },
  {
    id: "short-hook",
    title: "YouTube Short / Reel Script",
    description: "45-second vertical script with a 3-second hook, punchy beats, and a strong call-to-action outro.",
    Icon: Youtube,
    accent: "rose",
    tag: "Shorts",
  },
  {
    id: "instagram-carousel",
    title: "Instagram Carousel",
    description: "8-slide carousel copy — cover hook, 6 insight slides, and a save-worthy last slide with hashtags.",
    Icon: Instagram,
    accent: "pink",
    tag: "Instagram",
  },
  {
    id: "podcast-notes",
    title: "Podcast Show Notes",
    description: "Structured show notes with a punchy summary, timestamped chapters, and pull quotes.",
    Icon: Podcast,
    accent: "violet",
    tag: "Podcast",
  },
];

const ACCENT_MAP = {
  emerald: { text: "text-emerald-300", bg: "bg-emerald-400/10", ring: "hover:border-emerald-400/40" },
  sky: { text: "text-sky-300", bg: "bg-sky-400/10", ring: "hover:border-sky-400/40" },
  blue: { text: "text-blue-300", bg: "bg-blue-400/10", ring: "hover:border-blue-400/40" },
  amber: { text: "text-amber-300", bg: "bg-amber-400/10", ring: "hover:border-amber-400/40" },
  rose: { text: "text-rose-300", bg: "bg-rose-400/10", ring: "hover:border-rose-400/40" },
  pink: { text: "text-pink-300", bg: "bg-pink-400/10", ring: "hover:border-pink-400/40" },
  violet: { text: "text-violet-300", bg: "bg-violet-400/10", ring: "hover:border-violet-400/40" },
};

export default function Templates() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>AI Templates | RepurposeAI</title>
        <meta name="description" content="Explore ready-to-use AI templates for Twitter, LinkedIn, Blogs, Newsletters, and more on RepurposeAI." />
      </Helmet>

      <div className="px-5 sm:px-8 py-8 sm:py-10 max-w-6xl mx-auto bg-background text-foreground" data-testid="templates-root">
        <motion.header
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <span className="text-xs uppercase tracking-[0.22em] text-emerald-300/80 inline-flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5" /> Ready-to-use starters
          </span>
          {/* ✅ Premium shimmer-text effect on heading */}
          <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight mt-2 shimmer-text">
            AI Templates
          </h1>
          <p className="text-slate-400 mt-3 max-w-xl">
            Skip the blank canvas. Pick a proven format, drop in your source, and ship in minutes.
          </p>
        </motion.header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" data-testid="templates-grid">
          {TEMPLATES.map((t, i) => {
            const c = ACCENT_MAP[t.accent];
            const Icon = t.Icon;
            return (
              <motion.button
                key={t.id}
                type="button"
                // ✅ Passing state to /app/create for future-proof pre-filling
                onClick={() => navigate("/app/create", { state: { templateId: t.id, templateTitle: t.title } })}
                data-testid={`template-card-${t.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.35 }}
                whileHover={{ y: -3 }}
                className={`glass rounded-2xl p-6 text-left border border-white/5 ${c.ring} transition-all group relative overflow-hidden`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`h-11 w-11 rounded-xl ${c.bg} flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${c.text}`} />
                  </div>
                  <span className={`text-[10px] uppercase tracking-[0.18em] ${c.text}`}>
                    {t.tag}
                  </span>
                </div>
                <h2 className="font-display text-lg font-semibold tracking-tight">{t.title}</h2>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">{t.description}</p>
                <div className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 group-hover:text-emerald-300 transition-colors">
                  Use template <ArrowUpRight className="h-3.5 w-3.5" />
                </div>
              </motion.button>
            );
          })}
        </section>
      </div>
    </>
  );
}