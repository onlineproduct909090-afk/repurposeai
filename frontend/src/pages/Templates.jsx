import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Sparkles } from "lucide-react";

// 🔥 FIX: Saare icon imports hata kar SVG function bana diye
const TwitterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
const LinkedinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>;
const FileTextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
const MailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
const YoutubeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>;
const InstagramIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>;
const PodcastIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49"/><path d="M8.76 7.76a6 6 0 0 0 0 8.49"/><path d="M4.86 4.86a10 10 0 0 1 0 14.28"/><path d="M19.14 4.86a10 10 0 0 0 0 14.28"/><path d="M12 18v4"/></svg>;
const ArrowUpRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>;

const TEMPLATES = [
  {
    id: "viral-thread",
    title: "Viral Twitter Thread",
    description: "Hook-first 6-tweet thread with a bold takeaway per tweet and a bookmark-worthy CTA.",
    Icon: TwitterIcon,
    accent: "sky",
    tag: "X / Twitter",
  },
  {
    id: "linkedin-pro",
    title: "Professional LinkedIn Post",
    description: "Thought-leadership post with a scroll-stopping first line, tight bullets, and a comment-driving question.",
    Icon: LinkedinIcon,
    accent: "blue",
    tag: "LinkedIn",
  },
  {
    id: "seo-blog",
    title: "SEO Blog Post",
    description: "Long-form Markdown article, 1,000+ words, H2 structure, key-takeaways section — publish-ready.",
    Icon: FileTextIcon,
    accent: "emerald",
    tag: "Blog",
  },
  {
    id: "newsletter",
    title: "Weekly Newsletter",
    description: "Personable email digest with a strong opener, 3 insight blocks, and a soft product mention.",
    Icon: MailIcon,
    accent: "amber",
    tag: "Email",
  },
  {
    id: "short-hook",
    title: "YouTube Short / Reel Script",
    description: "45-second vertical script with a 3-second hook, punchy beats, and a strong call-to-action outro.",
    Icon: YoutubeIcon,
    accent: "rose",
    tag: "Shorts",
  },
  {
    id: "instagram-carousel",
    title: "Instagram Carousel",
    description: "8-slide carousel copy — cover hook, 6 insight slides, and a save-worthy last slide with hashtags.",
    Icon: InstagramIcon,
    accent: "pink",
    tag: "Instagram",
  },
  {
    id: "podcast-notes",
    title: "Podcast Show Notes",
    description: "Structured show notes with a punchy summary, timestamped chapters, and pull quotes.",
    Icon: PodcastIcon,
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
                    <Icon />
                  </div>
                  <span className={`text-[10px] uppercase tracking-[0.18em] ${c.text}`}>
                    {t.tag}
                  </span>
                </div>
                <h2 className="font-display text-lg font-semibold tracking-tight">{t.title}</h2>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">{t.description}</p>
                <div className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 group-hover:text-emerald-300 transition-colors">
                  Use template <ArrowUpRightIcon />
                </div>
              </motion.button>
            );
          })}
        </section>
      </div>
    </>
  );
}