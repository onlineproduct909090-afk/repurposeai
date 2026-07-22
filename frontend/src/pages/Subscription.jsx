import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    blurb: "Test the waters.",
    features: ["3 repurposes / month", "Blog + 1 social format", "Watermarked PDFs"],
    cta: "Current plan",
  },
  {
    id: "pro",
    name: "Pro",
    price: 29,
    blurb: "For solo creators.",
    features: [
      "Unlimited repurposes",
      "All 3 formats per video",
      "Clean PDF exports",
      "Priority AI access",
      "Email support",
    ],
    highlight: true,
    cta: "Upgrade to Pro",
  },
  {
    id: "studio",
    name: "Studio",
    price: 89,
    blurb: "For teams & agencies.",
    features: [
      "Everything in Pro",
      "5 team seats",
      "Brand voice presets",
      "API access",
      "Dedicated success manager",
    ],
    cta: "Contact sales",
  },
];

export default function Subscription() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async (planId) => {
    if (planId === "free") return;
    setLoading(true);

    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          successUrl: `${window.location.origin}/app/subscription?success=true`,
          cancelUrl: `${window.location.origin}/app/subscription?canceled=true`,
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // ✅ Real Stripe redirect
      } else {
        toast.error("Failed to initiate checkout");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-5 sm:px-8 py-8 sm:py-10 max-w-6xl mx-auto fade-up" data-testid="subscription-root">
      <header className="mb-10">
        <span className="text-xs uppercase tracking-[0.22em] text-emerald-300/80">Subscription</span>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight mt-2">
          Pick the plan that ships <span className="text-emerald-300 shimmer-text">faster</span>.
        </h1>
        <p className="text-slate-400 mt-3 max-w-xl">
          Currently on{" "}
          <span className="text-emerald-300 font-medium uppercase tracking-wider">
            {user?.plan || "free"}
          </span>
          . Upgrade any time — no contracts, cancel in one click.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-5" data-testid="plans-grid">
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            current={user?.plan === plan.id}
            onUpgrade={handleUpgrade}
            loading={loading}
          />
        ))}
      </section>
    </div>
  );
}

function PlanCard({ plan, current, onUpgrade, loading }) {
  const isFree = plan.id === "free";

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      data-testid={`plan-${plan.id}`}
      className={`glass rounded-2xl p-6 relative overflow-hidden transition-all duration-200 ${
        plan.highlight ? "ring-2 ring-emerald-400/40 shadow-[0_0_30px_-8px_rgba(52,211,153,0.3)]" : "ring-1 ring-white/5"
      }`}
    >
      {plan.highlight && (
        <span className="absolute top-4 right-4 text-[10px] uppercase tracking-[0.18em] text-emerald-300 bg-emerald-400/10 border border-emerald-400/30 px-2 py-0.5 rounded-full">
          Popular
        </span>
      )}
      <div className="flex items-center gap-2 mb-2">
        {plan.highlight && <Sparkles className="h-4 w-4 text-emerald-300" />}
        <h3 className="font-display text-xl font-semibold">{plan.name}</h3>
      </div>
      <p className="text-xs text-slate-400">{plan.blurb}</p>

      <div className="mt-5 flex items-baseline gap-1">
        <span className="font-display text-4xl font-semibold">${plan.price}</span>
        <span className="text-xs text-slate-500">/ month</span>
      </div>

      <ul className="mt-6 space-y-2.5">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
            <Check className="h-4 w-4 text-emerald-300 mt-0.5 shrink-0" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => onUpgrade(plan.id)}
        disabled={current || loading || isFree}
        data-testid={`plan-cta-${plan.id}`}
        className={`mt-6 w-full rounded-lg py-3 font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
          plan.highlight
            ? "btn-glow bg-emerald-400 text-slate-900 hover:scale-[1.02]"
            : current
            ? "bg-white/5 text-slate-300 cursor-default"
            : "bg-white/5 text-slate-100 hover:bg-white/10 hover:scale-[1.02]"
        }`}
      >
        {current ? (
          "Current plan"
        ) : loading && !isFree ? (
          <Loader2 className="h-4 w-4 animate-spin mx-auto" />
        ) : (
          plan.cta
        )}
      </button>
    </motion.div>
  );
}