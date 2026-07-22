import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Sparkles, Loader2, Wand2, FileText, Copy, Check, Download, XCircle
} from "lucide-react";
import { jsPDF } from "jspdf";
import { useAuth } from "../context/AuthContext";

// ✅ SVG Icons for Platforms
const FORMATS = [
  { key: "blog", label: "Generate Blog", blurb: "Long-form Markdown article", Icon: FileText, color: "emerald" },
  { 
    key: "twitter", 
    label: "Generate Twitter/X", 
    blurb: "5–9 tweet viral thread", 
    Icon: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
    color: "sky" 
  },
  { 
    key: "linkedin", 
    label: "Generate LinkedIn", 
    blurb: "Thought-leadership post", 
    Icon: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
    color: "blue" 
  },
];

const COLOR_MAP = {
  emerald: { text: "text-emerald-300", bg: "bg-emerald-400/10", border: "border-emerald-400/40", glow: "shadow-[0_0_24px_-6px_rgba(52,211,153,0.55)]" },
  sky: { text: "text-sky-300", bg: "bg-sky-400/10", border: "border-sky-400/40", glow: "shadow-[0_0_24px_-6px_rgba(56,189,248,0.55)]" },
  blue: { text: "text-blue-300", bg: "bg-blue-400/10", border: "border-blue-400/40", glow: "shadow-[0_0_24px_-6px_rgba(96,165,250,0.55)]" },
};

// ✅ AI Tone Options
const TONE_OPTIONS = [
  { value: "casual", label: "😊 Casual & Friendly" },
  { value: "professional", label: "💼 Professional & Formal" },
  { value: "viral", label: "🔥 Viral & Engaging" },
];

