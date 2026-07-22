/**
 * YouTube helpers — URL parsing + transcript fetch.
 * --------------------------------------------------
 * Supports the two common URL shapes:
 *   - https://www.youtube.com/watch?v=VIDEO_ID
 *   - https://youtu.be/VIDEO_ID
 *   - https://www.youtube.com/shorts/VIDEO_ID
 *   - https://www.youtube.com/embed/VIDEO_ID
 */

const { YoutubeTranscript } = require('youtube-transcript');

const VIDEO_ID_RE = /^[a-zA-Z0-9_-]{11}$/;

function extractVideoId(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return null;

  // Already a bare id?
  if (VIDEO_ID_RE.test(rawUrl)) return rawUrl;

  let url;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, '').toLowerCase();

  // youtu.be/<id>
  if (host === 'youtu.be') {
    const id = url.pathname.slice(1).split('/')[0];
    return VIDEO_ID_RE.test(id) ? id : null;
  }

  // youtube.com / m.youtube.com / music.youtube.com
  if (host.endsWith('youtube.com')) {
    // /watch?v=ID
    const v = url.searchParams.get('v');
    if (v && VIDEO_ID_RE.test(v)) return v;

    // /shorts/ID, /embed/ID, /live/ID, /v/ID
    const m = url.pathname.match(/^\/(?:shorts|embed|live|v)\/([a-zA-Z0-9_-]{11})/);
    if (m) return m[1];
  }

  return null;
}

async function fetchTranscript(videoId) {
  const items = await YoutubeTranscript.fetchTranscript(videoId);
  if (!items || items.length === 0) {
    throw new Error('Empty transcript');
  }
  // Stitch into one block of plain text.
  const text = items.map(i => i.text).join(' ').replace(/\s+/g, ' ').trim();
  return { text, segments: items.length };
}

module.exports = { extractVideoId, fetchTranscript };