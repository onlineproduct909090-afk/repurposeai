/**
 * POST /api/generate
 * --------------------------------------------------
 * Body:
 *   {
 *     "transcript": "...",
 *     "formats": { "instagram": true, "twitter": true, "linkedin": false, "blog": true }
 *   }
 *
 * Resp:
 *   {
 *     success: true,
 *     data: {
 *       results: { instagram: "...", twitter: "...", blog: "...", linkedin: null },
 *       errors:  { linkedin: "message" }   // only if some formats failed
 *     }
 *   }
 *
 * Calls are made in parallel — one independent LLM call per
 * requested format using the format-specific system prompt.
 */

const express = require('express');
const Joi = require('joi');

const validate = require('../middleware/validate');
const logger = require('../utils/logger');
const { SYSTEM_PROMPTS } = require('../utils/prompts');

const router = express.Router();

const schema = Joi.object({
  transcript: Joi.string().trim().min(40).max(50000).required().label('transcript'),
  formats: Joi.object({
    instagram: Joi.boolean().default(false),
    twitter: Joi.boolean().default(false),
    linkedin: Joi.boolean().default(false),
    blog: Joi.boolean().default(false),
  })
    .required()
    .custom((value, helpers) => {
      if (!Object.values(value).some(Boolean)) {
        return helpers.error('any.custom', { message: 'At least one format must be selected' });
      }
      return value;
    }, 'at-least-one'),
});

function buildUserMessage(transcript, format) {
  return [
    `Source transcript (from a YouTube video) — use this as the raw material to repurpose:`,
    `"""`,
    transcript,
    `"""`,
    ``,
    `Now produce the ${format.toUpperCase()} output following the system instructions exactly.`,
  ].join('\n');
}

// ✅ DUMMY LLM FUNCTION (jab tak real API key na ho)
async function dummyLLM({ systemPrompt, userMessage }) {
  // Simulate a delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Return a mock response based on systemPrompt (just for testing)
  const format = systemPrompt.includes('instagram') ? 'Instagram' :
                 systemPrompt.includes('twitter') ? 'Twitter' :
                 systemPrompt.includes('linkedin') ? 'LinkedIn' : 'Blog';
  
  return `[${format} - Dummy AI Output]\n\nBased on your transcript:\n${userMessage.substring(0, 200)}...\n\n(This is a dummy response. Replace with real AI when API key is ready.)`;
}

router.post('/', validate(schema), async (req, res, next) => {
  const { transcript, formats } = req.body;
  const selected = Object.entries(formats)
    .filter(([, v]) => v)
    .map(([k]) => k);

  logger.info('Generating content', { formats: selected, transcriptChars: transcript.length });

  // Fire all LLM calls in parallel (using dummy function)
  const tasks = selected.map(async (fmt) => {
    try {
      const text = await dummyLLM({
        systemPrompt: SYSTEM_PROMPTS[fmt],
        userMessage: buildUserMessage(transcript, fmt),
      });
      return { fmt, ok: true, text };
    } catch (e) {
      logger.error('LLM call failed', { fmt, message: e.message });
      return { fmt, ok: false, error: e.message };
    }
  });

  const settled = await Promise.all(tasks);

  const results = {};
  const errors = {};
  for (const r of settled) {
    if (r.ok) results[r.fmt] = r.text;
    else errors[r.fmt] = 'Generation failed. Please retry in a moment.';
  }

  // If EVERY requested format failed, return 502 — caller can react.
  if (Object.keys(results).length === 0) {
    const err = new Error('All content generations failed. Check API quota and try again.');
    err.status = 502;
    err.code = 'LLM_FAILURE';
    err.details = errors;
    return next(err);
  }

  res.json({
    success: true,
    data: {
      results,
      ...(Object.keys(errors).length ? { errors } : {}),
    },
  });
});

module.exports = router;