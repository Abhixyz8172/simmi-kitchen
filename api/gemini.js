module.exports = async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY missing in Vercel.' });
  }

  const prompt = req.body?.prompt;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;




  const geminiRes = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { response_mime_type: 'application/json' }
    })
  });

  const payload = await geminiRes.json();

  if (!geminiRes.ok) {
    return res.status(500).json({ error: payload.error?.message || 'Gemini error' });
  }

  const text = payload.candidates[0].content.parts[0].text;
  return res.status(200).json(JSON.parse(text));
};
