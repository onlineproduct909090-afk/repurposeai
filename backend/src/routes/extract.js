const express = require('express');
const Joi = require('joi');

const validate = require('../middleware/validate');
const logger = require('../utils/logger');
const { extractVideoId, fetchTranscript } = require('../utils/youtube');

const router = express.Router();

const schema = Joi.object({
  url: Joi.string().trim().min(8).max(500).required().label('url'),
});

router.post('/', validate(schema), async (req, res, next) => {
  const { url } = req.body;

  const videoId = extractVideoId(url);
  if (!videoId) {
    const err = new Error("We couldn't recognize that as a YouTube URL.");
    err.status = 400;
    err.code = 'INVALID_YOUTUBE_URL';
    return next(err);
  }

  try {
    const { text, segments } = await fetchTranscript(videoId);
    logger.info('Transcript fetched', { videoId, chars: text.length, segments });
    return res.json({
      success: true,
      data: { videoId, transcript: text, segments, characters: text.length },
    });
  } catch (e) {
    logger.warn('Transcript fetch failed', { videoId, message: e.message });
    const err = new Error("We couldn't fetch a transcript for that video.");
    err.status = 422;
    err.code = 'TRANSCRIPT_UNAVAILABLE';
    return next(err);
  }
});

module.exports = router;