export default function ContentCreator() {
  const [url, setUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [videoId, setVideoId] = useState("");
  const [tone, setTone] = useState("casual");

  const [selected, setSelected] = useState({ blog: true, twitter: true, linkedin: false });
  const [extracting, setExtracting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState({});

  const anySelected = useMemo(() => Object.values(selected).some(Boolean), [selected]);
  const busy = extracting || generating;

  // ✅ Mock "Extract" – User paste text kar raha hai, use transcript maan lo
  const handleExtract = async () => {
    if (!url.trim()) return toast.error("Please paste some text or transcript.");
    if (url.length < 40) return toast.error("Text is too short. Please write at least 40 characters.");

    setExtracting(true);
    setProgress(15);
    setResults({});
    setTranscript("");
    const tick = setInterval(() => setProgress((p) => (p < 70 ? p + 4 : p)), 250);

    // Simulate processing delay
    setTimeout(() => {
      setTranscript(url.trim());
      setVideoId("Text Analysis");
      setProgress(80);
      toast.success(`Text captured! (${url.length} chars)`);
      clearInterval(tick);
      setExtracting(false);
      setTimeout(() => setProgress((p) => (p < 100 ? 0 : p)), 800);
    }, 1000);
  };

  // ✅ REAL AI Generation via Vercel API
  const handleGenerate = async () => {
    if (!transcript || transcript.length < 40)
      return toast.error("Please analyze the text first.");
    if (!anySelected) return toast.error("Pick at least one format");

    setGenerating(true);
    setProgress(20);
    setResults({});
    const tick = setInterval(() => setProgress((p) => (p < 92 ? p + 1.5 : p)), 700);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          tone,
          formats: {
            blog: !!selected.blog,
            twitter: !!selected.twitter,
            linkedin: !!selected.linkedin,
          },
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.results) {
        setResults(data.results);
        setProgress(100);
        toast.success("Content generated successfully!");
      } else {
        throw new Error(data.error || "Generation failed");
      }
    } catch (err) {
      toast.error(err.message);
      setProgress(0);
    } finally {
      clearInterval(tick);
      setGenerating(false);
    }
  };

  const toggle = (k) => setSelected((s) => ({ ...s, [k]: !s[k] }));

  const clearAll = () => {
    setUrl("");
    setTranscript("");
    setResults({});
    setVideoId("");
    toast.info("Cleared everything");
  };

  const copyAll = async () => {
    const allText = Object.values(results).join("\n\n---\n\n");
    try {
      await navigator.clipboard.writeText(allText);
      toast.success("All content copied");
    } catch {
      toast.error("Clipboard blocked");
    }
  };

  return (
    <div className="px-5 sm:px-8 py-8 sm:py-10 max-w-5xl mx-auto fade-up" data-testid="creator-root">
      <header className="mb-8">
        <span className="text-xs uppercase tracking-[0.22em] text-emerald-300/80">Create content</span>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight mt-2">
          Paste an article. <span className="text-emerald-300 shimmer-text">Ship a week of posts.</span>
        </h1>
      </header>

      {/* Step 1 — Input */}
      <section className="glass rounded-2xl p-5 mb-6 fade-up">
        <Step num="01" title="Paste your text or article" />
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-start gap-2 px-3 py-2 bg-slate-900/50 border border-white/10 rounded-lg focus-within:border-emerald-400/60 focus-within:ring-2 focus-within:ring-emerald-400/20 transition">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-emerald-300 shrink-0 mt-1">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <line x1="10" y1="9" x2="8" y2="9"/>
            </svg>

            <textarea
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste your blog post, article, or YouTube transcript here..."
              disabled={busy}
              rows={4}
              className="bg-transparent flex-1 outline-none text-sm placeholder:text-slate-500 resize-none min-h-[80px]"
            />
            {url && (
              <button
                onClick={() => setUrl("")}
                className="text-slate-400 hover:text-slate-200 transition self-start"
              >
                <XCircle className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleExtract}
            disabled={!url.trim() || busy}
            className="btn-glow rounded-lg bg-emerald-400 text-slate-900 font-semibold px-6 py-3 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {extracting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Analyze Text
              </>
            )}
          </button>
        </div>

        {/* Progress bar */}
        <AnimatePresence>
          {(busy || progress > 0) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-5 overflow-hidden"
            >
              <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  className="h-full bar-animated rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "easeOut", duration: 0.4 }}
                />
              </div>
              <div className="text-[11px] text-slate-500 mt-2 tabular-nums">
                {extracting && "Analyzing text..."}
                {generating && "Generating social posts..."}
                {!busy && progress === 100 && "Done"}
                <span className="float-right">{Math.round(progress)}%</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Step 2 — Transcript */}
      {transcript && (
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-5 mb-6 fade-up"
        >
          <Step num="02" title="Captured Text" subtitle="Ready to repurpose" />
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={6}
            className="mt-4 w-full bg-slate-900/50 border border-white/10 rounded-lg p-4 text-sm leading-relaxed focus:outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20 resize-y"
          />
          <div className="text-[11px] text-slate-500 mt-2">
            {transcript.length.toLocaleString()} characters — feel free to clean it up.
          </div>
        </motion.section>
      )}

      {/* Step 3 — Formats & Tone */}
      {transcript && (
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass rounded-2xl p-5 mb-6 fade-up"
        >
          <Step num="03" title="Output formats & Tone" />
          
          {/* Tone Selector */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-slate-400 mb-2">Select AI Tone</label>
            <div className="flex flex-wrap gap-2">
              {TONE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTone(opt.value)}
                  className={`px-4 py-2 rounded-lg text-sm border transition-all ${
                    tone === opt.value 
                      ? "bg-emerald-400/20 border-emerald-400/40 text-emerald-300" 
                      : "bg-slate-800/50 border-white/10 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            {FORMATS.map(({ key, label, blurb, Icon, color }) => {
              const checked = !!selected[key];
              const c = COLOR_MAP[color];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggle(key)}
                  disabled={busy}
                  data-checked={checked}
                  className={`text-left rounded-xl border bg-slate-900/40 hover:bg-slate-900/60 p-4 transition-all disabled:opacity-50 ${
                    checked ? `${c.border} ${c.glow}` : "border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Icon className={`h-5 w-5 ${c.text}`} />
                    <span className={`h-5 w-9 rounded-full p-0.5 transition-colors ${checked ? c.bg : "bg-white/10"}`}>
                      <span className={`block h-4 w-4 rounded-full bg-white transition-transform ${checked ? "translate-x-4" : "translate-x-0"}`} />
                    </span>
                  </div>
                  <div className="mt-3 font-medium text-sm">{label}</div>
                  <div className="text-xs text-slate-400 mt-1">{blurb}</div>
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex justify-end gap-3">
            <button onClick={clearAll} className="rounded-lg bg-slate-700/50 text-slate-300 hover:bg-slate-700 px-4 py-2 text-sm transition">Clear all</button>
            <button
              onClick={handleGenerate}
              disabled={busy || !anySelected}
              className="btn-glow rounded-lg bg-emerald-400 text-slate-900 font-semibold px-6 py-3 flex items-center gap-2 disabled:opacity-60"
            >
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Wand2 className="h-4 w-4" /> Generate Content</>}
            </button>
          </div>
        </motion.section>
      )}

      {/* Results */}
      {Object.keys(results).length > 0 && (
        <div className="fade-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-lg">Your generated content</h2>
            <button onClick={copyAll} className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200 transition">
              <Copy className="h-3.5 w-3.5" /> Copy all
            </button>
          </div>
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {Object.entries(results).map(([platform, content], i) => (
              <ResultCard key={platform} platform={platform} content={content} videoId={videoId} index={i} />
            ))}
          </section>
        </div>
      )}
    </div>
  );
}

// ------------------- Sub-Components -------------------

function Step({ num, title, subtitle }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="font-display text-2xl text-slate-600 tabular-nums">{num}</span>
      <h2 className="text-base font-medium">{title}</h2>
      {subtitle && <span className="text-xs text-slate-500 ml-2">{subtitle}</span>}
    </div>
  );
}

