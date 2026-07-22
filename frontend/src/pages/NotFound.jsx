import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Home, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <>
      {/* ✅ Professional SEO Title */}
      <Helmet>
        <title>404: Page Not Found | RepurposeAI</title>
        <meta name="description" content="The page you are looking for doesn't exist. Let's get you back to the RepurposeAI dashboard." />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground relative flex items-center justify-center px-4">
        <div className="aurora" />
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
          className="relative z-10 w-full max-w-lg glass rounded-3xl p-10 sm:p-14 text-center overflow-hidden"
          data-testid="not-found-root"
        >
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-emerald-400/25 blur-[100px]" />

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative"
          >
            <div className="font-display text-8xl sm:text-9xl font-semibold tracking-tighter bg-gradient-to-b from-emerald-300 via-cyan-300 to-cyan-500/20 bg-clip-text text-transparent">
              404
            </div>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-emerald-300/80 mt-2">
              <Compass className="h-3.5 w-3.5" /> Lost in the timeline
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight mt-4">
              Page not found
            </h1>
            <p className="text-sm text-slate-400 mt-3 max-w-sm mx-auto">
              The page you're looking for doesn't exist or has been repurposed into something else. Let's get you back to the studio.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8"
            >
              <Link
                to="/app"
                data-testid="not-found-home"
                className="btn-glow inline-flex items-center gap-2 bg-emerald-400 text-slate-900 font-semibold px-5 py-3 rounded-lg hover:scale-[1.02] transition-transform duration-200"
              >
                <Home className="h-4 w-4" />
                Back to dashboard
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}