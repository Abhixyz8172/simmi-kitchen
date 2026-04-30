module.exports = async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY missing in Vercel.' });
  }

  const prompt = req.body?.prompt;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt missing.' });
  }

  const models = [
    'gemini-2.5-flash-lite',
    'gemini-2.5-flash'
  ];

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const geminiRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            response_mime_type: 'application/json'
          }
        })
      });

      const payload = await geminiRes.json();

      if (!geminiRes.ok) {
        const message = payload.error?.message || 'Gemini error';

        if (
          message.toLowerCase().includes('high demand') ||
          message.toLowerCase().includes('overloaded') ||
          message.toLowerCase().includes('quota')
        ) {
          continue;
        }

        return res.status(500).json({ error: message });
      }

      const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
      return res.status(200).json(JSON.parse(text));
    } catch (error) {
      continue;
    }
  }

  return res.status(503).json({
    error: 'Gemini abhi busy hai. 1-2 minute baad dobara try karo.'
  });
};