function ResultCard({ platform, content, videoId, index }) {
  const [copied, setCopied] = useState(false);
  const meta = FORMATS.find((f) => f.key === platform) || { label: platform, Icon: FileText, color: "emerald" };
  const Icon = meta.Icon;
  const c = COLOR_MAP[meta.color];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success(`${meta.label.replace("Generate ", "")} copied`);
      setTimeout(() => setCopied(false), 1800);
    } catch { toast.error("Clipboard blocked"); }
  };

  const exportPdf = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 48;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const usable = pageWidth - margin * 2;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(`RepurposeAI — ${meta.label.replace("Generate ", "")}`, margin, margin);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(`Source: ${videoId}  ·  ${new Date().toLocaleString()}`, margin, margin + 16);
    doc.setTextColor(20);

    doc.setFontSize(11);
    const lines = doc.splitTextToSize(content, usable);
    let y = margin + 44;
    const lineHeight = 14;
    lines.forEach((line) => {
      if (y > pageHeight - margin) { doc.addPage(); y = margin; }
      doc.text(line, margin, y);
      y += lineHeight;
    });

    doc.save(`repurposeai-${platform}-${Date.now()}.pdf`);
    toast.success("PDF exported");
  };

  const exportDocx = () => {
    // Fallback .doc export
    const contentText = `Title: ${meta.label}\n\n${content}`;
    const blob = new Blob([contentText], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `repurposeai-${platform}-${Date.now()}.doc`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Word document downloaded!");
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="glass rounded-2xl overflow-hidden flex flex-col"
    >
      <header className="flex items-center justify-between px-5 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className={`h-7 w-7 rounded-md ${c.bg} flex items-center justify-center`}><Icon className={`h-4 w-4 ${c.text}`} /></span>
          <h3 className="font-medium text-sm">{meta.label.replace("Generate ", "")}</h3>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-slate-500">{content.length.toLocaleString()} chars</span>
      </header>
      <pre className="px-5 py-4 whitespace-pre-wrap break-words text-sm leading-relaxed font-[Inter Tight] text-slate-200/90 flex-1 max-h-[360px] overflow-y-auto custom-scrollbar">{content}</pre>
      <footer className="flex items-center gap-2 px-5 py-3 border-t border-white/5">
        <button onClick={copy} className="flex-1 inline-flex items-center justify-center gap-2 text-xs font-medium py-2 rounded-md bg-white/5 hover:bg-white/10 transition">
          {copied ? <><Check className="h-3.5 w-3.5 text-emerald-300" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
        </button>
        <button onClick={exportPdf} className="flex-1 inline-flex items-center justify-center gap-2 text-xs font-medium py-2 rounded-md bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/15 transition">
          <Download className="h-3.5 w-3.5" /> PDF
        </button>
        <button onClick={exportDocx} className="flex-1 inline-flex items-center justify-center gap-2 text-xs font-medium py-2 rounded-md bg-blue-400/10 text-blue-300 hover:bg-blue-400/15 transition">
          <Download className="h-3.5 w-3.5" /> Word
        </button>
      </footer>
    </motion.article>
  );
}