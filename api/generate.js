// api/generate.js (Vercel Serverless Function)

export default async function handler(req, res) {
  // 1. Allow only POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { transcript, tone, formats } = req.body;

  if (!transcript) {
    return res.status(400).json({ error: 'Transcript is required' });
  }

  // 2. Get Groq API Key from Environment Variables
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: 'GROQ_API_KEY not configured on Vercel' });
  }

  // 3. Tone Instructions
  let toneInstruction = '';
  if (tone === 'professional') toneInstruction = 'Write in a formal, professional, and business tone. Avoid emojis. Use proper grammar.';
  else if (tone === 'viral') toneInstruction = 'Write in an engaging, viral, and attention-grabbing tone. Use emojis, hooks, and short sentences.';
  else toneInstruction = 'Write in a casual, friendly, and conversational tone.';

  // 4. Helper function to call Groq AI
  const fetchGroq = async (systemPrompt, userPrompt) => {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: `You are a professional content strategist. ${toneInstruction}. ${systemPrompt}` },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.choices[0].message.content;
  };

  const results = {};
  const promises = [];

  // 5. Trigger AI requests in parallel based on selected formats
  if (formats.blog) {
    promises.push(
      fetchGroq(
        'Write a long-form SEO blog post with markdown headings.',
        `Write a blog post based on this text:\n\n${transcript}`
      ).then(res => results.blog = res)
    );
  }
  if (formats.twitter) {
    promises.push(
      fetchGroq(
        'Write a viral Twitter thread (5-8 tweets) with a hook and emojis.',
        `Write a Twitter thread based on this text:\n\n${transcript}`
      ).then(res => results.twitter = res)
    );
  }
  if (formats.linkedin) {
    promises.push(
      fetchGroq(
        'Write a thought-leadership LinkedIn post with a professional tone.',
        `Write a LinkedIn post based on this text:\n\n${transcript}`
      ).then(res => results.linkedin = res)
    );
  }

  // 6. Wait for all AI calls to finish
  await Promise.all(promises);

  // 7. Return the results
  return res.status(200).json({ results });
}