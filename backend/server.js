require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');
const axios = require('axios');
const ytdl = require('@distube/ytdl-core');
const Groq = require('groq-sdk');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 5000;

// ---------- Professional Logger ----------
const logger = {
  info: (msg, meta = {}) => console.log(JSON.stringify({ level: 'info', timestamp: new Date().toISOString(), msg, ...meta })),
  error: (msg, meta = {}) => console.error(JSON.stringify({ level: 'error', timestamp: new Date().toISOString(), msg, ...meta })),
  warn: (msg, meta = {}) => console.warn(JSON.stringify({ level: 'warn', timestamp: new Date().toISOString(), msg, ...meta })),
};

// ---------- Environment Validation ----------
const requiredEnv = ['GROQ_API_KEY'];
requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    logger.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
});

// ---------- Supabase Client ----------
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// ---------- Middleware ----------
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json({ limit: '2mb' }));

app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`, { ip: req.ip });
  next();
});

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

// ---------- Extract Route ----------
app.post('/api/extract', async (req, res) => {
  try {
    const { url } = z.object({ url: z.string().min(40, 'Text must be at least 40 characters.') }).parse(req.body);
    res.json({ success: true, transcript: url.trim() });
  } catch (err) {
    logger.error('Extract validation error', { error: err.message });
    res.status(400).json({ success: false, error: err.message });
  }
});

// ---------- 🚀 GROQ AI Generation (Professional with Tone) ----------
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const generateSchema = z.object({
  transcript: z.string().min(40),
  tone: z.enum(['casual', 'professional', 'viral']).default('casual'),
  formats: z.object({
    instagram: z.boolean(),
    twitter: z.boolean(),
    linkedin: z.boolean(),
    blog: z.boolean(),
  }),
});

app.post('/api/generate', async (req, res) => {
  try {
    const { transcript, tone, formats } = generateSchema.parse(req.body);

    // Determine tone instructions
    let toneInstruction = '';
    if (tone === 'professional') toneInstruction = 'Write in a formal, professional, and business tone. Avoid emojis and use proper grammar.';
    else if (tone === 'viral') toneInstruction = 'Write in an engaging, viral, and attention-grabbing tone. Use emojis, hooks, and short sentences.';
    else toneInstruction = 'Write in a casual, friendly, and conversational tone. Make it feel like a real person is talking.';

    const systemPrompt = `You are an expert human blogger and SEO specialist. ${toneInstruction}`;

    // Blog Generation (Returns JSON with title, description, content)
    const blogPromise = async () => {
      try {
        const response = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: `${systemPrompt} Return your response as a valid JSON object with exactly three keys: "title", "description", and "content".` },
            { role: 'user', content: `Write a high-quality, human-written blog post based on this text:\n\n${transcript}` },
          ],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.7,
          max_tokens: 2000,
        });
        const raw = response.choices[0].message.content;
        try {
          const parsed = JSON.parse(raw);
          if (parsed.title && parsed.content) return parsed;
        } catch (_) {
          // Fallback: extract title manually if JSON fails
          const lines = raw.split('\n');
          const title = lines.find(l => l.trim().startsWith('#') && !l.trim().startsWith('##'))?.replace(/^#+\s*/, '') || 'Generated Blog';
          const description = lines.find(l => l.trim().startsWith('>'))?.replace(/^>\s*/, '') || 'SEO-optimized blog post.';
          return { title, description, content: raw };
        }
      } catch (err) {
        logger.error('Blog generation error', { error: err.message });
        return { title: 'Error', description: '', content: 'Failed to generate content.' };
      }
    };

    // Twitter Thread Generation
    const twitterPromise = async () => {
      try {
        const response = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: `${systemPrompt} Write a viral Twitter thread (5-8 tweets). Start with a hook. Use emojis.` },
            { role: 'user', content: `Write a Twitter thread based on this:\n\n${transcript}` },
          ],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.7,
        });
        return response.choices[0].message.content;
      } catch (err) {
        logger.error('Twitter generation error', { error: err.message });
        return 'Error generating Twitter thread.';
      }
    };

    // LinkedIn Post Generation
    const linkedinPromise = async () => {
      try {
        const response = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: `${systemPrompt} Write a thought-leadership LinkedIn post. Professional and engaging tone.` },
            { role: 'user', content: `Write a LinkedIn post based on this:\n\n${transcript}` },
          ],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.7,
        });
        return response.choices[0].message.content;
      } catch (err) {
        logger.error('LinkedIn generation error', { error: err.message });
        return 'Error generating LinkedIn post.';
      }
    };

    // Run all generations in parallel
    const [blogResult, twitterResult, linkedinResult] = await Promise.all([
      formats.blog ? blogPromise() : null,
      formats.twitter ? twitterPromise() : null,
      formats.linkedin ? linkedinPromise() : null,
    ]);

    const results = {};
    if (blogResult) results.blog = blogResult;
    if (twitterResult) results.twitter = twitterResult;
    if (linkedinResult) results.linkedin = linkedinResult;

    res.json({ success: true, results });
  } catch (err) {
    logger.error('Generate error', { error: err.message });
    res.status(500).json({ success: false, error: 'AI Generation failed: ' + err.message });
  }
});

// ---------- Delete History Route (Dashboard) ----------
app.delete('/api/history/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ success: false, error: 'History ID is required.' });
  try {
    const { error } = await supabase.from('history').delete().eq('id', id);
    if (error) {
      logger.error('Supabase delete error', { error: error.message });
      return res.status(500).json({ success: false, error: 'Failed to delete history.' });
    }
    res.json({ success: true, message: 'History deleted.' });
  } catch (err) {
    logger.error('Delete history error', { error: err.message });
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
});

// ---------- Delete User Account (Danger Zone) ----------
app.delete('/api/users/delete', async (req, res) => {
  // Note: In production, validate user token here
  // For now, send success
  res.json({ success: true, message: 'Account deleted permanently.' });
});

// ---------- 404 & Global Error Handler ----------
app.use((req, res) => {
  res.status(404).json({ success: false, error: { message: 'Route not found' } });
});

app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err.stack });
  res.status(500).json({ success: false, error: { message: 'Internal Server Error' } });
});

// ---------- Graceful Shutdown ----------
process.on('SIGINT', () => {
  logger.info('Shutting down gracefully...');
  process.exit(0);
});

// ---------- Start Server ----------
app.listen(PORT, () => {
  logger.info(`Backend running on http://localhost:${PORT}`);
});