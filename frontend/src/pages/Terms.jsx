import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ScrollText, Users, Copyright, ArrowLeft, Sparkles } from "lucide-react";
import { Helmet } from "react-helmet-async";

const SECTIONS = [
  {
    Icon: ScrollText,
    title: "1. Acceptance of Terms",
    body: `By creating an account or using RepurposeAI ("Service"), you agree to be bound by these Terms of Service and any policies referenced within. If you do not agree, you must not use the Service. We may update these Terms periodically; continued use after changes take effect constitutes acceptance of the revised Terms.`,
  },
  {
    Icon: Users,
    title: "2. User Accounts",
    body: `You are responsible for safeguarding the credentials associated with your account and for any activity conducted through it. You agree to provide accurate information at signup, keep it current, and notify us immediately of any unauthorized use. We reserve the right to suspend accounts that violate these Terms or applicable law.`,
  },
  {
    Icon: Copyright,
    title: "3. Intellectual Property",
    body: `RepurposeAI, its logo, code, prompts, and interface designs are owned by RepurposeAI and are protected by copyright and trademark law. Content you generate through the Service belongs to you — you retain full ownership and may publish, monetize, or modify it. You grant us a limited license to process your input strictly to deliver the Service.`,
  },
];

export default function Terms() {
  const navigate = useNavigate();

  return (
    <>
      {/* ✅ SEO & Page Title */}
      <Helmet>
        <title>Terms of Service | RepurposeAI</title>
        <meta name="description" content="Read the Terms of Service for RepurposeAI. Learn about user accounts, intellectual property rights, and legal agreements." />
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
            <Link
              to="/"
              className="inline-flex items-center gap-2 justify-center mb-8 group"
              data-testid="terms-brand"
            >
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center shadow-[0_0_24px_rgba(45,212,191,0.55)]">
                <Sparkles className="h-5 w-5 text-slate-900" strokeWidth={2.5} />
              </div>
              <span className="font-display text-xl font-semibold">
                Repurpose<span className="text-emerald-400">AI</span>
              </span>
            </Link>
            <span className="text-xs uppercase tracking-[0.22em] text-emerald-300/80">
              Legal
            </span>
            <h1
              data-testid="terms-title"
              className="font-display text-4xl sm:text-5xl font-semibold tracking-tight mt-3"
            >
              Terms of Service
            </h1>
            <p className="text-sm text-slate-400 mt-3">
              Last updated · February 2026
            </p>
          </motion.div>

          <div className="space-y-5">
            {SECTIONS.map(({ Icon, title, body }, i) => (
              <motion.article
                key={title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * i, duration: 0.4 }}
                className="glass rounded-2xl p-6 sm:p-7 text-center"
                data-testid={`terms-section-${i}`}
              >
                <div className="inline-flex items-center justify-center h-11 w-11 rounded-xl bg-emerald-400/10 border border-emerald-400/20 mb-4">
                  <Icon className="h-5 w-5 text-emerald-300" />
                </div>
                <h2 className="font-display text-xl font-semibold tracking-tight">
                  {title}
                </h2>
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
            {/* ✅ Better UX: Button navigate karega /app par */}
            <button
              onClick={() => navigate('/app')}
              data-testid="terms-back"
              className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-100 transition cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" /> Back to app
            </button>
          </motion.div>
        </div>
      </div>
    </>
  );
}