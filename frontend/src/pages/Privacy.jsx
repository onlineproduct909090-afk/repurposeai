import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Database, Cog, Server, ArrowLeft, Sparkles } from "lucide-react";

const SECTIONS = [
  {
    Icon: Database,
    title: "1. Information We Collect",
    body: `We collect the minimum needed to run RepurposeAI: your email and display name at signup, the text and content you submit, and the AI-generated content you produce. We also log anonymized usage events (page views, feature clicks) to improve the product. We do not buy or sell data from third-party brokers.`,
  },
  {
    Icon: Cog,
    title: "2. How We Use Data",
    body: `Your data is used to deliver the Service, personalize your experience, prevent abuse, and communicate essential product updates. We never train foundation models on your content. Aggregated, non-identifying analytics may be used to improve prompts, ranking, and defaults — but never in a way that reveals individual users.`,
  },
  {
    Icon: Server,
    title: "3. Data Storage & Deletion",
    body: `Content is stored encrypted at rest and in transit across our cloud infrastructure. Backups are retained for 30 days and then permanently purged. You may request full deletion of your account and all associated data at any time from Settings → Danger Zone; deletion is completed within 7 business days.`,
  },
];

export default function Privacy() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | RepurposeAI</title>
        <meta name="description" content="Read the Privacy Policy for RepurposeAI – how we handle your data securely." />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground relative">
        <div className="aurora" />
        <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-6 py-16 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center mb-10"
          >
            <Link to="/" className="inline-flex items-center gap-2 justify-center mb-8">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center shadow-[0_0_24px_rgba(45,212,191,0.55)]">
                <Sparkles className="h-5 w-5 text-slate-900" strokeWidth={2.5} />
              </div>
              <span className="font-display text-xl font-semibold">
                Repurpose<span className="text-emerald-400">AI</span>
              </span>
            </Link>
            <span className="text-xs uppercase tracking-[0.22em] text-emerald-300/80">Legal</span>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight mt-3">
              Privacy Policy
            </h1>
            <p className="text-sm text-slate-400 mt-3">Last updated · February 2026</p>
          </motion.div>

          <div className="space-y-5">
            {SECTIONS.map(({ Icon, title, body }, i) => (
              <motion.article
                key={title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * i, duration: 0.4 }}
                className="glass rounded-2xl p-6 sm:p-7 text-center"
              >
                <div className="inline-flex items-center justify-center h-11 w-11 rounded-xl bg-emerald-400/10 border border-emerald-400/20 mb-4">
                  <Icon className="h-5 w-5 text-emerald-300" />
                </div>
                <h2 className="font-display text-xl font-semibold tracking-tight">{title}</h2>
                <p className="text-sm text-slate-300/90 leading-relaxed mt-3 max-w-2xl mx-auto">
                  {body}
                </p>
              </motion.article>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="mt-10 text-center"
          >
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-100 transition">
              <ArrowLeft className="h-4 w-4" /> Back to app
            </Link>
          </motion.div>
        </div>
      </div>
    </>
  );
}